import { serve } from "bun";
import Redis from "ioredis";
import mongoose, { Schema } from "mongoose";

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

// ViewLog Model
const ViewLogSchema = new Schema({
  ip: String,
  slug: { type: String, index: true },
  createAt: { type: Date, default: Date.now },
  userAgent: String,
  dedupKey: String,
});
ViewLogSchema.index({ createAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // Expire after 90 days
const ViewLog = mongoose.model("ViewLog", ViewLogSchema);

// PageView Model
const PageViewSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});
const PageView = mongoose.model("PageView", PageViewSchema);

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
      const logsToInsert = rawData.map((item) => JSON.parse(item));

      await ViewLog.insertMany(logsToInsert);

      const counts: Record<string, number> = {};
      logsToInsert.forEach((log: any) => {
        counts[log.slug] = (counts[log.slug] || 0) + 1;
      });

      for (const [slug, count] of Object.entries(counts)) {
        await PageView.findOneAndUpdate(
          { slug },
          { $inc: { count: count } },
          { upsert: true, new: true }
        );
      }

      console.log(`Saved ${logsToInsert.length} data to MongoDB`);
    }

    await redis.del(processingKey);
  } catch (error) {
    console.error("Flush Error:", error);
  }
};

// Scheduler
const scheduleNextFlush = () => {
  const now = new Date();
  const msUntilNextMinute =
    (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  // console.log(`Next flush in ${msUntilNextMinute} ms`);

  setTimeout(() => {
    flushDataToMongo();

    scheduleNextFlush();
  }, msUntilNextMinute);
};

// Start Scheduler
scheduleNextFlush();

console.log(`Bun Server running on http://localhost:${PORT}`);

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS")
      return new Response(null, { headers: corsHeaders });

    // POST /track
    if (req.method === "POST" && url.pathname === "/track") {
      try {
        const body = (await req.json()) as { slug: string };
        const { slug } = body;

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

        const fingerprint = `${ip}-${userAgent}-${slug}`;
        const dedupKey = `blog:dedup:${slug}:${Bun.hash(fingerprint)}`;

        const isNewVisitor = await redis.set(
          dedupKey,
          "1",
          "EX",
          7 * 24 * 60 * 60, // 7 days
          "NX"
        );

        if (!isNewVisitor) {
          console.log(`Duplicate: ${slug}`);
          return new Response(JSON.stringify({ status: "Duplicate view" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const nextId = await redis.incr("blog:global_id");
        const visitorData = {
          id: nextId,
          ip,
          slug,
          createAt: new Date().toISOString(),
          userAgent,
        };

        await redis.rpush(`blog:queue:views`, JSON.stringify(visitorData));

        console.log(`Queued (id ${nextId}) : ${slug}`);

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
