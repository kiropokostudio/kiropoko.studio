export type Lang = "ko" | "en" | "ja" | "zh-Hans";

export type LocalizedString = Partial<Record<Lang, string>>;

export type StoryImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type ParagraphStyle =
  | "body"
  | "dialogue"
  | "emphasis"
  | "sound"
  | "act-title";

export type StoryParagraph = {
  text: string;
  style?: ParagraphStyle;
};

export type StoryPage = {
  id: string;
  kind: "cover" | "illustrated" | "text";
  heading?: string;
  act?: number;
  image?: StoryImage;
  paragraphs: StoryParagraph[];
};

export type StoryMeta = {
  slug: string;
  canonicalLang: Lang;
  availableLangs: Lang[];
  plannedLangs: Lang[];
  title: LocalizedString;
  subtitle: LocalizedString;
  description: LocalizedString;
  author: string;
  positioning: string;
  ageRange: string;
  readingTimeMinutes: number;
  themes: string[];
  coverImage: StoryImage;
  coverImages?: Partial<Record<Lang, StoryImage>>;
  coverImageAlt?: LocalizedString;
};

export type StoryContent = {
  lang: Lang;
  title: string;
  subtitle: string;
  description: string;
  pages: StoryPage[];
};

export type Story = {
  meta: StoryMeta;
  content: StoryContent;
};
