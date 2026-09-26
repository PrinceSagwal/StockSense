import { create } from 'zustand';
import warehouseAPI from '../api/warehouseAPI';
import toast from 'react-hot-toast';

export const useWarehouseStore = create((set, get) => ({
  warehouses: [],
  isLoading: false,

  fetchWarehouses: async () => {
    try {
      set({ isLoading: true });
      const res = await warehouseAPI.getWarehouses();
      if (res?.success) {
        set({ warehouses: res.data });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch warehouses');
    } finally {
      set({ isLoading: false });
    }
  },

  createWarehouse: async (data) => {
    try {
      set({ isLoading: true });
      const res = await warehouseAPI.createWarehouse(data);
      if (res?.success) {
        toast.success('Warehouse created successfully');
        await get().fetchWarehouses();
        return res.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create warehouse');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateWarehouse: async (id, data) => {
    try {
      set({ isLoading: true });
      const res = await warehouseAPI.updateWarehouse(id, data);
      if (res?.success) {
        toast.success('Warehouse updated');
        await get().fetchWarehouses();
        return res.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update warehouse');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  addLocation: async (warehouseId, data) => {
    try {
      set({ isLoading: true });
      const res = await warehouseAPI.addLocation(warehouseId, data);
      if (res?.success) {
        toast.success('Location added');
        await get().fetchWarehouses();
        return res.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add location');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateLocation: async (warehouseId, locationId, data) => {
    try {
      set({ isLoading: true });
      const res = await warehouseAPI.updateLocation(warehouseId, locationId, data);
      if (res?.success) {
        toast.success('Location updated');
        await get().fetchWarehouses();
        return res.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update location');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getLocationsByWarehouse: (warehouseId) => {
    const wh = get().warehouses.find((w) => w._id === warehouseId);
    return wh ? wh.locations || [] : [];
  }
}));

export default useWarehouseStore;
