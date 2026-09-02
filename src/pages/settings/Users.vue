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

    <!-- Loading -->
    <div v-if="loading" class="d-flex flex-column align-items-center py-5 gap-3">
      <div class="spinner-custom"></div>
      <p style="color:var(--text-secondary);font-size:0.875rem;">Loading team members...</p>
    </div>

    <!-- Table -->
    <div v-else-if="users.length" class="table-responsive">
      <table class="table table-hover table-mobile-cards mb-0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <span class="td-label">Name</span>
              <div class="d-flex align-items-center gap-2">
                <div class="avatar" style="width:32px;height:32px;font-size:0.75rem;">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <span class="fw-600 text-dark">{{ user.name }}</span>
              </div>
            </td>
            <td>
              <span class="td-label">Email</span>
              <span style="font-size:0.875rem;">{{ user.email }}</span>
            </td>
            <td>
              <span class="td-label">Phone</span>
              <span style="font-size:0.875rem;">{{ user.phone || '—' }}</span>
            </td>
            <td>
              <span class="td-label">Role</span>
              <span class="badge badge-low">{{ user.roles?.[0] || 'Salesperson' }}</span>
            </td>
            <td>
              <span class="td-label">Status</span>
              <span :class="['badge', user.is_active ? 'badge-completed' : 'badge-cancelled']">
                <i :class="user.is_active ? 'bi bi-check-circle-fill' : 'bi bi-dash-circle-fill'"></i>
                {{ user.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <span class="td-label">Actions</span>
              <div class="d-flex gap-2">
                <button @click="openEditModal(user)" class="btn btn-secondary btn-sm" title="Edit Member">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <button
                  v-if="user.is_active"
                  @click="deactivateUser(user)"
                  class="btn btn-danger btn-sm"
                  :disabled="currentUser.id === user.id"
                  title="Deactivate Account"
                >
                  <i class="bi bi-person-x"></i> Deactivate
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div v-else class="card">
      <div class="card-body empty-state">
        <div class="empty-state-icon"><i class="bi bi-people"></i></div>
        <span class="empty-state-title">No team members found</span>
        <p class="empty-state-desc">Add your first team member to get started.</p>
        <button @click="openCreateModal" class="btn btn-primary mt-2">
          <i class="bi bi-person-plus-fill"></i> Add Team Member
        </button>
      </div>
    </div>

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
              <input v-model="form.name" type="text" class="form-control" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Email Address *</label>
              <input v-model="form.email" type="email" class="form-control" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Mobile Number</label>
              <input v-model="form.phone" type="text" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Access Role *</label>
              <select v-model="form.role" class="form-select" required>
                <option v-for="r in roles" :key="r.id" :value="r.name">
                  {{ r.name }}
                </option>
              </select>
            </div>

            <div v-if="!isEdit" class="mb-3">
              <label class="form-label">Access Password *</label>
              <input v-model="form.password" type="password" class="form-control" required />
            </div>

            <div v-if="!isEdit" class="mb-3">
              <label class="form-label">Confirm Password *</label>
              <input v-model="form.password_confirmation" type="password" class="form-control" required />
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
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-check-lg"></i> {{ isEdit ? 'Update Member' : 'Add Member' }}
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

const authStore = useAuthStore();
const toast = useToast();

const loading = ref(true);
const users = ref([]);
const roles = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const activeId = ref(null);

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
  showModal.value = true;
};

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await usersApi.updateUser(activeId.value, form);
      toast.success('User updated successfully.');
    } else {
      if (form.password !== form.password_confirmation) {
        toast.error('Passwords do not match.');
        return;
      }
      await usersApi.createUser(form);
      toast.success('User registered successfully.');
    }
    showModal.value = false;
    loadUsers();
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || 'Failed to save user.');
  }
};

const deactivateUser = async (user) => {
  if (confirm(`Deactivate account for: ${user.name}?`)) {
    try {
      await usersApi.deleteUser(user.id);
      toast.success('User deactivated.');
      loadUsers();
    } catch (err) {
      toast.error('Failed to deactivate user.');
    }
  }
};
</script>
