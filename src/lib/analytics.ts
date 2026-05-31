"use client";

import { gaMeasurementId } from "@/lib/analyticsConfig";
import { analyticsHostname } from "@/lib/analyticsConfig";

type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;
type GtagArgs = ["js", Date] | ["config" | "event", string, Record<string, unknown>?];
type GtagFunction = (...args: GtagArgs) => void;

declare global {
  interface Window {
    __kiropokoGaInitialized?: boolean;
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

function cleanParams(params: AnalyticsEventParams) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null));
}

function isAnalyticsHostname() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.location.hostname === analyticsHostname || window.location.hostname.endsWith(`.${analyticsHostname}`);
}

function getGtag() {
  if (typeof window === "undefined") {
    return null;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args) => {
      window.dataLayer?.push(args);
    });

  if (gaMeasurementId && !window.__kiropokoGaInitialized) {
    window.__kiropokoGaInitialized = true;
    window.gtag("js", new Date());
    window.gtag("config", gaMeasurementId, { send_page_view: false });
  }

  return window.gtag;
}

export function trackPageView(pathname: string) {
  const gtag = getGtag();

  if (!gaMeasurementId || !gtag || !isAnalyticsHostname()) {
    return;
  }

  gtag("config", gaMeasurementId, {
    page_path: pathname,
    page_location: `${window.location.origin}${pathname}`,
    page_title: document.title,
  });
}

export function trackEvent(eventName: string, params: AnalyticsEventParams = {}) {
  const gtag = getGtag();

  if (!gaMeasurementId || !gtag || !isAnalyticsHostname()) {
    return;
  }

  gtag("event", eventName, cleanParams(params));
}
