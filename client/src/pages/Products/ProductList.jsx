import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import useProductStore from '../../store/useProductStore';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { Plus, Search, Filter, Eye, Trash2, Package } from 'lucide-react';

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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Products</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your inventory items, SKU codes, and reorder levels
          </p>
        </div>
        <Link
          to="/products/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="ok">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Product</th>
                    <th className="px-6 py-3.5">SKU</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">UoM</th>
                    <th className="px-6 py-3.5">Current Stock</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {products.map((p, index) => {
                    const status = getStockStatus(p);
                    return (
                      <motion.tr
                        key={p._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-6 py-3 flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                              <Package size={16} />
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/products/${p._id}`}
                              className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                            >
                              {p.name}
                            </Link>
                            <div className="text-[10px] text-slate-400">
                              Threshold: {p.reorderThreshold || 10}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 font-mono font-medium text-slate-600">
                          {p.sku}
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                          {p.category?.name || 'Uncategorized'}
                        </td>
                        <td className="px-6 py-3 text-slate-600 uppercase">
                          {p.unitOfMeasure || 'units'}
                        </td>
                        <td className="px-6 py-3 font-bold text-slate-900">
                          {p.stockQuantity}
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              to={`/products/${p._id}`}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye size={16} />
                            </Link>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete product ${p.name}?`)) {
                                  deleteProduct(p._id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 size={16} />
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
