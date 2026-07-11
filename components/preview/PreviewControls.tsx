"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";

type PreviewValues = Record<string, string>;

type PreviewControlsContextValue = {
  values: PreviewValues;
  setValue: (name: string, value: string) => void;
};

const PreviewControlsContext =
  createContext<PreviewControlsContextValue | null>(null);

export function PreviewControlsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [values, setValues] = useState<PreviewValues>({});

  const setValue = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  return (
    <PreviewControlsContext.Provider value={{ values, setValue }}>
      {children}
    </PreviewControlsContext.Provider>
  );
}

export function usePreviewControl(name: string, fallback: string) {
  const pathname = usePathname();
  const ctx = useContext(PreviewControlsContext);
  // Values are scoped per page so one component's control values (e.g. a hex
  // color) never leak into another component expecting a different format.
  const key = `${pathname}:${name}`;
  const value = ctx?.values[key] ?? fallback;
  const setValue = (next: string) => ctx?.setValue(key, next);
  return [value, setValue] as const;
}
