/**
 * Define as rotas de categorias e subcategorias.
 * Cuida de listagem publica e operacoes administrativas de CRUD.
 */
const express = require('express');
const db = require('../../config/database');
const upload = require('../config/upload');
const { safe } = require('../utils/common');
const { requireAdminSession } = require('../auth/adminSession');
const { parseBooleanFlag } = require('../utils/requestParsers');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, name, slug, icon_url, display_order, is_visible, NULL as parent_id
      FROM categorias
      UNION ALL
      SELECT id, name, slug, NULL as icon_url, display_order, IFNULL(is_visible, 1) as is_visible, category_id as parent_id
      FROM sub_categorias
      ORDER BY display_order
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdminSession, upload.single('icon'), async (req, res) => {
  try {
    const { name, slug, is_visible, parent_id } = req.body;
    const icon_url = req.file ? `/img/${req.file.filename}` : null;
    const visible = parseBooleanFlag(is_visible) ? 1 : 0;

    if (parent_id && parent_id !== 'null' && parent_id !== '') {
      await db.query(
        'INSERT INTO sub_categorias (category_id, name, slug, display_order) VALUES (?, ?, ?, ?)',
        [Number(parent_id), safe(name) || '', safe(slug) || '', 0]
      );
      return res.status(201).json({ message: 'Subcategoria criada!' });
    }

    await db.query(
      'INSERT INTO categorias (name, slug, icon_url, display_order, is_visible) VALUES (?, ?, ?, ?, ?)',
      [safe(name) || '', safe(slug) || '', safe(icon_url), 0, visible]
    );
    return res.status(201).json({ message: 'Categoria criada!' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAdminSession, upload.single('icon'), async (req, res) => {
  try {
    const { name, slug, is_visible, parent_id } = req.body;
    const visible = parseBooleanFlag(is_visible) ? 1 : 0;
    const { id } = req.params;

    if (parent_id && parent_id !== 'null' && parent_id !== '') {
      await db.query(
        'UPDATE sub_categorias SET name = ?, slug = ?, category_id = ?, is_visible = ? WHERE id = ?',
        [safe(name) || '', safe(slug) || '', Number(parent_id), visible, id]
      );
      return res.json({ message: 'Subcategoria atualizada!' });
    }

    let query = 'UPDATE categorias SET name = ?, slug = ?, is_visible = ?';
    const params = [safe(name) || '', safe(slug) || '', visible];

    if (req.file) {
      query += ', icon_url = ?';
      params.push(`/img/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params.map(safe));
    return res.json({ message: 'Categoria atualizada!' });
  } catch (err) {
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
