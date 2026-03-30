/**
 * Define as rotas de banners do site.
 * Cuida da leitura pública e da manutenção protegida pelo admin.
 */
const express = require('express');
const db = require('../../config/database');
const upload = require('../config/upload');
const { safe } = require('../utils/common');
const { requireAdminSession } = require('../auth/adminSession');
const { parseBooleanFlag, parseInteger } = require('../utils/requestParsers');
const { persistUploadedFile } = require('../services/fileStorageService');
const { listBackupBanners } = require('../services/backupContentService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners ORDER BY display_order ASC');
    res.json(rows);
  } catch (err) {
    try {
      res.json(listBackupBanners());
    } catch (backupError) {
      res.status(500).json({ error: err.message });
    }
  }
});

router.post('/', requireAdminSession, upload.single('image'), async (req, res) => {
  try {
    const { title, link_url, display_order, active } = req.body;
    const image_url = req.file
      ? await persistUploadedFile(req.file, { resourceType: 'banners' })
      : null;

    if (!image_url) {
      return res.status(400).json({ error: 'A imagem do banner é obrigatória.' });
    }

    const isActive = parseBooleanFlag(active) ? 1 : 0;
    const order = parseInteger(display_order, 0);

    await db.query(
      'INSERT INTO banners (image_url, title, link_url, display_order, active) VALUES (?, ?, ?, ?, ?)',
      [image_url, safe(title), safe(link_url), order, isActive]
    );
    return res.status(201).json({ message: 'Banner criado!' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAdminSession, upload.single('image'), async (req, res) => {
  try {
    const { title, link_url, display_order, active } = req.body;
    const { id } = req.params;
    const isActive = parseBooleanFlag(active) ? 1 : 0;
    const order = parseInteger(display_order, 0);

    let query = 'UPDATE banners SET title = ?, link_url = ?, display_order = ?, active = ?';
    const params = [safe(title), safe(link_url), order, isActive];

    if (req.file) {
      query += ', image_url = ?';
      params.push(await persistUploadedFile(req.file, { resourceType: 'banners' }));
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params);
    return res.json({ message: 'Banner atualizado!' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAdminSession, async (req, res) => {
  try {
    await db.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Banner excluído!' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
