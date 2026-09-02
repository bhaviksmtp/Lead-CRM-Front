<template>
  <div class="d-flex flex-column gap-4">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-people-fill"></i>
          Leads
        </h2>
        <p class="page-header-sub">Manage and track all customer leads and opportunities</p>
      </div>
      <router-link to="/leads/create" class="btn btn-primary" id="add-lead-btn">
        <i class="bi bi-person-plus-fill"></i> Add Lead
      </router-link>
    </div>

    <!-- Filters Bar -->
    <div class="card">
      <div class="card-body py-3">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-4 col-lg-3">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input
                v-model="filters.search"
                type="text"
                class="form-control"
                placeholder="Search name, phone, company..."
                @input="debounceFetch"
                id="leads-search"
              />
            </div>
          </div>
          <div class="col-6 col-md-2">
            <select v-model="filters.status_id" class="form-select" @change="loadLeads" id="filter-status">
              <option value="">All Statuses</option>
              <option v-for="status in statuses" :key="status.id" :value="status.id">{{ status.name }}</option>
            </select>
          </div>
          <div class="col-6 col-md-2">
            <select v-model="filters.stage_id" class="form-select" @change="loadLeads" id="filter-stage">
              <option value="">All Stages</option>
              <option v-for="stage in stages" :key="stage.id" :value="stage.id">{{ stage.name }}</option>
            </select>
          </div>
          <div class="col-6 col-md-2">
            <select v-model="filters.source_id" class="form-select" @change="loadLeads" id="filter-source">
              <option value="">All Sources</option>
              <option v-for="source in sources" :key="source.id" :value="source.id">{{ source.name }}</option>
            </select>
          </div>
          <div class="col-6 col-md-2">
            <select v-model="filters.priority" class="form-select" @change="loadLeads" id="filter-priority">
              <option value="">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <div class="col-12 col-md-auto">
            <button @click="clearFilters" class="btn btn-secondary btn-sm w-100" id="clear-filters-btn">
              <i class="bi bi-x-circle"></i> Clear
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex flex-column align-items-center py-5 gap-3">
      <div class="spinner-custom"></div>
      <p style="color:var(--text-secondary);font-size:0.875rem;">Fetching leads...</p>
    </div>

    <!-- Leads Table -->
    <div v-else-if="leads.length" class="table-responsive">
      <table class="table table-hover table-mobile-cards mb-0">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>WhatsApp / Contact</th>
            <th>Source</th>
            <th>Status</th>
            <th>Stage</th>
            <th>Est. Value</th>
            <th>Executive</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lead in leads" :key="lead.id">
            <td>
              <span class="td-label">Customer</span>
              <div class="fw-600 text-dark">{{ lead.name }}</div>
              <div style="font-size:0.75rem;color:var(--text-secondary);">{{ lead.company_name || '—' }}</div>
            </td>
            <td>
              <span class="td-label">Contact</span>
              <div style="font-size:0.875rem;font-weight:500;">{{ formatPhone(lead.phone) }}</div>
              <span v-if="lead.priority" :class="['badge mt-1', `badge-${lead.priority}`]">
                <i v-if="lead.priority === 'high'" class="bi bi-fire"></i>
                {{ lead.priority }}
              </span>
            </td>
            <td>
              <span class="td-label">Source</span>
              <span class="badge badge-low">{{ lead.source?.name || 'Unknown' }}</span>
            </td>
            <td>
              <span class="td-label">Status</span>
              <span style="font-size:0.875rem;font-weight:500;">{{ lead.status?.name || 'New' }}</span>
            </td>
            <td>
              <span class="td-label">Stage</span>
              <span class="badge badge-new">{{ lead.stage?.name || 'New Lead' }}</span>
            </td>
            <td>
              <span class="td-label">Est. Value</span>
              <span class="fw-600" style="color:var(--primary);">{{ formatCurrency(lead.expected_value) }}</span>
            </td>
            <td>
              <span class="td-label">Executive</span>
              <span style="font-size:0.875rem;" class="d-inline-flex align-items-center gap-1">
                <i class="bi bi-person text-secondary"></i>
                {{ lead.assigned_user?.name || 'Unassigned' }}
              </span>
            </td>
            <td>
              <span class="td-label">Actions</span>
              <div class="d-flex flex-wrap gap-1">
                <router-link :to="`/leads/${lead.id}`" class="btn btn-secondary btn-sm" title="View Details">
                  <i class="bi bi-eye"></i> View
                </router-link>
                <router-link :to="`/leads/${lead.id}/edit`" class="btn btn-secondary btn-sm" title="Edit Lead">
                  <i class="bi bi-pencil"></i>
                </router-link>
                <button @click="triggerWhatsApp(lead)" class="btn btn-whatsapp btn-sm" title="WhatsApp Chat">
                  <i class="bi bi-whatsapp"></i>
                </button>
                <button @click="openFollowUpModal(lead)" class="btn btn-primary btn-sm" title="Schedule Follow-up">
                  <i class="bi bi-calendar-plus"></i> Schedule
                </button>
                <button @click="deleteConfirm(lead)" class="btn btn-danger btn-sm" title="Delete Lead">
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
        <div class="empty-state-icon"><i class="bi bi-people"></i></div>
        <span class="empty-state-title">No leads found</span>
        <p class="empty-state-desc">Try clearing filters or click "Add Lead" to register a new lead.</p>
        <router-link to="/leads/create" class="btn btn-primary mt-2">
          <i class="bi bi-person-plus-fill"></i> Add Lead
        </router-link>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.last_page > 1" class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <span style="font-size:0.8125rem;color:var(--text-secondary);">
        Page <strong class="text-primary-custom">{{ pagination.current_page }}</strong> of {{ pagination.last_page }}
      </span>
      <div class="d-flex gap-2">
        <button
          :disabled="pagination.current_page === 1"
          @click="changePage(pagination.current_page - 1)"
          class="btn btn-secondary btn-sm"
        >
          <i class="bi bi-chevron-left"></i> Previous
        </button>
        <button
          :disabled="pagination.current_page === pagination.last_page"
          @click="changePage(pagination.current_page + 1)"
          class="btn btn-secondary btn-sm"
        >
          Next <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Schedule Follow-up Modal -->
    <div v-if="showFollowUpModal" class="modal-overlay" @click.self="showFollowUpModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-calendar-plus text-primary-custom"></i>
            Schedule Follow-up — {{ activeLead?.name }}
          </h5>
          <button @click="showFollowUpModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Follow-up Type</label>
            <select
              v-model="followUpForm.type"
              :class="['form-select', { 'is-invalid': followUpErrors.type }]"
              @change="clearFollowUpError('type')"
              required
            >
              <option value="whatsapp">WhatsApp Message</option>
              <option value="call">Phone Call</option>
              <option value="email">Email Message</option>
              <option value="meeting">In-Person Meeting</option>
              <option value="other">Other</option>
            </select>
            <div v-if="followUpErrors.type" class="invalid-feedback">{{ followUpErrors.type[0] }}</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Date &amp; Time *</label>
            <input
              v-model="followUpForm.scheduled_at"
              type="datetime-local"
              :class="['form-control', { 'is-invalid': followUpErrors.scheduled_at }]"
              @input="clearFollowUpError('scheduled_at')"
              required
            />
            <div v-if="followUpErrors.scheduled_at" class="invalid-feedback">{{ followUpErrors.scheduled_at[0] }}</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Notes / Remarks</label>
            <textarea
              v-model="followUpForm.notes"
              :class="['form-control', { 'is-invalid': followUpErrors.notes }]"
              rows="3"
              placeholder="Specific notes on this task..."
              @input="clearFollowUpError('notes')"
            ></textarea>
            <div v-if="followUpErrors.notes" class="invalid-feedback">{{ followUpErrors.notes[0] }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showFollowUpModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitFollowUp" class="btn btn-primary" :disabled="submittingFollowUp">
            <span v-if="submittingFollowUp" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="bi bi-calendar-check"></i>
            Schedule Task
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useLeadsStore } from '@/stores/leads';
import { useFollowUpsStore } from '@/stores/followups';
import { useIndianFormat } from '@/composables/useIndianFormat';
import { useWhatsApp } from '@/composables/useWhatsApp';
import { useToast } from '@/composables/useToast';
import { useSwal } from '@/composables/useSwal';
import settingsApi from '@/api/settings';

