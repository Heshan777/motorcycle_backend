const mongoose = require('mongoose');

const motorcycleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['sport', 'cruiser', 'adventure', 'scooter', 'electric', 'commuter'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    engine: { type: String, required: true, trim: true },
    horsepower: { type: Number, default: 0 },
    torque: { type: Number, default: 0 },
    topSpeed: { type: Number, default: 0 },
    mileage: { type: Number, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['available', 'upcoming', 'discontinued'],
      default: 'available',
    },
    isFeatured: { type: Boolean, default: false },
    description: { type: String, default: '' },
    images: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

motorcycleSchema.index({ name: 'text', brand: 'text', category: 'text' });

module.exports = mongoose.model('Motorcycle', motorcycleSchema);
