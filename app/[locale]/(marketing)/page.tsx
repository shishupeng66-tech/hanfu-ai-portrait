import { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import type { Locale } from "@/i18n.config";
import { generatePageMetadata } from "@/lib/metadata";
import { HomeHero } from "@/components/home/hero";
import { HomeHowItWorks } from "@/components/home/how-it-works";
import { HomeShowcase } from "@/components/home/showcase";
import { HomePricingPreview } from "@/components/home/pricing-preview";
import { HomeTestimonials } from "@/components/home/testimonials";
import { HomeFAQ } from "@/components/home/faq";
import { HomeCTAFooter } from "@/components/home/cta-footer";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: Locale }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: 'hero' });

  return generatePageMetadata({
    locale,
    path: '',
    title: t('title'),
    description: t('description'),
  });
}

export default function Home() {
  return (
    <div className="relative">
      <HomeHero />
      <HomeHowItWorks />
      <HomeShowcase />
      <HomePricingPreview />
      <HomeTestimonials />
      <HomeFAQ />
      <HomeCTAFooter />
    </div>
  );
}