const leadsStore = useLeadsStore();
const followUpsStore = useFollowUpsStore();
const { formatCurrency, formatPhone } = useIndianFormat();
const { openWhatsApp } = useWhatsApp();
const toast = useToast();
const { confirmDelete } = useSwal();

const loading = computed(() => leadsStore.loading);
const leads = computed(() => leadsStore.leads);
const pagination = computed(() => leadsStore.pagination);

const filters = reactive({
  search: '',
  status_id: '',
  stage_id: '',
  source_id: '',
  priority: '',
  page: 1
});

const statuses = ref([]);
const stages = ref([]);
const sources = ref([]);

const showFollowUpModal = ref(false);
const activeLead = ref(null);
const submittingFollowUp = ref(false);
const followUpErrors = ref({});
const followUpForm = reactive({
  type: 'call',
  scheduled_at: '',
  notes: ''
});

const clearFollowUpError = (field) => {
  if (followUpErrors.value[field]) {
    delete followUpErrors.value[field];
  }
};

const loadLeads = async () => {
  try {
    await leadsStore.fetchLeads(filters);
  } catch (err) {
    toast.error('Failed to load leads list.');
  }
};

const loadFiltersDropdowns = async () => {
  try {
    const resStatus = await settingsApi.getStatuses();
    statuses.value = resStatus.data.statuses;
    const resStages = await settingsApi.getStages();
    stages.value = resStages.data.stages;
    const resSources = await settingsApi.getSources();
    sources.value = resSources.data.sources;
  } catch (err) {
    console.error('Failed to load filter definitions', err);
  }
};

