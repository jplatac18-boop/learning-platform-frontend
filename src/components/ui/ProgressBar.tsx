export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value));

  return (
    <div
      className="h-2 w-full rounded-full bg-slate-200"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-label={label}
    >
      <div
        className="h-2 rounded-full bg-blue-600 transition-[width] duration-300 ease-out"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
