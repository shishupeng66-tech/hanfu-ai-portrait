import { Resend } from 'resend';

// 获取默认发件邮箱的函数
const getDefaultFromEmail = () => {
  // 1. 优先使用用户配置的完整发件地址
  if (process.env.RESEND_FROM_EMAIL) {
    return process.env.RESEND_FROM_EMAIL;
  }
  
  // 2. 开发环境使用 Resend 测试邮箱
  if (process.env.NODE_ENV === 'development') {
    return 'Han Portrait <onboarding@resend.dev>';
  }
  
  // 3. 生产环境要求必须配置
  if (!process.env.RESEND_VERIFIED_DOMAIN) {
    console.error('❌ RESEND_VERIFIED_DOMAIN is required in production');
    console.error('Please add RESEND_VERIFIED_DOMAIN to your environment variables');
    console.error('Example: RESEND_VERIFIED_DOMAIN=yourdomain.com');
    // 返回一个明显的错误邮箱，让问题立即暴露
    return 'DOMAIN_NOT_CONFIGURED@example.com';
  }
  
  // 4. 使用配置的域名和应用名称
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Han Portrait';
  const fromName = process.env.RESEND_FROM_NAME || appName;
  return `${fromName} <noreply@${process.env.RESEND_VERIFIED_DOMAIN}>`;
};

export function getResendClient(apiKey = process.env.RESEND_API_KEY) {
  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface PurchaseEmailDetails {
  orderId: string;
  plan: string;
  amount: string;
  credits: number;
  type: "subscription" | "one_time";
}

export async function sendEmail({
  to,
  subject,
  react,
  html,
  text,
  from,
  replyTo,
}: SendEmailOptions) {
  try {
    const resend = getResendClient();
    if (!resend) {
      const error = new Error("RESEND_API_KEY is not configured");
      console.warn("[Email] Skipping send because RESEND_API_KEY is missing");
      return { success: false, error };
    }

    const data = await resend.emails.send({
      to,
      subject,
      react,
      html,
      text,
      from: from ?? getDefaultFromEmail(),
      ...(replyTo ? { replyTo } : {}),
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

// 发送验证邮件
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  
  return sendEmail({
    to: email,
    subject: '验证你的汉韵写真账户',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">验证你的汉韵写真账户</h1>
        <p>点击下方按钮完成邮箱验证，开始创作 AI 汉服写真。</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          完成邮箱验证
        </a>
        <p>你也可以复制以下链接到浏览器打开：</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          如果你没有注册汉韵写真账户，可以忽略这封邮件。
        </p>
      </div>
    `,
  });
}

// 发送密码重置邮件
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  
  return sendEmail({
    to: email,
    subject: '重置你的汉韵写真密码',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">重置你的汉韵写真密码</h1>
        <p>我们收到了重置密码请求，请点击下方按钮设置新密码。</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          重置密码
        </a>
        <p>你也可以复制以下链接到浏览器打开：</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          此链接将在 1 小时后失效。如果你没有请求重置密码，可以忽略这封邮件。
        </p>
      </div>
    `,
  });
}

// 发送欢迎邮件
export async function sendWelcomeEmail(email: string, name?: string) {
  return sendEmail({
    to: email,
    subject: '欢迎来到汉韵写真',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">欢迎来到汉韵写真${name ? ', ' + name : ''}</h1>
        <p>感谢加入汉韵写真。你现在可以上传照片，选择模板，开始创作 AI 汉服写真。</p>
        <p>你可以继续：</p>
        <ul style="line-height: 1.8;">
          <li>完善账户资料</li>
          <li>浏览汉服模板库</li>
          <li>开始生成写真</li>
          <li>查看积分与会员权益</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/zh/generate" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          开始创作
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          如有问题，请通过联系我们页面与我们联系。
        </p>
      </div>
    `,
  });
}

// 发送订单成功邮件
export async function sendPurchaseEmail(email: string, orderDetails: PurchaseEmailDetails) {
  const planName = orderDetails.type === 'subscription' 
    ? `${orderDetails.plan} Subscription` 
    : `${orderDetails.credits} Credits Pack`;

  return sendEmail({
    to: email,
    subject: '汉韵写真购买确认',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">购买成功</h1>
        <p>感谢购买汉韵写真服务。以下是你的订单信息：</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>订单 ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>产品:</strong> ${planName}</p>
          <p><strong>金额:</strong> ${orderDetails.amount}</p>
          <p><strong>到账积分:</strong> ${orderDetails.credits}</p>
          ${orderDetails.type === 'subscription' ? '<p><strong>类型:</strong> 会员订阅</p>' : ''}
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/zh/credits" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          查看积分中心
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          感谢选择汉韵写真。
        </p>
      </div>
    `,
  });
}

// 发送订阅到期提醒
export async function sendSubscriptionExpiryReminder(email: string, daysRemaining: number) {
  return sendEmail({
    to: email,
    subject: `你的汉韵写真会员将在 ${daysRemaining} 天后到期`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">会员到期提醒</h1>
        <p>你的汉韵写真会员将在 <strong>${daysRemaining} 天</strong>后到期。</p>
        <p>如需继续使用会员模板和权益，请前往定价页续订。</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/zh/pricing" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          查看订阅计划
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          如有问题，请通过联系我们页面与我们联系。
        </p>
      </div>
    `,
  });
}

// 发送积分不足提醒
export async function sendLowCreditsNotification(email: string, remainingCredits: number) {
  return sendEmail({
    to: email,
    subject: '汉韵写真积分不足提醒',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff6b6b;">积分不足提醒</h1>
        <p>你的账户仅剩 <strong>${remainingCredits} 积分</strong>。</p>
        <p>如需继续生成 AI 汉服写真，可以购买积分包或会员方案。</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/zh/pricing" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          购买积分
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          如需帮助，请通过联系我们页面与我们联系。
        </p>
      </div>
    `,
  });
}
