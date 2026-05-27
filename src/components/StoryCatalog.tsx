import Image from "next/image";
import Link from "next/link";
import type { Lang, StoryMeta } from "@/types/story";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getCopy } from "@/lib/i18n";
import { getLocalizedImage, getLocalizedValue } from "@/lib/stories";
import { storyPath } from "@/lib/seo";

type StoryCatalogProps = {
  lang: Lang;
  stories: StoryMeta[];
};

export function StoryCatalog({ lang, stories }: StoryCatalogProps) {
  const labels = getCopy(lang);

  return (
    <main className="site-shell">
      <header className="site-header">
        <Link className="brand" href={`/${lang}`} aria-label={labels.brand}>
          {labels.brand}
        </Link>
        <LanguageSwitcher currentLang={lang} />
      </header>

      <section className="catalog-intro" aria-labelledby="catalog-title">
        <div>
          <p className="eyebrow">{labels.published}</p>
          <h1 id="catalog-title">{labels.tagline}</h1>
        </div>
      </section>

      <section className="story-grid" aria-label={labels.allStories}>
        {stories.map((story) => {
          const isAvailable = story.availableLangs.includes(lang);
          const title = getLocalizedValue(story.title, lang);
          const subtitle = getLocalizedValue(story.subtitle, lang);
          const description = getLocalizedValue(story.description, lang);
          const coverAlt = getLocalizedValue(story.coverImageAlt ?? { ko: story.coverImage.alt }, lang);
          const coverImage = getLocalizedImage(story.coverImages, lang, story.coverImage);

          return (
            <article className="story-card" key={story.slug}>
              <Image
                src={coverImage.src}
                alt={coverAlt}
                width={coverImage.width}
                height={coverImage.height}
                priority
              />
              <div className="story-card__body">
                <p className="eyebrow">{labels.readAloudPictureStory}</p>
                <h2>{title}</h2>
                <p className="story-card__subtitle">{subtitle}</p>
                <p>{description}</p>
                <dl className="story-card__facts">
                  <div>
                    <dt>{labels.readingAge}</dt>
                    <dd>{story.ageRange}</dd>
                  </div>
                  <div>
                    <dt>{labels.readingTime}</dt>
                    <dd>
                      {story.readingTimeMinutes}
                      {labels.minutes}
                    </dd>
                  </div>
                </dl>
                {isAvailable ? (
                  <Link className="button-link" href={storyPath(lang, story.slug)}>
                    {labels.readStory}
                  </Link>
                ) : (
                  <span className="button-link button-link--disabled">{labels.availableSoon}</span>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
