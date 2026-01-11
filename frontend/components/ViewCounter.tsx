"use client";

import { useBlogStats } from "@/hooks/useBlogStats";

export default function ViewCounter({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const { views } = useBlogStats(slug, false);

  if (views === null)
    return (
      <span className={`text-gray-400 animate-pulse ${className}`}>...</span>
    );

  return <span className={className}>{views.toLocaleString()} views</span>;
}
