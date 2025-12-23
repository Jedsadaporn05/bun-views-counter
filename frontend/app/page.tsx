import Link from "next/link";

export default function Home() {
  return (
    <main className="w-full h-screen flex flex-col gap-4 font-sans">
      <div className="w-full h-full flex justify-center items-center">
        <Link
          href="/blog"
          className="border rounded-full p-4 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition duration-200"
        >
          คลิกเพื่อไปยังหน้า Blog
        </Link>
      </div>
    </main>
  );
}
