import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide warehouse name'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Please provide warehouse code'],
      unique: true,
      uppercase: true,
      trim: true
    },
    address: {
      type: String,
      default: ''
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

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
export default Warehouse;
