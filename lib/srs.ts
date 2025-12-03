"use client";

import { load, save } from "./storage";

export type Difficulty = "easy" | "medium" | "hard";

export type ReviewRecord = {
  itemId: string;
  difficulty: Difficulty;
  lastReviewed: number;
  nextReview: number;
};

const STORAGE_KEY = "jarman-srs";

const intervals: Record<Difficulty, number> = {
  easy: 1000 * 60 * 60 * 48, // 48h
  medium: 1000 * 60 * 60 * 24, // 24h
  hard: 1000 * 60 * 60 * 12, // 12h
};

function getReviewMap() {
  return load<Record<string, ReviewRecord>>(STORAGE_KEY) ?? {};
}

export function scheduleReview(itemId: string, difficulty: Difficulty): ReviewRecord {
  const now = Date.now();
  const nextReview = now + intervals[difficulty];
  const record: ReviewRecord = { itemId, difficulty, lastReviewed: now, nextReview };
  const map = getReviewMap();
  map[itemId] = record;
  save(STORAGE_KEY, map);
  return record;
}

export function getReviewRecord(itemId: string): ReviewRecord | null {
  const map = getReviewMap();
  return map[itemId] ?? null;
}

export function getReviewRecords() {
  return getReviewMap();
}
