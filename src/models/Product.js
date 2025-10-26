const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0 },
  habilitado: { type: Boolean, default: true },
  images: [{ type: String }],
  category: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);