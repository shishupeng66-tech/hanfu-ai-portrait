#!/usr/bin/env tsx
/**
 * 模板种子脚本
 *
 * 从 data/templates/seed-data.ts 读取模板数据，
 * 通过 createTemplate() 写入数据库。
 *
 * 使用方式：
 *   pnpm seed:templates
 *
 * 幂等性：
 *   - 通过 slug 检查模板是否已存在
 *   - 已存在的模板会被跳过（不会重复创建）
 */

import { resolve } from "path";
import dotenv from "dotenv";

// 必须在其他 import 之前加载环境变量（createTemplate 内部依赖 DATABASE_URL）
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { createTemplate, getTemplateBySlug } from "@/lib/db/template-repository";
import { TEMPLATE_SEEDS } from "@/data/templates/seed-data";

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

  console.log(`📦 准备 seed ${TEMPLATE_SEEDS.length} 个模板...\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const seed of TEMPLATE_SEEDS) {
    const slug = seed.slug;
    console.log(`🔍 检查模板: ${slug}`);

    try {
      // 幂等检查：slug 已存在则跳过
      const existing = await getTemplateBySlug(slug);
      if (existing) {
        console.log(`  ⏭️  已存在，跳过 (status: ${existing.status})`);
        skipped++;
        continue;
      }

      await createTemplate(
        {
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
        },
        seed.shots.map((s) => ({
          shotKey: s.shotKey,
          sortOrder: s.sortOrder,
          titleZh: s.titleZh,
          titleEn: s.titleEn,
          referenceImage: s.referenceImage,
          stylePrompt: s.stylePrompt,
        })),
      );

      console.log(`  ✅ 创建成功 (${seed.shots.length} shots)`);
      created++;
    } catch (error) {
      console.error(`  ❌ 创建失败:`, error instanceof Error ? error.message : error);
      failed++;
    }
  }

  console.log(`\n📊 结果: ${created} 新建, ${skipped} 跳过, ${failed} 失败`);
  process.exit(failed > 0 ? 1 : 0);
}

main();