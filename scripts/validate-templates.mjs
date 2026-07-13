// Validates all template JSON files in data/templates/items/.
//
// Usage: node scripts/validate-templates.mjs

import { readdirSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const ITEMS_DIR = join(ROOT, "data", "templates", "items");
const PUBLIC_TEMPLATES_DIR = join(ROOT, "public", "templates");

let errors = 0;
let warnings = 0;

function logError(file, msg) {
  console.error(`  [ERROR] ${file}: ${msg}`);
  errors++;
}

function logWarning(file, msg) {
  console.warn(`  [WARN]  ${file}: ${msg}`);
  warnings++;
}

function validateTemplateFile(jsonPath, slug) {
  const shortPath = `data/templates/items/${slug}/template.json`;
  let raw;
  try {
    raw = readFileSync(jsonPath, "utf-8");
  } catch {
    logError(shortPath, "Cannot read file");
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    logError(shortPath, "Invalid JSON");
    return;
  }

  // Basic field checks (without Zod — runtime JSON validation)
  if (!data.id || typeof data.id !== "string") logError(shortPath, "Missing or invalid 'id'");
  if (!data.slug || typeof data.slug !== "string") logError(shortPath, "Missing or invalid 'slug'");
  if (data.slug !== slug) logError(shortPath, `slug "${data.slug}" does not match directory name "${slug}"`);
  if (!["draft", "published", "archived"].includes(data.status)) {
    logError(shortPath, `Invalid status "${data.status}"`);
  }
  if (!data.name || !data.name.zh || !data.name.en) {
    logError(shortPath, "Missing or invalid 'name' (zh/en required)");
  }
  if (!data.prompt || typeof data.prompt.base !== "string") {
    logError(shortPath, "Missing or invalid 'prompt.base'");
  }

  // Published template checks
  if (data.status === "published") {
    if (!data.name?.zh) logError(shortPath, "Published template must have name.zh");
    if (!data.name?.en) logError(shortPath, "Published template must have name.en");
    if (!data.coverImage) logError(shortPath, "Published template must have coverImage");
    if (!data.prompt?.base) logError(shortPath, "Published template must have prompt.base");

    if (data.coverImage) {
      const imgPath = join(ROOT, "public", data.coverImage.replace(/^\//, ""));
      if (!existsSync(imgPath)) logError(shortPath, `Cover image not found: ${data.coverImage}`);
    }

    if (Array.isArray(data.previewImages)) {
      data.previewImages.forEach((img, i) => {
        const imgPath = join(ROOT, "public", img.replace(/^\//, ""));
        if (!existsSync(imgPath)) logError(shortPath, `Preview image ${i} not found: ${img}`);
      });
    }

    if (Array.isArray(data.referenceImages)) {
      data.referenceImages.forEach((img, i) => {
        const imgPath = join(ROOT, "public", img.replace(/^\//, ""));
        if (!existsSync(imgPath)) logError(shortPath, `Reference image ${i} not found: ${img}`);
      });
    }
  }

  // Draft: allow missing images
  if (data.coverImage && data.coverImage.length > 0) {
    const imgPath = join(ROOT, "public", data.coverImage.replace(/^\//, ""));
    if (!existsSync(imgPath)) logWarning(shortPath, `Cover image not found (draft ok): ${data.coverImage}`);
  }

  // Shot validation
  if (Array.isArray(data.shots)) {
    const shotIds = new Set();
    const shotOrders = new Set();
    data.shots.forEach((shot, i) => {
      if (!shot.id) logError(shortPath, `Shot ${i} missing id`);
      else {
        if (shotIds.has(shot.id)) logError(shortPath, `Duplicate shot id: ${shot.id}`);
        shotIds.add(shot.id);
      }
      if (shot.order != null) {
        if (shotOrders.has(shot.order)) logError(shortPath, `Duplicate shot order: ${shot.order}`);
        shotOrders.add(shot.order);
      }
    });
  }

  // Generation config
  if (data.generation) {
    if (data.generation.imageCount && data.generation.imageCount < 1) {
      logError(shortPath, "generation.imageCount must be >= 1");
    }
    if (data.generation.width && data.generation.width < 1) {
      logError(shortPath, "generation.width must be positive");
    }
    if (data.generation.height && data.generation.height < 1) {
      logError(shortPath, "generation.height must be positive");
    }
  }

  return data;
}

function main() {
  console.log("[templates:validate] Starting...\n");

  if (!existsSync(ITEMS_DIR)) {
    console.log("[templates:validate] No items directory, skipping.");
    return;
  }

  const entries = readdirSync(ITEMS_DIR, { withFileTypes: true });
  const templateDirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith("."));
  const ids = new Set();
  const slugs = new Set();

  if (templateDirs.length === 0) {
    console.log("[templates:validate] No template directories found.");
  }

  for (const dir of templateDirs) {
    const jsonPath = join(ITEMS_DIR, dir.name, "template.json");
    if (!existsSync(jsonPath)) {
      logError(`data/templates/items/${dir.name}`, "Missing template.json");
      continue;
    }

    const data = validateTemplateFile(jsonPath, dir.name);

    if (data) {
      if (ids.has(data.id)) logError(`data/templates/items/${dir.name}`, `Duplicate template id: ${data.id}`);
      else ids.add(data.id);

      if (slugs.has(data.slug)) logError(`data/templates/items/${dir.name}`, `Duplicate template slug: ${data.slug}`);
      else slugs.add(data.slug);
    }
  }

  console.log(`\n[templates:validate] Done. ${errors} error(s), ${warnings} warning(s).`);
  if (errors > 0) process.exitCode = 1;
}

main();