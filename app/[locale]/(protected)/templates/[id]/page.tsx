import { getPublicTemplateById, getPublicTemplateBySlug } from "@/data/templates/server";
import TemplateDetailClientPage from "./detail-client";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  // Try by slug first, then by id
  const template = getPublicTemplateBySlug(id) ?? getPublicTemplateById(id);
  return <TemplateDetailClientPage template={template} />;
}