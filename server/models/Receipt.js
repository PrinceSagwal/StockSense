import mongoose from 'mongoose';

const receiptLineSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    expectedQty: {
      type: Number,
      required: true,
      min: [0.001, 'Quantity must be greater than 0']
    },
    receivedQty: {
      type: Number,
      default: 0
    },
    unitOfMeasure: {
      type: String
    }
  },
  { _id: true }
);

const receiptSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      unique: true
    },
    supplier: {
      type: String,
      required: [true, 'Please provide supplier name'],
      trim: true
    },
    status: {
      type: String,
      enum: ['draft', 'waiting', 'ready', 'done', 'canceled'],
      default: 'draft'
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
    lines: [receiptLineSchema],
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

receiptSchema.pre('save', async function (next) {
  if (!this.reference) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Receipt').countDocuments();
    this.reference = `REC-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const Receipt = mongoose.model('Receipt', receiptSchema);
export default Receipt;
