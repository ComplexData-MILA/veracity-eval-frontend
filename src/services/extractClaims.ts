import { API_URL } from "@/app/constants";
import { ClaimExtractionResponse, ExtractedStatement } from "@/app/types";

type FetchWithAuth = (url: string, options?: RequestInit) => Promise<Response>;

export type ExtractionOutcome =
  | { status: "ok"; statements: ExtractedStatement[] }
  | { status: "no_claims" | "error" | "too_long" };

export type ExtractionLanguage = "english" | "french";

/** Map the next-intl locale to the language string the API expects. */
export const languageForLocale = (locale: string): ExtractionLanguage =>
  locale === "fr" ? "french" : "english";

/**
 * Extract the verifiable statements from free text so the user can confirm which
 * one they meant. Nothing is persisted by this call.
 *
 * `fetchWithAuth` is passed in rather than read from the hook so this stays a
 * plain function, and its own Authorization / Content-Type headers are relied
 * on: it applies them after spreading the options, so callers cannot override.
 */
export async function extractStatements(
  fetchWithAuth: FetchWithAuth,
  text: string,
  language: ExtractionLanguage,
): Promise<ExtractionOutcome> {
  try {
    const response = await fetchWithAuth(`${API_URL}/v1/claims/extract`, {
      method: "POST",
      body: JSON.stringify({ text, language }),
    });

    if (!response.ok) {
      return { status: "error" };
    }

    const data: ClaimExtractionResponse = await response.json();

    if (data.reason === "too_long") {
      return { status: "too_long" };
    }

    if (data.reason === "ok" && data.statements?.length > 0) {
      return { status: "ok", statements: data.statements };
    }

    return { status: "no_claims" };
  } catch (err) {
    console.error("Claim extraction failed:", err);
    return { status: "error" };
  }
}
