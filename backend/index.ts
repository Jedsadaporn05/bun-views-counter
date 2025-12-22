import { serve } from "bun";
import Redis from "ioredis";
import mongoose, { Schema } from "mongoose";

// Connect Redis
const REDIS_URL = "redis://localhost:6379";
const redis = new Redis(REDIS_URL);

// Connect Database
const MONGO_URI = "mongodb://127.0.0.1:27017/blog_views";
try {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB :D");
} catch (error) {
  console.error("MongoDB Connection Error:", error);
}

// Schema for push data to MongoDB
const ViewLogSchema = new Schema({
  ip: String,
  slug: String,
  createAt: { type: Date, default: Date.now },
  userAgent: String,
  dedupKey: String,
});
const ViewLog = mongoose.model("ViewLog", ViewLogSchema);

// Schema for total views
const PageViewSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});
const PageView = mongoose.model("PageView", PageViewSchema);

// Cron Job flush data from Redis Queue to MongoDB every 1 minute
setInterval(async () => {
  // Check Queue(Buffer)
  const queueLength = await redis.llen("blog:queue:views");

  if (queueLength > 0) {
    console.log(
      `ได้เวลา Flush ข้อมูลลง MongoDB แล้วมีข้อมูล ${queueLength} รายการ`
    );

    // Fetch data from Redis (lrange)
    const rawData = await redis.lrange("blog:queue:views", 0, -1);

    if (rawData.length > 0) {
      // stringify to JSON
      const logsToInsert = rawData.map((item) => JSON.parse(item));

      // Insert to MongoDB
      await ViewLog.insertMany(logsToInsert);

      //   Update View Counts in Redis (for active slugs)
      const counts: Record<string, number> = {};
      logsToInsert.forEach((log: any) => {
        counts[log.slug] = (counts[log.slug] || 0) + 1;
      });

      //   Update total views in MongoDB (Upsert)
      for (const [slug, count] of Object.entries(counts)) {
        await PageView.findOneAndUpdate(
          { slug },
          { $inc: { count: count } },
          { upsert: true, new: true }
        );
        console.log(`   -> Updated ${slug}: +${count}`);
      }

      // Delete Redis Queue
      await redis.del("blog:queue:views");

      console.log(
        `บันทึก ${logsToInsert.length} รายการลง MongoDB เรียบร้อยแล้ว`
      );
    }
  }
}, 60 * 1000); // 60 seconds

// Port for Bun Server
const PORT = 4000;
console.log(`!! Bun Server running on http://localhost:${PORT}`);

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle Preflight Request (CORS)
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Route
    if (req.method === "POST" && url.pathname === "/track") {
      try {
        const body = (await req.json()) as { slug: string };
        const { slug } = body;

        const userAgent = req.headers.get("user-agent") || "unknown";

        let ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
        if (ip.includes(",")) {
          ip = ip.split(",")[0]?.trim() || ip;
        }

        const fingerprint = `${ip}-${userAgent}-${slug}`;
        const dedupKey = `blog:dedup:${Bun.hash(fingerprint)}`;

        const isNewVisitor = await redis.set(
          dedupKey,
          "1",
          "EX",
          7 * 24 * 60 * 60,
          "NX"
        );

        if (!isNewVisitor) {
          console.log(`ผู้เยี่ยมชมซ้ำ (ไม่เพิ่มใน Queue) สำหรับหน้า "${slug}"`);

          return new Response(JSON.stringify({ status: "Duplicate view" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const nextId = await redis.incr("blog:global_id");

        const visitorData = {
          id: nextId,
          ip: ip,
          slug: slug,
          createAt: new Date().toISOString(),
          userAgent: userAgent,
          dedupKey: dedupKey,
        };

        // Redis List add to Queue
        await redis.rpush(`blog:queue:views`, JSON.stringify(visitorData));
        // Redis Set Mark this slug as Active
        await redis.sadd("blog:active_slugs", slug);

        console.log(`id: ${nextId} เข้าสู่ Queue ของหน้า ${slug}`);

        // Response data
        return new Response(
          JSON.stringify({ status: "success", data: visitorData }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (err) {
        return new Response("Bad Request", {
          status: 400,
          headers: corsHeaders,
        });
      }
    }

    // API GET/stats
    if (req.method === "GET" && url.pathname === "/stats") {
      const slug = url.searchParams.get("slug");
      if (!slug)
        return new Response("Slug required", {
          status: 400,
          headers: corsHeaders,
        });

      // MongoDB PageView
      const page = await PageView.findOne({ slug });

      return new Response(JSON.stringify({ views: page?.count || 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
});
