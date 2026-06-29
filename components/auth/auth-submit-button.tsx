type AuthSubmitButtonProps = {
  isSubmitting: boolean;
  idleText: string;
  loadingText: string;
};

export default function AuthSubmitButton({
  isSubmitting,
  idleText,
  loadingText,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 text-sm font-black text-[#041012] shadow-lg shadow-cyan-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-cyan-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isSubmitting ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0F1113]/30 border-t-[#0F1113]" />
      ) : null}
      {isSubmitting ? loadingText : idleText}
    </button>
  );
}
