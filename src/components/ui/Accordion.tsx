import React, { useId, useState } from "react";

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const uid = useId();
  const buttonId = `acc-btn-${uid}`;
  const panelId = `acc-panel-${uid}`;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        id={buttonId}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        <span
          className={[
            "grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition-transform duration-150",
            open ? "rotate-45" : "rotate-0",
          ].join(" ")}
          aria-hidden="true"
        >
          +
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={[
          "border-t border-slate-200 px-4 transition-[max-height,opacity] duration-200 ease-out",
          open ? "max-h-96 opacity-100 py-3" : "max-h-0 opacity-0 py-0",
        ].join(" ")}
      >
        {open && <div className="text-sm text-slate-700">{children}</div>}
      </div>
    </div>
  );
}
