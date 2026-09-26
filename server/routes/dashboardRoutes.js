import express from 'express';
import {
    getKPIs,
    getRecentMoves,
    getStockChart,
    getLowStockProducts,
    getInventoryValuation,
    getOperationsBreakdown,
    getWarehouseDistribution,
    getStockHealth,
    getStaffTaskQueue,
    getStaffDailyActivity,
    getStaffRecentTasks,
    getStaffOperationBreakdown
} from '../controllers/dashboardController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Shared endpoints
router.get('/kpis', getKPIs);
router.get('/recent-moves', getRecentMoves);
router.get('/stock-chart', getStockChart);
router.get('/low-stock', getLowStockProducts);

// Manager-specific endpoints
router.get('/manager/inventory-valuation', restrictTo('inventory_manager'), getInventoryValuation);
router.get('/manager/operations-breakdown', restrictTo('inventory_manager'), getOperationsBreakdown);
router.get('/manager/warehouse-distribution', restrictTo('inventory_manager'), getWarehouseDistribution);
router.get('/manager/stock-health', restrictTo('inventory_manager'), getStockHealth);

// Staff-specific endpoints
router.get('/staff/task-queue', getStaffTaskQueue);
router.get('/staff/daily-activity', getStaffDailyActivity);
router.get('/staff/recent-tasks', getStaffRecentTasks);
router.get('/staff/operation-breakdown', getStaffOperationBreakdown);

export default router;
