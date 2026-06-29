"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileIndexClient() {
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem("gathergram_username");

    if (username) {
      router.replace(`/profile/${username}`);
      return;
    }

    router.replace("/login");
  }, [router]);

  return (
    <section className="gg-card gg-fade-up rounded-3xl p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-200/30 border-t-cyan-200" />
      </div>
      <h1 className="mt-4 text-xl font-black text-white">Abriendo tu perfil</h1>
      <p className="mt-2 text-sm text-[#9CA3AF]">
        Te estamos llevando a tu URL personalizada.
      </p>
    </section>
  );
}
