import Image from "next/image";
import type { Lang, StoryMeta } from "@/types/story";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { StoryReadLink } from "@/components/StoryReadLink";
import { StudioBrand } from "@/components/StudioBrand";
import { getCopy } from "@/lib/i18n";
import { getLocalizedImage, getLocalizedValue } from "@/lib/stories";
import { storyPath } from "@/lib/seo";

type StoryCatalogProps = {
  lang: Lang;
  stories: StoryMeta[];
};

const upcomingSlots = [
  {
    slot: "02",
    title: {
      ko: "두 번째 이야기",
      en: "Story Two",
      ja: "二つ目の物語",
      "zh-Hans": "第二个故事"
    },
    description: {
      ko: "다음 스튜디오 릴리즈가 이 슬롯에 공개됩니다.",
      en: "The next studio release will open in this slot.",
      ja: "次のスタジオリリースはこのスロットで公開されます。",
      "zh-Hans": "下一部工作室作品将在这里开放。"
    }
  },
  {
    slot: "03",
    title: {
      ko: "세 번째 이야기",
      en: "Story Three",
      ja: "三つ目の物語",
      "zh-Hans": "第三个故事"
    },
    description: {
      ko: "새로운 세계와 캐릭터를 위한 자리입니다.",
      en: "A reserved place for a new world and cast.",
      ja: "新しい世界とキャラクターのための場所です。",
      "zh-Hans": "为新的世界和角色预留的位置。"
    }
  },
  {
    slot: "04",
    title: {
      ko: "네 번째 이야기",
      en: "Story Four",
      ja: "四つ目の物語",
      "zh-Hans": "第四个故事"
    },
    description: {
      ko: "제작 일정이 확정되면 공개일을 표시합니다.",
      en: "A release date will appear once production is confirmed.",
      ja: "制作日程が決まりしだい公開日を表示します。",
      "zh-Hans": "制作日程确定后会显示开放日期。"
    }
  }
];

export function StoryCatalog({ lang, stories }: StoryCatalogProps) {
  const labels = getCopy(lang);

  return (
    <main className="site-shell">
      <header className="site-header site-header--home">
        <StudioBrand href={`/${lang}`} label={labels.brand} />
        <LanguageSwitcher currentLang={lang} />
      </header>

      <section className="catalog-intro" aria-labelledby="catalog-title">
        <div>
          <p className="eyebrow">{labels.homeEyebrow}</p>
          <h1 id="catalog-title">{labels.homeTitle}</h1>
          <p className="catalog-intro__copy">{labels.homeDescription}</p>
        </div>
      </section>

      <section className="catalog-section" aria-labelledby="current-releases-title">
        <div className="section-heading">
          <p className="eyebrow">{labels.currentReleases}</p>
          <h2 id="current-releases-title">{labels.allStories}</h2>
        </div>

        <div className="story-grid">
          {stories.map((story, index) => {
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
                  sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1120px) 44vw, 448px"
                />
                <div className="story-card__body">
                  <p className="eyebrow">{labels.readAloudPictureStory}</p>
                  <h3>{title}</h3>
                  <p className="story-card__subtitle">{subtitle}</p>
                  <p className="story-card__description">{description}</p>
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
                    <StoryReadLink
                      href={storyPath(lang, story.slug)}
                      label={labels.readStory}
                      storySlug={story.slug}
                      storyLang={lang}
                      cardPosition={index + 1}
                    />
                  ) : (
                    <span className="button-link button-link--disabled">{labels.availableSoon}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="catalog-section" aria-labelledby="upcoming-releases-title">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow">{labels.upcomingReleases}</p>
            <h2 id="upcoming-releases-title">{labels.releaseSlots}</h2>
          </div>
          <p>{labels.upcomingDescription}</p>
        </div>

        <div className="upcoming-grid">
          {upcomingSlots.map((slot) => (
            <article className="upcoming-card" key={slot.slot}>
              <p className="upcoming-card__slot">
                {labels.storySlot} {slot.slot}
              </p>
              <h3>{getLocalizedValue(slot.title, lang)}</h3>
              <p>{getLocalizedValue(slot.description, lang)}</p>
              <span>{labels.releaseDateTba}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
