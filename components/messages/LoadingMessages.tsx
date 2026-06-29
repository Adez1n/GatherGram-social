export default function LoadingMessages() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-md bg-[#202020]"
        />
      ))}
    </div>
  );
}
