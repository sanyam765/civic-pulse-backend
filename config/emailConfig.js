

const nodemailer = require('nodemailer')

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,    
    pass: process.env.EMAIL_PASSWORD  
  }
})

// Verify connection
if (process.env.NODE_ENV !== 'production') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email service error:', error.message)
    } else {
      console.log('✅ Email service ready')
    }
  })
}

module.exports = transporter