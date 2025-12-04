"use client";

import levelsData from "@/data/levels.json";
import { useLanguage } from "@/lib/i18n";
import { load } from "@/lib/storage";
import { ChevronRight, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Levels = typeof levelsData;
type LevelKey = keyof Levels;
type Lesson = Levels[LevelKey]["lessons"][number];

export default function LearnPage() {
  const { t } = useLanguage();
  const [activeLevel, setActiveLevel] = useState<LevelKey>(() => (Object.keys(levelsData)[0] as LevelKey) ?? "A1");
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = load<Record<string, boolean>>("jarman-completed-lessons");
    setCompletedLessons(stored ?? {});
  }, []);

  const entries = useMemo(() => Object.entries(levelsData) as [LevelKey, Levels[LevelKey]][], []);
  const activeLessons = levelsData[activeLevel]?.lessons ?? [];

  const getProgress = (levelId: LevelKey, lessons: Lesson[]) => {
    const total = lessons.length;
    const done = lessons.filter((lesson) => completedLessons[lesson.id]).length;
    return Math.round((done / Math.max(total, 1)) * 100);
  };

  return (
    <div className="flex flex-col gap-5 pb-12">
      <div className="card-surface overflow-hidden">
        <div className="relative h-40 w-full bg-gradient-to-r from-primary/15 via-white to-accent/20">
          <div className="absolute left-4 top-4 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-primary shadow">
            {t("learn.heading")}
          </div>
          <div className="absolute bottom-4 left-4 text-left">
            <p className="text-lg font-semibold text-neutral-900">{levelsData[activeLevel]?.name}</p>
            <p className="text-xs text-gray-600">{t("learn.progress")}</p>
          </div>
          <div className="absolute right-4 bottom-4">
            <div className="h-20 w-32 rounded-3xl bg-white/70 shadow-inner ring-1 ring-black/5" />
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-3">
          {entries.map(([id]) => (
            <button
              key={id}
              onClick={() => setActiveLevel(id)}
              className={`pill ring-1 ring-black/5 ${
                activeLevel === id ? "bg-primary text-white shadow-md" : "bg-white text-gray-700"
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {activeLessons.map((lesson, idx) => {
          const cardColors = ["from-orange-50", "from-green-50", "from-blue-50"];
          const bg = cardColors[idx % cardColors.length];
          const progress = getProgress(activeLevel, [lesson]);
          return (
            <div
              key={lesson.id}
              className={`card-surface flex items-center justify-between bg-gradient-to-r ${bg} to-white px-4 py-3`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-inner ring-1 ring-black/5">
                  <Play size={18} className="text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-900">{lesson.title}</p>
                  <p className="text-xs text-gray-600">
                    {lesson.words} {t("learn.meta.words")} • {lesson.grammar} {t("learn.meta.grammar")} • {lesson.dialogues} {t("learn.meta.dialogues")}
                  </p>
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-white/80">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
              <ChevronRight className="text-primary" size={20} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
