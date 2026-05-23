const mongoose = require('mongoose')
const { randomUUID } = require('crypto')

const generateComplaintId = () => `CMP-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`

const complaintSchema = new mongoose.Schema({

  complaintId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: generateComplaintId
  },

  complaintType: {
    type: String,
    required: [true, 'Complaint type is required'],
    enum: {
      values: ['pothole', 'streetlight', 'garbage', 'water', 'drainage', 'road', 'other'],
      message: '{VALUE} is not a valid complaint type'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  location: {
    latitude: {
      type: Number,
      required: false,  // Optional (user might not allow location)
      min: [-90, 'Invalid latitude'],
      max: [90, 'Invalid latitude']
    },
    longitude: {
      type: Number,
      required: false,
      min: [-180, 'Invalid longitude'],
      max: [180, 'Invalid longitude']
    },
    address: {
      type: String,
      trim: true
    }
  },

  image: {
    type: String,  // File path or URL
    required: [true, 'Image is required']
  },

  status: {
    type: String,
    enum: {
      values: ['Pending', 'In Progress', 'Resolved'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Pending'
  },

  priority: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'Medium'
  },

  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Anonymous submissions allowed
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  resolutionNotes: {
    type: String,
    maxlength: [500, 'Resolution notes cannot exceed 500 characters']
  },

  resolvedAt: {
    type: Date
  }

}, {
  timestamps: true  // Adds createdAt and updatedAt
})

complaintSchema.index({ status: 1, createdAt: -1 })         // Filter by status + newest first
complaintSchema.index({ complaintType: 1, createdAt: -1 })  // Filter by type + newest first
complaintSchema.index({ createdAt: -1 })                    // Global newest-first listing
complaintSchema.index({ priority: 1 })                      // Fast stats filter by priority
complaintSchema.index({ submittedBy: 1 }, { sparse: true }) // Fast user-based complaint lookups
complaintSchema.index({ assignedTo: 1 }, { sparse: true })  // Fast admin assignment lookups

complaintSchema.virtual('daysOpen').get(function() {
  if (this.status === 'Resolved' && this.resolvedAt) {
    return Math.floor((this.resolvedAt - this.createdAt) / (1000 * 60 * 60 * 24))
  }
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24))
})

complaintSchema.methods.resolve = function(notes) {
  this.status = 'Resolved'
  this.resolvedAt = new Date()
  this.resolutionNotes = notes
  return this.save()
}

complaintSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus
  if (newStatus === 'Resolved') {
    this.resolvedAt = new Date()
  }
  return this.save()
}

complaintSchema.statics.getPending = function() {
  return this.find({ status: 'Pending' }).sort({ createdAt: -1 })
}

complaintSchema.statics.getByType = function(type) {
  return this.find({ complaintType: type }).sort({ createdAt: -1 })
}

complaintSchema.statics.getStats = async function() {
  const total = await this.countDocuments()
  const pending = await this.countDocuments({ status: 'Pending' })
  const inProgress = await this.countDocuments({ status: 'In Progress' })
  const resolved = await this.countDocuments({ status: 'Resolved' })
  const high = await this.countDocuments({ priority: 'High' })

  return { total, pending, inProgress, resolved, high }
}

complaintSchema.pre('save', function(next) {
  if (!this.complaintId) {

    this.complaintId = generateComplaintId()
  }
  next()
})

module.exports = mongoose.model('Complaint', complaintSchema)