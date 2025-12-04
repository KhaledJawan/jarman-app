"use client";

import wordsData from "@/data/word/a11.json";
import { useLanguage } from "@/lib/i18n";
import { load, save } from "@/lib/storage";
import { scheduleReview, type Difficulty, getReviewRecords, type ReviewRecord } from "@/lib/srs";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Bookmark, BookmarkCheck, Check, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

type Word = Omit<(typeof wordsData)[number], "topics" | "category"> & { topics?: string[]; category?: string };

const words: Word[] = wordsData;

const LEARNED_KEY = "jarman-learned-words";
const MARKED_KEY = "jarman-marked-words";

export default function VocabularyFlashcardPage() {
  const { t, currentLanguage } = useLanguage();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isBrowser = typeof window !== "undefined";

  const [index, setIndex] = useState(0);
  const [learned, setLearned] = useState<Record<string, boolean>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewRecords, setReviewRecords] = useState<Record<string, ReviewRecord>>({});

  const category = searchParams.get("category") ?? "all";
  const categoryLabel = category === "all" ? t("vocab.tab.all") : category === "marked" ? t("vocab.tab.marked") : category;

  useEffect(() => {
    setLearned(load<Record<string, boolean>>(LEARNED_KEY) ?? {});
    setMarked(load<Record<string, boolean>>(MARKED_KEY) ?? {});
    setReviewRecords(getReviewRecords());
  }, []);

  const filteredWords = useMemo(() => {
    if (!category || category === "all") return words;
    return words.filter((w) => w.category === category);
  }, [category, words]);

  const initialIndex = useMemo(() => {
    const idx = filteredWords.findIndex((w) => w.id === params.id);
    return idx >= 0 ? idx : 0;
  }, [filteredWords, params.id]);

  useEffect(() => {
    setIndex(initialIndex);
    setReviewMessage(null);
  }, [initialIndex]);

  const word = filteredWords[index] ?? filteredWords[0];
  const translation = currentLanguage === "fa" ? word?.translation_fa : word?.translation_en;
  const reviewRecord = word ? reviewRecords[word.id] ?? null : null;
  const isMarked = word ? !!marked[word.id] : false;

  const toggleLearned = () => {
    if (!word) return;
    const next = { ...learned, [word.id]: true };
    setLearned(next);
    save(LEARNED_KEY, next);
  };

  const toggleMarked = () => {
    if (!word) return;
    const next = { ...marked };
    if (next[word.id]) {
      delete next[word.id];
    } else {
      next[word.id] = true;
    }
    setMarked(next);
    save(MARKED_KEY, next);
  };

  const changeCard = (delta: number) => {
    setReviewMessage(null);
    setIndex((prev) => {
      const nextIndex = prev + delta;
      if (nextIndex < 0) return filteredWords.length - 1;
      if (nextIndex >= filteredWords.length) return 0;
      return nextIndex;
    });
  };

  const playAudio = () => {
    if (word?.audio && isBrowser) {
      const audio = new Audio(word.audio);
      audio.play().catch(() => {});
    }
  };

  const markDifficulty = (difficulty: Difficulty) => {
    if (!word) return;
    const record = scheduleReview(word.id, difficulty);
    setReviewRecords((prev) => ({ ...prev, [word.id]: record }));
    const nextReview = new Date(record.nextReview).toLocaleDateString();
    setReviewMessage(`${t("vocab.difficulty")}: ${nextReview}`);
  };

  const heroBg: CSSProperties =
    word?.image && word.image.length > 0
      ? { backgroundImage: `url(${word.image})` }
      : { backgroundImage: "linear-gradient(135deg,#dff1ff,#ffe4c4)" };

  if (!word) {
    return (
      <div className="flex flex-col gap-4 pb-12">
        <p className="text-lg font-semibold text-neutral-900">{t("vocab.empty.generic")}</p>
        <Link href="/vocabulary" className="text-primary underline">
          {t("vocab.backToList")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-12">
      <div className="flex items-center gap-2">
        <Link
          href={`/vocabulary${category ? `?category=${category}` : ""}`}
          className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm ring-1 ring-black/5 transition hover:bg-primary/10"
        >
          ← {t("nav.vocabulary")}
        </Link>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {categoryLabel}
        </span>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="relative h-48 w-full overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={heroBg}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-black/5" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 bottom-[-20px] h-44 w-44 rounded-full bg-white/25 blur-3xl" />
            <div className="absolute left-10 bottom-6 h-32 w-32 rounded-3xl bg-primary/30 opacity-70 blur-2xl" />
            <div className="absolute right-6 top-6 h-28 w-28 rounded-full bg-accent/25 blur-2xl" />
          </div>
          <div className="relative flex h-full items-end justify-between px-4 pb-3 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide">{word.level}</p>
              <p className="text-3xl font-bold">{word.word}</p>
              <p className="text-xs text-white/80">{word.example}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={isMarked ? t("vocab.aria.unmarkWord") : t("vocab.aria.markWord")}
                onClick={toggleMarked}
                className={`flex h-10 w-10 items-center justify-center rounded-full ${isMarked ? "bg-primary/90 text-white" : "bg-white/90 text-primary"} shadow-lg`}
              >
                {isMarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </button>
              {word.audio ? (
                <button
                  onClick={playAudio}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg"
                >
                  <Play size={20} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-4 py-4">
          <div className="rounded-2xl bg-primary/10 px-3 py-2 text-sm">
            <p className="text-xs text-gray-600">{currentLanguage === "fa" ? "FA" : "EN"}</p>
            <p className="font-semibold text-neutral-900">{translation}</p>
          </div>
          <div className="rounded-2xl bg-accent/10 px-3 py-2 text-sm">
            <p className="text-xs text-gray-600">{currentLanguage === "fa" ? "EN" : "FA"}</p>
            <p className="font-semibold text-neutral-900">
              {currentLanguage === "fa" ? word.translation_en : word.translation_fa}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pb-4">
          <button
            onClick={() => changeCard(-1)}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-black/5 transition hover:bg-neutralLight"
          >
            <ChevronLeft size={18} /> {t("vocab.prev")}
          </button>
          <div className="flex items-center gap-2">
            {learned[word.id] ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success ring-1 ring-success/30">
                <Check size={14} /> {t("vocab.learned")}
              </span>
            ) : null}
            <button
              onClick={() => changeCard(1)}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
            >
              {t("vocab.next")} <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="border-t border-neutralLight px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleLearned}
              className="rounded-full bg-success px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-success/90"
            >
              {t("vocab.markLearned")}
            </button>
            <div className="flex items-center gap-2 rounded-full bg-neutralLight px-3 py-2 text-xs font-semibold text-neutral-900">
              <span>{t("vocab.difficulty")}</span>
              {(["easy", "medium", "hard"] as Difficulty[]).map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => markDifficulty(difficulty)}
                  className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold shadow-sm ring-1 ring-black/5 transition hover:bg-primary/10"
                >
                  {t(`vocab.${difficulty}`)}
                </button>
              ))}
            </div>
          </div>
          {reviewRecord ? (
            <p className="mt-2 text-xs text-gray-500">
              {t("vocab.difficulty")}: {new Date(reviewRecord.nextReview).toLocaleDateString()}
            </p>
          ) : null}
          {reviewMessage ? <p className="mt-1 text-xs text-gray-500">{reviewMessage}</p> : null}
        </div>
      </div>
    </div>
  );
}
