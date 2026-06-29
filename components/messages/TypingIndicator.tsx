type TypingIndicatorProps = {
  visible: boolean;
};

export default function TypingIndicator({ visible }: TypingIndicatorProps) {
  if (!visible) {
    return null;
  }

  return <p className="px-4 pb-2 text-xs font-bold text-[#3DD9EB]">Escribiendo...</p>;
}
