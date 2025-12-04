"use client";

import { useMemo, useState } from "react";

export type VocabularyTab = "all" | "marked" | "my-words";

export type VocabularyNavState = {
  tab: VocabularyTab;
  categoryId?: string;
};

type InitialState = Partial<VocabularyNavState>;

export function useVocabularyNav(initial?: InitialState) {
  const initialState = useMemo<VocabularyNavState>(
    () => ({
      tab: initial?.tab ?? "all",
      categoryId: initial?.categoryId,
    }),
    [initial],
  );

  const [state, setState] = useState<VocabularyNavState>(initialState);

  const setTab = (tab: VocabularyTab) => {
    setState((prev) => ({
      tab,
      categoryId: tab === "all" ? prev.categoryId : undefined,
    }));
  };

  const openCategory = (categoryId: string) => {
    setState({ tab: "all", categoryId });
  };

  const backToCategories = () => {
    setState((prev) => ({ ...prev, tab: "all", categoryId: undefined }));
  };

  const reset = () => setState(initialState);

  return {
    state,
    setTab,
    openCategory,
    backToCategories,
    reset,
  };
}
