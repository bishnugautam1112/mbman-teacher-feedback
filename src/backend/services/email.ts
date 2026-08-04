import nodemailer from "nodemailer";

/**
 * Priority-Based Email Dispatcher & Gmail Rate Limiter
 * Ensures critical security emails (OTP, Password Reset) are delivered instantly,
 * while lower priority notification emails are rate-limited safely.
 * Strict No-Emoji policy implemented for maximum deliverability & spam filter bypass.
 */

// Singleton Nodemailer Transporter with Connection Pooling
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
  rateLimit: 1, // max 1 email per second limit to prevent Gmail SMTP bans
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_APP_PASSWORD || "",
  },
});

interface EmailJob {
  id: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  priority: "HIGH" | "NORMAL" | "LOW";
}

class EmailQueueManager {
  private lowQueue: EmailJob[] = [];
  private isProcessingLowQueue = false;

  /**
   * HIGH PRIORITY: Login OTP, Password Reset Token.
   * Dispatched immediately with 0 delay.
   */
  public async sendHighPriority(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    return this.dispatchMailDirect({
      id: Math.random().toString(36).substring(7),
      to,
      subject,
      html,
      text,
      priority: "HIGH",
    });
  }

  /**
   * NORMAL PRIORITY: Student Welcome, KYC Receipt, Admin Alerts, KYC Approved/Rejected.
   * Dispatched asynchronously in background without blocking API routes.
   */
  public sendNormalPriority(to: string, subject: string, html: string, text?: string): void {
    setImmediate(async () => {
      await this.dispatchMailDirect({
        id: Math.random().toString(36).substring(7),
        to,
        subject,
        html,
        text,
        priority: "NORMAL",
      });
    });
  }

  /**
   * LOW PRIORITY: Teacher Daily AI Summaries, Batch Digests.
   * Enqueued in rate-limited background queue (1 email per 1.5s delay).
   */
  public sendLowPriority(to: string, subject: string, html: string, text?: string): void {
    this.lowQueue.push({
      id: Math.random().toString(36).substring(7),
      to,
      subject,
      html,
      text,
      priority: "LOW",
    });
    this.processLowQueue();
  }

  private async processLowQueue(): Promise<void> {
    if (this.isProcessingLowQueue || this.lowQueue.length === 0) return;
    this.isProcessingLowQueue = true;

    while (this.lowQueue.length > 0) {
      const job = this.lowQueue.shift();
      if (!job) break;
      await this.dispatchMailDirect(job);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    this.isProcessingLowQueue = false;
  }

  private async dispatchMailDirect(job: EmailJob): Promise<boolean> {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.log(`[DEV MODE] Email (${job.priority}) to ${job.to}: "${job.subject}"`);
      return true;
    }

    // Strip any residual emojis from subject line for deliverability
    const cleanSubject = job.subject.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, "").trim();

    // Generate plain text fallback if not provided to bypass spam filters
    const plainTextBody = job.text || job.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    try {
      await transporter.sendMail({
        from: '"MBMAN Teacher Feedback System" <noreply@mbman.edu.np>',
        to: job.to,
        subject: cleanSubject,
        text: plainTextBody,
        html: job.html,
      });
      console.log(`[EmailService] Sent ${job.priority} priority email to ${job.to}`);
      return true;
    } catch (error: any) {
      console.error(`[EmailService] Failed to send ${job.priority} priority email to ${job.to}:`, error.message);
      return false;
    }
  }
}

export const emailQueue = new EmailQueueManager();

// ==========================================
// PROFESSIONAL BRANDED HTML EMAIL TEMPLATES (NO EMOJIS)
// ==========================================

const BASE_STYLES = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #1e293b;
  background-color: #f8fafc;
  margin: 0;
  padding: 20px;
`;

const CARD_STYLES = `
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
`;

const HEADER_STYLES = `
  background: #1e40af;
  color: #ffffff;
  padding: 28px 24px;
  text-align: center;
`;

const BUTTON_STYLES = `
  display: inline-block;
  background: #1d4ed8;
  color: #ffffff !important;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  margin-top: 16px;
`;

const FOOTER_STYLES = `
  padding: 20px 24px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
