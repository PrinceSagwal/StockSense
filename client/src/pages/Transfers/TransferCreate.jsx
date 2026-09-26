import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useTransferStore from '../../store/useTransferStore';
import useProductStore from '../../store/useProductStore';
import useWarehouseStore from '../../store/useWarehouseStore';
import { ArrowLeft, Plus, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const TransferCreate = () => {
  const navigate = useNavigate();
  const { createTransfer, isLoading } = useTransferStore();
  const { products, fetchProducts } = useProductStore();
  const { warehouses, fetchWarehouses } = useWarehouseStore();

  const [sourceWarehouse, setSourceWarehouse] = useState('');
  const [sourceLocation, setSourceLocation] = useState('');
  const [destinationWarehouse, setDestinationWarehouse] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([{ product: '', quantity: 1 }]);

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
  }, []);

  const sourceLocations =
    warehouses.find((w) => w._id === sourceWarehouse)?.locations || [];
  const destLocations =
    warehouses.find((w) => w._id === destinationWarehouse)?.locations || [];

  const handleAddLine = () => {
    setLines([...lines, { product: '', quantity: 1 }]);
  };

  const handleRemoveLine = (idx) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx, field, value) => {
    const updated = [...lines];
    updated[idx][field] = value;
    setLines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sourceWarehouse || !destinationWarehouse) {
      toast.error('Both source and destination warehouses are required');
      return;
    }
    if (sourceWarehouse === destinationWarehouse && sourceLocation === destinationLocation) {
      toast.error('Source and destination cannot be identical');
      return;
    }
    if (lines.some((l) => !l.product || l.quantity <= 0)) {
      toast.error('Please specify valid product and quantity for each line');
      return;
    }

    try {
      await createTransfer({
        sourceWarehouse,
        sourceLocation: sourceLocation || undefined,
        destinationWarehouse,
        destinationLocation: destinationLocation || undefined,
        scheduledDate: scheduledDate || undefined,
        notes,
        lines: lines.map((l) => ({
          product: l.product,
          quantity: Number(l.quantity)
        }))
      });
      navigate('/transfers');
    } catch (err) {
      // toast in store
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/transfers"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Schedule Internal Transfer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Relocate inventory between locations
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Source and Destination Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
          {/* Source */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Source Origin
            </h4>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Source Warehouse *
              </label>
              <select
                value={sourceWarehouse}
                onChange={(e) => {
                  setSourceWarehouse(e.target.value);
                  setSourceLocation('');
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Source Specific Location
              </label>
              <select
                value={sourceLocation}
                onChange={(e) => setSourceLocation(e.target.value)}
                disabled={!sourceWarehouse}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">Default Warehouse Storage</option>
                {sourceLocations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              Destination Target
            </h4>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Destination Warehouse *
              </label>
              <select
                value={destinationWarehouse}
                onChange={(e) => {
                  setDestinationWarehouse(e.target.value);
                  setDestinationLocation('');
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Destination Location
              </label>
              <select
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                disabled={!destinationWarehouse}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">Default Warehouse Storage</option>
                {destLocations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transfer Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Scheduled Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason / Reference Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Rebalance bin capacity"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Dynamic Lines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Items to Transfer
            </h4>
            <button
              type="button"
              onClick={handleAddLine}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <Plus size={14} /> Add Line
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {lines.map((line, idx) => (
              <div key={idx} className="p-4 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Product
                  </label>
                  <select
                    value={line.product}
                    onChange={(e) => handleLineChange(idx, 'product', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                    required
                  >
                    <option value="">Select product to move...</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (Total: {p.stockQuantity} {p.unitOfMeasure})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-36">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Transfer Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>

                <div className="self-end sm:self-center mt-2 sm:mt-5">
                  <button
                    type="button"
                    onClick={() => handleRemoveLine(idx)}
                    disabled={lines.length === 1}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/transfers"
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/20 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Scheduling Transfer...' : 'Schedule Transfer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransferCreate;
