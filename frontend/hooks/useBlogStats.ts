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

// Client-side Dedup
const checkClientSideDedup = (slug: string) => {
  if (typeof window === "undefined") return false;

  const today = new Date().toISOString().split("T")[0];
  const storageKey = `blog_viewed_${today}`;

  const viewedRaw = localStorage.getItem(storageKey);
  const viewedList: string[] = viewedRaw ? JSON.parse(viewedRaw) : [];

  if (viewedList.includes(slug)) return true;

  viewedList.push(slug);
  localStorage.setItem(storageKey, JSON.stringify(viewedList));
  return false;
};

export function useBlogStats(slug: string, trackOnMount: boolean = false) {
  const [views, setViews] = useState<number | null>(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    // Function to fetch stats
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/stats?slug=${slug}`);
        const data = await res.json();
        setViews(data.views);
      } catch (error) {
        console.error("Stats error:", error);
      }
    };

    // Function to track view
    const trackView = async () => {
      const isViewedToday = checkClientSideDedup(slug);
      if (isViewedToday) {
        console.log(`Skipped tracking already viewed ${slug} today`);
        return;
      }

      try {
        const resolution = `${window.screen.width}x${window.screen.height}`;
        const trafficSource = document.referrer;

        const visitorId = getVisitorId();

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

    // Fetch stats
    fetchStats();

    if (trackOnMount && !hasTracked.current) {
      hasTracked.current = true;
      trackView();
    }

    // Set up interval to refresh stats every 1 minute
    const interval = setInterval(fetchStats, 60000);
    // Clear interval on unmount
    return () => clearInterval(interval);
  }, [slug, trackOnMount]);

  return { views };
}
