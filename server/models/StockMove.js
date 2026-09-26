import mongoose from 'mongoose';

const stockMoveSchema = new mongoose.Schema(
  {
    reference: {
      type: String
    },
    operationType: {
      type: String,
      enum: ['receipt', 'delivery', 'transfer', 'adjustment'],
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productSku: {
      type: String,
      required: true
    },
    fromLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null
    },
    fromWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null
    },
    toLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null
    },
    toWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null
    },
    quantity: {
      type: Number,
      required: true
    },
    quantityBefore: {
      type: Number,
      required: true
    },
    quantityAfter: {
      type: Number,
      required: true
    },
    unitOfMeasure: {
      type: String,
      default: 'pcs'
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

stockMoveSchema.index({ createdAt: -1 });
stockMoveSchema.index({ product: 1, createdAt: -1 });
stockMoveSchema.index({ operationType: 1 });

const StockMove = mongoose.model('StockMove', stockMoveSchema);
export default StockMove;
