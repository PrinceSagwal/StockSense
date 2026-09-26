import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
  collapsed:
    typeof window !== 'undefined'
      ? localStorage.getItem('stocksense_sidebar_collapsed') === 'true'
      : false,

  toggleSidebar: () =>
    set((state) => {
      const next = !state.collapsed;
      if (typeof window !== 'undefined') {
        localStorage.setItem('stocksense_sidebar_collapsed', String(next));
        // Trigger resize events so responsive chart containers (Recharts) adapt smoothly
        setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 320);
      }
      return { collapsed: next };
    }),

  setCollapsed: (collapsed) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stocksense_sidebar_collapsed', String(collapsed));
      setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 320);
    }
    set({ collapsed });
  },
}));

export default useSidebarStore;
