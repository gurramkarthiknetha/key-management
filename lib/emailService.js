// Email notification service using nodemailer
import nodemailer from 'nodemailer';

// Email templates for different notification types
const EMAIL_TEMPLATES = {
  KEY_OVERDUE: {
    subject: 'Key Return Reminder - VNR Key Management',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #88041c; color: white; padding: 20px; text-align: center;">
          <h1>VNR Key Management System</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #88041c;">Key Return Reminder</h2>
          <p>Dear ${data.facultyName},</p>
          <p>This is a reminder that the following key is overdue for return:</p>
          <div style="background: white; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <strong>Key:</strong> ${data.keyName}<br>
            <strong>Lab:</strong> ${data.labName}<br>
            <strong>Days Overdue:</strong> ${data.daysOverdue}<br>
            <strong>Due Date:</strong> ${data.dueDate}
          </div>
          <p>Please return the key to the security desk immediately to avoid any penalties.</p>
          <p>If you have any questions, please contact the security office.</p>
          <p>Best regards,<br>VNR Key Management Team</p>
        </div>
      </div>
    `
  },

  KEY_ASSIGNMENT: {
    subject: 'New Key Assignment - VNR Key Management',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #88041c; color: white; padding: 20px; text-align: center;">
          <h1>VNR Key Management System</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #88041c;">New Key Assignment</h2>
          <p>Dear ${data.facultyName},</p>
          <p>You have been assigned access to the following key:</p>
          <div style="background: white; padding: 15px; border-left: 4px solid #22c55e; margin: 20px 0;">
            <strong>Key:</strong> ${data.keyName}<br>
            <strong>Lab:</strong> ${data.labName}<br>
            <strong>Access Type:</strong> ${data.accessType}<br>
            <strong>Assigned Date:</strong> ${data.assignedDate}
          </div>
          <p>You can now collect this key from the security desk during office hours.</p>
          <p>Please remember to return the key on time to avoid any issues.</p>
          <p>Best regards,<br>VNR Key Management Team</p>
        </div>
      </div>
    `
  },

  SECURITY_ALERT: {
    subject: 'Security Alert - VNR Key Management',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #88041c; color: white; padding: 20px; text-align: center;">
          <h1>VNR Key Management System</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #ef4444;">Security Alert</h2>
          <p>Dear Security Team,</p>
          <p>The following security alert requires immediate attention:</p>
          <div style="background: white; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <strong>Alert Type:</strong> ${data.alertType}<br>
            <strong>Key:</strong> ${data.keyName}<br>
            <strong>Faculty:</strong> ${data.facultyName}<br>
            <strong>Details:</strong> ${data.details}<br>
            <strong>Time:</strong> ${data.timestamp}
          </div>
          <p>Please take appropriate action immediately.</p>
          <p>Best regards,<br>VNR Key Management System</p>
        </div>
      </div>
    `
  },

  WEEKLY_REPORT: {
    subject: 'Weekly Key Usage Report - VNR Key Management',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #88041c; color: white; padding: 20px; text-align: center;">
          <h1>VNR Key Management System</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #88041c;">Weekly Key Usage Report</h2>
          <p>Dear ${data.recipientName},</p>
          <p>Here's your weekly key usage summary for ${data.weekPeriod}:</p>
          <div style="background: white; padding: 15px; margin: 20px 0;">
            <h3>Summary Statistics:</h3>
            <ul>
              <li>Total Transactions: ${data.totalTransactions}</li>
              <li>Keys Collected: ${data.keysCollected}</li>
              <li>Keys Returned: ${data.keysReturned}</li>
              <li>Overdue Keys: ${data.overdueKeys}</li>
              <li>Active Delegations: ${data.activeDelegations}</li>
            </ul>
          </div>
          <p>For detailed reports, please log in to the key management system.</p>
          <p>Best regards,<br>VNR Key Management Team</p>
        </div>
      </div>
    `
  }
};

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Check if SMTP credentials are configured
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP credentials not configured. Email service will be disabled.');
        this.transporter = null;
        return;
      }

      // Configure nodemailer transporter
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Verify connection
      await this.transporter.verify();
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.transporter = null;
    }
  }

  async sendEmail(to, templateType, data) {
    if (!this.transporter) {
      console.warn('Email transporter not initialized. Email not sent to:', to);
      // Return true to prevent blocking the application flow
      return true;
    }

    try {
      const template = EMAIL_TEMPLATES[templateType];
      if (!template) {
        console.error('Email template not found:', templateType);
        return false;
      }

      const mailOptions = {
        from: `"VNR Key Management" <${process.env.SMTP_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: template.subject,
        html: template.template(data)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Specific email methods for different scenarios
  async sendOverdueReminder(facultyEmail, keyData) {
    return this.sendEmail(facultyEmail, 'KEY_OVERDUE', {
      facultyName: keyData.facultyName,
      keyName: keyData.keyName,
      labName: keyData.labName,
      daysOverdue: keyData.daysOverdue,
      dueDate: new Date(keyData.dueDate).toLocaleDateString()
    });
  }

  async sendKeyAssignmentNotification(facultyEmail, keyData) {
    return this.sendEmail(facultyEmail, 'KEY_ASSIGNMENT', {
      facultyName: keyData.facultyName,
      keyName: keyData.keyName,
      labName: keyData.labName,
      accessType: keyData.accessType,
      assignedDate: new Date(keyData.assignedDate).toLocaleDateString()
    });
  }

  async sendSecurityAlert(securityEmails, alertData) {
    return this.sendEmail(securityEmails, 'SECURITY_ALERT', {
      alertType: alertData.alertType,
      keyName: alertData.keyName,
      facultyName: alertData.facultyName,
      details: alertData.details,
      timestamp: new Date(alertData.timestamp).toLocaleString()
    });
  }

  async sendWeeklyReport(recipientEmail, reportData) {
    return this.sendEmail(recipientEmail, 'WEEKLY_REPORT', {
      recipientName: reportData.recipientName,
      weekPeriod: reportData.weekPeriod,
      totalTransactions: reportData.totalTransactions,
      keysCollected: reportData.keysCollected,
      keysReturned: reportData.keysReturned,
      overdueKeys: reportData.overdueKeys,
      activeDelegations: reportData.activeDelegations
    });
  }

  // Bulk email methods
  async sendBulkOverdueReminders(overdueKeys) {
    const results = [];
    for (const keyData of overdueKeys) {
      const result = await this.sendOverdueReminder(keyData.facultyEmail, keyData);
      results.push({ keyId: keyData.keyId, success: result });
    }
    return results;
  }

  async sendDepartmentReport(hodEmail, departmentData) {
    return this.sendWeeklyReport(hodEmail, {
      recipientName: departmentData.hodName,
      weekPeriod: departmentData.weekPeriod,
      totalTransactions: departmentData.stats.totalTransactions,
      keysCollected: departmentData.stats.keysCollected,
      keysReturned: departmentData.stats.keysReturned,
      overdueKeys: departmentData.stats.overdueKeys,
      activeDelegations: departmentData.stats.activeDelegations
    });
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;
