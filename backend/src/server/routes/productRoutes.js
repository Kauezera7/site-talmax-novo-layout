/**
 * Define as rotas de produtos.
 * Aqui ficam a consulta publica e o CRUD administrativo com upload e transacoes.
 */
const express = require('express');
const db = require('../../config/database');
const upload = require('../config/upload');
const { safe } = require('../utils/common');
const { requireAdminSession } = require('../auth/adminSession');
const {
  parseInteger,
  parseBooleanFlag
} = require('../utils/requestParsers');
const { sendValidationError } = require('../validation/requestValidation');
const {
  normalizeProductExtraDataForStorage,
  normalizeStoredProductExtraData,
  parseProductWriteRequest,
  validateQuoteButtonPayload
} = require('../validation/productSchemas');
const {
  listProducts,
  findProductById,
  attachProductCategories,
  replaceProductTabs,
  ensureProductTabsTable
} = require('../services/productService');
const { persistUploadedFilesByType } = require('../services/fileStorageService');
const {
  listBackupProducts,
  findBackupProductById
} = require('../services/backupContentService');

const router = express.Router();
const MAX_PRODUCT_IMAGES = 50;

const normalizeProductText = (value) => safe(value || '').trim();
const normalizeImageList = (value) => (
  Array.isArray(value)
    ? value.map((imagePath) => safe(imagePath)).filter(Boolean)
    : []
);

const buildStoredImageList = (mainImage, extraImages) => {
  const normalizedMainImage = safe(mainImage);
  const normalizedExtraImages = normalizeImageList(extraImages);

  if (!normalizedMainImage) {
    return Array.from(new Set(normalizedExtraImages));
  }

  return Array.from(new Set([normalizedMainImage, ...normalizedExtraImages]));
};

const reorderImagePaths = (imagePaths, primaryIndex = 0) => {
  if (imagePaths.length === 0) {
    return [];
  }

  const boundedIndex = Math.min(Math.max(parseInteger(primaryIndex, 0), 0), imagePaths.length - 1);
  const selectedImage = imagePaths[boundedIndex];

  return [
    selectedImage,
    ...imagePaths.filter((_, index) => index !== boundedIndex)
  ];
};

const rollbackIfPossible = async (connection) => {
  if (!connection) {
    return;
  }

  try {
    await connection.rollback();
  } catch (rollbackError) {
    console.error('Falha ao executar rollback da transacao de produto:', rollbackError.message);
  }
};

const releaseIfPossible = (connection) => {
  if (!connection) {
    return;
  }

  try {
    connection.release();
  } catch (releaseError) {
    console.error('Falha ao liberar conexao do pool de produtos:', releaseError.message);
  }
};

const findDuplicateProductByName = async (connection, name, excludeId = null) => {
  const query = `
    SELECT id
    FROM products
    WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
      ${excludeId ? 'AND id <> ?' : ''}
    LIMIT 1
  `;
  const params = excludeId ? [name, excludeId] : [name];
  const [rows] = await connection.query(query, params);
  return rows[0] || null;
};

const hasAllMainCategories = async (connection, categoryIds) => {
  if (categoryIds.length === 0) {
    return false;
  }

  const placeholders = categoryIds.map(() => '?').join(', ');
  const [rows] = await connection.query(
    `SELECT COUNT(DISTINCT id) AS total FROM categorias WHERE id IN (${placeholders})`,
    categoryIds
  );

  return Number(rows?.[0]?.total || 0) === categoryIds.length;
};

const hasValidSubCategories = async (connection, categoryIds, subCategoryIds) => {
  if (subCategoryIds.length === 0) {
    return true;
  }

  if (categoryIds.length === 0) {
    return false;
  }

  const placeholders = subCategoryIds.map(() => '?').join(', ');
  const [rows] = await connection.query(
    `SELECT id, category_id FROM sub_categorias WHERE id IN (${placeholders})`,
    subCategoryIds
  );

  if (rows.length !== subCategoryIds.length) {
    return false;
  }

  const mainCategorySet = new Set(categoryIds);
  return rows.every((row) => mainCategorySet.has(Number(row.category_id)));
};

router.get('/', async (req, res) => {
  const includeInactive = parseBooleanFlag(req.query.include_inactive);

  try {
    await ensureProductTabsTable(db);
    const products = await listProducts(db, { includeInactive });
    res.json(products);
  } catch (err) {
    try {
      res.json(listBackupProducts({ includeInactive }));
    } catch (backupError) {
      res.status(500).json({ error: err.message });
    }
  }
});

