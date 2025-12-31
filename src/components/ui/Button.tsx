import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  type,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold " +
    "shadow-sm transition-colors transition-transform duration-150 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "focus-visible:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]";

  const width = fullWidth ? "w-full" : "";

  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 ring-offset-slate-900/0"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700 ring-offset-slate-900/0"
      : variant === "ghost"
      ? "bg-transparent text-slate-700 hover:bg-slate-100"
      : // secondary
        "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50";

  return (
    <button
      type={type ?? "button"}
      className={`${base} ${width} ${styles} ${className}`}
      {...props}
    />
  );
}
