/**
 * E2E test setup script for admin template center.
 * Creates a test template directly in the database.
 * Run: pnpm tsx scripts/e2e-template-setup.ts
 */
import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });
import { randomUUID } from "crypto";
import { db } from "../lib/db";
import { portraitTemplate, portraitTemplateShot } from "../lib/db/schema";

async function main() {
  const templateId = "e2e-test-template-001";
  const shotId = "e2e-test-shot-001";
  const now = new Date();

  console.log("=== E2E Template Setup ===\n");

  // 1. Check if template already exists
  const existing = await db
    .select({ id: portraitTemplate.id })
    .from(portraitTemplate)
    .where(eq(portraitTemplate.id, templateId));

  if (existing.length > 0) {
    console.log("Template already exists. Deleting old data...");
    await db.delete(portraitTemplate).where(eq(portraitTemplate.id, templateId));
  }

  // 2. Create template
  console.log("Creating test template...");
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
  console.log("  Template created: id=" + templateId);

  // 3. Create shot
  console.log("Creating test shot...");
  await db.insert(portraitTemplateShot).values({
    id: shotId,
    templateId: templateId,
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
  console.log("  Shot created: id=" + shotId);

  // 4. Verify
  console.log("\n=== Verification ===");
  const t = await db
    .select()
    .from(portraitTemplate)
    .where(eq(portraitTemplate.id, templateId));
  console.log("Template:", t[0]?.nameZh, "| status:", t[0]?.status, "| slug:", t[0]?.slug);

  const s = await db
    .select()
    .from(portraitTemplateShot)
    .where(eq(portraitTemplateShot.templateId, templateId));
  console.log("Shots:", s.length, "| first:", s[0]?.titleZh);

  console.log("\n=== DONE ===");
  console.log("Template ID:", templateId);
  console.log("Status: draft");
  console.log("Credits: 1");
  console.log("Ready for E2E testing.");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});

// Need to import eq for the check
import { eq } from "drizzle-orm";