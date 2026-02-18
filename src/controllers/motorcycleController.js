const mongoose = require('mongoose');
const Motorcycle = require('../models/Motorcycle');
const asyncHandler = require('../utils/asyncHandler');

const createMotorcycle = asyncHandler(async (req, res) => {
  const motorcycle = await Motorcycle.create(req.body);
  res.status(201).json({ success: true, motorcycle });
});

const getMotorcycles = asyncHandler(async (req, res) => {
  const {
    search,
    brand,
    category,
    minPrice,
    maxPrice,
    status,
    featured,
    sort,
    page = 1,
    limit = 10,
  } = req.query;

  const filters = {};

  if (search) {
    filters.$text = { $search: search };
  }
  if (brand) {
    filters.brand = brand;
  }
  if (category) {
    filters.category = category;
  }
  if (status) {
    filters.status = status;
  }
  if (featured !== undefined) {
    filters.isFeatured = featured === 'true';
  }
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  const sortOptions = {
    newest: '-createdAt',
    oldest: 'createdAt',
    priceAsc: 'price',
    priceDesc: '-price',
    nameAsc: 'name',
    nameDesc: '-name',
  };

  const sortBy = sortOptions[sort] || '-createdAt';
  const pageNumber = Math.max(1, Number(page));
  const pageSize = Math.min(100, Math.max(1, Number(limit)));

  const total = await Motorcycle.countDocuments(filters);
  const motorcycles = await Motorcycle.find(filters)
    .sort(sortBy)
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize);

  res.status(200).json({
    success: true,
    total,
    page: pageNumber,
    pages: Math.ceil(total / pageSize),
    motorcycles,
  });
});

const getMotorcycleByIdentifier = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  const query = mongoose.Types.ObjectId.isValid(identifier)
    ? { $or: [{ _id: identifier }, { slug: identifier }] }
    : { slug: identifier };

  const motorcycle = await Motorcycle.findOne(query);

  if (!motorcycle) {
    res.status(404);
    throw new Error('Motorcycle not found');
  }

  res.status(200).json({ success: true, motorcycle });
});

const updateMotorcycle = asyncHandler(async (req, res) => {
  const motorcycle = await Motorcycle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!motorcycle) {
    res.status(404);
    throw new Error('Motorcycle not found');
  }

  res.status(200).json({ success: true, motorcycle });
});

const deleteMotorcycle = asyncHandler(async (req, res) => {
  const motorcycle = await Motorcycle.findById(req.params.id);

  if (!motorcycle) {
    res.status(404);
    throw new Error('Motorcycle not found');
  }

  await motorcycle.deleteOne();
  res.status(200).json({ success: true, message: 'Motorcycle deleted successfully' });
});

module.exports = {
  createMotorcycle,
  getMotorcycles,
  getMotorcycleByIdentifier,
  updateMotorcycle,
  deleteMotorcycle,
};
