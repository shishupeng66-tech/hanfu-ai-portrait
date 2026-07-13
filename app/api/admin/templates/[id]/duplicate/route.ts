import { NextRequest } from "next/server";
import { duplicateTemplateAction } from "@/lib/admin/template-actions";

// POST /api/admin/templates/[id]/duplicate
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return duplicateTemplateAction(req, id);
}