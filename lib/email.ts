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
    subject: 'Verify your Han Portrait account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Verify your Han Portrait account</h1>
        <p>Click the button below to verify your email and start creating AI Hanfu portraits.</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          If you didn't create a Han Portrait account, you can safely ignore this email.
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
    subject: 'Reset your Han Portrait password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Reset your password</h1>
        <p>We received a request to reset your password. Click the button below to set a new password.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

// 发送欢迎邮件
export async function sendWelcomeEmail(email: string, name?: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to Han Portrait',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Han Portrait${name ? ', ' + name : ''}</h1>
        <p>Thank you for joining Han Portrait. You can now upload photos, choose styles, and start creating AI Hanfu portraits.</p>
        <p>Here's what you can do next:</p>
        <ul style="line-height: 1.8;">
          <li>Complete your account profile</li>
          <li>Explore the Hanfu template gallery</li>
          <li>Start generating portraits</li>
          <li>Review your credits and membership benefits</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/en/generate" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Start Creating
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          If you have any questions, please contact us through our support page.
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
    subject: 'Your Han Portrait purchase confirmation',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Purchase Successful</h1>
        <p>Thank you for purchasing Han Portrait services. Here are your order details:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Product:</strong> ${planName}</p>
          <p><strong>Amount:</strong> ${orderDetails.amount}</p>
          <p><strong>Credits added:</strong> ${orderDetails.credits}</p>
          ${orderDetails.type === 'subscription' ? '<p><strong>Type:</strong> Membership subscription</p>' : ''}
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/en/credits" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          View Credits
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          Thank you for choosing Han Portrait.
        </p>
      </div>
    `,
  });
}

// 发送订阅到期提醒
export async function sendSubscriptionExpiryReminder(email: string, daysRemaining: number) {
  return sendEmail({
    to: email,
    subject: `Your Han Portrait membership expires in ${daysRemaining} days`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Membership Expiration Reminder</h1>
        <p>Your Han Portrait membership will expire in <strong>${daysRemaining} day${daysRemaining > 1 ? 's' : ''}</strong>.</p>
        <p>To continue accessing premium templates and benefits, please visit our pricing page to renew.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/en/pricing" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          View Subscription Plans
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          If you have any questions, please contact us through our support page.
        </p>
      </div>
    `,
  });
}

// 发送积分不足提醒
export async function sendLowCreditsNotification(email: string, remainingCredits: number) {
  return sendEmail({
    to: email,
    subject: 'Low credits notification from Han Portrait',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff6b6b;">Low Credits Reminder</h1>
        <p>You have <strong>${remainingCredits} credit${remainingCredits > 1 ? 's' : ''}</strong> remaining in your account.</p>
        <p>To continue generating AI Hanfu portraits, you can purchase a credit pack or subscribe to a membership plan.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/en/pricing" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Purchase Credits
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          If you need assistance, please contact us through our support page.
        </p>
      </div>
    `,
  });
}
