import { ref } from 'vue';

const toasts = ref([]);

export function useToast() {
  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };

  const success = (message, duration) => addToast(message, 'success', duration);
  const error = (message, duration) => addToast(message, 'danger', duration);

  return {
    toasts,
    success,
    error,
    removeToast
  };
}
