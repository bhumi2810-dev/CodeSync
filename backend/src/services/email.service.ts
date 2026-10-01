import nodemailer from "nodemailer";
import { env } from "../config/env";

function createTransporter(): any | null {
  const host = env.SMTP_HOST;
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;
  const port = env.SMTP_PORT || 587;
  const secure = env.SMTP_SECURE || port === 465;

  if (!user || !pass) {
    return null;
  }

  try {
    if (host.includes("gmail") || user.endsWith("@gmail.com")) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass,
        },
      });
    }

    return nodemailer.createTransport({
      host: host || "smtp.gmail.com",
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  } catch (err: any) {
    console.error("[EmailService] Failed to initialize SMTP transporter:", err?.message || err);
    return null;
  }
}

export interface SendResetEmailParams {
  toEmail: string;
  name?: string;
  resetToken: string;
}

export async function sendPasswordResetEmail({
  toEmail,
  name = "User",
  resetToken,
}: SendResetEmailParams): Promise<{ sent: boolean; messageId?: string; resetUrl: string; error?: string }> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

  console.log(`\n======================================================`);
  console.log(`[EmailService] Password Reset Requested`);
  console.log(`To: ${toEmail} (${name})`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`Token expires in 30 minutes.`);
  console.log(`======================================================`);

  const transport = createTransporter();

  if (!transport) {
    console.warn(
      `\n[DEV-ONLY FALLBACK] SMTP credentials (EMAIL_USER / EMAIL_PASS) are not configured in backend/.env.` +
      `\nUse the following link to reset password directly in development:` +
      `\n>>> ${resetUrl} <<<\n`
    );
    return { sent: false, resetUrl, error: "SMTP credentials not configured" };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 24px; }
        .card { max-width: 520px; margin: 0 auto; background-color: #131b2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; }
        .logo { font-size: 20px; font-weight: bold; color: #818cf8; margin-bottom: 20px; display: inline-block; }
        .title { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
        .button { display: inline-block; background-color: #6366f1; color: #ffffff !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px; margin-bottom: 24px; }
        .footer { font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">&lt;/&gt; CodeSync</div>
        <div class="title">Reset Your Password</div>
        <p class="text">Hello ${name},</p>
        <p class="text">We received a request to reset your password for your CodeSync account. Click the button below to choose a new password. This link is valid for 30 minutes.</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button" target="_blank">Reset Password</a>
        </div>
        <p class="text" style="font-size: 12px;">If you didn't request a password reset, you can safely ignore this email. Your password will not change until you access the link above and create a new one.</p>
        <div class="footer">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #818cf8; word-break: break-all;">${resetUrl}</a>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hello ${name},

We received a request to reset your password for your CodeSync account.
Please use the following link to reset your password (valid for 30 minutes):

${resetUrl}

If you did not request this, please ignore this email.
`;

  try {
    const info = await transport.sendMail({
      from: env.EMAIL_FROM || `"CodeSync" <${env.SMTP_USER}>`,
      to: toEmail,
      subject: "Reset your CodeSync password",
      text: textContent,
      html: htmlContent,
    });

    console.log(`[EmailService] Password reset email sent successfully to ${toEmail}. Message ID: ${info.messageId}\n`);
    return { sent: true, messageId: info.messageId, resetUrl };
  } catch (error: any) {
    console.error(`\n[EmailService ERROR] Failed to send email via SMTP to ${toEmail}:`);
    console.error(`Message: ${error?.message || error}`);
    if (error?.code) console.error(`Code: ${error.code}`);
    if (error?.response) console.error(`Response: ${error.response}`);
    console.warn(
      `\n[DEV-ONLY FALLBACK] Password reset email could not be delivered by SMTP.` +
      `\nUse the reset link directly:` +
      `\n>>> ${resetUrl} <<<\n`
    );
    return { sent: false, resetUrl, error: error?.message || "Failed to send email" };
  }
}
