"use client";

import { useLanguage } from "@/lib/i18n";
import { load, save } from "@/lib/storage";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type LevelOption = {
  id: string;
  titleKey: string;
  descriptionKey: string;
};

const LEVEL_STORAGE_KEY = "jarman-level";

const LEVEL_OPTIONS: LevelOption[] = [
  { id: "beginner", titleKey: "onboarding.level.beginner.title", descriptionKey: "onboarding.level.beginner.desc" },
  { id: "A", titleKey: "onboarding.level.a.title", descriptionKey: "onboarding.level.a.desc" },
  { id: "B", titleKey: "onboarding.level.b.title", descriptionKey: "onboarding.level.b.desc" },
  { id: "C", titleKey: "onboarding.level.c.title", descriptionKey: "onboarding.level.c.desc" },
];

export default function LevelPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  useEffect(() => {
    const saved = load<string>(LEVEL_STORAGE_KEY);
    const isValid = LEVEL_OPTIONS.some((opt) => opt.id === saved);
    setSelectedLevel(isValid ? saved : null);
  }, []);

  const levels = useMemo(
    () =>
      LEVEL_OPTIONS.map((item) => ({
        ...item,
        title: t(item.titleKey),
        description: t(item.descriptionKey),
      })),
    [t],
  );

  const handleContinue = () => {
    if (!selectedLevel) return;
    save(LEVEL_STORAGE_KEY, selectedLevel);
    router.push("/home");
  };

  return (
    <div className="flex min-h-[calc(100vh-96px)] flex-col justify-between gap-8 pb-8 pt-2">
      <div className="space-y-6">
        <div className="card-surface relative flex items-start gap-3 overflow-hidden p-4">
          <div className="absolute -left-6 -top-10 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
          <div className="absolute -right-6 -bottom-10 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
          <div className="relative flex shrink-0 items-center justify-center">
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-primary/70 via-primary to-primary/90 shadow-xl ring-1 ring-black/10" />
              <div className="absolute inset-2 rounded-[24px] bg-white/15 shadow-inner backdrop-blur" />
              <div className="absolute left-6 top-7 flex gap-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                  <div className="h-2 w-2 rounded-full bg-neutral-900" />
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                  <div className="h-2 w-2 rounded-full bg-neutral-900" />
                </div>
              </div>
              <div className="absolute left-9 top-16 h-1.5 w-10 rounded-full bg-neutral-900/80" />
              <div className="absolute -left-1 bottom-4 h-4 w-4 rounded-full bg-primary/70" />
              <div className="absolute -right-1 bottom-4 h-4 w-4 rounded-full bg-primary/70" />
            </div>
          </div>
          <div className="relative w-full">
            <div className="absolute left-6 top-8 h-6 w-6 rotate-45 rounded-xl bg-white shadow-md ring-1 ring-black/5" />
            <div className="relative rounded-2xl bg-white px-4 py-3 shadow-md ring-1 ring-black/5">
              <p className="text-base font-semibold text-neutral-900">{t("onboarding.level.heading")}</p>
              <p className="mt-1 text-sm text-gray-600">{t("onboarding.level.subheading")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {levels.map((level) => {
            const isActive = selectedLevel === level.id;
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => setSelectedLevel(level.id)}
                className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                  isActive
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-transparent bg-white shadow-sm ring-1 ring-black/5 hover:-translate-y-0.5 hover:ring-primary/20"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <div
                    className={`h-8 w-10 rounded-b-[18px] ${
                      isActive ? "bg-primary" : "bg-primary/60"
                    }`}
                    style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900">{level.title}</p>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </div>
                <Check
                  size={18}
                  className={isActive ? "text-primary drop-shadow-sm" : "text-gray-300"}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!selectedLevel}
        className={`inline-flex w-full items-center justify-center rounded-2xl px-4 py-4 text-base font-semibold text-white shadow-lg shadow-primary/20 transition ${
          selectedLevel ? "bg-primary hover:bg-primary/90" : "bg-gray-300"
        }`}
      >
        {t("onboarding.level.continue")}
      </button>
    </div>
  );
}
