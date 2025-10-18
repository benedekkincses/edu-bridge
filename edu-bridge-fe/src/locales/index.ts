import { en, TranslationKeys } from "./en";
import { hu } from "./hu";

export type Language = "en" | "hu";

export const translations: Record<Language, TranslationKeys> = {
  en,
  hu,
};

export { en, hu };
