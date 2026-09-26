import { create } from 'zustand';
import productAPI from '../api/productAPI';
import toast from 'react-hot-toast';

export const useProductStore = create((set, get) => ({
  products: [],
  selectedProduct: null,
  categories: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  filters: { search: '', category: 'all', status: 'all' },
  isLoading: false,

  fetchProducts: async () => {
    try {
      set({ isLoading: true });
      const { filters, pagination } = get();
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.category && filters.category !== 'all' ? { category: filters.category } : {}),
        ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {})
      };

      const res = await productAPI.getProducts(params);
      if (res?.success) {
        set({
          products: res.data,
          pagination: res.pagination || get().pagination
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch products');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProduct: async (id) => {
    try {
      set({ isLoading: true });
      const res = await productAPI.getProductById(id);
      if (res?.success) {
        set({ selectedProduct: res.data });
        return res.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load product details');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  createProduct: async (formData) => {
    try {
      set({ isLoading: true });
      const res = await productAPI.createProduct(formData);
      if (res?.success) {
        toast.success('Product created successfully');
        await get().fetchProducts();
        return res.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create product');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProduct: async (id, formData) => {
    try {
      set({ isLoading: true });
      const res = await productAPI.updateProduct(id, formData);
      if (res?.success) {
        toast.success('Product updated successfully');
        await get().fetchProducts();
        if (get().selectedProduct?._id === id) {
          set({ selectedProduct: res.data });
        }
        return res.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProduct: async (id) => {
    try {
      set({ isLoading: true });
      const res = await productAPI.deleteProduct(id);
      if (res?.success) {
        toast.success('Product deleted');
        await get().fetchProducts();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await productAPI.getCategories();
      if (res?.success) {
        set({ categories: res.data });
      }
    } catch (err) {
      console.warn('Failed to fetch categories:', err.message);
    }
  },

  createCategory: async (data) => {
    try {
      const res = await productAPI.createCategory(data);
      if (res?.success) {
        toast.success('Category added');
        await get().fetchCategories();
        return res.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create category');
      throw err;
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 }
    }));
    get().fetchProducts();
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page }
    }));
    get().fetchProducts();
  }
}));

export default useProductStore;
