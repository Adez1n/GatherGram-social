type ConversationSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function ConversationSearch({
  value,
  onChange,
}: ConversationSearchProps) {
  return (
    <label className="flex h-11 items-center gap-3 rounded-md border border-[#2E2E2E] bg-[#202020] px-3">
      <i className="bi bi-search text-[#A3A3A3]" aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar conversaciones"
        className="min-w-0 flex-1 bg-transparent text-sm text-[#F5F5F5] outline-none placeholder:text-[#6B7280]"
      />
    </label>
  );
}
