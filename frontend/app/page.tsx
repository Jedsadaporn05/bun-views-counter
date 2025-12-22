"use client";

import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Waiting...");

  const sendView = async () => {
    setStatus("Sending...");
    try {
      const res = await fetch("http://localhost:4000/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: "my-first-blog" }),
      });
      const data = await res.json();
      setStatus(`Result: ${data.status}`);
    } catch (error) {
      console.error(error);
      setStatus("Error calling API");
    }
  };

  return (
    <main className="w-full min-h-screen">
      <div className="flex flex-col justify-center items-center py-12">
        <h1 className="text-2xl font-bold mb-4">Bun Analytics Test</h1>
        <button
          onClick={sendView}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          จำลองคนเข้าเว็บ (+1 View)
        </button>
        <p className="mt-4 text-lg">Status: {status}</p>
      </div>
    </main>
  );
}
