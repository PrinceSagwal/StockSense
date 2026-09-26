import { create } from 'zustand';

const useConfirmStore = create((set) => ({
  isOpen: false,
  title: 'Are you sure?',
  message: 'This action cannot be undone.',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'warning', // 'danger' | 'warning' | 'success' | 'info'
  resolveCallback: null,

  confirm: ({
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning'
  }) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        resolveCallback: resolve
      });
    });
  },

  onConfirm: () => {
    set((state) => {
      if (state.resolveCallback) state.resolveCallback(true);
      return { isOpen: false, resolveCallback: null };
    });
  },

  onCancel: () => {
    set((state) => {
      if (state.resolveCallback) state.resolveCallback(false);
      return { isOpen: false, resolveCallback: null };
    });
  }
}));

export const confirmDialog = (options) => useConfirmStore.getState().confirm(options);

export default useConfirmStore;
