import React, { useState, useEffect } from 'react';
import useAdjustmentStore from '../../store/useAdjustmentStore';
import useProductStore from '../../store/useProductStore';
import useWarehouseStore from '../../store/useWarehouseStore';
import { confirmDialog } from '../../store/useConfirmStore';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import { Sliders, CheckCircle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AdjustmentPage = () => {
  const { adjustments, pagination, isLoading, fetchAdjustments, createAdjustment } =
    useAdjustmentStore();
  const { products, fetchProducts } = useProductStore();
  const { warehouses, fetchWarehouses } = useWarehouseStore();

  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [systemQuantity, setSystemQuantity] = useState(0);
  const [countedQuantity, setCountedQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAdjustments();
    fetchProducts();
    fetchWarehouses();
  }, []);

  const selectedProduct = products.find((p) => p._id === selectedProductId);
  const availableLocations =
    warehouses.find((w) => w._id === selectedWarehouseId)?.locations || [];

  // Recalculate system quantity when product or location changes
  useEffect(() => {
    if (!selectedProduct) {
      setSystemQuantity(0);
      return;
    }

    if (selectedLocationId && selectedProduct.stockPerLocation) {
      const locStock = selectedProduct.stockPerLocation.find(
        (spl) =>
          spl.location?._id === selectedLocationId || spl.location === selectedLocationId
      );
      setSystemQuantity(locStock ? locStock.quantity : 0);
    } else {
      setSystemQuantity(selectedProduct.stockQuantity || 0);
    }
  }, [selectedProductId, selectedLocationId, selectedProduct]);

  const difference = Number(countedQuantity) - Number(systemQuantity);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please provide a reason for the adjustment');
      return;
    }

    const confirmed = await confirmDialog({
      title: 'Apply Stock Adjustment',
      message: `Apply stock adjustment of ${difference >= 0 ? `+${difference}` : difference} for ${
        selectedProduct?.name
      }? This will update the inventory ledger immediately.`,
      confirmText: 'Apply Adjustment',
      type: difference >= 0 ? 'success' : 'warning'
    });
    if (!confirmed) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createAdjustment({
        product: selectedProductId,
        warehouse: selectedWarehouseId || undefined,
        location: selectedLocationId || undefined,
        countedQuantity: Number(countedQuantity),
        reason
      });

      // Reset form
      setReason('');
      fetchProducts(); // Refresh products with updated stock
    } catch (err) {
      // toast in store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Inventory Adjustment
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Reconcile physical stock counts with digital warehouse ledger records
        </p>
      </div>

      {/* Adjustment Entry Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sliders size={18} className="text-indigo-600" />
          <span>Record Physical Count</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Product *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Warehouse (Optional)
              </label>
              <select
                value={selectedWarehouseId}
                onChange={(e) => {
                  const whId = e.target.value;
                  setSelectedWarehouseId(whId);
                  const wh = warehouses.find((w) => w._id === whId);
                  if (wh?.locations && wh.locations.length > 0) {
                    setSelectedLocationId(wh.locations[0]._id);
                  } else {
                    setSelectedLocationId('');
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bin Location (Optional)
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                disabled={!selectedWarehouseId}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">All Locations in Warehouse</option>
                {availableLocations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Counts & Live Difference Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-[11px] font-semibold text-slate-500">System Recorded Qty</span>
              <div className="text-xl font-extrabold text-slate-800 mt-1 font-mono">
                {systemQuantity} {selectedProduct?.unitOfMeasure || 'units'}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Actual Counted Qty *
              </label>
              <input
                type="number"
                min="0"
                value={countedQuantity}
                onChange={(e) => setCountedQuantity(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500">Net Stock Impact</span>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`text-xl font-extrabold font-mono flex items-center ${
                    difference > 0
                      ? 'text-emerald-600'
                      : difference < 0
                      ? 'text-rose-600'
                      : 'text-slate-500'
                  }`}
                >
                  {difference > 0 ? (
                    <ArrowUp size={18} className="mr-0.5" />
                  ) : difference < 0 ? (
                    <ArrowDown size={18} className="mr-0.5" />
                  ) : null}
                  {difference > 0 ? `+${difference}` : difference}
                </span>
                <span className="text-xs text-slate-400">
                  {difference === 0 ? '(Balanced)' : difference > 0 ? '(Gain)' : '(Loss / Waste)'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason for Discrepancy *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Annual physical count, damaged packaging, supplier mismatch..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !selectedProductId}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-amber-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Applying Adjustment...' : 'Apply Stock Adjustment'}
            </button>
          </div>
        </form>
      </div>

      {/* Adjustments History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Adjustment Audit Trail</h3>
          <span className="text-xs text-slate-500">{adjustments.length} logged entries</span>
        </div>

        {isLoading ? (
          <Spinner text="Loading audit records..." />
        ) : adjustments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No stock adjustments recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5 text-center">System Qty</th>
                  <th className="px-6 py-3.5 text-center">Counted Qty</th>
                  <th className="px-6 py-3.5 text-center">Difference</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {adjustments.map((adj) => (
                  <tr key={adj._id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-mono font-bold text-indigo-600">
                      {adj.reference || 'ADJ'}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                      {adj.product?.name || 'Item'}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {adj.warehouse?.name || 'All'}
                      {adj.location?.name ? ` › ${adj.location.name}` : ''}
                    </td>
                    <td className="px-6 py-3.5 text-center font-mono text-slate-600">
                      {adj.systemQuantity}
                    </td>
                    <td className="px-6 py-3.5 text-center font-mono text-slate-800 font-bold">
                      {adj.countedQuantity}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          adj.difference > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : adj.difference < 0
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">
                      {adj.reason}
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">
                      {formatDate(adj.adjustedAt || adj.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdjustmentPage;
