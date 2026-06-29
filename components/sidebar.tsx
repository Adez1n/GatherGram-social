"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    label: "Inicio",
    href: "/",
    icon: "bi-house-door-fill",
    description: "Feed principal",
  },
  {
    label: "Explorar",
    href: "/explore",
    icon: "bi-compass-fill",
    description: "Descubre contenido",
  },
  {
    label: "Mensajes",
    href: "/messages",
    icon: "bi-chat-dots-fill",
    description: "Chats privados",
  },
  {
    label: "Alertas",
    href: "/notifications",
    icon: "bi-bell-fill",
    description: "Actividad reciente",
  },
  {
    label: "Guardados",
    href: "/saved",
    icon: "bi-bookmark-heart-fill",
    description: "Publicaciones",
  },
  {
    label: "Config",
    href: "/settings",
    icon: "bi-sliders",
    description: "Preferencias",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block">
      <nav
        aria-label="Navegacion principal"
        className="gg-card sticky top-24 overflow-hidden rounded-3xl p-3"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="mb-3 flex items-center justify-between px-2 pt-1">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Menu
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.85)]" />
        </div>

        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 outline-none transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/20 focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${
                    isActive
                      ? "bg-cyan-300/10 text-white"
                      : "text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  <span
                    className={`absolute inset-y-2 left-0 w-1 rounded-r-full transition-all duration-300 ${
                      isActive
                        ? "bg-cyan-300 opacity-100"
                        : "bg-zinc-500 opacity-0 group-hover:opacity-70"
                    }`}
                  />
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border transition-all duration-300 group-hover:scale-105 ${
                      isActive
                        ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-200"
                        : "border-white/10 bg-white/[0.04] text-zinc-400 group-hover:border-cyan-300/30 group-hover:text-zinc-100"
                    }`}
                  >
                    <i className={`bi ${item.icon}`} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-5">
                      {item.label}
                    </span>
                    <span className="block truncate text-xs text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
