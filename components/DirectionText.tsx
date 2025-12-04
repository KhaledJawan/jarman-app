"use client";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function TextFa({ children, className }: Props) {
  return (
    <span lang="fa" dir="rtl" className={["text-end", className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

export function TextEn({ children, className }: Props) {
  return (
    <span lang="en" dir="ltr" className={["text-start", className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

export function TextDe({ children, className }: Props) {
  return (
    <span lang="de" dir="ltr" className={["text-start", className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
