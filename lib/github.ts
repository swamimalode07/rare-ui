import { REGISTRY_REPO } from "@/lib/components";

export async function fetchStarCount() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REGISTRY_REPO}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}
