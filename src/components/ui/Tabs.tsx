import React from "react";

export type TabItem<T extends string> = {
  key: T;
  label: string;
};

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  label = "Tabs",
}: {
  value: T;
  onChange: (v: T) => void;
  items: TabItem<T>[];
  label?: string;
}) {
  const index = Math.max(0, items.findIndex((x) => x.key === value));

  const focusTabByIndex = (i: number) => {
    const key = items[i]?.key;
    if (!key) return;
    const el = document.getElementById(`tab-${key}`);
    (el as HTMLButtonElement | null)?.focus();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!items.length) return;

    let next = index;

    switch (e.key) {
      case "ArrowRight":
        next = (index + 1) % items.length;
        e.preventDefault();
        focusTabByIndex(next);
        break;
      case "ArrowLeft":
        next = (index - 1 + items.length) % items.length;
        e.preventDefault();
        focusTabByIndex(next);
        break;
      case "Home":
        e.preventDefault();
        focusTabByIndex(0);
        break;
      case "End":
        e.preventDefault();
        focusTabByIndex(items.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onChange(items[index].key);
        break;
    }
  };

  return (
    <div className="border-b border-slate-200">
      <div
        role="tablist"
        aria-label={label}
        className="flex gap-2"
        onKeyDown={onKeyDown}
      >
        {items.map((it) => {
          const active = it.key === value;
          return (
            <button
              key={it.key}
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${it.key}`}
              id={`tab-${it.key}`}
              tabIndex={active ? 0 : -1}
              type="button"
              onClick={() => onChange(it.key)}
              className={[
                "relative px-3 py-2 text-sm font-semibold transition-colors",
                active
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-900",
              ].join(" ")}
            >
              {it.label}
              {/* underline animada */}
              <span
                className={[
                  "pointer-events-none absolute inset-x-1 -bottom-[1px] h-0.5 rounded-full bg-blue-600 transition-all duration-200",
                  active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-50",
                ].join(" ")}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TabPanel<T extends string>({
  tabKey,
  activeKey,
  children,
}: {
  tabKey: T;
  activeKey: T;
  children: React.ReactNode;
}) {
  const active = tabKey === activeKey;

  return (
    <div
      role="tabpanel"
      id={`panel-${tabKey}`}
      aria-labelledby={`tab-${tabKey}`}
      tabIndex={0}
      hidden={!active}
      className="pt-4"
    >
      {active ? children : null}
    </div>
  );
}
