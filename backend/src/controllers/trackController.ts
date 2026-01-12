import { redis } from "../config/database";
import { UAParser } from "ua-parser-js";
import { type TrackBody } from "../types/TrackBody";
import { ENV } from "../config/env";

const MY_DOMAIN = ENV.MY_DOMAIN;

const parseTrafficSource = (source: string): string => {
  if (!source || source === "Direct" || source === "unknown") {
    return "Direct Entry";
  }

  const lowerSource = source.toLowerCase().trim();
  let valueToCheck = lowerSource;

  if (lowerSource.startsWith("http")) {
    try {
      const url = new URL(lowerSource);
      if (url.hostname.includes(MY_DOMAIN) || url.hostname === "localhost") {
        return "Internal";
      }

      valueToCheck = url.hostname.replace(/^www\./, "");
    } catch (err) {}
  }

  // Social Media
  if (valueToCheck.includes("facebook") || valueToCheck === "fb.me")
    return "Facebook";
  if (valueToCheck.includes("instagram")) return "Instagram";
  if (
    valueToCheck.includes("twitter") ||
    valueToCheck.includes("t.co") ||
    valueToCheck.includes("x.com")
  )
    return "X (Twitter)";
  if (valueToCheck.includes("linkedin")) return "LinkedIn";
  if (valueToCheck.includes("youtube") || valueToCheck.includes("youtu.be"))
    return "YouTube";
  if (valueToCheck.includes("tiktok")) return "TikTok";
  if (valueToCheck.includes("line.me") || valueToCheck.includes("naver.jp"))
    return "Line";
  if (valueToCheck.includes("discord")) return "Discord";
  if (valueToCheck.includes("reddit")) return "Reddit";
  if (valueToCheck.includes("pinterest")) return "Pinterest";

  // Search Engine
  if (valueToCheck.includes("google")) return "Google Search";
  if (valueToCheck.includes("bing")) return "Bing Search";
  if (valueToCheck.includes("yahoo")) return "Yahoo Search";
  if (valueToCheck.includes("duckduckgo")) return "DuckDuckGo";
  if (valueToCheck.includes("baidu")) return "Baidu";

  return source.charAt(0).toUpperCase() + source.slice(1);
};

export const handleTrack = async (req: Request) => {
  try {
    const body = (await req.json().catch(() => ({}))) as TrackBody;
    const { slug, resolution, trafficSource, visitorId } = body;

    if (!slug) return new Response("Slug required", { status: 400 });

    // Parser
    const userAgent = req.headers.get("user-agent") || "unknown";

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const deviceName = result.device.type
      ? `${result.device.vendor || ""} ${result.device.model || ""}`.trim()
      : "Desktop";

    const rawSource = trafficSource || req.headers.get("referer") || "Direct";
    const cleanSource = parseTrafficSource(rawSource);

    // Logic Redis Dedup
    let sessionId = visitorId;

    if (!sessionId) {
      sessionId = Bun.hash(userAgent).toString();
    }

    const today = new Date().toISOString().split("T")[0];

    // Visitor Deduplication (1 Day)
    const visitorKey = `blog:visitor:${today}:${sessionId}`;
    // PageView Deduplication (1 Day)
    const pageKey = `blog:view:${today}:${slug}:${sessionId}`;

    const [isNewVisitor, isNewPageView] = await Promise.all([
      redis.set(visitorKey, "1", "EX", 86400, "NX"),
      redis.set(pageKey, "1", "EX", 86400, "NX"),
    ]);

    if (!isNewPageView) {
      return new Response(
        JSON.stringify({ status: "success", message: "already_tracked_today" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const nextId = await redis.incr("blog:global_id");
    const visitorData = {
      id: nextId,
      visitorId: sessionId,
      slug,
      createAt: new Date().toISOString(),
      os: `${result.os.name || ""} ${result.os.version || ""}`.trim(),
      device: deviceName,
      resolution: resolution || "unknown",
      browser: `${result.browser.name || ""} ${
        result.browser.version || ""
      }`.trim(),
      trafficSource: cleanSource,
      userAgent,
      isNewVisitor: !!isNewVisitor,
    };

    // Push to Redis queue
    await redis.rpush(`blog:queue:views`, JSON.stringify(visitorData));
    console.log(`Queued: ${slug} | New Visitor: ${!!isNewVisitor}`);

    return new Response(
      JSON.stringify({ status: "success", message: "tracked" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response("Error", { status: 500 });
  }
};
