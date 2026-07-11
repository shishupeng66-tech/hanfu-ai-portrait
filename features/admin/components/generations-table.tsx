"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Search, X } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export type AdminGenerationItem = {
  id: string;
  userId: string;
  userEmail: string | null;
  type: string;
  templateName: string | null;
  templateKey: string | null;
  status: string;
  creditsUsed: number;
  resultUrl: string | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type GenerationsTableProps = {
  generations: AdminGenerationItem[];
  query: string;
  status: string;
};

const statusClasses: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-300 border-red-500/20",
  processing: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  pending: "bg-blue-500/10 text-blue-300 border-blue-500/20",
};

const statusLabels: Record<string, string> = {
  completed: "成功",
  failed: "失败",
  processing: "处理中",
  pending: "等待中",
};

const typeLabels: Record<string, string> = {
  image: "图片",
  video: "视频",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        statusClasses[status] || "bg-muted text-muted-foreground border-border"
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}

export function GenerationsTable({ generations, query, status }: GenerationsTableProps) {
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(query);
  const [statusFilter, setStatusFilter] = useState(status);
  const inputClass = "flex h-9 rounded-lg border border-border bg-card px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);
    router.push(`/${locale}/admin/generations?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    router.push(`/${locale}/admin/generations`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">AI 生成任务</h1>
        <p className="text-sm text-muted-foreground">查看写真生成任务、失败原因和积分消耗。本阶段只读，不执行重试或自动补偿。</p>
      </div>

      <form onSubmit={applyFilters} className="flex flex-wrap gap-2">
        <input
          placeholder="搜索用户邮箱、用户 ID 或任务 ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(inputClass, "w-full max-w-md")}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={cn(inputClass, "w-36")}>
          <option value="all">全部状态</option>
          <option value="completed">成功</option>
          <option value="failed">失败</option>
          <option value="processing">处理中</option>
          <option value="pending">等待中</option>
        </select>
        <Button type="submit" variant="outline" size="sm">
          <Search className="h-4 w-4 mr-1" />
          查询
        </Button>
        {(query || status !== "all") && (
          <Button type="button" variant="simple" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            清空
          </Button>
        )}
      </form>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-500/10 bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">任务 ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">用户邮箱</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">模板</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">消耗积分</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">结果预览</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">失败原因</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">创建时间</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">更新时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {generations.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs max-w-[180px] truncate" title={item.id}>
                    <Link href={`/${locale}/admin/generations/${item.id}`} className="text-amber-200 hover:text-amber-100">
                      {item.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{item.userEmail || "-"}</p>
                    <p className="text-xs text-muted-foreground max-w-[160px] truncate">{item.userId}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{typeLabels[item.type] || item.type}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{item.templateName || "-"}</p>
                    {item.templateKey && <p className="text-xs text-muted-foreground">{item.templateKey}</p>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">{item.creditsUsed.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {item.resultUrl ? (
                      <a href={item.resultUrl} target="_blank" rel="noreferrer" className="block h-14 w-11 overflow-hidden rounded-md border border-border bg-muted">
                        <Image src={item.resultUrl} alt="生成结果预览" width={44} height={56} className="h-full w-full object-cover" unoptimized />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-red-300 max-w-[260px] truncate" title={item.error || ""}>
                    {item.error || "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(item.updatedAt), "yyyy-MM-dd HH:mm")}</td>
                </tr>
              ))}
              {generations.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-14 text-center text-sm text-muted-foreground">暂无生成任务</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
