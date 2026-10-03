import { NextResponse } from "next/server";
import { isLanguageCode, type LanguageCode } from "@/lib/i18n";
import { translateWithGoogle } from "@/lib/google-translate";

const MAX_TEXTS = 128;
const MAX_TEXT_LENGTH = 5000;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      texts?: unknown;
      target?: unknown;
    };

    const texts = Array.isArray(body.texts)
      ? body.texts.filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        )
      : [];

    const target =
      typeof body.target === "string" && isLanguageCode(body.target)
        ? body.target
        : null;

    if (!target) {
      return NextResponse.json(
        { error: "Unsupported target language." },
        { status: 400 },
      );
    }

    if (!texts.length) {
      return NextResponse.json({ translations: [] });
    }

    if (texts.length > MAX_TEXTS) {
      return NextResponse.json(
        { error: `A maximum of ${MAX_TEXTS} texts can be translated per request.` },
        { status: 400 },
      );
    }

    if (texts.some((text) => text.length > MAX_TEXT_LENGTH)) {
      return NextResponse.json(
        {
          error: `Each text must be ${MAX_TEXT_LENGTH} characters or fewer.`,
        },
        { status: 400 },
      );
    }

    const translations = await translateWithGoogle(
      texts,
      target as LanguageCode,
    );

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Translation request failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Translation request failed.",
      },
      { status: 500 },
    );
  }
}
