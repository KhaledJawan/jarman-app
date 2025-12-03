"use client";

import words from "@/data/word/a11.json";
import { useLanguage } from "@/lib/i18n";
import { load, save } from "@/lib/storage";
import { scheduleReview, getReviewRecords, type ReviewRecord } from "@/lib/srs";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Flag, MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type WordStatus = "new" | "practice" | "mastered";

const LEARNED_KEY = "jarman-learned-words";

const STATUS_META: Record<WordStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-gray-100 text-gray-700 ring-gray-200" },
  practice: { label: "Practice", className: "bg-accent/10 text-accent-700 ring-accent/30" },
  mastered: { label: "Mastered", className: "bg-success/10 text-success ring-success/30" },
};

export default function VocabularyPage() {
  const { t, currentLanguage } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [learned, setLearned] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openCategoryMenuId, setOpenCategoryMenuId] = useState<string | null>(null);
  const [reviewRecords, setReviewRecords] = useState<Record<string, ReviewRecord>>({});

  useEffect(() => {
    setLearned(load<Record<string, boolean>>(LEARNED_KEY) ?? {});
    setReviewRecords(getReviewRecords());
  }, []);

  useEffect(() => {
    const initial = searchParams.get("category");
    if (initial) setActiveCategory(initial);
  }, [searchParams]);

  const categories = useMemo(() => {
    const set = new Set(words.map((w) => w.category));
    return ["all", ...Array.from(set)];
  }, []);

  const categoryStats = useMemo(
    () =>
      categories.map((cat) => {
        const list = cat === "all" ? words : words.filter((w) => w.category === cat);
        const learnedCount = list.filter((w) => learned[w.id]).length;
        const percent = list.length ? Math.round((learnedCount / list.length) * 100) : 0;
        return { id: cat, label: cat === "all" ? "All words" : cat, count: list.length, learned: learnedCount, percent };
      }),
    [categories, learned],
  );

  const filteredWords = useMemo(() => {
    if (!activeCategory || activeCategory === "all") return words;
    return words.filter((w) => w.category === activeCategory);
  }, [activeCategory]);
  const activeLearned = useMemo(
    () => filteredWords.filter((w) => learned[w.id]).length,
    [filteredWords, learned],
  );

  const getStatus = (wordId: string): WordStatus => {
    if (learned[wordId]) return "mastered";
    const reviewRecord = reviewRecords[wordId];
    if (reviewRecord) return "practice";
    return "new";
  };

  const setStatus = (wordId: string, status: WordStatus) => {
    if (status === "mastered") {
      const next = { ...learned, [wordId]: true };
      setLearned(next);
      save(LEARNED_KEY, next);
      setReviewRecords((prev) => {
        const updated = { ...prev };
        delete updated[wordId];
        return updated;
      });
    } else if (status === "practice") {
      const record = scheduleReview(wordId, "medium");
      setReviewRecords((prev) => ({ ...prev, [wordId]: record }));
      const next = { ...learned };
      delete next[wordId];
      setLearned(next);
      save(LEARNED_KEY, next);
    } else {
      const next = { ...learned };
      delete next[wordId];
      setLearned(next);
      save(LEARNED_KEY, next);
      setReviewRecords((prev) => {
        const updated = { ...prev };
        delete updated[wordId];
        return updated;
      });
    }
    setOpenMenuId(null);
  };

  const setCategoryProgress = (catId: string, action: "reset" | "mastered") => {
    const list = catId === "all" ? words : words.filter((w) => w.category === catId);
    if (action === "mastered") {
      const next = { ...learned };
      list.forEach((w) => {
        next[w.id] = true;
      });
      setLearned(next);
      save(LEARNED_KEY, next);
    } else {
      const next = { ...learned };
      list.forEach((w) => {
        delete next[w.id];
      });
      setLearned(next);
      save(LEARNED_KEY, next);
      setReviewRecords((prev) => {
        const updated = { ...prev };
        list.forEach((w) => {
          delete updated[w.id];
        });
        return updated;
      });
    }
    setOpenCategoryMenuId(null);
  };

  const showWordList = Boolean(activeCategory);

  return (
    <div className="flex flex-col gap-6 pb-14">
      <div className="relative -mx-5 overflow-hidden rounded-b-3xl bg-gradient-to-br from-[#6ea5ff] via-[#7b7bff] to-[#2c7dff] px-6 pb-7 pt-7 text-white">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -left-16 top-8 h-40 w-40 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
        </div>
        <div className="relative flex items-center justify-between">
          {showWordList ? (
            <button
              onClick={() => setActiveCategory(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur"
              aria-label="Back to categories"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <span className="h-10 w-10" aria-hidden />
          )}
          <button
            onClick={() => setActiveCategory("all")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur"
            aria-label="All decks"
          >
            <Flag size={18} />
          </button>
        </div>

        <div className="relative mt-6 space-y-2">
          <h1 className="text-3xl font-bold leading-tight">
            {showWordList ? activeCategory === "all" ? "All Words" : activeCategory : t("nav.vocabulary")}
          </h1>
          <p className="text-sm text-white/80">
            {showWordList
              ? `${activeLearned}/${filteredWords.length} learned`
              : "Learn new words while playing through the cards."}
          </p>
        </div>

        <div className="relative mt-5 flex items-center gap-6 text-sm font-semibold">
          <button className="pb-2 text-white">
            All words
            <span className="mt-1 block h-1 w-10 rounded-full bg-yellow-300" />
          </button>
          <span className="pb-2 text-white/70">Marked</span>
          <span className="pb-2 text-white/70">My words</span>
        </div>
      </div>

      {!showWordList ? (
        <div className="space-y-3">
          {categoryStats.map((cat) => (
            <div
              key={cat.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveCategory(cat.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveCategory(cat.id);
                }
              }}
              className="relative flex min-h-[110px] w-full items-center justify-between gap-4 rounded-3xl bg-white px-5 py-4 text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex-1 space-y-2">
                <p className="text-lg font-semibold text-neutral-900">{cat.label}</p>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">{cat.learned} learned</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-600">{cat.count} total</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7b7bff] to-[#2c7dff]"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <span>
                  {cat.learned}/{cat.count}
                </span>
                <button
                  aria-label="Category options"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCategoryMenuId((prev) => (prev === cat.id ? null : cat.id));
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-black/5 transition hover:bg-primary/10"
                >
                  <MoreHorizontal size={16} />
                </button>
                {openCategoryMenuId === cat.id ? (
                  <div
                    className="absolute right-5 top-16 z-20 w-40 rounded-xl bg-white p-2 text-xs font-semibold text-neutral-900 shadow-lg ring-1 ring-black/5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCategory(cat.id);
                        setOpenCategoryMenuId(null);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-primary/5"
                    >
                      <span>Open deck</span>
                      <ChevronRight size={14} className="text-gray-400" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryProgress(cat.id, "mastered");
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-primary/5"
                    >
                      <span>Mark all mastered</span>
                      <Check size={14} className="text-success" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryProgress(cat.id, "reset");
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-primary/5"
                    >
                      <span>Reset progress</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-neutral-900">
              {activeCategory === "all" ? "All Words" : activeCategory}
            </h2>
            <span className="text-xs font-semibold text-primary">
              {activeLearned}/{filteredWords.length} learned
            </span>
          </div>
          <div className="space-y-2">
            {filteredWords.map((item) => {
              const status = getStatus(item.id);
              const meta = STATUS_META[status];
              return (
                <div
                  key={item.id}
                  className="flex min-h-[110px] w-full items-center justify-between gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/5"
                >
                  <button
                    onClick={() =>
                      router.push(`/vocabulary/${item.id}${activeCategory ? `?category=${activeCategory}` : ""}`)
                    }
                    className="flex flex-1 flex-col items-start text-left"
                  >
                    <p className="text-lg font-semibold text-neutral-900">{item.word}</p>
                    <p className="text-sm text-gray-600">
                      {currentLanguage === "fa" ? item.translation_fa : item.translation_en}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <span className={`rounded-full px-3 py-1 ring-1 ${meta.className}`}>{meta.label}</span>
                      <span className="text-gray-300">•</span>
                      <span>{t("home.lessonStatusLabel")}</span>
                    </div>
                  </button>
                  <div className="relative flex items-center gap-2">
                    <button
                      aria-label="Edit status"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId((prev) => (prev === item.id ? null : item.id));
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-black/5 transition hover:bg-primary/10"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === item.id ? (
                      <div
                        className="absolute right-0 top-10 z-20 w-36 rounded-xl bg-white p-2 text-xs font-semibold text-neutral-900 shadow-lg ring-1 ring-black/5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(
                          [
                            { id: "mastered", label: "Mark mastered" },
                            { id: "practice", label: "Need practice" },
                            { id: "new", label: "Reset to new" },
                          ] as { id: WordStatus; label: string }[]
                        ).map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatus(item.id, option.id);
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-primary/5"
                          >
                            <span>{option.label}</span>
                            {status === option.id ? <Check size={14} className="text-primary" /> : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
