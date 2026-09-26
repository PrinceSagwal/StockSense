import Product from '../models/Product.js';
import Receipt from '../models/Receipt.js';
import DeliveryOrder from '../models/DeliveryOrder.js';
import InternalTransfer from '../models/InternalTransfer.js';
import StockMove from '../models/StockMove.js';
import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get dashboard KPIs
// @route   GET /api/dashboard/kpis
// @access  Private
export const getKPIs = asyncHandler(async (req, res) => {
    const [
        totalProducts,
        lowStockCount,
        outOfStockCount,
        pendingReceipts,
        pendingDeliveries,
        scheduledTransfers
    ] = await Promise.all([
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({
            isActive: true,
            stockQuantity: { $gt: 0 },
            $expr: { $lte: ['$stockQuantity', '$reorderThreshold'] }
        }),
        Product.countDocuments({ isActive: true, stockQuantity: 0 }),
        Receipt.countDocuments({ status: { $in: ['draft', 'waiting', 'ready'] } }),
        DeliveryOrder.countDocuments({ status: { $in: ['draft', 'waiting', 'ready'] } }),
        InternalTransfer.countDocuments({ status: { $in: ['draft', 'waiting', 'ready'] } })
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalProducts,
            lowStockCount,
            outOfStockCount,
            pendingReceipts,
            pendingDeliveries,
            scheduledTransfers
        }
    });
});

// @desc    Get recent 10 stock moves
// @route   GET /api/dashboard/recent-moves
// @access  Private
export const getRecentMoves = asyncHandler(async (req, res) => {
    const recentMoves = await StockMove.find()
        .populate('fromLocation', 'name code')
        .populate('toLocation', 'name code')
        .populate('performedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(10);

    res.status(200).json({
        success: true,
        data: recentMoves
    });
});

// @desc    Get stock aggregated by category for chart
// @route   GET /api/dashboard/stock-chart
// @access  Private
export const getStockChart = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true }).select('name _id');
    const catMap = {};
    categories.forEach((c) => {
        catMap[c._id.toString()] = c.name;
    });

    const aggregation = await Product.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$category',
                totalStock: { $sum: '$stockQuantity' },
                productCount: { $sum: 1 }
            }
        }
    ]);

    const stockChart = aggregation.map((item) => ({
        categoryName: item._id ? catMap[item._id.toString()] || 'Uncategorized' : 'Uncategorized',
        totalStock: item.totalStock,
        productCount: item.productCount
    }));

    res.status(200).json({
        success: true,
        data: stockChart
    });
});

// @desc    Get all products below threshold
// @route   GET /api/dashboard/low-stock
// @access  Private
export const getLowStockProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({
        isActive: true,
        $expr: { $lte: ['$stockQuantity', '$reorderThreshold'] }
    })
        .populate('category', 'name')
        .populate('stockPerLocation.warehouse', 'name code')
        .populate('stockPerLocation.location', 'name code')
        .sort({ stockQuantity: 1 })
        .limit(10);

    res.status(200).json({
        success: true,
        data: products
    });
});
