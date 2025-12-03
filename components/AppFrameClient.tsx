"use client";

import { AppFrame } from "./AppFrame";

type Props = {
  children: React.ReactNode;
};

export default function AppFrameClient({ children }: Props) {
  return <AppFrame>{children}</AppFrame>;
}
