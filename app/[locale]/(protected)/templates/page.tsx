import { getPublicPublishedTemplates } from "@/data/templates/server";
import TemplatesClientPage from "./templates-client";

export default function TemplatesPage() {
  const templates = getPublicPublishedTemplates();
  return <TemplatesClientPage templates={templates} />;
}