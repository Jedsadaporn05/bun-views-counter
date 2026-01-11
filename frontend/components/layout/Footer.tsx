import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div>
            <Link
              href="/"
              className="text-sm font-semibold tracking-tighter uppercase flex items-center gap-2 mb-4"
            >
              <div className="w-5 h-5 bg-slate-900 rounded-md flex items-center justify-center text-white">
                <span className="text-xs font-bold">V</span>
              </div>
              Viewly
            </Link>
            {/* <p className="text-sm text-slate-500 max-w-xs">
              Designing the future of content analytics. <br />
              Minimal, privacy-focused, and fast.
            </p> */}
          </div>
          <div className="flex gap-12">
            <div>
              <h4 className="font-medium text-sm text-slate-900 mb-4">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <p className="hover:text-slate-900">Features</p>
                </li>
                <li>
                  <p className="hover:text-slate-900">Integrations</p>
                </li>
                <li>
                  <p className="hover:text-slate-900">Pricing</p>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-slate-900 mb-4">
                Resources
              </h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <Link href="/blog" className="hover:text-slate-900">
                    Blog
                  </Link>
                </li>
                <li>
                  <p className="hover:text-slate-900">Documentation</p>
                </li>
                <li>
                  <p className="hover:text-slate-900">Help Center</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs text-slate-400">
            © 2026 Viewly All Rights Reserved.
          </span>
          <div className="flex gap-4">
            <Twitter
              className="text-slate-400 hover:text-slate-900 cursor-pointer"
              width="16"
            />
            <Github
              className="text-slate-400 hover:text-slate-900 cursor-pointer"
              width="16"
            />
            <Linkedin
              className="text-slate-400 hover:text-slate-900 cursor-pointer"
              width="16"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
