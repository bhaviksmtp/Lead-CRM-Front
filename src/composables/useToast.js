import { ref } from 'vue';

const toasts = ref([]);

function formatMessage(msg) {
  if (!msg) return 'An unexpected error occurred. Please try again.';
  if (typeof msg === 'string') {
    if (msg.includes('SQLSTATE') || msg.includes('PermissionDoesNotExist') || msg.includes('Exception')) {
      return 'You do not have permission or a configuration issue occurred.';
    }
    return msg;
  }
  if (typeof msg === 'object') {
    if (msg.response?.data?.message) {
      const serverMsg = msg.response.data.message;
      if (serverMsg.includes('SQLSTATE') || serverMsg.includes('PermissionDoesNotExist')) {
        return 'You do not have permission or a configuration issue occurred.';
      }
      return serverMsg;
    }
    if (msg.message && typeof msg.message === 'string') {
      if (msg.message.includes('Network Error')) {
        return 'Network connection error. Please check your network.';
      }
      return msg.message;
    }
  }
  return 'An unexpected error occurred. Please try again.';
}

export function useToast() {
  const addToast = (message, type = 'success', duration = 3500) => {
    const cleanMessage = formatMessage(message);
    const id = Date.now() + Math.random();
    toasts.value.push({ id, message: cleanMessage, type });
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };

  const success = (message, duration) => addToast(message, 'success', duration);
  const error = (message, duration) => addToast(message, 'danger', duration);
  const warning = (message, duration) => addToast(message, 'warning', duration);
  const info = (message, duration) => addToast(message, 'info', duration);

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast
  };
}
