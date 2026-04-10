/**
 * Define as rotas de autenticação do admin.
 * Expõe login, consulta da sessão atual e logout do painel.
 */
const express = require('express');
const { adminLoginRateLimit } = require('../seguranca/adminLoginRateLimit');
const {
  requireAdminSession,
  loginAdmin,
  getAdminSession,
  logoutAdmin,
  unlockAdminLoginByUser
} = require('../auth/adminSession');

const router = express.Router();

router.post('/login', adminLoginRateLimit, loginAdmin);
router.post('/login-unlock', requireAdminSession, unlockAdminLoginByUser);
router.get('/session', requireAdminSession, getAdminSession);
router.post('/logout', requireAdminSession, logoutAdmin);

module.exports = router;
