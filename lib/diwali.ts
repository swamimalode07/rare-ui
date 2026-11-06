import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// lakshmi puja dates; the festival moves every year, so add new years here
const DIWALI_DATES = [
  "2026-11-08",
  "2027-10-29",
  "2028-10-17",
  "2029-11-05",
  "2030-10-26",
];

const DAY = 24 * 60 * 60 * 1000;

function isFestiveSeason() {
  const now = Date.now();
  return DIWALI_DATES.some((date) => {
    const [y, m, d] = date.split("-").map(Number);
    const diwali = new Date(y, m - 1, d).getTime();
    // dhanteras (two days before) through the end of bhai dooj (three days after)
    return now >= diwali - 2 * DAY && now < diwali + 4 * DAY;
  });
}

export function useDiwali(enabled: boolean) {
  const festive = useSyncExternalStore(subscribe, isFestiveSeason, () => false);
  return enabled && festive;
}
