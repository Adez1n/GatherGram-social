"use client";

import Link from "next/link";
import AccountMenu from "@/components/navbar/AccountMenu";
import SearchBar from "@/components/navbar/SearchBar";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050607]/72 shadow-2xl shadow-black/25 backdrop-blur-2xl">
      <nav className="mx-auto flex min-h-[76px] w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          aria-label="GatherGram inicio"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-lg font-black text-cyan-200 shadow-[0_0_34px_rgba(103,232,249,0.18)] transition-transform duration-300 group-hover:scale-105 group-hover:border-cyan-300/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.ico" alt="" className="h-7 w-7 rounded-md object-cover" />
          </span>
          <span className="leading-none">
            <span className="block text-xl font-black text-white sm:text-2xl">
              GatherGram
            </span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B7280] sm:block">
              Innovating
            </span>
          </span>
        </Link>

        <div className="order-3 w-full lg:order-none lg:ml-6 lg:max-w-xl lg:flex-1">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <AccountMenu />
        </div>
      </nav>
    </header>
  );
}
