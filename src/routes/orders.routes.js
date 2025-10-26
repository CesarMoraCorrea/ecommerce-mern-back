const { Router } = require('express');
const { list, create, listAll } = require('../controllers/orders.controller');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', requireAuth, list);
router.post('/', requireAuth, create);
// ADMIN: listado completo
router.get('/admin', requireAuth, requireAdmin, listAll);

module.exports = router;