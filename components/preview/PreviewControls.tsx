"use client";

import { createContext, useContext, useState } from "react";

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
  const ctx = useContext(PreviewControlsContext);
  const value = ctx?.values[name] ?? fallback;
  const setValue = (next: string) => ctx?.setValue(name, next);
  return [value, setValue] as const;
}
