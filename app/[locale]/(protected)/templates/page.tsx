import { getPublicPublishedTemplates } from "@/lib/db/template-repository";
import TemplatesClientPage from "./templates-client";

export default async function TemplatesPage() {
  const templates = await getPublicPublishedTemplates();
  return <TemplatesClientPage templates={templates} />;
}