import { useState, useCallback } from 'react';
import { ToastType } from '../components/ToastAlert';

interface ToastState {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  position?: 'top' | 'bottom';
  showCloseButton?: boolean;
}

const initialState: ToastState = {
  visible: false,
  type: 'info',
  title: '',
  message: '',
  duration: 4000,
  position: 'top',
  showCloseButton: true,
};

export const useToast = () => {
  const [toastState, setToastState] = useState<ToastState>(initialState);

  const showToast = useCallback((config: Partial<ToastState> & { title: string; type: ToastType }) => {
    setToastState({
      ...initialState,
      ...config,
      visible: true,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToastState(prev => ({ ...prev, visible: false }));
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    showToast({ type: 'success', title, message, duration });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    showToast({ type: 'error', title, message, duration });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    showToast({ type: 'warning', title, message, duration });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    showToast({ type: 'info', title, message, duration });
  }, [showToast]);

  return {
    toastState,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};