import type { Lang, Story } from "@/types/story";
import { StoryReaderClient } from "@/components/StoryReaderClient";

type StoryReaderProps = {
  story: Story;
  lang: Lang;
};

export function StoryReader({ story, lang }: StoryReaderProps) {
  return <StoryReaderClient story={story} lang={lang} />;
}
