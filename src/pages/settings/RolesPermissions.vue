<template>
  <div class="d-flex flex-column gap-4">
    <!-- Header -->
    <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-shield-lock-fill text-primary"></i>
          Roles & Permissions
        </h2>
        <p class="page-header-sub">Configure user roles, define granular module privileges, and enforce CRM security policies</p>
      </div>
      <div class="d-flex gap-2">
        <button @click="openCreateRoleModal" class="btn btn-primary" id="create-role-btn">
          <i class="bi bi-plus-circle-fill"></i> Create Custom Role
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="d-flex gap-2 border-bottom pb-2">
      <button
        @click="activeTab = 'roles'"
        :class="['btn btn-sm', activeTab === 'roles' ? 'btn-primary' : 'btn-light']"
      >
        <i class="bi bi-person-badge-fill me-1"></i> Role Profiles ({{ roles.length }})
      </button>
      <button
        @click="activeTab = 'matrix'"
        :class="['btn btn-sm', activeTab === 'matrix' ? 'btn-primary' : 'btn-light']"
      >
        <i class="bi bi-grid-3x3-gap-fill me-1"></i> Permissions Matrix
      </button>
      <button
        @click="activeTab = 'users'"
        :class="['btn btn-sm', activeTab === 'users' ? 'btn-primary' : 'btn-light']"
      >
        <i class="bi bi-people-fill me-1"></i> User Access Control ({{ users.length }})
      </button>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="loading" class="row g-4">
      <div v-for="i in 3" :key="i" class="col-12 col-md-6 col-xl-4">
        <div class="card p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="skeleton" style="height: 18px; width: 120px;"></div>
            <div class="skeleton" style="height: 20px; width: 50px; border-radius: 10px;"></div>
          </div>
          <div class="skeleton mb-2" style="height: 12px; width: 90%;"></div>
          <div class="skeleton mb-4" style="height: 12px; width: 60%;"></div>
          <div class="d-flex justify-content-between align-items-center">
            <div class="skeleton" style="height: 28px; width: 60px; border-radius: 6px;"></div>
            <div class="skeleton" style="height: 28px; width: 60px; border-radius: 6px;"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <!-- TAB 1: ROLE PROFILES -->
      <div v-if="activeTab === 'roles'" class="row g-4">
        <div v-for="role in roles" :key="role.id" class="col-12 col-md-6 col-xl-4">
          <div class="card h-100 shadow-sm border-0 position-relative role-card" style="border-radius:12px; transition: transform 0.2s, box-shadow 0.2s;">
            <div class="card-body d-flex flex-column p-4">
              <!-- Top Row -->
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="d-flex align-items-center gap-3">
                  <div
                    class="role-icon-box"
                    :style="getRoleIconStyle(role.name)"
                  >
                    <i :class="getRoleIcon(role.name)"></i>
                  </div>
                  <div>
                    <h5 class="fw-bold mb-1 text-dark">{{ role.name }}</h5>
                    <span :class="['badge', role.is_system ? 'badge-low' : 'badge-completed']" style="font-size:0.75rem;">
                      <i :class="role.is_system ? 'bi bi-lock-fill' : 'bi bi-stars'"></i>
                      {{ role.is_system ? 'System Role' : 'Custom Role' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Stats bar -->
              <div class="bg-light rounded-3 p-3 mb-3 d-flex justify-content-around text-center">
                <div>
                  <div class="fw-bold fs-6 text-dark">{{ role.user_count }}</div>
                  <div class="text-muted" style="font-size:0.75rem;">Assigned Users</div>
                </div>
                <div style="border-right: 1px solid var(--border-color);"></div>
                <div>
                  <div class="fw-bold fs-6 text-primary">{{ role.permissions_count }} / {{ totalAvailablePermissions }}</div>
                  <div class="text-muted" style="font-size:0.75rem;">Permissions</div>
                </div>
              </div>

              <!-- Key Capabilities Preview -->
              <div class="mb-4 flex-grow-1">
                <span class="text-muted fw-600 d-block mb-2" style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.5px;">Active Privileges</span>
                <div class="d-flex flex-wrap gap-1">
                  <span
                    v-for="perm in (role.permissions || []).slice(0, 5)"
                    :key="perm"
                    class="badge bg-white text-secondary border"
                    style="font-size:0.75rem; font-weight:500;"
                  >
                    <i class="bi bi-check2 text-success me-1"></i>{{ perm }}
                  </span>
                  <span
                    v-if="(role.permissions || []).length > 5"
                    class="badge bg-white text-primary border"
                    style="font-size:0.75rem; font-weight:600;"
                  >
                    +{{ role.permissions.length - 5 }} more
                  </span>
                  <span
                    v-if="!role.permissions || role.permissions.length === 0"
                    class="text-muted"
                    style="font-size:0.8rem; font-style:italic;"
                  >
                    No permissions assigned
                  </span>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="d-flex gap-2 pt-3 border-top mt-auto">
                <button
                  @click="openEditRoleModal(role)"
                  class="btn btn-primary btn-sm flex-grow-1"
                  title="Configure role permissions"
                >
                  <i class="bi bi-sliders me-1"></i> Edit Permissions
                </button>
                <button
                  v-if="!role.is_system"
                  @click="confirmDeleteRole(role)"
                  class="btn btn-outline-danger btn-sm"
                  title="Delete this role"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: PERMISSIONS MATRIX -->
      <div v-else-if="activeTab === 'matrix'" class="card shadow-sm border-0" style="border-radius:12px; overflow:hidden;">
        <div class="card-body p-0 table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead style="background-color: var(--bg-tertiary);">
              <tr>
                <th style="min-width: 260px; padding: 16px 20px;">Feature / Permission</th>
                <th v-for="role in roles" :key="role.id" class="text-center" style="min-width: 140px; padding: 16px 12px;">
                  <div class="fw-bold text-dark">{{ role.name }}</div>
                  <span :class="['badge', role.is_system ? 'badge-low' : 'badge-completed']" style="font-size:0.7rem;">
                    {{ role.is_system ? 'System' : 'Custom' }}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="group in permissionGroups" :key="group.name">
                <tr style="background-color: #f8fafc; font-weight:600;">
                  <td :colspan="roles.length + 1" style="padding: 12px 20px; color: var(--primary);">
                    <i :class="['bi', group.icon, 'me-2']"></i>
                    {{ group.name }}
                    <span class="text-muted fw-normal ms-2" style="font-size:0.8rem;">— {{ group.description }}</span>
                  </td>
                </tr>
                <tr v-for="perm in group.permissions" :key="perm.name">
                  <td style="padding: 12px 20px 12px 36px;">
                    <div class="fw-600 text-dark" style="font-size:0.875rem;">{{ perm.label }}</div>
                    <div class="text-muted" style="font-size:0.75rem;">{{ perm.description }}</div>
                  </td>
                  <td v-for="role in roles" :key="role.id" class="text-center">
                    <span v-if="role.permissions && role.permissions.includes(perm.name)" class="text-success fs-5">
                      <i class="bi bi-check-circle-fill"></i>
                    </span>
                    <span v-else class="text-muted opacity-25 fs-6">
                      <i class="bi bi-dash-circle"></i>
                    </span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: USER ACCESS CONTROL -->
      <div v-else-if="activeTab === 'users'" class="card shadow-sm border-0" style="border-radius:12px;">
        <div class="card-body p-0 table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead style="background-color: var(--bg-tertiary);">
              <tr>
                <th style="padding: 16px 20px;">User</th>
                <th>Email</th>
                <th>Assigned Role</th>
                <th>Effective Permissions</th>
                <th>Status</th>
                <th class="text-end" style="padding: 16px 20px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td style="padding: 14px 20px;">
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar" style="width:34px;height:34px;font-size:0.8rem;background:linear-gradient(135deg, #4f46e5, #6366f1);color:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;">
                      {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="fw-600 text-dark">{{ user.name }}</div>
                      <div v-if="currentUser.id === user.id" class="badge bg-primary-light text-primary" style="font-size:0.65rem;">You</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style="font-size:0.875rem;">{{ user.email }}</span>
                </td>
                <td>
                  <span :class="['badge', getRoleBadgeClass(user.roles?.[0])]">
                    {{ user.roles?.[0] || 'Salesperson' }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">
                    <i class="bi bi-key-fill text-warning me-1"></i>
                    {{ user.permissions?.length || 0 }} Privileges Active
                  </span>
                </td>
                <td>
                  <span :class="['badge', user.is_active ? 'badge-completed' : 'badge-cancelled']">
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end" style="padding: 14px 20px;">
                  <button
                    @click="openUserAccessModal(user)"
                    class="btn btn-secondary btn-sm"
                    title="Change Role & Privileges"
                  >
                    <i class="bi bi-shield-shaded me-1"></i> Configure Access
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- CREATE / EDIT ROLE MODAL -->
    <div v-if="showRoleModal" class="modal-overlay" @click.self="showRoleModal = false">
      <div class="modal-content" style="max-width: 750px; border-radius: 16px; max-height: 90vh; display:flex; flex-direction:column;">
        <div class="modal-header d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 class="modal-title d-flex align-items-center gap-2 mb-0">
            <i :class="isEditRole ? 'bi bi-sliders text-primary' : 'bi bi-plus-circle-fill text-primary'"></i>
            <span>{{ isEditRole ? `Edit Role: ${roleForm.name}` : 'Create New Custom Role' }}</span>
          </h5>
          <button @click="showRoleModal = false" class="modal-close"><i class="bi bi-x-lg"></i></button>
        </div>

        <form @submit.prevent="submitRoleForm" style="display:flex; flex-direction:column; overflow:hidden; flex-grow:1;">
          <div class="modal-body p-4" style="overflow-y: auto; max-height: calc(90vh - 140px);">
            <!-- Role Name -->
            <div class="mb-4">
              <label class="form-label fw-bold">Role Name *</label>
              <input
                v-model="roleForm.name"
                type="text"
                :class="['form-control', { 'is-invalid': roleErrors.name }]"
                placeholder="e.g. Sales Team Lead, Marketing Specialist"
                :disabled="isEditRole && isSystemRoleSelected"
                @input="clearRoleError('name')"
                required
              />
              <div v-if="roleErrors.name" class="invalid-feedback">{{ roleErrors.name[0] }}</div>
              <small v-if="isEditRole && isSystemRoleSelected" class="text-muted">
                System role names cannot be modified, but their assigned permissions can be customized.
              </small>
            </div>

            <!-- Permission Selection Group -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <label class="form-label fw-bold mb-0">Module Permissions</label>
                <div class="d-flex gap-2">
                  <button type="button" @click="selectAllGlobal" class="btn btn-xs btn-outline-primary" style="font-size:0.75rem;">
                    <i class="bi bi-check-all"></i> Select All
                  </button>
                  <button type="button" @click="deselectAllGlobal" class="btn btn-xs btn-outline-secondary" style="font-size:0.75rem;">
                    <i class="bi bi-x"></i> Clear All
                  </button>
                </div>
              </div>

              <!-- Categories -->
              <div class="d-flex flex-column gap-3">
                <div
                  v-for="group in permissionGroups"
                  :key="group.name"
                  class="card border p-3"
                  style="border-radius:10px; background-color: #fafbfc;"
                >
                  <!-- Group Header -->
                  <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                      <i :class="['bi', group.icon, 'text-primary']"></i>
                      <span class="fw-bold text-dark" style="font-size:0.9rem;">{{ group.name }}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge bg-white text-secondary border" style="font-size:0.7rem;">
                        {{ getGroupSelectedCount(group) }}/{{ group.permissions.length }} active
                      </span>
                      <button
                        type="button"
                        @click="toggleGroupPermissions(group)"
                        class="btn btn-link p-0 text-decoration-none"
                        style="font-size:0.75rem;"
                      >
                        {{ isGroupFullySelected(group) ? 'Deselect All' : 'Select All' }}
                      </button>
                    </div>
                  </div>

                  <!-- Group Permissions Checkbox Grid -->
                  <div class="row g-2">
                    <div
                      v-for="perm in group.permissions"
                      :key="perm.name"
                      class="col-12 col-md-6"
                    >
                      <label
                        class="d-flex align-items-start gap-2 p-2 rounded-2 border bg-white cursor-pointer h-100"
                        :style="roleForm.permissions.includes(perm.name) ? 'border-color: var(--primary) !important; background-color: var(--indigo-50) !important;' : ''"
                      >
                        <input
                          type="checkbox"
                          :value="perm.name"
                          v-model="roleForm.permissions"
                          class="form-check-input mt-1"
                        />
                        <div style="font-size:0.8rem; line-height:1.3;">
                          <div class="fw-600 text-dark">{{ perm.label }}</div>
                          <div class="text-muted" style="font-size:0.72rem;">{{ perm.description }}</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer p-3 border-top bg-light d-flex justify-content-end gap-2">
            <button type="button" @click="showRoleModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="savingRole">
              <span v-if="savingRole" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <span v-if="savingRole">Saving...</span>
              <span v-else><i class="bi bi-check-lg"></i> {{ isEditRole ? 'Update Role' : 'Create Role' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- CONFIGURE USER ACCESS MODAL -->
    <div v-if="showUserModal" class="modal-overlay" @click.self="showUserModal = false">
      <div class="modal-content" style="max-width: 550px; border-radius: 16px;">
        <div class="modal-header d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 class="modal-title d-flex align-items-center gap-2 mb-0">
            <i class="bi bi-shield-shaded text-primary"></i>
            <span>Configure Access: {{ selectedUser?.name }}</span>
          </h5>
          <button @click="showUserModal = false" class="modal-close"><i class="bi bi-x-lg"></i></button>
        </div>

        <form @submit.prevent="submitUserAccess">
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label fw-bold">Primary Role Assignment *</label>
              <select v-model="userAccessForm.role" class="form-select" required>
                <option v-for="r in roles" :key="r.id" :value="r.name">
                  {{ r.name }} ({{ r.is_system ? 'System Default' : 'Custom' }})
                </option>
              </select>
              <small class="text-muted d-block mt-1">
                Assigning a role grants all privileges configured under that role profile.
              </small>
            </div>

            <div class="p-3 bg-light rounded-3 border">
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-info-circle-fill text-primary"></i>
                <span class="fw-bold" style="font-size:0.85rem;">Role Inherited Permissions</span>
              </div>
              <div class="d-flex flex-wrap gap-1">
                <span
                  v-for="p in getSelectedRolePermissions"
                  :key="p"
                  class="badge bg-white text-secondary border"
                  style="font-size:0.75rem;"
                >
                  <i class="bi bi-check2 text-success me-1"></i>{{ p }}
                </span>
                <span v-if="!getSelectedRolePermissions.length" class="text-muted" style="font-size:0.8rem;">
                  No permissions associated with this role.
                </span>
              </div>
            </div>
          </div>

          <div class="modal-footer p-3 border-top bg-light d-flex justify-content-end gap-2">
            <button type="button" @click="showUserModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="savingUserAccess">
              <span v-if="savingUserAccess" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <span v-if="savingUserAccess">Saving...</span>
              <span v-else><i class="bi bi-check-lg"></i> Apply Access</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { useSwal } from '@/composables/useSwal';
import rolesApi from '@/api/roles';
import usersApi from '@/api/users';

const authStore = useAuthStore();
const toast = useToast();
const { confirmDelete } = useSwal();

const currentUser = computed(() => authStore.user);

const loading = ref(true);
const activeTab = ref('roles');

const roles = ref([]);
const users = ref([]);
const permissionGroups = ref([]);
const allPermissionsList = ref([]);

const showRoleModal = ref(false);
const isEditRole = ref(false);
const selectedRoleId = ref(null);
const isSystemRoleSelected = ref(false);
const savingRole = ref(false);
const roleErrors = ref({});

const roleForm = reactive({
  name: '',
  permissions: []
});

const showUserModal = ref(false);
const selectedUser = ref(null);
const savingUserAccess = ref(false);
const userAccessForm = reactive({
  role: 'Salesperson',
  permissions: []
});

const clearRoleError = (field) => {
  if (roleErrors.value[field]) {
    delete roleErrors.value[field];
  }
};

const totalAvailablePermissions = computed(() => {
  return allPermissionsList.value.length || 13;
});

const loadData = async () => {
  loading.value = true;
  try {
    const [rolesRes, permsRes, usersRes] = await Promise.all([
      rolesApi.getRoles(),
      rolesApi.getPermissions(),
      usersApi.getUsers()
    ]);

    roles.value = rolesRes.data.roles;
    permissionGroups.value = permsRes.data.grouped;
    allPermissionsList.value = permsRes.data.permissions;
    users.value = usersRes.data.users;
  } catch (err) {
    toast.error('Failed to load role and permission data.');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

// Role visual helpers
const getRoleIcon = (name) => {
  switch (name) {
    case 'Super Admin': return 'bi-shield-shaded';
    case 'Company Admin': return 'bi-shield-fill-check';
    case 'Manager': return 'bi-briefcase-fill';
    case 'Salesperson': return 'bi-person-badge';
    default: return 'bi-award-fill';
  }
};

const getRoleIconStyle = (name) => {
  switch (name) {
    case 'Super Admin':
    case 'Company Admin':
      return 'width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.2rem;';
    case 'Manager':
      return 'width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#0284c7,#38bdf8);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.2rem;';
    case 'Salesperson':
      return 'width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#059669,#10b981);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.2rem;';
    default:
      return 'width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#d97706,#fbbf24);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.2rem;';
  }
};

const getRoleBadgeClass = (roleName) => {
  switch (roleName) {
    case 'Super Admin':
    case 'Company Admin':
      return 'badge-completed';
    case 'Manager':
      return 'badge-low';
    default:
      return 'badge-medium';
  }
};

// Modal handlers
const openCreateRoleModal = () => {
  isEditRole.value = false;
  selectedRoleId.value = null;
  isSystemRoleSelected.value = false;
  roleForm.name = '';
  roleForm.permissions = [];
  roleErrors.value = {};
  showRoleModal.value = true;
};

const openEditRoleModal = (role) => {
  isEditRole.value = true;
  selectedRoleId.value = role.id;
  isSystemRoleSelected.value = role.is_system;
  roleForm.name = role.name;
  roleForm.permissions = [...(role.permissions || [])];
  roleErrors.value = {};
  showRoleModal.value = true;
};

// Global checkboxes
const selectAllGlobal = () => {
  roleForm.permissions = [...allPermissionsList.value];
};

const deselectAllGlobal = () => {
  roleForm.permissions = [];
};

// Category checkboxes
const getGroupSelectedCount = (group) => {
  return group.permissions.filter(p => roleForm.permissions.includes(p.name)).length;
};

const isGroupFullySelected = (group) => {
  return group.permissions.every(p => roleForm.permissions.includes(p.name));
};

const toggleGroupPermissions = (group) => {
  const permNames = group.permissions.map(p => p.name);
  if (isGroupFullySelected(group)) {
    // Remove group permissions
    roleForm.permissions = roleForm.permissions.filter(p => !permNames.includes(p));
  } else {
    // Add all missing
    permNames.forEach(p => {
      if (!roleForm.permissions.includes(p)) {
        roleForm.permissions.push(p);
      }
    });
  }
};

// Submit role
const submitRoleForm = async () => {
  savingRole.value = true;
  roleErrors.value = {};
  try {
    if (isEditRole.value) {
      await rolesApi.updateRole(selectedRoleId.value, roleForm);
      toast.success('Role updated successfully.');
    } else {
      await rolesApi.createRole(roleForm);
      toast.success('Role created successfully.');
    }
    showRoleModal.value = false;
    await loadData();
  } catch (err) {
    if (err.response?.data?.errors) {
      roleErrors.value = err.response.data.errors;
      const firstMsg = Object.values(err.response.data.errors).flat()[0];
      toast.error(firstMsg || 'Failed to save role.');
    } else {
      toast.error(err.response?.data?.message || err.message || 'Failed to save role.');
    }
  } finally {
    savingRole.value = false;
  }
};

// Delete role
const confirmDeleteRole = async (role) => {
  const confirmed = await confirmDelete(`role "${role.name}"`);
  if (confirmed) {
    try {
      await rolesApi.deleteRole(role.id);
      toast.success('Role removed successfully.');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete role.');
    }
  }
};

// User access modal
const openUserAccessModal = (user) => {
  selectedUser.value = user;
  userAccessForm.role = user.roles?.[0] || 'Salesperson';
  userAccessForm.permissions = [...(user.permissions || [])];
  showUserModal.value = true;
};

const getSelectedRolePermissions = computed(() => {
  const r = roles.value.find(role => role.name === userAccessForm.role);
  return r?.permissions || [];
});

const submitUserAccess = async () => {
  if (!selectedUser.value) return;
  savingUserAccess.value = true;
  try {
    await rolesApi.updateUserPermissions(selectedUser.value.id, {
      role: userAccessForm.role
    });
    toast.success('User access privileges updated.');
    showUserModal.value = false;
    await loadData();
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || 'Failed to update user access.');
  } finally {
    savingUserAccess.value = false;
  }
};
</script>

<style scoped>
.role-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md) !important;
}
.cursor-pointer {
  cursor: pointer;
}
.btn-xs {
  padding: 0.2rem 0.5rem;
  line-height: 1.2;
}
</style>
