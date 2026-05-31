import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { GoogleAnalyticsTag } from "@/components/GoogleAnalyticsTag";
import { SiteFooter } from "@/components/SiteFooter";
import { defaultLang, getCopy, isSupportedLang, supportedLangs } from "@/lib/i18n";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export function generateStaticParams() {
  return supportedLangs.map((lang) => ({ lang: lang.code }));
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = isSupportedLang(rawLang) ? rawLang : defaultLang;
  const labels = getCopy(lang);

  return {
    title: {
      default: labels.brand,
      template: `%s | ${labels.brand}`
    },
    description: labels.tagline
  };
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params;

  if (!isSupportedLang(lang)) {
    notFound();
  }

  return (
    <html lang={lang} data-scroll-behavior="smooth">
      <body>
        {children}
        <SiteFooter lang={lang} />
        <GoogleAnalyticsTag />
      </body>
    </html>
  );
}
