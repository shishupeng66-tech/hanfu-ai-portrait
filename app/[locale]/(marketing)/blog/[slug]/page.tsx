import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBlogModule } from "@/lib/blog";
import { type Locale } from "@/i18n.config";

const publishedBlogSlugs: string[] = [];

interface PageProps {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const { slug, locale } = params;

  if (!publishedBlogSlugs.includes(slug)) {
    notFound();
  }

  const blogModule = await getBlogModule(slug, locale);

  if (!blogModule) {
    notFound();
  }

  const { blog } = blogModule;
  const metadata: Metadata = {
    title: blog.title,
    description: blog.description,
  };

  if (blog.image) {
    metadata.openGraph = {
      images: [blog.image],
    };
  }

  return metadata;
}

export default async function BlogPostPage(props: PageProps) {
  const params = await props.params;
  const { slug, locale } = params;

  if (!publishedBlogSlugs.includes(slug)) {
    notFound();
  }

  const blogModule = await getBlogModule(slug, locale);

  if (!blogModule) {
    notFound();
  }

  const MDXContent = blogModule.default;

  return <MDXContent />;
}
