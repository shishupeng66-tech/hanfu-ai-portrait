# 模板清理分析报告

> 生成时间：2026-07-13
> 项目根目录：d:\github desktop仓库\hanfu-ai-portrait

---

## 一、修改前 Git 状态

```
On branch main
已修改（未暂存）：
  - app/[locale]/(admin)/layout.tsx
  - app/api/admin/users/[userId]/credits/route.ts
  - app/api/admin/users/[userId]/subscription/route.ts
  - features/admin/components/users-table.tsx
  - lib/auth/admin.ts
未跟踪：
  - lib/auth/admin-api.ts
```

以上均为 admin 后台相关改动，与模板系统无关，本次清理已避开。

---

## 二、旧模板数据来源分析

### 2.1 核心数据源

| 文件 | 内容 | 模板数 | 用途 |
|------|------|--------|------|
| `features/templates/template-data.ts` | `hanfuTemplates` 数组 | 15 | 前端模板库展示、生成页模板选择 |
| `lib/portrait-templates.ts` | `portraitTemplates` 对象 | 1 | 后端 AI 生成逻辑（核心） |
| `features/works/mock-works.ts` | `MOCK_WORKS` 数组 | 8 | 作品页 mock 数据 |

### 2.2 15 个旧前端模板 ID

| ID | 中文名 | 英文名 | 分类 |
|----|--------|--------|------|
| tangGlamour | 大唐风华 | Tang Glamour | tang |
| palaceLantern | 宫灯夜宴 | Palace Lantern | tang |
| songElegance | 宋韵清雅 | Song Elegance | song |
| teaGathering | 雅集茶会 | Tea Gathering | song |
| landscapePlain | 山水素影 | Landscape Scholar | song |
| mingFormal | 明制礼服 | Ming Formal | ming |
| phoenixCrown | 凤冠霞帔 | Phoenix Crown | ming |
| boudoirLady | 闺阁佳人 | Boudoir Lady | ming |
| qingPalace | 清宫华服 | Qing Palace | qing |
| qipaoFlower | 旗袍花影 | Modern Qipao | qipao |
| bluePorcelain | 青花瓷韵 | Blue Porcelain | modern |
| modernGuofeng | 国风时尚 | Guofeng Fashion | modern |
| orientalMagazine | 东方杂志 | Oriental Vogue | modern |
| dunhuangMuse | 敦煌飞天 | Dunhuang Muse | dunhuang |
| modernQipao | 现代旗袍 | Modern Qipao | qipao |

**关键发现**：所有 15 个前端模板的 `apiTemplateKey` 都指向同一个值 `"nightLanternRedBlackHanfu"`，即它们本质上是同一个生成能力的 15 种不同前端展示变体。

---

## 三、分类决策

### 3.1 可删除：旧示例模板数据（A 类）

#### `features/templates/template-data.ts`

**删除内容**：
- `hanfuTemplates` 数组（15 个条目）
- `featuredTemplateIds` 数组
- `templateLibraryIds` 数组
- `defaultGallery` 数组（引用 hanfu-hero 图片）
- `makeTemplate` 工厂函数（旧模板专用）

**保留内容**：
- `ApiTemplateKey` 类型
- `TemplateDynasty` 类型
- `TemplateCategory` 类型
- `TemplateFilter` 类型
- `TemplateCategoryWithAll` 类型
- `HanfuTemplate` 类型（需调整）
- `dynastyTabs` 常量
- `templateLibraryData` 派生数据
- `getTemplateById()` 函数
- `getTemplateBySlug()` 函数（如存在）

**引用文件**：
- `app/[locale]/(protected)/templates/page.tsx` → 导入 `templateLibraryData`, `TemplateCategoryWithAll`, `TemplateFilter`
- `app/[locale]/(protected)/templates/[id]/page.tsx` → 导入 `getTemplateById`
- `app/[locale]/(protected)/generate/page.tsx` → 导入 `dynastyTabs`, `featuredTemplateIds`, `hanfuTemplates`, `HanfuTemplate`

**处理方式**：清空数据数组，保留类型和工具函数，保持文件存在。

#### `features/works/mock-works.ts`

**删除内容**：整个文件（全部为 mock 作品数据）

**引用文件**：无外部引用（仅内部自引用 `getLocalizedWorks`）

**处理方式**：删除整个文件。

#### `messages/zh.json` 和 `messages/en.json` 中的模板数据

**删除内容**：
- `templates.templates.*` 下 15 个模板的完整数据（名称、描述、标签等）
- `generate.styleSelection.templates.*` 下 15 个模板的简化数据

**保留内容**：
- `templates.list.*` 模板列表页 UI 文本
- `templates.detail.*` 模板详情页 UI 文本
- `generate.styleSelection.*` 生成页 UI 文本（除 templates 子键外）
- `generate.styleSelection.dynasty.*` 朝代名称
- 所有其他 i18n 键

### 3.2 必须保留：核心生成提示词（C 类）

#### `lib/portrait-templates.ts` - 夜灯红黑汉服

**状态**：**完全保留，不做任何修改**

**判断依据**：
- `nightLanternRedBlackHanfu` 是 `portraitTemplates` 中唯一的模板
- 它是 `app/api/generate/route.ts` 中实际调用的生成能力
- 所有 15 个前端模板都通过 `apiTemplateKey: "nightLanternRedBlackHanfu"` 指向它
- 它包含完整的 prompt 工程（base prompt + 4 shot prompts + negative prompt）
- 它支持 trial 和 set 两种生成模式
- 删除前端模板数据后，它仍可作为独立生成能力存在

