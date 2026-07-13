import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { portraitTemplate, portraitTemplateShot } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * TEMPORARY: E2E test template setup.
 * DELETE this file after E2E testing is complete.
 * This bypasses auth for testing purposes only.
 */
export async function POST() {
  const templateId = "e2e-test-template-001";
  const shotId = "e2e-test-shot-001";
  const now = new Date();
  const results: string[] = [];

  try {
    // Delete existing if any
    const existing = await db
      .select({ id: portraitTemplate.id })
      .from(portraitTemplate)
      .where(eq(portraitTemplate.id, templateId));
    if (existing.length > 0) {
      await db.delete(portraitTemplate).where(eq(portraitTemplate.id, templateId));
      results.push("Deleted existing template");
    }

    // Create template
    await db.insert(portraitTemplate).values({
      id: templateId,
      slug: "admin-template-test",
      status: "draft",
      version: 1,
      nameZh: "模板中心测试",
      nameEn: "Template Center Test",
      descriptionZh: "仅用于测试管理员模板中心端到端流程",
      descriptionEn: "For E2E testing of admin template center only",
      category: "test",
      dynasty: "test",
      styles: ["test"],
      tags: ["test", "e2e"],
      coverImage:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      previewImages: [],
      referenceImages: [],
      basePrompt: "仅用于测试模板中心流程，不用于正式生成",
      negativePrompt: "",
      generationConfig: JSON.stringify({
        model: "seedream-4.5",
        aspectRatio: "3:4",
        width: 1536,
        height: 2048,
        imageCount: 1,
      }),
      creditsPerGeneration: 1,
      featured: false,
      sortOrder: 0,
      createdBy: "e2e-test",
      updatedBy: "e2e-test",
      createdAt: now,
      updatedAt: now,
    });
    results.push("Template created: id=" + templateId);

    // Create shot
    await db.insert(portraitTemplateShot).values({
      id: shotId,
      templateId,
      shotKey: "shot-01",
      sortOrder: 1,
      titleZh: "测试镜头",
      titleEn: "Test Shot",
      prompt: "仅用于验证分镜提示词读取",
      pose: "standing",
      camera: "front",
      composition: "full-body",
      expression: "neutral",
      referenceImage: "",
      createdAt: now,
      updatedAt: now,
    });
    results.push("Shot created: id=" + shotId);

    return NextResponse.json({
      ok: true,
      templateId,
      shotId,
      status: "draft",
      credits: 1,
      steps: results,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error), steps: results },
      { status: 500 },
    );
  }
}

/**
 * GET: verify the test template
 */
export async function GET() {
  const templateId = "e2e-test-template-001";
  try {
    const t = await db
      .select()
      .from(portraitTemplate)
      .where(eq(portraitTemplate.id, templateId));
    const s = await db
      .select()
      .from(portraitTemplateShot)
      .where(eq(portraitTemplateShot.templateId, templateId));

    return NextResponse.json({
      ok: true,
      template: t[0] ?? null,
      shots: s,
      count: s.length,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}

/**
 * PATCH: update template status (for publish/archive testing)
 */
export async function PATCH(req: Request) {
  const templateId = "e2e-test-template-001";
  try {
    const body = await req.json();
    const { status } = body;

    if (!status || !["draft", "published", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await db
      .update(portraitTemplate)
      .set({
        status,
        updatedAt: new Date(),
        archivedAt: status === "archived" ? new Date() : null,
      })
      .where(eq(portraitTemplate.id, templateId));

    const t = await db
      .select()
      .from(portraitTemplate)
      .where(eq(portraitTemplate.id, templateId));

    return NextResponse.json({
      ok: true,
      status: t[0]?.status,
      templateId,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}