import nodemailer from 'nodemailer';
import { EmailTemplates } from './email-templates';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SendEmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.initializeTransporter();
  }

  private async initializeTransporter(): Promise<void> {
    try {
      this.transporter = nodemailer.createTransporter(this.config);
      
      // Verify connection
      await this.transporter.verify();
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.transporter = null;
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: `"Key Management System" <${process.env.SMTP_FROM || this.config.auth.user}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendKeyAccessGranted(
    userEmail: string,
    data: {
      userName: string;
      keyName: string;
      keyId: string;
      location: string;
      dueDate: string;
      issuedBy: string;
      notes?: string;
    }
  ): Promise<boolean> {
    const template = EmailTemplates.keyAccessGranted(data);
    
    return this.sendEmail({
      to: userEmail,
      cc: process.env.SECURITY_EMAIL ? [process.env.SECURITY_EMAIL] : undefined,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendOverdueAlert(
    userEmail: string,
    data: {
      userName: string;
      userEmail: string;
      keyName: string;
      keyId: string;
      dueDate: string;
      daysOverdue: number;
      location: string;
    }
  ): Promise<boolean> {
    const template = EmailTemplates.overdueAlert(data);
    
    return this.sendEmail({
      to: userEmail,
      cc: process.env.SECURITY_EMAIL ? [process.env.SECURITY_EMAIL] : undefined,
      bcc: process.env.HOD_EMAIL ? [process.env.HOD_EMAIL] : undefined,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendDailyReport(
    recipients: string[],
    data: {
      date: string;
      totalTransactions: number;
      checkouts: number;
      checkins: number;
      overdueKeys: number;
      availableKeys: number;
      recentActivity: Array<{
        action: string;
        keyName: string;
        userName: string;
        timestamp: string;
      }>;
      overdueList: Array<{
        keyName: string;
        userName: string;
        daysOverdue: number;
      }>;
    }
  ): Promise<boolean> {
    const template = EmailTemplates.dailyReport(data);
    
    return this.sendEmail({
      to: recipients,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendBulkOverdueAlerts(
    overdueKeys: Array<{
      userEmail: string;
      userName: string;
      keyName: string;
      keyId: string;
      dueDate: string;
      daysOverdue: number;
      location: string;
    }>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const keyData of overdueKeys) {
      try {
        const success = await this.sendOverdueAlert(keyData.userEmail, keyData);
        if (success) {
          sent++;
        } else {
          failed++;
        }
        
        // Add delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to send overdue alert to ${keyData.userEmail}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Key Management System - Test Email',
      html: `
        <h2>Email Service Test</h2>
        <p>This is a test email from the Key Management System.</p>
        <p>If you receive this email, the email service is working correctly.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
      text: `
        Email Service Test
        
        This is a test email from the Key Management System.
        If you receive this email, the email service is working correctly.
        
        Sent at: ${new Date().toISOString()}
      `,
    });
  }

  // Get email configuration status
  getConfigStatus(): {
    configured: boolean;
    host: string;
    port: number;
    user: string;
    hasCredentials: boolean;
  } {
    return {
      configured: !!this.transporter,
      host: this.config.host,
      port: this.config.port,
      user: this.config.auth.user,
      hasCredentials: !!(this.config.auth.user && this.config.auth.pass),
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();
