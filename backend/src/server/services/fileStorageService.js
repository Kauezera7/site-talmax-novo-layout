const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const SftpClient = require('ssh2-sftp-client');

// As variaveis de ambiente ja sao carregadas pelo server.js (entry point)

const hasCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return Boolean(cloudName && apiKey && apiSecret);
};

const hasSftpConfig = () => {
  return (
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
  console.log(`[Cloudinary] Configuring with cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  const uploadOptions = {
    resource_type: 'image',
    folder: process.env.CLOUDINARY_FOLDER || 'talmax',
    use_filename: true,
    unique_filename: true
  };

  console.log(`[Cloudinary] Attempting upload of ${file.path}...`);
  const result = await cloudinary.uploader.upload(file.path, uploadOptions);
  
  if (!result.secure_url && !result.url) {
    throw new Error('Cloudinary upload returned no URL');
  }

  return result.secure_url || result.url;
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

  // Debug: Show which storage method will be used
  const hasCloudinary = hasCloudinaryConfig();
  const hasSftp = hasSftpConfig();
  console.log(`\n🔍 Storage Decision for ${file.filename}:`);
  console.log(`   Has Cloudinary Config: ${hasCloudinary}`);
  console.log(`   Has SFTP Config: ${hasSftp}`);

  if (hasCloudinary) {
    console.log(`📤 [Cloudinary] Uploading ${file.filename}...`);
    const publicUrl = await uploadFileToCloudinary(file);
    cleanupLocalTempFile(file);
    console.log(`✅ [Cloudinary] Success: ${publicUrl}`);
    return publicUrl;
  }

  if (hasSftp) {
    console.log(`📤 [SFTP] Uploading ${file.filename}...`);
    const publicUrl = await uploadFileToSftp(file);
    cleanupLocalTempFile(file);
    console.log(`✅ [SFTP] Success: ${publicUrl}`);
    return publicUrl;
  }

  // Use local storage only if no remote storage is configured
  const localUrl = buildLocalImageUrl(file);
  console.log(`📁 [Local Storage] ${file.filename} → ${localUrl}`);
  return localUrl;
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
