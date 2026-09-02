<template>
  <!-- Loading State -->
  <div v-if="loading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
    <div class="spinner-custom"></div>
    <p style="color:var(--text-secondary);font-size:0.875rem;">Loading dashboard statistics...</p>
  </div>

  <div v-else class="d-flex flex-column gap-4">
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <span class="stat-label">Total Leads</span>
            <div class="stat-value mt-1">{{ stats.total_leads || 0 }}</div>
          </div>
          <div class="stat-icon-well blue">
            <i class="bi bi-people-fill"></i>
          </div>
        </div>
        <span class="stat-footer">
          <i class="bi bi-journal-text text-primary-custom"></i>
          Registered in system
        </span>
      </div>

      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <span class="stat-label">New Leads</span>
            <div class="stat-value mt-1">{{ stats.new_leads || 0 }}</div>
          </div>
          <div class="stat-icon-well indigo">
            <i class="bi bi-sparkles"></i>
          </div>
        </div>
        <span class="stat-footer">
          <i class="bi bi-clock-history text-primary-custom"></i>
          Awaiting contact
        </span>
      </div>

      <div
        class="stat-card"
        :style="stats.overdue_follow_ups > 0 ? 'border-color: #fca5a5; background: #fffbfb;' : ''"
      >
        <div class="stat-card-header">
          <div>
            <span class="stat-label" :style="stats.overdue_follow_ups > 0 ? 'color:var(--danger)' : ''">
              Overdue Follow-ups
            </span>
            <div class="stat-value mt-1" :style="stats.overdue_follow_ups > 0 ? 'color:var(--danger)' : ''">
              {{ stats.overdue_follow_ups || 0 }}
            </div>
          </div>
          <div class="stat-icon-well red">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
        </div>
        <span class="stat-footer" :style="stats.overdue_follow_ups > 0 ? 'color:var(--danger)' : ''">
          <i class="bi bi-bell-fill"></i>
          Action required
        </span>
      </div>

      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <span class="stat-label">Expected Value</span>
            <div class="stat-value mt-1" style="color:var(--primary);font-size:1.5rem;">
              {{ formatCurrency(stats.expected_revenue) }}
            </div>
          </div>
          <div class="stat-icon-well teal">
            <i class="bi bi-graph-up-arrow"></i>
          </div>
        </div>
        <span class="stat-footer">
          <i class="bi bi-cash-stack text-secondary-custom"></i>
          Weighted pipeline forecast
        </span>
      </div>

      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <span class="stat-label">Won Value</span>
            <div class="stat-value mt-1" style="color:var(--won);font-size:1.5rem;">
              {{ formatCurrency(stats.won_revenue) }}
            </div>
          </div>
          <div class="stat-icon-well green">
            <i class="bi bi-trophy-fill"></i>
          </div>
        </div>
        <span class="stat-footer">
          <i class="bi bi-check-all text-won"></i>
          Closed deals revenue
        </span>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row g-3">
      <!-- Leads by Stage -->
      <div class="col-12 col-lg-6">
        <div class="card h-100">
          <div class="card-body">
            <h3 class="card-title">
              <i class="bi bi-bar-chart-fill"></i>
              Leads by Sales Stage
            </h3>
            <div v-if="charts.leads_by_stage?.length" class="d-flex flex-column gap-3 mt-3">
              <div v-for="stage in charts.leads_by_stage" :key="stage.label">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span style="font-size:0.875rem;font-weight:600;color:var(--text-primary);">{{ stage.label }}</span>
                  <span class="badge badge-low">{{ stage.value }} leads</span>
                </div>
                <div class="progress">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    :style="`width:${Math.min(100,(stage.value/(stats.total_leads||1))*100)}%;background:linear-gradient(90deg,var(--primary),#7c3aed);`"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state py-4">
              <div class="empty-state-icon"><i class="bi bi-bar-chart"></i></div>
              <span class="empty-state-title">No stage data</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Leads by Source -->
      <div class="col-12 col-lg-6">
        <div class="card h-100">
          <div class="card-body">
            <h3 class="card-title">
              <i class="bi bi-funnel-fill"></i>
              Leads by Marketing Source
            </h3>
            <div v-if="charts.leads_by_source?.length" class="d-flex flex-column gap-3 mt-3">
              <div v-for="source in charts.leads_by_source" :key="source.label">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span style="font-size:0.875rem;font-weight:600;color:var(--text-primary);">{{ source.label }}</span>
                  <span class="badge badge-low">{{ source.value }} leads</span>
                </div>
                <div class="progress">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    :style="`width:${Math.min(100,(source.value/(stats.total_leads||1))*100)}%;background:linear-gradient(90deg,var(--whatsapp),#059669);`"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state py-4">
              <div class="empty-state-icon"><i class="bi bi-funnel"></i></div>
              <span class="empty-state-title">No source data</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's Follow-ups Table -->
    <div class="card">
      <div class="card-body">
        <h3 class="card-title">
          <i class="bi bi-calendar-check-fill"></i>
          Today's Follow-up Schedule
        </h3>

        <div v-if="todayFollowUpsList.length" class="table-responsive mt-3">
          <table class="table table-hover table-mobile-cards mb-0">
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Contact Info</th>
                <th>Type</th>
                <th>Time</th>
                <th>Executive</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in todayFollowUpsList" :key="item.id">
                <td>
                  <span class="td-label">Lead Name</span>
                  <div class="fw-600 text-dark">{{ item.lead?.name || 'N/A' }}</div>
                  <div style="font-size:0.75rem;color:var(--text-secondary);">{{ item.lead?.company_name || '—' }}</div>
                </td>
                <td>
                  <span class="td-label">Contact</span>
                  <div style="font-size:0.875rem;font-weight:500;">{{ formatPhone(item.lead?.phone) }}</div>
                  <div style="font-size:0.75rem;color:var(--text-secondary);">{{ item.lead?.email || '' }}</div>
                </td>
                <td>
                  <span class="td-label">Type</span>
                  <span :class="['badge', `badge-${item.type === 'whatsapp' ? 'completed' : 'pending'}`]">
                    <i :class="item.type === 'whatsapp' ? 'bi bi-whatsapp' : 'bi bi-telephone-fill'"></i>
                    {{ item.type }}
                  </span>
                </td>
                <td>
                  <span class="td-label">Time</span>
                  <span class="fw-600"><i class="bi bi-clock me-1 text-muted"></i>{{ formatTime(item.scheduled_at) }}</span>
                </td>
                <td>
                  <span class="td-label">Executive</span>
                  <span class="d-inline-flex align-items-center gap-1">
                    <i class="bi bi-person text-secondary"></i>
                    {{ item.assigned_user?.name || 'Unassigned' }}
                  </span>
                </td>
                <td>
                  <span class="td-label">Actions</span>
                  <div class="d-flex flex-wrap gap-1">
                    <button @click="triggerCall(item.lead?.phone)" class="btn btn-secondary btn-sm" title="Call">
                      <i class="bi bi-telephone-fill"></i>
                    </button>
                    <button @click="triggerWhatsApp(item.lead)" class="btn btn-whatsapp btn-sm" title="WhatsApp">
                      <i class="bi bi-whatsapp"></i>
                    </button>
                    <button @click="openRescheduleModal(item)" class="btn btn-secondary btn-sm">
                      <i class="bi bi-calendar-event"></i> Reschedule
                    </button>
                    <button @click="markComplete(item)" class="btn btn-primary btn-sm">
                      <i class="bi bi-check-lg"></i> Complete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <div class="empty-state-icon"><i class="bi bi-calendar-check"></i></div>
          <span class="empty-state-title">No follow-ups scheduled today!</span>
          <p class="empty-state-desc">You're all caught up. Visit Leads to schedule new follow-up actions.</p>
        </div>
      </div>
    </div>

    <!-- Complete Modal -->
    <div v-if="activeModal === 'complete'" class="modal-overlay" @click.self="activeModal = null">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-check-circle-fill text-won"></i>
            Mark Follow-up Completed
          </h5>
          <button @click="activeModal = null" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Execution Notes / Remarks</label>
            <textarea
              v-model="actionNotes"
              class="form-control"
              rows="3"
              placeholder="e.g. Client requested a callback next week after reviewing quotes."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="activeModal = null" class="btn btn-secondary">Cancel</button>
          <button @click="submitComplete" class="btn btn-primary">
            <i class="bi bi-check-lg"></i> Save as Completed
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
            <label class="form-label">New Follow-up Date &amp; Time</label>
            <input v-model="rescheduleDate" type="datetime-local" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Rescheduling Notes / Reason</label>
            <textarea v-model="actionNotes" class="form-control" rows="3" placeholder="Reason for rescheduling..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="activeModal = null" class="btn btn-secondary">Cancel</button>
          <button @click="submitReschedule" class="btn btn-primary">
            <i class="bi bi-calendar-check"></i> Reschedule Task
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboard';
import { useFollowUpsStore } from '@/stores/followups';
import { useIndianFormat } from '@/composables/useIndianFormat';
import { useWhatsApp } from '@/composables/useWhatsApp';
import { useToast } from '@/composables/useToast';

