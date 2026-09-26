import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useDeliveryStore from '../../store/useDeliveryStore';
import { confirmDialog } from '../../store/useConfirmStore';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { Plus, Search, Eye, CheckCircle, XCircle, Truck } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const statusTabs = ['all', 'draft', 'waiting', 'ready', 'done', 'canceled'];

const DeliveryList = () => {
  const {
    deliveries,
    pagination,
    filters,
    isLoading,
    fetchDeliveries,
    setFilters,
    setPage,
    validateDelivery,
    cancelDelivery
  } = useDeliveryStore();

  const [customerInput, setCustomerInput] = useState(filters.customer || '');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ customer: customerInput });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Delivery Orders (Outgoing Goods)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fulfill client orders and dispatch inventory from warehouses
          </p>
        </div>
        <Link
          to="/deliveries/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Delivery Order</span>
        </Link>
      </div>

      {/* Tabs and Search Bar */}
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

        <form onSubmit={handleSearch} className="w-full md:w-72 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={customerInput}
            onChange={(e) => setCustomerInput(e.target.value)}
            placeholder="Search by customer name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <Spinner text="Loading delivery orders..." />
        ) : deliveries.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No delivery orders found"
            description="Create your first outgoing delivery order or adjust your status filter."
            actionLabel="Create Delivery Order"
            onAction={() => (window.location.href = '/deliveries/create')}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Source Location</th>
                    <th className="px-6 py-3.5">Items Count</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {deliveries.map((d, index) => (
                    <motion.tr
                      key={d._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-6 py-3.5 font-mono font-bold text-indigo-600">
                        <Link to={`/deliveries/${d._id}`} className="hover:underline">
                          {d.reference}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        {d.customer || 'N/A'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {d.sourceWarehouse?.name || 'Main Warehouse'}
                        {d.sourceLocation?.name ? ` › ${d.sourceLocation.name}` : ''}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 font-semibold">
                        {d.lines?.length || 0} item{d.lines?.length === 1 ? '' : 's'}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{formatDate(d.createdAt)}</td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/deliveries/${d._id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View / Process"
                          >
                            <Eye size={16} />
                          </Link>
                          {d.status === 'ready' && (
                            <button
                              onClick={async () => {
                                const ok = await confirmDialog({
                                  title: 'Validate Delivery',
                                  message: `Validate delivery order ${d.reference}? Physical stock will decrease immediately.`,
                                  confirmText: 'Validate Delivery',
                                  type: 'success'
                                });
                                if (ok) validateDelivery(d._id);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Validate Delivery"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {['draft', 'waiting', 'ready'].includes(d.status) && (
                            <button
                              onClick={async () => {
                                const ok = await confirmDialog({
                                  title: 'Cancel Delivery Order',
                                  message: `Are you sure you want to cancel delivery order ${d.reference}? This action cannot be undone.`,
                                  confirmText: 'Cancel Delivery',
                                  type: 'danger'
                                });
                                if (ok) cancelDelivery(d._id);
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Cancel Delivery"
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

export default DeliveryList;
