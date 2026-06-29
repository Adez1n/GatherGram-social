import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function SettingsPage() {
  return (
    <main className="gg-shell min-h-screen">
      <Navbar />
      <section className="gg-card mx-auto mt-10 max-w-3xl rounded-3xl p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">Configuracion</h1>
        <p className="mt-2 text-sm text-[#A3A3A3]">
          Ajustes generales de la cuenta y de la aplicacion.
        </p>

        <div className="mt-5 grid gap-3">
          <Link
            href="/settings/security"
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-bold text-white transition hover:border-cyan-300/25 hover:text-cyan-200"
          >
            Seguridad y contrasena
          </Link>
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h2 className="font-bold text-[#F5F5F5]">Privacidad</h2>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Opciones de privacidad listas para futuras fases.
            </p>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h2 className="font-bold text-[#F5F5F5]">Preferencias de pagina</h2>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Tema, idioma y notificaciones generales se configuraran aqui.
            </p>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h2 className="font-bold text-[#F5F5F5]">Datos de la cuenta</h2>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Exportar o administrar datos de cuenta en futuras mejoras.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
