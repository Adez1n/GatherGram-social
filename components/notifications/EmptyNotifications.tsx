export default function EmptyNotifications() {
  return (
    <section className="gg-card rounded-3xl p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
        <i className="bi bi-bell" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-black text-white">
        No tienes notificaciones
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
        Likes, comentarios y nuevos seguidores apareceran aqui.
      </p>
    </section>
  );
}
