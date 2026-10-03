import type { LanguageCode } from "@/lib/i18n";

type GoogleTranslationResponse = {
  data?: {
    translations?: Array<{
      translatedText?: string;
    }>;
  };
};

const GOOGLE_TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";

export async function translateWithGoogle(
  texts: string[],
  target: LanguageCode,
): Promise<string[]> {
  if (!texts.length || target === "en") {
    return texts;
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_TRANSLATE_API_KEY is not configured.");
  }

  const response = await fetch(
    `${GOOGLE_TRANSLATE_URL}?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        q: texts,
        target,
        format: "text",
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(
      `Google Cloud Translation API failed (${response.status}). ${details}`.trim(),
    );
  }

  const payload = (await response.json()) as GoogleTranslationResponse;
  const translations = payload.data?.translations ?? [];

  if (translations.length !== texts.length) {
    throw new Error("Google Cloud Translation API returned an incomplete result.");
  }

  return translations.map((item, index) => item.translatedText ?? texts[index]);
}
