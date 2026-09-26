import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide location name'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Please provide location code'],
      trim: true
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Location must belong to a warehouse']
    },
    type: {
      type: String,
      enum: ['rack', 'shelf', 'zone', 'floor', 'bin', 'other'],
      default: 'other'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

locationSchema.index({ code: 1, warehouse: 1 }, { unique: true });

const Location = mongoose.model('Location', locationSchema);
export default Location;
