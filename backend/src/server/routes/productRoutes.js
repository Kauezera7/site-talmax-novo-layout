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
  getUploadedImagePaths
} = require('../utils/requestParsers');
const {
  listProducts,
  findProductById,
  attachProductCategories
} = require('../services/productService');

const router = express.Router();

const normalizeProductText = (value) => safe(value || '').trim();
const normalizeImageList = (value) => (
  Array.isArray(value)
    ? value.map((imagePath) => safe(imagePath)).filter(Boolean)
    : []
);

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
    `SELECT id FROM categories WHERE parent_id IS NULL AND id IN (${placeholders}) LIMIT 1`,
    categoryIds
  );

  return rows.length > 0;
};

router.get('/', async (req, res) => {
  try {
    const products = await listProducts(db);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await findProductById(db, req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Produto nao encontrado' });
    }

    return res.json(product);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdminSession, upload.array('images', 20), async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { name, category_ids, description, extra_data } = req.body;
    const normalizedName = normalizeProductText(name);
    const normalizedDescription = normalizeProductText(description);
    const parsedCategoryIds = parseIdArray(category_ids);
    const primaryImageIndex = parseInteger(req.body.primary_image_index, 0);
    const uploadedImagePaths = getUploadedImagePaths(req.files || []);
    const extra = parseJsonObject(extra_data);
    const retainedImagePaths = normalizeImageList(extra.images);
    const mergedImagePaths = reorderImagePaths([...retainedImagePaths, ...uploadedImagePaths], primaryImageIndex);

    const duplicateProduct = await findDuplicateProductByName(connection, normalizedName);

    if (duplicateProduct) {
      await connection.rollback();
      return res.status(409).json({ error: 'Ja existe um produto com esse nome.' });
    }

    if (mergedImagePaths.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Adicione pelo menos uma foto para salvar o produto.' });
    }

    if (!(await hasMainCategory(connection, parsedCategoryIds))) {
      await connection.rollback();
      return res.status(400).json({ error: 'Selecione pelo menos uma categoria principal para salvar o produto.' });
    }

    extra.images = mergedImagePaths;

    const [result] = await connection.query(
      'INSERT INTO products (name, description, main_image, extra_data) VALUES (?, ?, ?, ?)',
      [normalizedName, normalizedDescription, safe(mergedImagePaths[0]), JSON.stringify(extra)]
    );

    const productId = result.insertId;
    await attachProductCategories(connection, productId, parsedCategoryIds);

    await connection.commit();
    return res.status(201).json({ message: 'Produto criado!' });
  } catch (err) {
    await connection.rollback();
    console.error('ERRO NO POST PRODUCT:', err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    connection.release();
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
    const parsedCategoryIds = parseIdArray(category_ids);
    const primaryImageIndex = parseInteger(req.body.primary_image_index, 0);
    const extra_data = req.body.extra_data;
    const newImagePaths = getUploadedImagePaths(req.files || []);
    const extra = parseJsonObject(extra_data);
    const duplicateProduct = await findDuplicateProductByName(connection, name, productId);
    const retainedImagePaths = normalizeImageList(extra.images);
    const mergedImagePaths = reorderImagePaths([...retainedImagePaths, ...newImagePaths], primaryImageIndex);

    if (duplicateProduct) {
      await connection.rollback();
      return res.status(409).json({ error: 'Ja existe um produto com esse nome.' });
    }

    if (mergedImagePaths.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Adicione pelo menos uma foto para salvar o produto.' });
    }

    if (!(await hasMainCategory(connection, parsedCategoryIds))) {
      await connection.rollback();
      return res.status(400).json({ error: 'Selecione pelo menos uma categoria principal para salvar o produto.' });
    }

    extra.images = mergedImagePaths;

    let query = 'UPDATE products SET name=?, description=?, extra_data=?, main_image=?';
    const params = [name, description, JSON.stringify(extra), safe(mergedImagePaths[0])];

    query += ' WHERE id=?';
    params.push(productId);

    await connection.query(query, params.map(safe));
    await attachProductCategories(connection, productId, parsedCategoryIds);

    await connection.commit();
    return res.json({ message: 'Produto atualizado!' });
  } catch (err) {
    await connection.rollback();
    console.error('ERRO NO UPDATE PRODUCT:', err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    connection.release();
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

module.exports = router;
