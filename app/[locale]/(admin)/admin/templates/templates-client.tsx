"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  Archive,
  CheckCircle,
  XCircle,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TemplateShot = {
  id: string;
  shotKey: string;
  sortOrder: number;
  titleZh: string;
  titleEn: string;
};

type TemplateItem = {
  id: string;
  slug: string;
  status: string;
  version: number;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  category: string;
  dynasty: string;
  styles: string[];
  tags: string[];
  coverImage: string;
  creditsPerGeneration: number;
  featured: boolean;
  sortOrder: number;
  shots: TemplateShot[];
  createdAt: string;
  updatedAt: string;
};

type ListResult = {
  templates: TemplateItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, { zh: string; en: string; className: string }> = {
  draft: { zh: "草稿", en: "Draft", className: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  published: { zh: "已发布", en: "Published", className: "bg-green-500/10 text-green-400 border-green-500/20" },
  archived: { zh: "已归档", en: "Archived", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

const CATEGORY_LABELS: Record<string, string> = {
  hanfu: "汉服",
  modern: "现代",
  dunhuang: "敦煌",
  qipao: "旗袍",
  test: "测试",
};

const DYNASTY_LABELS: Record<string, string> = {
  tang: "唐",
  song: "宋",
  yuan: "元",
  ming: "明",
  qing: "清",
  modern: "现代",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminTemplatesClient() {
  const router = useRouter();
  const locale = useLocale();

  const [data, setData] = useState<ListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dynastyFilter, setDynastyFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("sortOrder");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (dynastyFilter) params.set("dynasty", dynastyFilter);
      if (featuredFilter) params.set("featured", featuredFilter);
      params.set("page", String(page));
      params.set("pageSize", "20");
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const res = await fetch(`/api/admin/templates?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push(`/${locale}/dashboard`);
          return;
        }
        throw new Error("Failed to fetch templates");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, dynastyFilter, featuredFilter, page, sortBy, sortOrder, locale, router]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleAction = async (id: string, action: string, extra?: Record<string, unknown>) => {
    try {
      let url = `/api/admin/templates/${id}`;
      let method = "PATCH";
      let body: BodyInit | null = null;

      switch (action) {
        case "publish":
          url += "/publish";
          method = "POST";
          break;
        case "archive":
          url += "/archive";
          method = "POST";
          break;
        case "duplicate":
          url += "/duplicate";
          method = "POST";
          body = JSON.stringify(extra ?? { newSlug: `${id}-copy` });
          break;
        case "delete":
          method = "DELETE";
          if (!window.confirm("确定要删除该模板吗？此操作不可撤销。")) return;
          break;
      }

      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Operation failed");
        return;
      }

      fetchTemplates();
    } catch (err) {
      alert("Operation failed");
    }
  };

  const isZh = locale === "zh";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isZh ? "模板管理" : "Template Management"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isZh ? "管理所有汉服写真模板" : "Manage all Hanfu portrait templates"}
          </p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/admin/templates/new`)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {isZh ? "新建模板" : "New Template"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={isZh ? "搜索模板名称或slug..." : "Search name or slug..."}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">{isZh ? "所有状态" : "All Status"}</option>
          <option value="draft">{isZh ? "草稿" : "Draft"}</option>
          <option value="published">{isZh ? "已发布" : "Published"}</option>
          <option value="archived">{isZh ? "已归档" : "Archived"}</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">{isZh ? "所有分类" : "All Categories"}</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={dynastyFilter}
          onChange={(e) => { setDynastyFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">{isZh ? "所有朝代" : "All Dynasties"}</option>
          {Object.entries(DYNASTY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={featuredFilter}
          onChange={(e) => { setFeaturedFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">{isZh ? "推荐状态" : "Featured"}</option>
          <option value="true">{isZh ? "已推荐" : "Featured"}</option>
          <option value="false">{isZh ? "未推荐" : "Not Featured"}</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="sortOrder">{isZh ? "排序" : "Sort Order"}</option>
          <option value="updatedAt">{isZh ? "更新时间" : "Updated"}</option>
          <option value="createdAt">{isZh ? "创建时间" : "Created"}</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground hover:bg-hover transition-colors"
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : !data || data.templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {isZh ? "暂无模板" : "No templates yet"}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{isZh ? "封面" : "Cover"}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{isZh ? "名称" : "Name"}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{isZh ? "状态" : "Status"}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{isZh ? "分类" : "Category"}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{isZh ? "朝代" : "Dynasty"}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{isZh ? "积分" : "Credits"}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{isZh ? "镜头" : "Shots"}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{isZh ? "推荐" : "Featured"}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{isZh ? "排序" : "Order"}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{isZh ? "版本" : "Ver"}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{isZh ? "更新时间" : "Updated"}</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">{isZh ? "操作" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {data.templates.map((t) => {
                  const status = STATUS_LABELS[t.status] ?? STATUS_LABELS.draft;
                  return (
                    <tr key={t.id} className="border-b border-border hover:bg-hover/50 transition-colors">
                      <td className="px-4 py-3">
                        {t.coverImage ? (
                          <img
                            src={t.coverImage}
                            alt=""
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{isZh ? t.nameZh : t.nameEn}</div>
                        <div className="text-xs text-muted-foreground">{isZh ? t.nameEn : t.nameZh}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.slug}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium border", status.className)}>
                          {isZh ? status.zh : status.en}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{t.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.dynasty || "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.creditsPerGeneration}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.shots?.length ?? 0}</td>
                      <td className="px-4 py-3">
                        {t.featured ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{t.sortOrder}</td>
                      <td className="px-4 py-3 text-muted-foreground">v{t.version}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(t.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/${locale}/admin/templates/${t.id}`)}
                            title={isZh ? "查看" : "View"}
                            className="rounded p-1.5 text-muted-foreground hover:bg-hover hover:text-foreground transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/${locale}/admin/templates/${t.id}?edit=true`)}
                            title={isZh ? "编辑" : "Edit"}
                            className="rounded p-1.5 text-muted-foreground hover:bg-hover hover:text-foreground transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAction(t.id, "duplicate", { newSlug: `${t.slug}-copy` })}
                            title={isZh ? "复制" : "Duplicate"}
                            className="rounded p-1.5 text-muted-foreground hover:bg-hover hover:text-foreground transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          {t.status === "draft" && (
                            <button
                              onClick={() => handleAction(t.id, "publish")}
                              title={isZh ? "发布" : "Publish"}
                              className="rounded p-1.5 text-green-400 hover:bg-green-500/10 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {t.status === "published" && (
                            <button
                              onClick={() => handleAction(t.id, "archive")}
                              title={isZh ? "下架" : "Archive"}
                              className="rounded p-1.5 text-amber-400 hover:bg-amber-500/10 transition-colors"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleAction(t.id, "delete")}
                            title={isZh ? "删除" : "Delete"}
                            className="rounded p-1.5 text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {isZh
                  ? `共 ${data.total} 条，第 ${data.page}/${data.totalPages} 页`
                  : `Total ${data.total}, Page ${data.page}/${data.totalPages}`}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-hover disabled:opacity-50 transition-colors"
                >
                  {isZh ? "上一页" : "Previous"}
                </button>
                <button
                  onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                  disabled={page >= data.totalPages}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-hover disabled:opacity-50 transition-colors"
                >
                  {isZh ? "下一页" : "Next"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}