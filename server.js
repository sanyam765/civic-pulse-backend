const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require('./routes/authRoutes')
const complaintRoutes = require('./routes/complaintRoutes')

const app = express();


app.use(cors({
    origin: "https://civic-pulse-frontend-ashen.vercel.app",
    credentials:true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/complaints', complaintRoutes)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' })
})

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message 
  })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
});