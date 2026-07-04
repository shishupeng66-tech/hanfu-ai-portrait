import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n.config";

type LegalSection = {
  title: string;
  body: string[];
};

const content = {
  zh: {
    title: "服务条款",
    updatedAt: "最后更新：2026 年 7 月 4 日",
    intro:
      "欢迎使用汉韵写真。使用本网站、账户系统、积分、会员订阅、模板库和 AI 汉服写真生成服务，即表示你同意以下条款。",
    sections: [
      {
        title: "1. 服务说明",
        body: [
          "汉韵写真提供基于用户上传照片生成 AI 汉服写真图片的在线服务。你可以上传清晰正脸照，选择不同汉服风格模板，并消耗积分生成写真结果。",
          "我们会持续优化模型、模板、预览体验和作品管理功能，具体功能以页面实际展示为准。",
        ],
      },
      {
        title: "2. 账户、会员与积分",
        body: [
          "部分功能需要注册或登录账户后使用。你需要妥善保管账户登录信息，并对账户下发生的操作负责。",
          "生成写真会消耗积分。积分可通过会员方案、积分包或平台活动获得。不同方案的权益、价格和发放规则以定价页和结算页展示为准。",
        ],
      },
      {
        title: "3. 用户上传内容",
        body: [
          "你应确保自己有权上传相关照片，不得上传违法、侵权、冒用他人身份、侵犯他人隐私或未经授权的人像照片。",
          "你不得使用本服务生成、传播违法、有害、骚扰、欺诈、侵权或违反公序良俗的内容。",
        ],
      },
      {
        title: "4. 生成内容与使用范围",
        body: [
          "生成结果主要供你个人欣赏、社交分享或合理的非违法用途使用。你在使用生成结果时仍需遵守适用法律法规和第三方平台规则。",
          "由于 AI 生成具有不确定性，结果可能与上传照片、所选模板或你的期待存在差异。我们不保证每次生成都完全符合预期。",
        ],
      },
      {
        title: "5. 服务变更与可用性",
        body: [
          "我们可能根据产品运营需要调整模板、模型、积分规则、会员权益、页面功能或服务入口。",
          "我们会尽力保持服务稳定，但不承诺服务不会中断或完全无错误。维护、升级、网络故障或第三方服务异常可能影响使用。",
        ],
      },
      {
        title: "6. 免责声明",
        body: [
          "汉韵写真按照现有能力提供服务。除法律明确规定外，我们不对生成结果的准确性、审美效果、商业适用性或特定用途作出保证。",
          "因用户上传不当内容、未经授权使用他人照片或违法传播生成结果造成的责任，由用户自行承担。",
        ],
      },
      {
        title: "7. 联系方式",
        body: [
          "如果你对本服务条款、账户、积分或生成结果有疑问，可以通过网站的联系我们页面与我们取得联系。",
        ],
      },
    ],
  },
  en: {
    title: "Terms of Service",
    updatedAt: "Last updated: July 4, 2026",
    intro:
      "Welcome to Han Portrait. By using our website, accounts, credits, subscriptions, template library, and AI Hanfu portrait generation service, you agree to these terms.",
    sections: [
      {
        title: "1. Service Description",
        body: [
          "Han Portrait provides an online service that generates AI Hanfu portrait images from user-uploaded photos. You can upload a clear front-facing photo, choose a Hanfu style template, and spend credits to create results.",
          "We may improve models, templates, preview experiences, and gallery features over time. Available features are determined by what is shown in the product.",
        ],
      },
      {
        title: "2. Accounts, Memberships, and Credits",
        body: [
          "Some features require an account. You are responsible for keeping your login information secure and for activities under your account.",
          "Generating portraits consumes credits. Credits may be provided through memberships, credit packs, or promotions. Plan benefits, pricing, and grant rules are shown on the pricing and checkout pages.",
        ],
      },
      {
        title: "3. User Uploads",
        body: [
          "You must have the right to upload each photo. Do not upload illegal, infringing, impersonating, privacy-invasive, or unauthorized images of other people.",
          "You may not use the service to create or distribute unlawful, harmful, harassing, fraudulent, infringing, or abusive content.",
        ],
      },
      {
        title: "4. Generated Content",
        body: [
          "Generated results are intended for personal enjoyment, social sharing, and lawful uses. You remain responsible for complying with laws and third-party platform rules when using them.",
          "AI generation is probabilistic. Results may differ from your uploaded photo, selected template, or expectations, and we do not guarantee that every generation will match your preferences.",
        ],
      },
      {
        title: "5. Service Changes and Availability",
        body: [
          "We may adjust templates, models, credit rules, membership benefits, product features, or access points as the service evolves.",
          "We try to keep the service reliable, but maintenance, upgrades, network issues, or third-party service interruptions may affect availability.",
        ],
      },
      {
        title: "6. Disclaimer",
        body: [
          "Han Portrait is provided as available. To the extent permitted by law, we do not guarantee the accuracy, aesthetic quality, commercial fitness, or suitability of generated results for a specific purpose.",
          "Users are responsible for consequences caused by improper uploads, unauthorized use of another person’s photo, or unlawful distribution of generated content.",
        ],
      },
      {
        title: "7. Contact",
        body: [
          "If you have questions about these terms, accounts, credits, or generated results, please contact us through the contact page.",
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
    title: t("terms.title"),
    description: t("terms.description"),
    openGraph: {
      images: [t("terms.ogImage")],
    },
  };
}

export default async function TermsPage(
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
