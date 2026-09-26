import mongoose from 'mongoose';

const stockAdjustmentSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      unique: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    systemQuantity: {
      type: Number,
      required: true
    },
    countedQuantity: {
      type: Number,
      required: true
    },
    difference: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      default: 'Physical count'
    },
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    adjustedAt: {
      type: Date,
      default: Date.now
    }
  }
);

stockAdjustmentSchema.pre('save', async function (next) {
  if (!this.reference) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('StockAdjustment').countDocuments();
    this.reference = `ADJ-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const StockAdjustment = mongoose.model('StockAdjustment', stockAdjustmentSchema);
export default StockAdjustment;
