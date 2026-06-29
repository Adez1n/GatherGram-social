type NewMessagesButtonProps = {
  onClick: () => void;
};

export default function NewMessagesButton({ onClick }: NewMessagesButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#3DD9EB] px-4 py-2 text-xs font-black text-[#0F1113] shadow-xl shadow-black/30"
    >
      Nuevos mensajes
    </button>
  );
}
