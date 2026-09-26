import StockMove from '../models/StockMove.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get stock move history / ledger with filters & pagination
// @route   GET /api/moves
// @access  Private
export const getMoves = asyncHandler(async (req, res) => {
    const { product, type, warehouse, dateFrom, dateTo } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (product) {
        query.$or = [
            { product: product.match(/^[0-9a-fA-F]{24}$/) ? product : null },
            { productName: { $regex: product, $options: 'i' } },
            { productSku: { $regex: product, $options: 'i' } },
            { reference: { $regex: product, $options: 'i' } }
        ].filter((cond) => cond.product !== null || !('product' in cond));
    }

    if (type && type !== 'all') {
        query.operationType = type;
    }

    if (warehouse) {
        query.$or = [
            { fromWarehouse: warehouse },
            { toWarehouse: warehouse }
        ];
    }

    if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) {
            const d = new Date(dateTo);
            d.setHours(23, 59, 59, 999);
            query.createdAt.$lte = d;
        }
    }

    const total = await StockMove.countDocuments(query);
    const moves = await StockMove.find(query)
        .populate('fromLocation', 'name code')
        .populate('fromWarehouse', 'name code')
        .populate('toLocation', 'name code')
        .populate('toWarehouse', 'name code')
        .populate('performedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        data: moves,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});
