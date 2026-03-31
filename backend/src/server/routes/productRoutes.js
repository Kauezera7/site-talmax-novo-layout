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
  parseJsonObject,
  parseIdArray,
  parseInteger,
  parseBooleanFlag
} = require('../utils/requestParsers');
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

const hasMainCategory = async (connection, categoryIds) => {
  if (categoryIds.length === 0) {
    return false;
  }

  const placeholders = categoryIds.map(() => '?').join(', ');
  const [rows] = await connection.query(
    `SELECT id FROM categorias WHERE id IN (${placeholders}) LIMIT 1`,
    categoryIds
  );

  return rows.length > 0;
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

    const { name, category_ids, sub_category_ids, description, extra_data, is_active } = req.body;
    const normalizedName = normalizeProductText(name);
    const normalizedDescription = normalizeProductText(description);
    const parsedCategoryIds = parseIdArray(category_ids);
    const parsedSubCategoryIds = parseIdArray(sub_category_ids);
    const primaryImageIndex = parseInteger(req.body.primary_image_index, 0);
    const uploadedImagePaths = await persistUploadedFilesByType(req.files || [], { resourceType: 'produtos' });
    const extra = parseJsonObject(extra_data);
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

    if (!(await hasMainCategory(connection, parsedCategoryIds))) {
      await rollbackIfPossible(connection);
      return res.status(400).json({ error: 'Selecione pelo menos uma categoria principal para salvar o produto.' });
    }

    extra.images = mergedImagePaths;
    const isActive = parseBooleanFlag(is_active) ? 1 : 0;

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
    await connection.beginTransaction();

    const name = normalizeProductText(req.body.name);
    const description = normalizeProductText(req.body.description);
    const category_ids = req.body.category_ids;
    const sub_category_ids = req.body.sub_category_ids;
    const parsedCategoryIds = parseIdArray(category_ids);
    const parsedSubCategoryIds = parseIdArray(sub_category_ids);
    const primaryImageIndex = parseInteger(req.body.primary_image_index, 0);
    const extra_data = req.body.extra_data;
    const isActive = parseBooleanFlag(req.body.is_active) ? 1 : 0;
    const newImagePaths = await persistUploadedFilesByType(req.files || [], { resourceType: 'produtos' });
    const extra = parseJsonObject(extra_data);
    const productTabs = Array.isArray(extra.product_tabs) ? extra.product_tabs : [];
    const duplicateProduct = await findDuplicateProductByName(connection, name, productId);
    const retainedImagePaths = normalizeImageList(extra.images);
    const removedImagePaths = normalizeImageList(extra.removedImages);
    const currentProduct = await findProductById(connection, productId);

    if (!currentProduct) {
      await rollbackIfPossible(connection);
      return res.status(404).json({ error: 'Produto nao encontrado.' });
    }

    const currentExtra = parseJsonObject(currentProduct.extra_data);
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

    if (!(await hasMainCategory(connection, parsedCategoryIds))) {
      await rollbackIfPossible(connection);
      return res.status(400).json({ error: 'Selecione pelo menos uma categoria principal para salvar o produto.' });
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
    const product = await findProductById(connection, productId, { includeInactive: true });

    if (!product) {
      return res.status(404).json({ error: 'Produto nao encontrado.' });
    }

    const extra = parseJsonObject(product.extra_data);
    extra.showQuoteButton = parseBooleanFlag(req.body?.showQuoteButton);

    await connection.query('UPDATE products SET extra_data = ? WHERE id = ?', [JSON.stringify(extra), productId]);

    return res.json({ message: 'Botao de orcamento atualizado!' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    releaseIfPossible(connection);
  }
});

module.exports = router;
