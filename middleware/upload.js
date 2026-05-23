const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, 'uploads/')  // Save to uploads folder
  },

  filename: function (req, file, cb) {

    const uniqueSuffix = Date.now() + '-' + Math.floor(Math.random() * 1000)
    const ext = path.extname(file.originalname)  // Get file extension (.jpg, .png)
    cb(null, uniqueSuffix + ext)
  }
})

const fileFilter = (req, file, cb) => {

  const allowedTypes = /jpeg|jpg|png|gif|webp/

  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())

  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {

    cb(null, true)
  } else {

    cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WEBP)'))
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB max file size
  },
  fileFilter: fileFilter
})

module.exports = upload