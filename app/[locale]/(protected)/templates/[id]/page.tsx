import { getPublicTemplateById, getPublicTemplateBySlug } from "@/lib/db/template-repository";
import TemplateDetailClientPage from "./detail-client";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  // Try by slug first, then by id
  const template = (await getPublicTemplateBySlug(id)) ?? (await getPublicTemplateById(id));
  return <TemplateDetailClientPage template={template} />;
}