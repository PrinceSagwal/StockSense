import Product from '../models/Product.js';
import Receipt from '../models/Receipt.js';
import DeliveryOrder from '../models/DeliveryOrder.js';
import InternalTransfer from '../models/InternalTransfer.js';
import StockMove from '../models/StockMove.js';
import Category from '../models/Category.js';
import Warehouse from '../models/Warehouse.js';
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

// ─── MANAGER-SPECIFIC ENDPOINTS ──────────────────────────────────────

// @desc    Get inventory valuation breakdown (stock distribution per category as pie/bar)
// @route   GET /api/dashboard/manager/inventory-valuation
// @access  Private (inventory_manager)
export const getInventoryValuation = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true }).select('name _id');
    const catMap = {};
    categories.forEach((c) => { catMap[c._id.toString()] = c.name; });

    const aggregation = await Product.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$category',
                totalStock: { $sum: '$stockQuantity' },
                productCount: { $sum: 1 },
                avgStock: { $avg: '$stockQuantity' }
            }
        },
        { $sort: { totalStock: -1 } }
    ]);

    const data = aggregation.map((item) => ({
        category: item._id ? catMap[item._id.toString()] || 'Uncategorized' : 'Uncategorized',
        totalStock: item.totalStock,
        productCount: item.productCount,
        avgStock: Math.round(item.avgStock)
    }));

    res.status(200).json({ success: true, data });
});

// @desc    Get operations breakdown (receipts, deliveries, transfers by status)
// @route   GET /api/dashboard/manager/operations-breakdown
// @access  Private (inventory_manager)
export const getOperationsBreakdown = asyncHandler(async (req, res) => {
    const [receiptStats, deliveryStats, transferStats] = await Promise.all([
        Receipt.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        DeliveryOrder.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        InternalTransfer.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
    ]);

    const formatStats = (stats) => {
        const result = { draft: 0, waiting: 0, ready: 0, done: 0, canceled: 0 };
        stats.forEach((s) => { result[s._id] = s.count; });
        return result;
    };

    res.status(200).json({
        success: true,
        data: {
            receipts: formatStats(receiptStats),
            deliveries: formatStats(deliveryStats),
            transfers: formatStats(transferStats)
        }
    });
});

// @desc    Get warehouse stock distribution
// @route   GET /api/dashboard/manager/warehouse-distribution
// @access  Private (inventory_manager)
export const getWarehouseDistribution = asyncHandler(async (req, res) => {
    const warehouses = await Warehouse.find({ isActive: true }).select('name code');

    const distribution = await Product.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$stockPerLocation' },
        {
            $group: {
                _id: '$stockPerLocation.warehouse',
                totalQuantity: { $sum: '$stockPerLocation.quantity' },
                productCount: { $addToSet: '$_id' }
            }
        },
        {
            $project: {
                _id: 1,
                totalQuantity: 1,
                productCount: { $size: '$productCount' }
            }
        }
    ]);

    const whMap = {};
    warehouses.forEach((w) => { whMap[w._id.toString()] = { name: w.name, code: w.code }; });

    const data = distribution.map((d) => ({
        warehouse: d._id ? whMap[d._id.toString()]?.name || 'Unknown' : 'Unknown',
        code: d._id ? whMap[d._id.toString()]?.code || '?' : '?',
        totalQuantity: d.totalQuantity,
        productCount: d.productCount
    }));

    res.status(200).json({ success: true, data });
});

// @desc    Get stock health overview (healthy, low, out-of-stock counts for donut)
// @route   GET /api/dashboard/manager/stock-health
// @access  Private (inventory_manager)
export const getStockHealth = asyncHandler(async (req, res) => {
    const [healthy, low, outOfStock, total] = await Promise.all([
        Product.countDocuments({
            isActive: true,
            stockQuantity: { $gt: 0 },
            $expr: { $gt: ['$stockQuantity', '$reorderThreshold'] }
        }),
        Product.countDocuments({
            isActive: true,
            stockQuantity: { $gt: 0 },
            $expr: { $lte: ['$stockQuantity', '$reorderThreshold'] }
        }),
        Product.countDocuments({ isActive: true, stockQuantity: 0 }),
        Product.countDocuments({ isActive: true })
    ]);

    res.status(200).json({
        success: true,
        data: { healthy, low, outOfStock, total }
    });
});

