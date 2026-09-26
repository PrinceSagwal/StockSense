import express from 'express';
import {
    getWarehouses,
    createWarehouse,
    updateWarehouse,
    getWarehouseLocations,
    addLocation,
    updateLocation
} from '../controllers/warehouseController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getWarehouses);
router.post('/', restrictTo('inventory_manager'), createWarehouse);
router.put('/:id', restrictTo('inventory_manager'), updateWarehouse);

router.get('/:id/locations', getWarehouseLocations);
router.post('/:id/locations', restrictTo('inventory_manager'), addLocation);
router.put('/:id/locations/:locationId', restrictTo('inventory_manager'), updateLocation);

export default router;
