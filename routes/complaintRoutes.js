const express = require('express')
const {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint
} = require('../controllers/complaintController')
const { protect, adminOnly } = require('../middleware/auth')
const upload = require('../middleware/upload')  // ← ADD THIS

const router = express.Router()

router.post('/', protect, upload.single('image'), createComplaint)

router.get('/mine', protect, getMyComplaints)

router.get('/', getAllComplaints)

router.get('/:id', getComplaintById)

router.put('/:id', protect, adminOnly, updateComplaint)
router.delete('/:id', protect, adminOnly, deleteComplaint)

module.exports = router