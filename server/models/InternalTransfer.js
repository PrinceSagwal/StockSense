import mongoose from 'mongoose';

const transferLineSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.001, 'Quantity must be greater than 0']
    },
    unitOfMeasure: {
      type: String
    }
  },
  { _id: true }
);

const internalTransferSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      unique: true
    },
    status: {
      type: String,
      enum: ['draft', 'waiting', 'ready', 'done', 'canceled'],
      default: 'draft'
    },
    sourceWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    sourceLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    destinationWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    destinationLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    lines: [transferLineSchema],
    scheduledDate: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    validatedAt: {
      type: Date,
      default: null
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

internalTransferSchema.pre('save', async function (next) {
  if (!this.reference) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('InternalTransfer').countDocuments();
    this.reference = `INT-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const InternalTransfer = mongoose.model('InternalTransfer', internalTransferSchema);
export default InternalTransfer;
