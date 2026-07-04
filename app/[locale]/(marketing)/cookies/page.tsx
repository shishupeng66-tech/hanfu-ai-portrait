import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n.config";

type LegalSection = {
  title: string;
  body: string[];
};

const content = {
  zh: {
    title: "Cookie 政策",
    updatedAt: "最后更新：2026 年 7 月 4 日",
    intro:
      "本政策说明汉韵写真如何使用 Cookie 和类似技术，以维持登录状态、保存偏好、保障安全并改善服务体验。",
    sections: [
      {
        title: "1. Cookie 的用途",
        body: [
          "Cookie 是网站保存在浏览器中的小型数据，用于帮助网站记住你的登录状态、语言偏好、基础设置和页面交互信息。",
          "汉韵写真使用 Cookie 支持账户登录、语言切换、积分或支付状态回跳、基础安全校验和必要的服务统计。",
        ],
      },
      {
        title: "2. 必要 Cookie",
        body: [
          "必要 Cookie 用于登录认证、会话保持、安全防护、表单提交和基础页面功能。关闭这些 Cookie 可能导致账户无法登录或部分功能无法使用。",
          "这些 Cookie 通常不会用于广告投放或跨站追踪。",
        ],
      },
      {
        title: "3. 偏好与功能 Cookie",
        body: [
          "我们可能使用 Cookie 记住你的语言、界面偏好、最近访问路径和部分创作配置，以减少重复操作。",
          "这些信息用于改善产品体验，不会改变你的账户权益或支付状态。",
        ],
      },
      {
        title: "4. 分析 Cookie",
        body: [
          "我们可能使用基础统计或分析工具了解页面访问、功能使用和错误情况，以优化模板、生成流程和页面性能。",
          "分析数据通常以汇总方式使用，不用于公开展示单个用户的私人创作内容。",
        ],
      },
      {
        title: "5. 支付与回跳",
        body: [
          "在购买积分包或会员方案时，Cookie 或类似技术可能用于维持登录状态、识别支付回跳结果，并帮助系统同步积分或订阅权益。",
          "完整支付信息由第三方支付服务处理，我们不会通过 Cookie 保存完整银行卡信息。",
        ],
      },
      {
        title: "6. 如何管理 Cookie",
        body: [
          "你可以通过浏览器设置查看、删除或阻止 Cookie。不同浏览器的管理入口可能不同，请参考浏览器帮助文档。",
          "如果禁用必要 Cookie，汉韵写真中的登录、生成、支付回跳或偏好保存功能可能无法正常工作。",
        ],
      },
      {
        title: "7. 联系方式",
        body: [
          "如果你对 Cookie 使用有疑问，可以通过网站的联系我们页面与我们联系。",
        ],
      },
    ],
  },
  en: {
    title: "Cookie Policy",
    updatedAt: "Last updated: July 4, 2026",
    intro:
      "This policy explains how Han Portrait uses cookies and similar technologies to keep you signed in, remember preferences, protect the service, and improve your experience.",
    sections: [
      {
        title: "1. What Cookies Do",
        body: [
          "Cookies are small pieces of data stored in your browser that help a website remember login status, language preferences, basic settings, and page interactions.",
          "Han Portrait uses cookies for account sessions, language switching, credit or payment return states, basic security checks, and essential service analytics.",
        ],
      },
      {
        title: "2. Essential Cookies",
        body: [
          "Essential cookies support authentication, sessions, security protection, form submissions, and core page functionality. Disabling them may prevent login or make some features unavailable.",
          "These cookies are generally not used for advertising or cross-site tracking.",
        ],
      },
      {
        title: "3. Preference and Functional Cookies",
        body: [
          "We may use cookies to remember language, interface preferences, recent paths, and certain creation settings to reduce repeated actions.",
          "These cookies improve product experience and do not change your account entitlements or payment status.",
        ],
      },
      {
        title: "4. Analytics Cookies",
        body: [
          "We may use basic analytics tools to understand page visits, feature usage, and errors, so we can improve templates, generation flows, and performance.",
          "Analytics data is generally used in aggregate and is not used to publicly display a user’s private creations.",
        ],
      },
      {
        title: "5. Payments and Return States",
        body: [
          "When you buy credits or a membership, cookies or similar technologies may help maintain your session, identify checkout return results, and synchronize credits or subscription benefits.",
          "Full payment information is handled by third-party payment providers. We do not store full card details in cookies.",
        ],
      },
      {
        title: "6. Managing Cookies",
        body: [
          "You can view, delete, or block cookies through your browser settings. Browser controls vary, so refer to your browser documentation.",
          "If you disable essential cookies, login, generation, payment return, or preference-saving features may not work properly.",
        ],
      },
      {
        title: "7. Contact",
        body: ["If you have questions about our use of cookies, please contact us through the contact page."],
      },
    ],
  },
} satisfies Record<Locale, { title: string; updatedAt: string; intro: string; sections: LegalSection[] }>;

export async function generateMetadata(
  props: {
    params: Promise<{ locale: Locale }>
  }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: "seo" });

  return {
    title: t("cookies.title"),
    description: t("cookies.description"),
    openGraph: {
      images: [t("cookies.ogImage")],
    },
  };
}

export default async function CookiesPage(
  props: {
    params: Promise<{ locale: Locale }>;
  }
) {
  const { locale } = await props.params;
  const page = content[locale] ?? content.zh;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <article className="rounded-3xl border border-[rgba(255,247,236,0.08)] bg-[rgba(17,17,20,0.82)] p-8 text-[rgba(255,247,236,0.72)] shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:p-10">
        <p className="mb-4 text-sm font-medium text-[#E8C27A]">{page.updatedAt}</p>
        <h1 className="mb-5 text-4xl font-semibold tracking-tight text-[rgba(255,247,236,0.92)]">
          {page.title}
        </h1>
        <p className="mb-10 text-base leading-8 text-[rgba(255,247,236,0.64)]">{page.intro}</p>
        <div className="space-y-8">
          {page.sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-xl font-semibold text-[rgba(255,247,236,0.9)]">{section.title}</h2>
              <div className="space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="leading-8">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
