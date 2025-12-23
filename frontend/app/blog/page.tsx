import Link from "next/link";
import ViewCounter from "@/components/ViewCounter";

const sampleBlogs = [
  { slug: "blog-1", title: "blog-1" },
  { slug: "blog-2", title: "blog-2" },
  { slug: "blog-3", title: "blog-3" },
  { slug: "blog-4", title: "blog-4" },
  { slug: "blog-5", title: "blog-5" },
];

export default function BlogPage() {
  return (
    <main className="w-full min-h-screen p-10 max-w-5xl mx-auto font-sans">
      <Link
        href="/"
        className="inline-block mb-8 text-sm text-gray-500 hover:text-blue-500 transition"
      >
        ← กลับไปยังหน้าหลัก
      </Link>
      <h1 className="text-3xl font-semibold mb-6">บทความทั้งหมด</h1>

      <div className="w-full h-full min-h-100 grid grid-cols-3 gap-4">
        {sampleBlogs.map((blog) => (
          <Link
            key={blog.slug}
            href={`/blog/${blog.slug}`}
            className="border border-gray-200 rounded-xl hover:border-blue-500 p-4 transition group"
          >
            <div className="w-full h-full flex flex-col justify-between items-center py-3">
              <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 capitalize">
                {blog.title}
              </h2>
              <div className="flex flex-row justify-center items-center gap-3">
                <div className="text-sm text-gray-500">ผู้เข้าชม</div>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <ViewCounter slug={blog.slug} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
