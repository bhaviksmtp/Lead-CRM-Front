<template>
  <div>
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-pencil-square"></i>
          Edit Lead
        </h2>
        <p class="page-header-sub">Update the lead information and sales pipeline details</p>
      </div>
      <button type="button" @click="$router.back()" class="btn btn-secondary">
        <i class="bi bi-arrow-left"></i> Back
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loadingLead" class="d-flex flex-column align-items-center py-5 gap-3">
      <div class="spinner-custom"></div>
      <p style="color:var(--text-secondary);font-size:0.875rem;">Loading lead records...</p>
    </div>

    <form v-else @submit.prevent="updateLead">
      <div class="row g-4">
        <!-- SECTION 1: Customer Details -->
        <div class="col-12 col-lg-6">
          <div class="card h-100">
            <div class="card-header">
              <i class="bi bi-person-vcard-fill"></i>
              Customer Details
            </div>
            <div class="card-body">
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
                <label class="form-label">Mobile Number *</label>
                <input
                  v-model="form.phone"
                  type="text"
                  :class="['form-control', { 'is-invalid': validationErrors.phone }]"
                  @input="clearError('phone')"
                  required
                />
                <div v-if="validationErrors.phone" class="invalid-feedback">{{ validationErrors.phone[0] }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label">WhatsApp Number</label>
                <input
                  v-model="form.whatsapp_number"
                  type="text"
                  :class="['form-control', { 'is-invalid': validationErrors.whatsapp_number }]"
                  @input="clearError('whatsapp_number')"
                />
                <div v-if="validationErrors.whatsapp_number" class="invalid-feedback">{{ validationErrors.whatsapp_number[0] }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Email Address</label>
                <input
                  v-model="form.email"
                  type="email"
                  :class="['form-control', { 'is-invalid': validationErrors.email }]"
                  @input="clearError('email')"
                />
                <div v-if="validationErrors.email" class="invalid-feedback">{{ validationErrors.email[0] }}</div>
              </div>

              <div class="mb-0">
                <label class="form-label">Company Name</label>
                <input
                  v-model="form.company_name"
                  type="text"
                  :class="['form-control', { 'is-invalid': validationErrors.company_name }]"
                  @input="clearError('company_name')"
                />
                <div v-if="validationErrors.company_name" class="invalid-feedback">{{ validationErrors.company_name[0] }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 2: Sales Details -->
        <div class="col-12 col-lg-6">
          <div class="card h-100">
            <div class="card-header">
              <i class="bi bi-geo-alt-fill"></i>
              Location &amp; Sales Details
            </div>
            <div class="card-body">
              <div class="row g-3 mb-3">
                <div class="col-6">
                  <label class="form-label">City</label>
                  <input
                    v-model="form.city"
                    type="text"
                    :class="['form-control', { 'is-invalid': validationErrors.city }]"
                    @input="clearError('city')"
                  />
                  <div v-if="validationErrors.city" class="invalid-feedback">{{ validationErrors.city[0] }}</div>
                </div>
                <div class="col-6">
                  <label class="form-label">State</label>
                  <input
                    v-model="form.state"
                    type="text"
                    :class="['form-control', { 'is-invalid': validationErrors.state }]"
                    @input="clearError('state')"
                  />
                  <div v-if="validationErrors.state" class="invalid-feedback">{{ validationErrors.state[0] }}</div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Lead Source</label>
                <select
                  v-model="form.source_id"
                  :class="['form-select', { 'is-invalid': validationErrors.source_id }]"
                  @change="clearError('source_id')"
                >
                  <option value="">— Select Source —</option>
                  <option v-for="source in sources" :key="source.id" :value="source.id">{{ source.name }}</option>
                </select>
                <div v-if="validationErrors.source_id" class="invalid-feedback">{{ validationErrors.source_id[0] }}</div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-6">
                  <label class="form-label">Status</label>
                  <select
                    v-model="form.status_id"
                    :class="['form-select', { 'is-invalid': validationErrors.status_id }]"
                    @change="clearError('status_id')"
                  >
                    <option value="">— Select Status —</option>
                    <option v-for="status in statuses" :key="status.id" :value="status.id">{{ status.name }}</option>
                  </select>
                  <div v-if="validationErrors.status_id" class="invalid-feedback">{{ validationErrors.status_id[0] }}</div>
                </div>
                <div class="col-6">
                  <label class="form-label">Pipeline Stage</label>
                  <select
                    v-model="form.stage_id"
                    :class="['form-select', { 'is-invalid': validationErrors.stage_id }]"
                    @change="clearError('stage_id')"
                  >
                    <option value="">— Select Stage —</option>
                    <option v-for="stage in stages" :key="stage.id" :value="stage.id">{{ stage.name }}</option>
                  </select>
                  <div v-if="validationErrors.stage_id" class="invalid-feedback">{{ validationErrors.stage_id[0] }}</div>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-6">
                  <label class="form-label">Priority</label>
                  <select id="lead-edit-priority" v-model="form.priority" class="form-select">
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label">Est. Value (₹)</label>
                  <input
                    v-model="form.expected_value"
                    type="number"
                    :class="['form-control', { 'is-invalid': validationErrors.expected_value }]"
                    min="0"
                    @input="clearError('expected_value')"
                  />
                  <div v-if="validationErrors.expected_value" class="invalid-feedback">{{ validationErrors.expected_value[0] }}</div>
                </div>
              </div>

              <div class="mb-0">
                <label class="form-label">Assigned Executive</label>
                <select
                  v-model="form.assigned_to"
                  :class="['form-select', { 'is-invalid': validationErrors.assigned_to }]"
                  @change="clearError('assigned_to')"
                >
                  <option value="">— Unassigned —</option>
                  <option v-for="user in teamMembers" :key="user.id" :value="user.id">{{ user.name }}</option>
                </select>
                <div v-if="validationErrors.assigned_to" class="invalid-feedback">{{ validationErrors.assigned_to[0] }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 3: Requirements -->
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <i class="bi bi-card-text"></i>
              Requirements Description
            </div>
            <div class="card-body">
              <textarea
                v-model="form.requirement"
                :class="['form-control', { 'is-invalid': validationErrors.requirement }]"
                rows="3"
                placeholder="Client requirements, product interest, notes..."
                @input="clearError('requirement')"
              ></textarea>
              <div v-if="validationErrors.requirement" class="invalid-feedback">{{ validationErrors.requirement[0] }}</div>
            </div>
          </div>
        </div>

        <!-- Lost Reason (conditional) -->
        <div v-if="isLostSelected" class="col-12">
          <div class="card" style="border-color:var(--danger);">
            <div class="card-header" style="color:var(--danger);">
              <i class="bi bi-exclamation-triangle-fill text-danger"></i>
              Reason for Loss
            </div>
            <div class="card-body">
              <textarea
                v-model="form.lost_reason"
                :class="['form-control', { 'is-invalid': validationErrors.lost_reason }]"
                rows="2"
                placeholder="Specify why the lead was lost..."
                @input="clearError('lost_reason')"
              ></textarea>
              <div v-if="validationErrors.lost_reason" class="invalid-feedback">{{ validationErrors.lost_reason[0] }}</div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="col-12">
          <div class="d-flex justify-content-end gap-2 flex-wrap">
            <button type="button" @click="$router.back()" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary px-4" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" style="border-color:rgba(255,255,255,0.4);border-top-color:#fff;" role="status"></span>
              <span v-if="saving">Updating...</span>
              <span v-else>
                <i class="bi bi-floppy"></i> Update Lead
              </span>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLeadsStore } from '@/stores/leads';
import { useToast } from '@/composables/useToast';
import settingsApi from '@/api/settings';
import usersApi from '@/api/users';

const route = useRoute();
const router = useRouter();
const leadsStore = useLeadsStore();
const toast = useToast();

const loadingLead = ref(true);
const saving = ref(false);
const validationErrors = ref({});

const clearError = (field) => {
  if (validationErrors.value[field]) {
    delete validationErrors.value[field];
  }
};

const sources = ref([]);
const statuses = ref([]);
const stages = ref([]);
const teamMembers = ref([]);

const form = reactive({
  name: '',
  phone: '',
  whatsapp_number: '',
  email: '',
  company_name: '',
  city: '',
  state: '',
  source_id: '',
  status_id: '',
  stage_id: '',
  priority: 'medium',
  expected_value: '',
  assigned_to: '',
  requirement: '',
  lost_reason: ''
});

const isLostSelected = computed(() => {
  const selectedStage = stages.value.find(s => s.id === Number(form.stage_id));
  return selectedStage?.name === 'Lost';
});

const loadDropdownsAndLead = async () => {
  try {
    const [resStatus, resStages, resSources, resUsers] = await Promise.allSettled([
      settingsApi.getStatuses(),
      settingsApi.getStages(),
      settingsApi.getSources(),
      usersApi.getUsers()
    ]);

    if (resStatus.status === 'fulfilled') statuses.value = resStatus.value.data.statuses || [];
    if (resStages.status === 'fulfilled') stages.value = resStages.value.data.stages || [];
    if (resSources.status === 'fulfilled') sources.value = resSources.value.data.sources || [];
    if (resUsers.status === 'fulfilled') teamMembers.value = resUsers.value.data.users || [];

    await leadsStore.fetchLead(route.params.id);
    const lead = leadsStore.currentLead;

    if (lead) {
      Object.keys(form).forEach(key => {
        if (lead[key] !== undefined && lead[key] !== null) {
          form[key] = lead[key];
        }
      });
    }
  } catch (err) {
    toast.error('Failed to load lead details.');
  } finally {
    loadingLead.value = false;
  }
};

onMounted(() => {
  loadDropdownsAndLead();
});

const updateLead = async () => {
  saving.value = true;
  validationErrors.value = {};

  try {
    await leadsStore.updateLead(route.params.id, form);
    toast.success('Lead updated successfully.');
    router.push('/leads');
  } catch (err) {
    if (err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors;
      const firstMsg = Object.values(err.response.data.errors).flat()[0];
      toast.error(firstMsg || 'Validation failed. Please correct input fields.');
    } else if (err.errors) {
      validationErrors.value = err.errors;
      toast.error('Validation failed. Please correct input fields.');
    } else {
      toast.error(err.response?.data?.message || err.message || 'Failed to update lead.');
    }
  } finally {
    saving.value = false;
  }
};
</script>
