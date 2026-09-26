import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useReceiptStore from '../../store/useReceiptStore';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { Plus, Search, Eye, CheckCircle, XCircle, ArrowDownLeft } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const statusTabs = ['all', 'draft', 'waiting', 'ready', 'done', 'canceled'];

const ReceiptList = () => {
  const {
    receipts,
    pagination,
    filters,
    isLoading,
    fetchReceipts,
    setFilters,
    setPage,
    validateReceipt,
    cancelReceipt
  } = useReceiptStore();

  const [supplierInput, setSupplierInput] = useState(filters.supplier || '');

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ supplier: supplierInput });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Receipts (Incoming Goods)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Receive vendor shipments and intake inventory into locations
          </p>
        </div>
        <Link
          to="/receipts/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Receipt</span>
        </Link>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilters({ status: tab })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 cursor-pointer ${
                filters.status === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Supplier Search */}
        <form onSubmit={handleSearch} className="w-full md:w-72 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={supplierInput}
            onChange={(e) => setSupplierInput(e.target.value)}
            placeholder="Search by supplier name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <Spinner text="Loading receipts..." />
        ) : receipts.length === 0 ? (
          <EmptyState
            icon={ArrowDownLeft}
            title="No receipts found"
            description="Create your first incoming goods receipt or adjust your filters."
            actionLabel="Create Receipt"
            onAction={() => (window.location.href = '/receipts/create')}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5">Supplier</th>
                    <th className="px-6 py-3.5">Destination</th>
                    <th className="px-6 py-3.5">Lines</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Created Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {receipts.map((r, index) => (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-6 py-3.5 font-mono font-bold text-indigo-600">
                        <Link to={`/receipts/${r._id}`} className="hover:underline">
                          {r.reference}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        {r.supplier || 'N/A'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {r.destinationWarehouse?.name || 'Main Warehouse'}
                        {r.destinationLocation?.name ? ` › ${r.destinationLocation.name}` : ''}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 font-semibold">
                        {r.lines?.length || 0} item{r.lines?.length === 1 ? '' : 's'}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{formatDate(r.createdAt)}</td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/receipts/${r._id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View / Process"
                          >
                            <Eye size={16} />
                          </Link>
                          {r.status === 'ready' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Validate receipt ${r.reference}? Stock will increase.`)) {
                                  validateReceipt(r._id);
                                }
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Validate Receipt"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {['draft', 'waiting', 'ready'].includes(r.status) && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Cancel receipt ${r.reference}?`)) {
                                  cancelReceipt(r._id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Cancel Receipt"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default ReceiptList;
