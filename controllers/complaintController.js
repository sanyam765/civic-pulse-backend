const Complaint = require('../models/Complaint')
const { sendComplaintConfirmation } = require('../services/emailService')  // ADD THIS

const createComplaint = async (req, res) => {
  try {
    const { complaintType, description, location, replyTo } = req.body
    
    if (!complaintType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type and description'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      })
    }

    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const complaintId = `CMP-${timestamp}${random}`

    const complaintData = {
      complaintId,
      complaintType,
      description,
      image: req.file.path.replace(/\\/g, '/'),
      status: 'Pending',
      priority: 'Medium'
    }

    if (location) {
      try {
        const locationData = typeof location === 'string' ? JSON.parse(location) : location
        if (locationData.latitude && locationData.longitude) {
          complaintData.location = {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            address: locationData.address || 'Unknown'
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Location parse error:', error.message)
        }
      }
    }

    if (req.user) {
      complaintData.submittedBy = req.user.id
    }

    const complaint = await Complaint.create(complaintData)

    // SEND CONFIRMATION EMAIL (ADD THIS)
    if (req.user && req.user.email) {
      sendComplaintConfirmation(
        req.user.email,
        req.user.name,
        complaintId,
        complaintType,
        replyTo || req.user.email
      ).catch(err => console.log('Email failed:', err))
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: { complaint }
    })
    
  } catch (error) {
    console.error('Create complaint error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
}

const getAllComplaints = async (req, res) => {
  try {
    // STEP 1: Get all complaints from database
    // Sort by newest first
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email department')

    // STEP 2: Send response
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: {
        complaints
      }
    })

  } catch (error) {
    console.error('Get complaints error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching complaints',
      error: error.message
    })
  }
}

const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ submittedBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email department')

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: {
        complaints
      }
    })
  } catch (error) {
    console.error('Get my complaints error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your complaints',
      error: error.message
    })
  }
}

const getComplaintById = async (req, res) => {
  try {
    
    const { id } = req.params
    
    const complaint = await Complaint.findOne({ complaintId: id })
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email department')

   
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      })
    }

    res.status(200).json({
      success: true,
      data: {
        complaint
      }
    })

  } catch (error) {
    console.error('Get complaint error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching complaint',
      error: error.message
    })
  }
}


const updateComplaint = async (req, res) => {
  try {

    const { id } = req.params


    const { status, priority, assignedTo, resolutionNotes, replyTo } = req.body

  
    const complaint = await Complaint.findOne({ complaintId: id })

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      })
    }

    if (status) complaint.status = status
    if (priority) complaint.priority = priority
    if (assignedTo) complaint.assignedTo = assignedTo
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes

    // STEP 5: If status is "Resolved", set resolvedAt
    if (status === 'Resolved') {
      complaint.resolvedAt = new Date()
    }

  
    await complaint.save()

  
    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: {
        complaint
      }
    })

  } catch (error) {
    console.error('Update complaint error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating complaint',
      error: error.message
    })
  }
}

const deleteComplaint = async (req, res) => {
  try {
    // STEP 1: Get complaint ID
    const { id } = req.params

    // STEP 2: Find and delete complaint
    const complaint = await Complaint.findOneAndDelete({ complaintId: id })

    // STEP 3: Check if complaint existed
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      })
    }

    // STEP 4: Send response
    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
      data: {
        deletedComplaint: complaint
      }
    })

  } catch (error) {
    console.error('Delete complaint error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting complaint',
      error: error.message
    })
  }
}

module.exports = {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint
}