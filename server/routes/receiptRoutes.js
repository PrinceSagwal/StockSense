import express from 'express';
import {
    getReceipts,
    getReceiptById,
    createReceipt,
    updateReceipt,
    validateReceipt,
    cancelReceipt
} from '../controllers/receiptController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getReceipts);
router.get('/:id', getReceiptById);
router.post('/', createReceipt);
router.put('/:id', updateReceipt);
router.post('/:id/validate', validateReceipt);
router.post('/:id/cancel', cancelReceipt);

export default router;
