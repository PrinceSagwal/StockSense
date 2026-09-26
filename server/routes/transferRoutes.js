import express from 'express';
import {
    getTransfers,
    getTransferById,
    createTransfer,
    validateTransfer,
    cancelTransfer
} from '../controllers/transferController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTransfers);
router.get('/:id', getTransferById);
router.post('/', createTransfer);
router.post('/:id/validate', validateTransfer);
router.post('/:id/cancel', cancelTransfer);

export default router;
