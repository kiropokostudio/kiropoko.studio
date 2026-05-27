import type { Lang } from "@/types/story";

export const defaultLang: Lang = "ko";

export const supportedLangs: Array<{ code: Lang; label: string; shortLabel: string }> = [
  { code: "ko", label: "한국어", shortLabel: "KO" },
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "ja", label: "日本語", shortLabel: "JA" },
  { code: "zh-Hans", label: "简体中文", shortLabel: "ZH" }
];

export const copy = {
  ko: {
    brand: "Fairytale Library",
    tagline: "전세계 신진 동화 작가들의 짧고 아름다운 그림 이야기",
    stories: "작품",
    allStories: "작품 목록",
    readStory: "읽기",
    readingAge: "권장 연령",
    readingTime: "낭독 시간",
    minutes: "분",
    language: "언어",
    availableSoon: "준비 중",
    published: "공개됨",
    readAloudPictureStory: "낭독용 그림 이야기",
    storyNotReady: "이 언어의 본문은 아직 준비 중입니다.",
    tableOfContents: "장면 목록",
    previousPage: "이전 장면",
    nextPage: "다음 장면",
    readerHintDesktop: "← → 키 또는 버튼으로 장면을 넘길 수 있어요",
    readerHintTouch: "좌우로 밀거나 버튼으로 장면을 넘길 수 있어요",
    backToStories: "작품 목록으로",
    pageView: "페이지",
    scrollView: "스크롤",
    readerView: "읽기 방식"
  },
  en: {
    brand: "Fairytale Library",
    tagline: "Short illustrated stories from new children's writers around the world",
    stories: "Stories",
    allStories: "Stories",
    readStory: "Read",
    readingAge: "Age",
    readingTime: "Read-aloud time",
    minutes: "min",
    language: "Language",
    availableSoon: "Coming soon",
    published: "Published",
    readAloudPictureStory: "Read-aloud picture story",
    storyNotReady: "This translation is still in progress.",
    tableOfContents: "Scenes",
    previousPage: "Previous scene",
    nextPage: "Next scene",
    readerHintDesktop: "Use ← → keys or the buttons to turn the scene",
    readerHintTouch: "Swipe or use the buttons to turn the scene",
    backToStories: "All stories",
    pageView: "Page",
    scrollView: "Scroll",
    readerView: "Reading mode"
  },
  ja: {
    brand: "Fairytale Library",
    tagline: "世界の新しい童話作家による短く美しい絵物語",
    stories: "作品",
    allStories: "作品一覧",
    readStory: "読む",
    readingAge: "対象年齢",
    readingTime: "読み聞かせ時間",
    minutes: "分",
    language: "言語",
    availableSoon: "準備中",
    published: "公開中",
    readAloudPictureStory: "読み聞かせ絵物語",
    storyNotReady: "この言語の本文はまだ準備中です。",
    tableOfContents: "場面一覧",
    previousPage: "前の場面",
    nextPage: "次の場面",
    readerHintDesktop: "← → キーまたはボタンで場面をめくれます",
    readerHintTouch: "左右にスワイプするか、ボタンで場面をめくれます",
    backToStories: "作品一覧へ",
    pageView: "ページ",
    scrollView: "スクロール",
    readerView: "読み方"
  },
  "zh-Hans": {
    brand: "Fairytale Library",
    tagline: "来自世界新锐童话作者的短篇图画故事",
    stories: "故事",
    allStories: "故事列表",
    readStory: "阅读",
    readingAge: "适读年龄",
    readingTime: "朗读时间",
    minutes: "分钟",
    language: "语言",
    availableSoon: "准备中",
    published: "已发布",
    readAloudPictureStory: "亲子朗读图画故事",
    storyNotReady: "该语言版本仍在准备中。",
    tableOfContents: "场景列表",
    previousPage: "上一幕",
    nextPage: "下一幕",
    readerHintDesktop: "使用 ← → 键或按钮切换场景",
    readerHintTouch: "左右滑动或使用按钮切换场景",
    backToStories: "返回故事列表",
    pageView: "翻页",
    scrollView: "滚动",
    readerView: "阅读方式"
  }
} satisfies Record<(typeof supportedLangs)[number]["code"], Record<string, string>>;

export function isSupportedLang(value: string): value is Lang {
  return supportedLangs.some((lang) => lang.code === value);
}

export function getCopy(lang: Lang) {
  return copy[lang] ?? copy[defaultLang];
}

export function getLangLabel(lang: Lang) {
  return supportedLangs.find((item) => item.code === lang)?.label ?? lang;
}
