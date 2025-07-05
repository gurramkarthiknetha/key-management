interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface KeyAccessGrantedData {
  userName: string;
  keyName: string;
  keyId: string;
  location: string;
  dueDate: string;
  issuedBy: string;
  notes?: string;
}

interface OverdueAlertData {
  userName: string;
  userEmail: string;
  keyName: string;
  keyId: string;
  dueDate: string;
  daysOverdue: number;
  location: string;
}

interface DailyReportData {
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

export class EmailTemplates {
  static keyAccessGranted(data: KeyAccessGrantedData): EmailTemplate {
    const subject = `Key Access Granted - ${data.keyName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Key Access Granted</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .key-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .important { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Key Access Granted</h1>
          </div>
          <div class="content">
            <p>Dear ${data.userName},</p>
            <p>You have been granted access to the following key:</p>
            
            <div class="key-details">
              <h3>Key Details</h3>
              <p><strong>Key Name:</strong> ${data.keyName}</p>
              <p><strong>Key ID:</strong> ${data.keyId}</p>
              <p><strong>Location:</strong> ${data.location}</p>
              <p><strong>Issued By:</strong> ${data.issuedBy}</p>
              <p class="important"><strong>Due Date:</strong> ${data.dueDate}</p>
              ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
            </div>
            
            <p><strong>Important Reminders:</strong></p>
            <ul>
              <li>Please return the key by the due date to avoid late fees</li>
              <li>Report any damage or loss immediately</li>
              <li>Do not duplicate or share the key</li>
              <li>Contact security if you need an extension</li>
            </ul>
            
            <p>Thank you for your cooperation.</p>
          </div>
          <div class="footer">
            <p>Key Management System - Automated Message</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
Key Access Granted

Dear ${data.userName},

You have been granted access to the following key:

Key Details:
- Key Name: ${data.keyName}
- Key ID: ${data.keyId}
- Location: ${data.location}
- Issued By: ${data.issuedBy}
- Due Date: ${data.dueDate}
${data.notes ? `- Notes: ${data.notes}` : ''}

Important Reminders:
- Please return the key by the due date to avoid late fees
- Report any damage or loss immediately
- Do not duplicate or share the key
- Contact security if you need an extension

Thank you for your cooperation.

Key Management System - Automated Message
    `;
    
    return { subject, html, text };
  }

  static overdueAlert(data: OverdueAlertData): EmailTemplate {
    const subject = `URGENT: Overdue Key Return - ${data.keyName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Overdue Key Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #fef2f2; border: 2px solid #fecaca; }
          .key-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .urgent { color: #dc2626; font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ OVERDUE KEY ALERT</h1>
          </div>
          <div class="content">
            <p class="urgent">URGENT: Immediate Action Required</p>
            <p>Dear ${data.userName},</p>
            <p>The following key is <strong>${data.daysOverdue} day(s) overdue</strong> and must be returned immediately:</p>
            
            <div class="key-details">
              <h3>Overdue Key Details</h3>
              <p><strong>Key Name:</strong> ${data.keyName}</p>
              <p><strong>Key ID:</strong> ${data.keyId}</p>
              <p><strong>Original Due Date:</strong> ${data.dueDate}</p>
              <p><strong>Days Overdue:</strong> ${data.daysOverdue}</p>
              <p><strong>Current Location:</strong> ${data.location}</p>
            </div>
            
            <p><strong>Required Actions:</strong></p>
            <ul>
              <li>Return the key to the security desk immediately</li>
              <li>Contact security at [SECURITY_PHONE] if there are any issues</li>
              <li>Late fees may apply for overdue returns</li>
              <li>Failure to return may result in replacement charges</li>
            </ul>
            
            <p>Please treat this matter with urgency.</p>
          </div>
          <div class="footer">
            <p>Key Management System - Automated Alert</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
URGENT: OVERDUE KEY ALERT

Dear ${data.userName},

The following key is ${data.daysOverdue} day(s) overdue and must be returned immediately:

Overdue Key Details:
- Key Name: ${data.keyName}
- Key ID: ${data.keyId}
- Original Due Date: ${data.dueDate}
- Days Overdue: ${data.daysOverdue}
- Current Location: ${data.location}

Required Actions:
- Return the key to the security desk immediately
- Contact security if there are any issues
- Late fees may apply for overdue returns
- Failure to return may result in replacement charges

Please treat this matter with urgency.

Key Management System - Automated Alert
    `;
    
    return { subject, html, text };
  }

  static dailyReport(data: DailyReportData): EmailTemplate {
    const subject = `Daily Key Management Report - ${data.date}`;
    
    const recentActivityHtml = data.recentActivity
      .map(activity => `
        <tr>
          <td>${activity.action}</td>
          <td>${activity.keyName}</td>
          <td>${activity.userName}</td>
          <td>${activity.timestamp}</td>
        </tr>
      `).join('');
    
    const overdueListHtml = data.overdueList
      .map(item => `
        <tr>
          <td>${item.keyName}</td>
          <td>${item.userName}</td>
          <td style="color: #dc2626; font-weight: bold;">${item.daysOverdue} days</td>
        </tr>
      `).join('');
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Key Management Report</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-box { background: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; }
          .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Daily Key Management Report</h1>
            <p>${data.date}</p>
          </div>
          <div class="content">
            <div class="stats">
              <div class="stat-box">
                <div class="stat-number">${data.totalTransactions}</div>
                <div>Total Transactions</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${data.checkouts}</div>
                <div>Check-outs</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${data.checkins}</div>
                <div>Check-ins</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${data.overdueKeys}</div>
                <div>Overdue Keys</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${data.availableKeys}</div>
                <div>Available Keys</div>
              </div>
            </div>
            
            <h3>Recent Activity</h3>
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Key</th>
                  <th>User</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                ${recentActivityHtml}
              </tbody>
            </table>
            
            ${data.overdueList.length > 0 ? `
            <h3>Overdue Keys</h3>
            <table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>User</th>
                  <th>Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                ${overdueListHtml}
              </tbody>
            </table>
            ` : '<p>No overdue keys today.</p>'}
          </div>
          <div class="footer">
            <p>Key Management System - Daily Report</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
Daily Key Management Report - ${data.date}

Summary:
- Total Transactions: ${data.totalTransactions}
- Check-outs: ${data.checkouts}
- Check-ins: ${data.checkins}
- Overdue Keys: ${data.overdueKeys}
- Available Keys: ${data.availableKeys}

Recent Activity:
${data.recentActivity.map(activity => 
  `${activity.action} - ${activity.keyName} - ${activity.userName} - ${activity.timestamp}`
).join('\n')}

${data.overdueList.length > 0 ? `
Overdue Keys:
${data.overdueList.map(item => 
  `${item.keyName} - ${item.userName} - ${item.daysOverdue} days overdue`
).join('\n')}
` : 'No overdue keys today.'}

Key Management System - Daily Report
    `;
    
    return { subject, html, text };
  }
}
