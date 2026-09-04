<template>
  <div class="d-flex flex-column gap-4">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-flag-fill"></i>
          Pipeline Stages
        </h2>
        <p class="page-header-sub">Configure pipeline stages and their sequential order for the Kanban board</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary" id="add-stage-btn">
        <i class="bi bi-plus-lg"></i> Add Stage
      </button>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="table-responsive">
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th>Stage Name</th>
            <th>Kanban Position</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 4" :key="i">
            <td><div class="skeleton" style="height: 14px; width: 140px;"></div></td>
            <td><div class="skeleton" style="height: 20px; width: 40px; border-radius: 10px;"></div></td>
            <td><div class="skeleton" style="height: 20px; width: 60px; border-radius: 10px;"></div></td>
            <td><div class="skeleton" style="height: 28px; width: 60px; border-radius: 6px;"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table -->
    <div v-else-if="stages.length" class="table-responsive">
      <table class="table table-hover table-mobile-cards mb-0">
        <thead>
          <tr>
            <th>Stage Name</th>
            <th>Kanban Position</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stage in stages" :key="stage.id">
            <td>
              <span class="td-label">Stage</span>
              <span class="fw-600 text-dark">{{ stage.name }}</span>
            </td>
            <td>
              <span class="td-label">Position</span>
              <span class="badge badge-low" style="font-weight:700;color:var(--primary);">
                #{{ stage.position }}
              </span>
            </td>
            <td>
              <span class="td-label">Status</span>
              <span :class="['badge', stage.is_active ? 'badge-completed' : 'badge-cancelled']">
                <i :class="stage.is_active ? 'bi bi-check-circle-fill' : 'bi bi-dash-circle-fill'"></i>
                {{ stage.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <span class="td-label">Actions</span>
              <div class="d-flex gap-2">
                <button @click="openEditModal(stage)" class="btn btn-secondary btn-sm" title="Edit Stage">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <button @click="deleteConfirm(stage)" class="btn btn-danger btn-sm" title="Delete Stage">
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
        <div class="empty-state-icon"><i class="bi bi-flag"></i></div>
        <span class="empty-state-title">No stages configured</span>
        <p class="empty-state-desc">Create pipeline stages to organize your leads on the Kanban board.</p>
        <button @click="openCreateModal" class="btn btn-primary mt-2">
          <i class="bi bi-plus-lg"></i> Add First Stage
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="isEdit ? 'bi bi-pencil-square' : 'bi bi-plus-circle-fill'" class="text-primary-custom"></i>
            {{ isEdit ? 'Edit Stage' : 'Create Stage' }}
          </h5>
          <button @click="showModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Stage Name *</label>
              <input
                v-model="form.name"
                type="text"
                :class="['form-control', { 'is-invalid': validationErrors.name }]"
                placeholder="e.g. Quotation Sent"
                @input="clearError('name')"
                required
              />
              <div v-if="validationErrors.name" class="invalid-feedback">{{ validationErrors.name[0] }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Position Index * <small class="text-muted-custom">(ascending order on board)</small></label>
              <input
                v-model="form.position"
                type="number"
                :class="['form-control', { 'is-invalid': validationErrors.position }]"
                placeholder="e.g. 3"
                min="1"
                @input="clearError('position')"
                required
              />
              <div v-if="validationErrors.position" class="invalid-feedback">{{ validationErrors.position[0] }}</div>
            </div>
            <div class="mb-0 d-flex align-items-center gap-3">
              <label class="toggle-switch">
                <input v-model="form.is_active" type="checkbox" />
                <span class="toggle-slider"></span>
              </label>
              <span class="form-label mb-0">Stage active and enabled</span>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-floppy"></i>
              Save Stage
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
const stages = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const activeId = ref(null);
const validationErrors = ref({});

const form = reactive({
  name: '',
  position: '',
  is_active: true
});

const clearError = (field) => {
  if (validationErrors.value[field]) {
    delete validationErrors.value[field];
  }
};

const loadStages = async () => {
  try {
    const response = await settingsApi.getStages();
    stages.value = response.data.stages;
    loading.value = false;
  } catch (err) {
    toast.error('Failed to load stages.');
  }
};

onMounted(() => {
  loadStages();
});

const openCreateModal = () => {
  isEdit.value = false;
  activeId.value = null;
  form.name = '';
  form.position = stages.value.length + 1;
  form.is_active = true;
  validationErrors.value = {};
  showModal.value = true;
};

const openEditModal = (stage) => {
  isEdit.value = true;
  activeId.value = stage.id;
  form.name = stage.name;
  form.position = stage.position;
  form.is_active = stage.is_active;
  validationErrors.value = {};
  showModal.value = true;
};

const submitForm = async () => {
  saving.value = true;
  validationErrors.value = {};
  try {
    if (isEdit.value) {
      await settingsApi.updateStage(activeId.value, form);
      toast.success('Stage updated successfully.');
    } else {
      await settingsApi.createStage(form);
      toast.success('Stage created successfully.');
    }
    showModal.value = false;
    loadStages();
  } catch (err) {
    if (err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors;
      const firstMsg = Object.values(err.response.data.errors).flat()[0];
      toast.error(firstMsg || 'Failed to save stage.');
    } else {
      toast.error(err.response?.data?.message || err.message || 'Failed to save stage.');
    }
  } finally {
    saving.value = false;
  }
};

const deleteConfirm = async (stage) => {
  const confirmed = await confirmDelete(`stage "${stage.name}"`);
  if (confirmed) {
    try {
      await settingsApi.deleteStage(stage.id);
      toast.success('Stage deleted.');
      loadStages();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete stage.');
    }
  }
};
</script>
