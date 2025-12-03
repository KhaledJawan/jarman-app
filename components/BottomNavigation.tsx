"use client";

import { BookOpen, Home, ListChecks, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

const tabs = [
  { href: "/home", icon: Home, labelKey: "nav.home" },
  { href: "/learn", icon: BookOpen, labelKey: "nav.learn" },
  { href: "/vocabulary", icon: ListChecks, labelKey: "nav.vocabulary" },
  { href: "/dialogues", icon: MessageCircle, labelKey: "nav.dialogues" },
  { href: "/profile", icon: User, labelKey: "nav.profile" },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/80 bg-white/90 backdrop-blur-xl shadow-[0_-6px_24px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 text-[11px] font-semibold text-gray-500">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-1 ring-black/5 transition ${
                  isActive ? "bg-primary text-white shadow-md" : "bg-white text-gray-600 hover:bg-primary/10"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span className={`leading-none ${isActive ? "text-primary" : "text-gray-500"}`}>{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
