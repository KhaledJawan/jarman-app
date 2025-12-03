const isBrowser = typeof window !== "undefined";

export { isBrowser };

export function load<T = unknown>(key: string): T | null {
  if (!isBrowser) return null;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch (error) {
    console.error("Failed to load storage item", key, error);
    return null;
  }
}

export function save(key: string, value: unknown) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save storage item", key, error);
  }
}
