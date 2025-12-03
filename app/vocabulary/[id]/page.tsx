"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const VocabularyFlashcardClient = dynamic(() => import("./VocabularyFlashcardClient"), {
  ssr: false,
  loading: () => <div className="p-4 text-sm text-gray-500">Loading card…</div>,
});

export default function VocabularyFlashcardPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-gray-500">Loading card…</div>}>
      <VocabularyFlashcardClient />
    </Suspense>
  );
}
