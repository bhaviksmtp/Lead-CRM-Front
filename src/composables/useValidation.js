import { ref } from 'vue';
import { useToast } from './useToast';

export function useFormValidation() {
  const errors = ref({});
  const toast = useToast();

  const clearErrors = (field) => {
    if (field) {
      if (errors.value[field]) {
        const newErr = { ...errors.value };
        delete newErr[field];
        errors.value = newErr;
      }
    } else {
      errors.value = {};
    }
  };

  const setErrors = (newErrors) => {
    errors.value = newErrors || {};
  };

  const getError = (field) => {
    if (!errors.value || !errors.value[field]) return null;
    const err = errors.value[field];
    return Array.isArray(err) ? err[0] : err;
  };

  const hasError = (field) => {
    return !!(errors.value && errors.value[field]);
  };

  const handleApiError = (err, fallbackMessage = 'An error occurred. Please check input values.') => {
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors;
      const errorValues = Object.values(err.response.data.errors).flat();
      const firstMsg = errorValues[0];
      toast.error(firstMsg || 'Validation failed. Please correct the highlighted errors.');
      return true;
    } else if (err.errors) {
      errors.value = err.errors;
      const errorValues = Object.values(err.errors).flat();
      const firstMsg = errorValues[0];
      toast.error(firstMsg || 'Validation failed. Please correct the highlighted errors.');
      return true;
    } else {
      errors.value = {};
      const msg = err.response?.data?.message || err.message || fallbackMessage;
      toast.error(msg);
      return false;
    }
  };

  return {
    errors,
    clearErrors,
    setErrors,
    getError,
    hasError,
    handleApiError
  };
}
