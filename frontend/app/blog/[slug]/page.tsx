"use client";

import { useBlogStats } from "@/hooks/useBlogStats";
import Link from "next/link";
import Image from "next/image";
import { use } from "react";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
import { BlogsData } from "@/data/blogs";

export default function BlogBySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const blog = BlogsData.find((b) => b.slug === slug);
  const { views } = useBlogStats(slug, true);

  if (!blog) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center font-sans px-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Post not found
        </h1>
        <p className="text-slate-500 mb-6">
          The blog post you're looking for doesn't exist.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white font-sans">
      <article className="max-w-4xl mx-auto px-6 py-24 md:py-32">
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span
              className={`px-3 py-1 bg-slate-50 text-slate-700 text-[11px] font-semibold uppercase tracking-wider rounded-md border border-slate-200`}
            >
              {blog.category}
            </span>
            <span className="text-slate-300 hidden sm:block">·</span>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>{blog.date}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 mb-8 leading-tight tracking-tight">
            {blog.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center flex-shrink-0">
                <span className="text-base font-semibold text-slate-600">
                  A
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Anonymous Author
                </p>
                <p className="text-xs text-slate-500">Content Creator</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 self-start sm:self-auto">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">
                {views !== null ? views.toLocaleString() : "..."}
              </span>
              <span className="text-xs text-slate-400">views</span>
            </div>
          </div>
        </header>

        <div className="aspect-video mb-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
          <Image
            src={blog.src}
            alt={blog.title}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="prose prose-slate prose-lg max-w-none">
          <p className="text-xl text-slate-600 leading-relaxed mb-10 font-normal">
            {blog.description}
          </p>

          <h2 className="text-2xl font-semibold text-slate-900 mt-12 mb-6">
            Introduction
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            In today's fast-paced digital landscape, understanding how your
            content performs is crucial. This article explores the fundamental
            concepts behind {blog.category.toLowerCase()} and how it can
            transform the way you approach your content strategy.
          </p>

          <blockquote className="border-l-4 border-slate-300 pl-6 my-8 italic text-slate-700 text-lg">
            "Analytics should empower creators, not exploit users. This
            philosophy guides every decision we make when building tools for
            content creators."
          </blockquote>

          <h2 className="text-2xl font-semibold text-slate-900 mt-12 mb-6">
            How it works
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Behind the scenes, our system utilizes high-performance edge
            functions to capture metrics in real-time. This ensures that the{" "}
            <strong className="text-slate-900 font-semibold">
              {views?.toLocaleString() || "live"} views
            </strong>{" "}
            you see at the top are accurate down to the second, without
            compromising on privacy or performance.
          </p>

          <p className="text-slate-600 leading-relaxed mb-6">
            The architecture is designed to scale effortlessly, handling
            everything from small personal blogs to large-scale publications.
            Every request is processed in under 50ms, ensuring your readers
            never experience any lag or delay.
          </p>

          <h2 className="text-2xl font-semibold text-slate-900 mt-12 mb-6">
            Conclusion
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            As we continue to innovate in the {blog.category.toLowerCase()}{" "}
            space, one thing remains clear: the future belongs to tools that
            respect both creators and their audiences. By focusing on what truly
            matters—accurate data, fast performance, and user privacy—we can
            build better experiences for everyone.
          </p>
        </div>

        {/* Tags */}
        <div className="mt-16 pt-8 border-t border-slate-100">
          <div className="flex flex-wrap gap-2 mb-8">
            {["Bun", "Redis", "MongoDB", "Views Counter"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-md text-xs font-medium hover:bg-slate-100 transition-colors border border-slate-200"
              >
                #{tag.toLowerCase().replace(/\s+/g, "-")}
              </span>
            ))}
          </div>

          {/* Back to blog link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Read more articles</span>
          </Link>
        </div>
      </article>
    </div>
  );
}
