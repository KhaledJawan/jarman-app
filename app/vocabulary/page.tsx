"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { t } from "@/lib/i18n";

const VocabularyClient = dynamic(() => import("./VocabularyClient"), {
  ssr: false,
  loading: () => <div className="p-4 text-sm text-gray-500">{t("common.loading")}</div>,
});

export default function VocabularyPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-gray-500">{t("common.loading")}</div>}>
      <VocabularyClient />
    </Suspense>
  );
}
