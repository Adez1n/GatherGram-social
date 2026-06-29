export default function ChatSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-md border border-[#2E2E2E] bg-[#202020]"
        />
      ))}
    </div>
  );
}
