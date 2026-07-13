import { NextRequest } from "next/server";
import { publishTemplate } from "@/lib/admin/template-actions";

// POST /api/admin/templates/[id]/publish
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return publishTemplate(req, id);
}