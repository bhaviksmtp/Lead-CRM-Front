<template>
  <div class="d-flex flex-column gap-4">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-ui-checks"></i>
          Custom Fields Configuration
        </h2>
        <p class="page-header-sub">Tailor lead attributes to your specific industry (Real Estate, Manufacturing, IT, Furniture, Corporate Services)</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary btn-sm">
        <i class="bi bi-plus-lg"></i> Add Custom Field
      </button>
    </div>

    <!-- Industry Presets Banner -->
    <div class="card bg-light border">
      <div class="card-body p-3">
        <span class="fw-700 text-dark d-block mb-1" style="font-size:0.875rem;">
          <i class="bi bi-lightbulb-fill text-warning me-1"></i> Industry Templates
        </span>
        <div class="d-flex flex-wrap gap-2">
          <button @click="loadPreset('real_estate')" class="btn btn-secondary btn-sm" style="font-size:0.75rem;">
            🏢 Real Estate (Property Type, Budget, Location)
          </button>
          <button @click="loadPreset('manufacturing')" class="btn btn-secondary btn-sm" style="font-size:0.75rem;">
            🏭 Manufacturing (Product, Quantity, Specs, GST)
          </button>
          <button @click="loadPreset('it_services')" class="btn btn-secondary btn-sm" style="font-size:0.75rem;">
            💻 Software / IT (Team Size, Tech Stack, Scope)
          </button>
        </div>
      </div>
    </div>

    <!-- Fields Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="customFields.length" class="table-responsive">
          <table class="table table-hover table-mobile-cards mb-0">
            <thead>
              <tr>
                <th>Field Label</th>
                <th>Field Key / Slug</th>
                <th>Data Type</th>
                <th>Required</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(f, idx) in customFields" :key="f.id || idx">
                <td>
                  <span class="td-label">Label</span>
                  <span class="fw-700 text-dark">{{ f.label }}</span>
                </td>
                <td>
                  <span class="td-label">Key</span>
                  <code>{{ f.key }}</code>
                </td>
                <td>
                  <span class="td-label">Type</span>
                  <span class="badge badge-low">{{ f.type }}</span>
                </td>
                <td>
                  <span class="td-label">Required</span>
                  <span :class="['badge', f.required ? 'badge-high' : 'badge-low']">
                    {{ f.required ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>
                  <span class="td-label">Status</span>
                  <span class="badge badge-won">Active</span>
                </td>
                <td>
                  <span class="td-label">Actions</span>
                  <button @click="deleteField(idx)" class="btn btn-danger btn-sm" title="Delete">
                    <i class="bi bi-trash3"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state py-4">
          <span class="empty-state-title">No custom fields created</span>
          <p class="empty-state-desc">Add custom attributes or click an industry preset above to get started.</p>
        </div>
      </div>
    </div>

    <!-- Add Field Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-plus-circle text-primary-custom"></i> Add Custom Field</h5>
          <button @click="showModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Field Label *</label>
            <input v-model="form.label" type="text" class="form-control" placeholder="e.g. Property Type / Project Scope" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Data Type *</label>
            <select v-model="form.type" class="form-select">
              <option value="Text">Text</option>
              <option value="Number">Number</option>
              <option value="Currency (₹)">Currency (₹)</option>
              <option value="Date">Date</option>
              <option value="Dropdown">Dropdown Selector</option>
              <option value="Checkbox">Checkbox / Boolean</option>
              <option value="Textarea">Long Textarea</option>
            </select>
          </div>
          <div class="form-check mb-3">
            <input type="checkbox" id="fieldReq" v-model="form.required" class="form-check-input" />
            <label for="fieldReq" class="form-check-label">Mandatory field for lead registration</label>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="saveField" class="btn btn-primary" :disabled="!form.label.trim()">
            Save Field
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
const customFields = ref([
  { id: '1', label: 'Client Industry', key: 'client_industry', type: 'Dropdown', required: false },
  { id: '2', label: 'Project Timeline', key: 'project_timeline', type: 'Text', required: false },
  { id: '3', label: 'GST Number', key: 'gst_number', type: 'Text', required: false },
  { id: '4', label: 'Delivery Location', key: 'delivery_location', type: 'Text', required: false }
]);

const form = reactive({
  label: '',
  type: 'Text',
  required: false
});

const openCreateModal = () => {
  form.label = '';
  form.type = 'Text';
  form.required = false;
  showModal.value = true;
};

const saveField = () => {
  if (!form.label.trim()) return;
  const key = form.label.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  customFields.value.push({
    id: String(Date.now()),
    label: form.label.trim(),
    key,
    type: form.type,
    required: form.required
  });
  toast.success(`Custom field "${form.label}" added.`);
  showModal.value = false;
};

const deleteField = (idx) => {
  customFields.value.splice(idx, 1);
  toast.success('Custom field removed.');
};

const loadPreset = (preset) => {
  if (preset === 'real_estate') {
    customFields.value = [
      { id: '1', label: 'Property Type', key: 'property_type', type: 'Dropdown', required: true },
      { id: '2', label: 'Bedrooms (BHK)', key: 'bhk', type: 'Dropdown', required: false },
      { id: '3', label: 'Preferred Location', key: 'preferred_location', type: 'Text', required: false },
      { id: '4', label: 'Max Budget (₹)', key: 'max_budget', type: 'Currency (₹)', required: true }
    ];
    toast.success('Real Estate template loaded.');
  } else if (preset === 'manufacturing') {
    customFields.value = [
      { id: '1', label: 'Product Model / SKU', key: 'product_sku', type: 'Text', required: true },
      { id: '2', label: 'Order Quantity', key: 'order_quantity', type: 'Number', required: true },
      { id: '3', label: 'GSTIN', key: 'gstin', type: 'Text', required: false },
      { id: '4', label: 'Delivery Destination', key: 'delivery_city', type: 'Text', required: false }
    ];
    toast.success('Manufacturing template loaded.');
  } else if (preset === 'it_services') {
    customFields.value = [
      { id: '1', label: 'Company Size / Staff', key: 'staff_size', type: 'Dropdown', required: false },
      { id: '2', label: 'Technology Stack', key: 'tech_stack', type: 'Text', required: false },
      { id: '3', label: 'Estimated Project Duration', key: 'project_duration', type: 'Text', required: false },
      { id: '4', label: 'Expected Delivery Month', key: 'delivery_month', type: 'Date', required: false }
    ];
    toast.success('IT Services template loaded.');
  }
};
</script>