`;

export function getOtpEmailTemplate(otp: string): string {
  return `
    <div style="${BASE_STYLES}">
      <div style="${CARD_STYLES}">
        <div style="${HEADER_STYLES}">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; tracking-tight: -0.02em;">MBMAN Feedback System</h1>
          <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 13px;">Madan Bhandari Memorial Academy Nepal</p>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Your One-Time Password (OTP)</h2>
          <p style="color: #475569; font-size: 14px;">Use the verification code below to complete your login or registration:</p>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0; display: inline-block;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; color: #1e40af; letter-spacing: 6px;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">This code expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
        </div>
        <div style="${FOOTER_STYLES}">
          <p style="margin: 0;">Dedicated to transparent academic growth at MBMAN.</p>
          <p style="margin: 4px 0 0 0;">This is an automated system message. Please do not reply.</p>
        </div>
      </div>
    </div>
  `;
}

export function getResetPasswordEmailTemplate(resetUrl: string): string {
  return `
    <div style="${BASE_STYLES}">
      <div style="${CARD_STYLES}">
        <div style="${HEADER_STYLES}">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">MBMAN Feedback System</h1>
          <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 13px;">Account Security Notice</p>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 14px;">A password reset request was received for your MBMAN account. Click the link below to set a new password:</p>
          <a href="${resetUrl}" style="${BUTTON_STYLES}">Reset Password</a>
          <p style="color: #64748b; font-size: 13px; margin-top: 24px;">If you did not request this password reset, please ignore this notice.</p>
        </div>
        <div style="${FOOTER_STYLES}">
          <p style="margin: 0;">MBMAN Teacher Feedback System | Account Security</p>
        </div>
      </div>
    </div>
  `;
}

export function getWelcomeKycTemplate(userName: string): string {
  return `
    <div style="${BASE_STYLES}">
      <div style="${CARD_STYLES}">
        <div style="${HEADER_STYLES}">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Welcome to MBMAN Feedback</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Welcome, ${userName}</h2>
          <p style="color: #475569; font-size: 14px;">Thank you for registering on the official Madan Bhandari Memorial Academy Nepal (MBMAN) Teacher Feedback Portal.</p>
          <div style="background: #f8fafc; border-left: 4px solid #1d4ed8; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 6px 0; color: #0f172a; font-size: 15px;">Student KYC Verification Required</h3>
            <p style="margin: 0; color: #475569; font-size: 14px;">To submit teacher reviews and access student features, please log into your dashboard and upload your official MBMAN Student ID Card.</p>
          </div>
          <p style="color: #475569; font-size: 14px;">All submitted reviews are processed anonymously using secure cryptographic hashing and AI moderation.</p>
        </div>
        <div style="${FOOTER_STYLES}">
          <p style="margin: 0;">Madan Bhandari Memorial Academy Nepal</p>
        </div>
      </div>
    </div>
  `;
}

export function getKycReceivedTemplate(userName: string): string {
  return `
    <div style="${BASE_STYLES}">
      <div style="${CARD_STYLES}">
        <div style="${HEADER_STYLES}">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">KYC Submission Received</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Verification Under Review</h2>
          <p style="color: #475569; font-size: 14px;">Dear ${userName}, your MBMAN Student ID Card document has been received.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; color: #166534; margin: 20px 0;">
            <strong>Status: Pending Admin Review</strong><br/>
            Our administration team will verify your document shortly. You will receive an email notice once your account status is updated.
          </div>
        </div>
        <div style="${FOOTER_STYLES}">
          <p style="margin: 0;">MBMAN Verification Team</p>
        </div>
      </div>
    </div>
  `;
}

export function getAdminKycAlertTemplate(studentName: string, studentEmail: string): string {
  return `
    <div style="${BASE_STYLES}">
      <div style="${CARD_STYLES}">
        <div style="${HEADER_STYLES}">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Pending KYC Verification Alert</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Student KYC Verification Submitted</h2>
          <p style="color: #475569; font-size: 14px;">A student has submitted an ID Card for verification:</p>
          <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin: 16px 0;">
            <tr><td style="padding: 10px 14px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Student Name</td><td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${studentName}</td></tr>
            <tr><td style="padding: 10px 14px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Email Address</td><td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${studentEmail}</td></tr>
            <tr><td style="padding: 10px 14px; font-weight: 600; color: #475569;">Verification Status</td><td style="padding: 10px 14px; color: #1e40af; font-weight: 700;">PENDING APPROVAL</td></tr>
          </table>
          <p style="color: #475569; font-size: 14px;">Log into the Admin Panel to review and process this verification request.</p>
        </div>
        <div style="${FOOTER_STYLES}">
          <p style="margin: 0;">MBMAN Administrative System</p>
        </div>
      </div>
    </div>
  `;
}

export function getKycApprovedTemplate(userName: string): string {
  return `
    <div style="${BASE_STYLES}">
      <div style="${CARD_STYLES}">
        <div style="${HEADER_STYLES}">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">KYC Verification Approved</h1>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Account Verification Confirmed</h2>
          <p style="color: #475569; font-size: 14px;">Dear ${userName}, your MBMAN Student ID Card has been reviewed and approved by administration.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 8px; color: #166534; font-weight: 600; margin: 20px 0;">
            Full student access has been granted to your account.
          </div>
          <p style="color: #475569; font-size: 14px;">You can now view teacher leaderboards and submit anonymous feedback on your portal dashboard.</p>
        </div>
        <div style="${FOOTER_STYLES}">
          <p style="margin: 0;">Madan Bhandari Memorial Academy Nepal</p>
        </div>
      </div>
    </div>
  `;
}

export function getKycRejectedTemplate(userName: string, reason: string): string {
  return `
    <div style="${BASE_STYLES}">
      <div style="${CARD_STYLES}">
        <div style="${HEADER_STYLES}">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">KYC Document Update Required</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Verification Request Not Approved</h2>
          <p style="color: #475569; font-size: 14px;">Dear ${userName}, your submitted student ID card could not be approved.</p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; padding: 14px; border-radius: 6px; color: #991b1b; margin: 20px 0;">
            <strong>Reason for Rejection:</strong><br/>
            ${reason || "The uploaded document photo was unreadable or invalid."}
          </div>
          <p style="color: #475569; font-size: 14px;">Please log into your dashboard and re-upload a clear image of your official MBMAN Student ID Card.</p>
        </div>
        <div style="${FOOTER_STYLES}">
          <p style="margin: 0;">MBMAN Verification Support</p>
        </div>
      </div>
    </div>
  `;
}

export function getTeacherSummaryTemplate(teacherName: string, dateStr: string): string {
  return `
    <div style="${BASE_STYLES}">
      <div style="${CARD_STYLES}">
        <div style="${HEADER_STYLES}">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">AI Daily Feedback Summary</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Respected ${teacherName},</h2>
          <p style="color: #475569; font-size: 14px;">Your daily student feedback summary for <strong>${dateStr}</strong> has been generated by AI and is available on your dashboard.</p>
          <p style="color: #475569; font-size: 14px;">Log in to view sanitized student feedback, appreciation notes, and rating trends.</p>
        </div>
        <div style="${FOOTER_STYLES}">
          <p style="margin: 0;">MBMAN Teacher Portal | AI Moderation Engine</p>
        </div>
      </div>
    </div>
  `;
}
