type OnlineIndicatorProps = {
  online?: boolean;
};

export default function OnlineIndicator({ online }: OnlineIndicatorProps) {
  return (
    <span
      className={`h-2.5 w-2.5 rounded-full ${
        online ? "bg-emerald-400" : "bg-zinc-600"
      }`}
      aria-label={online ? "Online" : "Offline"}
    />
  );
}
