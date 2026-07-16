"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Save,
  CheckCircle,
  Archive,
  X,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ShotForm = {
  key: string; // temp key for React list
  shotKey: string;
  sortOrder: number;
  titleZh: string;
  titleEn: string;
  referenceImage: string;
  stylePrompt: string;
};

type TemplateFormData = {
  slug: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  category: string;
  dynasty: string;
  styles: string[];
  tags: string[];
  stylePrompt: string;
  coverImage: string;
  previewImages: string[];
  // Legacy fields — not shown in UI, kept for API/DB compatibility
  referenceImages: string[];
  basePrompt: string;
  negativePrompt: string;
  generationConfig: string;
  creditsPerGeneration: number;
  memberCreditsPerGeneration: number | null;
  featured: boolean;
  sortOrder: number;
  version: number;
  status: string;
  shots: ShotForm[];
};

const DEFAULT_FORM: TemplateFormData = {
  slug: "",
  nameZh: "",
  nameEn: "",
  descriptionZh: "",
  descriptionEn: "",
  category: "hanfu",
  dynasty: "",
  styles: [],
  tags: [],
  stylePrompt: "",
  coverImage: "",
  previewImages: [],
  referenceImages: [],
  basePrompt: "",
  negativePrompt: "",
  generationConfig: JSON.stringify({ model: "doubao-seedream-5-0-lite", size: "3072x4096", aspectRatio: "3:4", count: 1, workflow: "identity_transfer" }, null, 2),
  creditsPerGeneration: 4,
  memberCreditsPerGeneration: null,
  featured: false,
  sortOrder: 0,
  version: 1,
  status: "draft",
  shots: [],
};

const CATEGORIES = [
  { value: "hanfu", labelZh: "汉服", labelEn: "Hanfu" },
  { value: "modern", labelZh: "现代", labelEn: "Modern" },
  { value: "dunhuang", labelZh: "敦煌", labelEn: "Dunhuang" },
  { value: "qipao", labelZh: "旗袍", labelEn: "Qipao" },
];

const DYNASTIES = [
  { value: "", labelZh: "无", labelEn: "None" },
  { value: "tang", labelZh: "唐", labelEn: "Tang" },
  { value: "song", labelZh: "宋", labelEn: "Song" },
  { value: "yuan", labelZh: "元", labelEn: "Yuan" },
  { value: "ming", labelZh: "明", labelEn: "Ming" },
  { value: "qing", labelZh: "清", labelEn: "Qing" },
  { value: "modern", labelZh: "现代", labelEn: "Modern" },
  { value: "dunhuang", labelZh: "敦煌", labelEn: "Dunhuang" },
];

const MODEL_OPTIONS = [
  "doubao-seedream-5-0-lite",
];

const SIZE_OPTIONS = [
  "2048x2732",
  "3072x4096",
];

