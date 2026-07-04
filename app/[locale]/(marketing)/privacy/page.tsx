import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n.config";

type LegalSection = {
  title: string;
  body: string[];
};

const content = {
  zh: {
    title: "隐私政策",
    updatedAt: "最后更新：2026 年 7 月 4 日",
    intro:
      "汉韵写真重视你的隐私。本政策说明我们在提供 AI 汉服写真生成、账户、积分、订阅和作品管理服务时如何收集、使用和保护信息。",
    sections: [
      {
        title: "1. 我们收集的信息",
        body: [
          "账户信息：例如邮箱、登录状态、头像、显示名称和偏好设置。",
          "创作信息：例如你上传的照片、选择的模板、生成记录、作品链接和相关操作日志。",
          "支付与权益信息：例如积分余额、会员状态、订单状态、支付成功或失败记录。完整支付卡信息由 Creem 等第三方支付服务处理，我们不保存完整卡号。",
          "技术信息：例如设备、浏览器、语言偏好、访问时间、错误日志和基础安全日志。",
        ],
      },
      {
        title: "2. 信息用途",
        body: [
          "我们使用信息来生成 AI 汉服写真、管理账户、发放积分或订阅权益、展示历史作品、处理客服请求并维护服务安全。",
          "我们也可能使用汇总或匿名化数据分析产品使用情况，改进模板、生成质量和页面体验。",
        ],
      },
      {
        title: "3. 图片处理",
        body: [
          "你上传的照片用于完成你请求的 AI 写真生成、结果预览和作品管理。除非你主动分享或授权，我们不会把你的上传照片或生成结果公开展示为案例。",
          "请不要上传你无权使用的他人照片，或包含敏感、违法、侵权内容的图片。",
        ],
      },
      {
        title: "4. 支付信息",
        body: [
          "支付由 Creem 等第三方支付服务处理。我们会接收必要的支付状态、订单标识和权益发放信息，用于开通会员或增加积分。",
          "我们不会在平台服务器保存完整银行卡号、完整支付凭证或敏感支付认证信息。",
        ],
      },
      {
        title: "5. 数据共享",
        body: [
          "为了提供服务，我们可能与必要的基础设施、认证、存储、邮件、支付和安全服务提供方处理相关数据。",
          "我们不会出售你的个人信息。仅在提供服务所必需、法律要求、保护平台安全或获得你授权的情况下，我们才会共享必要信息。",
        ],
      },
      {
        title: "6. 数据安全",
        body: [
          "我们会采取合理的技术和管理措施保护数据安全，包括访问控制、传输加密、权限管理和异常监控。",
          "互联网服务无法保证绝对安全。如果你发现账户或数据存在异常，请及时通过联系我们页面告知。",
        ],
      },
      {
        title: "7. 用户权利",
        body: [
          "你可以联系我们请求查询、更正或删除与账户相关的数据。部分数据可能因账务、安全、合规或争议处理需要保留一段时间。",
          "你可以通过浏览器或系统设置管理 Cookie 和部分偏好信息。",
        ],
      },
      {
        title: "8. 联系方式",
        body: [
          "如对隐私政策或数据处理有疑问，请通过网站的联系我们页面与我们联系。",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updatedAt: "Last updated: July 4, 2026",
    intro:
      "Han Portrait respects your privacy. This policy explains how we collect, use, and protect information when providing AI Hanfu portrait generation, accounts, credits, subscriptions, and gallery features.",
    sections: [
      {
        title: "1. Information We Collect",
        body: [
          "Account information such as email address, login status, avatar, display name, and preferences.",
          "Creation information such as uploaded photos, selected templates, generation records, work URLs, and related activity logs.",
          "Payment and entitlement information such as credit balance, membership status, order status, and payment result records. Full card details are processed by third-party payment providers such as Creem and are not stored by us.",
          "Technical information such as device, browser, language preference, access time, error logs, and basic security logs.",
        ],
      },
      {
        title: "2. How We Use Information",
        body: [
          "We use information to generate AI Hanfu portraits, manage accounts, grant credits or subscriptions, display past works, handle support requests, and maintain service security.",
          "We may use aggregated or anonymized data to understand product usage and improve templates, generation quality, and user experience.",
        ],
      },
      {
        title: "3. Photo Processing",
        body: [
          "Uploaded photos are used to fulfill your generation request, provide previews, and manage your works. We do not publicly display your uploads or results as examples unless you choose to share or authorize it.",
          "Do not upload photos you do not have the right to use, or images containing sensitive, illegal, or infringing content.",
        ],
      },
      {
        title: "4. Payment Information",
        body: [
          "Payments are handled by third-party payment providers such as Creem. We receive necessary payment status, order identifiers, and entitlement information to activate memberships or add credits.",
          "We do not store full card numbers, full payment credentials, or sensitive payment authentication data on our servers.",
        ],
      },
      {
        title: "5. Data Sharing",
        body: [
          "We may process data with necessary infrastructure, authentication, storage, email, payment, and security providers to operate the service.",
          "We do not sell your personal information. We only share necessary information when required to provide the service, comply with law, protect the platform, or with your authorization.",
        ],
      },
      {
        title: "6. Security",
        body: [
          "We use reasonable technical and organizational measures, including access controls, encrypted transport, permission management, and monitoring.",
          "No internet service is perfectly secure. If you notice unusual account or data activity, contact us through the contact page.",
        ],
      },
      {
        title: "7. Your Rights",
        body: [
          "You may contact us to request access, correction, or deletion of account-related data. Some data may be retained for billing, security, compliance, or dispute handling.",
          "You can manage cookies and certain preferences through your browser or system settings.",
        ],
      },
      {
        title: "8. Contact",
        body: ["If you have questions about this policy or data processing, please contact us through the contact page."],
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
    title: t("privacy.title"),
    description: t("privacy.description"),
    openGraph: {
      images: [t("privacy.ogImage")],
    },
  };
}

export default async function PrivacyPage(
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
