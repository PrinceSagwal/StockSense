import express from 'express';
import {
    getAdjustments,
    createAdjustment
} from '../controllers/adjustmentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAdjustments);
router.post('/', createAdjustment);

export default router;
