"use client";

import { BookOpen, ClipboardList, FolderClosed, Home, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

const tabs = [
  { href: "/home", icon: Home, labelKey: "nav.home", dataId: "nav-home" },
  { href: "/learn", icon: BookOpen, labelKey: "nav.learn", dataId: "nav-learn" },
  { href: "/vocabulary", icon: FolderClosed, labelKey: "nav.vocabulary", dataId: "nav-vocabulary" },
  { href: "/dialogues", icon: MessageSquare, labelKey: "nav.dialogues", dataId: "nav-dialogues" },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/85 backdrop-blur-md shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              data-id={tab.dataId}
              className={`group flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                isActive ? "bg-neutral-100 text-primary" : "text-gray-500 hover:text-primary"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 2}
                className={`transition-all duration-200 ${isActive ? "text-primary" : "text-gray-500"}`}
              />
              <span
                className={`overflow-hidden text-sm transition-all duration-200 ${
                  isActive ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                {t(tab.labelKey)}
              </span>
              <span className="sr-only">{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
