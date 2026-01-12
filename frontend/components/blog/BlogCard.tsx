import Image from "next/image";
import { Eye } from "lucide-react";
import ViewCounter from "../ViewCounter";
import Link from "next/link";
import { BlogsData } from "@/data/blogs";

export default function BlogCard() {
  const blogs = BlogsData;

  return (
    <section className="py-24 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="py-6">
          <h2 className="text-2xl font-semibold uppercase tracking-[0.25em] text-slate-400 mb-4">
            Blog
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link
              href={`/blog/${blog.slug}`}
              key={blog.slug}
              className="group cursor-pointer flex flex-col h-full bg-white rounded-lg border border-slate-100 overflow-hidden hover:border-slate-200 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[16/10] overflow-hidden bg-slate-50 relative">
                <Image
                  src={blog.src}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  width={500}
                  height={500}
                />
              </div>

              {/* Content */}
              <div className="p-7 flex-1 flex flex-col">
                <div className="flex flex-row items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span>{blog.date}</span>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <ViewCounter slug={blog.slug} className="text-xs" track={false} />
                    </div>
                  </div>
                </div>
                <h3 className="line-clamp-2 h-12 text-base font-medium text-slate-900 mb-3 leading-snug group-hover:text-slate-700 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed flex-1">
                  {blog.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
