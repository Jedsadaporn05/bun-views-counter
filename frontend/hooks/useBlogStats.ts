"use client";

import { useEffect, useState, useRef } from "react";

const API_URL = process.env.API_URL || "http://localhost:4000";

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
      try {
        await fetch(`${API_URL}/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
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

      // Call API
      trackView();
    }

    // Set up interval to refresh stats every 1 minute
    const interval = setInterval(fetchStats, 60000);

    // Clear interval on unmount
    return () => clearInterval(interval);
    
  }, [slug, trackOnMount]); // Add slug as dependency. When slug changes, update again

  return { views };
}
