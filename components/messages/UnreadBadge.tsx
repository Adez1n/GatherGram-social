type UnreadBadgeProps = {
  count: number;
};

export default function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-[#3DD9EB] px-1 text-[11px] font-black text-[#0F1113]">
      {count > 99 ? "99+" : count}
    </span>
  );
}
