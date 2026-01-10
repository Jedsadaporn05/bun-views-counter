"use client";

import { useBlogStats } from "@/hooks/useBlogStats";

export default function ViewCounter({ slug }: { slug: string }) {
  const { views } = useBlogStats(slug, false);

  if (views === null) return <span className="text-gray-400 animate-pulse transform">...</span>;

  return (
    <span className="font-bold text-blue-500">
      {views.toLocaleString()} views
    </span>
  );
}
