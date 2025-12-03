"use client";

import words from "@/data/word/a11.json";
import { useLanguage } from "@/lib/i18n";
import { load, save } from "@/lib/storage";
import { LogOut, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STATS_KEY = "jarman-stats";
const LEARNED_KEY = "jarman-learned-words";

export default function ProfilePage() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const [stats, setStats] = useState({ xp: 24, streak: 3 });
  const [learnedWords, setLearnedWords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setStats(load(STATS_KEY) ?? { xp: 24, streak: 3 });
    setLearnedWords(load(LEARNED_KEY) ?? {});
  }, []);

  const learnedCount = useMemo(() => Object.keys(learnedWords).length, [learnedWords]);

  const toggleLanguage = (lang: "fa" | "en") => {
    setLanguage(lang);
    save("jarman-language", lang);
  };

  return (
    <div className="flex flex-col gap-5 pb-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">{t("profile.title")}</h1>
        <LogOut size={18} className="text-gray-400" />
      </header>

      <section className="card-surface relative overflow-hidden px-4 py-5">
        <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-inner ring-1 ring-black/5">
            <User size={32} />
          </div>
          <div className="grid w-full grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-black/5">
              <p className="text-xs text-gray-500">{t("profile.xp")}</p>
              <p className="text-lg font-semibold text-neutral-900">{stats.xp}</p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-black/5">
              <p className="text-xs text-gray-500">{t("profile.streak")}</p>
              <p className="text-lg font-semibold text-neutral-900">{stats.streak}</p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-black/5">
              <p className="text-xs text-gray-500">{t("profile.learnedWords")}</p>
              <p className="text-lg font-semibold text-neutral-900">
                {learnedCount}/{words.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="card-surface px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">{t("profile.language")}</p>
            <p className="text-lg font-semibold text-neutral-900">
              {currentLanguage === "fa" ? t("profile.language.fa") : t("profile.language.en")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggleLanguage("fa")}
              className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-black/5 transition ${
                currentLanguage === "fa" ? "bg-primary text-white" : "bg-neutralLight text-neutral-900"
              }`}
            >
              FA
            </button>
            <button
              onClick={() => toggleLanguage("en")}
              className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-black/5 transition ${
                currentLanguage === "en" ? "bg-primary text-white" : "bg-neutralLight text-neutral-900"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
