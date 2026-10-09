"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isLanguageCode,
  type LanguageCode,
} from "@/lib/i18n";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (text: string) => string;
  translate: (text: string) => Promise<string>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

type Cache = Map<string, string>;
type Pending = Map<LanguageCode, Set<string>>;

function cacheKey(language: LanguageCode, text: string) {
  return `${language}\u0000${text}`;
}

async function requestTranslations(
  texts: string[],
  target: LanguageCode,
): Promise<string[]> {
  if (!texts.length || target === "en") return texts;

  const response = await fetch("/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      texts,
      target,
    }),
  });

  if (!response.ok) {
    throw new Error("Translation request failed.");
  }

  const payload = (await response.json()) as {
    translations?: unknown;
  };

  if (!Array.isArray(payload.translations)) {
    throw new Error("Translation response was invalid.");
  }

  return payload.translations.map((value, index) =>
    typeof value === "string" ? value : texts[index],
  );
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] =
    useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [, forceRender] = useState(0);

  const cacheRef = useRef<Cache>(new Map());
  const pendingRef = useRef<Pending>(new Map());
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  const flushPending = useCallback(async () => {
    flushTimerRef.current = null;

    const batches = Array.from(pendingRef.current.entries());
    pendingRef.current.clear();

    await Promise.all(
      batches.map(async ([target, values]) => {
        const texts = Array.from(values);

        try {
          const translated = await requestTranslations(texts, target);

          translated.forEach((value, index) => {
            cacheRef.current.set(
              cacheKey(target, texts[index]),
              value,
            );
          });

          if (mountedRef.current) {
            forceRender((value) => value + 1);
          }
        } catch {
          // Keep source text visible if translation is temporarily unavailable.
          // A later render/language change can request it again.
        }
      }),
    );
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) return;

    flushTimerRef.current = setTimeout(() => {
      void flushPending();
    }, 0);
  }, [flushPending]);

  useEffect(() => {
    mountedRef.current = true;

    const saved = window.localStorage.getItem(
      LANGUAGE_STORAGE_KEY,
    );

    if (saved && isLanguageCode(saved)) {
      setLanguageState(saved);
    }

    return () => {
      mountedRef.current = false;

      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (text: string) => {
      if (!text || language === "en") return text;

      const key = cacheKey(language, text);
      const cached = cacheRef.current.get(key);

      if (cached) return cached;

      const pending = pendingRef.current.get(language) ?? new Set<string>();
      pending.add(text);
      pendingRef.current.set(language, pending);
      scheduleFlush();

      return text;
    },
    [language, scheduleFlush],
  );

  const translate = useCallback(
    async (text: string) => {
      if (!text || language === "en") return text;

      const key = cacheKey(language, text);
      const cached = cacheRef.current.get(key);

      if (cached) return cached;

      try {
        const [translated] = await requestTranslations([text], language);
        cacheRef.current.set(key, translated);
        if (mountedRef.current) forceRender((value) => value + 1);
        return translated;
      } catch {
        return text;
      }
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      translate,
    }),
    [language, setLanguage, t, translate],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
