import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useTransferStore from '../../store/useTransferStore';
import useWarehouseStore from '../../store/useWarehouseStore';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { Plus, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const statusTabs = ['all', 'draft', 'waiting', 'ready', 'done', 'canceled'];

const TransferList = () => {
  const {
    transfers,
    pagination,
    filters,
    isLoading,
    fetchTransfers,
    setFilters,
    setPage,
    validateTransfer,
    cancelTransfer
  } = useTransferStore();

  const { warehouses, fetchWarehouses } = useWarehouseStore();

  useEffect(() => {
    fetchTransfers();
    fetchWarehouses();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Internal Transfers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Relocate stock across warehouses and bin locations without changing total inventory
          </p>
        </div>
        <Link
          to="/transfers/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-violet-600/20 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Transfer</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
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

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filters.sourceWarehouse}
            onChange={(e) => setFilters({ sourceWarehouse: e.target.value })}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Source Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <Spinner text="Loading internal transfers..." />
        ) : transfers.length === 0 ? (
          <EmptyState
            icon={ArrowRight}
            title="No internal transfers found"
            description="Create a stock movement between warehouse locations to begin."
            actionLabel="Schedule Transfer"
            onAction={() => (window.location.href = '/transfers/create')}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5">Source Location</th>
                    <th className="px-6 py-3.5">Destination Location</th>
                    <th className="px-6 py-3.5">Items</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Scheduled Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {transfers.map((t, index) => (
                    <motion.tr
                      key={t._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-6 py-3.5 font-mono font-bold text-indigo-600">
                        {t.reference}
                      </td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">
                        {t.sourceWarehouse?.name || 'WH'}
                        {t.sourceLocation?.name ? ` › ${t.sourceLocation.name}` : ''}
                      </td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">
                        {t.destinationWarehouse?.name || 'WH'}
                        {t.destinationLocation?.name ? ` › ${t.destinationLocation.name}` : ''}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 font-semibold">
                        {t.lines?.length || 0} item{t.lines?.length === 1 ? '' : 's'}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {t.scheduledDate ? formatDate(t.scheduledDate) : formatDate(t.createdAt)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {['draft', 'ready', 'waiting'].includes(t.status) && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Execute internal transfer ${t.reference}? Stock will move.`
                                  )
                                ) {
                                  validateTransfer(t._id);
                                }
                              }}
                              className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                              title="Validate Transfer"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {['draft', 'waiting', 'ready'].includes(t.status) && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Cancel transfer ${t.reference}?`)) {
                                  cancelTransfer(t._id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Cancel Transfer"
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

export default TransferList;
