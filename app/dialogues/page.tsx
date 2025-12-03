"use client";

import dialogues from "@/data/dialogues.json";
import { useLanguage } from "@/lib/i18n";
import { load, save } from "@/lib/storage";
import { Play, RotateCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Dialogue = (typeof dialogues)[number];
type Step = Dialogue["steps"][number];

const COMPLETED_KEY = "jarman-dialogues-completed";

export default function DialoguesPage() {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const isBrowser = typeof window !== "undefined";

  useEffect(() => {
    const stored = load<Record<string, boolean>>(COMPLETED_KEY);
    setCompleted(stored ?? {});
  }, []);

  const activeDialogue = useMemo<Dialogue | null>(
    () => dialogues.find((d) => d.id === activeId) ?? null,
    [activeId],
  );

  const playAudio = (step: Step) => {
    if ("audio" in step && step.audio && isBrowser) {
      const audio = new Audio(step.audio as string);
      audio.play().catch(() => {});
    }
  };

  const handleChoice = (correct: boolean) => {
    setFeedback(correct ? t("dialogues.correct") : t("dialogues.wrong"));
    if (correct) {
      setTimeout(() => setStepIndex((prev) => prev + 1), 400);
    }
  };

  const nextStep = () => {
    if (!activeDialogue) return;
    const nextIndex = stepIndex + 1;
    if (nextIndex >= activeDialogue.steps.length) {
      const next = { ...completed, [activeDialogue.id]: true };
      setCompleted(next);
      save(COMPLETED_KEY, next);
      setFeedback(null);
      return;
    }
    setStepIndex(nextIndex);
    setFeedback(null);
  };

  const resetDialogue = () => {
    setStepIndex(0);
    setFeedback(null);
  };

  return (
    <div className="flex flex-col gap-5 pb-12">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-neutral-900">{t("dialogues.heading")}</h1>
        <p className="text-sm text-gray-600">{t("dialogues.choose")}</p>
      </header>

      <div className="flex flex-col gap-3">
        {dialogues.map((dialogue) => (
          <button
            key={dialogue.id}
            onClick={() => {
              setActiveId(dialogue.id);
              resetDialogue();
            }}
            className="card-surface flex items-center justify-between px-4 py-3 text-left transition hover:-translate-y-0.5"
          >
            <div>
              <p className="text-sm font-semibold text-neutral-900">{dialogue.scene}</p>
              <p className="text-xs text-gray-500">{dialogue.level}</p>
            </div>
            {completed[dialogue.id] ? (
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                {t("dialogues.correct")}
              </span>
            ) : (
              <span className="text-sm font-medium text-primary">{t("dialogues.start")}</span>
            )}
          </button>
        ))}
      </div>

      {activeDialogue ? (
        <div className="card-surface px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{activeDialogue.level}</p>
              <h2 className="text-lg font-semibold text-neutral-900">{activeDialogue.scene}</h2>
            </div>
            <button
              onClick={resetDialogue}
              className="rounded-full bg-neutralLight p-2 text-gray-600 transition hover:bg-neutralLight/70"
            >
              <RotateCw size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {activeDialogue.steps.slice(0, stepIndex + 1).map((step, idx) => {
              const isCurrent = idx === stepIndex;
              const isChoice = "type" in step && step.type === "choice";
              return (
                <div key={idx} className={`rounded-xl px-3 py-3 ${isCurrent ? "bg-neutralLight" : "bg-neutralLight/60"}`}>
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold text-neutral-900">
                    <span>{step.speaker?.trim() ?? ""}</span>
                    {"audio" in step && step.audio ? (
                      <button
                        onClick={() => playAudio(step)}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-primary shadow-sm ring-1 ring-black/5"
                      >
                        <Play size={14} />
                        {t("home.playAudio")}
                      </button>
                    ) : null}
                  </div>
                  {isChoice ? (
                    <div className="flex flex-col gap-2">
                      {step.choices?.map((choice, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleChoice(!!choice.correct)}
                          className="rounded-xl bg-white px-3 py-2 text-left text-sm font-medium shadow-sm ring-1 ring-black/5 transition hover:bg-primary/10"
                        >
                          <p className="font-semibold text-neutral-900">{choice.de}</p>
                          <p className="text-xs text-gray-600">{choice.fa}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-neutral-900">{(step as any).de}</p>
                      <p className="text-gray-600">{(step as any).fa}</p>
                      {"en" in step && step.en ? <p className="text-gray-500 text-xs">{(step as any).en}</p> : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {feedback ? <p className="mt-3 text-xs text-gray-600">{feedback}</p> : null}

          {activeDialogue.steps[stepIndex] && activeDialogue.steps[stepIndex].type !== "choice" ? (
            <button
              onClick={nextStep}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              {t("dialogues.next")}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
