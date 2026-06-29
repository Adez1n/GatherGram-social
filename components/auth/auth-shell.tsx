import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerHref: string;
  footerLink: string;
  children: ReactNode;
};

export default function AuthShell({
  title,
  subtitle,
  footerText,
  footerHref,
  footerLink,
  children,
}: AuthShellProps) {
  return (
    <main className="gg-shell min-h-screen px-4 py-8 text-[#F5F5F5] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="gg-card grid w-full overflow-hidden rounded-[1.75rem] lg:grid-cols-[1fr_420px]">
          <div className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden border-r border-white/10 bg-[#0E1113] p-10 lg:flex">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-lg font-black text-cyan-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/favicon.ico" alt="" className="h-7 w-7 rounded-md object-cover" />
                </span>
                <span>
                  <span className="block text-2xl font-black">GatherGram</span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                    Innovating
                  </span>
                </span>
              </Link>

              <div className="mt-24 max-w-xl">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-200">
                  Premium social feed
                </p>
                <h1 className="mt-5 text-5xl font-black leading-tight">
                  Comparte ideas, clips y momentos con tu comunidad.
                </h1>
                <p className="mt-5 text-base leading-7 text-[#A3A3A3]">
                  Una experiencia oscura, limpia y enfocada para una red social
                  moderna con energia tech.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {["Posts", "Likes", "Follows"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">
                    {item}
                  </p>
                  <p className="mt-2 font-bold text-[#F5F5F5]">Ready</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-[620px] items-center p-5 sm:p-8">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-8 lg:hidden">
                <Link href="/" className="inline-flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 font-black text-cyan-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/favicon.ico" alt="" className="h-6 w-6 rounded-md object-cover" />
                  </span>
                  <span className="text-xl font-black">GatherGram</span>
                </Link>
              </div>

              <div>
                <h2 className="text-3xl font-black">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
                  {subtitle}
                </p>
              </div>

              <div className="mt-8">{children}</div>

              <p className="mt-8 text-center text-sm text-[#A3A3A3]">
                {footerText}{" "}
                <Link
                  href={footerHref}
                  className="font-bold text-cyan-200 transition-colors duration-200 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                >
                  {footerLink}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
