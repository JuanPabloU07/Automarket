const multer = require('multer');

const uploads = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024, 
  },

  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      return cb(new Error('Only .csv files are allowed'));
    }
    cb(null, true);
  },
});

module.exports = uploads;