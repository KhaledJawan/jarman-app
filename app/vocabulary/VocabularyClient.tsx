"use client";

import a11 from "@/data/word/a11.json";
import a12 from "@/data/word/a12.json";
import a21 from "@/data/word/a21.json";
import a22 from "@/data/word/a22.json";
import b11 from "@/data/word/b11.json";
import b12 from "@/data/word/b12.json";
import b21 from "@/data/word/b21.json";
import b22 from "@/data/word/b22.json";
import c11 from "@/data/word/c11.json";
import c12 from "@/data/word/c12.json";
import { useLanguage } from "@/lib/i18n";
import { load, save } from "@/lib/storage";
import { scheduleReview, getReviewRecords, type ReviewRecord } from "@/lib/srs";
import { useRouter, useSearchParams } from "next/navigation";
import { TextEn, TextFa, TextDe } from "@/components/DirectionText";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useVocabularyNav } from "./useVocabularyNav";

type Word = Omit<(typeof a11)[number], "topics" | "category"> & { category?: string; topics?: string[] };
const allWords: Word[] = [...a11, ...a12, ...a21, ...a22, ...b11, ...b12, ...b21, ...b22, ...c11, ...c12];
type WordStatus = "new" | "practice" | "mastered";
type CustomWord = {
  id: string;
  word: string;
  translation_en?: string;
  translation_fa?: string;
  note?: string;
};

const LEARNED_KEY = "jarman-learned-words";
const MARKED_KEY = "jarman-marked-words";
const CUSTOM_WORDS_KEY = "jarman-custom-words";
const LEVEL_KEY = "jarman-level";

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1"] as const;

const TOPIC_LABELS: Record<
  string,
  {
    en: string;
    fa: string;
  }
> = {
  "Begrüßung & Höflichkeit": { en: "Greetings & Politeness", fa: "سلام و ادب" },
  "Persönliche Daten & Vorstellen": { en: "Personal Info & Introducing", fa: "اطلاعات شخصی و معرفی" },
  "Familie & Freunde": { en: "Family & Friends", fa: "خانواده و دوستان" },
  "Zahlen, Uhrzeit & Datum": { en: "Numbers, Time & Date", fa: "اعداد، ساعت و تاریخ" },
  "Wohnen & Haushalt": { en: "Living & Household", fa: "زندگی و خانه" },
  "Essen & Trinken": { en: "Food & Drinks", fa: "غذا و نوشیدنی" },
  "Einkaufen & Geld": { en: "Shopping & Money", fa: "خرید و پول" },
  "Stadt & Orientierung": { en: "City & Orientation", fa: "شهر و جهت‌یابی" },
  "Reisen & Verkehr": { en: "Travel & Transport", fa: "سفر و حمل‌ونقل" },
  "Körper & Gesundheit": { en: "Body & Health", fa: "بدن و سلامت" },
  "Schule, Kurs & Lernen": { en: "School & Learning", fa: "مدرسه و یادگیری" },
  "Arbeit & Beruf (einfach)": { en: "Work & Job (basic)", fa: "کار و شغل (ساده)" },
  "Hobbys & Freizeit": { en: "Hobbies & Free Time", fa: "سرگرمی و اوقات فراغت" },
  "Wetter & Jahreszeiten": { en: "Weather & Seasons", fa: "هوا و فصل‌ها" },
  "Alltag & Routinen": { en: "Everyday & Routines", fa: "روزمره و روال‌ها" },
  "Kommunikation & Reaktion": { en: "Communication & Reaction", fa: "ارتباط و واکنش" },
  "Grammatik & Funktionswörter": { en: "Grammar & Function Words", fa: "گرامر و کلمات کاربردی" },
};

const STATUS_META: Record<WordStatus, { labelKey: string; className: string }> = {
  new: { labelKey: "vocab.status.new", className: "bg-gray-100 text-gray-700 ring-gray-200" },
  practice: { labelKey: "vocab.status.practice", className: "bg-accent/10 text-accent-700 ring-accent/30" },
  mastered: { labelKey: "vocab.status.mastered", className: "bg-success/10 text-success ring-success/30" },
};

