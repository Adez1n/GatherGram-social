import type { InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function AuthInput({
  label,
  error,
  id,
  ...props
}: AuthInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-[#F5F5F5]"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-[#6B7280] hover:border-cyan-300/30 focus:border-cyan-300/70 focus:ring-4 focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60"
        {...props}
      />
      {error ? (
        <p className="mt-2 text-sm font-medium text-cyan-200">{error}</p>
      ) : null}
    </div>
  );
}
