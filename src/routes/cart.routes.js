const { Router } = require('express');
const { getCart, addItem, removeItem, clear } = require('../controllers/cart.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', requireAuth, getCart);
router.post('/items', requireAuth, addItem);
router.delete('/items/:id', requireAuth, removeItem);
router.delete('/clear', requireAuth, clear);

module.exports = router;