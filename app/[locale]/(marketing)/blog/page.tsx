import { type Metadata } from "next";
import { Background } from "@/components/background";
import { Container } from "@/components/container";
import { Heading } from "@/components/heading";
import { Subheading } from "@/components/subheading";
import { LocaleLink } from "@/components/locale-link";
import { getTranslations } from 'next-intl/server';
import { type Locale } from '@/i18n.config';
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: Locale }>
  }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: 'blog' });

  return generatePageMetadata({
    locale: params.locale,
    path: '/blog',
    title: t('title'),
    description: t('subtitle'),
  });
}

interface PageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function ArticlesIndex(props: PageProps) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: 'blog' });

  return (
    <div className="relative overflow-hidden py-20 md:py-0">
      <Background />
      <Container className="flex min-h-[70vh] flex-col items-center justify-center pb-20">
        <div className="relative z-20 flex max-w-3xl flex-col items-center rounded-[32px] border border-[rgba(255,247,236,0.08)] bg-[rgba(17,17,20,0.72)] px-8 py-14 text-center shadow-[0_24px_80px_rgba(0,0,0,0.38)] md:px-14">
          <div className="mb-5 rounded-full border border-[rgba(232,194,122,0.22)] bg-[rgba(232,194,122,0.08)] px-4 py-1 text-xs font-medium text-[#E8C27A]">
            {t('journal')}
          </div>
          <Heading as="h1">{t('comingSoonTitle')}</Heading>
          <Subheading className="mx-auto mt-5 max-w-2xl text-center">
            {t('comingSoonSubtitle')}
          </Subheading>
          <LocaleLink
            href="/generate"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#E8C27A] px-8 text-sm font-semibold text-[#111114] transition hover:bg-[#F2D38A]"
          >
            {t('comingSoonCta')}
          </LocaleLink>
        </div>
      </Container>
    </div>
  );
}