const Order = require('../models/Order');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

async function list(req, res, next) {
  try {
    const orders = await Order.find({ user: req.userId }).populate('items.product');
    res.json(orders);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const cartItems = await CartItem.find({ user: req.userId }).populate('product');
    if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

    // Validación de stock y disponibilidad
    for (const it of cartItems) {
      const p = it.product;
      if (!p) return res.status(404).json({ error: 'Product not found' });
      if (p.habilitado === false) return res.status(400).json({ error: `Producto deshabilitado: ${p.name}` });
      if (it.quantity > (p.stock || 0)) return res.status(400).json({ error: `Stock insuficiente para ${p.name}. Disponible: ${p.stock || 0}` });
    }

    const total = cartItems.reduce((sum, it) => sum + (it.product.price * it.quantity), 0);
    const order = await Order.create({
      user: req.userId,
      items: cartItems.map(it => ({ product: it.product._id, quantity: it.quantity, price: it.product.price })),
      total,
      status: 'paid',
    });

    // Descontar stock y deshabilitar si llega a cero
    for (const it of cartItems) {
      const p = await Product.findById(it.product._id);
      if (!p) continue;
      const newStock = Math.max(0, (p.stock || 0) - it.quantity);
      p.stock = newStock;
      if (newStock <= 0) p.habilitado = false;
      await p.save();
    }

    await CartItem.deleteMany({ user: req.userId });
    res.status(201).json(order);
  } catch (err) { next(err); }
}

// NEW: listado completo de órdenes (solo admin)
async function listAll(req, res, next) {
  try {
    const orders = await Order.find()
      .populate([{ path: 'user', select: 'name email role' }, { path: 'items.product' }])
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
}

module.exports = { list, create, listAll };