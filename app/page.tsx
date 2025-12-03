"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { Languages } from "lucide-react";

export default function LandingPage() {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const toggleLang = () => setLanguage(currentLanguage === "fa" ? "en" : "fa");

  return (
    <div className="relative flex min-h-[calc(100vh-72px)] flex-col gap-8 pb-10 pt-4">
      <div className="flex items-center justify-end">
        <button
          onClick={toggleLang}
          className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-md ring-1 ring-black/5 transition hover:bg-primary/10"
        >
          <Languages size={16} />
          {currentLanguage === "fa" ? t("landing.switchToEn") : t("landing.switchToFa")}
        </button>
      </div>

      <div className="card-surface relative overflow-hidden">
        <div className="absolute -left-6 -top-8 h-28 w-28 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-6 -bottom-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-col items-center gap-4 px-6 pb-8 pt-6 text-center">
          <p className="text-xl font-semibold text-neutral-900">{t("landing.greeting")}</p>
          <div className="relative h-44 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-white to-accent/25 ring-1 ring-black/5">
            <div className="absolute inset-0 flex items-end justify-center gap-6 pb-4">
              <div className="h-28 w-20 rounded-[30px] bg-white shadow-lg ring-1 ring-black/5">
                <div className="mx-auto mt-4 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-inner" />
                <div className="mx-auto mt-2 h-2 w-12 rounded-full bg-primary/70" />
              </div>
              <div className="h-32 w-24 rounded-[32px] bg-gradient-to-b from-primary/70 to-primary shadow-lg ring-1 ring-black/10" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-neutralLight px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-black/5">
            <span className="inline-block h-2 w-2 rounded-full bg-success" />
            Jarman
          </div>
          <p className="text-sm text-gray-700">{t("landing.tagline")}</p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Link
          href="/level"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90"
        >
          {t("landing.getStarted")}
        </Link>
        <Link
          href="/profile"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-4 text-base font-semibold text-neutral-900 shadow-md ring-1 ring-black/5 transition hover:bg-neutralLight"
        >
          {t("landing.signIn")}
        </Link>
      </div>
    </div>
  );
}
