"use client";

import { useCallback, useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

const lists = new Map<string, MediaQueryList>();

function mediaQueryList(query: string) {
  let list = lists.get(query);
  if (!list) {
    list = window.matchMedia(query);
    lists.set(query, list);
  }
  return list;
}

export function useIsMobile() {
  return useMediaQuery(MOBILE_QUERY);
}

export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = mediaQueryList(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => mediaQueryList(query).matches,
    () => false,
  );
}
