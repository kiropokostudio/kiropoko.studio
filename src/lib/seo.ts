import type { Lang, Story } from "@/types/story";
import { supportedLangs } from "@/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fairytale.example.com";

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function storyPath(lang: Lang, slug: string) {
  return `/${lang}/stories/${slug}`;
}

export function storyAlternates(story: Story) {
  const languages = Object.fromEntries(
    story.meta.availableLangs.map((lang) => [lang, absoluteUrl(storyPath(lang, story.meta.slug))])
  );

  return {
    canonical: absoluteUrl(storyPath(story.content.lang, story.meta.slug)),
    languages
  };
}

export function storyJsonLd(story: Story) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: story.content.title,
    headline: story.content.title,
    description: story.content.description,
    author: {
      "@type": "Organization",
      name: story.meta.author
    },
    inLanguage: story.content.lang,
    audience: {
      "@type": "PeopleAudience",
      suggestedMinAge: 4,
      suggestedMaxAge: 7
    },
    image: absoluteUrl(story.meta.coverImage.src),
    url: absoluteUrl(storyPath(story.content.lang, story.meta.slug))
  };
}

export function localizedHomeAlternates() {
  return {
    languages: Object.fromEntries(supportedLangs.map((lang) => [lang.code, absoluteUrl(`/${lang.code}`)]))
  };
}
