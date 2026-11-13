<template>
  <div class="d-flex flex-column gap-4">
    <!-- Page Header & Action Bar -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-2">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-people-fill"></i>
          Leads
        </h2>
        <p class="page-header-sub">Manage and track your customer leads, deal values, and follow-ups</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button @click="exportLeadsCsv" class="btn btn-secondary btn-sm" :disabled="exporting" title="Export Leads to CSV">
          <span v-if="exporting" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-download"></i> Export CSV
        </button>
        <button @click="showImportModal = true" class="btn btn-secondary btn-sm" title="Import Leads from CSV">
          <i class="bi bi-upload"></i> Import CSV
        </button>
        <router-link to="/leads/create" class="btn btn-primary btn-sm" id="add-lead-btn">
          <i class="bi bi-person-plus-fill"></i> Add Lead
        </router-link>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="card">
      <div class="card-body py-3">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-3">
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
            <select v-model="filters.customer_type" class="form-select" @change="loadLeads" id="filter-customer-type">
              <option value="">All Types</option>
              <option value="individual">Individual</option>
              <option value="business">Business / Corporate</option>
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

    <!-- Reusable DataTable -->
    <DataTable
      :columns="leadColumns"
      :data="leads"
      :loading="loading"
      :server-side="true"
      :total="pagination.total || 0"
      :current-page="pagination.current_page || 1"
      :page-size="filters.per_page || 15"
      :sort-by="filters.sort_by"
      :sort-order="filters.sort_order"
      :pagination="true"
      :selectable="true"
      @sort="handleSort"
      @page-change="changePage"
      @page-size-change="changePageSize"
    >
      <!-- Slot: Bulk Actions -->
      <template #bulk-actions="{ selected, clearSelection }">
        <div class="d-flex align-items-center gap-2">
          <button @click="openBulkAssign(selected, clearSelection)" class="btn btn-secondary btn-sm py-1 px-2" style="font-size:0.8125rem;">
            <i class="bi bi-person-check me-1"></i> Assign
          </button>
          <button @click="openBulkStage(selected, clearSelection)" class="btn btn-secondary btn-sm py-1 px-2" style="font-size:0.8125rem;">
            <i class="bi bi-arrow-right-circle me-1"></i> Update Stage
          </button>
          <button @click="executeBulkDelete(selected, clearSelection)" class="btn btn-danger btn-sm py-1 px-2" style="font-size:0.8125rem;">
            <i class="bi bi-trash3 me-1"></i> Delete
          </button>
        </div>
      </template>
      <!-- Slot: Customer Name -->
      <template #name="{ item }">
        <div class="d-flex align-items-center gap-2">
          <div class="avatar-circle" :style="getAvatarStyle(item.name)">
            {{ getInitials(item.name) }}
          </div>
          <div>
            <router-link :to="`/leads/${item.id}`" class="fw-700 text-dark text-decoration-none hover-primary d-inline-block">
              {{ item.name || 'Unnamed Lead' }}
            </router-link>
            <div class="mt-1 d-flex align-items-center gap-1">
              <span v-if="item.company_name" class="text-secondary small d-inline-flex align-items-center gap-1" :title="item.company_name">
                <i class="bi bi-building text-muted"></i>
                <span class="text-truncate" style="max-width: 140px;">{{ item.company_name }}</span>
              </span>
              <span v-else class="badge bg-light text-secondary border px-1 py-0" style="font-size:0.6875rem;font-weight:500;">
                <i class="bi bi-person me-1"></i>Individual
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Slot: Contact Details -->
      <template #contact="{ item }">
        <div class="d-flex align-items-center gap-1 text-dark" style="font-size:0.875rem;font-weight:600;">
          <i class="bi bi-telephone-fill text-muted" style="font-size:0.75rem;"></i>
          <span>{{ formatPhone(item.phone) }}</span>
        </div>
        <div v-if="item.email" class="d-flex align-items-center gap-1 text-secondary small mt-1">
          <i class="bi bi-envelope-fill text-muted" style="font-size:0.7rem;"></i>
          <span class="text-truncate" style="max-width: 160px;" :title="item.email">{{ item.email }}</span>
        </div>
        <div v-if="item.whatsapp_number && item.whatsapp_number !== item.phone" class="d-flex align-items-center gap-1 text-success small mt-1" title="WhatsApp Number">
          <i class="bi bi-whatsapp" style="font-size:0.75rem;"></i>
          <span>{{ formatPhone(item.whatsapp_number) }}</span>
        </div>
      </template>

      <!-- Slot: Priority -->
      <template #priority="{ item }">
        <span :class="['badge', `badge-${item.priority || 'medium'}`]" style="text-transform: capitalize; font-weight: 600;">
          <i v-if="item.priority === 'high'" class="bi bi-fire text-danger me-1"></i>
          <i v-else-if="item.priority === 'medium'" class="bi bi-dash-circle text-warning me-1"></i>
          <i v-else class="bi bi-arrow-down-circle text-secondary me-1"></i>
          {{ item.priority || 'medium' }}
        </span>
      </template>

      <!-- Slot: Source -->
      <template #source="{ item }">
        <span :class="['badge-source-new', getSourceBadgeClass(item.source?.name)]">
          <i :class="getSourceIcon(item.source?.name)"></i>
          {{ item.source?.name || 'Direct' }}
        </span>
      </template>

      <!-- Slot: Stage -->
      <template #stage="{ item }">
        <span v-if="['Converted', 'Won'].includes(item.stage?.name)" class="badge badge-won">
          <i class="bi bi-award-fill me-1"></i>{{ item.stage?.name === 'Won' ? 'Converted' : item.stage?.name }}
        </span>
        <span v-else-if="['Dropped', 'Lost'].includes(item.stage?.name)" class="badge badge-lost">
          <i class="bi bi-x-circle-fill me-1"></i>{{ item.stage?.name === 'Lost' ? 'Dropped' : item.stage?.name }}
        </span>
        <span v-else class="badge badge-new">{{ item.stage?.name || 'New' }}</span>
      </template>

      <!-- Slot: Est. Value -->
      <template #expected_value="{ item }">
        <span class="fw-700" style="color:var(--primary);">{{ formatCurrency(item.expected_value) }}</span>
      </template>

      <!-- Slot: Executive -->
      <template #assigned_user="{ item }">
        <span style="font-size:0.875rem;" class="d-inline-flex align-items-center gap-1">
          <i class="bi bi-person text-secondary"></i>
          {{ item.assigned_user?.name || 'Unassigned' }}
        </span>
      </template>

      <!-- Slot: Actions -->
      <template #actions="{ item }">
        <div class="d-flex flex-wrap gap-1">
          <router-link :to="`/leads/${item.id}`" class="btn btn-secondary btn-sm" title="View Details">
            <i class="bi bi-eye"></i>
          </router-link>
          <button @click="triggerCall(item.phone)" class="btn btn-secondary btn-sm" title="Call">
            <i class="bi bi-telephone-fill"></i>
          </button>
          <button @click="handleWhatsAppAction(item)" class="btn btn-whatsapp btn-sm" title="WhatsApp Activity">
            <i class="bi bi-whatsapp"></i>
          </button>
          <button @click="openFollowUpModal(item)" class="btn btn-primary btn-sm" title="Schedule Follow-up">
            <i class="bi bi-calendar-plus"></i>
          </button>
          <button @click="deleteConfirm(item)" class="btn btn-danger btn-sm" title="Delete">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </template>

      <!-- Slot: Empty State -->
      <template #empty>
        <div class="empty-state py-5">
          <div class="empty-state-icon"><i class="bi bi-people"></i></div>
          <span class="empty-state-title">No leads found</span>
          <p class="empty-state-desc">Try clearing filters or click "Add Lead" to register a new opportunity.</p>
          <router-link to="/leads/create" class="btn btn-primary mt-2">
            <i class="bi bi-person-plus-fill"></i> Add Lead
          </router-link>
        </div>
      </template>
    </DataTable>

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
          <button @click="showWhatsAppModal = false" class="btn btn-secondary" :disabled="submittingWhatsApp">Close</button>
          <button @click="saveWhatsAppActivity" class="btn btn-whatsapp" :disabled="!whatsAppNote.trim() || submittingWhatsApp">
            <span v-if="submittingWhatsApp" class="spinner-border spinner-border-sm me-1" role="status"></span>
            <i v-else class="bi bi-floppy"></i>
            {{ submittingWhatsApp ? 'Saving...' : 'Save Activity Log' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Assign Modal -->
    <div v-if="showBulkAssignModal" class="modal-overlay" @click.self="showBulkAssignModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-person-check text-primary-custom"></i>
            Assign {{ selectedLeadIds.length }} Selected Leads
          </h5>
          <button @click="showBulkAssignModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Select Sales Executive *</label>
            <select v-model="bulkAssignUserId" class="form-select" required>
              <option value="">Unassigned (Remove Assignee)</option>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }} ({{ user.email }})</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showBulkAssignModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitBulkAssign" class="btn btn-primary" :disabled="submittingBulk">
            <span v-if="submittingBulk" class="spinner-border spinner-border-sm me-1"></span>
            Apply Assignment
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Stage Modal -->
    <div v-if="showBulkStageModal" class="modal-overlay" @click.self="showBulkStageModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-arrow-right-circle text-primary-custom"></i>
            Update Stage for {{ selectedLeadIds.length }} Selected Leads
          </h5>
          <button @click="showBulkStageModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Select Pipeline Stage *</label>
            <select v-model="bulkStageId" class="form-select" required>
              <option value="">-- Choose Target Stage --</option>
              <option v-for="stage in stages" :key="stage.id" :value="stage.id">
                {{ ['Won', 'Converted'].includes(stage.name) ? 'Converted' : (['Lost', 'Dropped'].includes(stage.name) ? 'Dropped' : stage.name) }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showBulkStageModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitBulkStage" class="btn btn-primary" :disabled="!bulkStageId || submittingBulk">
            <span v-if="submittingBulk" class="spinner-border spinner-border-sm me-1"></span>
            Update Leads
          </button>
        </div>
      </div>
    </div>

    <!-- Import Leads Modal -->
    <div v-if="showImportModal" class="modal-overlay" @click.self="showImportModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-file-earmark-arrow-up text-primary-custom"></i>
            Import Leads from CSV
          </h5>
          <button @click="showImportModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <p class="text-secondary small mb-3">
            Upload a CSV file containing lead contacts. Column headers should include <code>name, phone, whatsapp_number, email, company_name, city, state, requirement, expected_value, priority</code>.
          </p>
          <div class="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded border">
            <span class="small text-muted"><i class="bi bi-info-circle me-1"></i>Need the format?</span>
            <button @click="downloadSampleCsv" class="btn btn-secondary btn-sm py-0 px-2" style="font-size:0.75rem;">
              <i class="bi bi-download me-1"></i> Download Sample CSV
            </button>
          </div>
          <div class="mb-3">
            <label class="form-label">Choose CSV File *</label>
            <input type="file" accept=".csv" @change="handleCsvFile" class="form-control" />
            <div v-if="parsedLeadsCount > 0" class="text-success small mt-1 fw-600">
              <i class="bi bi-check-circle-fill me-1"></i> Ready to import {{ parsedLeadsCount }} valid lead rows.
            </div>
          </div>
          <div class="form-check form-switch mb-2">
            <input v-model="skipDuplicates" class="form-check-input" type="checkbox" id="skip-dup-check" />
            <label class="form-check-label small fw-600" for="skip-dup-check">
              Skip duplicate phone numbers and emails automatically
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showImportModal = false" class="btn btn-secondary" :disabled="importing">Cancel</button>
          <button @click="submitImportCsv" class="btn btn-primary" :disabled="parsedLeadsCount === 0 || importing">
            <span v-if="importing" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-upload"></i>
            {{ importing ? 'Importing...' : `Import ${parsedLeadsCount || ''} Leads` }}
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
import usersApi from '@/api/users';

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
const users = ref([]);

// Bulk Actions State
const selectedLeadIds = ref([]);
const clearSelectionCallback = ref(null);
const showBulkAssignModal = ref(false);
const bulkAssignUserId = ref('');
const showBulkStageModal = ref(false);
const bulkStageId = ref('');
const submittingBulk = ref(false);

// Export & Import State
const exporting = ref(false);
const showImportModal = ref(false);
const importing = ref(false);
const skipDuplicates = ref(true);
const parsedLeads = ref([]);
const parsedLeadsCount = computed(() => parsedLeads.value.length);

const leadColumns = [
  { key: 'name', label: 'Customer Name', sortable: true, minWidth: '180px' },
  { key: 'contact', label: 'Contact Details', minWidth: '160px' },
  { key: 'priority', label: 'Priority', sortable: true, minWidth: '110px' },
  { key: 'source', label: 'Source', minWidth: '130px' },
  { key: 'stage', label: 'Stage', minWidth: '130px' },
  { key: 'expected_value', label: 'Est. Value', sortable: true, minWidth: '120px' },
  { key: 'assigned_user', label: 'Executive', minWidth: '130px' },
  { key: 'actions', label: 'Actions', minWidth: '175px', align: 'end' }
];

const filters = reactive({
  search: '',
  customer_type: '',
  status_id: '',
  stage_id: '',
  source_id: '',
  priority: '',
  sort_by: 'created_at',
  sort_order: 'desc',
  page: 1,
  per_page: 15
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

const handleSort = ({ sortBy, sortOrder }) => {
  filters.sort_by = sortBy;
  filters.sort_order = sortOrder;
  filters.page = 1;
  loadLeads();
};

const toggleSort = (col) => {
  handleSort({
    sortBy: col,
    sortOrder: filters.sort_by === col && filters.sort_order === 'asc' ? 'desc' : 'asc'
  });
};

const clearFilters = () => {
  filters.search = '';
  filters.customer_type = '';
  filters.status_id = '';
  filters.stage_id = '';
  filters.source_id = '';
  filters.priority = '';
  filters.sort_by = 'created_at';
  filters.sort_order = 'desc';
  filters.page = 1;
  filters.per_page = 15;
  loadLeads();
};

const changePage = (page) => {
  filters.page = page;
  loadLeads();
};

const changePageSize = (size) => {
  filters.per_page = size;
  filters.page = 1;
  loadLeads();
};

const triggerCall = (phone) => {
  if (phone) window.open(`tel:${phone}`);
};

const handleWhatsAppAction = (lead) => {
  if (!lead) return;
  activeLead.value = lead;
  whatsAppNote.value = '';
  const phoneToUse = lead.whatsapp_number || lead.phone;
  if (phoneToUse) {
    openWhatsApp(phoneToUse, `Hi ${lead.name}, connecting from Convera.`);
  }
  showWhatsAppModal.value = true;
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const avatarPalette = [
  { bg: '#e0e7ff', color: '#4338ca' },
  { bg: '#fef3c7', color: '#92400e' },
  { bg: '#d1fae5', color: '#065f46' },
  { bg: '#fce7f3', color: '#9d174d' },
  { bg: '#e0f2fe', color: '#0369a1' },
  { bg: '#ede9fe', color: '#5b21b6' },
];

const getAvatarStyle = (name) => {
  if (!name) return { backgroundColor: '#f1f5f9', color: '#64748b' };
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  const color = avatarPalette[Math.abs(hash) % avatarPalette.length];
  return { backgroundColor: color.bg, color: color.color };
};

const submittingWhatsApp = ref(false);

const saveWhatsAppActivity = async () => {
  if (!activeLead.value || !whatsAppNote.value.trim() || submittingWhatsApp.value) return;
  submittingWhatsApp.value = true;
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
  } finally {
    submittingWhatsApp.value = false;
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

// Bulk Actions Handlers
const openBulkAssign = (selected, clearFn) => {
  selectedLeadIds.value = selected.map(s => s.id);
  clearSelectionCallback.value = clearFn;
  bulkAssignUserId.value = '';
  showBulkAssignModal.value = true;
};

const submitBulkAssign = async () => {
  if (!selectedLeadIds.value.length) return;
  submittingBulk.value = true;
  try {
    const res = await leadsStore.bulkAssign(selectedLeadIds.value, bulkAssignUserId.value || null);
    toast.success(res.message || 'Leads assigned successfully.');
    showBulkAssignModal.value = false;
    if (clearSelectionCallback.value) clearSelectionCallback.value();
    loadLeads();
  } catch (err) {
    toast.error('Failed to bulk assign leads.');
  } finally {
    submittingBulk.value = false;
  }
};

const openBulkStage = (selected, clearFn) => {
  selectedLeadIds.value = selected.map(s => s.id);
  clearSelectionCallback.value = clearFn;
  bulkStageId.value = '';
  showBulkStageModal.value = true;
};

const submitBulkStage = async () => {
  if (!selectedLeadIds.value.length || !bulkStageId.value) return;
  submittingBulk.value = true;
  try {
    const res = await leadsStore.bulkStatus(selectedLeadIds.value, null, bulkStageId.value);
    toast.success(res.message || 'Lead stages updated successfully.');
    showBulkStageModal.value = false;
    if (clearSelectionCallback.value) clearSelectionCallback.value();
    loadLeads();
  } catch (err) {
    toast.error('Failed to update lead stages.');
  } finally {
    submittingBulk.value = false;
  }
};

const executeBulkDelete = async (selected, clearFn) => {
  const ids = selected.map(s => s.id);
  const confirmed = await confirmDelete(`${ids.length} selected leads`);
  if (confirmed) {
    try {
      const res = await leadsStore.bulkDelete(ids);
      toast.success(res.message || 'Selected leads deleted.');
      if (clearFn) clearFn();
      loadLeads();
    } catch (err) {
      toast.error('Failed to delete selected leads.');
    }
  }
};

// Export CSV Handler
const exportLeadsCsv = async () => {
  exporting.value = true;
  try {
    const rawLeads = await leadsStore.exportLeads();
    if (!rawLeads || rawLeads.length === 0) {
      toast.info('No leads available to export.');
      return;
    }
    const headers = ['ID', 'Name', 'Phone', 'WhatsApp', 'Email', 'Company', 'City', 'State', 'Priority', 'Source', 'Stage', 'Expected Value', 'Assigned To', 'Created At'];
    const rows = rawLeads.map(l => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      `"${l.whatsapp_number || ''}"`,
      `"${l.email || ''}"`,
      `"${(l.company_name || '').replace(/"/g, '""')}"`,
      `"${l.city || ''}"`,
      `"${l.state || ''}"`,
      l.priority || 'medium',
      `"${l.source?.name || ''}"`,
      `"${['Won', 'Converted'].includes(l.stage?.name) ? 'Converted' : (['Lost', 'Dropped'].includes(l.stage?.name) ? 'Dropped' : (l.stage?.name || ''))}"`,
      l.expected_value || 0,
      `"${l.assigned_user?.name || 'Unassigned'}"`,
      l.created_at || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rawLeads.length} leads successfully.`);
  } catch (err) {
    toast.error('Failed to export leads.');
  } finally {
    exporting.value = false;
  }
};

// Import CSV Handler
const downloadSampleCsv = () => {
  const sample = "name,phone,whatsapp_number,email,company_name,city,state,requirement,expected_value,priority\n" +
    "Aarav Patel,9876543210,9876543210,aarav@sample.in,Patel Enterprises,Mumbai,Maharashtra,Bulk packaging supplies,75000,high\n" +
    "Sunita Sharma,9123456780,9123456780,sunita@acme.com,Acme Corp,Bengaluru,Karnataka,CRM implementation,150000,medium";
  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'leads_import_sample.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const handleCsvFile = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.trim().split(/\r\n|\n/);
    if (lines.length < 2) {
      toast.error('CSV file has no data rows.');
      parsedLeads.value = [];
      return;
    }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"\s]/g, '_'));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] ?? '';
      });
      if (obj.name) {
        rows.push(obj);
      }
    }
    parsedLeads.value = rows;
  };
  reader.readAsText(file);
};

const submitImportCsv = async () => {
  if (!parsedLeads.value.length) return;
  importing.value = true;
  try {
    const res = await leadsStore.importLeads(parsedLeads.value, skipDuplicates.value);
    toast.success(res.message || 'Import completed.');
    showImportModal.value = false;
    parsedLeads.value = [];
    loadLeads();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to import leads.');
  } finally {
    importing.value = false;
  }
};

onMounted(async () => {
  loadLeads();
  try {
    const [statusesRes, stagesRes, sourcesRes, usersRes] = await Promise.all([
      settingsApi.getStatuses(),
      settingsApi.getStages(),
      settingsApi.getSources(),
      usersApi.getUsers().catch(() => ({ data: { users: [] } }))
    ]);
    statuses.value = statusesRes.data.statuses || [];
    stages.value = stagesRes.data.stages || [];
    sources.value = sourcesRes.data.sources || [];
    users.value = usersRes.data.users || usersRes.data.data || [];
  } catch (e) {
    console.error('Failed to load filter options', e);
  }
});
</script>

<style scoped>
.hover-primary:hover {
  color: var(--primary) !important;
}
.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.sortable-th {
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease;
}
.sortable-th:hover {
  color: var(--primary) !important;
}
</style>
