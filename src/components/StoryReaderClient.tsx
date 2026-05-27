"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lang, Story, StoryPage } from "@/types/story";
import { getCopy } from "@/lib/i18n";

type StoryReaderClientProps = {
  story: Story;
  lang: Lang;
};

type ReaderView = "page" | "scroll";
type ReaderPage = StoryPage;

const storageKey = "fairytale.reader.view";
const hintStorageKey = "fairytale.reader.hint.dismissed";
const illustratedPageParagraphLimit = 6;
const illustratedPageCharacterLimit = 360;
const textPageParagraphLimit = 8;
const textPageCharacterLimit = 620;

function isReaderView(value: string | null): value is ReaderView {
  return value === "page" || value === "scroll";
}

function splitPageForReader(page: StoryPage): ReaderPage[] {
  if (page.kind === "cover") {
    return [page];
  }

  const paragraphLimit = page.image ? illustratedPageParagraphLimit : textPageParagraphLimit;
  const characterLimit = page.image ? illustratedPageCharacterLimit : textPageCharacterLimit;
  const chunks = page.paragraphs.reduce<StoryPage["paragraphs"][]>((groups, paragraph) => {
    const currentGroup = groups.at(-1);
    const currentCharacterCount = currentGroup?.reduce((sum, item) => sum + item.text.length, 0) ?? 0;
    const shouldStartNewGroup =
      currentGroup &&
      paragraph.style !== "act-title" &&
      (currentGroup.length >= paragraphLimit || currentCharacterCount + paragraph.text.length > characterLimit);

    if (!currentGroup || shouldStartNewGroup) {
      groups.push([paragraph]);
      return groups;
    }

    if (paragraph.style === "act-title" && currentGroup.length > 0) {
      groups.push([paragraph]);
      return groups;
    }

    currentGroup.push(paragraph);
    return groups;
  }, []);

  if (chunks.length <= 1) {
    return [page];
  }

  return chunks.map((paragraphs, index) => ({
    ...page,
    id: `${page.id}-part-${index + 1}`,
    paragraphs,
  }));
}

function splitPagesForReader(pages: StoryPage[]): ReaderPage[] {
  return pages.flatMap(splitPageForReader);
}

