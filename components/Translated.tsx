"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function T({ k }: { k: string }) {
  const { t } = useLanguage();
  return <>{t(k)}</>;
}
