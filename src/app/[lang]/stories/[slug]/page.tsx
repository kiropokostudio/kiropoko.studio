import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { StudioBrand } from "@/components/StudioBrand";
import { StoryReader } from "@/components/StoryReader";
import { getCopy, isSupportedLang } from "@/lib/i18n";
import { getAllStoryMeta, getStory } from "@/lib/stories";
import { absoluteUrl, storyAlternates, storyJsonLd, storyPath } from "@/lib/seo";
import type { Lang } from "@/types/story";

type StoryPageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateStaticParams() {
  const stories = await getAllStoryMeta();

  return stories.flatMap((story) =>
    story.availableLangs.map((lang) => ({
      lang,
      slug: story.slug
    }))
  );
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;

  if (!isSupportedLang(rawLang)) {
    return {};
  }

  const story = await getStory(slug, rawLang);

  if (!story) {
    return {};
  }

  return {
    title: story.content.title,
    description: story.content.description,
    alternates: storyAlternates(story),
    openGraph: {
      title: story.content.title,
      description: story.content.description,
      type: "book",
      images: [
        {
          url: absoluteUrl(story.meta.coverImage.src),
          width: story.meta.coverImage.width,
          height: story.meta.coverImage.height,
          alt: story.content.pages[0]?.image?.alt ?? story.meta.coverImage.alt
        }
      ]
    }
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { lang: rawLang, slug } = await params;

  if (!isSupportedLang(rawLang)) {
    notFound();
  }

  const lang: Lang = rawLang;
  const story = await getStory(slug, lang);

  if (!story) {
    notFound();
  }

  const labels = getCopy(lang);

  return (
    <main className="site-shell site-shell--reader">
      <header className="site-header">
        <StudioBrand href={`/${lang}`} label={labels.brand} />
        <div className="header-actions">
          <Link href={`/${lang}/stories`} className="text-link">
            {labels.backToStories}
          </Link>
          <LanguageSwitcher currentLang={lang} availableLangs={story.meta.availableLangs} slug={story.meta.slug} />
        </div>
      </header>

      <StoryReader story={story} lang={lang} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storyJsonLd(story))
        }}
      />
    </main>
  );
}