router.get('/:id', async (req, res) => {
  const includeInactive = parseBooleanFlag(req.query.include_inactive);

  try {
    await ensureProductTabsTable(db);
    const product = await findProductById(db, req.params.id, { includeInactive });

    if (!product) {
      return res.status(404).json({ error: 'Produto nao encontrado' });
    }

    return res.json(product);
  } catch (err) {
    try {
      const backupProduct = findBackupProductById(req.params.id, { includeInactive });

      if (!backupProduct) {
        return res.status(404).json({ error: 'Produto nao encontrado' });
      }

      return res.json(backupProduct);
    } catch (backupError) {
      return res.status(500).json({ error: err.message });
    }
  }
});

router.post('/', requireAdminSession, upload.array('images', 20), async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const payload = parseProductWriteRequest(req.body);
    const normalizedName = normalizeProductText(payload.name);
    const normalizedDescription = normalizeProductText(payload.description);
    const parsedCategoryIds = payload.category_ids;
    const parsedSubCategoryIds = payload.sub_category_ids;
    const primaryImageIndex = parseInteger(payload.primary_image_index, 0);
    const uploadedImagePaths = await persistUploadedFilesByType(req.files || [], { resourceType: 'produtos' });
    const extra = normalizeProductExtraDataForStorage(payload.extra_data);
    const productTabs = Array.isArray(extra.product_tabs) ? extra.product_tabs : [];
    const retainedImagePaths = normalizeImageList(extra.images);
    const mergedImagePaths = reorderImagePaths([...retainedImagePaths, ...uploadedImagePaths], primaryImageIndex);

    const duplicateProduct = await findDuplicateProductByName(connection, normalizedName);

    if (duplicateProduct) {
      await rollbackIfPossible(connection);
      return res.status(409).json({ error: 'Ja existe um produto com esse nome.' });
    }

    if (mergedImagePaths.length === 0) {
      await rollbackIfPossible(connection);
      return res.status(400).json({ error: 'Adicione pelo menos uma foto para salvar o produto.' });
    }

    if (mergedImagePaths.length > MAX_PRODUCT_IMAGES) {
      await rollbackIfPossible(connection);
      return res.status(400).json({ error: `O produto pode ter no maximo ${MAX_PRODUCT_IMAGES} imagens.` });
    }

    if (!(await hasAllMainCategories(connection, parsedCategoryIds))) {
      await rollbackIfPossible(connection);
      return res.status(400).json({ error: 'As categorias principais informadas sao invalidas.' });
    }

    if (!(await hasValidSubCategories(connection, parsedCategoryIds, parsedSubCategoryIds))) {
      await rollbackIfPossible(connection);
      return res.status(400).json({
        error: 'As subcategorias informadas precisam existir e pertencer as categorias principais selecionadas.'
      });
    }

    extra.images = mergedImagePaths;
    const isActive = payload.is_active === false ? 0 : 1;

    const [result] = await connection.query(
      'INSERT INTO products (name, description, main_image, extra_data, is_active) VALUES (?, ?, ?, ?, ?)',
      [normalizedName, normalizedDescription, safe(mergedImagePaths[0]), JSON.stringify(extra), isActive]
    );

    const productId = result.insertId;
    await attachProductCategories(connection, productId, parsedCategoryIds, parsedSubCategoryIds);
    await replaceProductTabs(connection, productId, productTabs);

    await connection.commit();
    return res.status(201).json({ message: 'Produto criado!' });
  } catch (err) {
    await rollbackIfPossible(connection);
    if (sendValidationError(res, err)) {
      return res;
    }
    console.error('ERRO NO POST PRODUCT:', err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    releaseIfPossible(connection);
  }
});

