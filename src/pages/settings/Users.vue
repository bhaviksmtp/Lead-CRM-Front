<template>
  <div class="d-flex flex-column gap-4">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-people-fill"></i>
          Team Members
        </h2>
        <p class="page-header-sub">Configure team roles and manage staff and salesperson access accounts</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary" id="add-member-btn">
        <i class="bi bi-person-plus-fill"></i> Add Team Member
      </button>
    </div>

    <!-- Reusable DataTable -->
    <DataTable
      :columns="userColumns"
      :data="users"
      :loading="loading"
      :searchable="true"
      search-placeholder="Search name, email, phone..."
      :pagination="true"
      :page-size="10"
      empty-icon="bi-people"
      empty-title="No team members found"
      empty-description="Add your first team member to get started."
    >
      <template #name="{ item }">
        <div class="d-flex align-items-center gap-2">
          <div class="avatar" style="width:32px;height:32px;font-size:0.75rem;">
            {{ item.name.charAt(0).toUpperCase() }}
          </div>
          <span class="fw-600 text-dark">{{ item.name }}</span>
        </div>
      </template>

      <template #phone="{ item }">
        <span style="font-size:0.875rem;">{{ item.phone || '—' }}</span>
      </template>

      <template #role="{ item }">
        <span class="badge badge-low">{{ item.roles?.[0] || 'Salesperson' }}</span>
      </template>

      <template #status="{ item }">
        <span :class="['badge', item.is_active ? 'badge-completed' : 'badge-cancelled']">
          <i :class="item.is_active ? 'bi bi-check-circle-fill' : 'bi bi-dash-circle-fill'"></i>
          {{ item.is_active ? 'Active' : 'Inactive' }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="d-flex gap-2">
          <button @click="openEditModal(item)" class="btn btn-secondary btn-sm" title="Edit Member">
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button
            v-if="item.is_active"
            @click="deactivateUser(item)"
            class="btn btn-danger btn-sm"
            :disabled="currentUser.id === item.id"
            title="Deactivate Account"
          >
            <i class="bi bi-person-x"></i> Deactivate
          </button>
        </div>
      </template>

      <template #empty>
        <div class="empty-state py-5">
          <div class="empty-state-icon"><i class="bi bi-people"></i></div>
          <span class="empty-state-title">No team members found</span>
          <p class="empty-state-desc">Add your first team member to get started.</p>
          <button @click="openCreateModal" class="btn btn-primary mt-2">
            <i class="bi bi-person-plus-fill"></i> Add Team Member
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="isEdit ? 'bi bi-person-gear' : 'bi bi-person-plus-fill'" class="text-primary-custom"></i>
            {{ isEdit ? 'Edit Team Member' : 'Add Team Member' }}
          </h5>
          <button @click="showModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Full Name *</label>
              <input
                v-model="form.name"
                type="text"
                :class="['form-control', { 'is-invalid': validationErrors.name }]"
                @input="clearError('name')"
                required
              />
              <div v-if="validationErrors.name" class="invalid-feedback">{{ validationErrors.name[0] }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Email Address *</label>
              <input
                v-model="form.email"
                type="email"
                :class="['form-control', { 'is-invalid': validationErrors.email }]"
                @input="clearError('email')"
                required
              />
              <div v-if="validationErrors.email" class="invalid-feedback">{{ validationErrors.email[0] }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Mobile Number</label>
              <input
                v-model="form.phone"
                type="text"
                :class="['form-control', { 'is-invalid': validationErrors.phone }]"
                @input="clearError('phone')"
              />
              <div v-if="validationErrors.phone" class="invalid-feedback">{{ validationErrors.phone[0] }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Access Role *</label>
              <select
                v-model="form.role"
                :class="['form-select', { 'is-invalid': validationErrors.role }]"
                @change="clearError('role')"
                required
              >
                <option v-for="r in roles" :key="r.id" :value="r.name">
                  {{ r.name }}
                </option>
              </select>
              <div v-if="validationErrors.role" class="invalid-feedback">{{ validationErrors.role[0] }}</div>
            </div>

            <div v-if="!isEdit" class="mb-3">
              <label class="form-label">Access Password *</label>
              <input
                v-model="form.password"
                type="password"
                :class="['form-control', { 'is-invalid': validationErrors.password }]"
                @input="clearError('password')"
                required
              />
              <div v-if="validationErrors.password" class="invalid-feedback">{{ validationErrors.password[0] }}</div>
            </div>

            <div v-if="!isEdit" class="mb-3">
              <label class="form-label">Confirm Password *</label>
              <input
                v-model="form.password_confirmation"
                type="password"
                :class="['form-control', { 'is-invalid': validationErrors.password_confirmation }]"
                @input="clearError('password_confirmation')"
                required
              />
              <div v-if="validationErrors.password_confirmation" class="invalid-feedback">{{ validationErrors.password_confirmation[0] }}</div>
            </div>

            <div v-if="isEdit && currentUser.id !== activeId" class="mb-0 d-flex align-items-center gap-3">
              <label class="toggle-switch">
                <input v-model="form.is_active" type="checkbox" />
                <span class="toggle-slider"></span>
              </label>
              <span class="form-label mb-0">Account active and enabled</span>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-check-lg"></i>
              {{ isEdit ? 'Update Member' : 'Add Member' }}
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
import usersApi from '@/api/users';
import rolesApi from '@/api/roles';
import { useToast } from '@/composables/useToast';
import { useSwal } from '@/composables/useSwal';

const authStore = useAuthStore();
const toast = useToast();
const { confirmDeactivate } = useSwal();

const loading = ref(true);
const saving = ref(false);
const users = ref([]);
const roles = ref([]);

const userColumns = [
  { key: 'name', label: 'Name', sortable: true, minWidth: '160px' },
  { key: 'email', label: 'Email', sortable: true, minWidth: '180px' },
  { key: 'phone', label: 'Phone', sortable: true, minWidth: '130px' },
  { key: 'role', label: 'Role', sortable: true, minWidth: '120px' },
  { key: 'status', label: 'Status', sortable: true, minWidth: '100px' },
  { key: 'actions', label: 'Actions', minWidth: '140px', align: 'end' }
];

const showModal = ref(false);
const isEdit = ref(false);
const activeId = ref(null);
const validationErrors = ref({});

const currentUser = computed(() => authStore.user);

const form = reactive({
  name: '',
  email: '',
  phone: '',
  role: 'Salesperson',
  password: '',
  password_confirmation: '',
  is_active: true
});

const clearError = (field) => {
  if (validationErrors.value[field]) {
    delete validationErrors.value[field];
  }
};

const loadUsers = async () => {
  try {
    const [usersRes, rolesRes] = await Promise.all([
      usersApi.getUsers(),
      rolesApi.getRoles().catch(() => ({ data: { roles: [] } }))
    ]);
    users.value = usersRes.data.users;
    if (rolesRes.data?.roles?.length) {
      roles.value = rolesRes.data.roles;
    } else {
      roles.value = [
        { id: 1, name: 'Company Admin' },
        { id: 2, name: 'Manager' },
        { id: 3, name: 'Salesperson' }
      ];
    }
    loading.value = false;
  } catch (err) {
    toast.error('Failed to load team list.');
  }
};

onMounted(() => {
  loadUsers();
});

const openCreateModal = () => {
  isEdit.value = false;
  activeId.value = null;
  form.name = '';
  form.email = '';
  form.phone = '';
  form.role = 'Salesperson';
  form.password = '';
  form.password_confirmation = '';
  form.is_active = true;
  validationErrors.value = {};
  showModal.value = true;
};

const openEditModal = (user) => {
  isEdit.value = true;
  activeId.value = user.id;
  form.name = user.name;
  form.email = user.email;
  form.phone = user.phone || '';
  form.role = user.roles?.[0] || 'Salesperson';
  form.is_active = user.is_active;
  validationErrors.value = {};
  showModal.value = true;
};

const submitForm = async () => {
  validationErrors.value = {};
  if (!isEdit.value && form.password !== form.password_confirmation) {
    validationErrors.value.password_confirmation = ['Passwords do not match.'];
    toast.error('Passwords do not match.');
    return;
  }
  saving.value = true;
  try {
    if (isEdit.value) {
      await usersApi.updateUser(activeId.value, form);
      toast.success('User updated successfully.');
    } else {
      await usersApi.createUser(form);
      toast.success('User registered successfully.');
    }
    showModal.value = false;
    loadUsers();
  } catch (err) {
    if (err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors;
      const firstMsg = Object.values(err.response.data.errors).flat()[0];
      toast.error(firstMsg || 'Failed to save user.');
    } else {
      toast.error(err.response?.data?.message || err.message || 'Failed to save user.');
    }
  } finally {
    saving.value = false;
  }
};

const deactivateUser = async (user) => {
  const confirmed = await confirmDeactivate(user.name);
  if (confirmed) {
    try {
      await usersApi.deleteUser(user.id);
      toast.success('User deactivated.');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to deactivate user.');
    }
  }
};
</script>
