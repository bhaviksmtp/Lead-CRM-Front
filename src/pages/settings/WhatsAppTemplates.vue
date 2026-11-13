<template>
  <div class="d-flex flex-column gap-4">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-whatsapp text-whatsapp"></i>
          WhatsApp Message Templates
        </h2>
        <p class="page-header-sub">
          Manage approved Meta WhatsApp Cloud templates for outbound messaging and re-engagement
        </p>
      </div>
      <button @click="openCreateModal" class="btn btn-whatsapp" id="add-template-btn">
        <i class="bi bi-plus-lg"></i> New Template
      </button>
    </div>

    <!-- Info Notice -->
    <div class="card bg-light border">
      <div class="card-body p-3 d-flex align-items-center gap-3">
        <i class="bi bi-info-circle-fill text-primary-custom fs-4"></i>
        <div style="font-size:0.875rem;">
          <strong>Meta WhatsApp 24-Hour Messaging Policy:</strong>
          <span class="text-secondary ms-1">
            Free-form messages can only be sent when a lead has messaged you within the last 24 hours. Outside the 24-hour window, you must send an approved template message to initiate contact.
          </span>
        </div>
      </div>
    </div>

    <!-- Templates DataTable -->
    <DataTable
      :columns="templateColumns"
      :data="templates"
      :loading="loading"
      :searchable="true"
      search-placeholder="Search template name or content..."
      :pagination="true"
      :page-size="10"
      empty-icon="bi-chat-left-text"
      empty-title="No templates configured"
      empty-description="Create message templates to communicate with leads on WhatsApp."
    >
      <template #name="{ item }">
        <div class="fw-700 text-dark">{{ item.name }}</div>
        <code style="font-size:0.75rem;">{{ item.whatsapp_template_name || 'custom' }}</code>
      </template>

      <template #category="{ item }">
        <span class="badge bg-light text-secondary border px-2 py-1" style="font-size:0.75rem;">
          {{ item.category || 'UTILITY' }}
        </span>
      </template>

      <template #content="{ item }">
        <div class="text-truncate" style="max-width:320px;font-size:0.875rem;" :title="item.content">
          {{ item.content }}
        </div>
      </template>

      <template #actions="{ item }">
        <div class="d-flex gap-2">
          <button @click="openEditModal(item)" class="btn btn-secondary btn-sm" title="Edit Template">
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button @click="deleteConfirm(item)" class="btn btn-danger btn-sm" title="Delete Template">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content" style="max-width:560px;">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-whatsapp text-whatsapp me-1"></i>
            {{ isEdit ? 'Edit Template' : 'Create WhatsApp Template' }}
          </h5>
          <button @click="showModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Template Display Name *</label>
              <input
                v-model="form.name"
                type="text"
                class="form-control"
                placeholder="e.g. Welcome & Product Catalogue"
                required
              />
            </div>

            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label">Meta Template Name</label>
                <input
                  v-model="form.whatsapp_template_name"
                  type="text"
                  class="form-control"
                  placeholder="e.g. welcome_catalogue_v1"
                />
              </div>
              <div class="col-6">
                <label class="form-label">Category</label>
                <select v-model="form.category" class="form-select">
                  <option value="MARKETING">Marketing</option>
                  <option value="UTILITY">Utility</option>
                  <option value="AUTHENTICATION">Authentication</option>
                </select>
              </div>
            </div>

            <div class="mb-2">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label mb-0">Message Content *</label>
                <span class="text-muted small">Dynamic variables:</span>
              </div>
              <div class="d-flex flex-wrap gap-1 mb-2">
                <button
                  type="button"
                  v-for="v in availableVariables"
                  :key="v"
                  @click="insertVariable(v)"
                  class="btn btn-light btn-sm border py-0 px-2"
                  style="font-size:0.75rem;"
                >
                  + {{ v }}
                </button>
              </div>
              <textarea
                id="template-content-input"
                v-model="form.content"
                class="form-control"
                rows="5"
                placeholder="Hi {{name}}, thank you for reaching out regarding {{requirement}}. Connecting from {{company}}..."
                required
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-whatsapp" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else class="bi bi-floppy"></i>
              {{ saving ? 'Saving...' : 'Save Template' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useToast } from '@/composables/useToast';
import { useSwal } from '@/composables/useSwal';
import whatsappApi from '@/api/whatsapp';

const toast = useToast();
const { confirmDelete } = useSwal();

const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);
const isEdit = ref(false);
const activeId = ref(null);
const templates = ref([]);

const templateColumns = [
  { key: 'name', label: 'Template Name', sortable: true, minWidth: '180px' },
  { key: 'category', label: 'Category', sortable: true, minWidth: '120px' },
  { key: 'content', label: 'Message Preview', minWidth: '260px' },
  { key: 'actions', label: 'Actions', minWidth: '140px', align: 'end' }
];

const availableVariables = [
  '{{name}}',
  '{{company}}',
  '{{requirement}}',
  '{{deal_value}}',
  '{{sales_rep}}'
];

const form = reactive({
  name: '',
  whatsapp_template_name: '',
  category: 'MARKETING',
  content: '',
  language: 'en',
  is_active: true
});

const loadTemplates = async () => {
  loading.value = true;
  try {
    const res = await whatsappApi.getTemplates();
    templates.value = res.data.templates || [];
  } catch (err) {
    toast.error('Failed to load WhatsApp templates.');
  } finally {
    loading.value = false;
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
  form.category = 'MARKETING';
  form.content = '';
  showModal.value = true;
};

const openEditModal = (tpl) => {
  isEdit.value = true;
  activeId.value = tpl.id;
  form.name = tpl.name;
  form.whatsapp_template_name = tpl.whatsapp_template_name || '';
  form.category = tpl.category || 'MARKETING';
  form.content = tpl.content;
  showModal.value = true;
};

const insertVariable = (variableText) => {
  form.content = (form.content ? form.content + ' ' : '') + variableText;
};

const submitForm = async () => {
  if (!form.content.trim()) return;
  saving.value = true;
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
    toast.error(err.response?.data?.message || 'Failed to save template.');
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
    } catch {
      toast.error('Failed to delete template.');
    }
  }
};
</script>