export function StoryReaderClient({ story, lang }: StoryReaderClientProps) {
  const labels = getCopy(lang);
  const slides = story.content.pages;
  const pageSlides = useMemo(() => splitPagesForReader(slides), [slides]);
  const [view, setView] = useState<ReaderView>("page");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [prefersTouchHint, setPrefersTouchHint] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const activeSlides = view === "page" ? pageSlides : slides;
  const maxIndex = activeSlides.length - 1;
  const progress = maxIndex > 0 ? (currentIndex / maxIndex) * 100 : 0;

  const updateUrl = useCallback((nextView: ReaderView, nextIndex: number) => {
    const url = new URL(window.location.href);

    if (nextView === "scroll") {
      url.searchParams.set("view", "scroll");
      url.searchParams.delete("page");
    } else {
      url.searchParams.delete("view");
      url.searchParams.set("page", String(nextIndex + 1));
    }

    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const dismissHint = useCallback(() => {
    setShowHint(false);
    window.localStorage.setItem(hintStorageKey, "true");
  }, []);

  const goTo = useCallback(
    (nextIndex: number) => {
      const boundedIndex = Math.min(Math.max(nextIndex, 0), maxIndex);
      const changedPage = boundedIndex !== currentIndex;

      if (changedPage) {
        dismissHint();
      }

      setCurrentIndex(boundedIndex);

      if (view === "page") {
        updateUrl("page", boundedIndex);
      }
    },
    [currentIndex, dismissHint, maxIndex, updateUrl, view]
  );

  const changeView = useCallback(
    (nextView: ReaderView) => {
      setView(nextView);
      window.localStorage.setItem(storageKey, nextView);
      dismissHint();
      const nextMaxIndex = nextView === "page" ? pageSlides.length - 1 : slides.length - 1;
      const nextIndex = Math.min(currentIndex, nextMaxIndex);

      setCurrentIndex(nextIndex);
      updateUrl(nextView, nextIndex);

      if (nextView === "page") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentIndex, dismissHint, pageSlides.length, slides.length, updateUrl]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlView = params.get("view");
    const savedView = window.localStorage.getItem(storageKey);
    const initialView = isReaderView(urlView) ? urlView : isReaderView(savedView) ? savedView : "page";
    const pageParam = Number(params.get("page"));
    const initialMaxIndex = initialView === "page" ? pageSlides.length - 1 : slides.length - 1;
    const initialIndex = Number.isFinite(pageParam) ? Math.min(Math.max(pageParam - 1, 0), initialMaxIndex) : 0;

    setView(initialView);
    setCurrentIndex(initialIndex);

    setPrefersTouchHint(window.matchMedia("(pointer: coarse)").matches);
    setShowHint(initialView === "page" && window.localStorage.getItem(hintStorageKey) !== "true");
  }, [pageSlides.length, slides.length]);

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (!showHint) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowHint(false);
    }, 9000);

    return () => window.clearTimeout(timeout);
  }, [showHint]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (view !== "page") {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        dismissHint();
        goTo(currentIndex + 1);
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        dismissHint();
        goTo(currentIndex - 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, dismissHint, goTo, view]);

  const slideItems = useMemo(
    () =>
      activeSlides.map((page, index) => (
        <StorySlide
          key={page.id}
          page={page}
          story={story}
          labels={labels}
          index={index}
          total={activeSlides.length}
          active={view === "scroll" || index === currentIndex}
          pageMode={view === "page"}
        />
      )),
    [activeSlides, currentIndex, labels, story, view]
  );

  return (
    <article
      className={view === "page" ? "story-reader story-reader--page" : "story-reader story-reader--scroll"}
      aria-labelledby="story-title"
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (view !== "page" || touchStartX.current === null) {
          return;
        }

        const diff = touchStartX.current - (event.changedTouches[0]?.clientX ?? touchStartX.current);
        touchStartX.current = null;

        if (Math.abs(diff) < 48) {
          return;
        }

        dismissHint();
        goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
      }}
    >
      <div className="reader-toolbar">
        <div className="reader-mode" role="group" aria-label={labels.readerView}>
          <button
            className={view === "page" ? "reader-mode__button is-active" : "reader-mode__button"}
            type="button"
            aria-pressed={view === "page"}
            onClick={() => changeView("page")}
          >
            {labels.pageView}
          </button>
          <button
            className={view === "scroll" ? "reader-mode__button is-active" : "reader-mode__button"}
            type="button"
            aria-pressed={view === "scroll"}
            onClick={() => changeView("scroll")}
          >
            {labels.scrollView}
          </button>
        </div>
        {view === "page" ? (
          <div className="reader-progress" aria-live="polite">
            {currentIndex + 1} / {activeSlides.length}
          </div>
        ) : null}
      </div>

      <nav className="scene-toc" aria-label={labels.tableOfContents}>
        {story.content.pages.slice(1).map((page, index) => (
          <a key={page.id} href={`#${page.id}`}>
            {index + 1}
          </a>
        ))}
      </nav>

      <div className="reader-stage">
        <div className="story-pages">{slideItems}</div>
      </div>

      {view === "page" ? (
        <nav className="reader-controls" aria-label={labels.tableOfContents}>
          {showHint ? (
            <div className="reader-hint" role="status">
              {prefersTouchHint ? labels.readerHintTouch : labels.readerHintDesktop}
            </div>
          ) : null}
          <button type="button" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>
            <span aria-hidden="true">←</span>
            {labels.previousPage}
          </button>
          <div className="reader-controls__track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <button type="button" onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === maxIndex}>
            {labels.nextPage}
            <span aria-hidden="true">→</span>
          </button>
        </nav>
      ) : null}
    </article>
  );
}

type StorySlideProps = {
  page: StoryPage;
  story: Story;
  labels: ReturnType<typeof getCopy>;
  index: number;
  total: number;
  active: boolean;
  pageMode: boolean;
};

function StorySlide({ page, story, labels, index, total, active, pageMode }: StorySlideProps) {
  if (page.kind === "cover") {
    const coverImage = page.image ?? story.meta.coverImage;

    return (
      <section
        className="story-cover"
        id="top"
        aria-labelledby="story-title"
        data-active={active}
        aria-hidden={pageMode && !active}
      >
        <div className="story-cover__media">
          <Image src={coverImage.src} alt={coverImage.alt} width={coverImage.width} height={coverImage.height} priority />
        </div>
        <div className="story-cover__content">
          <p className="eyebrow">{labels.readAloudPictureStory}</p>
          <h1 id="story-title">{story.content.title}</h1>
          <p className="story-subtitle">{story.content.subtitle}</p>
          <dl className="story-facts">
            <div>
              <dt>{labels.readingAge}</dt>
              <dd>{story.meta.ageRange}</dd>
            </div>
            <div>
              <dt>{labels.readingTime}</dt>
              <dd>
                {story.meta.readingTimeMinutes}
                {labels.minutes}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    );
  }

  return (
    <section
      className={page.kind === "illustrated" ? "story-page story-page--illustrated" : "story-page"}
      id={page.id}
      aria-labelledby={`${page.id}-label`}
      data-active={active}
      aria-hidden={pageMode && !active}
    >
      <div className="story-page__counter" id={`${page.id}-label`}>
        {index} / {total - 1}
      </div>

      {page.image ? (
        <figure className="story-page__image">
          <Image src={page.image.src} alt={page.image.alt} width={page.image.width} height={page.image.height} />
        </figure>
      ) : null}

      <div className="story-page__text">
        {page.paragraphs.map((paragraph, paragraphIndex) => (
          <p
            key={`${page.id}-${paragraphIndex}`}
            className={paragraph.style ? `story-text story-text--${paragraph.style}` : "story-text"}
          >
            {paragraph.text}
          </p>
        ))}
      </div>
    </section>
  );
}
