import type { Lang } from "@/types/story";
import { defaultLang, supportedLangs } from "@/lib/i18n";

export const languagePreferenceCookieName = "kiropoko_lang";
export const languagePreferenceMaxAge = 60 * 60 * 24 * 365;

const supportedLangByLowerCode = new Map<Lowercase<Lang>, Lang>(
  supportedLangs.map((lang) => [lang.code.toLowerCase() as Lowercase<Lang>, lang.code])
);

function toSupportedLang(tag: string): Lang | null {
  const normalizedTag = tag.trim().toLowerCase();

  if (!normalizedTag || normalizedTag === "*") {
    return null;
  }

  const exactMatch = supportedLangByLowerCode.get(normalizedTag as Lowercase<Lang>);

  if (exactMatch) {
    return exactMatch;
  }

  if (normalizedTag.startsWith("zh")) {
    return "zh-Hans";
  }

  const baseLang = normalizedTag.split("-")[0] as Lowercase<Lang>;

  return supportedLangByLowerCode.get(baseLang) ?? null;
}

export function getSupportedLanguagePreference(value?: string | null): Lang | null {
  if (!value) {
    return null;
  }

  try {
    return toSupportedLang(decodeURIComponent(value));
  } catch {
    return toSupportedLang(value);
  }
}

export function getPreferredLangFromAcceptLanguage(acceptLanguage?: string | null): Lang {
  if (!acceptLanguage) {
    return defaultLang;
  }

  const preferences = acceptLanguage
    .split(",")
    .map((item, index) => {
      const [rawTag, ...rawParams] = item.trim().split(";");
      const qValue = rawParams
        .map((param) => param.trim())
        .find((param) => param.startsWith("q="))
        ?.slice(2);
      const q = qValue ? Number(qValue) : 1;

      return {
        index,
        q: Number.isFinite(q) ? q : 0,
        tag: rawTag
      };
    })
    .filter((preference) => preference.tag && preference.q > 0)
    .sort((left, right) => right.q - left.q || left.index - right.index);

  for (const preference of preferences) {
    const lang = toSupportedLang(preference.tag);

    if (lang) {
      return lang;
    }
  }

  return defaultLang;
}

export function serializeLanguagePreferenceCookie(lang: Lang) {
  return `${languagePreferenceCookieName}=${encodeURIComponent(lang)}; Path=/; Max-Age=${languagePreferenceMaxAge}; SameSite=Lax`;
}
