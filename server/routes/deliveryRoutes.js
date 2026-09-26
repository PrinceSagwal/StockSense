import express from 'express';
import {
    getDeliveries,
    getDeliveryById,
    createDelivery,
    updateDelivery,
    validateDelivery,
    cancelDelivery
} from '../controllers/deliveryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDeliveries);
router.get('/:id', getDeliveryById);
router.post('/', createDelivery);
router.put('/:id', updateDelivery);
router.post('/:id/validate', validateDelivery);
router.post('/:id/cancel', cancelDelivery);

export default router;
