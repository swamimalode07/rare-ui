export const SOURCE_LOADING = "// Loading…";
export const SOURCE_ERROR = "// Unable to load source.";
export const SOURCE_LOCKED =
  "// This is a RareUI Pro component.\n// Sign in with a Pro license at /account to see the source.";

export async function fetchSource(registry: string) {
  try {
    const res = await fetch(`/api/source?name=${encodeURIComponent(registry)}`);
    if (res.status === 401) return SOURCE_LOCKED;
    return res.ok ? await res.text() : SOURCE_ERROR;
  } catch {
    return SOURCE_ERROR;
  }
}
