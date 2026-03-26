const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const SftpClient = require('ssh2-sftp-client');

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

  console.log(`[Storage] Configurando Cloudinary para upload: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  
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

  console.log(`[Storage] Enviando arquivo para Cloudinary: ${file.path}`);
  const result = await cloudinary.uploader.upload(file.path, uploadOptions);
  
  if (!result || (!result.secure_url && !result.url)) {
    throw new Error('Falha total no upload para Cloudinary: Nenhum link retornado.');
  }

  const finalUrl = result.secure_url || result.url;
  console.log(`[Storage] Upload Cloudinary finalizado com SUCESSO: ${finalUrl}`);
  return finalUrl;
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
    console.warn(`[Storage] Nao foi possivel apagar arquivo temporario: ${err.message}`);
  });
};

const persistUploadedFile = async (file, options = {}) => {
  if (!file) return null;

  const useCloudinary = hasCloudinaryConfig();
  const useSftp = hasSftpConfig();

  console.log(`\n--- INICIO DE PERSISTENCIA DE ARQUIVO: ${file.filename} ---`);
  console.log(`[Storage] Analisando configuracoes disponíveis...`);
  console.log(`[Storage] Cloudinary? ${useCloudinary ? 'SIM' : 'NAO'}`);
  console.log(`[Storage] SFTP? ${useSftp ? 'SIM' : 'NAO'}`);

  if (useCloudinary) {
    try {
      const publicUrl = await uploadFileToCloudinary(file, options);
      cleanupLocalTempFile(file);
      return publicUrl;
    } catch (error) {
      console.error(`[Storage] ERRO FATAL AO UPAR NO CLOUDINARY: ${error.message}`);
      // Se era pra ser Cloudinary e deu erro, não salvamos local pra evitar bagunça no banco
      throw error; 
    }
  }

  if (useSftp) {
    try {
      const publicUrl = await uploadFileToSftp(file);
      cleanupLocalTempFile(file);
      return publicUrl;
    } catch (error) {
      console.error(`[Storage] ERRO FATAL AO UPAR NO SFTP: ${error.message}`);
      throw error;
    }
  }

  // Se nada foi configurado, salvamos local
  const localUrl = buildLocalImageUrl(file);
  console.log(`[Storage] Usando armazenamento LOCAL como fallback (caminho: ${localUrl})`);
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
  persistUploadedFiles,
  persistUploadedFilesByType
};
