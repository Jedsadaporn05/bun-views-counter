"use client";

import { useBlogStats } from "@/hooks/useBlogStats";
import Link from "next/link";
import { use } from "react";

export default function BlogBySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // Fetch stats and track view on mount
  const { views } = useBlogStats(slug, true);

  return (
    <div className="max-w-3xl mx-auto w-full min-h-screen bg-white p-8 font-sans">
      <Link
        href="/blog"
        className="text-sm text-gray-500 hover:text-blue-600 mb-6 inline-block transition-colors"
      >
        ← กลับหน้ารวมบทความ
      </Link>
      <div className="border border-gray-300 rounded-xl p-6">
        {/* Header */}
        <header className="mb-8 pb-8 border-b border-gray-100">
          <h1 className="text-2xl font-medium text-gray-900 mb-6 leading-tight capitalize">
            {slug}
          </h1>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <p className="text-base font-bold text-gray-800">User</p>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
              <p className="text-xs text-gray-400 font-bold">Views</p>
              <p className="font-bold text-blue-600 leading-none">
                {views !== null ? views.toLocaleString() : "..."}
              </p>
            </div>
          </div>
        </header>
        {/* Content */}
        <article className="prose prose-lg text-gray-600 leading-relaxed">
          <p className="text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </article>
      </div>
    </div>
  );
}
