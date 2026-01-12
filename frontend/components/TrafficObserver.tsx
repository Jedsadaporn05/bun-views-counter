"use client";

import { useEffect } from "react";

export default function TrafficObserver() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawSearch = window.location.search;
    const urlParams = new URLSearchParams(rawSearch);
    const utmSource = urlParams.get("utm_source");
    const referrer = document.referrer;

    const existingSource = sessionStorage.getItem("blog_traffic_source");

    let finalSource = "";

    if (utmSource) {
      finalSource = utmSource;
      console.log("Found UTM Source:", utmSource);
    } else if (!existingSource && referrer) {
      try {
        const refUrl = new URL(referrer);
        if (refUrl.hostname !== window.location.hostname) {
          finalSource = referrer;
          console.log("Found Referrer:", referrer);
        }
      } catch (err) {
        finalSource = "Direct Entry";
      }
    }

    if (finalSource) {
      sessionStorage.setItem("blog_traffic_source", finalSource);
    } else if (!existingSource) {
      sessionStorage.setItem("blog_traffic_source", "Direct Entry");
    }
  }, []);

  return null;
}
