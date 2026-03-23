/**
 * Define as rotas de autenticacao do admin.
 * Expõe login, consulta da sessao atual e logout do painel.
 */
const express = require('express');
const {
  requireAdminSession,
  loginAdmin,
  getAdminSession,
  logoutAdmin
} = require('../auth/adminSession');

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/session', requireAdminSession, getAdminSession);
router.post('/logout', requireAdminSession, logoutAdmin);

module.exports = router;
