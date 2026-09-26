import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import useProductStore from '../../store/useProductStore';
import { confirmDialog } from '../../store/useConfirmStore';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { Plus, Search, Eye, Trash2, Package } from 'lucide-react';

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const {
    products,
    categories,
    pagination,
    filters,
    isLoading,
    fetchProducts,
    fetchCategories,
    setFilters,
    setPage,
    deleteProduct
  } = useProductStore();

  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  useEffect(() => {
    fetchCategories();
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setFilters({ status: statusParam });
    } else {
      fetchProducts();
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({ search: searchTerm });
  };

  const getStockStatus = (product) => {
    if (product.stockQuantity === 0) return 'out';
    if (product.stockQuantity <= (product.reorderThreshold || 10)) return 'low';
    return 'ok';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">Products</h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Manage your inventory items, SKU codes, and reorder levels
          </p>
        </div>
        <Link
          to="/products/create"
          className="btn-lift inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#F59E0B] text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] dark:bg-slate-900/80 p-4 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-9 pr-4 py-2 bg-[#F1F5F9] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="px-3 py-2 bg-[#F1F5F9] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
            className="px-3 py-2 bg-[#F1F5F9] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="ok">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-[#FFFFFF] dark:bg-slate-900/80 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-xs overflow-hidden card-hover-elevate">
        {isLoading ? (
          <Spinner text="Loading products catalog..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your search criteria or add your first product to get started."
            actionLabel="Add Product"
            onAction={() => (window.location.href = '/products/create')}
          />
        ) : (
          <>
            <div className="overflow-x-auto max-h-[640px] relative">
              <table className="w-full text-left border-collapse">
                {/* Sticky Header with bottom border */}
                <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-[#E2E8F0] dark:border-slate-800">
                  <tr className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-3.5">Product</th>
                    <th className="px-6 py-3.5">SKU</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">UoM</th>
                    <th className="px-6 py-3.5">Current Stock</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                {/* Alternating Row Zebra Striping (#F8FAFC on even rows) */}
                <tbody className="divide-y divide-[#E2E8F0]/60 dark:divide-slate-800/60 text-xs">
                  {products.map((p, index) => {
                    const status = getStockStatus(p);
                    return (
                      <motion.tr
                        key={p._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.015 }}
                        className="even:bg-[#F8FAFC] dark:even:bg-slate-800/30 hover:bg-[#F1F5F9]/70 dark:hover:bg-slate-800/70 transition-colors"
                      >
                        <td className="px-6 py-3 flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover ring-1 ring-[#E2E8F0] dark:ring-slate-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] dark:bg-slate-800 text-[#64748B] flex items-center justify-center font-bold">
                              <Package size={16} />
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/products/${p._id}`}
                              className="font-semibold text-[#0F172A] dark:text-white hover:text-[#F5A623] transition-colors"
                            >
                              {p.name}
                            </Link>
                            <div className="text-[10px] text-[#64748B]">
                              Threshold: {p.reorderThreshold || 10}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 font-mono font-medium text-[#64748B] dark:text-slate-300">
                          {p.sku}
                        </td>
                        <td className="px-6 py-3 text-[#64748B] dark:text-slate-300">
                          {p.category?.name || 'Uncategorized'}
                        </td>
                        <td className="px-6 py-3 text-[#64748B] dark:text-slate-300 uppercase">
                          {p.unitOfMeasure || 'units'}
                        </td>
                        <td className="px-6 py-3 font-bold text-[#0F172A] dark:text-white">
                          {p.stockQuantity}
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* Action Icon: wrapped in small button with hover circle #F1F5F9, scale 1.05 */}
                            <Link
                              to={`/products/${p._id}`}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-all duration-150 hover:scale-105"
                              title="View details"
                            >
                              <Eye size={15} />
                            </Link>
                            <button
                              onClick={async () => {
                                const ok = await confirmDialog({
                                  title: 'Delete Product',
                                  message: `Are you sure you want to delete "${p.name}" (${p.sku})? This action cannot be undone.`,
                                  confirmText: 'Delete Product',
                                  type: 'danger'
                                });
                                if (ok) deleteProduct(p._id);
                              }}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#EF4444] hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-all duration-150 hover:scale-105 cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
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

export default ProductList;
