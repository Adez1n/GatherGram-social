"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type CurrentUser = {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
};

function getAuthHeaders() {
  const headers = new Headers();
  const token = localStorage.getItem("gathergram_token");
  const userId = localStorage.getItem("gathergram_user_id");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (userId) {
    headers.set("x-user-id", userId);
  }

  return headers;
}

export default function AccountMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    let ignored = false;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/status", {
          headers: getAuthHeaders(),
          cache: "no-store",
        });
        const data = (await response.json()) as {
          authenticated?: boolean;
          user?: CurrentUser | null;
        };

        if (!ignored && response.ok && data.authenticated) {
          setUser(data.user ?? null);
        }
      } catch {
        if (!ignored) {
          setUser(null);
        }
      }
    }

    void loadCurrentUser();

    function refreshUser() {
      void loadCurrentUser();
    }

    window.addEventListener("gathergram:auth-updated", refreshUser);

    return () => {
      ignored = true;
      window.removeEventListener("gathergram:auth-updated", refreshUser);
    };
  }, []);

  function logout() {
    localStorage.removeItem("gathergram_token");
    localStorage.removeItem("gathergram_user_id");
    localStorage.removeItem("gathergram_username");
    window.dispatchEvent(new Event("gathergram:auth-updated"));
    router.push("/login");
    router.refresh();
  }

  const username =
    user?.username ??
    (typeof window === "undefined" ? "" : localStorage.getItem("gathergram_username"));
  const displayName = user?.name ?? username ?? "Cuenta";
  const avatar = user?.avatar || "/default-avatar.svg";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Abrir menu de cuenta"
        className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 pr-2 text-left shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar}
          alt={`Avatar de ${displayName}`}
          className="h-9 w-9 rounded-full border border-cyan-300/25 object-cover"
        />
        <span className="hidden min-w-0 leading-tight sm:block">
          <span className="block max-w-28 truncate text-sm font-black text-white">
            {displayName}
          </span>
          <span className="block max-w-28 truncate text-xs font-medium text-[#8B949E]">
            @{username || "gathergram"}
          </span>
        </span>
        <i
          className="bi bi-three-dots hidden text-[#A3A3A3] sm:block"
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="gg-fade-up absolute right-0 top-13 z-[90] w-64 rounded-2xl border border-white/10 bg-[#0E1113]/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl">
          <div className="mb-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt={`Avatar de ${displayName}`}
              className="h-10 w-10 rounded-full border border-cyan-300/25 object-cover"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-black text-white">
                {displayName}
              </span>
              <span className="block text-xs text-[#6B7280]">
                @{username || "gathergram"}
              </span>
            </span>
          </div>
          <Link href={username ? `/profile/${username}` : "/profile"} className="block rounded-xl px-3 py-2 text-sm font-bold text-[#F5F5F5] transition hover:bg-white/[0.06]">Ver perfil</Link>
          <Link href="/settings/profile" className="block rounded-xl px-3 py-2 text-sm font-bold text-[#F5F5F5] transition hover:bg-white/[0.06]">Editar perfil</Link>
          <Link href="/settings" className="block rounded-xl px-3 py-2 text-sm font-bold text-[#F5F5F5] transition hover:bg-white/[0.06]">Configuracion</Link>
          <Link href="/saved" className="block rounded-xl px-3 py-2 text-sm font-bold text-[#F5F5F5] transition hover:bg-white/[0.06]">Guardados</Link>
          <button type="button" onClick={logout} className="mt-2 w-full rounded-xl border-t border-white/10 px-3 py-2 text-left text-sm font-bold text-cyan-200 transition hover:bg-white/[0.06]">
            Cerrar sesion
          </button>
        </div>
      ) : null}
    </div>
  );
}
