import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function isSpookySeason() {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();
  return (month === 9 && day >= 20) || (month === 10 && day <= 2);
}

export function useHalloween(enabled: boolean) {
  const spooky = useSyncExternalStore(subscribe, isSpookySeason, () => false);
  return enabled && spooky;
}
