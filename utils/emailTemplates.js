// ═══════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// HTML templates for different email types
// ═══════════════════════════════════════════════════════════

// Welcome email for new users
const welcomeEmail = (userName, userEmail) => ({
  subject: '🎉 Welcome to Civic Pulse!',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Welcome to Civic Pulse! 🏙️</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName}! 👋</h2>
          <p>Thank you for registering with <strong>Civic Pulse</strong> - your platform for civic engagement and community improvement.</p>
          <p><strong>Your account details:</strong></p>
          <ul>
            <li>Email: ${userEmail}</li>
            <li>Registration Date: ${new Date().toLocaleDateString()}</li>
          </ul>
          <p><strong>What you can do:</strong></p>
          <ul>
            <li>✅ Submit civic complaints with photos</li>
            <li>📍 Track issues with location</li>
            <li>🔔 Get real-time status updates</li>
            <li>📊 View community impact</li>
          </ul>
          <center>
            <a href="http://localhost:5173" class="button">Start Reporting Issues →</a>
          </center>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br><strong>The Civic Pulse Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2024 Civic Pulse. All rights reserved.</p>
          <p>Building better communities together.</p>
        </div>
      </div>
    </body>
    </html>
  `
})

// Complaint submission confirmation
const complaintConfirmationEmail = (userName, complaintId, complaintType) => ({
  subject: `✓ Complaint Registered - ${complaintId}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
        .complaint-id { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; font-size: 18px; font-weight: bold; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Complaint Registered ✓</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName || 'Citizen'}!</h2>
          <p>Your complaint has been successfully registered and is now being reviewed by our team.</p>
          <div class="complaint-id">📋 Complaint ID: ${complaintId}</div>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Type: ${complaintType.charAt(0).toUpperCase() + complaintType.slice(1)}</li>
            <li>Status: Pending Review</li>
            <li>Submitted: ${new Date().toLocaleString()}</li>
          </ul>
          <p>💡 <strong>Save your Complaint ID</strong> to track progress.</p>
          <center>
            <a href="http://localhost:5173/track" class="button">Track Your Complaint →</a>
          </center>
          <p>We'll notify you when there are updates on your complaint.</p>
          <p>Thank you for helping improve our community!</p>
          <p>Best regards,<br><strong>Civic Pulse Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `
})

// Password reset email
const passwordResetEmail = (userName, resetLink) => ({
  subject: 'Reset Your Civic Pulse Password',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName || 'Citizen'}!</h2>
          <p>We received a request to reset your Civic Pulse password.</p>
          <p>Click the button below to choose a new password:</p>
          <center>
            <a href="${resetLink}" class="button">Reset Password</a>
          </center>
          <p>If the button does not work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #eef2ff; padding: 12px; border-radius: 8px;">${resetLink}</p>
          <p>This link will expire in 15 minutes.</p>
          <p>If you did not request this, you can ignore this email safely.</p>
          <p>Best regards,<br><strong>The Civic Pulse Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2024 Civic Pulse. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
})

// Status update notification
const statusUpdateEmail = (userName, complaintId, oldStatus, newStatus) => ({
  subject: `🔄 Status Update - ${complaintId}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 6px; font-weight: bold; margin: 5px; }
        .pending { background: #fef3c7; color: #92400e; }
        .in-progress { background: #dbeafe; color: #1e40af; }
        .resolved { background: #d1fae5; color: #065f46; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Status Updated! 🔄</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName || 'Citizen'}!</h2>
          <p>Your complaint <strong>${complaintId}</strong> has been updated.</p>
          <p><strong>Status changed:</strong></p>
          <div style="text-align: center; margin: 20px 0;">
            <span class="status-badge ${oldStatus.toLowerCase().replace(' ', '-')}">${oldStatus}</span>
            <span style="font-size: 24px; margin: 0 10px;">→</span>
            <span class="status-badge ${newStatus.toLowerCase().replace(' ', '-')}">${newStatus}</span>
          </div>
          <p>Updated: ${new Date().toLocaleString()}</p>
          ${newStatus === 'Resolved'
            ? '<p style="background: #d1fae5; padding: 15px; border-radius: 8px; color: #065f46;"><strong>✓ Your complaint has been resolved!</strong> Thank you for your patience.</p>'
            : '<p>We\'re actively working on resolving this issue.</p>'
          }
          <center>
            <a href="http://localhost:5173/track" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">View Details →</a>
          </center>
          <p>Thank you for using Civic Pulse!</p>
        </div>
      </div>
    </body>
    </html>
  `
})

module.exports = {
  welcomeEmail,
  complaintConfirmationEmail,
  passwordResetEmail,
  statusUpdateEmail
}