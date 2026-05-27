import Link from "next/link";
import type { Lang } from "@/types/story";
import { getCopy, supportedLangs } from "@/lib/i18n";
import { storyPath } from "@/lib/seo";

type LanguageSwitcherProps = {
  currentLang: Lang;
  availableLangs?: Lang[];
  slug?: string;
};

export function LanguageSwitcher({ currentLang, availableLangs, slug }: LanguageSwitcherProps) {
  const labels = getCopy(currentLang);

  return (
    <nav className="language-switcher" aria-label={labels.language}>
      {supportedLangs.map((lang) => {
        const isAvailable = !availableLangs || availableLangs.includes(lang.code);
        const href = slug ? storyPath(lang.code, slug) : `/${lang.code}`;

        if (!isAvailable) {
          return (
            <span key={lang.code} className="language-pill is-disabled" aria-disabled="true">
              {lang.shortLabel}
            </span>
          );
        }

        return (
          <Link
            key={lang.code}
            className={lang.code === currentLang ? "language-pill is-current" : "language-pill"}
            href={href}
            hrefLang={lang.code}
            aria-current={lang.code === currentLang ? "page" : undefined}
          >
            {lang.shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
