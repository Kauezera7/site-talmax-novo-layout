/**
 * Define as rotas das secoes especiais do site.
 * Atualiza os produtos destacados de paginas como Upcera, Scanners e Impressoras 3D.
 */
const express = require('express');
const db = require('../../config/database');
const { requireAdminSession } = require('../auth/adminSession');

const router = express.Router();

router.put('/upcera/products', requireAdminSession, async (req, res) => {
  try {
    const { selected_products } = req.body;

    if (!Array.isArray(selected_products)) {
      return res.status(400).json({ error: 'O campo selected_products deve ser um array.' });
    }

    await db.query('UPDATE products SET is_upcera = FALSE, upcera_order = 0');

    for (const item of selected_products) {
      await db.query('UPDATE products SET is_upcera = TRUE, upcera_order = ? WHERE id = ?', [item.order || 0, item.id]);
    }

    return res.json({ message: 'Produtos Upcera atualizados com sucesso!' });
  } catch (err) {
    console.error('ERRO AO SALVAR UPCERA NO BACKEND:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.put('/scanners/products', requireAdminSession, async (req, res) => {
  try {
    const { selected_products } = req.body;

    if (!Array.isArray(selected_products)) {
      return res.status(400).json({ error: 'O campo selected_products deve ser um array.' });
    }

    await db.query('UPDATE products SET is_scanner = FALSE, scanner_order = 0');

    for (const item of selected_products) {
      await db.query('UPDATE products SET is_scanner = TRUE, scanner_order = ? WHERE id = ?', [item.order || 0, item.id]);
    }

    return res.json({ message: 'Produtos Scanners atualizados com sucesso!' });
  } catch (err) {
    console.error('ERRO AO SALVAR SCANNERS NO BACKEND:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.put('/3d-printers/products', requireAdminSession, async (req, res) => {
  try {
    const { selected_products } = req.body;

    if (!Array.isArray(selected_products)) {
      return res.status(400).json({ error: 'O campo selected_products deve ser um array.' });
    }

    await db.query('UPDATE products SET is_3d_printer = FALSE, printer_order = 0');

    for (const item of selected_products) {
      await db.query('UPDATE products SET is_3d_printer = TRUE, printer_order = ? WHERE id = ?', [item.order || 0, item.id]);
    }

    return res.json({ message: 'Produtos Impressoras 3D atualizados com sucesso!' });
  } catch (err) {
    console.error('ERRO AO SALVAR IMPRESSORAS 3D NO BACKEND:', err);
    return res.status(500).json({ error: `Erro no banco de dados: ${err.message}` });
  }
});

module.exports = router;
