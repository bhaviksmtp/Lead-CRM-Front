<template>
  <div class="d-flex flex-column gap-4">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-tags-fill"></i>
          Lead Statuses
        </h2>
        <p class="page-header-sub">Manage custom lifecycle statuses to represent customer follow-up progression</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary" id="add-status-btn">
        <i class="bi bi-plus-lg"></i> Add Status
      </button>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="table-responsive">
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th>Status Name</th>
            <th>State</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 4" :key="i">
            <td><div class="skeleton" style="height: 14px; width: 140px;"></div></td>
            <td><div class="skeleton" style="height: 20px; width: 60px; border-radius: 10px;"></div></td>
            <td><div class="skeleton" style="height: 28px; width: 60px; border-radius: 6px;"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table -->
    <div v-else-if="statuses.length" class="table-responsive">
      <table class="table table-hover table-mobile-cards mb-0">
        <thead>
          <tr>
            <th>Status Name</th>
            <th>State</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="status in statuses" :key="status.id">
            <td>
              <span class="td-label">Status</span>
              <span class="fw-600 text-dark">{{ status.name }}</span>
            </td>
            <td>
              <span class="td-label">State</span>
              <span :class="['badge', status.is_active ? 'badge-completed' : 'badge-cancelled']">
                <i :class="status.is_active ? 'bi bi-check-circle-fill' : 'bi bi-dash-circle-fill'"></i>
                {{ status.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <span class="td-label">Actions</span>
              <div class="d-flex gap-2">
                <button @click="openEditModal(status)" class="btn btn-secondary btn-sm" title="Edit Status">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <button @click="deleteConfirm(status)" class="btn btn-danger btn-sm" title="Delete Status">
                  <i class="bi bi-trash3"></i>
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
        <div class="empty-state-icon"><i class="bi bi-tags"></i></div>
        <span class="empty-state-title">No statuses configured</span>
        <p class="empty-state-desc">Create statuses to categorize lead follow-up states.</p>
        <button @click="openCreateModal" class="btn btn-primary mt-2">
          <i class="bi bi-plus-lg"></i> Add First Status
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="isEdit ? 'bi bi-pencil-square' : 'bi bi-plus-circle-fill'" class="text-primary-custom"></i>
            {{ isEdit ? 'Edit Status' : 'Create Status' }}
          </h5>
          <button @click="showModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Status Name *</label>
              <input
                v-model="form.name"
                type="text"
                :class="['form-control', { 'is-invalid': validationErrors.name }]"
                placeholder="e.g. Contacted"
                @input="clearError('name')"
                required
              />
              <div v-if="validationErrors.name" class="invalid-feedback">{{ validationErrors.name[0] }}</div>
            </div>
            <div class="mb-0 d-flex align-items-center gap-3">
              <label class="toggle-switch">
                <input v-model="form.is_active" type="checkbox" />
                <span class="toggle-slider"></span>
              </label>
              <span class="form-label mb-0">Status active and enabled</span>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-floppy"></i>
              Save Status
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import settingsApi from '@/api/settings';
import { useToast } from '@/composables/useToast';
import { useSwal } from '@/composables/useSwal';

const toast = useToast();
const { confirmDelete } = useSwal();

const loading = ref(true);
const saving = ref(false);
const statuses = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const activeId = ref(null);
const validationErrors = ref({});

const form = reactive({
  name: '',
  is_active: true
});

const clearError = (field) => {
  if (validationErrors.value[field]) {
    delete validationErrors.value[field];
  }
};

const loadStatuses = async () => {
  try {
    const response = await settingsApi.getStatuses();
    statuses.value = response.data.statuses;
    loading.value = false;
  } catch (err) {
    toast.error('Failed to load statuses.');
  }
};

onMounted(() => {
  loadStatuses();
});

const openCreateModal = () => {
  isEdit.value = false;
  activeId.value = null;
  form.name = '';
  form.is_active = true;
  validationErrors.value = {};
  showModal.value = true;
};

const openEditModal = (status) => {
  isEdit.value = true;
  activeId.value = status.id;
  form.name = status.name;
  form.is_active = status.is_active;
  validationErrors.value = {};
  showModal.value = true;
};

const submitForm = async () => {
  saving.value = true;
  validationErrors.value = {};
  try {
    if (isEdit.value) {
      await settingsApi.updateStatus(activeId.value, form);
      toast.success('Status updated successfully.');
    } else {
      await settingsApi.createStatus(form);
      toast.success('Status created successfully.');
    }
    showModal.value = false;
    loadStatuses();
  } catch (err) {
    if (err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors;
      const firstMsg = Object.values(err.response.data.errors).flat()[0];
      toast.error(firstMsg || 'Failed to save status.');
    } else {
      toast.error(err.response?.data?.message || err.message || 'Failed to save status.');
    }
  } finally {
    saving.value = false;
  }
};

const deleteConfirm = async (status) => {
  const confirmed = await confirmDelete(`status "${status.name}"`);
  if (confirmed) {
    try {
      await settingsApi.deleteStatus(status.id);
      toast.success('Status deleted.');
      loadStatuses();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete status.');
    }
  }
};
</script>
