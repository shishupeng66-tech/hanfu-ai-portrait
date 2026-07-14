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
  ChevronDown,
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
  prompt: string;
  pose: string;
  camera: string;
  composition: string;
  expression: string;
  referenceImage: string;
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
  coverImage: string;
  previewImages: string[];
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
  coverImage: "",
  previewImages: [],
  referenceImages: [],
  basePrompt: "",
  negativePrompt: "",
  generationConfig: JSON.stringify({ model: "seedream-4.5", aspectRatio: "3:4", width: 1536, height: 2048, imageCount: 6 }, null, 2),
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
  const [jsonImport, setJsonImport] = useState("");
  const [showJsonImport, setShowJsonImport] = useState(false);

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
          coverImage: data.coverImage ?? "",
          previewImages: data.previewImages ?? [],
          referenceImages: data.referenceImages ?? [],
          basePrompt: data.basePrompt ?? "",
          negativePrompt: data.negativePrompt ?? "",
          generationConfig: data.generationConfig ?? "{}",
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
            prompt: s.prompt ?? "",
            pose: s.pose ?? "",
            camera: s.camera ?? "",
            composition: s.composition ?? "",
            expression: s.expression ?? "",
            referenceImage: s.referenceImage ?? "",
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
          prompt: "",
          pose: "",
          camera: "",
          composition: "",
          expression: "",
          referenceImage: "",
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
      const body = {
        ...form,
        status: targetStatus ?? form.status,
        generationConfig: form.generationConfig,
        memberCreditsPerGeneration: form.memberCreditsPerGeneration ?? undefined,
        shots: form.shots.map((s) => ({
          shotKey: s.shotKey,
          sortOrder: s.sortOrder,
          titleZh: s.titleZh,
          titleEn: s.titleEn,
          prompt: s.prompt,
          pose: s.pose,
          camera: s.camera,
          composition: s.composition,
          expression: s.expression,
          referenceImage: s.referenceImage,
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

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonImport);
      // Map from static template JSON format to form format
      setForm({
        slug: parsed.slug ?? "",
        nameZh: parsed.name?.zh ?? "",
        nameEn: parsed.name?.en ?? "",
        descriptionZh: parsed.description?.zh ?? "",
        descriptionEn: parsed.description?.en ?? "",
        category: parsed.category ?? "hanfu",
        dynasty: parsed.dynasty ?? "",
        styles: parsed.styles ?? [],
        tags: parsed.tags ?? [],
        coverImage: parsed.coverImage ?? "",
        previewImages: parsed.previewImages ?? [],
        referenceImages: parsed.referenceImages ?? [],
        basePrompt: parsed.prompt?.base ?? "",
        negativePrompt: parsed.prompt?.negative ?? "",
        generationConfig: JSON.stringify(parsed.generation ?? { model: "seedream-4.5", aspectRatio: "3:4", width: 1536, height: 2048, imageCount: 6 }, null, 2),
        creditsPerGeneration: parsed.creditsPerGeneration ?? 4,
        memberCreditsPerGeneration: null,
        featured: parsed.featured ?? false,
        sortOrder: parsed.sortOrder ?? 0,
        version: parsed.version ?? 1,
        status: "draft",
        shots: (parsed.shots ?? []).map((s: Record<string, unknown>, i: number) => ({
          key: `import-${i}`,
          shotKey: (s.id as string) ?? `shot-${String(i + 1).padStart(2, "0")}`,
          sortOrder: (s.order as number) ?? i + 1,
          titleZh: (s.title as { zh: string })?.zh ?? "",
          titleEn: (s.title as { en: string })?.en ?? "",
          prompt: (s.prompt as string) ?? "",
          pose: (s.pose as string) ?? "",
          camera: (s.camera as string) ?? "",
          composition: (s.composition as string) ?? "",
          expression: (s.expression as string) ?? "",
          referenceImage: (s.referenceImage as string) ?? "",
        })),
      });
      setShowJsonImport(false);
      setJsonImport("");
      setHasUnsaved(true);
    } catch {
      alert(isZh ? "JSON 格式无效" : "Invalid JSON format");
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const inputClass = "w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground placeholder:text-muted-foreground hover:border-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors";
  const textareaClass = "w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground placeholder:text-muted-foreground hover:border-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring min-h-[80px] transition-colors";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

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

      {/* JSON Import */}
      <div className="overflow-hidden rounded-xl border border-border bg-card/60">
        <button
          type="button"
          aria-expanded={showJsonImport}
          aria-controls="json-import-panel"
          onClick={() => setShowJsonImport((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <div>
            <div className="text-sm font-medium text-foreground">
              {isZh ? "从 JSON 导入" : "Import from JSON"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isZh ? "粘贴符合模板规范的 JSON，自动填充表单" : "Paste a valid template JSON to auto-fill the form"}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200",
              showJsonImport && "rotate-180"
            )}
          />
        </button>
        {showJsonImport && (
          <div id="json-import-panel" className="border-t border-border px-5 py-4 space-y-3">
            <textarea
              className={textareaClass}
              rows={6}
              placeholder={isZh ? "粘贴模板 JSON..." : "Paste template JSON..."}
              value={jsonImport}
              onChange={(e) => setJsonImport(e.target.value)}
            />
            <button
              onClick={handleJsonImport}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
            >
              {isZh ? "导入并预览" : "Import & Preview"}
            </button>
          </div>
        )}
      </div>

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
            <label className={labelClass}>{isZh ? "版本" : "Version"}</label>
            <input className={inputClass} type="number" value={form.version} onChange={(e) => updateField("version", Number(e.target.value))} />
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
            <label className={labelClass}>{isZh ? "分类" : "Category"}</label>
            <select className={inputClass} value={form.category} onChange={(e) => updateField("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{isZh ? c.labelZh : c.labelEn}</option>
              ))}
            </select>
          </div>
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
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelClass}>{isZh ? "排序" : "Sort Order"}</label>
            <input className={inputClass} type="number" value={form.sortOrder} onChange={(e) => updateField("sortOrder", Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>{isZh ? "标签（逗号分隔）" : "Tags (comma-separated)"}</label>
            <input
              className={inputClass}
              value={form.tags.join(", ")}
              onChange={(e) => updateField("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
              placeholder="portrait, hanfu, tang"
            />
          </div>
        </div>
      </Section>

      {/* Section 2: Images */}
      <Section title={isZh ? "图片" : "Images"}>
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
          {/* Reference Images */}
          <div>
            <label className={labelClass}>{isZh ? "参考图" : "Reference Images"}</label>
            <MultiImageUploader
              urls={form.referenceImages}
              onUpload={(file) => handleImageUpload(file, "references", (url) => updateField("referenceImages", [...form.referenceImages, url]))}
              onRemove={(idx) => updateField("referenceImages", form.referenceImages.filter((_, i) => i !== idx))}
              uploading={uploading}
            />
          </div>
        </div>
      </Section>

      {/* Section 3: Prompts */}
      <Section title={isZh ? "提示词" : "Prompts"}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{isZh ? "基础提示词 *" : "Base Prompt *"}</label>
            <textarea className={textareaClass} rows={6} value={form.basePrompt} onChange={(e) => updateField("basePrompt", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{isZh ? "负面提示词" : "Negative Prompt"}</label>
            <textarea className={textareaClass} rows={4} value={form.negativePrompt} onChange={(e) => updateField("negativePrompt", e.target.value)} />
          </div>
        </div>
      </Section>

      {/* Section 4: Shots */}
      <Section
        title={isZh ? "分镜" : "Shots"}
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
                  <label className="block text-xs text-muted-foreground mb-1">{isZh ? "镜头提示词" : "Shot Prompt"}</label>
                  <textarea className={textareaClass} rows={3} value={shot.prompt} onChange={(e) => updateShot(idx, "prompt", e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">{isZh ? "姿态" : "Pose"}</label>
                    <input className={inputClass} value={shot.pose} onChange={(e) => updateShot(idx, "pose", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">{isZh ? "表情" : "Expression"}</label>
                    <input className={inputClass} value={shot.expression} onChange={(e) => updateShot(idx, "expression", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">{isZh ? "机位" : "Camera"}</label>
                    <input className={inputClass} value={shot.camera} onChange={(e) => updateShot(idx, "camera", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">{isZh ? "构图" : "Composition"}</label>
                  <input className={inputClass} value={shot.composition} onChange={(e) => updateShot(idx, "composition", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">{isZh ? "独立参考图" : "Reference Image"}</label>
                  <ImageUploader
                    currentUrl={shot.referenceImage}
                    onUpload={(file) => handleImageUpload(file, `shots/${shot.shotKey}`, (url) => updateShot(idx, "referenceImage", url))}
                    onRemove={() => updateShot(idx, "referenceImage", "")}
                    uploading={uploading}
                    label={isZh ? "上传" : "Upload"}
                    small
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Section 5: Generation Config */}
      <Section title={isZh ? "生成配置" : "Generation Config"}>
        <div>
          <label className={labelClass}>{isZh ? "生成配置 (JSON)" : "Generation Config (JSON)"}</label>
          <textarea
            className={cn(textareaClass, "font-mono text-xs")}
            rows={8}
            value={form.generationConfig}
            onChange={(e) => updateField("generationConfig", e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {isZh ? "model, aspectRatio, width, height, imageCount" : "model, aspectRatio, width, height, imageCount"}
          </p>
        </div>
      </Section>

      {/* Section 6: Credits Config */}
      <Section title={isZh ? "积分配置" : "Credits Config"}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{isZh ? "每次生成消耗积分 *" : "Credits per Generation *"}</label>
            <input className={inputClass} type="number" min={0} value={form.creditsPerGeneration} onChange={(e) => updateField("creditsPerGeneration", Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>{isZh ? "会员每次生成消耗积分" : "Member Credits per Generation"}</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              value={form.memberCreditsPerGeneration ?? ""}
              onChange={(e) => updateField("memberCreditsPerGeneration", e.target.value ? Number(e.target.value) : null)}
              placeholder={isZh ? "留空使用默认" : "Leave empty for default"}
            />
          </div>
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