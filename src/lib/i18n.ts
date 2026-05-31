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
    brand: "Kiro & Poko Studio",
    tagline: "키로와 포코 스튜디오의 이야기와 신작을 만나는 공간입니다.",
    homeEyebrow: "Studio",
    homeTitle: "Kiro & Poko Studio",
    homeDescription: "새로운 이야기들이 준비되는 대로 이곳에 차례로 열립니다.",
    currentReleases: "Now open",
    upcomingReleases: "Coming soon",
    releaseSlots: "릴리즈 슬롯",
    upcomingDescription: "다음 슬롯은 제작 일정이 확정되면 공개일이 업데이트됩니다.",
    releaseDateTba: "Date TBA",
    storySlot: "Slot",
    stories: "작품",
    allStories: "공개된 작품",
    readStory: "읽기",
    readingAge: "권장 연령",
    readingTime: "낭독 시간",
    minutes: "분",
    language: "언어",
    availableSoon: "준비 중",
    published: "공개 중",
    readAloudPictureStory: "Studio Story",
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
    brand: "Kiro & Poko Studio",
    tagline: "Stories and upcoming releases from Kiro & Poko Studio.",
    homeEyebrow: "Studio",
    homeTitle: "Kiro & Poko Studio",
    homeDescription: "New stories will open here as soon as each release is ready.",
    currentReleases: "Now open",
    upcomingReleases: "Coming soon",
    releaseSlots: "Release slots",
    upcomingDescription: "Release dates will be updated when the next studio slots are confirmed.",
    releaseDateTba: "Date TBA",
    storySlot: "Slot",
    stories: "Stories",
    allStories: "Published stories",
    readStory: "Read",
    readingAge: "Age",
    readingTime: "Read-aloud time",
    minutes: "min",
    language: "Language",
    availableSoon: "Coming soon",
    published: "Published",
    readAloudPictureStory: "Studio Story",
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
    brand: "Kiro & Poko Studio",
    tagline: "Kiro & Poko Studio の物語と新作情報を届ける場所です。",
    homeEyebrow: "Studio",
    homeTitle: "Kiro & Poko Studio",
    homeDescription: "新しい物語は、準備が整いしだいこの場所で順番に公開されます。",
    currentReleases: "Now open",
    upcomingReleases: "Coming soon",
    releaseSlots: "リリーススロット",
    upcomingDescription: "次のスロットは制作日程が決まりしだい公開日を更新します。",
    releaseDateTba: "Date TBA",
    storySlot: "Slot",
    stories: "作品",
    allStories: "公開中の作品",
    readStory: "読む",
    readingAge: "対象年齢",
    readingTime: "読み聞かせ時間",
    minutes: "分",
    language: "言語",
    availableSoon: "準備中",
    published: "公開中",
    readAloudPictureStory: "Studio Story",
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
    brand: "Kiro & Poko Studio",
    tagline: "Kiro & Poko Studio 的故事与新作发布空间。",
    homeEyebrow: "Studio",
    homeTitle: "Kiro & Poko Studio",
    homeDescription: "新的故事准备完成后，会在这里陆续开放。",
    currentReleases: "Now open",
    upcomingReleases: "Coming soon",
    releaseSlots: "发布槽位",
    upcomingDescription: "后续槽位的制作时间确定后，将更新正式开放日期。",
    releaseDateTba: "Date TBA",
    storySlot: "Slot",
    stories: "故事",
    allStories: "已发布故事",
    readStory: "阅读",
    readingAge: "适读年龄",
    readingTime: "朗读时间",
    minutes: "分钟",
    language: "语言",
    availableSoon: "准备中",
    published: "已发布",
    readAloudPictureStory: "Studio Story",
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
