<template>
  <div class="d-flex flex-column gap-4">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-file-earmark-text-fill"></i>
          WhatsApp Templates
        </h2>
        <p class="page-header-sub">
          Configure message templates using dynamic variables:
          <code>&#123;&#123;name&#125;&#125;</code>,
          <code>&#123;&#123;requirement&#125;&#125;</code>,
          <code>&#123;&#123;company&#125;&#125;</code>
        </p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary" id="add-template-btn">
        <i class="bi bi-plus-lg"></i> Add Template
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-flex flex-column align-items-center py-5 gap-3">
      <div class="spinner-custom"></div>
      <p style="color:var(--text-secondary);font-size:0.875rem;">Loading templates...</p>
    </div>

    <!-- Table -->
    <div v-else-if="templates.length" class="table-responsive">
      <table class="table table-hover table-mobile-cards mb-0">
        <thead>
          <tr>
            <th>Template Name</th>
            <th>API Identifier</th>
            <th>Category</th>
            <th>Content Preview</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tpl in templates" :key="tpl.id">
            <td>
              <span class="td-label">Name</span>
              <div class="fw-600 text-dark">{{ tpl.name }}</div>
            </td>
            <td>
              <span class="td-label">API ID</span>
              <code>{{ tpl.whatsapp_template_name || 'N/A' }}</code>
            </td>
            <td>
              <span class="td-label">Category</span>
              <span class="badge badge-low">{{ tpl.category }}</span>
            </td>
            <td style="max-width:320px;">
              <span class="td-label">Content</span>
              <p style="font-size:0.8125rem;color:var(--text-secondary);white-space:pre-wrap;line-height:1.5;margin:0;">{{ tpl.content }}</p>
            </td>
            <td>
              <span class="td-label">Status</span>
              <span :class="['badge', tpl.is_active ? 'badge-completed' : 'badge-cancelled']">
                <i :class="tpl.is_active ? 'bi bi-check-circle-fill' : 'bi bi-pause-circle-fill'"></i>
                {{ tpl.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <span class="td-label">Actions</span>
              <div class="d-flex gap-2">
                <button @click="openEditModal(tpl)" class="btn btn-secondary btn-sm" title="Edit Template">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <button @click="deleteConfirm(tpl)" class="btn btn-danger btn-sm" title="Delete Template">
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="card">
      <div class="card-body empty-state">
        <div class="empty-state-icon"><i class="bi bi-file-earmark-text"></i></div>
        <span class="empty-state-title">No templates configured</span>
        <p class="empty-state-desc">Templates help speed up follow-ups and automated WhatsApp replies.</p>
        <button @click="openCreateModal" class="btn btn-primary mt-2">
          <i class="bi bi-plus-lg"></i> Add First Template
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content" style="max-width:620px;">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="isEdit ? 'bi bi-pencil-square' : 'bi bi-plus-circle-fill'" class="text-primary-custom"></i>
            {{ isEdit ? 'Edit Template' : 'Create Template' }}
          </h5>
          <button @click="showModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Template Name (Staff Label) *</label>
              <input
                v-model="form.name"
                type="text"
                :class="['form-control', { 'is-invalid': validationErrors.name }]"
                placeholder="e.g. Welcome message"
                @input="clearError('name')"
                required
              />
              <div v-if="validationErrors.name" class="invalid-feedback">{{ validationErrors.name[0] }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Official WhatsApp Name (API Identifier)</label>
              <input
                v-model="form.whatsapp_template_name"
                type="text"
                :class="['form-control', { 'is-invalid': validationErrors.whatsapp_template_name }]"
                placeholder="e.g. welcome_lead"
                @input="clearError('whatsapp_template_name')"
              />
              <div v-if="validationErrors.whatsapp_template_name" class="invalid-feedback">{{ validationErrors.whatsapp_template_name[0] }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Category</label>
              <select v-model="form.category" class="form-select">
                <option value="UTILITY">Utility</option>
                <option value="MARKETING">Marketing</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Message Content Body *</label>
              <textarea
                v-model="form.content"
                :class="['form-control', { 'is-invalid': validationErrors.content }]"
                rows="5"
                placeholder="Hello {{name}}, Just following up on {{requirement}}. Regards, {{company}}."
                @input="clearError('content')"
                required
              ></textarea>
              <div v-if="validationErrors.content" class="invalid-feedback">{{ validationErrors.content[0] }}</div>
            </div>

            <div class="mb-3 d-flex align-items-center gap-3">
              <label class="toggle-switch">
                <input v-model="form.is_active" type="checkbox" />
                <span class="toggle-slider"></span>
              </label>
              <span class="form-label mb-0">Template active and enabled</span>
            </div>

            <!-- Preview -->
            <div style="padding:1rem;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-md);">
              <span style="font-size:0.65rem;color:var(--text-muted);display:block;margin-bottom:0.5rem;text-transform:uppercase;font-weight:700;letter-spacing:0.07em;">
                <i class="bi bi-eye me-1"></i> Variables Preview
              </span>
              <p style="font-size:0.8125rem;white-space:pre-wrap;line-height:1.5;color:var(--text-primary);margin:0;">{{ parsedPreview }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-floppy"></i>
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import whatsappApi from '@/api/whatsapp';
import { useToast } from '@/composables/useToast';
import { useSwal } from '@/composables/useSwal';

const toast = useToast();
const { confirmDelete } = useSwal();

const loading = ref(true);
const saving = ref(false);
const templates = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const activeId = ref(null);
const validationErrors = ref({});

const form = reactive({
  name: '',
  whatsapp_template_name: '',
  category: 'UTILITY',
  content: '',
  is_active: true
});

const clearError = (field) => {
  if (validationErrors.value[field]) {
    delete validationErrors.value[field];
  }
};

const parsedPreview = computed(() => {
  if (!form.content) return 'Type content to preview...';
  return form.content
    .replaceAll('{{name}}', 'Rahul Sharma')
    .replaceAll('{{requirement}}', 'Website Development')
    .replaceAll('{{company}}', 'Convera')
    .replaceAll('{{assigned_user}}', 'Vikram Joshi');
});

const loadTemplates = async () => {
  try {
    const response = await whatsappApi.getTemplates();
    templates.value = response.data.templates;
    loading.value = false;
  } catch (err) {
    toast.error('Failed to load templates.');
  }
};

onMounted(() => {
  loadTemplates();
});

const openCreateModal = () => {
  isEdit.value = false;
  activeId.value = null;
  form.name = '';
  form.whatsapp_template_name = '';
  form.category = 'UTILITY';
  form.content = '';
  form.is_active = true;
  validationErrors.value = {};
  showModal.value = true;
};

const openEditModal = (tpl) => {
  isEdit.value = true;
  activeId.value = tpl.id;
  form.name = tpl.name;
  form.whatsapp_template_name = tpl.whatsapp_template_name;
  form.category = tpl.category;
  form.content = tpl.content;
  form.is_active = tpl.is_active;
  validationErrors.value = {};
  showModal.value = true;
};

const submitForm = async () => {
  saving.value = true;
  validationErrors.value = {};
  try {
    if (isEdit.value) {
      await whatsappApi.updateTemplate(activeId.value, form);
      toast.success('Template updated successfully.');
    } else {
      await whatsappApi.createTemplate(form);
      toast.success('Template created successfully.');
    }
    showModal.value = false;
    loadTemplates();
  } catch (err) {
    if (err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors;
      const firstMsg = Object.values(err.response.data.errors).flat()[0];
      toast.error(firstMsg || 'Failed to save template. Please check input values.');
    } else {
      toast.error(err.response?.data?.message || err.message || 'Failed to save template.');
    }
  } finally {
    saving.value = false;
  }
};

const deleteConfirm = async (tpl) => {
  const confirmed = await confirmDelete(`template "${tpl.name}"`);
  if (confirmed) {
    try {
      await whatsappApi.deleteTemplate(tpl.id);
      toast.success('Template deleted.');
      loadTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete template.');
    }
  }
};
</script>
