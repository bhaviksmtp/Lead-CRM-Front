<template>
  <div>
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-person-plus-fill"></i>
          Register New Lead
        </h2>
        <p class="page-header-sub">Fill in the customer details and requirement to create a new lead</p>
      </div>
      <router-link to="/leads" class="btn btn-secondary">
        <i class="bi bi-arrow-left"></i> Back to Leads
      </router-link>
    </div>

    <form @submit.prevent="saveLead">
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
                <label class="form-label" for="lead-name">Full Name *</label>
                <input
                  id="lead-name"
                  v-model="form.name"
                  type="text"
                  :class="['form-control', { 'is-invalid': validationErrors.name }]"
                  placeholder="Client full name"
                  @input="clearError('name')"
                  required
                />
                <div v-if="validationErrors.name" class="invalid-feedback">{{ validationErrors.name[0] }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="lead-phone">Mobile Number * <small class="text-muted-custom">(Indian format)</small></label>
                <input
                  id="lead-phone"
                  v-model="form.phone"
                  type="text"
                  :class="['form-control', { 'is-invalid': validationErrors.phone }]"
                  placeholder="e.g. 9876543210"
                  @input="clearError('phone')"
                  required
                />
                <div v-if="validationErrors.phone" class="invalid-feedback">{{ validationErrors.phone[0] }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="lead-whatsapp">WhatsApp Number <small class="text-muted-custom">(leave blank if same as mobile)</small></label>
                <input
                  id="lead-whatsapp"
                  v-model="form.whatsapp_number"
                  type="text"
                  :class="['form-control', { 'is-invalid': validationErrors.whatsapp_number }]"
                  placeholder="WhatsApp number"
                  @input="clearError('whatsapp_number')"
                />
                <div v-if="validationErrors.whatsapp_number" class="invalid-feedback">{{ validationErrors.whatsapp_number[0] }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="lead-email">Email Address</label>
                <input
                  id="lead-email"
                  v-model="form.email"
                  type="email"
                  :class="['form-control', { 'is-invalid': validationErrors.email }]"
                  placeholder="client@domain.com"
                  @input="clearError('email')"
                />
                <div v-if="validationErrors.email" class="invalid-feedback">{{ validationErrors.email[0] }}</div>
              </div>

              <div class="mb-0">
                <label class="form-label" for="lead-company">Company Name</label>
                <input
                  id="lead-company"
                  v-model="form.company_name"
                  type="text"
                  :class="['form-control', { 'is-invalid': validationErrors.company_name }]"
                  placeholder="Company or organization"
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
                  <label class="form-label" for="lead-city">City</label>
                  <input
                    id="lead-city"
                    v-model="form.city"
                    type="text"
                    :class="['form-control', { 'is-invalid': validationErrors.city }]"
                    placeholder="Mumbai"
                    @input="clearError('city')"
                  />
                  <div v-if="validationErrors.city" class="invalid-feedback">{{ validationErrors.city[0] }}</div>
                </div>
                <div class="col-6">
                  <label class="form-label" for="lead-state">State</label>
                  <input
                    id="lead-state"
                    v-model="form.state"
                    type="text"
                    :class="['form-control', { 'is-invalid': validationErrors.state }]"
                    placeholder="Maharashtra"
                    @input="clearError('state')"
                  />
                  <div v-if="validationErrors.state" class="invalid-feedback">{{ validationErrors.state[0] }}</div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="lead-source">Lead Source</label>
                <select
                  id="lead-source"
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
                  <label class="form-label" for="lead-status">Status</label>
                  <select
                    id="lead-status"
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
                  <label class="form-label" for="lead-stage">Pipeline Stage</label>
                  <select
                    id="lead-stage"
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
                  <label class="form-label" for="lead-priority">Priority</label>
                  <select id="lead-priority" v-model="form.priority" class="form-select">
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label" for="lead-value">Est. Value (₹)</label>
                  <input
                    id="lead-value"
                    v-model="form.expected_value"
                    type="number"
                    :class="['form-control', { 'is-invalid': validationErrors.expected_value }]"
                    placeholder="10000"
                    min="0"
                    @input="clearError('expected_value')"
                  />
                  <div v-if="validationErrors.expected_value" class="invalid-feedback">{{ validationErrors.expected_value[0] }}</div>
                </div>
              </div>

              <div class="mb-0">
                <label class="form-label" for="lead-assigned">Assigned Executive</label>
                <select
                  id="lead-assigned"
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
                placeholder="Describe client's requirements, product interest, or other relevant details..."
                @input="clearError('requirement')"
              ></textarea>
              <div v-if="validationErrors.requirement" class="invalid-feedback">{{ validationErrors.requirement[0] }}</div>
            </div>
          </div>
        </div>

        <!-- SECTION 4: Initial Follow-up -->
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <i class="bi bi-calendar-plus-fill"></i>
              Initial Follow-up Task <span style="font-weight:400;color:var(--text-muted);">(Optional)</span>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <label class="form-label" for="followup-date">Follow-up Date</label>
                  <input
                    id="followup-date"
                    v-model="form.next_follow_up_date"
                    type="date"
                    :class="['form-control', { 'is-invalid': validationErrors.next_follow_up_date }]"
                    @change="clearError('next_follow_up_date')"
                  />
                  <div v-if="validationErrors.next_follow_up_date" class="invalid-feedback">{{ validationErrors.next_follow_up_date[0] }}</div>
                </div>
                <div class="col-12 col-sm-6">
                  <label class="form-label" for="followup-time">Follow-up Time</label>
                  <input
                    id="followup-time"
                    v-model="form.next_follow_up_time"
                    type="time"
                    :class="['form-control', { 'is-invalid': validationErrors.next_follow_up_time }]"
                    @change="clearError('next_follow_up_time')"
                  />
                  <div v-if="validationErrors.next_follow_up_time" class="invalid-feedback">{{ validationErrors.next_follow_up_time[0] }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="col-12">
          <div class="d-flex justify-content-end gap-2 flex-wrap">
            <router-link to="/leads" class="btn btn-secondary">Cancel</router-link>
            <button type="submit" class="btn btn-primary px-4" :disabled="saving" id="save-lead-btn">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" style="border-color:rgba(255,255,255,0.4);border-top-color:#fff;" role="status"></span>
              <span v-if="saving">Saving Lead...</span>
              <span v-else>
                <i class="bi bi-check-lg"></i> Register Lead
              </span>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLeadsStore } from '@/stores/leads';
import { useToast } from '@/composables/useToast';
import settingsApi from '@/api/settings';
import usersApi from '@/api/users';

const router = useRouter();
const leadsStore = useLeadsStore();
const toast = useToast();

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
  next_follow_up_date: '',
  next_follow_up_time: ''
});

const loadDropdowns = async () => {
  try {
    const [resStatus, resStages, resSources, resUsers] = await Promise.allSettled([
      settingsApi.getStatuses(),
      settingsApi.getStages(),
      settingsApi.getSources(),
      usersApi.getUsers()
    ]);

    if (resStatus.status === 'fulfilled') {
      statuses.value = resStatus.value.data.statuses || [];
      if (statuses.value.length && !form.status_id) form.status_id = statuses.value[0].id;
    }

    if (resStages.status === 'fulfilled') {
      stages.value = resStages.value.data.stages || [];
      if (stages.value.length && !form.stage_id) form.stage_id = stages.value[0].id;
    }

    if (resSources.status === 'fulfilled') {
      sources.value = resSources.value.data.sources || [];
    }

    if (resUsers.status === 'fulfilled') {
      teamMembers.value = (resUsers.value.data.users || []).filter(u => u.is_active);
    }
  } catch (err) {
    toast.error('Failed to load form initialization data.');
  }
};

onMounted(() => {
  loadDropdowns();
});

const saveLead = async () => {
  saving.value = true;
  validationErrors.value = {};

  try {
    const payload = { ...form };
    if (!payload.whatsapp_number) {
      payload.whatsapp_number = payload.phone;
    }

    await leadsStore.createLead(payload);
    toast.success('Lead registered successfully.');
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
      toast.error(err.response?.data?.message || err.message || 'Failed to save lead.');
    }
  } finally {
    saving.value = false;
  }
};
</script>
