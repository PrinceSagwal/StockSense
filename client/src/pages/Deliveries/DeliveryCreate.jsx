import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useDeliveryStore from '../../store/useDeliveryStore';
import useProductStore from '../../store/useProductStore';
import useWarehouseStore from '../../store/useWarehouseStore';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DeliveryCreate = () => {
  const navigate = useNavigate();
  const { createDelivery, isLoading } = useDeliveryStore();
  const { products, fetchProducts } = useProductStore();
  const { warehouses, fetchWarehouses } = useWarehouseStore();

  const [customer, setCustomer] = useState('');
  const [sourceWarehouse, setSourceWarehouse] = useState('');
  const [sourceLocation, setSourceLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([{ product: '', requestedQty: 1 }]);

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
  }, []);

  const availableLocations =
    warehouses.find((w) => w._id === sourceWarehouse)?.locations || [];

  const handleAddLine = () => {
    setLines([...lines, { product: '', requestedQty: 1 }]);
  };

  const handleRemoveLine = (index) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (!sourceWarehouse) {
      toast.error('Please select source warehouse');
      return;
    }
    if (lines.some((l) => !l.product || l.requestedQty <= 0)) {
      toast.error('Please complete all lines with valid quantities');
      return;
    }

    try {
      await createDelivery({
        customer,
        sourceWarehouse,
        sourceLocation: sourceLocation || undefined,
        notes,
        lines: lines.map((l) => ({
          product: l.product,
          requestedQty: Number(l.requestedQty)
        }))
      });
      navigate('/deliveries');
    } catch (err) {
      // toast in store
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/deliveries"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Delivery Order
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dispatch inventory for a customer or sales order
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Customer / Client *
            </label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Source Warehouse *
            </label>
            <select
              value={sourceWarehouse}
              onChange={(e) => {
                setSourceWarehouse(e.target.value);
                setSourceLocation('');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Source Location
            </label>
            <select
              value={sourceLocation}
              onChange={(e) => setSourceLocation(e.target.value)}
              disabled={!sourceWarehouse}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Default Warehouse Storage</option>
              {availableLocations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name} ({loc.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Lines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Dispatched Items
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
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (Stock: {p.stockQuantity} {p.unitOfMeasure})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-36">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Requested Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={line.requestedQty}
                    onChange={(e) => handleLineChange(idx, 'requestedQty', e.target.value)}
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

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Delivery / Shipping Instructions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Fragile package, freight carrier tracking #..."
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/deliveries"
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Saving Delivery...' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryCreate;
