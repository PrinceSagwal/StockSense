import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useProductStore from '../../store/useProductStore';
import { confirmDialog } from '../../store/useConfirmStore';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { ArrowLeft, Package, Edit, Trash2, MapPin, Layers, AlertTriangle } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedProduct,
    fetchProduct,
    updateProduct,
    deleteProduct,
    categories,
    fetchCategories,
    isLoading
  } = useProductStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    sku: '',
    reorderThreshold: 10,
    unitOfMeasure: 'units',
    description: ''
  });

  useEffect(() => {
    fetchProduct(id);
    fetchCategories();
  }, [id]);

  useEffect(() => {
    if (selectedProduct) {
      setEditData({
        name: selectedProduct.name || '',
        sku: selectedProduct.sku || '',
        reorderThreshold: selectedProduct.reorderThreshold ?? 10,
        unitOfMeasure: selectedProduct.unitOfMeasure || 'units',
        description: selectedProduct.description || ''
      });
    }
  }, [selectedProduct]);

  if (isLoading && !selectedProduct) {
    return <Spinner text="Loading product details..." />;
  }

  if (!selectedProduct) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Product not found.</p>
        <Link to="/products" className="text-xs text-indigo-600 font-semibold mt-2 inline-block">
          &larr; Back to catalog
        </Link>
      </div>
    );
  }

  const stockStatus =
    selectedProduct.stockQuantity === 0
      ? 'out'
      : selectedProduct.stockQuantity <= (selectedProduct.reorderThreshold || 10)
      ? 'low'
      : 'ok';

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(id, editData);
      setIsEditModalOpen(false);
    } catch (err) {
      // Toast in store
    }
  };

  const handleDelete = async () => {
    const ok = await confirmDialog({
      title: 'Delete Product',
      message: `Delete product "${selectedProduct.name}" (${selectedProduct.sku})? This action cannot be undone.`,
      confirmText: 'Delete Product',
      type: 'danger'
    });
    if (!ok) return;

    await deleteProduct(id);
    navigate('/products');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {selectedProduct.name}
              </h2>
              <StatusBadge status={stockStatus} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              SKU: {selectedProduct.sku}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Edit size={14} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Product Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          {selectedProduct.image ? (
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-48 object-cover rounded-xl border border-slate-100 shadow-xs"
            />
          ) : (
            <div className="w-full h-48 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400">
              <Package size={40} />
              <span className="text-xs mt-2 font-medium">No Image Uploaded</span>
            </div>
          )}
        </div>

        <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Category
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              {selectedProduct.category?.name || 'Uncategorized'}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Unit of Measure
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1 uppercase">
              {selectedProduct.unitOfMeasure || 'units'}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Stock Quantity
            </span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {selectedProduct.stockQuantity}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Reorder Threshold
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-500" />
              {selectedProduct.reorderThreshold || 10} units
            </p>
          </div>

          <div className="col-span-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Description
            </span>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {selectedProduct.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Stock Per Location Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Stock by Location Breakdown</h3>
          </div>
          <span className="text-xs text-slate-500">
            {selectedProduct.stockPerLocation?.length || 0} locations recorded
          </span>
        </div>

        {selectedProduct.stockPerLocation && selectedProduct.stockPerLocation.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Warehouse</th>
                  <th className="px-6 py-3">Location Code</th>
                  <th className="px-6 py-3">Location Type</th>
                  <th className="px-6 py-3 text-right">Quantity Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {selectedProduct.stockPerLocation.map((locItem, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      {locItem.warehouse?.name || 'Main Warehouse'}
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-600">
                      {locItem.location?.code || locItem.location?.name || 'Default Rack'}
                    </td>
                    <td className="px-6 py-3 text-slate-500 capitalize">
                      {locItem.location?.type || 'Standard'}
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900 text-right">
                      {locItem.quantity} {selectedProduct.unitOfMeasure}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No specific location allocations found. Stock is held in general warehouse storage.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product Details"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU</label>
              <input
                type="text"
                value={editData.sku}
                onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reorder Threshold
              </label>
              <input
                type="number"
                min="0"
                value={editData.reorderThreshold}
                onChange={(e) => setEditData({ ...editData, reorderThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetail;
