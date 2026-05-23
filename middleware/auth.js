const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    let token

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {

      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login.'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.'
      })
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated.'
      })
    }

    next()

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Auth middleware error:', error.message)
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      })
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message
    })
  }
}

const adminOnly = (req, res, next) => {

  if (req.user && req.user.role === 'admin') {
    next()  // User is admin, allow access
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    })
  }
}

module.exports = { protect, adminOnly }