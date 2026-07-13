import { NextRequest } from "next/server";
import { archiveTemplate } from "@/lib/admin/template-actions";

// POST /api/admin/templates/[id]/archive
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return archiveTemplate(req, id);
}