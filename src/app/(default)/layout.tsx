import type { Metadata } from "next";
import "../globals.css";
import { GoogleAnalyticsTag } from "@/components/GoogleAnalyticsTag";
import { SiteFooter } from "@/components/SiteFooter";
import { defaultLang, getCopy } from "@/lib/i18n";

const labels = getCopy(defaultLang);

export const metadata: Metadata = {
  title: {
    default: labels.brand,
    template: `%s | ${labels.brand}`
  },
  description: labels.tagline
};

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={defaultLang}>
      <body>
        {children}
        <SiteFooter lang={defaultLang} />
        <GoogleAnalyticsTag />
      </body>
    </html>
  );
}
