"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lang, Story, StoryPage } from "@/types/story";
import { getCopy } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";

type StoryReaderClientProps = {
  story: Story;
  lang: Lang;
};

type ReaderView = "page" | "scroll";
type ReaderPage = StoryPage;
type ImagePlacement = NonNullable<StoryPage["imagePlacement"]>;

const storageKey = "kiropoko.reader.view";
const hintStorageKey = "kiropoko.reader.hint.dismissed";
const illustratedPageParagraphLimit = 6;
const illustratedPageCharacterLimit = 360;
const textPageParagraphLimit = 8;
const textPageCharacterLimit = 620;
const progressMilestones = [25, 50, 75, 90, 100];
const storyCoverImageSizes = "(max-width: 760px) calc(100vw - 28px), min(1180px, calc(100vw - 28px))";
const storyPageImageSizes = "(max-width: 760px) calc(100vw - 72px), (max-width: 1180px) 48vw, 560px";

function isReaderView(value: string | null): value is ReaderView {
  return value === "page" || value === "scroll";
}

function shouldShowImageForChunk(imagePlacement: ImagePlacement, index: number, total: number) {
  if (imagePlacement === "all") {
    return true;
  }

  if (imagePlacement === "first") {
    return index === 0;
  }

  if (imagePlacement === "last") {
    return index === total - 1;
  }

  const part = Number.parseInt(imagePlacement.replace("part-", ""), 10);
  return Number.isFinite(part) && index === part - 1;
}

