import InternalTransfer from '../models/InternalTransfer.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validateTransferStock } from '../utils/stockEngine.js';

// @desc    Get all internal transfers with filters & pagination
// @route   GET /api/transfers
// @access  Private
export const getTransfers = asyncHandler(async (req, res) => {
    const { status, sourceWarehouse, destinationWarehouse } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (status && status !== 'all') {
        query.status = status;
    }

    if (sourceWarehouse) {
        query.sourceWarehouse = sourceWarehouse;
    }

    if (destinationWarehouse) {
        query.destinationWarehouse = destinationWarehouse;
    }

    const total = await InternalTransfer.countDocuments(query);
    const transfers = await InternalTransfer.find(query)
        .populate('sourceWarehouse', 'name code')
        .populate('sourceLocation', 'name code')
        .populate('destinationWarehouse', 'name code')
        .populate('destinationLocation', 'name code')
        .populate('lines.product', 'name sku unitOfMeasure stockQuantity')
        .populate('createdBy', 'name')
        .populate('validatedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        data: transfers,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get single internal transfer by ID
// @route   GET /api/transfers/:id
// @access  Private
export const getTransferById = asyncHandler(async (req, res) => {
    const transfer = await InternalTransfer.findById(req.params.id)
        .populate('sourceWarehouse', 'name code address')
        .populate('sourceLocation', 'name code type')
        .populate('destinationWarehouse', 'name code address')
        .populate('destinationLocation', 'name code type')
        .populate('lines.product', 'name sku unitOfMeasure stockQuantity stockPerLocation')
        .populate('createdBy', 'name email')
        .populate('validatedBy', 'name email');

    if (!transfer) {
        return res.status(404).json({ success: false, message: 'Transfer not found' });
    }

    res.status(200).json({
        success: true,
        data: transfer
    });
});

// @desc    Create new internal transfer (draft)
// @route   POST /api/transfers
// @access  Private
export const createTransfer = asyncHandler(async (req, res) => {
    const {
        sourceWarehouse,
        sourceLocation,
        destinationWarehouse,
        destinationLocation,
        scheduledDate,
        lines,
        notes,
        status
    } = req.body;

    if (!sourceWarehouse || !sourceLocation || !destinationWarehouse || !destinationLocation) {
        return res.status(400).json({
            success: false,
            message: 'Please provide source and destination warehouses and locations'
        });
    }

    if (sourceLocation.toString() === destinationLocation.toString()) {
        return res.status(400).json({
            success: false,
            message: 'Source location and destination location must be different'
        });
    }

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Transfer must have at least one product line item'
        });
    }

    const transfer = await InternalTransfer.create({
        sourceWarehouse,
        sourceLocation,
        destinationWarehouse,
        destinationLocation,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        lines: lines.map((l) => ({
            product: l.product,
            quantity: Number(l.quantity) || 1,
            unitOfMeasure: l.unitOfMeasure || 'pcs'
        })),
        notes: notes || '',
        status: status || 'draft',
        createdBy: req.user._id
    });

    const io = req.app.get('io');
    if (io && transfer.scheduledDate) {
        io.emit('transfer:scheduled', {
            transferId: transfer._id.toString(),
            reference: transfer.reference,
            scheduledDate: transfer.scheduledDate
        });
    }

    const populated = await InternalTransfer.findById(transfer._id)
        .populate('sourceWarehouse', 'name code')
        .populate('sourceLocation', 'name code')
        .populate('destinationWarehouse', 'name code')
        .populate('destinationLocation', 'name code')
        .populate('lines.product', 'name sku unitOfMeasure');

    res.status(201).json({
        success: true,
        message: 'Transfer order created successfully',
        data: populated
    });
});

// @desc    Validate transfer -> move stock between locations
// @route   POST /api/transfers/:id/validate
// @access  Private
export const validateTransfer = asyncHandler(async (req, res) => {
    const transfer = await InternalTransfer.findById(req.params.id);

    if (!transfer) {
        return res.status(404).json({ success: false, message: 'Transfer not found' });
    }

    if (transfer.status === 'done') {
        return res.status(400).json({ success: false, message: 'Transfer is already completed' });
    }

    if (transfer.status === 'canceled') {
        return res.status(400).json({ success: false, message: 'Cannot validate a canceled transfer' });
    }

    const io = req.app.get('io');
    await validateTransferStock(transfer, req.user, io);

    transfer.status = 'done';
    transfer.validatedAt = new Date();
    transfer.validatedBy = req.user._id;
    await transfer.save();

    const validated = await InternalTransfer.findById(transfer._id)
        .populate('sourceWarehouse', 'name code')
        .populate('sourceLocation', 'name code')
        .populate('destinationWarehouse', 'name code')
        .populate('destinationLocation', 'name code')
        .populate('lines.product', 'name sku unitOfMeasure stockQuantity')
        .populate('validatedBy', 'name');

    res.status(200).json({
        success: true,
        message: 'Transfer validated successfully. Stock moved to destination location.',
        data: validated
    });
});

// @desc    Cancel transfer
// @route   POST /api/transfers/:id/cancel
// @access  Private
export const cancelTransfer = asyncHandler(async (req, res) => {
    const transfer = await InternalTransfer.findById(req.params.id);

    if (!transfer) {
        return res.status(404).json({ success: false, message: 'Transfer not found' });
    }

    if (transfer.status === 'done') {
        return res.status(400).json({
            success: false,
            message: 'Cannot cancel a completed transfer.'
        });
    }

    transfer.status = 'canceled';
    await transfer.save();

    res.status(200).json({
        success: true,
        message: 'Transfer canceled successfully',
        data: transfer
    });
});
