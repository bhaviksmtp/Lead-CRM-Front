<template>
  <div>
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-person-plus-fill"></i>
          Register New Lead
        </h2>
        <p class="page-header-sub">Capture customer requirements, lead source, deal value, and schedule follow-ups</p>
      </div>
      <router-link to="/leads" class="btn btn-secondary">
        <i class="bi bi-arrow-left"></i> Back to Leads
      </router-link>
    </div>

    <!-- Duplicate Warning Banner -->
    <div
      v-if="duplicates.length"
      class="p-3 mb-4 rounded border"
      style="background:#fffbeb;border-color:#fde68a!important;"
    >
      <div class="d-flex align-items-start gap-2">
        <i class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
        <div class="flex-grow-1">
          <strong style="color:#92400e;">Possible Duplicate Lead Found:</strong>
          <div v-for="dupe in duplicates" :key="dupe.id" class="d-flex align-items-center justify-content-between mt-1 flex-wrap gap-2">
            <span style="font-size:0.875rem;color:#78350f;">
              <strong>{{ dupe.name }}</strong> ({{ dupe.phone || dupe.email }}) &bull; Assigned to: {{ dupe.assigned_user?.name || 'Unassigned' }}
            </span>
            <router-link :to="`/leads/${dupe.id}`" class="btn btn-warning btn-sm" style="font-size:0.75rem;padding:2px 8px;">
              Open Existing Lead
            </router-link>
          </div>
          <p style="font-size:0.75rem;color:#b45309;margin:0.25rem 0 0;">
            You can continue saving this new lead, or open the existing lead record above.
          </p>
        </div>
      </div>
    </div>

    <form @submit.prevent="saveLead">
      <div class="row g-4">
        <!-- SECTION 1: Customer Details -->
        <div class="col-12 col-lg-6">
          <div class="card h-100">
            <div class="card-header">
              <i class="bi bi-person-vcard-fill"></i>
              Customer Information
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label" for="lead-name">Customer / Contact Name *</label>
                <input
                  id="lead-name"
                  v-model="form.name"
                  type="text"
                  :class="['form-control', { 'is-invalid': validationErrors.name }]"
                  placeholder="e.g. Rajesh Kumar"
                  @input="clearError('name')"
                  required
                />
                <div v-if="validationErrors.name" class="invalid-feedback">{{ validationErrors.name[0] }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="lead-phone">Mobile Number * <small class="text-muted">(Indian format)</small></label>
                <input
                  id="lead-phone"
                  v-model="form.phone"
                  type="text"
                  :class="['form-control', { 'is-invalid': validationErrors.phone }]"
                  placeholder="e.g. 9876543210"
                  @input="handlePhoneInput"
                  required
                />
                <div v-if="validationErrors.phone" class="invalid-feedback">{{ validationErrors.phone[0] }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="lead-email">Email Address</label>
                <input
                  id="lead-email"
                  v-model="form.email"
                  type="email"
                  :class="['form-control', { 'is-invalid': validationErrors.email }]"
                  placeholder="e.g. rajesh@company.com"
                  @input="handleEmailInput"
                />
                <div v-if="validationErrors.email" class="invalid-feedback">{{ validationErrors.email[0] }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="lead-company">Company / Business Name</label>
                <input
                  id="lead-company"
                  v-model="form.company_name"
                  type="text"
                  :class="['form-control', { 'is-invalid': validationErrors.company_name }]"
                  placeholder="e.g. Apex Industrial Solutions"
                  @input="clearError('company_name')"
                />
                <div v-if="validationErrors.company_name" class="invalid-feedback">{{ validationErrors.company_name[0] }}</div>
              </div>

              <div class="row g-2">
                <div class="col-6">
                  <label class="form-label">City</label>
                  <input v-model="form.city" type="text" class="form-control" placeholder="e.g. Mumbai" />
                </div>
                <div class="col-6">
                  <label class="form-label">State</label>
                  <input v-model="form.state" type="text" class="form-control" placeholder="e.g. Maharashtra" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 2: Sales & Pipeline Terms -->
        <div class="col-12 col-lg-6">
          <div class="card h-100">
            <div class="card-header">
              <i class="bi bi-briefcase-fill"></i>
              Sales &amp; Opportunity Terms
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Expected Deal Value (₹)</label>
                <input
                  v-model.number="form.expected_value"
                  type="number"
                  class="form-control"
                  placeholder="e.g. 150000"
                />
              </div>

              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">Lead Priority *</label>
                  <select v-model="form.priority" class="form-select">
                    <option value="high">High (Hot 🔥)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label">Lead Source</label>
                  <select v-model="form.source_id" class="form-select">
                    <option value="">Select source</option>
                    <option v-for="source in sources" :key="source.id" :value="source.id">{{ source.name }}</option>
                  </select>
                </div>
              </div>

              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">Pipeline Stage</label>
                  <select v-model="form.stage_id" class="form-select">
                    <option v-for="stage in stages" :key="stage.id" :value="stage.id">{{ stage.name }}</option>
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label">Assign To Executive</label>
                  <select v-model="form.assigned_to" class="form-select">
                    <option value="">Unassigned</option>
                    <option v-for="user in teamMembers" :key="user.id" :value="user.id">{{ user.name }}</option>
                  </select>
                </div>
              </div>

              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">First Follow-up Date</label>
                  <input v-model="form.next_follow_up_date" type="date" class="form-control" />
                </div>
                <div class="col-6">
                  <label class="form-label">Follow-up Time</label>
                  <input v-model="form.next_follow_up_time" type="time" class="form-control" />
                </div>
              </div>

              <div class="mb-0">
                <label class="form-label">Client Requirement / Inquiry Notes</label>
                <textarea
                  v-model="form.requirement"
                  class="form-control"
                  rows="3"
                  placeholder="Specify product interest, budget details, delivery requirements..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Submission Button -->
        <div class="col-12 text-end">
          <router-link to="/leads" class="btn btn-secondary me-2">Cancel</router-link>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-person-plus-fill"></i>
            Register Lead
          </button>
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
const duplicates = ref([]);

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
  next_follow_up_time: '11:00'
});

const clearError = (field) => {
  if (validationErrors.value[field]) {
    delete validationErrors.value[field];
  }
};

let dupeTimeout = null;
const checkDuplicateDebounced = () => {
  clearTimeout(dupeTimeout);
  dupeTimeout = setTimeout(async () => {
    if (!form.phone && !form.email) {
      duplicates.value = [];
      return;
    }
    try {
      const res = await leadsStore.checkDuplicate({ phone: form.phone, email: form.email });
      duplicates.value = res.duplicates || [];
    } catch (e) {
      console.warn('Duplicate check failed', e);
    }
  }, 400);
};

const handlePhoneInput = () => {
  clearError('phone');
  checkDuplicateDebounced();
};

const handleEmailInput = () => {
  clearError('email');
  checkDuplicateDebounced();
};

const loadDropdowns = async () => {
  try {
    const [resStatus, resStages, resSources, resUsers] = await Promise.allSettled([
      settingsApi.getStatuses(),
      settingsApi.getStages(),
      settingsApi.getSources(),
      usersApi.getUsers({ per_page: 100 })
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
      teamMembers.value = (resUsers.value.data.users?.data || resUsers.value.data.users || []).filter(u => u.is_active);
    }
  } catch (err) {
    toast.error('Failed to load dropdown choices.');
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
      toast.error(firstMsg || 'Please correct errors in form.');
    } else {
      toast.error(err.response?.data?.message || 'Failed to save lead.');
    }
  } finally {
    saving.value = false;
  }
};
</script>