function splitPageForReader(page: StoryPage): ReaderPage[] {
  if (page.kind === "cover") {
    return [page];
  }

  const imagePlacement = page.imagePlacement ?? "all";
  const useIllustratedChunkSize = Boolean(page.image && imagePlacement !== "last");
  const paragraphLimit = useIllustratedChunkSize ? illustratedPageParagraphLimit : textPageParagraphLimit;
  const characterLimit = useIllustratedChunkSize ? illustratedPageCharacterLimit : textPageCharacterLimit;
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

  return chunks.map((paragraphs, index) => {
    const shouldShowImage = Boolean(page.image && shouldShowImageForChunk(imagePlacement, index, chunks.length));

    return {
      ...page,
      id: `${page.id}-part-${index + 1}`,
      kind: shouldShowImage ? page.kind : "text",
      image: shouldShowImage ? page.image : undefined,
      paragraphs,
    };
  });
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
  const articleRef = useRef<HTMLElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const storyOpenTracked = useRef(false);
  const progressTracked = useRef<Set<number>>(new Set());
  const completionTracked = useRef(false);

  const activeSlides = view === "page" ? pageSlides : slides;
  const maxIndex = activeSlides.length - 1;
  const progress = maxIndex > 0 ? (currentIndex / maxIndex) * 100 : 0;

  const trackReaderProgress = useCallback(
    (progressPercent: number) => {
      const boundedProgress = Math.min(Math.max(progressPercent, 0), 100);

      progressMilestones.forEach((milestone) => {
        if (boundedProgress < milestone || progressTracked.current.has(milestone)) {
          return;
        }

        progressTracked.current.add(milestone);
        trackEvent("story_progress", {
          story_slug: story.meta.slug,
          story_lang: lang,
          reader_view: view,
          progress_percent: milestone,
        });
      });

      if (boundedProgress >= 95 && !completionTracked.current) {
        completionTracked.current = true;
        trackEvent("story_complete", {
          story_slug: story.meta.slug,
          story_lang: lang,
          reader_view: view,
        });
      }
    },
    [lang, story.meta.slug, view]
  );

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
      if (nextView === view) {
        return;
      }

      setView(nextView);
      window.localStorage.setItem(storageKey, nextView);
      dismissHint();
      const nextMaxIndex = nextView === "page" ? pageSlides.length - 1 : slides.length - 1;
      const nextIndex = Math.min(currentIndex, nextMaxIndex);

      setCurrentIndex(nextIndex);
      updateUrl(nextView, nextIndex);
      trackEvent("reader_view_change", {
        story_slug: story.meta.slug,
        story_lang: lang,
        previous_reader_view: view,
        reader_view: nextView,
      });

      if (nextView === "page") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentIndex, dismissHint, lang, pageSlides.length, slides.length, story.meta.slug, updateUrl, view]
  );

  useEffect(() => {
    if (storyOpenTracked.current) {
      return;
    }

    storyOpenTracked.current = true;
    trackEvent("story_open", {
      story_slug: story.meta.slug,
      story_lang: lang,
    });
  }, [lang, story.meta.slug]);

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

  useEffect(() => {
    if (view !== "page" || maxIndex <= 0) {
      return;
    }

    trackReaderProgress(progress);
  }, [maxIndex, progress, trackReaderProgress, view]);

  useEffect(() => {
    if (view !== "scroll") {
      return;
    }

    let animationFrame = 0;

    const measureScrollProgress = () => {
      const element = articleRef.current;

      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const scrollableHeight = Math.max(element.scrollHeight - viewportHeight, 1);
      const scrollTop = Math.min(Math.max(-rect.top, 0), scrollableHeight);
      const scrollProgress = ((scrollTop + viewportHeight) / Math.max(element.scrollHeight, viewportHeight)) * 100;

      trackReaderProgress(scrollProgress);
    };

    const scheduleMeasurement = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(measureScrollProgress);
    };

    scheduleMeasurement();
    window.addEventListener("scroll", scheduleMeasurement, { passive: true });
    window.addEventListener("resize", scheduleMeasurement);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleMeasurement);
      window.removeEventListener("resize", scheduleMeasurement);
    };
  }, [trackReaderProgress, view]);

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
      ref={articleRef}
      className={view === "page" ? "story-reader story-reader--page" : "story-reader story-reader--scroll"}
      aria-labelledby="story-title"
      onTouchStart={(event) => {
        const touch = event.touches[0];
        touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
      }}
      onTouchEnd={(event) => {
        if (view !== "page" || touchStart.current === null) {
          return;
        }

        const touch = event.changedTouches[0];
        const diffX = touchStart.current.x - (touch?.clientX ?? touchStart.current.x);
        const diffY = touchStart.current.y - (touch?.clientY ?? touchStart.current.y);
        touchStart.current = null;

        if (Math.abs(diffX) < 64 || Math.abs(diffX) < Math.abs(diffY) * 1.35) {
          return;
        }

        dismissHint();
        goTo(diffX > 0 ? currentIndex + 1 : currentIndex - 1);
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
          <button
            type="button"
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            aria-label={labels.previousPage}
          >
            <span className="reader-control__arrow" aria-hidden="true">
              &lt;
            </span>
            <span className="reader-control__label">{labels.previousPage}</span>
          </button>
          <div className="reader-controls__track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === maxIndex}
            aria-label={labels.nextPage}
          >
            <span className="reader-control__label">{labels.nextPage}</span>
            <span className="reader-control__arrow" aria-hidden="true">
              &gt;
            </span>
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
          <Image
            src={coverImage.src}
            alt={coverImage.alt}
            width={coverImage.width}
            height={coverImage.height}
            priority
            sizes={storyCoverImageSizes}
          />
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
      aria-label={pageMode ? `${index + 1} / ${total}` : undefined}
      aria-labelledby={pageMode ? undefined : `${page.id}-label`}
      data-active={active}
      aria-hidden={pageMode && !active}
    >
      {pageMode ? null : (
        <div className="story-page__counter" id={`${page.id}-label`}>
          {index + 1} / {total}
        </div>
      )}

      {page.image ? (
        <figure className="story-page__image">
          <Image
            src={page.image.src}
            alt={page.image.alt}
            width={page.image.width}
            height={page.image.height}
            sizes={storyPageImageSizes}
          />
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
