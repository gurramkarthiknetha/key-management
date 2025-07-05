import nodemailer from 'nodemailer';
import { User, Key, KeyLog } from '@/types';

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `"${process.env.NEXT_PUBLIC_APP_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendKeyAccessGrantedEmail = async (user: User, key: Key): Promise<boolean> => {
  const subject = `Key Access Granted - ${key.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Key Access Granted</h2>
      <p>Dear ${user.name},</p>
      <p>You have been granted access to the following key:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #374151;">Key Details</h3>
        <p><strong>Key Name:</strong> ${key.name}</p>
        <p><strong>Key ID:</strong> ${key.keyId}</p>
        <p><strong>Location:</strong> ${key.location}</p>
        <p><strong>Department:</strong> ${key.department}</p>
      </div>
      <p>Please ensure to return the key on time to avoid any penalties.</p>
      <p>Best regards,<br>Key Management System</p>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
};

export const sendOverdueKeyAlert = async (user: User, key: Key): Promise<boolean> => {
  const subject = `URGENT: Overdue Key Return - ${key.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">URGENT: Overdue Key Return</h2>
      <p>Dear ${user.name},</p>
      <p style="color: #dc2626; font-weight: bold;">The following key is overdue for return:</p>
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #991b1b;">Overdue Key Details</h3>
        <p><strong>Key Name:</strong> ${key.name}</p>
        <p><strong>Key ID:</strong> ${key.keyId}</p>
        <p><strong>Due Date:</strong> ${key.dueDate?.toLocaleDateString()}</p>
        <p><strong>Days Overdue:</strong> ${key.dueDate ? Math.ceil((Date.now() - key.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'}</p>
      </div>
      <p style="color: #dc2626;">Please return this key immediately to avoid further penalties.</p>
      <p>Best regards,<br>Key Management System</p>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
};

export const sendDailyReportEmail = async (
  hodEmail: string, 
  department: string, 
  logs: KeyLog[], 
  overdueKeys: Key[]
): Promise<boolean> => {
  const subject = `Daily Key Usage Report - ${department}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Daily Key Usage Report</h2>
      <p>Department: <strong>${department}</strong></p>
      <p>Date: <strong>${new Date().toLocaleDateString()}</strong></p>
      
      <h3 style="color: #374151;">Today's Activity Summary</h3>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Total Transactions:</strong> ${logs.length}</p>
        <p><strong>Check-outs:</strong> ${logs.filter(log => log.action === 'check_out').length}</p>
        <p><strong>Check-ins:</strong> ${logs.filter(log => log.action === 'check_in').length}</p>
        <p><strong>Overdue Keys:</strong> ${overdueKeys.length}</p>
      </div>
      
      ${overdueKeys.length > 0 ? `
        <h3 style="color: #dc2626;">Overdue Keys</h3>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${overdueKeys.map(key => `
            <p><strong>${key.name}</strong> (${key.keyId}) - Due: ${key.dueDate?.toLocaleDateString()}</p>
          `).join('')}
        </div>
      ` : ''}
      
      <p>For detailed logs, please login to the Key Management System.</p>
      <p>Best regards,<br>Key Management System</p>
    </div>
  `;
  
  return await sendEmail(hodEmail, subject, html);
};
