/**
 * Define as rotas para gerenciar os quadros (servicos/segmentos) da Home.
 */
const express = require('express');
const db = require('../../config/database');
const { requireAdminSession } = require('../auth/adminSession');
const upload = require('../config/upload');
const { safe } = require('../utils/common');
const { parseBooleanFlag, parseInteger } = require('../utils/requestParsers');
const { persistUploadedFile } = require('../services/fileStorageService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM home_services ORDER BY display_order ASC, name ASC');

    const services = rows.map((row) => ({
      ...row,
      actions: typeof row.actions === 'string' ? JSON.parse(row.actions) : (row.actions || []),
      is_external: !!row.is_external,
      active: !!row.active
    }));

    res.json(services);
  } catch (err) {
    console.error('Erro ao buscar servicos da home:', err);
    res.status(500).json({ error: 'Erro interno ao buscar servicos' });
  }
});

router.post('/', requireAdminSession, upload.single('image'), async (req, res) => {
  try {
    const { name, description, link_url, is_external, display_order, active, actions } = req.body;
    const image_url = req.file
      ? await persistUploadedFile(req.file, { resourceType: 'segmentos' })
      : null;

    const [result] = await db.query(
      `INSERT INTO home_services
      (name, description, image_url, link_url, is_external, display_order, active, actions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safe(name),
        safe(description),
        safe(image_url),
        safe(link_url),
        parseBooleanFlag(is_external) ? 1 : 0,
        parseInteger(display_order, 0),
        active === 'false' || active === false ? 0 : 1,
        actions || '[]'
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Servico criado com sucesso' });
  } catch (err) {
    console.error('Erro ao criar servico da home:', err);
    res.status(500).json({ error: err.message || 'Erro interno ao criar servico' });
  }
});

router.put('/:id', requireAdminSession, upload.single('image'), async (req, res) => {
  const { id } = req.params;

  try {
    const { name, description, link_url, is_external, display_order, active, actions } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
      image_url = await persistUploadedFile(req.file, { resourceType: 'segmentos' });
    }

    await db.query(
      `UPDATE home_services SET
        name = ?,
        description = ?,
        image_url = ?,
        link_url = ?,
        is_external = ?,
        display_order = ?,
        active = ?,
        actions = ?
      WHERE id = ?`,
      [
        safe(name),
        safe(description),
        safe(image_url),
        safe(link_url),
        parseBooleanFlag(is_external) ? 1 : 0,
        parseInteger(display_order, 0),
        active === 'false' || active === false ? 0 : 1,
        actions || '[]',
        id
      ]
    );

    res.json({ message: 'Servico atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar servico da home:', err);
    res.status(500).json({ error: err.message || 'Erro interno ao atualizar servico' });
  }
});

router.delete('/:id', requireAdminSession, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM home_services WHERE id = ?', [id]);
    res.json({ message: 'Servico removido com sucesso' });
  } catch (err) {
    console.error('Erro ao remover servico da home:', err);
    res.status(500).json({ error: err.message || 'Erro interno ao remover servico' });
  }
});

router.put('/:id/active', requireAdminSession, async (req, res) => {
  const { id } = req.params;

  try {
    const active = parseBooleanFlag(req.body?.active) ? 1 : 0;
    await db.query('UPDATE home_services SET active = ? WHERE id = ?', [active, id]);
    res.json({ message: `Servico ${active ? 'ativado' : 'ocultado'} com sucesso` });
  } catch (err) {
    console.error('Erro ao atualizar status do servico da home:', err);
    res.status(500).json({ error: err.message || 'Erro interno ao atualizar status do servico' });
  }
});

module.exports = router;
