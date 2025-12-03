"use client";

import rawLevels from "@/data/levels.json";
import { useLanguage } from "@/lib/i18n";
import { readJSON } from "@/lib/storage";
import Link from "next/link";
import { ChevronDown, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type LessonSummary = {
  id: string;
  title: string;
  description?: string;
  words: number;
  grammar: number;
  dialogues: number;
};

export type Level = {
  name: string;
  lessons: LessonSummary[];
};

export type LevelsMap = Record<string, Level>;

const levelsData = rawLevels as LevelsMap;

type LevelKey = string;
type LessonStatus = "completed" | "inprogress" | "notstarted";

const STATUS_COLOR: Record<LessonStatus, string> = {
  completed: "border-success bg-success/10",
  inprogress: "border-primary bg-primary/10",
  notstarted: "border-gray-300 bg-white",
};

const LINE_COLOR: Record<LessonStatus, string> = {
  completed: "bg-success/50",
  inprogress: "bg-primary/40",
  notstarted: "bg-gray-200",
};

const DEFAULT_LESSONS = [
  "Basics",
  "Lesson 2",
  "Lesson 3",
  "Lesson 4",
  "Lesson 5",
  "Lesson 6",
  "Lesson 7",
  "Lesson 8",
  "Lesson 9",
  "Lesson 10",
];

export default function HomePage() {
  const { t } = useLanguage();
  const levelKeys = useMemo(() => Object.keys(levelsData) as LevelKey[], []);

  const [activeLevel, setActiveLevel] = useState<LevelKey>(() => levelKeys[0] ?? "A1");
  const currentLevel = useMemo(() => levelsData[activeLevel], [activeLevel]);
  const currentLessons = currentLevel?.lessons ?? [];

  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const levelBreakdown = useMemo(() => {
    const totals = currentLessons.reduce(
      (acc, lesson) => {
        acc.words += lesson.words ?? 0;
        acc.grammar += lesson.grammar ?? 0;
        acc.dialogues += lesson.dialogues ?? 0;
        return acc;
      },
      { words: 0, grammar: 0, dialogues: 0 },
    );
    const totalUnits = totals.words + totals.grammar + totals.dialogues;
    const toPercent = (value: number) => (totalUnits > 0 ? Math.round((value / totalUnits) * 100) : 0);

    return {
      totals,
      percentages: {
        words: toPercent(totals.words),
        grammar: toPercent(totals.grammar),
        dialogues: toPercent(totals.dialogues),
      },
      totalUnits,
    };
  }, [currentLessons]);

  useEffect(() => {
    const storedLevel = readJSON<string | null>("jarman-level", null);
    if (storedLevel) {
      const match = levelKeys.find((key) => key.toLowerCase().startsWith(storedLevel.toLowerCase()));
      if (match) setActiveLevel(match);
    }
  }, [levelKeys]);

  const completedLessons = useMemo(
    () => readJSON<Record<string, boolean>>("jarman-completed-lessons", {}),
    [],
  );

  const getLevelProgress = (levelId: LevelKey) => {
    const lessons = levelsData[levelId]?.lessons ?? [];
    const total = lessons.length > 0 ? lessons.length : DEFAULT_LESSONS.length;
    const done = lessons.length > 0 ? lessons.filter((lesson) => completedLessons[lesson.id]).length : 0;
    return Math.round((done / Math.max(total, 1)) * 100);
  };

  const lessonItems = useMemo(() => {
    if (currentLessons.length > 1) {
      return currentLessons.map((lesson, idx) => ({
        id: lesson.id ?? `lesson-${idx + 1}`,
        title: lesson.title ?? `Lesson ${idx + 1}`,
      }));
    }
    // fallback: keep the full mock list so the page stays populated
    return DEFAULT_LESSONS.map((title, idx) => ({ id: `lesson-${idx + 1}`, title }));
  }, [currentLessons]);

  const completedCount = lessonItems.filter((lesson) => completedLessons[lesson.id]).length;
  const levelProgress = Math.round((completedCount / Math.max(lessonItems.length, 1)) * 100);
  const firstIncompleteIndex = lessonItems.findIndex((lesson) => !completedLessons[lesson.id]);

  const lessonStatus = (idx: number, lessonId: string): LessonStatus => {
    if (completedLessons[lessonId]) return "completed";
    if (firstIncompleteIndex === idx) return "inprogress";
    return "notstarted";
  };

  const levelTitle = `${t("home.levelPrefix")} ${currentLevel?.name ?? activeLevel}`;

  return (
    <div className="relative flex flex-col gap-6 pb-12">
      <header className="flex items-center justify-between">
        <p className="text-xl font-semibold text-neutral-900">Jarman</p>
        <Link
          href="/profile"
          className="inline-flex items-center justify-center rounded-full bg-white p-2 text-neutral-900 shadow ring-1 ring-black/5 transition hover:bg-primary/10"
          aria-label={t("nav.profile")}
        >
          <User size={18} />
        </Link>
      </header>

      <div className="sticky top-3 z-20">
        <button
          type="button"
          onClick={() => setShowLevelPicker((prev) => !prev)}
          className="relative flex w-full items-center justify-between overflow-hidden rounded-3xl bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-4 text-left text-white shadow-lg shadow-orange-300/40 transition hover:opacity-95"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span>{levelTitle}</span>
              <ChevronDown size={16} />
            </div>
            <p className="text-xs opacity-90">{t("home.levelUpgradeHint")}</p>
          </div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/30" aria-label="Level totals">
            <div
              className="absolute inset-[6px] rounded-full"
              style={{
                background: `conic-gradient(var(--color-primary) ${levelProgress}%, #f1f1f1 ${levelProgress}% 100%)`,
              }}
            />
            <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-white text-[10px] font-semibold text-neutral-900 shadow-inner">
              <span className="text-[10px] uppercase tracking-tight text-gray-600">Total</span>
              <span className="text-sm text-neutral-900">{levelBreakdown.totalUnits}</span>
            </div>
          </div>
        </button>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Words", value: levelBreakdown.percentages.words },
              { label: "Grammar", value: levelBreakdown.percentages.grammar },
              { label: "Dialogue", value: levelBreakdown.percentages.dialogues },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white/80 px-3 py-2 text-center text-xs font-semibold text-neutral-900 shadow-sm ring-1 ring-black/5"
              >
                <p className="text-[11px] text-gray-600">{item.label}</p>
                <p className="text-sm text-neutral-900">{item.value}%</p>
              </div>
            ))}
          </div>
        </div>
        {showLevelPicker ? (
          <div className="mt-2 space-y-2">
            {levelKeys.map((key) => {
              const progress = getLevelProgress(key);
              const isActive = activeLevel === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveLevel(key);
                    setShowLevelPicker(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-3xl border px-4 py-3 text-left shadow-sm transition ${
                    isActive
                      ? "border-primary bg-primary/10 text-neutral-900 shadow"
                      : "border-neutralLight bg-white hover:-translate-y-0.5 hover:shadow"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{levelsData[key]?.name ?? key}</p>
                    <p className="text-xs text-gray-600">{t("home.levelUpgradeHint")}</p>
                  </div>
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10" aria-hidden>
                    <div
                      className="absolute inset-[4px] rounded-full"
                      style={{ background: `conic-gradient(var(--color-primary) ${progress}%, #f1f1f1 ${progress}% 100%)` }}
                    />
                    <div className="absolute inset-[8px] flex items-center justify-center rounded-full bg-white text-[10px] font-semibold text-neutral-900">
                      {progress}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {!showLevelPicker ? (
        <div className="mt-3 space-y-4">
          {lessonItems.map((lesson, idx) => {
            const status = lessonStatus(idx, lesson.id);
            const borderColor =
              status === "completed"
                ? "ring-success/50"
                : status === "inprogress"
                  ? "ring-primary/50"
                  : "ring-gray-200";
            return (
              <div key={lesson.id} className="relative flex gap-3">
                {idx < lessonItems.length - 1 ? (
                  <div
                    className={`absolute left-[26px] top-[52px] h-[calc(100%-52px)] w-0.5 ${LINE_COLOR[status]}`}
                    aria-hidden
                  />
                ) : null}
                <div
                  className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 ${STATUS_COLOR[status]} ${borderColor} shadow`}
                >
                  <span className="text-xs font-semibold text-neutral-900">{lesson.title[0] ?? "L"}</span>
                </div>
                <Link
                  href="/learn"
                  className="flex-1 rounded-2xl bg-white px-4 py-3 text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-sm font-semibold text-neutral-900">{lesson.title}</p>
                  <p className="text-xs text-gray-600">{t("home.lessonStatusLabel")}</p>
                </Link>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
