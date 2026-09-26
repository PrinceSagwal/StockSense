import Product from '../models/Product.js';
import StockMove from '../models/StockMove.js';
import StockAdjustment from '../models/StockAdjustment.js';
import { sendEmail, lowStockEmailTemplate } from './sendEmail.js';
import { sendSMS } from './sendSMS.js';

const checkAndEmitLowStock = async (product, io) => {
  if (product.stockQuantity <= product.reorderThreshold) {
    const alertData = {
      productId: product._id.toString(),
      name: product.name,
      sku: product.sku,
      quantity: product.stockQuantity,
      threshold: product.reorderThreshold,
      unitOfMeasure: product.unitOfMeasure
    };

    if (io) {
      io.emit('low_stock:alert', alertData);
    }

    // Non-blocking email & SMS alerts
    if (process.env.EMAIL_USER) {
      sendEmail({
        to: process.env.EMAIL_USER,
        subject: `⚠️ Low Stock Alert: ${product.name} (${product.sku})`,
        html: lowStockEmailTemplate(product)
      }).catch((err) => console.error('Low stock email error:', err.message));
    }
  }
};

export const validateReceiptStock = async (receipt, user, io) => {
  for (const line of receipt.lines) {
    const product = await Product.findById(line.product);
    if (!product) continue;

    const quantityBefore = product.stockQuantity;
    const receivedQty = Number(line.receivedQty) || 0;

    product.stockQuantity += receivedQty;

    const locIndex = product.stockPerLocation.findIndex(
      (e) => e.location?.toString() === receipt.destinationLocation?.toString()
    );

    if (locIndex >= 0) {
      product.stockPerLocation[locIndex].quantity += receivedQty;
    } else {
      product.stockPerLocation.push({
        location: receipt.destinationLocation,
        warehouse: receipt.destinationWarehouse,
        quantity: receivedQty
      });
    }

    await product.save();

    await StockMove.create({
      reference: receipt.reference,
      operationType: 'receipt',
      product: product._id,
      productName: product.name,
      productSku: product.sku,
      fromLocation: null,
      fromWarehouse: null,
      toLocation: receipt.destinationLocation,
      toWarehouse: receipt.destinationWarehouse,
      quantity: receivedQty,
      quantityBefore,
      quantityAfter: product.stockQuantity,
      unitOfMeasure: line.unitOfMeasure || product.unitOfMeasure,
      performedBy: user._id
    });

    await checkAndEmitLowStock(product, io);

    if (io) {
      io.emit('stock:updated', {
        productId: product._id.toString(),
        productName: product.name,
        newQuantity: product.stockQuantity
      });
    }
  }
};

