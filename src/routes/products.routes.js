const { Router } = require('express');
const { list, get, create, update, remove, listAll } = require('../controllers/products.controller');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// Admin: ver todo (habilitados y deshabilitados) — DEBE ir antes de '/:id'
router.get('/admin', requireAuth, requireAdmin, listAll);

// Público
router.get('/', list);
router.get('/:id', get);

// Mutaciones
router.post('/', requireAuth, requireAdmin, create);
router.put('/:id', requireAuth, requireAdmin, update);
router.delete('/:id', requireAuth, requireAdmin, remove);

module.exports = router;