"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";

type HomeClientProps = {
  children: ReactNode;
};

const features = [
  {
    title: "Publica lo que piensas",
    description: "Comparte ideas, clips, ubicaciones y conversaciones sin ruido.",
    icon: "bi-pencil-square",
  },
  {
    title: "Explora contenido",
    description: "Encuentra posts recientes, usuarios nuevos y tendencias vivas.",
    icon: "bi-compass",
  },
  {
    title: "Chat en tiempo real",
    description: "Habla con tus conexiones mutuas en una experiencia rapida.",
    icon: "bi-chat-dots",
  },
  {
    title: "Perfiles modernos",
    description: "Avatar, banner, colores y presencia visual con personalidad.",
    icon: "bi-person-badge",
  },
  {
    title: "Notificaciones inteligentes",
    description: "Likes, comentarios y follows con estados claros y accionables.",
    icon: "bi-bell",
  },
  {
    title: "Comunidad y amigos",
    description: "Descubre personas, guardados y conversaciones que importan.",
    icon: "bi-people",
  },
];

function hasStoredAuth() {
  return Boolean(
    localStorage.getItem("gathergram_token") ||
      localStorage.getItem("gathergram_user_id"),
  );
}

function subscribeToAuthChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("gathergram:auth-updated", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("gathergram:auth-updated", onStoreChange);
  };
}

function getAuthSnapshot() {
  return hasStoredAuth();
}

function getServerAuthSnapshot() {
  return false;
}

export default function HomeClient({ children }: HomeClientProps) {
  const authenticated = useSyncExternalStore(
    subscribeToAuthChanges,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <main className="gg-shell min-h-screen overflow-hidden px-4 py-6 text-[#F4F7F8] sm:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-[#0E1113]/70 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 gg-focus rounded-xl">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-base font-black text-cyan-200 shadow-[0_0_30px_rgba(103,232,249,0.18)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.ico" alt="" className="h-7 w-7 rounded-md object-cover" />
          </span>
          <span>
            <span className="block text-lg font-black">GatherGram</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-[#6B7280]">
              Innovating
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-bold text-[#D7DEE2] transition hover:bg-white/5 hover:text-white">
            Iniciar sesion
          </Link>
          <Link href="/register" className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-black text-[#041012] shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:bg-cyan-200">
            Crear cuenta
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-10 py-16 lg:grid-cols-[1fr_0.95fr] lg:py-24">
        <div className="gg-fade-up">
          <p className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
            Social feed premium
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Conecta, comparte y descubre en GatherGram
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#AAB4BB] sm:text-lg">
            Una red social moderna para publicar, conversar, explorar comunidades
            y descubrir personas nuevas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-black text-[#041012] shadow-xl shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:bg-cyan-200">
              Crear cuenta
            </Link>
            <Link href="/login" className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.07]">
              Iniciar sesion
            </Link>
          </div>
        </div>

        <div className="relative gg-fade-up">
          <div className="absolute -inset-8 rounded-[2rem] bg-cyan-300/10 blur-3xl" />
          <div className="relative rounded-[1.75rem] border border-white/10 bg-[#0E1113]/85 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="rounded-2xl border border-white/10 bg-[#050607] p-4">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="h-11 w-11 rounded-full bg-gradient-to-br from-cyan-200 to-teal-300" />
                <div className="flex-1">
                  <div className="h-3 w-32 rounded-full bg-white/80" />
                  <div className="mt-2 h-2 w-24 rounded-full bg-white/20" />
                </div>
                <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-[#061013]">
                  Live
                </span>
              </div>
              <div className="space-y-3 py-5">
                <div className="h-4 w-4/5 rounded-full bg-white/70" />
                <div className="h-4 w-3/5 rounded-full bg-white/25" />
                <div className="aspect-video rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-300/30 via-[#141B1F] to-teal-300/20" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["Likes", "Chat", "Alerts"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs text-[#9CA3AF]">{item}</p>
                    <p className="mt-1 text-lg font-black text-white">Ready</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="gg-card gg-card-hover rounded-2xl p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <i className={`bi ${feature.icon}`} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-black text-white">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#9CA3AF]">{feature.description}</p>
          </article>
        ))}
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 py-8 text-sm text-[#6B7280] sm:flex-row sm:items-center sm:justify-between">
        <p className="font-black text-[#F4F7F8]">GatherGram</p>
        <p>Copyright 2026 GatherGram. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
