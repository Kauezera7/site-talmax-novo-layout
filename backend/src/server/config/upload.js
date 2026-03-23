/**
 * Configura o upload de arquivos com Multer.
 * Define onde imagens sao salvas e como os arquivos recebem nome.
 */
const multer = require('multer');
const path = require('path');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../../../frontend/public/img'));
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    cb(null, `${Date.now()}-${sanitizedName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Somente imagens JPG, PNG, WEBP, GIF e SVG sao permitidas.'));
  }

  return cb(null, true);
};

module.exports = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 20
  },
  fileFilter
});
