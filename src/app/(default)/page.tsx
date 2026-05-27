import { StoryCatalog } from "@/components/StoryCatalog";
import { defaultLang } from "@/lib/i18n";
import { localizedHomeAlternates } from "@/lib/seo";
import { getAllStoryMeta } from "@/lib/stories";

export function generateMetadata() {
  return {
    alternates: {
      canonical: "/",
      ...localizedHomeAlternates()
    }
  };
}

export default async function RootHomePage() {
  const stories = await getAllStoryMeta();

  return <StoryCatalog lang={defaultLang} stories={stories} />;
}
