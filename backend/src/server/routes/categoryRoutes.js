/**
 * Define as rotas de categorias e subcategorias.
 * Cuida de listagem pública e operações administrativas de CRUD.
 */
const express = require('express');
const db = require('../../config/database');
const upload = require('../config/upload');
const { safe } = require('../utils/common');
const { requireAdminSession } = require('../auth/adminSession');
const { sendValidationError } = require('../validation/requestValidation');
const { validateCategoryWritePayload } = require('../validation/contentSchemas');
const { persistUploadedFile } = require('../services/fileStorageService');
const { listBackupCategories } = require('../services/backupContentService');
const { sanitizeServedImageUrl } = require('../config/imageStorage');

const router = express.Router();
let cachedCategorySchemaState = null;

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

const getCategorySchemaState = async () => {
  if (cachedCategorySchemaState) {
    return cachedCategorySchemaState;
  }

  const [categoryColumns, subCategoryColumns] = await Promise.all([
    getTableColumnSet('categorias'),
    getTableColumnSet('sub_categorias')
  ]);

  cachedCategorySchemaState = {
    categoryHasIconUrl: categoryColumns.has('icon_url'),
    categoryHasDisplayOrder: categoryColumns.has('display_order'),
    categoryHasIsVisible: categoryColumns.has('is_visible'),
    subCategoryHasDisplayOrder: subCategoryColumns.has('display_order'),
    subCategoryHasIsVisible: subCategoryColumns.has('is_visible')
  };

  return cachedCategorySchemaState;
};

const buildCategoryListQuery = (schemaState) => {
  const categoryIconSelect = schemaState.categoryHasIconUrl ? 'icon_url' : 'NULL AS icon_url';
  const categoryDisplayOrderSelect = schemaState.categoryHasDisplayOrder ? 'display_order' : '0 AS display_order';
  const categoryVisibleSelect = schemaState.categoryHasIsVisible ? 'is_visible' : '1 AS is_visible';
  const subCategoryDisplayOrderSelect = schemaState.subCategoryHasDisplayOrder ? 'display_order' : '0 AS display_order';
  const subCategoryVisibleSelect = schemaState.subCategoryHasIsVisible ? 'IFNULL(is_visible, 1)' : '1';

  return `
    SELECT id, name, slug, ${categoryIconSelect}, ${categoryDisplayOrderSelect}, ${categoryVisibleSelect}, NULL as parent_id
    FROM categorias
    UNION ALL
    SELECT id, name, slug, NULL as icon_url, ${subCategoryDisplayOrderSelect}, ${subCategoryVisibleSelect} as is_visible, category_id as parent_id
    FROM sub_categorias
    ORDER BY display_order, id
  `;
};

router.get('/', async (req, res) => {
  try {
    const schemaState = await getCategorySchemaState();
    const query = buildCategoryListQuery(schemaState);
    const [rows] = await db.query(query);
    res.json(rows.map((row) => ({
      ...row,
      icon_url: sanitizeServedImageUrl(row.icon_url)
    })));
  } catch (err) {
    if (shouldUseBackupFallback) {
      res.json(listBackupCategories().map((category) => ({
        ...category,
        icon_url: sanitizeServedImageUrl(category.icon_url)
      })));
      return;
    }

    console.error('Erro ao buscar categorias:', err);
    res.json([]);
  }
});

router.post('/', requireAdminSession, upload.single('icon'), async (req, res) => {
  try {
    const payload = validateCategoryWritePayload({
      name: req.body.name,
      slug: req.body.slug,
      is_visible: req.body.is_visible,
      parent_id: req.body.parent_id === 'null' || req.body.parent_id === '' ? undefined : req.body.parent_id
    });
    const icon_url = req.file
      ? await persistUploadedFile(req.file, { resourceType: 'categorias' })
      : null;
    const visible = payload.is_visible === false ? 0 : 1;

    if (payload.parent_id) {
      await db.query(
        'INSERT INTO sub_categorias (category_id, name, slug, display_order) VALUES (?, ?, ?, ?)',
        [payload.parent_id, safe(payload.name) || '', safe(payload.slug) || '', 0]
      );
      return res.status(201).json({ message: 'Subcategoria criada!' });
    }

    await db.query(
      'INSERT INTO categorias (name, slug, icon_url, display_order, is_visible) VALUES (?, ?, ?, ?, ?)',
      [safe(payload.name) || '', safe(payload.slug) || '', safe(icon_url), 0, visible]
    );
    return res.status(201).json({ message: 'Categoria criada!' });
  } catch (err) {
    if (sendValidationError(res, err)) {
      return res;
    }
    return res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAdminSession, upload.single('icon'), async (req, res) => {
  try {
    const payload = validateCategoryWritePayload({
      name: req.body.name,
      slug: req.body.slug,
      is_visible: req.body.is_visible,
      parent_id: req.body.parent_id === 'null' || req.body.parent_id === '' ? undefined : req.body.parent_id
    });
    const visible = payload.is_visible === false ? 0 : 1;
    const { id } = req.params;

    if (payload.parent_id) {
      await db.query(
        'UPDATE sub_categorias SET name = ?, slug = ?, category_id = ?, is_visible = ? WHERE id = ?',
        [safe(payload.name) || '', safe(payload.slug) || '', payload.parent_id, visible, id]
      );
      return res.json({ message: 'Subcategoria atualizada!' });
    }

    let query = 'UPDATE categorias SET name = ?, slug = ?, is_visible = ?';
    const params = [safe(payload.name) || '', safe(payload.slug) || '', visible];

    if (req.file) {
      query += ', icon_url = ?';
      params.push(await persistUploadedFile(req.file, { resourceType: 'categorias' }));
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params.map(safe));
    return res.json({ message: 'Categoria atualizada!' });
  } catch (err) {
    if (sendValidationError(res, err)) {
      return res;
    }
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAdminSession, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM sub_categorias WHERE id = ?', [id]);
    await db.query('DELETE FROM categorias WHERE id = ?', [id]);

    return res.json({ message: 'Categoria/Subcategoria excluida com sucesso!' });
  } catch (err) {
    console.error('ERRO AO EXCLUIR CATEGORIA:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
