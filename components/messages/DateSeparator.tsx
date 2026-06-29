type DateSeparatorProps = {
  date: string;
};

export default function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center gap-3 py-4">
      <span className="h-px flex-1 bg-[#2E2E2E]" />
      <span className="text-xs font-bold text-[#A3A3A3]">{date}</span>
      <span className="h-px flex-1 bg-[#2E2E2E]" />
    </div>
  );
}
