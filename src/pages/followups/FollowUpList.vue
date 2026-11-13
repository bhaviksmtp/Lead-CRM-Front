<template>
  <div class="d-flex flex-column gap-4">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-calendar-check-fill"></i>
          Follow-up Schedule
        </h2>
        <p class="page-header-sub">Manage and execute all scheduled client follow-up tasks</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabItems"
        :key="tab.value"
        :class="['tab-btn', { active: currentTab === tab.value }]"
        @click="switchTab(tab.value)"
        :id="`tab-${tab.value}`"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
        <span v-if="currentTab === tab.value && !loading" class="badge bg-white text-dark ms-1 shadow-xs" style="font-size:0.7rem;font-weight:700;">
          {{ followUps.length }}
        </span>
      </button>
    </div>

    <!-- Reusable DataTable -->
    <DataTable
      :columns="followUpColumns"
      :data="followUps"
      :loading="loading"
      :searchable="true"
      search-placeholder="Search contact, notes..."
      :pagination="true"
      :page-size="10"
      empty-icon="bi-calendar-x"
      empty-title="No follow-ups found"
      :empty-description="`No scheduled tasks under '${activeTabName}' category.`"
    >
      <!-- Slot: Customer / Lead -->
      <template #customer="{ item }">
        <router-link v-if="item.lead?.id" :to="`/leads/${item.lead.id}`" class="fw-700 text-dark text-decoration-none hover-primary">
          {{ item.lead?.name || 'N/A' }}
        </router-link>
        <div v-else class="fw-700 text-dark">{{ item.lead?.name || 'N/A' }}</div>
        <div class="mt-1 d-flex align-items-center gap-1">
          <span v-if="item.lead?.company_name" class="text-secondary small" :title="item.lead.company_name">
            <i class="bi bi-building text-muted me-1"></i>{{ item.lead.company_name }}
          </span>
          <span v-else class="badge bg-light text-secondary border px-1 py-0" style="font-size:0.6875rem;">
            <i class="bi bi-person me-1"></i>Individual
          </span>
        </div>
        <div style="font-size:0.75rem;color:var(--text-muted);" class="mt-1">
          <i class="bi bi-telephone me-1"></i>{{ formatPhone(item.lead?.phone) }}
        </div>
      </template>

      <!-- Slot: Type -->
      <template #type="{ item }">
        <span :class="['badge', getFollowUpTypeBadgeClass(item.type)]">
          <i :class="getFollowUpTypeIcon(item.type)"></i>
          {{ item.type }}
        </span>
      </template>

      <!-- Slot: Scheduled -->
      <template #scheduled_at="{ item }">
        <span
          class="fw-600"
          :style="isOverdue(item) ? 'color:var(--danger)' : ''"
        >
          <i class="bi bi-clock me-1 text-muted"></i>
          {{ formatDateTime(item.scheduled_at) }}
        </span>
        <span v-if="isOverdue(item)" class="badge badge-missed ms-1">
          <i class="bi bi-exclamation-circle-fill"></i> Overdue
        </span>
      </template>

      <!-- Slot: Status -->
      <template #status="{ item }">
        <span :class="['badge', `badge-${item.status}`]">
          <i v-if="item.status === 'completed'" class="bi bi-check-circle-fill"></i>
          <i v-else-if="item.status === 'missed'" class="bi bi-x-circle-fill"></i>
          <i v-else class="bi bi-hourglass-split"></i>
          {{ item.status }}
        </span>
      </template>

      <!-- Slot: Notes -->
      <template #notes="{ item }">
        <span style="font-size:0.8125rem;color:var(--text-secondary);">{{ item.notes || '—' }}</span>
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
          <button @click="triggerCall(item.lead?.phone)" class="btn btn-secondary btn-sm" title="Call">
            <i class="bi bi-telephone-fill"></i>
          </button>
          <button @click="triggerWhatsApp(item.lead)" class="btn btn-whatsapp btn-sm" title="WhatsApp">
            <i class="bi bi-whatsapp"></i>
          </button>
          <button
            v-if="item.status === 'pending' || item.status === 'missed'"
            @click="openRescheduleModal(item)"
            class="btn btn-secondary btn-sm"
            title="Reschedule"
          >
            <i class="bi bi-calendar-event"></i> Reschedule
          </button>
          <button
            v-if="item.status === 'pending' || item.status === 'missed'"
            @click="openCompleteModal(item)"
            class="btn btn-primary btn-sm"
            title="Complete"
          >
            <i class="bi bi-check-lg"></i> Complete
          </button>
          <button
            v-if="hasRole(['Super Admin', 'Company Admin'])"
            @click="deleteConfirm(item)"
            class="btn btn-danger btn-sm"
            title="Delete"
          >
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Complete Modal -->
    <div v-if="activeModal === 'complete'" class="modal-overlay" @click.self="activeModal = null">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-check-circle-fill text-won"></i>
            Mark Task Completed
          </h5>
          <button @click="activeModal = null" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Execution Remarks / Summary</label>
            <textarea
              v-model="actionNotes"
              class="form-control"
              rows="3"
              placeholder="e.g. Spoke with customer, verified payment details. Quotation accepted."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="activeModal = null" class="btn btn-secondary">Cancel</button>
          <button @click="submitComplete" class="btn btn-primary" :disabled="submittingModal">
            <span v-if="submittingModal" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="bi bi-floppy"></i>
            Save as Completed
          </button>
        </div>
      </div>
    </div>

    <!-- Reschedule Modal -->
    <div v-if="activeModal === 'reschedule'" class="modal-overlay" @click.self="activeModal = null">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-calendar-event text-primary-custom"></i>
            Reschedule Follow-up
          </h5>
          <button @click="activeModal = null" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">New Date &amp; Time *</label>
            <input
              v-model="rescheduleDate"
              type="datetime-local"
              :class="['form-control', { 'is-invalid': rescheduleDateError }]"
              @input="rescheduleDateError = ''"
              required
            />
            <div v-if="rescheduleDateError" class="invalid-feedback">{{ rescheduleDateError }}</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Rescheduling Remarks</label>
            <textarea
              v-model="actionNotes"
              class="form-control"
              rows="3"
              placeholder="Specify reasoning for changing timeline..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="activeModal = null" class="btn btn-secondary">Cancel</button>
          <button @click="submitReschedule" class="btn btn-primary" :disabled="submittingModal">
            <span v-if="submittingModal" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="bi bi-calendar-check"></i>
            Reschedule Task
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFollowUpsStore } from '@/stores/followups';
import { useIndianFormat } from '@/composables/useIndianFormat';
import { useWhatsApp } from '@/composables/useWhatsApp';
import { useLeadSource } from '@/composables/useLeadSource';
import { usePermissions } from '@/composables/usePermissions';
import { useToast } from '@/composables/useToast';
import { useSwal } from '@/composables/useSwal';

