import { redis } from "../config/database";
import { UAParser } from "ua-parser-js";
import { type TrackBody } from "../types/TrackBody";

const parseTrafficSource = (source: string): string => {
  if (
    !source ||
    source === "Direct" ||
    source === "Direct Entry" ||
    source === "unknown"
  ) {
    return "Direct Entry";
  }

  const src = source.toLowerCase().trim();

  // Social Media
  if (src.includes("facebook") || src.includes("fb.me")) return "Facebook";
  if (src.includes("instagram") || src.includes("l.instagram.com"))
    return "Instagram";
  if (src.includes("t.co") || src.includes("twitter") || src.includes("x.com"))
    return "X / Twitter";
  if (src.includes("line.me") || src.includes("line.naver.jp")) return "Line";
  if (src.includes("discord")) return "Discord";
  if (src.includes("linkedin")) return "LinkedIn";
  if (src.includes("youtube") || src.includes("youtu.be")) return "YouTube";
  if (src.includes("tiktok")) return "TikTok";

  // Search Engine
  if (src.includes("google")) return "Google Search";
  if (src.includes("bing")) return "Bing Search";
  if (src.includes("yahoo")) return "Yahoo Search";

  if (src.startsWith("http")) {
    try {
      const url = new URL(source);
      const domain = url.hostname.replace("www.", "");

      if (domain.length > 0 && domain.length < 50 && domain.includes(".")) {
        return domain;
      }
    } catch (err) {}
  }

  const allowedCustomSources = [
    "newsletter",
    "email",
    "internal",
    "announcement",
    "ads",
  ];
  if (allowedCustomSources.includes(src)) {
    return source.charAt(0).toUpperCase() + source.slice(1);
  }

  if (
    source.includes("(") &&
    (src.includes("facebook") ||
      src.includes("google") ||
      src.includes("email"))
  ) {
    return source;
  }

  return "Direct Entry";
};

export const handleTrack = async (req: Request) => {
  try {
    const body = (await req.json().catch(() => ({}))) as TrackBody;
    const { slug, resolution, trafficSource, visitorId } = body;

    if (!slug) return new Response("Slug required", { status: 400 });

    // Parser
    const userAgent = req.headers.get("user-agent") || "unknown";
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0]?.trim() : "127.0.0.1";

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const deviceName = result.device.type
      ? `${result.device.vendor || ""} ${result.device.model || ""}`.trim()
      : "Desktop";

    const rawSource = trafficSource || req.headers.get("referer") || "Direct";
    const cleanSource = parseTrafficSource(rawSource);

    // Logic Redis Dedup
    const stableId = Bun.hash(`${ip}-${userAgent}`).toString();
    const sessionId = visitorId || stableId;
    // const identity = visitorId || `${ip}-${userAgent}`;
    // const idHash = Bun.hash(identity).toString();

    const today = new Date().toISOString().split("T")[0];

    // Visitor Deduplication (1 Day)
    const visitorKey = `blog:visitor:${today}:${stableId}`;
    // PageView Deduplication (1 Day)
    const pageKey = `blog:view:${today}:${slug}:${stableId}`;

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
      visitorId: stableId,
      slug,
      createAt: new Date().toISOString(),
      ip,
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
