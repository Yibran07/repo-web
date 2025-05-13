import { toast } from 'react-toastify';

/**
 * Show a success toast notification for entity operations
 * @param {string} entityType - The type of entity (Usuario, Categoría, Facultad, etc.)
 * @param {string} action - The action performed (creado, actualizado, eliminado)
 * @param {Object} options - Additional toast options
 */
export const showSuccessToast = (entityType, action, options = {}) => {
  const defaultOptions = {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    toastId: `${entityType.toLowerCase()}-${action}-success` // Prevents duplicate toasts
  };

  const message = `¡${entityType} ${action} con éxito!`;
  toast.success(message, { ...defaultOptions, ...options });
};

/**
 * Show an error toast notification
 * @param {string} message - The error message
 * @param {Object} options - Additional toast options
 */
export const showErrorToast = (message, options = {}) => {
  const defaultOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    toastId: `error-${Date.now()}` // Unique ID based on timestamp
  };

  toast.error(message, { ...defaultOptions, ...options });
};

/**
 * Show an info toast notification
 * @param {string} message - The info message
 * @param {Object} options - Additional toast options
 */
export const showInfoToast = (message, options = {}) => {
  const defaultOptions = {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined
  };

  toast.info(message, { ...defaultOptions, ...options });
};
