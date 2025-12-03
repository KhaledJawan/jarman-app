"use client";

import grammarTopics from "@/data/grammar.json";
import { useLanguage } from "@/lib/i18n";
import { readJSON, writeJSON } from "@/lib/storage";
import { CheckCircle, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Topic = (typeof grammarTopics)[number];
type TaskAnswer = Record<string, string>;

const COMPLETED_KEY = "jarman-grammar-completed";

export default function GrammarPage() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<Topic | null>(null);
  const [answers, setAnswers] = useState<TaskAnswer>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const levels = useMemo(() => ["all", ...Array.from(new Set(grammarTopics.map((g) => g.level)))], []);
  const [activeLevel, setActiveLevel] = useState<string>("all");

  useEffect(() => {
    setCompleted(readJSON<Record<string, boolean>>(COMPLETED_KEY, {}));
  }, []);

  const filteredTopics = useMemo(
    () => (activeLevel === "all" ? grammarTopics : grammarTopics.filter((t) => t.level === activeLevel)),
    [activeLevel],
  );

  const handleAnswerChange = (taskId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [taskId]: value }));
  };

  const checkTasks = () => {
    if (!selected) return;
    const allCorrect = selected.tasks.every((task, idx) => answers[`${selected.id}-${idx}`]?.trim() === task.answer);
    if (allCorrect) {
      const next = { ...completed, [selected.id]: true };
      setCompleted(next);
      writeJSON(COMPLETED_KEY, next);
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-12">
      <div className="card-surface overflow-hidden">
        <div className="relative h-36 w-full bg-gradient-to-r from-[#d2e7ff] via-white to-[#ffe9d2]">
          <div className="absolute left-4 top-4 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-primary shadow">
            {t("grammar.heading")}
          </div>
          <div className="absolute bottom-4 left-4 text-left">
            <p className="text-lg font-semibold text-neutral-900">Grammar courses</p>
            <p className="text-xs text-gray-600">{t("landing.tagline")}</p>
          </div>
          <div className="absolute right-6 bottom-2 h-20 w-28 rounded-3xl bg-white/70 shadow-inner ring-1 ring-black/5" />
        </div>
        <div className="flex items-center gap-2 px-4 py-3">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`pill ring-1 ring-black/5 ${
                activeLevel === level ? "bg-primary text-white shadow-md" : "bg-white text-gray-700"
              }`}
            >
              {level === "all" ? "All" : level}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filteredTopics.map((topic, idx) => {
          const pastel = ["from-orange-50", "from-green-50", "from-blue-50"];
          const bg = pastel[idx % pastel.length];
          return (
            <button
              key={topic.id}
              onClick={() => {
                setSelected(topic);
                setAnswers({});
              }}
              className={`card-surface flex items-center justify-between bg-gradient-to-r ${bg} to-white px-4 py-3 text-left transition hover:-translate-y-0.5`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-inner ring-1 ring-black/5">
                  <Play size={18} className="text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-900">{topic.title}</p>
                  <p className="text-xs text-gray-600">{topic.level}</p>
                </div>
              </div>
              {completed[topic.id] ? <CheckCircle size={18} className="text-success" /> : null}
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="card-surface space-y-3 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{selected.level}</p>
              <h2 className="text-lg font-semibold text-neutral-900">{selected.title}</h2>
            </div>
            {completed[selected.id] ? (
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                {t("grammar.correct")}
              </span>
            ) : null}
          </div>
          <p className="text-sm text-gray-700">{selected.explanation}</p>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-neutral-900">{t("grammar.examples")}</p>
            {selected.examples.map((example, idx) => (
              <div key={idx} className="rounded-xl bg-neutralLight px-3 py-2 text-sm">
                <p className="font-semibold text-neutral-900">{example.de}</p>
                <p className="text-gray-600">{example.fa}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-neutral-900">{t("grammar.tasks")}</p>
            {selected.tasks.map((task, idx) => {
              const id = `${selected.id}-${idx}`;
              const value = answers[id] ?? "";
              const correct = value.trim() === task.answer;
              return (
                <div key={id} className="rounded-xl border border-neutralLight px-3 py-2 text-sm">
                  <p className="mb-2 text-neutral-900">{task.question}</p>
                  <input
                    value={value}
                    onChange={(e) => handleAnswerChange(id, e.target.value)}
                    className="w-full rounded-lg border border-neutralLight px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="..."
                  />
                  {value ? (
                    <p className={`mt-1 text-xs ${correct ? "text-success" : "text-error"}`}>
                      {correct ? t("grammar.correct") : t("grammar.incorrect")}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <button
            onClick={checkTasks}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            {t("grammar.check")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
