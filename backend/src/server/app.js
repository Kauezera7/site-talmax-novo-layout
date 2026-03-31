/**
 * Monta a aplicacao Express principal.
 * Registra middlewares globais, arquivos estaticos e todas as rotas da API.
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const corsMiddleware = require('./config/cors');
const { getServedImageDirs } = require('./config/imageStorage');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const productRoutes = require('./routes/productRoutes');
const specialSectionRoutes = require('./routes/specialSectionRoutes');
const homeServiceRoutes = require('./routes/homeServiceRoutes');

const MAX_FILE_SIZE_MB = Number(process.env.UPLOAD_MAX_FILE_SIZE_MB || 15);

const createApp = () => {
  const app = express();
  const frontendDistPath = path.resolve(__dirname, '../../../frontend/dist');
  const imageDirectories = getServedImageDirs();

  app.use(corsMiddleware);
  app.use(express.json());
  imageDirectories.forEach((directoryPath) => {
    app.use('/img', express.static(directoryPath));
  });
  app.use('/img', (req, res) => {
    res.status(404).end();
  });
  app.use(express.static(frontendDistPath));

  app.use('/api/admin', adminAuthRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/banners', bannerRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/home-services', homeServiceRoutes);
  app.use('/api', specialSectionRoutes);

  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  });

  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: `O arquivo enviado excede o limite de ${MAX_FILE_SIZE_MB} MB.` });
      }

      return res.status(400).json({ error: err.message || 'Erro ao processar upload.' });
    }

    if (err) {
      return res.status(400).json({ error: err.message || 'Erro ao processar a requisicao.' });
    }

    return next();
  });

  return app;
};

module.exports = createApp;
