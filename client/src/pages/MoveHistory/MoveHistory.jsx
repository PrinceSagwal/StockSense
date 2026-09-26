import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import moveAPI from '../../api/moveAPI';
import useWarehouseStore from '../../store/useWarehouseStore';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { History, Search, ArrowUpRight, ArrowDownLeft, Sliders, RefreshCw, Clock, ArrowLeftRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const MoveHistory = () => {
  const [moves, setMoves] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [warehouse, setWarehouse] = useState('');

  const { warehouses, fetchWarehouses } = useWarehouseStore();

  const fetchMoveData = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: 20,
        ...(search ? { product: search } : {}),
        ...(type !== 'all' ? { type } : {}),
        ...(warehouse ? { warehouse } : {})
      };
      const res = await moveAPI.getMoves(params);
      if (res?.success) {
        setMoves(res.data);
        setPagination(res.pagination || { page: 1, limit: 20, total: res.data.length, pages: 1 });
      }
    } catch (err) {
      toast.error('Failed to load move ledger');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchMoveData(1);
  }, [type, warehouse]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMoveData(1);
  };

  const getBadgeForType = (opType) => {
    switch (opType) {
      case 'receipt':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <ArrowDownLeft size={12} /> Receipt
          </span>
        );
      case 'delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
            <ArrowUpRight size={12} /> Delivery
          </span>
        );
      case 'transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <ArrowLeftRight size={12} /> Transfer
          </span>
        );
      case 'adjustment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            <Sliders size={12} /> Adjustment
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {opType}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Stock Move History (Ledger)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable audit trail of all receipts, deliveries, internal transfers, and adjustments
          </p>
        </div>
        <button
          onClick={() => fetchMoveData(pagination.page)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, SKU, or reference #..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">All Operations</option>
            <option value="receipt">Receipts</option>
            <option value="delivery">Deliveries</option>
            <option value="transfer">Transfers</option>
            <option value="adjustment">Adjustments</option>
          </select>

          <select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <Spinner text="Reading audit ledger..." />
        ) : moves.length === 0 ? (
          <EmptyState
            icon={History}
            title="No ledger movements found"
            description="When stock operations are validated, historical transactions will record here automatically."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Operation</th>
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5">Product & SKU</th>
                    <th className="px-6 py-3.5">From</th>
                    <th className="px-6 py-3.5">To</th>
                    <th className="px-6 py-3.5 text-right">Quantity Delta</th>
                    <th className="px-6 py-3.5 text-right">Performed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {moves.map((m, index) => (
                    <motion.tr
                      key={m._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                        <Clock size={12} className="text-slate-400" />
                        {formatDate(m.createdAt)}
                      </td>
                      <td className="px-6 py-3.5">
                        {getBadgeForType(m.operationType || m.type)}
                      </td>
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {m.reference || '—'}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{m.productName}</div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{m.productSku}</div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">
                        {m.fromWarehouse?.name || '—'}
                        {m.fromLocation?.name ? ` › ${m.fromLocation.name}` : ''}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">
                        {m.toWarehouse?.name || '—'}
                        {m.toLocation?.name ? ` › ${m.toLocation.name}` : ''}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            m.quantity > 0
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                              : m.quantity < 0
                              ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.unitOfMeasure}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-slate-600 dark:text-slate-400 font-medium">
                        {m.performedBy?.name || 'System'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={(p) => fetchMoveData(p)} />
          </>
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
