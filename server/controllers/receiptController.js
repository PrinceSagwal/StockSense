import Receipt from '../models/Receipt.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validateReceiptStock } from '../utils/stockEngine.js';

// @desc    Get all receipts with filters & pagination
// @route   GET /api/receipts
// @access  Private
export const getReceipts = asyncHandler(async (req, res) => {
    const { status, supplier, dateFrom, dateTo } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (status && status !== 'all') {
        query.status = status;
    }

    if (supplier) {
        query.supplier = { $regex: supplier, $options: 'i' };
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

    const total = await Receipt.countDocuments(query);
    const receipts = await Receipt.find(query)
        .populate('destinationWarehouse', 'name code')
        .populate('destinationLocation', 'name code')
        .populate('lines.product', 'name sku unitOfMeasure')
        .populate('createdBy', 'name')
        .populate('validatedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        data: receipts,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get single receipt by ID
// @route   GET /api/receipts/:id
// @access  Private
export const getReceiptById = asyncHandler(async (req, res) => {
    const receipt = await Receipt.findById(req.params.id)
        .populate('destinationWarehouse', 'name code address')
        .populate('destinationLocation', 'name code type')
        .populate('lines.product', 'name sku unitOfMeasure stockQuantity')
        .populate('createdBy', 'name email')
        .populate('validatedBy', 'name email');

    if (!receipt) {
        return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    res.status(200).json({
        success: true,
        data: receipt
    });
});

// @desc    Create new receipt (draft)
// @route   POST /api/receipts
// @access  Private
export const createReceipt = asyncHandler(async (req, res) => {
    const { supplier, destinationWarehouse, destinationLocation, lines, notes, status } = req.body;

    if (!supplier || !destinationWarehouse || !destinationLocation) {
        return res.status(400).json({
            success: false,
            message: 'Please provide supplier, warehouse, and location'
        });
    }

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Receipt must have at least one product line item'
        });
    }

    const receipt = await Receipt.create({
        supplier,
        destinationWarehouse,
        destinationLocation,
        lines: lines.map((l) => ({
            product: l.product,
            expectedQty: Number(l.expectedQty) || 1,
            receivedQty: Number(l.receivedQty) || 0,
            unitOfMeasure: l.unitOfMeasure || 'pcs'
        })),
        notes: notes || '',
        status: status || 'draft',
        createdBy: req.user._id
    });

    const populated = await Receipt.findById(receipt._id)
        .populate('destinationWarehouse', 'name code')
        .populate('destinationLocation', 'name code')
        .populate('lines.product', 'name sku unitOfMeasure');

    res.status(201).json({
        success: true,
        message: 'Receipt created successfully',
        data: populated
    });
});

// @desc    Update receipt (draft or waiting only)
// @route   PUT /api/receipts/:id
// @access  Private
export const updateReceipt = asyncHandler(async (req, res) => {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
        return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    if (['done', 'canceled'].includes(receipt.status)) {
        return res.status(400).json({
            success: false,
            message: `Cannot update a receipt that is already ${receipt.status}`
        });
    }

    const { supplier, destinationWarehouse, destinationLocation, lines, notes, status } = req.body;

    if (supplier) receipt.supplier = supplier;
    if (destinationWarehouse) receipt.destinationWarehouse = destinationWarehouse;
    if (destinationLocation) receipt.destinationLocation = destinationLocation;
    if (notes !== undefined) receipt.notes = notes;
    if (status && ['draft', 'waiting', 'ready'].includes(status)) receipt.status = status;

    if (lines && Array.isArray(lines)) {
        receipt.lines = lines.map((l) => ({
            product: l.product,
            expectedQty: Number(l.expectedQty) || 1,
            receivedQty: Number(l.receivedQty) || 0,
            unitOfMeasure: l.unitOfMeasure || 'pcs'
        }));
    }

    await receipt.save();

    const updated = await Receipt.findById(receipt._id)
        .populate('destinationWarehouse', 'name code')
        .populate('destinationLocation', 'name code')
        .populate('lines.product', 'name sku unitOfMeasure');

    res.status(200).json({
        success: true,
        message: 'Receipt updated successfully',
        data: updated
    });
});

// @desc    Validate receipt -> increment stock & create ledger records
// @route   POST /api/receipts/:id/validate
// @access  Private
export const validateReceipt = asyncHandler(async (req, res) => {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
        return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    if (receipt.status === 'done') {
        return res.status(400).json({ success: false, message: 'Receipt is already validated' });
    }

    if (receipt.status === 'canceled') {
        return res.status(400).json({ success: false, message: 'Cannot validate a canceled receipt' });
    }

    // If user provided received quantities in request body, update them
    if (req.body.lines && Array.isArray(req.body.lines)) {
        req.body.lines.forEach((line) => {
            const match = receipt.lines.find((l) => l.product.toString() === line.product.toString());
            if (match) {
                match.receivedQty = Number(line.receivedQty) !== undefined ? Number(line.receivedQty) : match.expectedQty;
            }
        });
    } else {
        // Default receivedQty to expectedQty if not explicitly set
        receipt.lines.forEach((line) => {
            if (!line.receivedQty || line.receivedQty <= 0) {
                line.receivedQty = line.expectedQty;
            }
        });
    }

    const io = req.app.get('io');
    await validateReceiptStock(receipt, req.user, io);

    receipt.status = 'done';
    receipt.validatedAt = new Date();
    receipt.validatedBy = req.user._id;
    await receipt.save();

    const validated = await Receipt.findById(receipt._id)
        .populate('destinationWarehouse', 'name code')
        .populate('destinationLocation', 'name code')
        .populate('lines.product', 'name sku unitOfMeasure stockQuantity')
        .populate('validatedBy', 'name');

    res.status(200).json({
        success: true,
        message: 'Receipt validated successfully. Stock levels increased.',
        data: validated
    });
});

// @desc    Cancel receipt
// @route   POST /api/receipts/:id/cancel
// @access  Private
export const cancelReceipt = asyncHandler(async (req, res) => {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
        return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    if (receipt.status === 'done') {
        return res.status(400).json({
            success: false,
            message: 'Cannot cancel a validated receipt. Use Stock Adjustment to correct stock.'
        });
    }

    receipt.status = 'canceled';
    await receipt.save();

    res.status(200).json({
        success: true,
        message: 'Receipt canceled successfully',
        data: receipt
    });
});
