import type { MetadataRoute } from "next";
import { supportedLangs } from "@/lib/i18n";
import { absoluteUrl, storyPath } from "@/lib/seo";
import { getAllStoryMeta } from "@/lib/stories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getAllStoryMeta();
  const homeRoutes = supportedLangs.map((lang) => ({
    url: absoluteUrl(`/${lang.code}`),
    lastModified: new Date()
  }));

  const storyRoutes = stories.flatMap((story) =>
    story.availableLangs.map((lang) => ({
      url: absoluteUrl(storyPath(lang, story.slug)),
      lastModified: new Date()
    }))
  );

  return [...homeRoutes, ...storyRoutes];
}
