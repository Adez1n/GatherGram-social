"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SearchResponse = {
  users: { id: string; name: string; username: string; avatar: string | null }[];
  posts: {
    id: string;
    content: string;
    createdAt: string;
    author: { name: string; username: string; avatar: string | null };
  }[];
  hashtags: string[];
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse>({
    users: [],
    posts: [],
    hashtags: [],
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      const timer = window.setTimeout(() => {
        setResults({ users: [], posts: [], hashtags: [] });
        setOpen(false);
      }, 0);

      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setOpen(true);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`);
        const data = (await response.json()) as SearchResponse;

        if (response.ok) {
          setResults(data);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  const hasResults =
    results.users.length > 0 || results.posts.length > 0 || results.hashtags.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <label className="group flex h-11 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 shadow-inner shadow-black/20 transition-all duration-300 focus-within:border-cyan-300/60 focus-within:bg-white/[0.06] focus-within:ring-4 focus-within:ring-cyan-300/10">
        <span className="sr-only">Buscar en GatherGram</span>
        <i className="bi bi-search text-[#A3A3A3] group-focus-within:text-cyan-200" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder="Buscar posts, usuarios o hashtags"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#6B7280]"
        />
        <span className="hidden rounded-lg border border-white/10 bg-[#050607] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#6B7280] sm:block">
          Ctrl K
        </span>
      </label>

      {open ? (
        <div className="gg-fade-up absolute inset-x-0 top-13 z-[90] max-h-[420px] overflow-y-auto rounded-2xl border border-white/10 bg-[#0E1113]/95 p-3 shadow-2xl shadow-black/60 backdrop-blur-2xl">
          {loading ? (
            <p className="p-3 text-sm font-bold text-[#A3A3A3]">Buscando...</p>
          ) : hasResults ? (
            <div className="space-y-4">
              {results.users.length > 0 ? (
                <section>
                  <h3 className="px-2 text-xs font-black uppercase text-[#6B7280]">Usuarios</h3>
                  <div className="mt-2 space-y-1">
                    {results.users.map((user) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.username}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.06]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={user.avatar || "/default-avatar.svg"} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-[#F5F5F5]">{user.name}</span>
                          <span className="block truncate text-xs text-[#A3A3A3]">@{user.username}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {results.posts.length > 0 ? (
                <section>
                  <h3 className="px-2 text-xs font-black uppercase text-[#6B7280]">Posts</h3>
                  <div className="mt-2 space-y-1">
                    {results.posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/#post-${post.id}`}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl p-2 transition hover:bg-white/[0.06]"
                      >
                        <p className="truncate text-sm font-bold text-[#F5F5F5]">{post.content}</p>
                        <p className="text-xs text-[#A3A3A3]">@{post.author.username}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {results.hashtags.length > 0 ? (
                <section>
                  <h3 className="px-2 text-xs font-black uppercase text-[#6B7280]">Hashtags</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {results.hashtags.map((tag) => (
                      <span key={tag} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-200">{tag}</span>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <p className="p-3 text-sm font-bold text-[#A3A3A3]">Sin resultados.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