const route = useRoute();
const router = useRouter();
const followUpsStore = useFollowUpsStore();
const { formatDateTime, formatPhone } = useIndianFormat();
const { openWhatsApp } = useWhatsApp();
const { getFollowUpTypeIcon, getFollowUpTypeBadgeClass } = useLeadSource();
const { hasRole } = usePermissions();
const toast = useToast();
const { confirmDelete } = useSwal();

const currentTab = ref(route.query.tab || 'today');
const followUps = computed(() => followUpsStore.followUps || []);
const loading = computed(() => followUpsStore.loading);
const followUpColumns = [
  { key: 'customer', label: 'Customer / Lead', sortable: true, sortKey: 'lead.name', minWidth: '180px' },
  { key: 'type', label: 'Type', sortable: true, minWidth: '110px' },
  { key: 'scheduled_at', label: 'Scheduled', sortable: true, minWidth: '140px' },
  { key: 'status', label: 'Status', sortable: true, minWidth: '120px' },
  { key: 'notes', label: 'Notes', minWidth: '180px' },
  { key: 'assigned_user', label: 'Executive', sortable: true, sortKey: 'assigned_user.name', minWidth: '130px' },
  { key: 'actions', label: 'Actions', minWidth: '170px', align: 'end' }
];

const tabItems = [
  { label: 'Today', value: 'today', icon: 'bi bi-sun' },
  { label: 'Tomorrow', value: 'tomorrow', icon: 'bi bi-calendar-date' },
  { label: 'Upcoming', value: 'upcoming', icon: 'bi bi-calendar3' },
  { label: 'Overdue', value: 'overdue', icon: 'bi bi-exclamation-triangle-fill text-danger-custom' },
  { label: 'Completed', value: 'completed', icon: 'bi bi-check2-circle text-won' },
  { label: 'All Tasks', value: 'all', icon: 'bi bi-list-task' }
];

