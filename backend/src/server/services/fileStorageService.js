const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');
const SftpClient = require('ssh2-sftp-client');

const hasCloudinaryConfig = () => {
  // Usa Cloudinary apenas em produção
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction && (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME)
    && Boolean(process.env.CLOUDINARY_API_KEY)
    && Boolean(process.env.CLOUDINARY_API_SECRET)
  );
};

const hasSftpConfig = () => {
  // Usa SFTP apenas em produção
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction && (
    Boolean(process.env.SFTP_HOST)
    && Boolean(process.env.SFTP_USER)
    && Boolean(process.env.SFTP_REMOTE_DIR)
    && Boolean(process.env.SFTP_PUBLIC_BASE_URL)
  );
};

const buildLocalImageUrl = (file) => `/img/${file.filename}`;

const buildRemoteImageUrl = (fileName) => {
  const publicBaseUrl = (process.env.SFTP_PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  return `${publicBaseUrl}/${encodeURIComponent(fileName)}`;
};

const uploadFileToCloudinary = async (file) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    const uploadOptions = {
      resource_type: 'image'
    };

    if (process.env.CLOUDINARY_FOLDER) {
      uploadOptions.folder = process.env.CLOUDINARY_FOLDER;
    }

    const result = await cloudinary.uploader.upload(file.path, uploadOptions);
    console.log(`✓ Cloudinary upload success: ${file.filename}`);
    return result.secure_url || result.url;
  } catch (error) {
    console.error(`✗ Cloudinary upload failed for ${file.filename}:`, error.message);
    console.log(`→ Falling back to local storage...`);
    // Retorna URL local em caso de falha no Cloudinary
    return buildLocalImageUrl(file);
  }
};

const uploadFileToSftp = async (file) => {
  const sftp = new SftpClient();
  const remoteDir = process.env.SFTP_REMOTE_DIR.replace(/\\/g, '/').replace(/\/+$/, '');
  const remoteFilePath = `${remoteDir}/${file.filename}`;

  try {
    await sftp.connect({
      host: process.env.SFTP_HOST,
      port: Number(process.env.SFTP_PORT || 22),
      username: process.env.SFTP_USER,
      password: process.env.SFTP_PASSWORD
    });

    await sftp.mkdir(remoteDir, true).catch(() => {});
    await sftp.put(file.path, remoteFilePath);

    return buildRemoteImageUrl(file.filename);
  } finally {
    await sftp.end().catch(() => {});
  }
};

const cleanupLocalTempFile = (file) => {
  if (!file?.path) {
    return;
  }

  fs.promises.unlink(file.path).catch(() => {});
};

const persistUploadedFile = async (file) => {
  if (!file) {
    return null;
  }

  if (hasCloudinaryConfig()) {
    try {
      const publicUrl = await uploadFileToCloudinary(file);
      cleanupLocalTempFile(file);
      return publicUrl;
    } catch (error) {
      console.warn(`Cloudinary failed, trying SFTP...`);
      // Try SFTP fallback if Cloudinary fails
      if (hasSftpConfig()) {
        try {
          const publicUrl = await uploadFileToSftp(file);
          cleanupLocalTempFile(file);
          return publicUrl;
        } catch (sftpError) {
          console.warn(`SFTP failed, using local storage...`);
          return buildLocalImageUrl(file);
        }
      }
      // Use local storage as final fallback
      return buildLocalImageUrl(file);
    }
  }

  if (!hasSftpConfig()) {
    return buildLocalImageUrl(file);
  }

  const publicUrl = await uploadFileToSftp(file);
  cleanupLocalTempFile(file);
  return publicUrl;
};

const persistUploadedFiles = async (files = []) => Promise.all(
  files.map((file) => persistUploadedFile(file))
);

module.exports = {
  hasCloudinaryConfig,
  hasSftpConfig,
  persistUploadedFile,
  persistUploadedFiles
};
