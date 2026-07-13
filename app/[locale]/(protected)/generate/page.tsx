import { getPublicPublishedTemplates, getPublicFeaturedTemplates } from "@/lib/db/template-repository";
import GenerateClientPage from "./generate-client";

export default async function GeneratePage() {
  const templates = await getPublicPublishedTemplates();
  const featuredTemplates = await getPublicFeaturedTemplates();
  return <GenerateClientPage templates={templates} featuredTemplates={featuredTemplates} />;
}