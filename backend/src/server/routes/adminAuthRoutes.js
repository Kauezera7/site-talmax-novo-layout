/**
 * Define as rotas de autenticação do admin.
 * Expõe login, consulta da sessão atual e logout do painel.
 */
const express = require('express');
const {
  requireAdminSession,
  requireMasterAdminSession,
  loginAdmin,
  getAdminSession,
  logoutAdmin,
  unlockAdminLoginByUser,
  listAdminUsers,
  createAdminUser,
  updateAdminUser
} = require('../auth/adminSession');

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/login-unlock', requireMasterAdminSession, unlockAdminLoginByUser);
router.get('/session', getAdminSession);
router.get('/users', requireMasterAdminSession, listAdminUsers);
router.post('/users', requireMasterAdminSession, createAdminUser);
router.put('/users/:id', requireMasterAdminSession, updateAdminUser);
router.post('/logout', requireAdminSession, logoutAdmin);

module.exports = router;
