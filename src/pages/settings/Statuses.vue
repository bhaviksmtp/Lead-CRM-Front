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

    <!-- Loading -->
    <div v-if="loading" class="d-flex flex-column align-items-center py-5 gap-3">
      <div class="spinner-custom"></div>
      <p style="color:var(--text-secondary);font-size:0.875rem;">Loading statuses...</p>
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
              <input v-model="form.name" type="text" class="form-control" placeholder="e.g. Contacted" required />
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
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-floppy"></i> Save Status
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

const toast = useToast();

const loading = ref(true);
const statuses = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const activeId = ref(null);

const form = reactive({
  name: '',
  is_active: true
});

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
  showModal.value = true;
};

const openEditModal = (status) => {
  isEdit.value = true;
  activeId.value = status.id;
  form.name = status.name;
  form.is_active = status.is_active;
  showModal.value = true;
};

const submitForm = async () => {
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
    toast.error('Failed to save status.');
  }
};

const deleteConfirm = async (status) => {
  if (confirm(`Delete status: ${status.name}?`)) {
    try {
      await settingsApi.deleteStatus(status.id);
      toast.success('Status deleted.');
      loadStatuses();
    } catch (err) {
      toast.error('Failed to delete status.');
    }
  }
};
</script>
