export default function EmptyChatState() {
  return (
    <section className="flex h-full min-h-[520px] flex-col items-center justify-center rounded-md border border-[#2E2E2E] bg-[#181818] p-8 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full border border-[#3DD9EB]/30 bg-[#3DD9EB]/10 text-2xl text-[#55E6F7]">
        <i className="bi bi-chat-dots-fill" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-xl font-black text-[#F5F5F5]">
        Selecciona una conversacion
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#A3A3A3]">
        Tus mensajes privados apareceran aqui en tiempo real.
      </p>
    </section>
  );
}
