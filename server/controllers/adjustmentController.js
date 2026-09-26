import StockAdjustment from '../models/StockAdjustment.js';
import Product from '../models/Product.js';
import Warehouse from '../models/Warehouse.js';
import Location from '../models/Location.js';
import asyncHandler from '../utils/asyncHandler.js';
import { applyStockAdjustment } from '../utils/stockEngine.js';

// @desc    Get all stock adjustments with filters & pagination
// @route   GET /api/adjustments
// @access  Private
export const getAdjustments = asyncHandler(async (req, res) => {
    const { product, warehouse } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (product) {
        query.product = product;
    }

    if (warehouse) {
        query.warehouse = warehouse;
    }

    const total = await StockAdjustment.countDocuments(query);
    const adjustments = await StockAdjustment.find(query)
        .populate('product', 'name sku unitOfMeasure')
        .populate('warehouse', 'name code')
        .populate('location', 'name code')
        .populate('adjustedBy', 'name email')
        .sort({ adjustedAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        data: adjustments,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Create and apply physical stock adjustment immediately
// @route   POST /api/adjustments
// @access  Private
export const createAdjustment = asyncHandler(async (req, res) => {
    let { product, warehouse, location, countedQuantity, reason } = req.body;

    if (!product || countedQuantity === undefined || countedQuantity === null || isNaN(Number(countedQuantity))) {
        return res.status(400).json({
            success: false,
            message: 'Please provide target product and valid counted quantity'
        });
    }

    if (Number(countedQuantity) < 0) {
        return res.status(400).json({
            success: false,
            message: 'Counted quantity cannot be negative'
        });
    }

    const prodDoc = await Product.findById(product);
    if (!prodDoc) {
        return res.status(404).json({
            success: false,
            message: 'Target product not found'
        });
    }

    // Auto-resolve warehouse if not provided
    if (!warehouse) {
        if (prodDoc.stockPerLocation && prodDoc.stockPerLocation.length > 0) {
            warehouse = prodDoc.stockPerLocation[0].warehouse;
            location = location || prodDoc.stockPerLocation[0].location;
        } else {
            let defaultWh = await Warehouse.findOne({ isActive: true }).sort({ createdAt: 1 });
            if (!defaultWh) {
                defaultWh = await Warehouse.create({
                    name: 'Main Distribution Center',
                    code: 'WH-01'
                });
            }
            warehouse = defaultWh._id;
        }
    }

    // Auto-resolve location if not provided
    if (!location && warehouse) {
        const existingLocEntry = prodDoc.stockPerLocation?.find(
            (e) => e.warehouse?.toString() === warehouse.toString()
        );
        if (existingLocEntry?.location) {
            location = existingLocEntry.location;
        } else {
            let defaultLoc = await Location.findOne({ warehouse, isActive: true }).sort({ createdAt: 1 });
            if (!defaultLoc) {
                const whDoc = await Warehouse.findById(warehouse);
                defaultLoc = await Location.create({
                    name: 'General Floor Storage',
                    code: `${whDoc?.code || 'WH'}-GEN`,
                    warehouse,
                    type: 'floor'
                });
            }
            location = defaultLoc._id;
        }
    }

    const io = req.app.get('io');
    const adjustment = await applyStockAdjustment(
        {
            product,
            warehouse,
            location,
            countedQuantity: Number(countedQuantity),
            reason: reason || 'Physical inventory count'
        },
        req.user,
        io
    );

    const populated = await StockAdjustment.findById(adjustment._id)
        .populate('product', 'name sku unitOfMeasure stockQuantity')
        .populate('warehouse', 'name code')
        .populate('location', 'name code')
        .populate('adjustedBy', 'name');

    res.status(201).json({
        success: true,
        message: 'Stock adjustment applied and ledger updated successfully',
        data: populated
    });
});
