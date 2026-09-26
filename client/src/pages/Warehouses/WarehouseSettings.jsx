import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useWarehouseStore from '../../store/useWarehouseStore';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import { Warehouse, Plus, ChevronDown, MapPin, Layers, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const locationTypes = ['rack', 'shelf', 'zone', 'floor', 'bin', 'other'];

const WarehouseSettings = () => {
  const {
    warehouses,
    isLoading,
    fetchWarehouses,
    createWarehouse,
    updateWarehouse,
    addLocation
  } = useWarehouseStore();

  const [expandedWarehouses, setExpandedWarehouses] = useState({});
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedWarehouseForLocation, setSelectedWarehouseForLocation] = useState(null);

  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    code: '',
    address: ''
  });

  const [locationForm, setLocationForm] = useState({
    name: '',
    code: '',
    type: 'rack'
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const toggleExpand = (whId) => {
    setExpandedWarehouses((prev) => ({
      ...prev,
      [whId]: !prev[whId]
    }));
  };

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    if (!warehouseForm.name || !warehouseForm.code) {
      toast.error('Warehouse name and code are required');
      return;
    }
    try {
      await createWarehouse(warehouseForm);
      setIsWarehouseModalOpen(false);
      setWarehouseForm({ name: '', code: '', address: '' });
    } catch (err) {
      // toast in store
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!locationForm.name || !locationForm.code) {
      toast.error('Location name and code are required');
      return;
    }
    try {
      await addLocation(selectedWarehouseForLocation, locationForm);
      setIsLocationModalOpen(false);
      setLocationForm({ name: '', code: '', type: 'rack' });
    } catch (err) {
      // toast in store
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Warehouse & Location Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure physical facilities, zones, racks, and nested bin storage
          </p>
        </div>
        <button
          onClick={() => setIsWarehouseModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Warehouse</span>
        </button>
      </div>

      {/* Warehouse Accordion List */}
      {isLoading && warehouses.length === 0 ? (
        <Spinner text="Loading warehouses..." />
      ) : warehouses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Warehouse size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">No warehouses configured</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Set up your first warehouse facility to begin tracking location-specific inventory.
          </p>
          <button
            onClick={() => setIsWarehouseModalOpen(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
          >
            Create Warehouse
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {warehouses.map((wh) => {
            const isExpanded = expandedWarehouses[wh._id] !== false; // Default open
            const locationsCount = wh.locations?.length || 0;

            return (
              <div
                key={wh._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Warehouse Card Header */}
                <div
                  onClick={() => toggleExpand(wh._id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Warehouse size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{wh.name}</h3>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                          {wh.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {wh.address || 'No physical address specified'} &bull; {locationsCount}{' '}
                        locations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWarehouseForLocation(wh._id);
                        setIsLocationModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus size={14} /> Add Location
                    </button>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Locations Subsection */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 bg-slate-50/50 p-5"
                    >
                      {locationsCount === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400">
                          No sub-locations or racks added yet for this warehouse.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {wh.locations.map((loc) => (
                            <div
                              key={loc._id}
                              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                  <MapPin size={16} />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-800">{loc.name}</div>
                                  <div className="text-[10px] font-mono text-slate-400">
                                    {loc.code} &bull; <span className="capitalize">{loc.type}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Warehouse Modal */}
      <Modal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        title="Add New Warehouse"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Warehouse Name *
            </label>
            <input
              type="text"
              value={warehouseForm.name}
              onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
              placeholder="e.g. Central Distribution Hub"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Warehouse Code * (Unique identifier)
            </label>
            <input
              type="text"
              value={warehouseForm.code}
              onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })}
              placeholder="e.g. WH-MAIN-01"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Address / Facility Location
            </label>
            <input
              type="text"
              value={warehouseForm.address}
              onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
              placeholder="e.g. 100 Logistics Blvd, Dock 4"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsWarehouseModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
            >
              Save Warehouse
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Location Modal */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Add Storage Location"
      >
        <form onSubmit={handleCreateLocation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location Name *
            </label>
            <input
              type="text"
              value={locationForm.name}
              onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
              placeholder="e.g. Aisle 3 - Shelf B"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location Code *
              </label>
              <input
                type="text"
                value={locationForm.code}
                onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })}
                placeholder="e.g. A3-SB"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location Type
              </label>
              <select
                value={locationForm.type}
                onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs capitalize"
              >
                {locationTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
            >
              Add Location
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WarehouseSettings;
