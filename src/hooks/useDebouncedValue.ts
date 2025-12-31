import { useEffect, useRef, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs = 400) {
  const [debounced, setDebounced] = useState<T>(value);
  const lastValueRef = useRef<T>(value);

  useEffect(() => {
    if (delayMs <= 0) {
      lastValueRef.current = value;
      setDebounced(value);
      return;
    }

    const t = window.setTimeout(() => {
      // evita setState si no cambió realmente
      if (Object.is(lastValueRef.current, value)) return;
      lastValueRef.current = value;
      setDebounced(value);
    }, delayMs);

    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

// alias opcional si prefieres el naming común:
export const useDebounce = useDebouncedValue;
