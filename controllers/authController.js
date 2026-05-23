const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService')

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

const register = async (req, res) => {
  try {
    const { name, email, password, role, department, replyTo } = req.body
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      })
    }
    
   // Validate password strength - match frontend rules
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
if (!passwordRegex.test(password)) {
  return res.status(400).json({
    success: false,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  })
}
    
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      })
    }
    
    if (role === 'admin' && !department) {
      return res.status(400).json({
        success: false,
        message: 'Department required for admin'
      })
    }
    
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'citizen',
      department: department || undefined
    })
    
    const token = generateToken(user._id)

    sendWelcomeEmail(email, name, replyTo || email).catch(err => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Welcome email failed:', err.message)
      }
    })
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        token
      }
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
}

// ───────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    // STEP 1: Extract credentials
    const { email, password } = req.body
    
    // STEP 2: Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }
   
    const user = await User.findOne({ email }).select('+password')
    
  
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }
    

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      })
    }
    
   
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }
    
 
    const token = generateToken(user._id)
    
    // STEP 7: Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        token
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    })
  }
}


const getMe = async (req, res) => {
  try {
   
    
    const user = await User.findById(req.user.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          createdAt: user.createdAt
        }
      }
    })
    
  } catch (error) {
    console.error('Get me error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a reset link has been sent.'
      })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    user.resetPasswordToken = resetPasswordToken
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000
    await user.save({ validateBeforeSave: false })

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`    

    sendPasswordResetEmail(user.email, user.name, resetLink).catch(err => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Password reset email failed:', err.message)
      }
    })

    res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password, confirmPassword } = req.body

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide and confirm your new password'
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      })
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpire +password')

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is invalid or has expired'
      })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
}

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
}