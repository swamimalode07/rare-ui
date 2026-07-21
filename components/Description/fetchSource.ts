export const SOURCE_LOADING = "// Loading…";
export const SOURCE_ERROR = "// Unable to load source.";

export async function fetchSource(registry: string) {
  try {
    const res = await fetch(`/api/source?name=${encodeURIComponent(registry)}`);
    return res.ok ? await res.text() : SOURCE_ERROR;
  } catch {
    return SOURCE_ERROR;
  }
}