const dashboardStore = useDashboardStore();
const followUpsStore = useFollowUpsStore();
const { formatCurrency, formatPhone } = useIndianFormat();
const { openWhatsApp } = useWhatsApp();
const toast = useToast();

const loading = computed(() => dashboardStore.loading);
const stats = computed(() => dashboardStore.stats);
const charts = computed(() => dashboardStore.charts);
const todayFollowUpsList = computed(() => dashboardStore.todayFollowUpsList);

const activeModal = ref(null);
const selectedFollowUp = ref(null);
const actionNotes = ref('');
const rescheduleDate = ref('');

const loadStats = async () => {
  try {
    await dashboardStore.fetchDashboardStats();
  } catch (err) {
    toast.error('Could not load dashboard statistics.');
  }
};

onMounted(() => {
  loadStats();
});

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return '-';
  const date = new Date(dateTimeString);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

const triggerCall = (phone) => {
  window.open(`tel:${phone}`);
};

const triggerWhatsApp = (lead) => {
  const message = `Hello ${lead.name},\n\nJust following up on your request. Regards,\nConvera`;
  openWhatsApp(lead.phone, message);
};

const markComplete = (followUp) => {
  selectedFollowUp.value = followUp;
  actionNotes.value = '';
  activeModal.value = 'complete';
};

const submitComplete = async () => {
  try {
    await followUpsStore.completeFollowUp(selectedFollowUp.value.id, actionNotes.value);
    toast.success('Follow-up marked completed.');
    activeModal.value = null;
    loadStats();
  } catch (err) {
    toast.error('Failed to complete follow-up.');
  }
};

const openRescheduleModal = (followUp) => {
  selectedFollowUp.value = followUp;
  actionNotes.value = '';
  rescheduleDate.value = '';
  activeModal.value = 'reschedule';
};

const submitReschedule = async () => {
  if (!rescheduleDate.value) {
    toast.error('Please specify a new date and time.');
    return;
  }
  try {
    await followUpsStore.rescheduleFollowUp(
      selectedFollowUp.value.id,
      rescheduleDate.value,
      actionNotes.value
    );
    toast.success('Follow-up rescheduled.');
    activeModal.value = null;
    loadStats();
  } catch (err) {
    toast.error('Failed to reschedule.');
  }
};
</script>
