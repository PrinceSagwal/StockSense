import DeliveryOrder from '../models/DeliveryOrder.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validateDeliveryStock } from '../utils/stockEngine.js';

// @desc    Get all delivery orders with filters & pagination
// @route   GET /api/deliveries
// @access  Private
export const getDeliveries = asyncHandler(async (req, res) => {
    const { status, customer, dateFrom, dateTo } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (status && status !== 'all') {
        query.status = status;
    }

    if (customer) {
        query.customer = { $regex: customer, $options: 'i' };
    }

    if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) {
            const d = new Date(dateTo);
            d.setHours(23, 59, 59, 999);
            query.createdAt.$lte = d;
        }
    }

    const total = await DeliveryOrder.countDocuments(query);
    const deliveries = await DeliveryOrder.find(query)
        .populate('sourceWarehouse', 'name code')
        .populate('sourceLocation', 'name code')
        .populate('lines.product', 'name sku unitOfMeasure stockQuantity')
        .populate('createdBy', 'name')
        .populate('validatedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        data: deliveries,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get single delivery order by ID
// @route   GET /api/deliveries/:id
// @access  Private
export const getDeliveryById = asyncHandler(async (req, res) => {
    const delivery = await DeliveryOrder.findById(req.params.id)
        .populate('sourceWarehouse', 'name code address')
        .populate('sourceLocation', 'name code type')
        .populate('lines.product', 'name sku unitOfMeasure stockQuantity stockPerLocation')
        .populate('createdBy', 'name email')
        .populate('validatedBy', 'name email');

    if (!delivery) {
        return res.status(404).json({ success: false, message: 'Delivery order not found' });
    }

    res.status(200).json({
        success: true,
        data: delivery
    });
});

// @desc    Create new delivery order (draft)
// @route   POST /api/deliveries
// @access  Private
export const createDelivery = asyncHandler(async (req, res) => {
    const { customer, sourceWarehouse, sourceLocation, lines, notes, status } = req.body;

    if (!customer || !sourceWarehouse || !sourceLocation) {
        return res.status(400).json({
            success: false,
            message: 'Please provide customer, source warehouse, and source location'
        });
    }

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Delivery order must have at least one product line item'
        });
    }

    const delivery = await DeliveryOrder.create({
        customer,
        sourceWarehouse,
        sourceLocation,
        lines: lines.map((l) => ({
            product: l.product,
            requestedQty: Number(l.requestedQty) || 1,
            deliveredQty: Number(l.deliveredQty) || 0,
            unitOfMeasure: l.unitOfMeasure || 'pcs'
        })),
        notes: notes || '',
        status: status || 'draft',
        createdBy: req.user._id
    });

    const populated = await DeliveryOrder.findById(delivery._id)
        .populate('sourceWarehouse', 'name code')
        .populate('sourceLocation', 'name code')
        .populate('lines.product', 'name sku unitOfMeasure');

    res.status(201).json({
        success: true,
        message: 'Delivery order created successfully',
        data: populated
    });
});

// @desc    Update delivery order (draft or waiting only)
// @route   PUT /api/deliveries/:id
// @access  Private
export const updateDelivery = asyncHandler(async (req, res) => {
    const delivery = await DeliveryOrder.findById(req.params.id);

    if (!delivery) {
        return res.status(404).json({ success: false, message: 'Delivery order not found' });
    }

    if (['done', 'canceled'].includes(delivery.status)) {
        return res.status(400).json({
            success: false,
            message: `Cannot update a delivery order that is already ${delivery.status}`
        });
    }

    const { customer, sourceWarehouse, sourceLocation, lines, notes, status } = req.body;

    if (customer) delivery.customer = customer;
    if (sourceWarehouse) delivery.sourceWarehouse = sourceWarehouse;
    if (sourceLocation) delivery.sourceLocation = sourceLocation;
    if (notes !== undefined) delivery.notes = notes;
    if (status && ['draft', 'waiting', 'ready'].includes(status)) delivery.status = status;

    if (lines && Array.isArray(lines)) {
        delivery.lines = lines.map((l) => ({
            product: l.product,
            requestedQty: Number(l.requestedQty) || 1,
            deliveredQty: Number(l.deliveredQty) || 0,
            unitOfMeasure: l.unitOfMeasure || 'pcs'
        }));
    }

    await delivery.save();

    const updated = await DeliveryOrder.findById(delivery._id)
        .populate('sourceWarehouse', 'name code')
        .populate('sourceLocation', 'name code')
        .populate('lines.product', 'name sku unitOfMeasure');

    res.status(200).json({
        success: true,
        message: 'Delivery order updated successfully',
        data: updated
    });
});

// @desc    Validate delivery order -> deduct stock & create ledger records
// @route   POST /api/deliveries/:id/validate
// @access  Private
export const validateDelivery = asyncHandler(async (req, res) => {
    const delivery = await DeliveryOrder.findById(req.params.id);

    if (!delivery) {
        return res.status(404).json({ success: false, message: 'Delivery order not found' });
    }

    if (delivery.status === 'done') {
        return res.status(400).json({ success: false, message: 'Delivery order is already validated' });
    }

    if (delivery.status === 'canceled') {
        return res.status(400).json({ success: false, message: 'Cannot validate a canceled delivery order' });
    }

    // Set deliveredQty to requestedQty by default if not set
    delivery.lines.forEach((line) => {
        if (!line.deliveredQty || line.deliveredQty <= 0) {
            line.deliveredQty = line.requestedQty;
        }
    });

    const io = req.app.get('io');
    await validateDeliveryStock(delivery, req.user, io);

    delivery.status = 'done';
    delivery.validatedAt = new Date();
    delivery.validatedBy = req.user._id;
    await delivery.save();

    const validated = await DeliveryOrder.findById(delivery._id)
        .populate('sourceWarehouse', 'name code')
        .populate('sourceLocation', 'name code')
        .populate('lines.product', 'name sku unitOfMeasure stockQuantity')
        .populate('validatedBy', 'name');

    res.status(200).json({
        success: true,
        message: 'Delivery order validated successfully. Stock levels decreased.',
        data: validated
    });
});

// @desc    Cancel delivery order
// @route   POST /api/deliveries/:id/cancel
// @access  Private
export const cancelDelivery = asyncHandler(async (req, res) => {
    const delivery = await DeliveryOrder.findById(req.params.id);

    if (!delivery) {
        return res.status(404).json({ success: false, message: 'Delivery order not found' });
    }

    if (delivery.status === 'done') {
        return res.status(400).json({
            success: false,
            message: 'Cannot cancel a completed delivery order.'
        });
    }

    delivery.status = 'canceled';
    await delivery.save();

    res.status(200).json({
        success: true,
        message: 'Delivery order canceled successfully',
        data: delivery
    });
});
