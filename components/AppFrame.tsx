"use client";

import { usePathname } from "next/navigation";
import { BottomNavigation } from "./BottomNavigation";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavPaths = ["/", "/level"];
  const showNav = !hideNavPaths.includes(pathname ?? "");

  return (
    <>
      <div className="mx-auto min-h-screen max-w-md px-5 pb-24 pt-6">{children}</div>
      {showNav ? <BottomNavigation /> : null}
    </>
  );
}
