const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const SftpClient = require('ssh2-sftp-client');
const logger = require('../utils/logger');

// As variaveis de ambiente sao carregadas pelo server.js no topo.

const hasCloudinaryConfig = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  return !!(name && key && secret);
};

const hasSftpConfig = () => {
  return !!(
    process.env.SFTP_HOST &&
    process.env.SFTP_USER &&
    process.env.SFTP_PASSWORD &&
    process.env.SFTP_REMOTE_DIR &&
    process.env.SFTP_PUBLIC_BASE_URL
  );
};

const buildLocalImageUrl = (file) => `/img/${file.filename}`;

const buildRemoteImageUrl = (fileName) => {
  const publicBaseUrl = (process.env.SFTP_PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  return `${publicBaseUrl}/${encodeURIComponent(fileName)}`;
};

const buildCloudinaryFolder = (resourceType = 'geral') => {
  const baseFolder = (process.env.CLOUDINARY_FOLDER || 'talmax').replace(/^\/+|\/+$/g, '');
  const normalizedResourceType = String(resourceType || 'geral').replace(/^\/+|\/+$/g, '');

  return normalizedResourceType ? `${baseFolder}/${normalizedResourceType}` : baseFolder;
};

const uploadFileToCloudinary = async (file, options = {}) => {
  const folder = buildCloudinaryFolder(options.resourceType);

  logger.debug({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    folder,
    fileName: file.filename
  }, 'Configurando Cloudinary para upload.');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  const uploadOptions = {
    resource_type: 'image',
    folder,
    use_filename: true,
    unique_filename: true
  };

  logger.info({
    fileName: file.filename,
    filePath: file.path,
    folder
  }, 'Enviando arquivo para Cloudinary.');

  const result = await cloudinary.uploader.upload(file.path, uploadOptions);

  if (!result || (!result.secure_url && !result.url)) {
    throw new Error('Falha total no upload para Cloudinary: nenhum link retornado.');
  }

  const finalUrl = result.secure_url || result.url;
  logger.info({
    fileName: file.filename,
    finalUrl
  }, 'Upload Cloudinary finalizado com sucesso.');
  return finalUrl;
};

const persistExistingLocalFile = async (filePath, options = {}) => {
  if (!filePath) return null;

  const useCloudinary = hasCloudinaryConfig();
  const useSftp = hasSftpConfig();
  const normalizedPath = path.resolve(filePath);
  const fileName = path.basename(normalizedPath);
  const file = {
    path: normalizedPath,
    filename: fileName,
    originalname: fileName
  };

  if (useCloudinary) {
    return uploadFileToCloudinary(file, options);
  }

  if (useSftp) {
    return uploadFileToSftp(file);
  }

  return buildLocalImageUrl(file);
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
  if (!file || !file.path) return;

  fs.promises.unlink(file.path).catch((err) => {
    logger.warn({
      err,
      fileName: file.filename,
      filePath: file.path
    }, 'Nao foi possivel apagar arquivo temporario.');
  });
};

const persistUploadedFile = async (file, options = {}) => {
  if (!file) return null;

  const useCloudinary = hasCloudinaryConfig();
  const useSftp = hasSftpConfig();

  logger.debug({
    fileName: file.filename,
    filePath: file.path,
    useCloudinary,
    useSftp,
    resourceType: options.resourceType || 'geral'
  }, 'Iniciando persistencia de arquivo.');

  if (useCloudinary) {
    try {
      const publicUrl = await uploadFileToCloudinary(file, options);
      cleanupLocalTempFile(file);
      return publicUrl;
    } catch (error) {
      logger.error({
        err: error,
        fileName: file.filename,
        filePath: file.path,
        resourceType: options.resourceType || 'geral'
      }, 'Falha fatal ao subir arquivo no Cloudinary.');
      throw error;
    }
  }

  if (useSftp) {
    try {
      const publicUrl = await uploadFileToSftp(file);
      cleanupLocalTempFile(file);
      return publicUrl;
    } catch (error) {
      logger.error({
        err: error,
        fileName: file.filename,
        filePath: file.path,
        resourceType: options.resourceType || 'geral'
      }, 'Falha fatal ao subir arquivo no SFTP.');
      throw error;
    }
  }

  const localUrl = buildLocalImageUrl(file);
  logger.info({
    fileName: file.filename,
    localUrl
  }, 'Usando armazenamento local como fallback.');
  return localUrl;
};

const persistUploadedFiles = async (files = []) => {
  return Promise.all(files.map((file) => persistUploadedFile(file)));
};

const persistUploadedFilesByType = async (files = [], options = {}) => {
  return Promise.all(files.map((file) => persistUploadedFile(file, options)));
};

module.exports = {
  hasCloudinaryConfig,
  hasSftpConfig,
  buildCloudinaryFolder,
  persistUploadedFile,
  persistExistingLocalFile,
  persistUploadedFiles,
  persistUploadedFilesByType
};
