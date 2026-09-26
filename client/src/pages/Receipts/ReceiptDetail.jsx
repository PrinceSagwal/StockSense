import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useReceiptStore from '../../store/useReceiptStore';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import { ArrowLeft, CheckCircle, XCircle, Clock, Check } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const steps = ['draft', 'waiting', 'ready', 'done'];

const ReceiptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedReceipt,
    fetchReceipt,
    validateReceipt,
    updateReceipt,
    cancelReceipt,
    isLoading
  } = useReceiptStore();

  const [receivedQtys, setReceivedQtys] = useState({});

  useEffect(() => {
    fetchReceipt(id);
  }, [id]);

  useEffect(() => {
    if (selectedReceipt?.lines) {
      const initial = {};
      selectedReceipt.lines.forEach((l, idx) => {
        initial[idx] = l.receivedQty ?? l.expectedQty;
      });
      setReceivedQtys(initial);
    }
  }, [selectedReceipt]);

  if (isLoading && !selectedReceipt) {
    return <Spinner text="Loading receipt details..." />;
  }

  if (!selectedReceipt) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Receipt not found.</p>
        <Link to="/receipts" className="text-xs text-indigo-600 font-semibold mt-2 inline-block">
          &larr; Back to receipts
        </Link>
      </div>
    );
  }

  const currentStepIdx = steps.indexOf(selectedReceipt.status);

  const handleValidate = async () => {
    if (
      window.confirm(
        `Validate ${selectedReceipt.reference}? This will permanently update inventory levels.`
      )
    ) {
      const updatedLines = selectedReceipt.lines.map((l, idx) => ({
        ...l,
        receivedQty: Number(receivedQtys[idx] ?? l.expectedQty)
      }));
      await validateReceipt(id, updatedLines);
      fetchReceipt(id);
    }
  };

  const handleMarkReady = async () => {
    await updateReceipt(id, { status: 'ready' });
    fetchReceipt(id);
  };

  const handleCancel = async () => {
    if (window.confirm('Cancel this receipt?')) {
      await cancelReceipt(id);
      fetchReceipt(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/receipts"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {selectedReceipt.reference}
              </h2>
              <StatusBadge status={selectedReceipt.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Supplier: <span className="font-semibold text-slate-700">{selectedReceipt.supplier}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {selectedReceipt.status === 'draft' && (
            <button
              onClick={handleMarkReady}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Mark as Ready
            </button>
          )}

          {selectedReceipt.status === 'ready' && (
            <button
              onClick={handleValidate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-colors"
            >
              <CheckCircle size={16} /> Validate Receipt
            </button>
          )}

          {['draft', 'waiting', 'ready'].includes(selectedReceipt.status) && (
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
      {selectedReceipt.status !== 'canceled' && (
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
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check size={14} /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold capitalize mt-1.5 ${
                        isCurrent ? 'text-indigo-600 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-all ${
                        idx < currentStepIdx ? 'bg-emerald-500' : 'bg-slate-200'
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
            Destination Warehouse
          </span>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {selectedReceipt.destinationWarehouse?.name || 'Main Warehouse'}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Specific Location
          </span>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {selectedReceipt.destinationLocation?.name || 'General Storage'}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Created Date
          </span>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {formatDate(selectedReceipt.createdAt)}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Validation Date
          </span>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {selectedReceipt.validatedAt ? formatDate(selectedReceipt.validatedAt) : 'Pending'}
          </p>
        </div>
      </div>

      {/* Receipt Lines Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Receipt Product Lines</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Product Name</th>
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5 text-center">Expected Quantity</th>
                <th className="px-6 py-3.5 text-center">Received Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {selectedReceipt.lines?.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="px-6 py-3 font-semibold text-slate-800">
                    {line.product?.name || 'Unnamed Product'}
                  </td>
                  <td className="px-6 py-3 font-mono text-slate-600">
                    {line.product?.sku || 'N/A'}
                  </td>
                  <td className="px-6 py-3 text-center font-bold text-slate-700">
                    {line.expectedQty}
                  </td>
                  <td className="px-6 py-3 text-center">
                    {selectedReceipt.status === 'done' || selectedReceipt.status === 'canceled' ? (
                      <span className="font-bold text-emerald-600">{line.receivedQty}</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        value={receivedQtys[idx] ?? line.expectedQty}
                        onChange={(e) =>
                          setReceivedQtys({ ...receivedQtys, [idx]: e.target.value })
                        }
                        className="w-24 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
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

export default ReceiptDetail;
