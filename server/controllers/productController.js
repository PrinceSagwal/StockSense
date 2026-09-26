import Product from '../models/Product.js';
import Category from '../models/Category.js';
import StockMove from '../models/StockMove.js';
import Warehouse from '../models/Warehouse.js';
import Location from '../models/Location.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all products with filters & pagination
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req, res) => {
    const { search, category, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    if (category && category !== 'all') {
        query.category = category;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    if (status === 'out') {
        query.stockQuantity = 0;
    } else if (status === 'low') {
        query.$expr = { $lte: ['$stockQuantity', '$reorderThreshold'] };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
        .populate('category', 'name')
        .populate('stockPerLocation.location', 'name code')
        .populate('stockPerLocation.warehouse', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        data: products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, isActive: true })
        .populate('category', 'name description')
        .populate('stockPerLocation.location', 'name code type')
        .populate('stockPerLocation.warehouse', 'name code address')
        .populate('createdBy', 'name email');

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private
export const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        sku,
        category,
        unitOfMeasure,
        initialStock,
        reorderThreshold,
        description,
        warehouse,
        location
    } = req.body;

    if (!name || !sku || !unitOfMeasure) {
        return res.status(400).json({
            success: false,
            message: 'Please provide name, SKU, and unit of measure'
        });
    }

    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
        return res.status(400).json({
            success: false,
            message: `Product with SKU "${sku.toUpperCase()}" already exists`
        });
    }

    let imageUrl = '';
    if (req.file) {
        if (req.file.path) {
            imageUrl = req.file.path;
        } else if (req.file.buffer) {
            const base64 = req.file.buffer.toString('base64');
            imageUrl = `data:${req.file.mimetype};base64,${base64}`;
        }
    }

    const stockPerLocation = [];
    const initQty = Number(initialStock) || 0;

    if (initQty > 0 && location && warehouse) {
        stockPerLocation.push({
            location,
            warehouse,
            quantity: initQty
        });
    }

    const product = await Product.create({
        name,
        sku: sku.toUpperCase(),
        category: category || null,
        unitOfMeasure,
        description: description || '',
        image: imageUrl,
        stockQuantity: initQty,
        stockPerLocation,
        reorderThreshold: Number(reorderThreshold) || 10,
        createdBy: req.user._id
    });

    // If initial stock was provided, create initial stock move in ledger
    if (initQty > 0) {
        await StockMove.create({
            reference: 'INIT-STOCK',
            operationType: 'adjustment',
            product: product._id,
            productName: product.name,
            productSku: product.sku,
            fromLocation: null,
            fromWarehouse: null,
            toLocation: location || null,
            toWarehouse: warehouse || null,
            quantity: initQty,
            quantityBefore: 0,
            quantityAfter: initQty,
            unitOfMeasure,
            performedBy: req.user._id
        });
    }

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
    });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, sku, category, unitOfMeasure, reorderThreshold, description } = req.body;

    if (sku && sku.toUpperCase() !== product.sku) {
        const existing = await Product.findOne({ sku: sku.toUpperCase() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Product with SKU "${sku.toUpperCase()}" already exists`
            });
        }
        product.sku = sku.toUpperCase();
    }

    if (name) product.name = name;
    if (category !== undefined) product.category = category || null;
    if (unitOfMeasure) product.unitOfMeasure = unitOfMeasure;
    if (reorderThreshold !== undefined) product.reorderThreshold = Number(reorderThreshold);
    if (description !== undefined) product.description = description;

    if (req.file) {
        if (req.file.path) {
            product.image = req.file.path;
        } else if (req.file.buffer) {
            const base64 = req.file.buffer.toString('base64');
            product.image = `data:${req.file.mimetype};base64,${base64}`;
        }
    }

    const updatedProduct = await product.save();

    res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
    });
});

// @desc    Soft delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
    });
});

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Private
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
        success: true,
        data: categories
    });
});

// @desc    Create category
// @route   POST /api/products/categories
// @access  Private
export const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Please provide category name' });
    }

    const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) {
        return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({ name, description: description || '' });

    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
    });
});
