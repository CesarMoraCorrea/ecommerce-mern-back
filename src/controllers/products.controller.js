const mongoose = require('mongoose');
const Product = require('../models/Product');

async function list(req, res, next) {
  try {
    // Excluir deshabilitados (incluye documentos antiguos sin campo)
    const products = await Product.find({ habilitado: { $ne: false } });
    res.json(products);
  } catch (err) { next(err); }
}

async function get(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const item = await Product.findById(id);
    if (!item) return res.status(404).json({ error: 'Product not found' });
    return res.json(item);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { image, images, ...rest } = req.body;
    const normalizedImages = Array.isArray(images)
      ? images
      : (image ? [image] : []);
    const stockValue = Number(rest.stock ?? 0);
    const product = await Product.create({
      ...rest,
      stock: stockValue,
      images: normalizedImages,
      habilitado: stockValue > 0 ? (req.body.habilitado ?? true) : false
    });
    res.status(201).json(product);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { image, images, ...rest } = req.body;
    const updatePayload = { ...rest };
    if (image !== undefined) {
      updatePayload.images = image ? [image] : [];
    } else if (Array.isArray(images)) {
      updatePayload.images = images;
    }
    if (rest.stock !== undefined) {
      const nextStock = Number(rest.stock);
      updatePayload.stock = nextStock;
      if (nextStock <= 0) {
        updatePayload.habilitado = false;
      } else if (rest.habilitado === undefined) {
        updatePayload.habilitado = true;
      }
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
}

// Soft delete: marcar como deshabilitado en vez de borrar
async function remove(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { habilitado: false }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ disabled: true });
  } catch (err) { next(err); }
}

// Admin: listado completo, incluyendo deshabilitados
async function listAll(req, res, next) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { next(err); }
}

module.exports = { list, get, create, update, remove, listAll };