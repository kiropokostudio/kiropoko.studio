import { ObfuscatedEmailLink } from "@/components/ObfuscatedEmailLink";
import { getCopy } from "@/lib/i18n";
import type { Lang } from "@/types/story";

type SiteFooterProps = {
  lang: Lang;
};

export function SiteFooter({ lang }: SiteFooterProps) {
  const labels = getCopy(lang);

  return (
    <footer className="site-footer">
      <p>{labels.copyrightNotice}</p>
      <ObfuscatedEmailLink label={labels.contactLabel} />
    </footer>
  );
}
