import { getPublicPublishedTemplates, getPublicFeaturedTemplates } from "@/data/templates/server";
import GenerateClientPage from "./generate-client";

export default function GeneratePage() {
  const templates = getPublicPublishedTemplates();
  const featuredTemplates = getPublicFeaturedTemplates();
  return <GenerateClientPage templates={templates} featuredTemplates={featuredTemplates} />;
}