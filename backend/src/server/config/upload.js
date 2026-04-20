/**
 * Configura o upload de arquivos com Multer.
 * Define onde imagens sao salvas e como os arquivos recebem nome.
 */
const multer = require('multer');
const crypto = require('crypto');
const { ensureUploadTempDir } = require('./imageStorage');
const { assertAllowedUploadImageCandidate } = require('../utils/uploadedImageValidation');

const MAX_FILE_SIZE_MB = Number(process.env.UPLOAD_MAX_FILE_SIZE_MB || 15);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ensureUploadTempDir());
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    const uniqueSuffix = crypto.randomBytes(6).toString('hex');
    cb(null, `${Date.now()}-${uniqueSuffix}-${sanitizedName}`);
  }
});

const fileFilter = (req, file, cb) => {
  try {
    assertAllowedUploadImageCandidate(file);
  } catch (error) {
    return cb(error);
  }

  return cb(null, true);
};

module.exports = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 20
  },
  fileFilter
});
