"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SuggestedUser = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  followersCount: number;
};

const trends = ["#GatherGram", "#Nextjs", "#SocialArena", "#Chats"];

function getAuthHeaders() {
  const userId = localStorage.getItem("gathergram_user_id");
  const token = localStorage.getItem("gathergram_token");
  return {
    ...(userId ? { "x-user-id": userId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function RightPanel() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const response = await fetch("/api/users/suggestions?limit=4", {
          headers: getAuthHeaders(),
        });
        const data = (await response.json()) as { users?: SuggestedUser[] };

        if (response.ok) {
          setUsers(data.users ?? []);
        }
      } finally {
        setLoading(false);
      }
    }

    void loadSuggestions();
  }, []);

  async function followUser(userId: string) {
    const response = await fetch(`/api/users/${userId}/follow`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      setUsers((current) => current.filter((user) => user.id !== userId));
      window.dispatchEvent(new Event("gathergram:notifications-updated"));
    }
  }

  return (
    <aside className="hidden flex-col gap-5 xl:flex">
      <section className="gg-card gg-card-hover rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">Amigos</h2>
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.85)]" />
        </div>
        <p className="mt-3 text-sm leading-6 text-[#9CA3AF]">
          Abre tus conversaciones privadas o visita perfiles para iniciar chats.
        </p>
        <Link
          href="/messages"
          className="mt-4 inline-flex rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/15"
        >
          Abrir mensajes
        </Link>
      </section>

      <section className="gg-card rounded-3xl p-5">
        <h3 className="text-lg font-black text-white">Quiza conozcas</h3>
        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 rounded-2xl gg-shimmer" />
              ))}
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-cyan-300/25 hover:bg-white/[0.06]"
              >
                <Link href={`/profile/${user.username}`} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar || "/default-avatar.svg"}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border border-cyan-300/20 object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">
                      {user.name}
                    </span>
                    <span className="block truncate text-xs text-zinc-400">
                      @{user.username} - {user.followersCount} seguidores
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => followUser(user.id)}
                  className="mt-3 h-9 w-full rounded-xl bg-cyan-300 text-xs font-black text-[#041012] transition hover:bg-cyan-200"
                >
                  Seguir
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-400">No hay sugerencias por ahora.</p>
          )}
        </div>
      </section>

      <section className="gg-card rounded-3xl p-5">
        <h3 className="text-lg font-black text-white">Tendencias</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {trends.map((trend) => (
            <span
              key={trend}
              className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-200"
            >
              {trend}
            </span>
          ))}
        </div>
      </section>
    </aside>
  );
}
