"use client";

// Lightweight helpers to safely read/write JSON to localStorage.
const isBrowser = typeof window !== "undefined";

export function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error("Failed to parse storage item", key, error);
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to write storage item", key, error);
  }
}

export function updateJSON<T>(key: string, updater: (prev: T) => T, fallback: T) {
  const current = readJSON<T>(key, fallback);
  const next = updater(current);
  writeJSON(key, next);
  return next;
}
