export const DEFAULT_LANGUAGE = "fr" as const;

export const LANGUAGE_STORAGE_KEY = "lonely-road-language-v3";

export const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "fi", label: "Suomi", flag: "🇫🇮" },
  { code: "no", label: "Norsk", flag: "🇳🇴" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "hr", label: "Hrvatski", flag: "🇭🇷" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

export function isLanguageCode(value: string): value is LanguageCode {
  return languages.some((language) => language.code === value);
}