// ─── STAFF-SPECIFIC ENDPOINTS ────────────────────────────────────────

// @desc    Get pending task queues for warehouse staff
// @route   GET /api/dashboard/staff/task-queue
// @access  Private
export const getStaffTaskQueue = asyncHandler(async (req, res) => {
    const [
        pendingReceipts,
        readyReceipts,
        pendingDeliveries,
        readyDeliveries,
        pendingTransfers,
        readyTransfers
    ] = await Promise.all([
        Receipt.countDocuments({ status: { $in: ['draft', 'waiting'] } }),
        Receipt.countDocuments({ status: 'ready' }),
        DeliveryOrder.countDocuments({ status: { $in: ['draft', 'waiting'] } }),
        DeliveryOrder.countDocuments({ status: 'ready' }),
        InternalTransfer.countDocuments({ status: { $in: ['draft', 'waiting'] } }),
        InternalTransfer.countDocuments({ status: 'ready' })
    ]);

    res.status(200).json({
        success: true,
        data: {
            receipts: { pending: pendingReceipts, ready: readyReceipts },
            deliveries: { pending: pendingDeliveries, ready: readyDeliveries },
            transfers: { pending: pendingTransfers, ready: readyTransfers }
        }
    });
});

// @desc    Get daily activity (stock moves grouped by operation type for last 7 days)
// @route   GET /api/dashboard/staff/daily-activity
// @access  Private
export const getStaffDailyActivity = asyncHandler(async (req, res) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activity = await StockMove.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    type: '$operationType'
                },
                count: { $sum: 1 },
                totalQty: { $sum: { $abs: '$quantity' } }
            }
        },
        { $sort: { '_id.date': 1 } }
    ]);

    // Build a 7-day array
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    const result = days.map((day) => {
        const dayData = { date: day, receipt: 0, delivery: 0, transfer: 0, adjustment: 0 };
        activity.forEach((a) => {
            if (a._id.date === day) {
                dayData[a._id.type] = a.count;
            }
        });
        return dayData;
    });

    res.status(200).json({ success: true, data: result });
});

// @desc    Get recent tasks assigned/completed by current user
// @route   GET /api/dashboard/staff/recent-tasks
// @access  Private
export const getStaffRecentTasks = asyncHandler(async (req, res) => {
    const [recentReceipts, recentDeliveries, recentTransfers] = await Promise.all([
        Receipt.find({ status: { $in: ['draft', 'waiting', 'ready'] } })
            .populate('destinationWarehouse', 'name')
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('reference supplier status updatedAt'),
        DeliveryOrder.find({ status: { $in: ['draft', 'waiting', 'ready'] } })
            .populate('sourceWarehouse', 'name')
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('reference customer status updatedAt'),
        InternalTransfer.find({ status: { $in: ['draft', 'waiting', 'ready'] } })
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('reference status updatedAt')
    ]);

    res.status(200).json({
        success: true,
        data: {
            receipts: recentReceipts,
            deliveries: recentDeliveries,
            transfers: recentTransfers
        }
    });
});

// @desc    Get operation type breakdown for staff (pie chart)
// @route   GET /api/dashboard/staff/operation-breakdown
// @access  Private
export const getStaffOperationBreakdown = asyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const breakdown = await StockMove.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: '$operationType',
                count: { $sum: 1 },
                totalQty: { $sum: { $abs: '$quantity' } }
            }
        }
    ]);

    const data = breakdown.map((b) => ({
        type: b._id,
        count: b.count,
        totalQty: b.totalQty
    }));

    res.status(200).json({ success: true, data });
});
