import StockAdjustment from '../models/StockAdjustment.js';
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
    const { product, warehouse, location, countedQuantity, reason } = req.body;

    if (!product || !warehouse || !location || countedQuantity === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Please provide product, warehouse, location, and counted quantity'
        });
    }

    if (Number(countedQuantity) < 0) {
        return res.status(400).json({
            success: false,
            message: 'Counted quantity cannot be negative'
        });
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
