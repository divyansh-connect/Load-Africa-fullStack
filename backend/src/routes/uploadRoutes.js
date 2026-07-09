const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');

// Upload single or multiple files
// The field name from frontend will be 'file' or 'files'
router.post('/', upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        urls: fileUrls
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