**定义位置**：`lib/portrait-templates.ts` 第 21-57 行

**引用位置**：`app/api/generate/route.ts` 第 12-13 行（导入）、第 175 行（使用）

**调用链路**：
```
generate/page.tsx → POST /api/generate → portraitTemplates[templateKey] → generatePortraitImages()
```

**是否依赖 templateId**：否，它通过 `templateKey` 直接匹配，不依赖前端模板 ID。

### 3.3 必须保留：公共图片（D 类）

#### `public/images/hanfu-hero/*`（6 个文件）

**引用分析**：
| 文件 | 被引用位置 |
|------|-----------|
| palace-red-01.jpg | template-data.ts, mock-works.ts, **home/hero.tsx** |
| palace-red-02.jpg | template-data.ts, mock-works.ts, **home/hero.tsx** |
| palace-red-03.jpg | template-data.ts, mock-works.ts, **home/hero.tsx** |
| jade-temple-01.jpg | template-data.ts, mock-works.ts, **home/hero.tsx** |
| spring-pink-01.jpg | template-data.ts, mock-works.ts, **home/hero.tsx** |
| festival-lantern-01.jpg | template-data.ts, mock-works.ts, **home/hero.tsx** |

**决策**：**全部保留**。这些图片被首页 Hero 组件使用，属于品牌/公共素材。清除模板数据后，它们仍被 home/hero.tsx 引用。

#### 其他公共图片

| 路径 | 用途 | 决策 |
|------|------|------|
| `public/hero-1/2/3.png` | 旧版 Hero 组件 | 保留（品牌素材） |
| `public/images/hero-bg/*` | Hero 背景图 | 保留 |
| `public/brand/*` | 品牌 Logo | 保留 |
| `public/starter/demo/images/*` | Starter 遗留 demo 图 | 保留（无引用，但非模板相关） |
| `public/logos/*` | 第三方 Logo | 保留 |
| `public/avatar.jpeg` | 默认头像 | 保留 |
| `public/favicon.png` | 网站图标 | 保留 |

### 3.4 必须保留：未匹配提示词（E 类）

#### `app/api/generate/route.ts` 中的内联 `templates` 对象

**内容**：qipao（新中式旗袍）、weijin（魏晋宋制汉服）、tang（唐风红墙）三套 prompts

**用途**：代码注释明确标注为 "legacy inline templates reachable for prompt reference"，即作为 prompt 工程参考保留。

**决策**：**保留**。这是 prompt 参考代码，不参与当前业务流转。但需要确认它们确实未在使用中。

**验证**：代码中 `void templates;` 和 `void defaultNegativePrompt;` 确保它们不会被使用，仅用于抑制 lint 警告。

---

## 四、删除计划

### 4.1 删除文件

| 文件 | 原因 |
|------|------|
| `features/works/mock-works.ts` | 全部为 mock 数据，无外部引用 |

### 4.2 修改文件

| 文件 | 修改内容 |
|------|---------|
| `features/templates/template-data.ts` | 清空模板数组，保留类型和工具函数 |
| `messages/zh.json` | 删除 15 个模板的 i18n 数据 |
| `messages/en.json` | 删除 15 个模板的 i18n 数据 |
| `app/[locale]/(protected)/generate/page.tsx` | 移除默认 templateId，处理空模板 |
| `app/[locale]/(protected)/templates/page.tsx` | 处理空模板库状态 |
| `app/[locale]/(protected)/templates/[id]/page.tsx` | 更新 i18n 引用方式 |
| `app/[locale]/(protected)/works/page.tsx` | 移除 mock 数据依赖 |

### 4.3 不删除的文件

| 文件 | 原因 |
|------|------|
| `lib/portrait-templates.ts` | 核心生成能力 |
| `app/api/generate/route.ts` | 核心生成 API |
| `public/images/hanfu-hero/*` | 被首页 Hero 引用 |
| `public/hero-*.png` | 品牌素材 |
| `public/images/hero-bg/*` | 品牌素材 |
| `public/brand/*` | 品牌素材 |
| `public/starter/demo/images/*` | 非模板相关 |
| 所有 admin 页面 | 后台管理 |
| 所有通知/定价/政策页面 | 业务通用 |

---

## 五、新模板库结构

```
data/templates/
├── index.ts              # 统一加载入口
├── schema.ts             # Zod schema 校验
├── README.md             # 使用说明
└── items/
    └── .gitkeep           # 空目录占位

public/templates/
└── (将来按 slug 组织)
    └── <template-slug>/
        ├── cover.webp
        ├── preview-01.webp
        └── reference-01.webp
```

---

## 六、夜灯红黑汉服调用分析

- **定义位置**：`lib/portrait-templates.ts:21-57`
- **引用位置**：`app/api/generate/route.ts:12-13,175`
- **调用入口**：`POST /api/generate` → `portraitTemplates[templateKey]`
- **最终 API**：ARK/Volcano Engine 图像生成 API
- **是否依赖 templateId**：否，通过 `templateKey` 直接匹配
- **是否属于独立生成能力**：是，它是 `portraitTemplates` 中唯一的模板
- **判断**：**必须保留**，它是当前唯一的正式生成能力