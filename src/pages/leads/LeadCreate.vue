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
                <input id="lead-name" v-model="form.name" type="text" class="form-control" placeholder="Client full name" required />
                <div v-if="validationErrors.name" class="form-error">{{ validationErrors.name[0] }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="lead-phone">Mobile Number * <small class="text-muted-custom">(Indian format)</small></label>
                <input id="lead-phone" v-model="form.phone" type="text" class="form-control" placeholder="e.g. 9876543210" required />
                <div v-if="validationErrors.phone" class="form-error">{{ validationErrors.phone[0] }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="lead-whatsapp">WhatsApp Number <small class="text-muted-custom">(leave blank if same as mobile)</small></label>
                <input id="lead-whatsapp" v-model="form.whatsapp_number" type="text" class="form-control" placeholder="WhatsApp number" />
                <div v-if="validationErrors.whatsapp_number" class="form-error">{{ validationErrors.whatsapp_number[0] }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="lead-email">Email Address</label>
                <input id="lead-email" v-model="form.email" type="email" class="form-control" placeholder="client@domain.com" />
                <div v-if="validationErrors.email" class="form-error">{{ validationErrors.email[0] }}</div>
              </div>

              <div class="mb-0">
                <label class="form-label" for="lead-company">Company Name</label>
                <input id="lead-company" v-model="form.company_name" type="text" class="form-control" placeholder="Company or organization" />
                <div v-if="validationErrors.company_name" class="form-error">{{ validationErrors.company_name[0] }}</div>
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
                  <input id="lead-city" v-model="form.city" type="text" class="form-control" placeholder="Mumbai" />
                  <div v-if="validationErrors.city" class="form-error">{{ validationErrors.city[0] }}</div>
                </div>
                <div class="col-6">
                  <label class="form-label" for="lead-state">State</label>
                  <input id="lead-state" v-model="form.state" type="text" class="form-control" placeholder="Maharashtra" />
                  <div v-if="validationErrors.state" class="form-error">{{ validationErrors.state[0] }}</div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="lead-source">Lead Source</label>
                <select id="lead-source" v-model="form.source_id" class="form-select">
                  <option value="">— Select Source —</option>
                  <option v-for="source in sources" :key="source.id" :value="source.id">{{ source.name }}</option>
                </select>
                <div v-if="validationErrors.source_id" class="form-error">{{ validationErrors.source_id[0] }}</div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-6">
                  <label class="form-label" for="lead-status">Status</label>
                  <select id="lead-status" v-model="form.status_id" class="form-select">
                    <option value="">— Select Status —</option>
                    <option v-for="status in statuses" :key="status.id" :value="status.id">{{ status.name }}</option>
                  </select>
                  <div v-if="validationErrors.status_id" class="form-error">{{ validationErrors.status_id[0] }}</div>
                </div>
                <div class="col-6">
                  <label class="form-label" for="lead-stage">Pipeline Stage</label>
                  <select id="lead-stage" v-model="form.stage_id" class="form-select">
                    <option value="">— Select Stage —</option>
                    <option v-for="stage in stages" :key="stage.id" :value="stage.id">{{ stage.name }}</option>
                  </select>
                  <div v-if="validationErrors.stage_id" class="form-error">{{ validationErrors.stage_id[0] }}</div>
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
                  <input id="lead-value" v-model="form.expected_value" type="number" class="form-control" placeholder="10000" min="0" />
                  <div v-if="validationErrors.expected_value" class="form-error">{{ validationErrors.expected_value[0] }}</div>
                </div>
              </div>

              <div class="mb-0">
                <label class="form-label" for="lead-assigned">Assigned Executive</label>
                <select id="lead-assigned" v-model="form.assigned_to" class="form-select">
                  <option value="">— Unassigned —</option>
                  <option v-for="user in teamMembers" :key="user.id" :value="user.id">{{ user.name }}</option>
                </select>
                <div v-if="validationErrors.assigned_to" class="form-error">{{ validationErrors.assigned_to[0] }}</div>
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
                class="form-control"
                rows="3"
                placeholder="Describe client's requirements, product interest, or other relevant details..."
              ></textarea>
              <div v-if="validationErrors.requirement" class="form-error">{{ validationErrors.requirement[0] }}</div>
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
                  <input id="followup-date" v-model="form.next_follow_up_date" type="date" class="form-control" />
                  <div v-if="validationErrors.next_follow_up_date" class="form-error">{{ validationErrors.next_follow_up_date[0] }}</div>
                </div>
                <div class="col-12 col-sm-6">
                  <label class="form-label" for="followup-time">Follow-up Time</label>
                  <input id="followup-time" v-model="form.next_follow_up_time" type="time" class="form-control" />
                  <div v-if="validationErrors.next_follow_up_time" class="form-error">{{ validationErrors.next_follow_up_time[0] }}</div>
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
    const resStatus = await settingsApi.getStatuses();
    statuses.value = resStatus.data.statuses;
    if (statuses.value.length) form.status_id = statuses.value[0].id;

    const resStages = await settingsApi.getStages();
    stages.value = resStages.data.stages;
    if (stages.value.length) form.stage_id = stages.value[0].id;

    const resSources = await settingsApi.getSources();
    sources.value = resSources.data.sources;

    const resUsers = await usersApi.getUsers();
    teamMembers.value = resUsers.data.users.filter(u => u.is_active);
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
    if (err.errors) {
      validationErrors.value = err.errors;
      toast.error('Validation failed. Please correct input fields.');
    } else {
      toast.error(err.message || 'Failed to save lead.');
    }
  } finally {
    saving.value = false;
  }
};
</script>
