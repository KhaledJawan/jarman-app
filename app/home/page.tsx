"use client";

import rawLevels from "@/data/levels.json";
import { useLanguage } from "@/lib/i18n";
import { load } from "@/lib/storage";
import Link from "next/link";
import { User } from "lucide-react";
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
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
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
    const storedLevel = load<string>("jarman-level");
    if (storedLevel) {
      const match = levelKeys.find((key) => key.toLowerCase().startsWith(storedLevel.toLowerCase()));
      if (match) setActiveLevel(match);
    }
  }, [levelKeys]);

  useEffect(() => {
    const stored = load<Record<string, boolean>>("jarman-completed-lessons");
    setCompletedLessons(stored ?? {});
  }, []);

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
  const studiedCount = completedCount;
  const deckCount = lessonItems.length;

  return (
    <div className="relative flex flex-col gap-6 pb-16">
      <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-[#e8f0ff] via-white to-[#fff4eb] px-4 pt-5 shadow-sm ring-1 ring-black/5">
        <div className="absolute right-4 top-4">
          <Link
            href="/profile"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5"
            aria-label={t("nav.profile")}
          >
            <User size={20} className="text-primary" />
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("home.levelPrefix")}</p>
              <h1 className="text-3xl font-bold text-neutral-900">{currentLevel?.name ?? "Your Level"}</h1>
            </div>
            <button
              type="button"
              onClick={() => setShowLevelPicker((prev) => !prev)}
              className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-primary shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5"
            >
              {activeLevel} ▾
            </button>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-[#ede8ff] px-4 py-3 text-primary shadow-sm ring-1 ring-black/5">
          <p className="text-3xl font-bold">{studiedCount}</p>
          <p className="text-sm font-semibold text-primary/80">Studied cards</p>
        </div>
        <div className="rounded-3xl bg-[#ffe9d9] px-4 py-3 text-orange-500 shadow-sm ring-1 ring-black/5">
          <p className="text-3xl font-bold">{deckCount}</p>
          <p className="text-sm font-semibold text-orange-500/80">Decks created</p>
        </div>
      </div>

      {showLevelPicker ? (
        <div className="space-y-2">
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
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Classes</h2>
            <span className="text-xs font-semibold text-primary">{levelTitle}</span>
          </div>

          <div className="space-y-3">
            {lessonItems.map((lesson, idx) => {
              const status = lessonStatus(idx, lesson.id);
              const statusLabel =
                status === "completed" ? "Completed" : status === "inprogress" ? "In progress" : "Not started";
              return (
                <Link
                  key={lesson.id}
                  href="/learn"
                  className="block rounded-3xl bg-white px-4 py-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-xs font-semibold text-primary mb-1">{currentLevel?.name ?? "Level"}</p>
                  <p className="text-base font-semibold text-neutral-900">{lesson.title}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <span
                      className={`rounded-full px-2 py-1 ring-1 ${
                        status === "completed"
                          ? "bg-success/10 text-success ring-success/30"
                          : status === "inprogress"
                            ? "bg-primary/10 text-primary ring-primary/30"
                            : "bg-gray-100 text-gray-700 ring-gray-200"
                      }`}
                    >
                      {statusLabel}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{t("home.lessonStatusLabel")}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
