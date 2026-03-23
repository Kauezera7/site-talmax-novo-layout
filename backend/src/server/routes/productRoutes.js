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
  getUploadedImagePaths
} = require('../utils/requestParsers');
const {
  listProducts,
  findProductById,
  attachProductCategories
} = require('../services/productService');

const router = express.Router();

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
    const imagePaths = getUploadedImagePaths(req.files || []);
    const main_image = imagePaths.length > 0 ? imagePaths[0] : null;
    const extra = parseJsonObject(extra_data);
    extra.images = imagePaths;

    const [result] = await connection.query(
      'INSERT INTO products (name, description, main_image, extra_data) VALUES (?, ?, ?, ?)',
      [safe(name) || '', safe(description) || '', safe(main_image), JSON.stringify(extra)]
    );

    const productId = result.insertId;
    await attachProductCategories(connection, productId, parseIdArray(category_ids));

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

    const name = req.body.name || '';
    const description = req.body.description || '';
    const category_ids = req.body.category_ids;
    const extra_data = req.body.extra_data;
    const newImagePaths = getUploadedImagePaths(req.files || []);
    const extra = parseJsonObject(extra_data);

    let query = 'UPDATE products SET name=?, description=?, extra_data=?';
    const params = [safe(name), safe(description), JSON.stringify(extra)];

    if (newImagePaths.length > 0) {
      extra.images = newImagePaths;
      params[2] = JSON.stringify(extra);
      query += ', main_image=?';
      params.push(safe(newImagePaths[0]));
    }

    query += ' WHERE id=?';
    params.push(productId);

    await connection.query(query, params.map(safe));
    await attachProductCategories(connection, productId, parseIdArray(category_ids));

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
