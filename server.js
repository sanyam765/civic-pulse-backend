const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require('./routes/authRoutes')
const complaintRoutes = require('./routes/complaintRoutes')

const app = express();

// Security: Set NODE_ENV
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// CORS - Allow Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',  // Local development
  'http://localhost:3000',  // Alternative local
  'https://civic-pulse-frontend-ashen.vercel.app',  // Production frontend
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log("✅ MongoDB Connected")
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message)
  });

app.use('/api/auth', authRoutes)
app.use('/api/complaints', complaintRoutes)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Global Error Handler (MUST be last)
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err)
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Server error occurred' 
      : err.message
  })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Server running on port ${PORT}`);
  }
});