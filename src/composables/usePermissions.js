import { useAuthStore } from '@/stores/auth';

export function usePermissions() {
  const authStore = useAuthStore();

  const can = (permission) => {
    return authStore.hasPermission(permission);
  };

  const canAny = (permissions = []) => {
    return authStore.hasAnyPermission(permissions);
  };

  const canAll = (permissions = []) => {
    return authStore.hasAllPermissions(permissions);
  };

  const hasRole = (role) => {
    return authStore.hasRole(role);
  };

  return {
    can,
    canAny,
    canAll,
    hasRole
  };
}
