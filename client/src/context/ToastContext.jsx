import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const duration = toast.duration || 4000;
    const newToast = {
      id,
      type: toast.type || 'info', // success, error, warning, info
      title: toast.title,
      message: toast.message,
    };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((message, title) => addToast({ type: 'success', message, title }), [addToast]);
  const showError = useCallback((message, title) => addToast({ type: 'error', message, title }), [addToast]);
  const showWarning = useCallback((message, title) => addToast({ type: 'warning', message, title }), [addToast]);
  const showInfo = useCallback((message, title) => addToast({ type: 'info', message, title }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <div className="toast-container" aria-live="polite" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`} role="status">
            <div className="toast__content">
              {t.title && <div className="toast__title">{t.title}</div>}
              <div>{t.message}</div>
            </div>
            <button
              type="button"
              className="toast__close"
              onClick={() => removeToast(t.id)}
              aria-label="Close notification"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showSuccess: () => {},
      showError: () => {},
      showWarning: () => {},
      showInfo: () => {},
      addToast: () => {},
    };
  }
  return context;
};

export default ToastContext;