export const validateDeliveryStock = async (delivery, user, io) => {
  // Pre-validate all stock lines before modifying
  for (const line of delivery.lines) {
    const product = await Product.findById(line.product);
    if (!product) {
      throw new Error(`Product not found`);
    }

    const deliveredQty = Number(line.deliveredQty) || 0;
    if (product.stockQuantity < deliveredQty) {
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stockQuantity} ${product.unitOfMeasure}, Requested: ${deliveredQty} ${product.unitOfMeasure}`
      );
    }

    const locEntry = product.stockPerLocation.find(
      (e) => e.location?.toString() === delivery.sourceLocation?.toString()
    );

    if (!locEntry || locEntry.quantity < deliveredQty) {
      const availableAtLoc = locEntry ? locEntry.quantity : 0;
      throw new Error(
        `Insufficient stock for "${product.name}" at selected location. Available: ${availableAtLoc}, Requested: ${deliveredQty}`
      );
    }
  }

  // Deduct stock and record moves
  for (const line of delivery.lines) {
    const product = await Product.findById(line.product);
    const deliveredQty = Number(line.deliveredQty) || 0;
    const quantityBefore = product.stockQuantity;

    product.stockQuantity -= deliveredQty;

    const locEntry = product.stockPerLocation.find(
      (e) => e.location?.toString() === delivery.sourceLocation?.toString()
    );
    if (locEntry) {
      locEntry.quantity -= deliveredQty;
    }

    await product.save();

    await StockMove.create({
      reference: delivery.reference,
      operationType: 'delivery',
      product: product._id,
      productName: product.name,
      productSku: product.sku,
      fromLocation: delivery.sourceLocation,
      fromWarehouse: delivery.sourceWarehouse,
      toLocation: null,
      toWarehouse: null,
      quantity: -deliveredQty,
      quantityBefore,
      quantityAfter: product.stockQuantity,
      unitOfMeasure: line.unitOfMeasure || product.unitOfMeasure,
      performedBy: user._id
    });

    await checkAndEmitLowStock(product, io);

    if (io) {
      io.emit('stock:updated', {
        productId: product._id.toString(),
        productName: product.name,
        newQuantity: product.stockQuantity
      });
    }
  }
};

export const validateTransferStock = async (transfer, user, io) => {
  // Pre-validate all transfer lines
  for (const line of transfer.lines) {
    const product = await Product.findById(line.product);
    if (!product) throw new Error('Product not found');

    const qty = Number(line.quantity) || 0;
    const sourceEntry = product.stockPerLocation.find(
      (e) => e.location?.toString() === transfer.sourceLocation?.toString()
    );

    if (!sourceEntry || sourceEntry.quantity < qty) {
      const available = sourceEntry ? sourceEntry.quantity : 0;
      throw new Error(
        `Insufficient stock for "${product.name}" at source location. Available: ${available}, Requested: ${qty}`
      );
    }
  }

  // Execute transfer
  for (const line of transfer.lines) {
    const product = await Product.findById(line.product);
    const qty = Number(line.quantity) || 0;

    const sourceEntry = product.stockPerLocation.find(
      (e) => e.location?.toString() === transfer.sourceLocation?.toString()
    );
    sourceEntry.quantity -= qty;

    const destIndex = product.stockPerLocation.findIndex(
      (e) => e.location?.toString() === transfer.destinationLocation?.toString()
    );

    if (destIndex >= 0) {
      product.stockPerLocation[destIndex].quantity += qty;
    } else {
      product.stockPerLocation.push({
        location: transfer.destinationLocation,
        warehouse: transfer.destinationWarehouse,
        quantity: qty
      });
    }

    await product.save();

    await StockMove.create({
      reference: transfer.reference,
      operationType: 'transfer',
      product: product._id,
      productName: product.name,
      productSku: product.sku,
      fromLocation: transfer.sourceLocation,
      fromWarehouse: transfer.sourceWarehouse,
      toLocation: transfer.destinationLocation,
      toWarehouse: transfer.destinationWarehouse,
      quantity: qty,
      quantityBefore: product.stockQuantity,
      quantityAfter: product.stockQuantity,
      unitOfMeasure: line.unitOfMeasure || product.unitOfMeasure,
      performedBy: user._id
    });

    if (io) {
      io.emit('stock:updated', {
        productId: product._id.toString(),
        productName: product.name,
        newQuantity: product.stockQuantity
      });
    }
  }
};

export const applyStockAdjustment = async (data, user, io) => {
  const product = await Product.findById(data.product);
  if (!product) throw new Error('Product not found');

  const countedQuantity = Number(data.countedQuantity);
  const locationEntry = product.stockPerLocation.find(
    (e) => e.location?.toString() === data.location?.toString()
  );

  const systemQuantity = product.stockQuantity;
  const locationSystemQty = locationEntry ? locationEntry.quantity : 0;
  const difference = countedQuantity - locationSystemQty;

  product.stockQuantity += difference;

  if (locationEntry) {
    locationEntry.quantity = countedQuantity;
  } else {
    product.stockPerLocation.push({
      location: data.location,
      warehouse: data.warehouse,
      quantity: countedQuantity
    });
  }

  await product.save();

  const adjustment = await StockAdjustment.create({
    product: product._id,
    warehouse: data.warehouse,
    location: data.location,
    systemQuantity: locationSystemQty,
    countedQuantity,
    difference,
    reason: data.reason || 'Physical count',
    adjustedBy: user._id,
    adjustedAt: new Date()
  });

  await StockMove.create({
    reference: adjustment.reference,
    operationType: 'adjustment',
    product: product._id,
    productName: product.name,
    productSku: product.sku,
    fromLocation: difference < 0 ? data.location : null,
    fromWarehouse: difference < 0 ? data.warehouse : null,
    toLocation: difference > 0 ? data.location : null,
    toWarehouse: difference > 0 ? data.warehouse : null,
    quantity: difference,
    quantityBefore: systemQuantity,
    quantityAfter: product.stockQuantity,
    unitOfMeasure: product.unitOfMeasure,
    performedBy: user._id
  });

  await checkAndEmitLowStock(product, io);

  if (io) {
    io.emit('stock:updated', {
      productId: product._id.toString(),
      productName: product.name,
      newQuantity: product.stockQuantity
    });
  }

  return adjustment;
};
