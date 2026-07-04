import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n.config";

type LegalSection = {
  title: string;
  body: string[];
};

const content = {
  zh: {
    title: "退款政策",
    updatedAt: "最后更新：2026 年 7 月 4 日",
    intro:
      "本政策说明汉韵写真会员订阅、积分包和 AI 汉服写真生成服务的退款处理原则。我们会尽力公平处理支付异常和服务故障。",
    sections: [
      {
        title: "1. 积分包",
        body: [
          "积分包属于数字权益。积分成功发放后，如果已经被用于生成写真，通常不支持退款。",
          "如果出现积分未到账、重复扣款、订单状态异常等情况，请通过联系我们页面提交账户邮箱、订单信息和问题说明，我们会协助核查。",
        ],
      },
      {
        title: "2. 会员订阅",
        body: [
          "会员订阅可按平台提供的入口取消。取消后，当前计费周期内已开通的权益通常会保留至周期结束。",
          "已经开始的订阅周期一般不按单日自动折算退款，除非适用法律要求或平台确认存在重复扣款、权益未开通等异常。",
        ],
      },
      {
        title: "3. AI 生成结果",
        body: [
          "AI 图片生成存在不确定性。由于单次结果不满意、风格差异、五官细节不完全符合预期等原因，通常不会自动退款。",
          "如果生成失败且系统未交付结果，或因平台故障导致积分异常扣除，我们会核查并视情况补发积分或处理退款。",
        ],
      },
      {
        title: "4. 特殊情况",
        body: [
          "对于重复扣费、支付成功但权益长时间未到账、平台系统故障、账户异常扣减等情况，我们会根据订单记录和系统日志进行处理。",
          "为便于核查，请尽量提供账户邮箱、支付时间、订单号、截图和问题描述。",
        ],
      },
      {
        title: "5. 第三方支付",
        body: [
          "支付由 Creem 等第三方支付服务处理。退款到账时间可能受支付渠道、银行或地区规则影响。",
          "如果你通过支付机构发起争议或拒付，账户权益可能会被暂停或调整，直至争议处理完成。",
        ],
      },
      {
        title: "6. 联系方式",
        body: [
          "如需申请处理支付或退款问题，请通过网站的联系我们页面提交信息。我们会在合理时间内回复并协助核查。",
        ],
      },
    ],
  },
  en: {
    title: "Refund Policy",
    updatedAt: "Last updated: July 4, 2026",
    intro:
      "This policy explains how Han Portrait handles refunds for memberships, credit packs, and AI Hanfu portrait generation. We aim to handle payment issues and service failures fairly.",
    sections: [
      {
        title: "1. Credit Packs",
        body: [
          "Credit packs are digital entitlements. Once credits have been granted and used for portrait generation, they are generally not refundable.",
          "If credits are not delivered, you are charged twice, or an order status looks incorrect, contact us with your account email, order information, and issue description.",
        ],
      },
      {
        title: "2. Membership Subscriptions",
        body: [
          "Memberships may be canceled through the available product or billing flow. After cancellation, benefits for the current billing period generally remain available until the period ends.",
          "Started subscription periods are generally not automatically prorated by day unless required by law or we confirm duplicate charges, failed entitlement activation, or another payment issue.",
        ],
      },
      {
        title: "3. AI Generation Results",
        body: [
          "AI image generation is probabilistic. A refund is generally not automatic solely because one result is unsatisfactory, stylistically different, or not exactly as expected.",
          "If generation fails without delivering a result, or a platform issue causes an abnormal credit deduction, we will review the case and may restore credits or process a refund where appropriate.",
        ],
      },
      {
        title: "4. Special Cases",
        body: [
          "Duplicate charges, successful payment without entitlement delivery, platform failures, or abnormal account deductions will be reviewed based on order records and system logs.",
          "Please provide your account email, payment time, order ID, screenshots, and a description to help us investigate.",
        ],
      },
      {
        title: "5. Third-Party Payments",
        body: [
          "Payments are processed by third-party payment providers such as Creem. Refund timing may depend on the payment channel, bank, or regional rules.",
          "If you initiate a dispute or chargeback through a payment provider, account benefits may be paused or adjusted until the dispute is resolved.",
        ],
      },
      {
        title: "6. Contact",
        body: [
          "To request help with a payment or refund issue, contact us through the contact page. We will respond and investigate within a reasonable time.",
        ],
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
    title: t("refund.title"),
    description: t("refund.description"),
    openGraph: {
      images: [t("refund.ogImage")],
    },
  };
}

export default async function RefundPage(
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
