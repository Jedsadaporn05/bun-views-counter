"use client";

import { useEffect, useState, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const getVisitorId = () => {
  if (typeof window === "undefined") return "";
  let vid = localStorage.getItem("blog_visitor_id");
  if (!vid) {
    vid = crypto.randomUUID();
    localStorage.setItem("blog_visitor_id", vid);
  }
  return vid;
};

const resolveTrafficSource = () => {
  if (typeof window === "undefined") return "Direct";

  const SESSION_KEY = "blog_traffic_source";
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");

  if (utmSource) {
    sessionStorage.setItem(SESSION_KEY, utmSource);
    return utmSource;
  }

  const referrer = document.referrer;
  if (referrer && !referrer.includes(window.location.hostname)) {
    sessionStorage.setItem(SESSION_KEY, referrer);
    return referrer;
  }

  const storedSource = sessionStorage.getItem(SESSION_KEY);
  if (storedSource) return storedSource;

  return "Direct";
};

const checkClientSideDedup = (slug: string) => {
  if (typeof window === "undefined") return false;
  try {
    const today = new Date().toISOString().split("T")[0];
    const storageKey = `blog_viewed_${today}`;

    const viewedRaw = localStorage.getItem(storageKey);
    const viewedList: string[] = viewedRaw ? JSON.parse(viewedRaw) : [];

    if (viewedList.includes(slug)) return true;

    viewedList.push(slug);
    localStorage.setItem(storageKey, JSON.stringify(viewedList));
    return false;
  } catch (err) {
    return false;
  }
};

export function useBlogStats(slug: string, trackOnMount: boolean = false) {
  const [views, setViews] = useState<number | null>(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/stats?slug=${slug}`);
        const data = await res.json();
        setViews(data.views);
      } catch (error) {
        console.error("Stats error:", error);
      }
    };

    const trackView = async () => {
      const isViewedToday = checkClientSideDedup(slug);
      const trafficSource = resolveTrafficSource();
      const visitorId = getVisitorId();

      const params = new URLSearchParams(window.location.search);
      const hasUtmSource = !!params.get("utm_source");

      if (isViewedToday && !hasUtmSource) {
        console.log(`Skipped tracking already viewed ${slug} today`);
        return;
      }

      try {
        const resolution = `${window.screen.width}x${window.screen.height}`;

        await fetch(`${API_URL}/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            resolution,
            trafficSource,
            visitorId,
          }),
        });

        // Update stats after tracking
        fetchStats();
      } catch (error) {
        console.error("Track error:", error);
      }
    };

    fetchStats();

    if (trackOnMount && !hasTracked.current) {
      hasTracked.current = true;
      trackView();
    }

    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [slug, trackOnMount]);

  return { views };
}
