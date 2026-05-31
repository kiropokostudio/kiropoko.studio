import { NextResponse, type NextRequest } from "next/server";
import {
  getPreferredLangFromAcceptLanguage,
  getSupportedLanguagePreference,
  languagePreferenceCookieName
} from "@/lib/languagePreference";

export function middleware(request: NextRequest) {
  const preferredLang =
    getSupportedLanguagePreference(request.cookies.get(languagePreferenceCookieName)?.value) ??
    getPreferredLangFromAcceptLanguage(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();

  url.pathname = `/${preferredLang}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/"
};
