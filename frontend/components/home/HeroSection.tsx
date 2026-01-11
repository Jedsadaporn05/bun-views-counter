import { ArrowRight, Clock, Eye, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="w-full h-full relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-125 bg-linear-to-b from-slate-50 to-transparent -z-10 rounded-full blur-3xl opacity-60"></div>

      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-slate-900 leading-[1.1]">
          Understand your audience <br className="hidden md:block" /> with
          precision.
        </h1>

        <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          Beautiful analytics for your blog without the privacy invasion. Track
          views, reading time, and engagement in real-time.
        </p>
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center font-sans pt-8">
        <Link
          href="/blog"
          className="border border-gray-300 px-4 py-2 rounded-full inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          Go to Blog
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-20 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden ring-1 ring-slate-900/5">
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-red-500 transition-colors" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-yellow-400 transition-colors" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-green-500 transition-colors" />
            </div>
            <div className="ml-4 flex-1 text-center">
              <span className="text-xs text-slate-400 font-mono">
                dashboard.viewly.com
              </span>
            </div>
          </div>
          <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center h-60 col-span-3">
              <p className="text-center text-slate-500">coming soon...</p>
            </div>
            {/* <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">
                  Total Views
                </span>
                <Eye
                  className="text-slate-400"
                  width="18"
                  strokeWidth="1.5"
                ></Eye>
              </div>
              <div>
                <span className="text-3xl font-semibold tracking-tight">
                  124,592
                </span>
                <div className="flex items-center gap-1 mt-1 text-xs font-medium text-emerald-600">
                  <TrendingUp width="12" strokeWidth="1.5"></TrendingUp>
                  <span>+12% this month</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">
                  Avg. Read Time
                </span>
                <Clock
                  className="text-slate-400"
                  width="18"
                  strokeWidth="1.5"
                ></Clock>
              </div>
              <div>
                <span className="text-3xl font-semibold tracking-tight">
                  4m 12s
                </span>
                <div className="flex items-center gap-1 mt-1 text-xs font-medium text-slate-400">
                  <span>Based on last 30 posts</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">
                  Live Visitors
                </span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <span className="text-3xl font-semibold tracking-tight">
                  84
                </span>
                <div className="flex items-center gap-1 mt-1 text-xs font-medium text-slate-400">
                  <span>Right now</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 bg-white p-6 rounded-lg border border-slate-100 shadow-sm mt-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-slate-900">
                  Traffic Overview
                </h3>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">
                    Daily
                  </span>
                  <span className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
                    Weekly
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between h-32 gap-2">
                <div className="w-full bg-slate-50 rounded-t-sm hover:bg-indigo-50 transition-colors relative group h-[40%]"></div>
                <div className="w-full bg-slate-50 rounded-t-sm hover:bg-indigo-50 transition-colors relative group h-[60%]"></div>
                <div className="w-full bg-slate-50 rounded-t-sm hover:bg-indigo-50 transition-colors relative group h-[45%]"></div>
                <div className="w-full bg-slate-50 rounded-t-sm hover:bg-indigo-50 transition-colors relative group h-[70%]"></div>
                <div className="w-full bg-slate-50 rounded-t-sm hover:bg-indigo-50 transition-colors relative group h-[55%]"></div>
                <div className="w-full bg-slate-50 rounded-t-sm hover:bg-indigo-50 transition-colors relative group h-[80%]"></div>
                <div className="w-full bg-slate-50 rounded-t-sm hover:bg-indigo-50 transition-colors relative group h-[65%]"></div>
                <div className="w-full bg-indigo-500 rounded-t-sm relative group h-[90%] shadow-lg shadow-indigo-200">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    2,403 Views
                  </div>
                </div>
                <div className="w-full bg-slate-50 rounded-t-sm hover:bg-indigo-50 transition-colors relative group h-[75%]"></div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
