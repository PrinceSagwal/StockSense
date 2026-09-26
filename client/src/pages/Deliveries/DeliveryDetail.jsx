import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useDeliveryStore from '../../store/useDeliveryStore';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import { ArrowLeft, CheckCircle, XCircle, Check } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const steps = ['draft', 'waiting', 'ready', 'done'];

const DeliveryDetail = () => {
  const { id } = useParams();
  const {
    selectedDelivery,
    fetchDelivery,
    validateDelivery,
    updateDelivery,
    cancelDelivery,
    isLoading
  } = useDeliveryStore();

  useEffect(() => {
    fetchDelivery(id);
  }, [id]);

  if (isLoading && !selectedDelivery) {
    return <Spinner text="Loading delivery order..." />;
  }

  if (!selectedDelivery) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Delivery order not found.</p>
        <Link to="/deliveries" className="text-xs text-indigo-600 font-semibold mt-2 inline-block">
          &larr; Back to delivery orders
        </Link>
      </div>
    );
  }

  const currentStepIdx = steps.indexOf(selectedDelivery.status);

  const handleValidate = async () => {
    if (
      window.confirm(
        `Validate delivery order ${selectedDelivery.reference}? This will decrease warehouse stock permanently.`
      )
    ) {
      await validateDelivery(id);
      fetchDelivery(id);
    }
  };

  const handleMarkReady = async () => {
    await updateDelivery(id, { status: 'ready' });
    fetchDelivery(id);
  };

  const handleCancel = async () => {
    if (window.confirm(`Cancel delivery order ${selectedDelivery.reference}?`)) {
      await cancelDelivery(id);
      fetchDelivery(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/deliveries"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {selectedDelivery.reference}
              </h2>
              <StatusBadge status={selectedDelivery.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <span className="font-semibold text-slate-700">{selectedDelivery.customer}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {selectedDelivery.status === 'draft' && (
            <button
              onClick={handleMarkReady}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Mark as Ready
            </button>
          )}

          {selectedDelivery.status === 'ready' && (
            <button
              onClick={handleValidate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-colors cursor-pointer"
            >
              <CheckCircle size={16} /> Validate & Deduct Stock
            </button>
          )}

          {['draft', 'waiting', 'ready'].includes(selectedDelivery.status) && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <XCircle size={16} /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Stepper Status Bar */}
      {selectedDelivery.status !== 'canceled' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step} className="flex-1 flex items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check size={14} /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold capitalize mt-1.5 ${
                        isCurrent ? 'text-blue-600 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-all ${
                        idx < currentStepIdx ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overview Info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Source Warehouse
          </span>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {selectedDelivery.sourceWarehouse?.name || 'Main Warehouse'}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Source Location
          </span>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {selectedDelivery.sourceLocation?.name || 'General Storage'}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Order Date
          </span>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {formatDate(selectedDelivery.createdAt)}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Dispatch Date
          </span>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {selectedDelivery.validatedAt ? formatDate(selectedDelivery.validatedAt) : 'Pending Dispatch'}
          </p>
        </div>
      </div>

      {/* Product Lines Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Requested Items</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Product Name</th>
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5 text-center">Requested Quantity</th>
                <th className="px-6 py-3.5 text-center">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {selectedDelivery.lines?.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="px-6 py-3 font-semibold text-slate-800">
                    {line.product?.name || 'Unnamed Item'}
                  </td>
                  <td className="px-6 py-3 font-mono text-slate-600">
                    {line.product?.sku || 'N/A'}
                  </td>
                  <td className="px-6 py-3 text-center font-bold text-slate-900">
                    {line.requestedQty} {line.product?.unitOfMeasure || 'units'}
                  </td>
                  <td className="px-6 py-3 text-center">
                    {selectedDelivery.status === 'done' ? (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1">
                        <Check size={14} /> Dispatched
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Ready to dispatch</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetail;
