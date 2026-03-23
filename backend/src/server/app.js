/**
 * Monta a aplicacao Express principal.
 * Registra middlewares globais, arquivos estaticos e todas as rotas da API.
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const corsMiddleware = require('./config/cors');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const productRoutes = require('./routes/productRoutes');
const specialSectionRoutes = require('./routes/specialSectionRoutes');

const createApp = () => {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(express.static(path.resolve(__dirname, '../../../frontend/dist')));

  app.use('/api/admin', adminAuthRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/banners', bannerRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api', specialSectionRoutes);

  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'O arquivo enviado excede o limite de 5 MB.' });
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
