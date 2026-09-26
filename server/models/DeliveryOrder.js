import mongoose from 'mongoose';

const deliveryLineSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    requestedQty: {
      type: Number,
      required: true,
      min: [0.001, 'Quantity must be greater than 0']
    },
    deliveredQty: {
      type: Number,
      default: 0
    },
    unitOfMeasure: {
      type: String
    }
  },
  { _id: true }
);

const deliveryOrderSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      unique: true
    },
    customer: {
      type: String,
      required: [true, 'Please provide customer name'],
      trim: true
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
    lines: [deliveryLineSchema],
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

deliveryOrderSchema.pre('save', async function (next) {
  if (!this.reference) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('DeliveryOrder').countDocuments();
    this.reference = `DEL-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const DeliveryOrder = mongoose.model('DeliveryOrder', deliveryOrderSchema);
export default DeliveryOrder;
