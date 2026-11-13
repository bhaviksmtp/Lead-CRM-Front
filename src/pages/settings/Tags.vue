<template>
  <div class="d-flex flex-column gap-4">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-bookmark-fill"></i>
          Lead Tags &amp; Labels
        </h2>
        <p class="page-header-sub">Categorize and label prospects for rapid filtering and segmentation</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary btn-sm">
        <i class="bi bi-plus-lg"></i> Create Tag
      </button>
    </div>

    <!-- Tags Reusable DataTable -->
    <DataTable
      :columns="tagColumns"
      :data="tags"
      :searchable="true"
      search-placeholder="Search tags..."
      :pagination="true"
      :page-size="10"
      empty-icon="bi-tags"
      empty-title="No tags configured"
      empty-description="Create tags to categorize your customers."
    >
      <template #name="{ item }">
        <span class="fw-700 text-dark">{{ item.name }}</span>
      </template>

      <template #preview="{ item }">
        <span
          class="badge"
          :style="`background:${item.bg};color:${item.color};font-size:0.8125rem;font-weight:700;`"
        >
          <i class="bi bi-tag-fill me-1"></i>{{ item.name }}
        </span>
      </template>

      <template #color="{ item }">
        <span style="font-size:0.8125rem;color:var(--text-secondary);">{{ item.label }}</span>
      </template>

      <template #actions="{ index }">
        <button @click="deleteTag(index)" class="btn btn-danger btn-sm" title="Delete">
          <i class="bi bi-trash3"></i>
        </button>
      </template>
    </DataTable>

    <!-- Add Tag Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-plus-circle text-primary-custom"></i> Add New Tag</h5>
          <button @click="showModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Tag Name *</label>
            <input v-model="form.name" type="text" class="form-control" placeholder="e.g. VIP / High Value / Urgent" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Color Theme</label>
            <select v-model="form.theme" class="form-select">
              <option value="indigo">Indigo (Standard)</option>
              <option value="red">Red (Urgent / Hot)</option>
              <option value="green">Green (High Value / VIP)</option>
              <option value="amber">Amber (Price Sensitive)</option>
              <option value="teal">Teal (Local / Retail)</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="saveTag" class="btn btn-primary" :disabled="!form.name.trim()">
            Save Tag
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useToast } from '@/composables/useToast';

const toast = useToast();

const showModal = ref(false);

const tagColumns = [
  { key: 'name', label: 'Tag Name', sortable: true, minWidth: '180px' },
  { key: 'preview', label: 'Preview Badge', minWidth: '140px' },
  { key: 'color', label: 'Color Scheme', sortable: true, sortKey: 'label', minWidth: '160px' },
  { key: 'actions', label: 'Actions', minWidth: '80px', align: 'end' }
];

const tags = ref([
  { id: '1', name: 'VIP', bg: '#dcfce7', color: '#15803d', label: 'Green (VIP)' },
  { id: '2', name: 'High Value', bg: '#e0e7ff', color: '#4338ca', label: 'Indigo (High Value)' },
  { id: '3', name: 'Urgent', bg: '#fee2e2', color: '#b91c1c', label: 'Red (Urgent)' },
  { id: '4', name: 'Price Sensitive', bg: '#fef3c7', color: '#b45309', label: 'Amber (Price Sensitive)' },
  { id: '5', name: 'Repeat Customer', bg: '#f3e8ff', color: '#7e22ce', label: 'Purple (Repeat)' },
  { id: '6', name: 'Enterprise', bg: '#ccfbf1', color: '#0f766e', label: 'Teal (Enterprise)' }
]);

const form = reactive({
  name: '',
  theme: 'indigo'
});

const openCreateModal = () => {
  form.name = '';
  form.theme = 'indigo';
  showModal.value = true;
};

const themeColors = {
  indigo: { bg: '#e0e7ff', color: '#4338ca', label: 'Indigo' },
  red: { bg: '#fee2e2', color: '#b91c1c', label: 'Red' },
  green: { bg: '#dcfce7', color: '#15803d', label: 'Green' },
  amber: { bg: '#fef3c7', color: '#b45309', label: 'Amber' },
  teal: { bg: '#ccfbf1', color: '#0f766e', label: 'Teal' }
};

const saveTag = () => {
  if (!form.name.trim()) return;
  const theme = themeColors[form.theme] || themeColors.indigo;
  tags.value.push({
    id: String(Date.now()),
    name: form.name.trim(),
    bg: theme.bg,
    color: theme.color,
    label: theme.label
  });
  toast.success(`Tag "${form.name}" created.`);
  showModal.value = false;
};

const deleteTag = (idx) => {
  tags.value.splice(idx, 1);
  toast.success('Tag removed.');
};
</script>
