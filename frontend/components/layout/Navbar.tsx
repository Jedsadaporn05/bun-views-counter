"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 glass-panel backdrop-blur-sm bg-white/60 border-b border-slate-100/20 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tighter uppercase flex items-center gap-2"
          >
            <div className="w-5 h-5 bg-slate-900 rounded-md flex items-center justify-center text-white">
              <span className="text-xs font-bold">V</span>
            </div>
            Viewly
          </Link>
          <div className="hidden md:flex gap-6">
            <p className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Features
            </p>
            <Link
              href="/blog"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Blog
            </Link>
            <p className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Pricing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
            Log in
          </button>
          <button className="text-sm bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full font-medium transition-all shadow-sm">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
