

const transporter = require('../config/emailConfig')
const { welcomeEmail, complaintConfirmationEmail, passwordResetEmail, statusUpdateEmail } = require('../utils/emailTemplates')

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName, replyTo) => {
  try {
    const template = welcomeEmail(userName, userEmail)
    const mailOptions = {
      from: `"Civic Pulse" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html
    }

    if (replyTo) {
      mailOptions.replyTo = replyTo
    }
    
    await transporter.sendMail(mailOptions)
    
    console.log(`✅ Welcome email sent to ${userEmail}`)
    return { success: true }
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    return { success: false, error: error.message }
  }
}


const sendComplaintConfirmation = async (userEmail, userName, complaintId, complaintType, replyTo) => {
  try {
    const template = complaintConfirmationEmail(userName, complaintId, complaintType)
    const mailOptions = {
      from: `"Civic Pulse" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html
    }



    if (replyTo) {
      mailOptions.replyTo = replyTo
    }
    
    await transporter.sendMail(mailOptions)
    
    console.log(`✅ Complaint confirmation sent to ${userEmail}`)
    return { success: true }
    
  } catch (error) {
    console.error('❌ Error sending complaint confirmation:', error)
    return { success: false, error: error.message }
  }
}

const sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
  try {
    const template = passwordResetEmail(userName, resetLink)

    await transporter.sendMail({
      from: `"Civic Pulse" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html
    })

    console.log(`✅ Password reset email sent to ${userEmail}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    return { success: false, error: error.message }
  }
}

const sendStatusUpdate = async (userEmail, userName, complaintId, oldStatus, newStatus, replyTo) => {
  try {
    const template = statusUpdateEmail(userName, complaintId, oldStatus, newStatus)
    const mailOptions = {
      from: `"Civic Pulse" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html
    }

    if (replyTo) {
      mailOptions.replyTo = replyTo
    }
    
    await transporter.sendMail(mailOptions)
    
    console.log(`✅ Status update sent to ${userEmail}`)
    return { success: true }
    
  } catch (error) {
    console.error('❌ Error sending status update:', error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  sendWelcomeEmail,
  sendComplaintConfirmation,
  sendPasswordResetEmail,
  sendStatusUpdate
}