"use client";

import words from "@/data/word/a11.json";
import { useLanguage } from "@/lib/i18n";
import { readJSON, writeJSON } from "@/lib/storage";
import { scheduleReview, type Difficulty, getReviewRecord } from "@/lib/srs";
import { Check, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

type Word = (typeof words)[number];

const LEARNED_KEY = "jarman-learned-words";

export default function VocabularyPage() {
  const { t, currentLanguage } = useLanguage();
  const [index, setIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [learned, setLearned] = useState<Record<string, boolean>>({});
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    setLearned(readJSON<Record<string, boolean>>(LEARNED_KEY, {}));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(words.map((w) => w.category));
    return ["all", ...Array.from(set)];
  }, []);

  const filteredWords = useMemo(
    () => (activeCategory === "all" ? words : words.filter((w) => w.category === activeCategory)),
    [activeCategory],
  );

  const word = useMemo<Word>(() => filteredWords[index] ?? filteredWords[0] ?? words[0], [filteredWords, index]);

  useEffect(() => {
    setIndex(0);
  }, [activeCategory]);

  const toggleLearned = () => {
    const next = { ...learned, [word.id]: true };
    setLearned(next);
    writeJSON(LEARNED_KEY, next);
  };

  const changeCard = (delta: number) => {
    setShowTranslation(false);
    setReviewMessage(null);
    setIndex((prev) => {
      const nextIndex = prev + delta;
      if (nextIndex < 0) return filteredWords.length - 1;
      if (nextIndex >= filteredWords.length) return 0;
      return nextIndex;
    });
  };

  const playAudio = () => {
    if (word?.audio && typeof window !== "undefined") {
      const audio = new Audio(word.audio);
      audio.play().catch(() => {});
    }
  };

  const markDifficulty = (difficulty: Difficulty) => {
    if (!word) return;
    const record = scheduleReview(word.id, difficulty);
    const nextReview = new Date(record.nextReview).toLocaleDateString();
    setReviewMessage(`${t("vocab.difficulty")}: ${nextReview}`);
  };

  const translation = currentLanguage === "fa" ? word.translation_fa : word.translation_en;
  const reviewRecord = word ? getReviewRecord(word.id) : null;

  const heroBg =
    word?.image && word.image.length > 0
      ? { backgroundImage: `url(${word.image})` }
      : { backgroundImage: "linear-gradient(135deg,#dff1ff,#ffe4c4)" };

  return (
    <div className="flex flex-col gap-5 pb-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900">{t("vocab.heading")}</h1>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pill whitespace-nowrap ring-1 ring-black/5 ${
                activeCategory === cat ? "bg-primary text-white shadow-md" : "bg-white text-gray-700"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </header>

      <div className="card-surface overflow-hidden">
        <div className="relative h-48 w-full overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={heroBg as CSSProperties}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-black/5" />
          <div className="relative flex h-full items-end justify-between px-4 pb-3 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide">{word?.level}</p>
              <p className="text-3xl font-bold">{word?.word}</p>
              <p className="text-xs text-white/80">{word?.example}</p>
            </div>
            {word?.audio ? (
              <button
                onClick={playAudio}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg"
              >
                <Play size={20} />
              </button>
            ) : null}
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
              {currentLanguage === "fa" ? word?.translation_en : word?.translation_fa}
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
