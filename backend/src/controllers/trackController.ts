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

  // Check if source is exactly one of the custom sources
  const customSources = ["newsletter", "email", "sms", "qrcode", "internal"];
  if (customSources.includes(lowerSource)) {
    return lowerSource.charAt(0).toUpperCase() + lowerSource.slice(1);
  }

  try {
    const urlStr = lowerSource.startsWith("http")
      ? lowerSource
      : `https://${lowerSource}`;
    const url = new URL(urlStr);
    let hostname = url.hostname.replace(/^www\./, "");

    if (hostname === MY_DOMAIN || hostname === "localhost") {
      return "Internal";
    }

    // Social Media
    if (hostname.includes("facebook") || hostname === "fb.me")
      return "Facebook";
    if (hostname.includes("instagram")) return "Instagram";
    if (
      hostname.includes("twitter") ||
      hostname === "t.co" ||
      hostname === "x.com"
    )
      return "X (Twitter)";
    if (hostname.includes("linkedin")) return "LinkedIn";
    if (hostname.includes("youtube") || hostname === "youtu.be")
      return "YouTube";
    if (hostname.includes("tiktok")) return "TikTok";
    if (hostname.includes("line.me") || hostname.includes("naver.jp"))
      return "Line";
    if (hostname.includes("discord")) return "Discord";
    if (hostname.includes("reddit")) return "Reddit";
    if (hostname.includes("pinterest")) return "Pinterest";

    // Search Engine
    if (hostname.includes("google")) return "Google Search";
    if (hostname.includes("bing")) return "Bing Search";
    if (hostname.includes("yahoo")) return "Yahoo Search";
    if (hostname.includes("duckduckgo")) return "DuckDuckGo";
    if (hostname.includes("baidu")) return "Baidu";

    return hostname;
  } catch (err) {
    return "Direct Entry";
  }
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
