<template>
  <div class="d-flex flex-column gap-4">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-funnel-fill"></i>
          Lead Sources
        </h2>
        <p class="page-header-sub">Manage marketing, campaign, and referral sources for lead acquisition tracking</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary" id="add-source-btn">
        <i class="bi bi-plus-lg"></i> Add Source
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-flex flex-column align-items-center py-5 gap-3">
      <div class="spinner-custom"></div>
      <p style="color:var(--text-secondary);font-size:0.875rem;">Loading sources...</p>
    </div>

    <!-- Table -->
    <div v-else-if="sources.length" class="table-responsive">
      <table class="table table-hover table-mobile-cards mb-0">
        <thead>
          <tr>
            <th>Source Name</th>
            <th>Source Code</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="source in sources" :key="source.id">
            <td>
              <span class="td-label">Name</span>
              <span class="fw-600 text-dark">{{ source.name }}</span>
            </td>
            <td>
              <span class="td-label">Code</span>
              <code>{{ source.code }}</code>
            </td>
            <td>
              <span class="td-label">Status</span>
              <span :class="['badge', source.is_active ? 'badge-completed' : 'badge-cancelled']">
                <i :class="source.is_active ? 'bi bi-check-circle-fill' : 'bi bi-dash-circle-fill'"></i>
                {{ source.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <span class="td-label">Actions</span>
              <div class="d-flex gap-2">
                <button @click="openEditModal(source)" class="btn btn-secondary btn-sm" title="Edit Source">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <button @click="deleteConfirm(source)" class="btn btn-danger btn-sm" title="Delete Source">
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
        <div class="empty-state-icon"><i class="bi bi-funnel"></i></div>
        <span class="empty-state-title">No sources configured</span>
        <p class="empty-state-desc">Add lead sources to track where your leads come from.</p>
        <button @click="openCreateModal" class="btn btn-primary mt-2">
          <i class="bi bi-plus-lg"></i> Add First Source
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="isEdit ? 'bi bi-pencil-square' : 'bi bi-plus-circle-fill'" class="text-primary-custom"></i>
            {{ isEdit ? 'Edit Source' : 'Create Source' }}
          </h5>
          <button @click="showModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Source Name *</label>
              <input
                v-model="form.name"
                type="text"
                :class="['form-control', { 'is-invalid': validationErrors.name }]"
                placeholder="e.g. Google Ads"
                @input="clearError('name')"
                required
              />
              <div v-if="validationErrors.name" class="invalid-feedback">{{ validationErrors.name[0] }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Source Code * <small class="text-muted-custom">(unique API identifier)</small></label>
              <input
                v-model="form.code"
                type="text"
                :class="['form-control', { 'is-invalid': validationErrors.code }]"
                placeholder="e.g. google_ads"
                @input="clearError('code')"
                required
              />
              <div v-if="validationErrors.code" class="invalid-feedback">{{ validationErrors.code[0] }}</div>
            </div>
            <div class="mb-0 d-flex align-items-center gap-3">
              <label class="toggle-switch">
                <input v-model="form.is_active" type="checkbox" />
                <span class="toggle-slider"></span>
              </label>
              <span class="form-label mb-0">Source active and enabled</span>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-floppy"></i>
              Save Source
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
const sources = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const activeId = ref(null);
const validationErrors = ref({});

const form = reactive({
  name: '',
  code: '',
  is_active: true
});

const clearError = (field) => {
  if (validationErrors.value[field]) {
    delete validationErrors.value[field];
  }
};

const loadSources = async () => {
  try {
    const response = await settingsApi.getSources();
    sources.value = response.data.sources;
    loading.value = false;
  } catch (err) {
    toast.error('Failed to load lead sources.');
  }
};

onMounted(() => {
  loadSources();
});

const openCreateModal = () => {
  isEdit.value = false;
  activeId.value = null;
  form.name = '';
  form.code = '';
  form.is_active = true;
  validationErrors.value = {};
  showModal.value = true;
};

const openEditModal = (source) => {
  isEdit.value = true;
  activeId.value = source.id;
  form.name = source.name;
  form.code = source.code;
  form.is_active = source.is_active;
  validationErrors.value = {};
  showModal.value = true;
};

const submitForm = async () => {
  saving.value = true;
  validationErrors.value = {};
  try {
    if (isEdit.value) {
      await settingsApi.updateSource(activeId.value, form);
      toast.success('Source updated successfully.');
    } else {
      await settingsApi.createSource(form);
      toast.success('Source created successfully.');
    }
    showModal.value = false;
    loadSources();
  } catch (err) {
    if (err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors;
      const firstMsg = Object.values(err.response.data.errors).flat()[0];
      toast.error(firstMsg || 'Failed to save source.');
    } else {
      toast.error(err.response?.data?.message || err.message || 'Failed to save source.');
    }
  } finally {
    saving.value = false;
  }
};

const deleteConfirm = async (source) => {
  const confirmed = await confirmDelete(`source "${source.name}"`);
  if (confirmed) {
    try {
      await settingsApi.deleteSource(source.id);
      toast.success('Source deleted.');
      loadSources();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete source.');
    }
  }
};
</script>
