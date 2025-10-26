const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

async function getCart(req, res, next) {
  try {
    const items = await CartItem.find({ user: req.userId }).populate('product');
    res.json(items);
  } catch (err) { next(err); }
}

async function addItem(req, res, next) {
  try {
    const { product, quantity = 1 } = req.body;
    const prod = await Product.findById(product);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    if (prod.habilitado === false || (prod.stock || 0) <= 0) {
      return res.status(400).json({ error: 'Producto agotado o no disponible' });
    }
    const existing = await CartItem.findOne({ user: req.userId, product });
    const newQuantity = (existing?.quantity || 0) + quantity;
    if (newQuantity > (prod.stock || 0)) {
      return res.status(400).json({ error: `Stock insuficiente. Disponible: ${prod.stock || 0}` });
    }
    const item = await CartItem.findOneAndUpdate(
      { user: req.userId, product },
      { $set: { quantity: newQuantity } },
      { upsert: true, new: true }
    );
    res.status(201).json(item);
  } catch (err) { next(err); }
}

async function removeItem(req, res, next) {
  try {
    const { id } = req.params;
    await CartItem.findOneAndDelete({ _id: id, user: req.userId });
    res.json({ deleted: true });
  } catch (err) { next(err); }
}

async function clear(req, res, next) {
  try {
    await CartItem.deleteMany({ user: req.userId });
    res.json({ cleared: true });
  } catch (err) { next(err); }
}

module.exports = { getCart, addItem, removeItem, clear };