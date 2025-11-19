// Email service placeholder
// Will integrate with Resend or SendGrid

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  async sendEmail(options: EmailOptions): Promise<void> {
    // TODO: Implement email sending
    // For now, just log
    console.log('Email would be sent:', {
      to: options.to,
      subject: options.subject,
    });

    // In production, integrate with:
    // - Resend (recommended)
    // - SendGrid
    // - AWS SES
  }

  async sendExecutorInvite(email: string, inviteToken: string, userName: string): Promise<void> {
    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${inviteToken}`;
    
    await this.sendEmail({
      to: email,
      subject: `You've been named an executor for ${userName}'s Dead Drop`,
      text: `${userName} has named you as an executor for their Dead Drop vaults. Click here to accept: ${inviteUrl}`,
      html: `
        <h1>You've been named an executor</h1>
        <p>${userName} has named you as an executor for their Dead Drop vaults.</p>
        <p><a href="${inviteUrl}">Accept invitation</a></p>
        <p>If you don't know what this is, you can safely ignore this email.</p>
      `,
    });
  }

  async sendProofOfLifeReminder(email: string, daysSinceCheckIn: number): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Haven't seen you in ${daysSinceCheckIn} days`,
      text: `You haven't checked in for ${daysSinceCheckIn} days. Your executors will be notified if you don't check in soon.`,
      html: `
        <h1>Proof of Life Reminder</h1>
        <p>You haven't checked in for ${daysSinceCheckIn} days.</p>
        <p>Your executors will be notified if you don't check in soon.</p>
        <p><a href="${process.env.FRONTEND_URL}">Check in now</a></p>
      `,
    });
  }

  async sendTriggerWarning(email: string, vaultName: string, daysRemaining: number): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Trigger warning: ${vaultName} will release in ${daysRemaining} days`,
      text: `Your vault "${vaultName}" is scheduled to release in ${daysRemaining} days. You can cancel this from the app.`,
      html: `
        <h1>Trigger Warning</h1>
        <p>Your vault "${vaultName}" is scheduled to release in ${daysRemaining} days.</p>
        <p>You can cancel this from the app if you're still alive.</p>
        <p><a href="${process.env.FRONTEND_URL}">Manage vaults</a></p>
      `,
    });
  }
}

export const emailService = new EmailService();