const ASPECT_RATIO_OPTIONS = [
  "2:3",
  "3:4",
  "1:1",
  "4:3",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminTemplateForm({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const locale = useLocale();
  const isZh = locale === "zh";
  const isEdit = !!templateId;

  const [form, setForm] = useState<TemplateFormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Load template for edit
  useEffect(() => {
    if (!templateId) return;
    setLoading(true);
    fetch(`/api/admin/templates/${templateId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Template not found");
        return res.json();
      })
      .then((data) => {
        setForm({
          slug: data.slug ?? "",
          nameZh: data.nameZh ?? "",
          nameEn: data.nameEn ?? "",
          descriptionZh: data.descriptionZh ?? "",
          descriptionEn: data.descriptionEn ?? "",
          category: data.category ?? "hanfu",
          dynasty: data.dynasty ?? "",
          styles: data.styles ?? [],
          tags: data.tags ?? [],
          stylePrompt: data.stylePrompt ?? "",
          coverImage: data.coverImage ?? "",
          previewImages: data.previewImages ?? [],
          referenceImages: data.referenceImages ?? [],
          basePrompt: data.basePrompt ?? "",
          negativePrompt: data.negativePrompt ?? "",
          generationConfig: data.generationConfig ?? JSON.stringify({ model: "doubao-seedream-5-0-lite", size: "3072x4096", aspectRatio: "3:4", count: 1, workflow: "identity_transfer" }, null, 2),
          creditsPerGeneration: data.creditsPerGeneration ?? 4,
          memberCreditsPerGeneration: data.memberCreditsPerGeneration ?? null,
          featured: data.featured ?? false,
          sortOrder: data.sortOrder ?? 0,
          version: data.version ?? 1,
          status: data.status ?? "draft",
          shots: (data.shots ?? []).map((s: ShotForm, i: number) => ({
            key: `shot-${i}`,
            shotKey: s.shotKey,
            sortOrder: s.sortOrder,
            titleZh: s.titleZh,
            titleEn: s.titleEn,
            referenceImage: s.referenceImage ?? "",
            stylePrompt: s.stylePrompt ?? "",
          })),
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [templateId]);

  // Unsaved changes warning
  useEffect(() => {
    if (!hasUnsaved) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);

  const updateField = <K extends keyof TemplateFormData>(key: K, value: TemplateFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setHasUnsaved(true);
  };

  const updateShot = (idx: number, field: keyof ShotForm, value: string | number) => {
    setForm((prev) => {
      const shots = [...prev.shots];
      shots[idx] = { ...shots[idx], [field]: value };
      return { ...prev, shots };
    });
    setHasUnsaved(true);
  };

  const addShot = () => {
    const idx = form.shots.length;
    setForm((prev) => ({
      ...prev,
      shots: [
        ...prev.shots,
        {
          key: `new-${Date.now()}`,
          shotKey: `shot-${String(idx + 1).padStart(2, "0")}`,
          sortOrder: idx + 1,
          titleZh: "",
          titleEn: "",
          referenceImage: "",
          stylePrompt: "",
        },
      ],
    }));
    setHasUnsaved(true);
  };

  const removeShot = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      shots: prev.shots.filter((_, i) => i !== idx).map((s, i) => ({ ...s, sortOrder: i + 1 })),
    }));
    setHasUnsaved(true);
  };

  const moveShot = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= form.shots.length) return;
    setForm((prev) => {
      const shots = [...prev.shots];
      [shots[idx], shots[newIdx]] = [shots[newIdx], shots[idx]];
      return { ...prev, shots: shots.map((s, i) => ({ ...s, sortOrder: i + 1 })) };
    });
    setHasUnsaved(true);
  };

  const handleImageUpload = async (
    file: File,
    folder: string,
    onSuccess: (url: string) => void,
  ) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("templateId", templateId || form.slug || "new");
      fd.append("folder", folder);

      const res = await fetch("/api/admin/templates/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      onSuccess(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (targetStatus?: string) => {
    setSaving(true);
    setError(null);
    try {
      // Build generationConfig JSON from structured fields
      const genConfig = (() => {
        try { return JSON.parse(form.generationConfig); } catch { return {}; }
      })();
      const updatedGenConfig = {
        ...genConfig,
        model: (() => { try { return JSON.parse(form.generationConfig).model ?? ""; } catch { return ""; } })(),
        size: (() => { try { return JSON.parse(form.generationConfig).size ?? ""; } catch { return ""; } })(),
        aspectRatio: (() => { try { return JSON.parse(form.generationConfig).aspectRatio ?? ""; } catch { return ""; } })(),
        count: 1,
        workflow: "identity_transfer",
      };

      const body = {
        ...form,
        status: targetStatus ?? form.status,
        generationConfig: JSON.stringify(updatedGenConfig),
        memberCreditsPerGeneration: form.memberCreditsPerGeneration ?? undefined,
        shots: form.shots.map((s) => ({
          shotKey: s.shotKey,
          sortOrder: s.sortOrder,
          titleZh: s.titleZh,
          titleEn: s.titleEn,
          referenceImage: s.referenceImage,
          stylePrompt: s.stylePrompt,
        })),
      };

      const url = isEdit ? `/api/admin/templates/${templateId}` : "/api/admin/templates";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const details = Array.isArray(err.details) ? err.details : [];
        const msg = err.error || "Save failed";
        if (details.length > 0) {
          setError([msg, ...details.map((d: string) => `- ${d}`)].join("\n"));
        } else {
          setError(msg);
        }
        setSaving(false);
        return;
      }

      const saved = await res.json();
      setHasUnsaved(false);

      if (targetStatus === "published") {
        const publishRes = await fetch(`/api/admin/templates/${saved.id}/publish`, { method: "POST" });
        const publishData = await publishRes.json().catch(() => ({}));

        if (!publishRes.ok) {
          const details = Array.isArray(publishData.details) ? publishData.details : [];
          const msg = publishData.error || "Publish failed";
          if (details.length > 0) {
            setError([msg, ...details.map((d: string) => `- ${d}`)].join("\n"));
          } else {
            setError(msg);
          }
          setSaving(false);
          return;
        }
      }

      router.replace(`/${locale}/admin/templates`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => handleSave("published");
  const handleArchive = async () => {
    if (!isEdit || !templateId) return;
    if (!window.confirm(isZh ? "确定要下架该模板吗？" : "Archive this template?")) return;
    await fetch(`/api/admin/templates/${templateId}/archive`, { method: "POST" });
    router.push(`/${locale}/admin/templates`);
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const inputClass = "w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground placeholder:text-muted-foreground hover:border-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors";
  const textareaClass = "w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground placeholder:text-muted-foreground hover:border-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring min-h-[80px] transition-colors";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  // Parse generation config for structured fields
  const genConfig = (() => { try { return JSON.parse(form.generationConfig); } catch { return {}; } })();
  const genModel = typeof genConfig.model === "string" ? genConfig.model : "doubao-seedream-5-0-lite";
  const genSize = typeof genConfig.size === "string" ? genConfig.size : "3072x4096";
  const genAspectRatio = typeof genConfig.aspectRatio === "string" ? genConfig.aspectRatio : "3:4";

  const updateGenConfig = (key: string, value: string) => {
    try {
      const config = JSON.parse(form.generationConfig);
      config[key] = value;
      updateField("generationConfig", JSON.stringify(config, null, 2));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? (isZh ? "编辑模板" : "Edit Template") : (isZh ? "新建模板" : "New Template")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEdit ? form.nameZh || form.slug : (isZh ? "创建新的汉服写真模板" : "Create a new Hanfu portrait template")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <button
              onClick={() => router.push(`/${locale}/admin/templates`)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
            >
              <X className="h-4 w-4" />
              {isZh ? "返回" : "Back"}
            </button>
          )}
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {isZh ? "保存草稿" : "Save Draft"}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            {isZh ? "保存并发布" : "Save & Publish"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {/* Section 1: Basic Info */}
      <Section title={isZh ? "基本信息" : "Basic Info"}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{isZh ? "中文名称 *" : "Chinese Name *"}</label>
            <input className={inputClass} value={form.nameZh} onChange={(e) => updateField("nameZh", e.target.value)} placeholder={isZh ? "如：盛唐金影" : "e.g. Tang Glamour"} />
          </div>
          <div>
            <label className={labelClass}>{isZh ? "英文名称 *" : "English Name *"}</label>
            <input className={inputClass} value={form.nameEn} onChange={(e) => updateField("nameEn", e.target.value)} placeholder="e.g. Tang Glamour" />
          </div>
          <div>
            <label className={labelClass}>Slug *</label>
            <input className={inputClass} value={form.slug} onChange={(e) => updateField("slug", e.target.value)} placeholder="tang-glamour" />
          </div>
          <div>
            <label className={labelClass}>{isZh ? "分类" : "Category"}</label>
            <select className={inputClass} value={form.category} onChange={(e) => updateField("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{isZh ? c.labelZh : c.labelEn}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelClass}>{isZh ? "中文简介" : "Chinese Description"}</label>
            <textarea className={textareaClass} value={form.descriptionZh} onChange={(e) => updateField("descriptionZh", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{isZh ? "英文简介" : "English Description"}</label>
            <textarea className={textareaClass} value={form.descriptionEn} onChange={(e) => updateField("descriptionEn", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <label className={labelClass}>{isZh ? "朝代" : "Dynasty"}</label>
            <select className={inputClass} value={form.dynasty} onChange={(e) => updateField("dynasty", e.target.value)}>
              {DYNASTIES.map((d) => (
                <option key={d.value} value={d.value}>{isZh ? d.labelZh : d.labelEn}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{isZh ? "推荐" : "Featured"}</label>
            <select className={inputClass} value={form.featured ? "true" : "false"} onChange={(e) => updateField("featured", e.target.value === "true")}>
              <option value="false">{isZh ? "否" : "No"}</option>
              <option value="true">{isZh ? "是" : "Yes"}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{isZh ? "排序" : "Sort Order"}</label>
            <input className={inputClass} type="number" value={form.sortOrder} onChange={(e) => updateField("sortOrder", Number(e.target.value))} />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>{isZh ? "标签（逗号分隔）" : "Tags (comma-separated)"}</label>
          <input
            className={inputClass}
            value={form.tags.join(", ")}
            onChange={(e) => updateField("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
            placeholder="portrait, hanfu, tang"
          />
        </div>
      </Section>

      {/* Section 2: Images */}
      <Section title={isZh ? "图片资源" : "Images"}>
        <div className="space-y-4">
          {/* Cover Image */}
          <div>
            <label className={labelClass}>{isZh ? "封面图 *" : "Cover Image *"}</label>
            <ImageUploader
              currentUrl={form.coverImage}
              onUpload={(file) => handleImageUpload(file, "cover", (url) => updateField("coverImage", url))}
              onRemove={() => updateField("coverImage", "")}
              uploading={uploading}
              label={isZh ? "上传封面" : "Upload Cover"}
            />
          </div>
          {/* Preview Images */}
          <div>
            <label className={labelClass}>{isZh ? "预览图" : "Preview Images"}</label>
            <MultiImageUploader
              urls={form.previewImages}
              onUpload={(file) => handleImageUpload(file, "previews", (url) => updateField("previewImages", [...form.previewImages, url]))}
              onRemove={(idx) => updateField("previewImages", form.previewImages.filter((_, i) => i !== idx))}
              uploading={uploading}
            />
          </div>
        </div>
      </Section>

      {/* Section 3: Shots */}
      <Section
        title={isZh ? "分镜管理" : "Shots"}
        action={
          <button onClick={addShot} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors">
            <Plus className="h-3 w-3" />
            {isZh ? "添加镜头" : "Add Shot"}
          </button>
        }
      >
        {form.shots.length === 0 ? (
          <p className="text-sm text-muted-foreground">{isZh ? "暂无镜头，请添加至少一个镜头" : "No shots yet. Add at least one shot."}</p>
        ) : (
          <div className="space-y-4">
            {form.shots.map((shot, idx) => (
              <div key={shot.key} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">
                    {isZh ? `镜头 ${idx + 1}` : `Shot ${idx + 1}`}
                  </h4>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveShot(idx, -1)} disabled={idx === 0} className="rounded p-1 text-muted-foreground hover:bg-hover disabled:opacity-30">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => moveShot(idx, 1)} disabled={idx === form.shots.length - 1} className="rounded p-1 text-muted-foreground hover:bg-hover disabled:opacity-30">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeShot(idx)} className="rounded p-1 text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Shot Key</label>
                    <input className={inputClass} value={shot.shotKey} onChange={(e) => updateShot(idx, "shotKey", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Order</label>
                    <input className={inputClass} type="number" value={shot.sortOrder} onChange={(e) => updateShot(idx, "sortOrder", Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">{isZh ? "中文标题" : "Chinese Title"}</label>
                    <input className={inputClass} value={shot.titleZh} onChange={(e) => updateShot(idx, "titleZh", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">{isZh ? "英文标题" : "English Title"}</label>
                    <input className={inputClass} value={shot.titleEn} onChange={(e) => updateShot(idx, "titleEn", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">{isZh ? "参考模板图 *" : "Reference Template Image *"}</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    {isZh
                      ? "身份迁移的参考图。上传高清、无水印、竖版3:4模板原图。"
                      : "Reference image for identity transfer. Upload a high-resolution, watermark-free, vertical 3:4 template image."
                    }
                  </p>
                  <ImageUploader
                    currentUrl={shot.referenceImage}
                    onUpload={(file) => handleImageUpload(file, `shots/${shot.shotKey}`, (url) => updateShot(idx, "referenceImage", url))}
                    onRemove={() => updateShot(idx, "referenceImage", "")}
                    uploading={uploading}
                    label={isZh ? "上传" : "Upload"}
                    small
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">{isZh ? "风格补充（可选）" : "Style Prompt (optional)"}</label>
                  <textarea className={textareaClass} rows={2} value={shot.stylePrompt} onChange={(e) => updateShot(idx, "stylePrompt", e.target.value)} placeholder={isZh ? "可选，用于微调该镜头的风格" : "Optional, for fine-tuning this shot's style"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Section 4: Identity Transfer Config */}
      <Section title={isZh ? "身份迁移配置" : "Identity Transfer Config"}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>{isZh ? "模型" : "Model"}</label>
            <select
              className={inputClass}
              value={genModel}
              onChange={(e) => updateGenConfig("model", e.target.value)}
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{isZh ? "输出尺寸" : "Size"}</label>
            <select
              className={inputClass}
              value={genSize}
              onChange={(e) => updateGenConfig("size", e.target.value)}
            >
              {SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{isZh ? "宽高比" : "Aspect Ratio"}</label>
            <select
              className={inputClass}
              value={genAspectRatio}
              onChange={(e) => updateGenConfig("aspectRatio", e.target.value)}
            >
              {ASPECT_RATIO_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>{isZh ? "模板风格描述（可选）" : "Template Style Prompt (optional)"}</label>
          <p className="text-xs text-muted-foreground mb-2">
            {isZh
              ? "轻量文字补充，描述该模板的整体视觉风格。生成时会拼接在全局身份保持 prompt 之后。"
              : "Lightweight text supplement describing the overall visual style. Appended after the global identity preservation prompt during generation."
            }
          </p>
          <textarea className={textareaClass} rows={3} value={form.stylePrompt} onChange={(e) => updateField("stylePrompt", e.target.value)} />
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
          <span className="text-xs text-muted-foreground">{isZh ? "工作流：" : "Workflow:"}</span>
          <span className="text-xs font-mono font-medium text-foreground">identity_transfer</span>
          <span className="text-xs text-muted-foreground">{isZh ? "（固定）" : "(fixed)"}</span>
        </div>
      </Section>

      {/* Section 5: Credits Config */}
      <Section title={isZh ? "积分配置" : "Credits Config"}>
        <div>
          <label className={labelClass}>{isZh ? "每次生成消耗积分 *" : "Credits per Generation *"}</label>
          <input className={cn(inputClass, "max-w-xs")} type="number" min={0} value={form.creditsPerGeneration} onChange={(e) => updateField("creditsPerGeneration", Number(e.target.value))} />
        </div>
      </Section>

      {/* Bottom actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          {isEdit && form.status === "published" && (
            <button
              onClick={handleArchive}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 transition-colors"
            >
              <Archive className="h-4 w-4" />
              {isZh ? "下架模板" : "Archive Template"}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {isZh ? "保存草稿" : "Save Draft"}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            {isZh ? "保存并发布" : "Save & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function ImageUploader({
  currentUrl,
  onUpload,
  onRemove,
  uploading,
  label,
  small,
}: {
  currentUrl: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
  label: string;
  small?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      {currentUrl ? (
        <div className="relative">
          <img
            src={currentUrl}
            alt=""
            className={cn("rounded object-cover border border-border", small ? "h-16 w-16" : "h-24 w-24")}
          />
          <button
            onClick={onRemove}
            className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className={cn("rounded border border-dashed border-border flex items-center justify-center bg-secondary/50", small ? "h-16 w-16" : "h-24 w-24")}>
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <label className={cn(
        "flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs cursor-pointer hover:bg-hover transition-colors",
        uploading && "opacity-50 pointer-events-none"
      )}>
        <Upload className="h-3 w-3" />
        {uploading ? "Uploading..." : label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component (default export for Next.js routing)
// ---------------------------------------------------------------------------

export default function AdminTemplateEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <AdminTemplateForm templateId={id} />;
}

function MultiImageUploader({
  urls,
  onUpload,
  onRemove,
  uploading,
}: {
  urls: string[];
  onUpload: (file: File) => void;
  onRemove: (idx: number) => void;
  uploading: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {urls.map((url, idx) => (
        <div key={idx} className="relative">
          <img src={url} alt="" className="h-16 w-16 rounded object-cover border border-border" />
          <button
            onClick={() => onRemove(idx)}
            className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <label className={cn(
        "flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs cursor-pointer hover:bg-hover transition-colors",
        uploading && "opacity-50 pointer-events-none"
      )}>
        <Upload className="h-3 w-3" />
        {uploading ? "Uploading..." : "Upload"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}