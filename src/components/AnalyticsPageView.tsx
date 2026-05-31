"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/analytics";

export function AnalyticsPageView() {
  const pathname = usePathname();
  const lastTrackedPathname = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastTrackedPathname.current === pathname) {
      return;
    }

    lastTrackedPathname.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
