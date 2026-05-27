import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Lang, Story, StoryContent, StoryImage, StoryMeta, StoryPage, StoryParagraph } from "@/types/story";

const contentRoot = path.join(process.cwd(), "content", "stories");

type StoryTranslationPage = {
  id: string;
  heading?: string;
  imageAlt?: string;
  paragraphs: StoryParagraph[];
};

type StoryTranslationContent = Omit<StoryContent, "pages"> & {
  pages: StoryTranslationPage[];
};

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export const getStorySlugs = cache(async () => {
  const entries = await fs.readdir(contentRoot, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
});

export const getStoryMeta = cache(async (slug: string) => {
  return readJson<StoryMeta>(path.join(contentRoot, slug, "story.json"));
});

export const getAllStoryMeta = cache(async () => {
  const slugs = await getStorySlugs();
  return Promise.all(slugs.map((slug) => getStoryMeta(slug)));
});

export function getLocalizedImage(
  images: Partial<Record<Lang, StoryImage>> | undefined,
  lang: Lang,
  fallback: StoryImage
) {
  return images?.[lang] ?? fallback;
}

function localizeCoverPage(page: StoryPage, coverImage: StoryImage): StoryPage {
  if (page.kind !== "cover") {
    return page;
  }

  return {
    ...page,
    image: {
      ...coverImage,
      alt: page.image?.alt ?? coverImage.alt
    }
  };
}

export async function hasStoryTranslation(slug: string, lang: Lang) {
  try {
    await fs.access(path.join(contentRoot, slug, `${lang}.json`));
    return true;
  } catch {
    return false;
  }
}

export const getStory = cache(async (slug: string, lang: Lang): Promise<Story | null> => {
  const meta = await getStoryMeta(slug);

  if (!meta.availableLangs.includes(lang)) {
    return null;
  }

  const content = await readJson<StoryContent | StoryTranslationContent>(path.join(contentRoot, slug, `${lang}.json`));
  const localizedCoverImage = getLocalizedImage(meta.coverImages, lang, meta.coverImage);
  const localizedMeta = {
    ...meta,
    coverImage: localizedCoverImage
  };

  if (lang !== meta.canonicalLang) {
    const translation = content as StoryTranslationContent;
    const base = await readJson<StoryContent>(path.join(contentRoot, slug, `${meta.canonicalLang}.json`));
    const localizedPages = new Map(translation.pages.map((page) => [page.id, page]));
    const pages = base.pages.map((page) => {
      const localized = localizedPages.get(page.id);

      if (!localized) {
        return page;
      }

      return {
        ...localizeCoverPage(page, localizedCoverImage),
        heading: localized.heading ?? page.heading,
        image:
          page.image && localized.imageAlt
            ? { ...(page.kind === "cover" ? localizedCoverImage : page.image), alt: localized.imageAlt }
            : page.kind === "cover"
              ? localizedCoverImage
              : page.image,
        paragraphs: localized.paragraphs
      };
    });

    return {
      meta: localizedMeta,
      content: {
        lang: translation.lang,
        title: translation.title,
        subtitle: translation.subtitle,
        description: translation.description,
        pages
      }
    };
  }

  const canonicalContent = content as StoryContent;

  return {
    meta: localizedMeta,
    content: {
      ...canonicalContent,
      pages: canonicalContent.pages.map((page) => localizeCoverPage(page, localizedCoverImage))
    }
  };
});

export function getLocalizedValue(values: Partial<Record<Lang, string>>, lang: Lang, fallback: Lang = "ko") {
  return values[lang] ?? values[fallback] ?? Object.values(values)[0] ?? "";
}
