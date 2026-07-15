#!/usr/bin/env tsx
/**
 * 模板种子脚本
 *
 * 从 data/templates/seed-data.ts 读取模板数据，写入数据库。
 *
 * 使用方式：
 *   pnpm seed:templates
 *
 * 幂等性：
 *   - 通过 slug 检查模板是否已存在
 *   - 已存在的模板会被跳过（不会重复创建）
 */

import { randomUUID } from "crypto";
import { resolve } from "path";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { portraitTemplate, portraitTemplateShot } from "../lib/db/schema";
import { TEMPLATE_SEEDS } from "../data/templates/seed-data";

// 加载环境变量
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ 未找到 DATABASE_URL 环境变量");
    console.log("请确保 .env.local 文件中设置了 DATABASE_URL");
    process.exit(1);
  }

  if (TEMPLATE_SEEDS.length === 0) {
    console.log("⚠️  TEMPLATE_SEEDS 为空，没有模板需要 seed。");
    console.log("请在 data/templates/seed-data.ts 中添加模板数据。");
    process.exit(0);
  }

  const queryClient = postgres(process.env.DATABASE_URL);
  const db = drizzle(queryClient);

  console.log(`📦 准备 seed ${TEMPLATE_SEEDS.length} 个模板...\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const seed of TEMPLATE_SEEDS) {
    const slug = seed.slug;
    console.log(`🔍 检查模板: ${slug}`);

    try {
      // 幂等检查：slug 已存在则跳过
      const existing = await db
        .select({ id: portraitTemplate.id, status: portraitTemplate.status })
        .from(portraitTemplate)
        .where(eq(portraitTemplate.slug, slug))
        .limit(1);

      if (existing.length > 0) {
        console.log(`  ⏭️  已存在，跳过 (status: ${existing[0].status})`);
        skipped++;
        continue;
      }

      const templateId = randomUUID();
      const now = new Date();

      // 在事务中创建模板 + shots
      await db.transaction(async (tx) => {
        await tx.insert(portraitTemplate).values({
          id: templateId,
          slug: seed.slug,
          nameZh: seed.nameZh,
          nameEn: seed.nameEn,
          descriptionZh: seed.descriptionZh,
          descriptionEn: seed.descriptionEn,
          category: seed.category,
          dynasty: seed.dynasty,
          stylePrompt: seed.stylePrompt,
          generationConfig: JSON.stringify(seed.generationConfig),
          creditsPerGeneration: seed.creditsPerGeneration,
          status: "draft",
          version: 1,
          createdAt: now,
          updatedAt: now,
        });

        if (seed.shots.length > 0) {
          await tx.insert(portraitTemplateShot).values(
            seed.shots.map((s) => ({
              id: randomUUID(),
              templateId,
              shotKey: s.shotKey,
              sortOrder: s.sortOrder,
              titleZh: s.titleZh,
              titleEn: s.titleEn,
              referenceImage: s.referenceImage,
              stylePrompt: s.stylePrompt,
              createdAt: now,
              updatedAt: now,
            })),
          );
        }
      });

      console.log(`  ✅ 创建成功 (${seed.shots.length} shots)`);
      created++;
    } catch (error) {
      console.error(`  ❌ 创建失败:`, error instanceof Error ? error.message : error);
      failed++;
    }
  }

  console.log(`\n📊 结果: ${created} 新建, ${skipped} 跳过, ${failed} 失败`);

  await queryClient.end();
  process.exit(failed > 0 ? 1 : 0);
}

main();