router.put('/:id', requireAdminSession, upload.array('images', 20), async (req, res) => {
  const connection = await db.getConnection();
  const productId = Number(req.params.id);

  try {
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Produto invalido.' });
    }

    await connection.beginTransaction();

    const payload = parseProductWriteRequest(req.body);
    const name = normalizeProductText(payload.name);
    const description = normalizeProductText(payload.description);
    const parsedCategoryIds = payload.category_ids;
    const parsedSubCategoryIds = payload.sub_category_ids;
    const primaryImageIndex = parseInteger(payload.primary_image_index, 0);
    const isActive = payload.is_active === false ? 0 : 1;
    const newImagePaths = await persistUploadedFilesByType(req.files || [], { resourceType: 'produtos' });
    const requestedExtraData = payload.extra_data;
    const extra = normalizeProductExtraDataForStorage(requestedExtraData);
    const productTabs = Array.isArray(extra.product_tabs) ? extra.product_tabs : [];
    const duplicateProduct = await findDuplicateProductByName(connection, name, productId);
    const retainedImagePaths = normalizeImageList(extra.images);
    const removedImagePaths = normalizeImageList(requestedExtraData.removedImages);
    const currentProduct = await findProductById(connection, productId);

    if (!currentProduct) {
      await rollbackIfPossible(connection);
      return res.status(404).json({ error: 'Produto nao encontrado.' });
    }

    const currentExtra = normalizeStoredProductExtraData(currentProduct.extra_data);
    const storedImagePaths = buildStoredImageList(currentProduct.main_image, currentExtra.images);
    const preservedImagePaths = [
      ...retainedImagePaths,
      ...storedImagePaths.filter((imagePath) => (
        !removedImagePaths.includes(imagePath) && !retainedImagePaths.includes(imagePath)
      ))
    ];
    const mergedImagePaths = reorderImagePaths([...preservedImagePaths, ...newImagePaths], primaryImageIndex);

    if (duplicateProduct) {
      await rollbackIfPossible(connection);
      return res.status(409).json({ error: 'Ja existe um produto com esse nome.' });
    }

    if (mergedImagePaths.length === 0) {
      await rollbackIfPossible(connection);
      return res.status(400).json({ error: 'Adicione pelo menos uma foto para salvar o produto.' });
    }

    if (mergedImagePaths.length > MAX_PRODUCT_IMAGES) {
      await rollbackIfPossible(connection);
      return res.status(400).json({ error: `O produto pode ter no maximo ${MAX_PRODUCT_IMAGES} imagens.` });
    }

    if (!(await hasAllMainCategories(connection, parsedCategoryIds))) {
      await rollbackIfPossible(connection);
      return res.status(400).json({ error: 'As categorias principais informadas sao invalidas.' });
    }

    if (!(await hasValidSubCategories(connection, parsedCategoryIds, parsedSubCategoryIds))) {
      await rollbackIfPossible(connection);
      return res.status(400).json({
        error: 'As subcategorias informadas precisam existir e pertencer as categorias principais selecionadas.'
      });
    }

    extra.images = mergedImagePaths;

    let query = 'UPDATE products SET name=?, description=?, extra_data=?, main_image=?, is_active=?';
    const params = [name, description, JSON.stringify(extra), safe(mergedImagePaths[0]), isActive];

    query += ' WHERE id=?';
    params.push(productId);

    await connection.query(query, params.map(safe));
    await attachProductCategories(connection, productId, parsedCategoryIds, parsedSubCategoryIds);
    await replaceProductTabs(connection, productId, productTabs);

    await connection.commit();
    return res.json({ message: 'Produto atualizado!' });
  } catch (err) {
    await rollbackIfPossible(connection);
    if (sendValidationError(res, err)) {
      return res;
    }
    console.error('ERRO NO UPDATE PRODUCT:', err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    releaseIfPossible(connection);
  }
});

router.delete('/:id', requireAdminSession, async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Produto excluido!' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/:id/active', requireAdminSession, async (req, res) => {
  try {
    const isActive = parseBooleanFlag(req.body?.is_active) ? 1 : 0;
    await db.query('UPDATE products SET is_active = ? WHERE id = ?', [isActive, req.params.id]);
    return res.json({ message: `Produto ${isActive ? 'ativado' : 'inativado'}!` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/:id/quote-button', requireAdminSession, async (req, res) => {
  const connection = await db.getConnection();
  const productId = Number(req.params.id);

  try {
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Produto invalido.' });
    }

    const payload = validateQuoteButtonPayload(req.body || {});
    const product = await findProductById(connection, productId, { includeInactive: true });

    if (!product) {
      return res.status(404).json({ error: 'Produto nao encontrado.' });
    }

    const extra = normalizeStoredProductExtraData(product.extra_data);
    extra.showQuoteButton = payload.showQuoteButton;

    await connection.query('UPDATE products SET extra_data = ? WHERE id = ?', [JSON.stringify(extra), productId]);

    return res.json({ message: 'Botao de orcamento atualizado!' });
  } catch (err) {
    if (sendValidationError(res, err)) {
      return res;
    }
    return res.status(500).json({ error: err.message });
  } finally {
    releaseIfPossible(connection);
  }
});

module.exports = router;
