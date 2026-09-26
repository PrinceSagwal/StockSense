import express from 'express';
import {
    getKPIs,
    getRecentMoves,
    getStockChart,
    getLowStockProducts
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/kpis', getKPIs);
router.get('/recent-moves', getRecentMoves);
router.get('/stock-chart', getStockChart);
router.get('/low-stock', getLowStockProducts);

export default router;
