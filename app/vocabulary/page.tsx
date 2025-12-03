"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const VocabularyClient = dynamic(() => import("./VocabularyClient"), {
  ssr: false,
  loading: () => <div className="p-4 text-sm text-gray-500">Loading vocabulary…</div>,
});

export default function VocabularyPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-gray-500">Loading vocabulary…</div>}>
      <VocabularyClient />
    </Suspense>
  );
}