export default function VocabularyPage() {
  const { t, currentLanguage } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [learned, setLearned] = useState<Record<string, boolean>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [activeLevel, setActiveLevel] = useState<string>("A2");
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  const [customWords, setCustomWords] = useState<CustomWord[]>([]);
  const [showNewWordModal, setShowNewWordModal] = useState(false);
  const [newWord, setNewWord] = useState({ word: "", translation_en: "", translation_fa: "", note: "" });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openCategoryMenuId, setOpenCategoryMenuId] = useState<string | null>(null);
  const [reviewRecords, setReviewRecords] = useState<Record<string, ReviewRecord>>({});
  const normalizeLevel = (lvl: string) => lvl.split(".")[0];
  const getTopicLabel = (id: string) => {
    const label = TOPIC_LABELS[id];
    if (!label) return id;
    return currentLanguage === "fa" ? label.fa : label.en;
  };
  const initialCategory = searchParams.get("category") ?? undefined;
  const { state: nav, setTab, openCategory, backToCategories } = useVocabularyNav({
    tab: initialCategory ? "all" : "all",
    categoryId: initialCategory ?? undefined,
  });
  const levelOptions = useMemo(() => {
    const available = new Set(allWords.map((w) => normalizeLevel(w.level)));
    return LEVEL_ORDER.filter((lvl) => available.has(lvl));
  }, []);

  useEffect(() => {
    setLearned(load<Record<string, boolean>>(LEARNED_KEY) ?? {});
    setMarked(load<Record<string, boolean>>(MARKED_KEY) ?? {});
    setCustomWords(load<CustomWord[]>(CUSTOM_WORDS_KEY) ?? []);
    setReviewRecords(getReviewRecords());
    const savedLevel = load<string>(LEVEL_KEY);
    if (savedLevel) {
      setActiveLevel(normalizeLevel(savedLevel));
    }
  }, []);

  useEffect(() => {
    if (levelOptions.length === 0) return;
    if (!levelOptions.includes(activeLevel)) {
      setActiveLevel(levelOptions[0]);
    }
  }, [levelOptions, activeLevel]);

  const getWordCategories = (word: Word): string[] => {
    const fromTopics = Array.isArray(word.topics) ? word.topics.filter(Boolean) : [];
    if (fromTopics.length) return fromTopics;
    return word.category ? [word.category] : [];
  };

  const categories = useMemo(() => {
    const visibleWords = allWords.filter((w) => normalizeLevel(w.level) === activeLevel);
    const set = new Set<string>();
    visibleWords.forEach((w) => {
      getWordCategories(w).forEach((c) => set.add(c));
    });
    return Array.from(set).filter(Boolean).sort();
  }, [activeLevel]);

  const categoryStats = useMemo(() => {
    const visibleWords = allWords.filter((w) => normalizeLevel(w.level) === activeLevel);
    const buildStat = (id: string, label: string, list: typeof visibleWords) => {
      const learnedCount = list.filter((w) => learned[w.id]).length;
      const percent = list.length ? Math.round((learnedCount / Math.max(list.length, 1)) * 100) : 0;
      return { id, label, count: list.length, learned: learnedCount, percent };
    };
    const allStat = buildStat("all", t("vocab.category.all"), visibleWords);
    const others = categories.map((cat) => {
      const list = visibleWords.filter((w) => getWordCategories(w).includes(cat));
      return buildStat(cat, cat, list);
    });
    return [allStat, ...others];
  }, [categories, learned, activeLevel, t]);

  const activeTab = nav.tab;
  const activeCategory = activeTab === "all" ? nav.categoryId ?? "all" : activeTab;
  const showCategories = activeTab === "all" && !nav.categoryId;
  const showWordList = !showCategories;

  const filteredWords = useMemo(() => {
    const levelWords = allWords.filter((w) => normalizeLevel(w.level) === activeLevel);
    if (activeCategory === "all") return levelWords;
    if (activeCategory === "marked") return levelWords.filter((w) => marked[w.id]);
    if (activeCategory === "my-words") return customWords;
    return levelWords.filter((w) => getWordCategories(w).includes(activeCategory));
  }, [activeCategory, marked, customWords, activeLevel]);
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
    if (catId === "marked") {
      setTab("marked");
      setOpenCategoryMenuId(null);
      return;
    }
    const levelWords = allWords.filter((w) => normalizeLevel(w.level) === activeLevel);
    const list = catId === "all" ? levelWords : levelWords.filter((w) => getWordCategories(w).includes(catId));
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

  const toggleMarked = (wordId: string) => {
    const next = { ...marked };
    if (next[wordId]) {
      delete next[wordId];
    } else {
      next[wordId] = true;
    }
    setMarked(next);
    save(MARKED_KEY, next);
  };

  const addCustomWord = () => {
    if (!newWord.word.trim()) return;
    const entry: CustomWord = {
      id: `custom-${Date.now()}`,
      word: newWord.word.trim(),
      translation_en: newWord.translation_en.trim() || undefined,
      translation_fa: newWord.translation_fa.trim() || undefined,
      note: newWord.note.trim() || undefined,
    };
    const next = [entry, ...customWords];
    setCustomWords(next);
    save(CUSTOM_WORDS_KEY, next);
    setNewWord({ word: "", translation_en: "", translation_fa: "", note: "" });
    setShowNewWordModal(false);
  };

  const changeLevel = (level: string) => {
    setActiveLevel(level);
    save(LEVEL_KEY, level);
    setShowLevelMenu(false);
    setTab("all");
    backToCategories();
  };

  const removeCustomWord = (id: string) => {
    const next = customWords.filter((w) => w.id !== id);
    setCustomWords(next);
    save(CUSTOM_WORDS_KEY, next);
  };

  return (
    <div className="flex flex-col gap-6 pb-14 -mt-6">
      {showNewWordModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">{t("vocab.modal.title")}</h3>
              <button
                onClick={() => setShowNewWordModal(false)}
                className="text-sm font-semibold text-gray-500 transition hover:text-primary"
              >
                {t("common.close")}
              </button>
            </div>
            <div className="space-y-3">
              {(
                [
                  { id: "word", label: t("vocab.modal.word"), placeholder: t("vocab.modal.wordPlaceholder") },
                  { id: "translation_en", label: t("vocab.modal.en"), placeholder: t("vocab.modal.enPlaceholder") },
                  { id: "translation_fa", label: t("vocab.modal.fa"), placeholder: t("vocab.modal.faPlaceholder") },
                ] as const
              ).map((field) => (
                <div key={field.id}>
                  <label className="text-xs font-semibold text-gray-700">{field.label}</label>
                  <input
                    value={(newWord as any)[field.id]}
                    onChange={(e) => setNewWord((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none ring-1 ring-transparent transition focus:border-primary focus:ring-primary/20 placeholder:text-gray-400"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-700">{t("vocab.modal.note")}</label>
                <textarea
                  value={newWord.note}
                  onChange={(e) => setNewWord((prev) => ({ ...prev, note: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none ring-1 ring-transparent transition focus:border-primary focus:ring-primary/20 placeholder:text-gray-400"
                  placeholder={t("vocab.modal.notePlaceholder")}
                  rows={3}
                />
              </div>
              <button
                onClick={addCustomWord}
                disabled={!newWord.word.trim()}
                className={`w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition ${
                  newWord.word.trim() ? "bg-primary hover:bg-primary/90" : "bg-gray-300"
                }`}
              >
                {t("vocab.modal.save")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="relative -mx-5 overflow-visible rounded-b-3xl bg-gradient-to-br from-[#6ea5ff] via-[#7b7bff] to-[#2c7dff] px-6 pb-7 pt-7 text-white">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -left-16 top-8 h-40 w-40 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
        </div>
        <div className="relative flex items-center justify-between">
          {activeTab === "all" && !showCategories ? (
            <button
              data-id="vocabulary-back-hero"
              onClick={backToCategories}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur transition hover:bg-white/25"
              aria-label={t("vocab.backToCategories")}
            >
              <ChevronRight className="-scale-x-100" size={18} />
            </button>
          ) : (
            <span className="h-10 w-10" aria-hidden />
          )}
          <div className="relative">
            <button
              onClick={() => setShowLevelMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur transition hover:bg-white/25"
            >
              {t("vocab.levelLabel")} {activeLevel}
              <ChevronDown size={14} />
            </button>
            {showLevelMenu ? (
              <div className="absolute right-0 top-11 z-20 w-32 rounded-xl bg-white p-2 text-sm font-semibold text-neutral-900 shadow-lg ring-1 ring-black/5">
                {levelOptions.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => changeLevel(lvl)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-start transition hover:bg-primary/10 ${
                      lvl === activeLevel ? "text-primary" : "text-neutral-900"
                    }`}
                  >
                    <span>{lvl}</span>
                    {lvl === activeLevel ? <span className="text-primary">•</span> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative mt-6 space-y-2">
          <h1 className="text-3xl font-bold leading-tight">{t("nav.vocabulary")}</h1>
          <p className="text-sm text-white/80">
            {showWordList
              ? `${activeLearned}/${filteredWords.length} ${t("vocab.learnedLabel")}`
              : t("vocab.heroSubtitle")}
          </p>
        </div>

        <div className="relative mt-5 flex items-center gap-6 text-sm font-semibold">
          <button
            data-id="vocabulary-tab-all"
            className={`pb-2 text-white ${activeTab === "all" ? "" : "text-white/70"}`}
            onClick={() => {
              setTab("all");
              backToCategories();
            }}
          >
            {t("vocab.tab.all")}
            {activeTab === "all" ? <span className="mt-1 block h-1 w-10 rounded-full bg-yellow-300" /> : null}
          </button>
          <button
            data-id="vocabulary-tab-marked"
            className={`pb-2 ${activeTab === "marked" ? "text-white" : "text-white/70"}`}
            onClick={() => {
              setTab("marked");
            }}
          >
            {t("vocab.tab.marked")}
            {activeTab === "marked" ? <span className="mt-1 block h-1 w-10 rounded-full bg-yellow-300" /> : null}
          </button>
          <button
            data-id="vocabulary-tab-my-words"
            className={`pb-2 ${activeTab === "my-words" ? "text-white" : "text-white/70"}`}
            onClick={() => {
              setTab("my-words");
            }}
          >
            {t("vocab.tab.myWords")}
            {activeTab === "my-words" ? <span className="mt-1 block h-1 w-10 rounded-full bg-yellow-300" /> : null}
          </button>
        </div>
      </div>

      {!showWordList ? (
        <div className="space-y-3">
          {categoryStats.length === 0 ? (
            <div className="rounded-3xl bg-white px-5 py-4 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-black/5">
              {t("vocab.empty.categories")}
            </div>
          ) : null}
          {categoryStats.map((cat) => (
            <div
              key={`${activeLevel}-${cat.id}`}
              role="button"
              tabIndex={0}
              data-id={`category-card-${cat.id}`}
              onClick={() => openCategory(cat.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openCategory(cat.id);
                }
              }}
              className="relative w-full rounded-3xl bg-white px-5 py-4 text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <p className="text-lg font-semibold text-neutral-900">{getTopicLabel(cat.label)}</p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                      {cat.learned}/{cat.count} {t("vocab.wordsLabel")}
                    </span>
                    <span className="rounded-full bg-neutralLight px-2 py-1 text-gray-600">
                      {cat.percent}% {t("vocab.learnedLabel")}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7b7bff] to-[#2c7dff]"
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
                {cat.id !== "marked" ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                    <button
                      aria-label={t("vocab.category.options")}
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
                            openCategory(cat.id);
                            setOpenCategoryMenuId(null);
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-start hover:bg-primary/5"
                        >
                          <span>{t("vocab.category.open")}</span>
                          <ChevronRight size={14} className="text-gray-400" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryProgress(cat.id, "mastered");
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-start hover:bg-primary/5"
                        >
                          <span>{t("vocab.category.markAll")}</span>
                          <Check size={14} className="text-success" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryProgress(cat.id, "reset");
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-start hover:bg-primary/5"
                        >
                          <span>{t("vocab.category.reset")}</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : activeCategory === "my-words" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-neutral-900">{t("vocab.tab.myWords")}</h2>
            <button
              type="button"
              onClick={() => setShowNewWordModal(true)}
              data-id="mywords-add-button"
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              {t("vocab.newWord")}
            </button>
          </div>
          {customWords.length === 0 ? (
            <div className="rounded-3xl bg-white px-5 py-4 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-black/5">
              {t("vocab.empty.myWords")}
            </div>
          ) : (
            <div className="space-y-2">
              {customWords.map((item) => (
                <div
                  key={item.id}
                  data-id={`myword-card-${item.id}`}
                  className="flex min-h-[110px] w-full flex-col gap-2 rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-neutral-900">{item.word}</p>
                      <p className="text-sm text-gray-600">
                        {currentLanguage === "fa" ? (
                          <TextFa className="text-sm text-gray-600">
                            {item.translation_fa ?? item.translation_en ?? ""}
                          </TextFa>
                        ) : (
                          <TextEn className="text-sm text-gray-600">
                            {item.translation_en ?? item.translation_fa ?? ""}
                          </TextEn>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={t("vocab.myWords.delete")}
                      onClick={() => removeCustomWord(item.id)}
                      className="rounded-full bg-neutralLight p-2 text-gray-500 transition hover:bg-error/10 hover:text-error"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {item.note ? <p className="text-xs text-gray-500">{item.note}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-neutral-900">
              {activeCategory === "all"
                ? t("vocab.category.all")
                : activeCategory === "marked"
                  ? t("vocab.tab.marked")
                  : activeCategory === "my-words"
                    ? t("vocab.tab.myWords")
                    : getTopicLabel(activeCategory)}
            </h2>
            <span className="text-xs font-semibold text-primary">
              {activeLearned}/{filteredWords.length} {t("vocab.learnedLabel")}
            </span>
          </div>
          {filteredWords.length === 0 ? (
            <div className="rounded-3xl bg-white px-5 py-4 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-black/5">
              {activeCategory === "marked"
                ? t("vocab.empty.marked")
                : activeCategory === "my-words"
                  ? t("vocab.empty.myWords")
                  : t("vocab.empty.generic")}
            </div>
          ) : null}
          <div className="space-y-2">
            {filteredWords.map((item) => {
              const status = getStatus(item.id);
              const meta = STATUS_META[status];
              const isMarked = !!marked[item.id];
              return (
                <div
                  key={item.id}
                  data-id={`vocabulary-card-${item.id}`}
                  className="flex min-h-[110px] w-full items-center justify-between gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/5"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      router.push(`/vocabulary/${item.id}${activeCategory ? `?category=${activeCategory}` : ""}`)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/vocabulary/${item.id}${activeCategory ? `?category=${activeCategory}` : ""}`);
                      }
                    }}
                    className="flex flex-1 flex-col items-start text-left"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-neutral-900">{item.word}</p>
                      <button
                        type="button"
                        aria-label={isMarked ? t("vocab.aria.unmarkWord") : t("vocab.aria.markWord")}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMarked(item.id);
                        }}
                        className="rounded-full bg-neutralLight p-1 text-gray-500 transition hover:bg-primary/10 hover:text-primary"
                      >
                        {isMarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      {currentLanguage === "fa" ? (
                        <TextFa className="text-sm text-gray-600">{item.translation_fa}</TextFa>
                      ) : (
                        <TextEn className="text-sm text-gray-600">{item.translation_en}</TextEn>
                      )}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <span className={`rounded-full px-3 py-1 ring-1 ${meta.className}`}>{t(meta.labelKey)}</span>
                      <span className="text-gray-300">•</span>
                      <span>{t("home.lessonStatusLabel")}</span>
                    </div>
                  </div>
                  <div className="relative flex items-center gap-2">
                    <button
                      aria-label={isMarked ? t("vocab.aria.unmarkWord") : t("vocab.aria.markWord")}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMarked(item.id);
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${isMarked ? "bg-primary/10 text-primary" : "bg-white text-gray-700"} shadow-sm ring-1 ring-black/5 transition hover:bg-primary/10`}
                    >
                      {isMarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </button>
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
                            { id: "mastered", label: t("vocab.menu.markMastered") },
                            { id: "practice", label: t("vocab.menu.needPractice") },
                            { id: "new", label: t("vocab.menu.reset") },
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
