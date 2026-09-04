<template>
  <div class="d-flex flex-column gap-4">
    <!-- Page Header & Action Bar -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-people-fill"></i>
          Leads
        </h2>
        <p class="page-header-sub">Manage and track your customer leads, deal values, and follow-ups</p>
      </div>
      <router-link to="/leads/create" class="btn btn-primary btn-sm" id="add-lead-btn">
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
            <select v-model="filters.status_id" class="form-select" @change="loadLeads" id="filter-status">
              <option value="">All Statuses</option>
              <option v-for="status in statuses" :key="status.id" :value="status.id">{{ status.name }}</option>
            </select>
          </div>
          <div class="col-6 col-md-2">
            <select v-model="filters.priority" class="form-select" @change="loadLeads" id="filter-priority">
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
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
            <th>Contact Details</th>
            <th>Priority</th>
            <th>Source</th>
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
              <router-link :to="`/leads/${lead.id}`" class="fw-700 text-dark text-decoration-none hover-primary">
                {{ lead.name }}
              </router-link>
              <div style="font-size:0.75rem;color:var(--text-secondary);">{{ lead.company_name || 'Individual' }}</div>
            </td>
            <td>
              <span class="td-label">Contact</span>
              <div style="font-size:0.875rem;font-weight:500;">{{ formatPhone(lead.phone) }}</div>
              <div v-if="lead.email" style="font-size:0.75rem;color:var(--text-secondary);">{{ lead.email }}</div>
            </td>
            <td>
              <span class="td-label">Priority</span>
              <span v-if="lead.priority" :class="['badge', `badge-${lead.priority}`]">
                <i v-if="lead.priority === 'high'" class="bi bi-fire"></i>
                {{ lead.priority }}
              </span>
            </td>
            <td>
              <span class="td-label">Source</span>
              <span :class="['badge', getSourceBadgeClass(lead.source?.name)]">
                <i :class="getSourceIcon(lead.source?.name)"></i>
                {{ lead.source?.name || 'Direct' }}
              </span>
            </td>
            <td>
              <span class="td-label">Stage</span>
              <span class="badge badge-new">{{ lead.stage?.name || 'New' }}</span>
            </td>
            <td>
              <span class="td-label">Est. Value</span>
              <span class="fw-700" style="color:var(--primary);">{{ formatCurrency(lead.expected_value) }}</span>
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
                  <i class="bi bi-eye"></i>
                </router-link>
                <button @click="triggerCall(lead.phone)" class="btn btn-secondary btn-sm" title="Call">
                  <i class="bi bi-telephone-fill"></i>
                </button>
                <button @click="handleWhatsAppAction(lead)" class="btn btn-whatsapp btn-sm" title="WhatsApp Activity">
                  <i class="bi bi-whatsapp"></i>
                </button>
                <button @click="openFollowUpModal(lead)" class="btn btn-primary btn-sm" title="Schedule Follow-up">
                  <i class="bi bi-calendar-plus"></i>
                </button>
                <button @click="deleteConfirm(lead)" class="btn btn-danger btn-sm" title="Delete">
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
        <p class="empty-state-desc">Try clearing filters or click "Add Lead" to register a new opportunity.</p>
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
            <select v-model="followUpForm.type" class="form-select" required>
              <option value="call">Phone Call</option>
              <option value="whatsapp">WhatsApp Message</option>
              <option value="email">Email Message</option>
              <option value="meeting">In-Person Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Date &amp; Time *</label>
            <input v-model="followUpForm.scheduled_at" type="datetime-local" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Notes / Remarks</label>
            <textarea v-model="followUpForm.notes" class="form-control" rows="3" placeholder="Specific agenda for this task..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showFollowUpModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitFollowUp" class="btn btn-primary" :disabled="submittingFollowUp">
            <span v-if="submittingFollowUp" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-calendar-check"></i>
            Schedule Task
          </button>
        </div>
      </div>
    </div>

    <!-- Log WhatsApp Activity Modal -->
    <div v-if="showWhatsAppModal" class="modal-overlay" @click.self="showWhatsAppModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-whatsapp text-whatsapp"></i>
            Log WhatsApp Activity &bull; {{ activeLead?.name }}
          </h5>
          <button @click="showWhatsAppModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:1rem;">
            <i class="bi bi-info-circle me-1"></i>
            WhatsApp web/app was opened. Record your conversation notes below to save the interaction in the lead's history.
          </p>
          <div class="mb-3">
            <label class="form-label">Activity Notes *</label>
            <textarea
              v-model="whatsAppNote"
              class="form-control"
              rows="3"
              placeholder="e.g. Sent brochure and pricing details. Customer requested follow-up next Tuesday."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showWhatsAppModal = false" class="btn btn-secondary">Close</button>
          <button @click="saveWhatsAppActivity" class="btn btn-whatsapp" :disabled="!whatsAppNote.trim()">
            <i class="bi bi-floppy"></i> Save Activity Log
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
import { useLeadSource } from '@/composables/useLeadSource';
import { useToast } from '@/composables/useToast';
import { useSwal } from '@/composables/useSwal';
import settingsApi from '@/api/settings';

