import Warehouse from '../models/Warehouse.js';
import Location from '../models/Location.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all warehouses with their locations
// @route   GET /api/warehouses
// @access  Private
export const getWarehouses = asyncHandler(async (req, res) => {
    const warehouses = await Warehouse.find({ isActive: true }).sort({ name: 1 });
    const warehouseIds = warehouses.map((w) => w._id);

    const locations = await Location.find({
        warehouse: { $in: warehouseIds },
        isActive: true
    }).sort({ code: 1 });

    // Attach locations to their respective warehouse
    const warehousesWithLocations = warehouses.map((wh) => {
        const whObj = wh.toObject();
        whObj.locations = locations.filter(
            (loc) => loc.warehouse.toString() === wh._id.toString()
        );
        return whObj;
    });

    res.status(200).json({
        success: true,
        data: warehousesWithLocations
    });
});

// @desc    Create warehouse
// @route   POST /api/warehouses
// @access  Private
export const createWarehouse = asyncHandler(async (req, res) => {
    const { name, code, address } = req.body;

    if (!name || !code) {
        return res.status(400).json({ success: false, message: 'Please provide warehouse name and code' });
    }

    const existing = await Warehouse.findOne({ code: code.toUpperCase() });
    if (existing) {
        return res.status(400).json({
            success: false,
            message: `Warehouse with code "${code.toUpperCase()}" already exists`
        });
    }

    const warehouse = await Warehouse.create({
        name,
        code: code.toUpperCase(),
        address: address || ''
    });

    // Automatically create a default general location for convenience
    const defaultLocation = await Location.create({
        name: 'General Storage',
        code: `${warehouse.code}-GEN`,
        warehouse: warehouse._id,
        type: 'floor'
    });

    const whObj = warehouse.toObject();
    whObj.locations = [defaultLocation];

    res.status(201).json({
        success: true,
        message: 'Warehouse created successfully',
        data: whObj
    });
});

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
// @access  Private
export const updateWarehouse = asyncHandler(async (req, res) => {
    const { name, address } = req.body;
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    if (name) warehouse.name = name;
    if (address !== undefined) warehouse.address = address;

    const updatedWarehouse = await warehouse.save();

    res.status(200).json({
        success: true,
        message: 'Warehouse updated successfully',
        data: updatedWarehouse
    });
});

// @desc    Get locations for a specific warehouse
// @route   GET /api/warehouses/:id/locations
// @access  Private
export const getWarehouseLocations = asyncHandler(async (req, res) => {
    const locations = await Location.find({
        warehouse: req.params.id,
        isActive: true
    }).sort({ code: 1 });

    res.status(200).json({
        success: true,
        data: locations
    });
});

// @desc    Add location to warehouse
// @route   POST /api/warehouses/:id/locations
// @access  Private
export const addLocation = asyncHandler(async (req, res) => {
    const { name, code, type } = req.body;
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    if (!name || !code) {
        return res.status(400).json({ success: false, message: 'Please provide location name and code' });
    }

    const existing = await Location.findOne({
        code: code.toUpperCase(),
        warehouse: warehouse._id
    });

    if (existing) {
        return res.status(400).json({
            success: false,
            message: `Location with code "${code.toUpperCase()}" already exists in this warehouse`
        });
    }

    const location = await Location.create({
        name,
        code: code.toUpperCase(),
        warehouse: warehouse._id,
        type: type || 'rack'
    });

    res.status(201).json({
        success: true,
        message: 'Location added successfully',
        data: location
    });
});

// @desc    Update location
// @route   PUT /api/warehouses/:id/locations/:locationId
// @access  Private
export const updateLocation = asyncHandler(async (req, res) => {
    const { name, code, type } = req.body;
    const location = await Location.findOne({
        _id: req.params.locationId,
        warehouse: req.params.id
    });

    if (!location) {
        return res.status(404).json({ success: false, message: 'Location not found' });
    }

    if (name) location.name = name;
    if (code) location.code = code.toUpperCase();
    if (type) location.type = type;

    const updatedLocation = await location.save();

    res.status(200).json({
        success: true,
        message: 'Location updated successfully',
        data: updatedLocation
    });
});
