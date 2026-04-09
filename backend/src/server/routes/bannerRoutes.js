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
let cachedBannerSchemaState = null;

const shouldUseBackupFallback = process.env.NODE_ENV !== 'production';

const getTableColumnSet = async (tableName) => {
  const [rows] = await db.query(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
    `,
    [tableName]
  );

  return new Set(rows.map((row) => row.COLUMN_NAME));
};

const getBannerSchemaState = async () => {
  if (cachedBannerSchemaState) {
    return cachedBannerSchemaState;
  }

  const columns = await getTableColumnSet('banners');

  cachedBannerSchemaState = {
    hasTitle: columns.has('title'),
    hasSubtitle: columns.has('subtitle'),
    hasLinkUrl: columns.has('link_url'),
    hasDisplayOrder: columns.has('display_order'),
    hasActive: columns.has('active')
  };

  return cachedBannerSchemaState;
};

const buildBannerListQuery = (schemaState) => {
  const titleSelect = schemaState.hasTitle ? 'title' : 'NULL AS title';
  const subtitleSelect = schemaState.hasSubtitle ? 'subtitle' : 'NULL AS subtitle';
  const linkUrlSelect = schemaState.hasLinkUrl ? 'link_url' : 'NULL AS link_url';
  const displayOrderSelect = schemaState.hasDisplayOrder ? 'display_order' : '0 AS display_order';
  const activeSelect = schemaState.hasActive ? 'active' : '1 AS active';
  const orderByClause = schemaState.hasDisplayOrder ? 'ORDER BY display_order ASC, id ASC' : 'ORDER BY id ASC';

  return `
    SELECT
      id,
      ${titleSelect},
      ${subtitleSelect},
      image_url,
      ${linkUrlSelect},
      ${displayOrderSelect},
      ${activeSelect}
    FROM banners
    ${orderByClause}
  `;
};

router.get('/', async (req, res) => {
  try {
    const schemaState = await getBannerSchemaState();
    const [rows] = await db.query(buildBannerListQuery(schemaState));
    res.json(rows);
  } catch (err) {
    if (shouldUseBackupFallback) {
      res.json(listBackupBanners());
      return;
    }

    console.error('Erro ao buscar banners:', err);
    res.json([]);
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
