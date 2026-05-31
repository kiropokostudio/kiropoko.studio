import Script from "next/script";
import { AnalyticsPageView } from "@/components/AnalyticsPageView";
import { gaMeasurementId } from "@/lib/analyticsConfig";

export function GoogleAnalyticsTag() {
  if (!gaMeasurementId) {
    return null;
  }

  const measurementId = JSON.stringify(gaMeasurementId);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
if (!window.__kiropokoGaInitialized) {
  window.__kiropokoGaInitialized = true;
  gtag('js', new Date());
  gtag('config', ${measurementId}, { send_page_view: false });
}
`,
        }}
      />
      <AnalyticsPageView />
    </>
  );
}