const leadsStore = useLeadsStore();
const followUpsStore = useFollowUpsStore();
const { formatCurrency, formatPhone } = useIndianFormat();
const { openWhatsApp } = useWhatsApp();
const { getSourceIcon, getSourceBadgeClass } = useLeadSource();
const toast = useToast();
const { confirmDelete } = useSwal();

const loading = computed(() => leadsStore.loading);
const leads = computed(() => leadsStore.leads);
const pagination = computed(() => leadsStore.pagination);

const statuses = ref([]);
const stages = ref([]);
const sources = ref([]);

const filters = reactive({
  search: '',
  status_id: '',
  stage_id: '',
  source_id: '',
  priority: '',
  page: 1
});

// Follow-up modal
const showFollowUpModal = ref(false);
const activeLead = ref(null);
const submittingFollowUp = ref(false);
const followUpForm = reactive({
  type: 'call',
  scheduled_at: '',
  notes: ''
});

// WhatsApp modal
const showWhatsAppModal = ref(false);
const whatsAppNote = ref('');

let debounceTimeout = null;
const debounceFetch = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    filters.page = 1;
    loadLeads();
  }, 350);
};

const loadLeads = async () => {
  await leadsStore.fetchLeads(filters);
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

const triggerCall = (phone) => {
  if (phone) window.open(`tel:${phone}`);
};

const handleWhatsAppAction = (lead) => {
  if (!lead) return;
  activeLead.value = lead;
  whatsAppNote.value = '';
  if (lead.phone) {
    openWhatsApp(lead.phone, `Hi ${lead.name}, connecting from Convera.`);
  }
  showWhatsAppModal.value = true;
};

const saveWhatsAppActivity = async () => {
  if (!activeLead.value || !whatsAppNote.value.trim()) return;
  try {
    await leadsStore.logActivity(activeLead.value.id, {
      type: 'WhatsApp Message',
      description: whatsAppNote.value.trim(),
    });
    toast.success('WhatsApp activity recorded in lead history.');
    showWhatsAppModal.value = false;
    whatsAppNote.value = '';
  } catch (err) {
    toast.error('Failed to save WhatsApp activity.');
  }
};

const openFollowUpModal = (lead) => {
  activeLead.value = lead;
  followUpForm.type = 'call';
  followUpForm.scheduled_at = '';
  followUpForm.notes = '';
  showFollowUpModal.value = true;
};

const submitFollowUp = async () => {
  if (!followUpForm.scheduled_at) {
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
    toast.success('Follow-up scheduled.');
    showFollowUpModal.value = false;
  } catch (err) {
    toast.error('Failed to schedule follow-up.');
  } finally {
    submittingFollowUp.value = false;
  }
};

const deleteConfirm = async (lead) => {
  const confirmed = await confirmDelete(`lead "${lead.name}"`);
  if (confirmed) {
    try {
      await leadsStore.deleteLead(lead.id);
      toast.success('Lead deleted.');
      loadLeads();
    } catch (err) {
      toast.error('Failed to delete lead.');
    }
  }
};

onMounted(async () => {
  loadLeads();
  try {
    const [statusesRes, stagesRes, sourcesRes] = await Promise.all([
      settingsApi.getStatuses(),
      settingsApi.getStages(),
      settingsApi.getSources()
    ]);
    statuses.value = statusesRes.data.statuses || [];
    stages.value = stagesRes.data.stages || [];
    sources.value = sourcesRes.data.sources || [];
  } catch (e) {
    console.error('Failed to load filter options', e);
  }
});
</script>

<style scoped>
.hover-primary:hover {
  color: var(--primary) !important;
}
</style>
