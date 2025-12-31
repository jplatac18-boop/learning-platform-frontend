import React, { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className = "", error, ...props },
  ref
) {
  const uid = useId();
  const errorId = `input-error-${uid}`;

  const base =
    "w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm " +
    "outline-none transition-colors transition-shadow duration-150 " +
    "placeholder:text-slate-400";

  const stateClasses = error
    ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-400"
    : "border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-400";

  return (
    <>
      <input
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : props["aria-describedby"]}
        className={[base, stateClasses, className].join(" ")}
        {...props}
      />

      {error ? (
        <p id={errorId} className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </>
  );
});
