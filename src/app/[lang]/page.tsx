import { notFound } from "next/navigation";
import { StoryCatalog } from "@/components/StoryCatalog";
import { isSupportedLang } from "@/lib/i18n";
import { getAllStoryMeta } from "@/lib/stories";
import { localizedHomeAlternates } from "@/lib/seo";
import type { Lang } from "@/types/story";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export function generateMetadata() {
  return {
    alternates: localizedHomeAlternates()
  };
}

export default async function HomePage({ params }: PageProps) {
  const { lang: rawLang } = await params;

  if (!isSupportedLang(rawLang)) {
    notFound();
  }

  const lang: Lang = rawLang;
  const stories = await getAllStoryMeta();

  return <StoryCatalog lang={lang} stories={stories} />;
}
