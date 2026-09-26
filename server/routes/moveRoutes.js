import express from 'express';
import { getMoves } from '../controllers/moveController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMoves);

export default router;