onMounted(() => {
  loadLeads();
  loadFiltersDropdowns();
});

let debounceTimeout = null;
const debounceFetch = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    filters.page = 1;
    loadLeads();
  }, 400);
};

const clearFilters = () => {
  filters.search = '';
  filters.status_id = '';
  filters.stage_id = '';
  filters.source_id = '';
  filters.priority = '';
  filters.page = 1;
  loadLeads();
};

const changePage = (page) => {
  filters.page = page;
  loadLeads();
};

const triggerWhatsApp = (lead) => {
  const msg = `Hello ${lead.name},\n\nThis is regarding your inquiry about "${lead.requirement || 'our products'}". We would like to follow up with you.`;
  openWhatsApp(lead.phone, msg);
};

const openFollowUpModal = (lead) => {
  activeLead.value = lead;
  followUpForm.type = 'call';
  followUpForm.scheduled_at = '';
  followUpForm.notes = '';
  followUpErrors.value = {};
  showFollowUpModal.value = true;
};

const submitFollowUp = async () => {
  followUpErrors.value = {};
  if (!followUpForm.scheduled_at) {
    followUpErrors.value.scheduled_at = ['Please select a date and time for follow-up.'];
    toast.error('Please select date and time.');
    return;
  }
  submittingFollowUp.value = true;
  try {
    await followUpsStore.createFollowUp({
      lead_id: activeLead.value.id,
      assigned_to: activeLead.value.assigned_to || undefined,
      ...followUpForm
    });
    toast.success('Follow-up scheduled successfully.');
    showFollowUpModal.value = false;
    loadLeads();
  } catch (err) {
    if (err.response?.data?.errors) {
      followUpErrors.value = err.response.data.errors;
      const firstMsg = Object.values(err.response.data.errors).flat()[0];
      toast.error(firstMsg || 'Failed to create follow-up task.');
    } else {
      toast.error(err.response?.data?.message || err.message || 'Failed to create follow-up task.');
    }
  } finally {
    submittingFollowUp.value = false;
  }
};

const deleteConfirm = async (lead) => {
  const confirmed = await confirmDelete(`lead "${lead.name}"`);
  if (confirmed) {
    try {
      await leadsStore.deleteLead(lead.id);
      toast.success('Lead deleted successfully.');
      loadLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete lead.');
    }
  }
};
</script>
