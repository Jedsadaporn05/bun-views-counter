"use client";

import { useBlogStats } from "@/hooks/useBlogStats";

interface ViewCounterProps {
  slug: string;
  track?: boolean;
  className?: string;
}

export default function ViewCounter({
  slug,
  track = true,
  className = "",
}: ViewCounterProps) {
  const { views } = useBlogStats(slug, track);

  if (views === null)
    return (
      <span className={`text-gray-400 animate-pulse ${className}`}>...</span>
    );

  return <span className={className}>{views.toLocaleString()} views</span>;
}
