import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

/**
 * Modern SweetAlert2 Confirmation Dialogs tailored for Convera CRM
 */
export function useSwal() {
  const confirmAction = async ({
    title = 'Are you sure?',
    text = 'This action cannot be undone.',
    icon = 'warning',
    confirmButtonText = 'Yes, proceed',
    cancelButtonText = 'Cancel',
    isDelete = false,
  } = {}) => {
    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: isDelete ? (confirmButtonText === 'Yes, proceed' ? 'Yes, delete' : confirmButtonText) : confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
      focusCancel: isDelete,
      buttonsStyling: false,
      customClass: {
        popup: 'crm-swal-popup',
        title: 'crm-swal-title',
        htmlContainer: 'crm-swal-text',
        confirmButton: isDelete ? 'btn btn-danger px-4' : 'btn btn-primary px-4',
        cancelButton: 'btn btn-secondary px-4 me-2',
        actions: 'crm-swal-actions'
      }
    });

    return result.isConfirmed;
  };

  const confirmDelete = async (itemName = 'this item', customText) => {
    return confirmAction({
      title: `Delete ${itemName}?`,
      text: customText || `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      icon: 'warning',
      confirmButtonText: 'Yes, delete',
      isDelete: true
    });
  };

  const confirmDeactivate = async (userName = 'this user') => {
    return confirmAction({
      title: `Deactivate ${userName}?`,
      text: `Are you sure you want to deactivate ${userName}'s account? They will lose system access.`,
      icon: 'warning',
      confirmButtonText: 'Yes, deactivate',
      isDelete: true
    });
  };

  const confirmLogout = async () => {
    return confirmAction({
      title: 'Sign Out?',
      text: 'Are you sure you want to end your current session?',
      icon: 'question',
      confirmButtonText: 'Sign Out',
      cancelButtonText: 'Stay Logged In',
      isDelete: false
    });
  };

  const alertSuccess = (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'OK',
      buttonsStyling: false,
      customClass: {
        popup: 'crm-swal-popup',
        confirmButton: 'btn btn-primary px-4'
      }
    });
  };

  const alertError = (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'OK',
      buttonsStyling: false,
      customClass: {
        popup: 'crm-swal-popup',
        confirmButton: 'btn btn-primary px-4'
      }
    });
  };

  return {
    confirmAction,
    confirmDelete,
    confirmDeactivate,
    confirmLogout,
    alertSuccess,
    alertError
  };
}
