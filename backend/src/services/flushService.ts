import { redis } from "../config/database";
import { UserView } from "../models/UserView";
import { PageView } from "../models/PageView";

const QUEUE_KEY = "blog:queue:views";
const PROCESSING_KEY = "blog:queue:processing";

export const flushDataToMongo = async () => {
  try {
    let hasProcessingData = await redis.exists(PROCESSING_KEY);

    if (!hasProcessingData) {
      const queueLength = await redis.llen(QUEUE_KEY);
      if (queueLength === 0) return;

      const renamed = await redis.renamenx(QUEUE_KEY, PROCESSING_KEY);
      if (!renamed) return;
    }

    const rawData = await redis.lrange(PROCESSING_KEY, 0, -1);
    if (rawData.length === 0) {
      await redis.del(PROCESSING_KEY);
      return;
    }

    console.log(`Flushing ${rawData.length} items to MongoDB`);

    const logs = rawData.map((item) => JSON.parse(item));

    const userViewsToInsert = logs.map((log) => ({
      createAt: new Date(log.createAt),
      visitorId: log.visitorId,
      slug: log.slug,
      os: log.os,
      device: log.device,
      resolution: log.resolution,
      browser: log.browser,
      trafficSource: log.trafficSource,
      userAgent: log.userAgent,
      isNewVisitor: log.isNewVisitor,
    }));

    const counts: Record<string, number> = {};
    logs.forEach((log: any) => {
      counts[log.slug] = (counts[log.slug] || 0) + 1;
    });

    await UserView.insertMany(userViewsToInsert);

    if (Object.keys(counts).length > 0) {
      const bulkOps = Object.entries(counts).map(([slug, count]) => ({
        updateOne: {
          filter: { slug },
          update: {
            $inc: { count: count },
            $set: { updatedAt: new Date() },
          },
          upsert: true,
        },
      }));
      await PageView.bulkWrite(bulkOps);
    }

    await redis.del(PROCESSING_KEY);
    console.log(`[/] Successfully flushed ${logs.length} logs`);
  } catch (error) {
    console.error("Flush Error:", error);
  }
};
