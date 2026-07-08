"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  templateLibraryData,
  type TemplateCategory,
  type TemplateCategoryWithAll,
  type TemplateFilter,
} from "@/features/templates/template-data";

const categoryTabs: Array<TemplateCategoryWithAll> = ["all", "tang", "song", "yuan", "ming", "qing", "modern", "dunhuang", "qipao"];
const filterChips: TemplateFilter[] = ["popular", "new", "premium", "free", "favorited"];

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20.8 4