const activeTabName = computed(() => {
  const item = tabItems.find(t => t.value === currentTab.value);
  return item ? item.label : '';
});

const activeModal = ref(null);
const selectedItem = ref(null);
const actionNotes = ref('');
const rescheduleDate = ref('');
const rescheduleDateError = ref('');
const submittingModal = ref(false);

const loadFollowUps = async () => {
  try {
    await followUpsStore.fetchFollowUps({ tab: currentTab.value });
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to load follow-up schedule.');
  }
};

onMounted(() => {
  loadFollowUps();
});

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && newTab !== currentTab.value) {
      currentTab.value = newTab;
      loadFollowUps();
    }
  }
);

const switchTab = (tabValue) => {
  currentTab.value = tabValue;
  router.replace({ query: { ...route.query, tab: tabValue } });
  loadFollowUps();
};

const isOverdue = (item) => {
  if (!['pending', 'missed'].includes(item.status)) return false;
  return new Date(item.scheduled_at) < new Date();
};

const triggerCall = (phone) => {
  window.open(`tel:${phone}`);
};

const triggerWhatsApp = (lead) => {
  if (!lead) return;
  const targetNumber = lead.whatsapp_number || lead.phone;
  const msg = `Hello ${lead.name || 'there'},\n\nJust reaching out over WhatsApp to follow up.`;
  openWhatsApp(targetNumber, msg);
};

const openCompleteModal = (item) => {
  selectedItem.value = item;
  actionNotes.value = '';
  activeModal.value = 'complete';
};

const submitComplete = async () => {
  submittingModal.value = true;
  try {
    await followUpsStore.completeFollowUp(selectedItem.value.id, actionNotes.value);
    toast.success('Follow-up marked completed.');
    activeModal.value = null;
    loadFollowUps();
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || 'Failed to complete follow-up.');
  } finally {
    submittingModal.value = false;
  }
};

const openRescheduleModal = (item) => {
  selectedItem.value = item;
  rescheduleDate.value = '';
  rescheduleDateError.value = '';
  actionNotes.value = '';
  activeModal.value = 'reschedule';
};

const submitReschedule = async () => {
  if (!rescheduleDate.value) {
    rescheduleDateError.value = 'Please specify a new date and time.';
    toast.error('Please specify a new date.');
    return;
  }
  submittingModal.value = true;
  try {
    await followUpsStore.rescheduleFollowUp(
      selectedItem.value.id,
      rescheduleDate.value,
      actionNotes.value
    );
    toast.success('Follow-up rescheduled.');
    activeModal.value = null;
    loadFollowUps();
  } catch (err) {
    if (err.response?.data?.errors?.scheduled_at) {
      rescheduleDateError.value = err.response.data.errors.scheduled_at[0];
    }
    toast.error(err.response?.data?.message || err.message || 'Failed to reschedule.');
  } finally {
    submittingModal.value = false;
  }
};

const deleteConfirm = async (item) => {
  const confirmed = await confirmDelete('follow-up task');
  if (confirmed) {
    try {
      await followUpsStore.deleteFollowUp(item.id);
      toast.success('Follow-up deleted.');
      loadFollowUps();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete follow-up.');
    }
  }
};
</script>
