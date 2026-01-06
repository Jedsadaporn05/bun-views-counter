import { serve } from "bun";
import Redis from "ioredis";
import mongoose, { Schema } from "mongoose";
import { UAParser } from "ua-parser-js";

const REDIS_URL = Bun.env.REDIS_URL || "redis://localhost:6379";
const MONGO_URI = Bun.env.MONGO_URI || "mongodb://127.0.0.1:27017/blog_views";
const PORT = Number(Bun.env.PORT) || 4000;
const ALLOWED_ORIGIN = Bun.env.FRONTEND_URL || "http://localhost:3000";

const redis = new Redis(REDIS_URL);
try {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Connect to MongoDB Error:", error);
  process.exit(1);
}

// PageView Model
const PageViewSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});
const PageView = mongoose.model("PageView", PageViewSchema);

// UserView Model
const UserViewSchema = new Schema(
  {
    createAt: { type: Date, required: true },
    metadata: {
      slug: String,
      ip: String,
      os: String,
      device: String,
      resolution: String,
      browser: String,
      trafficSource: String,
      userAgent: String,
      isNewVisitor: Boolean,
    },
  },
  {
    timeseries: {
      timeField: "createAt",
      metaField: "metadata",
      granularity: "minutes",
    },
  }
);
const UserView = mongoose.model("UserView", UserViewSchema);

// Flush Function
const flushDataToMongo = async () => {
  const queueKey = "blog:queue:views";
  const processingKey = "blog:queue:processing";

  // Check Queue Length
  const queueLength = await redis.llen(queueKey);
  if (queueLength === 0) return;

  console.log(
    `[${new Date().toLocaleTimeString()}] Flushing ${queueLength} items to MongoDB`
  );

  // Atomic Rename
  try {
    const renamed = await redis.renamenx(queueKey, processingKey);
    if (!renamed) return;
  } catch (e) {
    return;
  }

  try {
    const rawData = await redis.lrange(processingKey, 0, -1);

    if (rawData.length > 0) {
      const logs = rawData.map((item) => JSON.parse(item));

      const userViewsToInsert = logs.map((log) => ({
        createAt: new Date(log.createAt),
        metadata: {
          slug: log.slug,
          ip: log.ip,
          os: log.os,
          device: log.device,
          resolution: log.resolution,
          browser: log.browser,
          trafficSource: log.trafficSource,
          userAgent: log.userAgent,
          isNewVisitor: log.isNewVisitor,
        },
      }));

      const counts: Record<string, number> = {};
      logs.forEach((log: any) => {
        counts[log.slug] = (counts[log.slug] || 0) + 1;
      });

      // Insert UserViews
      await UserView.insertMany(userViewsToInsert);

      // Update Counter
      for (const [slug, count] of Object.entries(counts)) {
        await PageView.findOneAndUpdate(
          { slug },
          { $inc: { count: count }, $set: { updatedAt: new Date() } },
          { upsert: true, new: true }
        );
      }

      console.log(`Saved ${logs.length} data to MongoDB`);
    }

    await redis.del(processingKey);
  } catch (error) {
    console.error("Flush Error:", error);
  }
};

const FLUSH_INTERVAL_MINUTES = 10;
let flushTimeoutId: Timer | null = null;
// Scheduler
const scheduleNextFlush = () => {
  const now = new Date();
  const minutesToWait =
    FLUSH_INTERVAL_MINUTES - (now.getMinutes() % FLUSH_INTERVAL_MINUTES);
  const msUntilNextFlush =
    minutesToWait * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();

  console.log(
    `Next flush in ${(msUntilNextFlush / 1000 / 60).toFixed(2)} minutes`
  );

  flushTimeoutId = setTimeout(async () => {
    await flushDataToMongo();
    scheduleNextFlush();
  }, msUntilNextFlush);
};

// Start Scheduler
scheduleNextFlush();

console.log(`Bun Server started on port ${PORT}`);

serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, HEAD",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS")
      return new Response(null, { headers: corsHeaders });

    // Handle UptimeRobot (HEAD request)
    if (req.method === "HEAD") {
      return new Response("Server alive", {
        status: 200,
        headers: corsHeaders,
      });
    }

    // POST /track
    if (req.method === "POST" && url.pathname === "/track") {
      try {
        const body = (await req.json()) as {
          slug: string;
          resolution: string;
          trafficSource: string;
          visitorId: string;
        };
        const { slug, resolution, trafficSource, visitorId } = body;

        if (!slug)
          return new Response("Slug required", {
            status: 400,
            headers: corsHeaders,
          });

        const userAgent = req.headers.get("user-agent") || "unknown";
        const forwarded = req.headers.get("x-forwarded-for");
        const ip = forwarded
          ? forwarded.split(",")[0]?.trim() || "127.0.0.1"
          : "127.0.0.1";

        const parser = new UAParser(userAgent);
        const result = parser.getResult();
        const deviceName = result.device.type
          ? `${result.device.vendor || ""} ${result.device.model || ""}`.trim()
          : "Desktop";
        const TrafficSource =
          trafficSource || req.headers.get("referer") || "Direct";

        const identity = `${ip}-${userAgent}-${visitorId}`;
        const today = new Date().toISOString().split("T")[0];

        const pageKey = `blog:view:${today}:${slug}:${Bun.hash(identity)}`;
        const isNewPageView = await redis.set(pageKey, "1", "EX", 86400, "NX");

        if (!isNewPageView) {
          return new Response(JSON.stringify({ status: "Duplicate" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // New Visitor Check
        const visitorKey = `blog:visitor:${today}:${Bun.hash(identity)}`;
        const isNewVisitor = await redis.set(
          visitorKey,
          "1",
          "EX",
          86400,
          "NX"
        );

        const nextId = await redis.incr("blog:global_id");

        const visitorData = {
          id: nextId,
          slug,
          createAt: new Date().toISOString(),
          ip,
          os: `${result.os.name || ""} ${result.os.version || ""}`.trim(),
          device: deviceName,
          resolution: resolution || "unknown",
          browser: `${result.browser.name || ""} ${
            result.browser.version || ""
          }`.trim(),
          trafficSource: TrafficSource,
          userAgent,
          isNewVisitor: !!isNewVisitor,
        };

        await redis.rpush(`blog:queue:views`, JSON.stringify(visitorData));
        console.log(
          `Queued (id ${nextId}) : ${slug} | View: ${!!isNewPageView} | Visitor: ${!!isNewVisitor}`
        );
        return new Response(
          JSON.stringify({ status: "success", data: visitorData }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (err) {
        return new Response("Error", { status: 500, headers: corsHeaders });
      }
    }

    // GET /stats
    if (req.method === "GET" && url.pathname === "/stats") {
      const slug = url.searchParams.get("slug");
      if (!slug)
        return new Response("Slug required", {
          status: 400,
          headers: corsHeaders,
        });

      const page = await PageView.findOne({ slug });
      return new Response(JSON.stringify({ views: page?.count || 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
});
