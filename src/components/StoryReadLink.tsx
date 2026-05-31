"use client";

import Link from "next/link";
import type { Lang } from "@/types/story";
import { trackEvent } from "@/lib/analytics";

type StoryReadLinkProps = {
  href: string;
  label: string;
  storySlug: string;
  storyLang: Lang;
  cardPosition: number;
};

export function StoryReadLink({ href, label, storySlug, storyLang, cardPosition }: StoryReadLinkProps) {
  return (
    <Link
      className="button-link"
      href={href}
      onClick={() => {
        trackEvent("select_story", {
          story_slug: storySlug,
          story_lang: storyLang,
          card_position: cardPosition,
        });
      }}
    >
      {label}
    </Link>
  );
}
