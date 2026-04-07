const express = require('express');
const db = require('../../config/database');
const upload = require('../config/upload');
const { requireAdminSession } = require('../auth/adminSession');
const { persistUploadedFile } = require('../services/fileStorageService');
const { safe } = require('../utils/common');

const router = express.Router();

const CUSTOM_PAGES_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS custom_pages (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL,
    layout_type VARCHAR(40) NOT NULL DEFAULT 'hero-left',
    banner_url VARCHAR(500) DEFAULT NULL,
    logo_url VARCHAR(500) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    sub_description TEXT DEFAULT NULL,
    product_ids JSON DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_custom_pages_slug (slug)
  )
`;

const VALID_LAYOUTS = new Set(['hero-left', 'hero-centered', 'hero-split']);

let customPagesTableReady = false;

const tableExists = async (tableName) => {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
    `,
    [tableName]
  );

  return Number(rows?.[0]?.total || 0) > 0;
};

const ensureCustomPagesTable = async () => {
  if (customPagesTableReady) {
    return;
  }

  const alreadyExists = await tableExists('custom_pages');

  if (!alreadyExists) {
    await db.query(CUSTOM_PAGES_TABLE_QUERY);
  }

  customPagesTableReady = true;
};

const slugify = (value = '') => (
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

const parseProductIds = (value) => {
  if (Array.isArray(value)) {
    return value.map(Number).filter((item) => Number.isInteger(item) && item > 0);
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.map(Number).filter((item) => Number.isInteger(item) && item > 0)
        : [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

const parseJsonField = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

const normalizeLayoutType = (value) => (
  VALID_LAYOUTS.has(value) ? value : 'hero-left'
);

const normalizeCustomPageRow = (row, products = []) => ({
  id: Number(row.id),
  title: row.title || '',
  slug: row.slug || '',
  layout_type: normalizeLayoutType(row.layout_type),
  banner_url: safe(row.banner_url),
  logo_url: safe(row.logo_url),
  description: row.description || '',
  sub_description: row.sub_description || '',
  product_ids: parseProductIds(row.product_ids),
  is_active: Number(row.is_active ?? 1) === 1,
  created_at: row.created_at,
  updated_at: row.updated_at,
  products
});

const listProductsByIds = async (productIds = []) => {
  const validIds = productIds.filter((item) => Number.isInteger(item) && item > 0);

  if (validIds.length === 0) {
    return [];
  }

  const [rows] = await db.query(
    `
      SELECT id, name, description, main_image, extra_data
      FROM products
      WHERE id IN (?)
    `,
    [validIds]
  );

  const productsById = new Map(rows.map((row) => [Number(row.id), row]));
  return validIds
    .map((id) => productsById.get(id))
    .filter(Boolean)
    .map((row) => ({
      id: Number(row.id),
      name: row.name || '',
      description: row.description || '',
      main_image: row.main_image || '',
      extra_data: row.extra_data || null
    }));
};

const buildPayload = async (row, { includeProducts = false } = {}) => {
  const productIds = parseJsonField(row.product_ids).map(Number).filter((item) => Number.isInteger(item) && item > 0);
  const products = includeProducts ? await listProductsByIds(productIds) : [];
  return normalizeCustomPageRow({ ...row, product_ids: productIds }, products);
};

const getWriteErrorMessage = (error, fallbackMessage) => {
  if (error?.code === 'ER_DUP_ENTRY') {
    return 'Ja existe uma pagina com este slug. Escolha outro endereco.';
  }

  return error?.message || fallbackMessage;
};

const isMissingCustomPagesTableError = (error) => (
  error?.code === 'ER_NO_SUCH_TABLE' || error?.code === 'ER_BAD_TABLE_ERROR'
);

const isSchemaPermissionError = (error) => (
  error?.code === 'ER_TABLEACCESS_DENIED_ERROR' ||
  error?.code === 'ER_DBACCESS_DENIED_ERROR' ||
  error?.code === 'ER_ACCESS_DENIED_ERROR'
);

router.get('/', requireAdminSession, async (req, res) => {
  try {
    await ensureCustomPagesTable();
    const [rows] = await db.query('SELECT * FROM custom_pages ORDER BY updated_at DESC, id DESC');
    const items = await Promise.all(rows.map((row) => buildPayload(row)));
    res.json(items);
  } catch (error) {
    console.error('Erro ao listar paginas personalizadas:', error);

    if (isMissingCustomPagesTableError(error) || isSchemaPermissionError(error)) {
      return res.json([]);
    }

    res.status(500).json({ error: 'Erro ao listar paginas personalizadas.' });
  }
});

router.get('/public/:slug', async (req, res) => {
  try {
    await ensureCustomPagesTable();

    const [rows] = await db.query(
      'SELECT * FROM custom_pages WHERE slug = ? AND is_active = 1 LIMIT 1',
      [req.params.slug]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Pagina nao encontrada.' });
    }

    const item = await buildPayload(rows[0], { includeProducts: true });
    return res.json(item);
  } catch (error) {
    console.error('Erro ao buscar pagina personalizada publica:', error);

    if (isMissingCustomPagesTableError(error) || isSchemaPermissionError(error)) {
      return res.status(404).json({ error: 'Pagina nao encontrada.' });
    }

    return res.status(500).json({ error: 'Erro ao buscar pagina personalizada.' });
  }
});

router.post('/', requireAdminSession, upload.any(), async (req, res) => {
  try {
    await ensureCustomPagesTable();

    const title = String(req.body.title || '').trim();
    const slug = slugify(req.body.slug || title);

    if (!title) {
      return res.status(400).json({ error: 'Informe o titulo da pagina.' });
    }

    if (!slug) {
      return res.status(400).json({ error: 'Informe um slug valido para a pagina.' });
    }

    const files = Array.isArray(req.files) ? req.files : [];
    const bannerFile = files.find((file) => file.fieldname === 'banner');
    const logoFile = files.find((file) => file.fieldname === 'logo');

    const bannerUrl = bannerFile ? await persistUploadedFile(bannerFile, { resourceType: 'custom-pages' }) : null;
    const logoUrl = logoFile ? await persistUploadedFile(logoFile, { resourceType: 'custom-pages' }) : null;
    const productIds = parseProductIds(req.body.product_ids);

    const [result] = await db.query(
      `
        INSERT INTO custom_pages (
          title, slug, layout_type, banner_url, logo_url, description, sub_description, product_ids, is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        slug,
        normalizeLayoutType(req.body.layout_type),
        safe(bannerUrl),
        safe(logoUrl),
        safe(String(req.body.description || '').trim()),
        safe(String(req.body.sub_description || '').trim()),
        JSON.stringify(productIds),
        req.body.is_active === 'false' ? 0 : 1
      ]
    );

    const [rows] = await db.query('SELECT * FROM custom_pages WHERE id = ? LIMIT 1', [result.insertId]);
    const item = await buildPayload(rows[0]);
    return res.status(201).json({ message: 'Pagina criada com sucesso.', item });
  } catch (error) {
    console.error('Erro ao criar pagina personalizada:', error);

    if (isMissingCustomPagesTableError(error) || isSchemaPermissionError(error)) {
      return res.status(503).json({
        error: 'A tabela de paginas personalizadas nao esta disponivel no banco de producao.'
      });
    }

    return res.status(error?.code === 'ER_DUP_ENTRY' ? 400 : 500).json({
      error: getWriteErrorMessage(error, 'Erro ao criar pagina personalizada.')
    });
  }
});

router.put('/:id', requireAdminSession, upload.any(), async (req, res) => {
  try {
    await ensureCustomPagesTable();

    const pageId = Number(req.params.id);
    if (!Number.isInteger(pageId) || pageId <= 0) {
      return res.status(400).json({ error: 'Pagina invalida.' });
    }

    const [rows] = await db.query('SELECT * FROM custom_pages WHERE id = ? LIMIT 1', [pageId]);
    if (!rows[0]) {
      return res.status(404).json({ error: 'Pagina nao encontrada.' });
    }

    const currentItem = rows[0];
    const title = String(req.body.title || currentItem.title || '').trim();
    const slug = slugify(req.body.slug || title || currentItem.slug);

    if (!title || !slug) {
      return res.status(400).json({ error: 'Titulo e slug sao obrigatorios.' });
    }

    const files = Array.isArray(req.files) ? req.files : [];
    const bannerFile = files.find((file) => file.fieldname === 'banner');
    const logoFile = files.find((file) => file.fieldname === 'logo');

    const bannerUrl = bannerFile
      ? await persistUploadedFile(bannerFile, { resourceType: 'custom-pages' })
      : safe(req.body.banner_url ?? currentItem.banner_url);
    const logoUrl = logoFile
      ? await persistUploadedFile(logoFile, { resourceType: 'custom-pages' })
      : safe(req.body.logo_url ?? currentItem.logo_url);
    const productIds = parseProductIds(req.body.product_ids ?? currentItem.product_ids);

    await db.query(
      `
        UPDATE custom_pages
        SET title = ?,
            slug = ?,
            layout_type = ?,
            banner_url = ?,
            logo_url = ?,
            description = ?,
            sub_description = ?,
            product_ids = ?,
            is_active = ?
        WHERE id = ?
      `,
      [
        title,
        slug,
        normalizeLayoutType(req.body.layout_type || currentItem.layout_type),
        bannerUrl,
        logoUrl,
        safe(String(req.body.description ?? currentItem.description ?? '').trim()),
        safe(String(req.body.sub_description ?? currentItem.sub_description ?? '').trim()),
        JSON.stringify(productIds),
        req.body.is_active === undefined
          ? Number(currentItem.is_active ?? 1)
          : (req.body.is_active === 'false' ? 0 : 1),
        pageId
      ]
    );

    const [updatedRows] = await db.query('SELECT * FROM custom_pages WHERE id = ? LIMIT 1', [pageId]);
    const item = await buildPayload(updatedRows[0]);
    return res.json({ message: 'Pagina atualizada com sucesso.', item });
  } catch (error) {
    console.error('Erro ao atualizar pagina personalizada:', error);

    if (isMissingCustomPagesTableError(error) || isSchemaPermissionError(error)) {
      return res.status(503).json({
        error: 'A tabela de paginas personalizadas nao esta disponivel no banco de producao.'
      });
    }

    return res.status(error?.code === 'ER_DUP_ENTRY' ? 400 : 500).json({
      error: getWriteErrorMessage(error, 'Erro ao atualizar pagina personalizada.')
    });
  }
});

router.delete('/:id', requireAdminSession, async (req, res) => {
  try {
    await ensureCustomPagesTable();

    const pageId = Number(req.params.id);
    if (!Number.isInteger(pageId) || pageId <= 0) {
      return res.status(400).json({ error: 'Pagina invalida.' });
    }

    const [result] = await db.query('DELETE FROM custom_pages WHERE id = ?', [pageId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pagina nao encontrada.' });
    }

    return res.json({ message: 'Pagina excluida com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir pagina personalizada:', error);

    if (isMissingCustomPagesTableError(error) || isSchemaPermissionError(error)) {
      return res.status(503).json({
        error: 'A tabela de paginas personalizadas nao esta disponivel no banco de producao.'
      });
    }

    return res.status(500).json({ error: 'Erro ao excluir pagina personalizada.' });
  }
});

module.exports = router;
