<template>
  <!-- Loading State -->
  <div v-if="loading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
    <div class="spinner-custom"></div>
    <p style="color:var(--text-secondary);font-size:0.875rem;">Loading sales overview...</p>
  </div>

  <div v-else class="d-flex flex-column gap-4">
    <!-- Attention Banner (If overdue actions exist) -->
    <div
      v-if="stats.overdue_follow_ups > 0"
      class="p-3 rounded d-flex justify-content-between align-items-center flex-wrap gap-2"
      style="background:#fef2f2;border:1px solid #fecaca;border-left:5px solid var(--danger);"
    >
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-octagon-fill text-danger fs-5"></i>
        <div>
          <strong class="text-danger">Action Required:</strong>
          <span style="color:#7f1d1d;font-size:0.875rem;margin-left:4px;">
            You have {{ stats.overdue_follow_ups }} overdue follow-up task(s).
          </span>
        </div>
      </div>
      <router-link to="/follow-ups" class="btn btn-danger btn-sm" style="font-size:0.8125rem;">
        View Follow-ups <i class="bi bi-arrow-right"></i>
      </router-link>
    </div>

    <!-- Core Sales KPI Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <span class="stat-label">Total Leads</span>
            <div class="stat-value mt-1">{{ stats.total_leads || 0 }}</div>
          </div>
          <div class="stat-icon-well blue"><i class="bi bi-people-fill"></i></div>
        </div>
        <span class="stat-footer"><i class="bi bi-journal-text text-primary-custom"></i> All pipeline leads</span>
      </div>

      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <span class="stat-label">New Leads</span>
            <div class="stat-value mt-1">{{ stats.new_leads || 0 }}</div>
          </div>
          <div class="stat-icon-well indigo"><i class="bi bi-sparkles"></i></div>
        </div>
        <span class="stat-footer"><i class="bi bi-clock-history text-primary-custom"></i> Awaiting qualification</span>
      </div>

      <div
        class="stat-card"
        :style="stats.overdue_follow_ups > 0 ? 'border-color: #fca5a5; background: #fffbfb;' : ''"
      >
        <div class="stat-card-header">
          <div>
            <span class="stat-label" :style="stats.overdue_follow_ups > 0 ? 'color:var(--danger)' : ''">
              Overdue Actions
            </span>
            <div class="stat-value mt-1" :style="stats.overdue_follow_ups > 0 ? 'color:var(--danger)' : ''">
              {{ stats.overdue_follow_ups || 0 }}
            </div>
          </div>
          <div class="stat-icon-well red"><i class="bi bi-exclamation-triangle-fill"></i></div>
        </div>
        <span class="stat-footer" :style="stats.overdue_follow_ups > 0 ? 'color:var(--danger)' : ''">
          <i class="bi bi-bell-fill"></i> Requires follow-up
        </span>
      </div>

      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <span class="stat-label">Won Deals</span>
            <div class="stat-value mt-1" style="color:var(--won);">{{ stats.won_leads || 0 }}</div>
          </div>
          <div class="stat-icon-well green"><i class="bi bi-trophy-fill"></i></div>
        </div>
        <span class="stat-footer"><i class="bi bi-check-all text-won"></i> Converted deals</span>
      </div>

      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <span class="stat-label">Pipeline Value</span>
            <div class="stat-value mt-1" style="color:var(--primary);font-size:1.4rem;">
              {{ formatCurrency(stats.expected_revenue) }}
            </div>
          </div>
          <div class="stat-icon-well teal"><i class="bi bi-currency-rupee"></i></div>
        </div>
        <span class="stat-footer"><i class="bi bi-graph-up text-secondary-custom"></i> Active sales forecast</span>
      </div>
    </div>

    <!-- Charts Row: Stages & Sources -->
    <div class="row g-3">
      <!-- Leads by Stage -->
      <div class="col-12 col-lg-6">
        <div class="card h-100">
          <div class="card-body">
            <h3 class="card-title">
              <i class="bi bi-bar-chart-fill text-primary-custom"></i>
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
              <i class="bi bi-funnel-fill text-primary-custom"></i>
              Leads by Marketing Source
            </h3>
            <div v-if="charts.leads_by_source?.length" class="d-flex flex-column gap-3 mt-3">
              <div v-for="source in charts.leads_by_source" :key="source.label">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span style="font-size:0.875rem;font-weight:600;color:var(--text-primary);">
                    <i :class="getSourceIcon(source.label)" class="me-1 text-secondary"></i>
                    {{ source.label }}
                  </span>
                  <span class="badge badge-low">{{ source.value }} leads</span>
                </div>
                <div class="progress">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    :style="`width:${Math.min(100,(source.value/(stats.total_leads||1))*100)}%;background:linear-gradient(90deg,var(--primary),#059669);`"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state py-4">
              <span class="empty-state-title">No source data</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's Follow-up Schedule -->
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="card-title" style="margin:0;">
            <i class="bi bi-calendar-check-fill text-primary-custom"></i>
            Today's Follow-up Schedule
          </h3>
          <router-link to="/follow-ups" class="btn btn-secondary btn-sm">
            View All Schedule
          </router-link>
        </div>

        <div v-if="todayFollowUpsList.length" class="table-responsive">
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
                  <router-link :to="`/leads/${item.lead_id}`" class="fw-600 text-dark text-decoration-none">
                    {{ item.lead?.name || 'N/A' }}
                  </router-link>
                  <div style="font-size:0.75rem;color:var(--text-secondary);">{{ item.lead?.company_name || '—' }}</div>
                </td>
                <td>
                  <span class="td-label">Contact</span>
                  <div style="font-size:0.875rem;font-weight:500;">{{ formatPhone(item.lead?.phone) }}</div>
                </td>
                <td>
                  <span class="td-label">Type</span>
                  <span :class="['badge', getFollowUpTypeBadgeClass(item.type)]">
                    <i :class="getFollowUpTypeIcon(item.type)"></i>
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
                    {{ item.assigned_user?.name || item.lead?.assigned_user?.name || 'Unassigned' }}
                  </span>
                </td>
                <td>
                  <span class="td-label">Actions</span>
                  <div class="d-flex flex-wrap gap-1">
                    <button @click="triggerCall(item.lead?.phone)" class="btn btn-secondary btn-sm" title="Call">
                      <i class="bi bi-telephone-fill"></i>
                    </button>
                    <button @click="handleWhatsAppAction(item.lead)" class="btn btn-whatsapp btn-sm" title="WhatsApp">
                      <i class="bi bi-whatsapp"></i>
                    </button>
                    <button @click="openRescheduleModal(item)" class="btn btn-secondary btn-sm">
                      <i class="bi bi-calendar-event"></i>
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

        <div v-else class="empty-state py-4">
          <div class="empty-state-icon"><i class="bi bi-calendar-check"></i></div>
          <span class="empty-state-title">No follow-ups scheduled for today</span>
          <p class="empty-state-desc">You're all caught up for today. Visit Leads to schedule new actions.</p>
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
            <label class="form-label">Interaction Remarks</label>
            <textarea
              v-model="actionNotes"
              class="form-control"
              rows="3"
              placeholder="e.g. Discussed requirements with customer. Follow-up next week."
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
            <label class="form-label">New Follow-up Date &amp; Time *</label>
            <input v-model="rescheduleDate" type="datetime-local" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Rescheduling Notes</label>
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

    <!-- Log WhatsApp Activity Modal -->
    <div v-if="showWhatsAppModal" class="modal-overlay" @click.self="showWhatsAppModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-whatsapp text-whatsapp"></i>
            Log WhatsApp Message Activity &bull; {{ activeWhatsAppLead?.name }}
          </h5>
          <button @click="showWhatsAppModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:1rem;">
            <i class="bi bi-info-circle me-1"></i>
            WhatsApp web/app was opened. Record your interaction notes below to save them in the lead timeline.
          </p>
          <div class="mb-3">
            <label class="form-label">Activity Notes *</label>
            <textarea
              v-model="whatsAppNote"
              class="form-control"
              rows="3"
              placeholder="e.g. Sent catalogue and delivery details via WhatsApp."
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
import { ref, onMounted } from 'vue';
import { useIndianFormat } from '@/composables/useIndianFormat';
import { useWhatsApp } from '@/composables/useWhatsApp';
import { useLeadSource } from '@/composables/useLeadSource';
import { useToast } from '@/composables/useToast';
import dashboardApi from '@/api/dashboard';
import followUpsApi from '@/api/followups';
import leadsApi from '@/api/leads';

const { formatCurrency, formatPhone, formatTime } = useIndianFormat();
const { openWhatsApp } = useWhatsApp();
const { getSourceIcon, getFollowUpTypeIcon, getFollowUpTypeBadgeClass } = useLeadSource();
const toast = useToast();

const loading = ref(true);
const stats = ref({});
const charts = ref({});
const todayFollowUpsList = ref([]);

const activeModal = ref(null);
const currentFollowUp = ref(null);
const actionNotes = ref('');
const rescheduleDate = ref('');

const showWhatsAppModal = ref(false);
const activeWhatsAppLead = ref(null);
const whatsAppNote = ref('');

const loadDashboard = async () => {
  loading.value = true;
  try {
    const res = await dashboardApi.getStats();
    const d = res.data.data;
    stats.value = d.stats || {};
    charts.value = d.charts || {};
    todayFollowUpsList.value = d.today_follow_ups_list || [];
  } catch (err) {
    toast.error('Failed to load dashboard data.');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDashboard();
});

const triggerCall = (phone) => {
  if (phone) window.open(`tel:${phone}`);
};

const handleWhatsAppAction = (lead) => {
  if (!lead) return;
  activeWhatsAppLead.value = lead;
  whatsAppNote.value = '';
  if (lead.phone) {
    openWhatsApp(lead.phone, `Hi ${lead.name}, connecting from Convera.`);
  }
  showWhatsAppModal.value = true;
};

const saveWhatsAppActivity = async () => {
  if (!activeWhatsAppLead.value || !whatsAppNote.value.trim()) return;
  try {
    await leadsApi.logActivity(activeWhatsAppLead.value.id, {
      type: 'WhatsApp Message',
      description: whatsAppNote.value.trim(),
    });
    toast.success('WhatsApp activity logged in lead history.');
    showWhatsAppModal.value = false;
    whatsAppNote.value = '';
  } catch (err) {
    toast.error('Failed to log WhatsApp activity.');
  }
};

const markComplete = (item) => {
  currentFollowUp.value = item;
  actionNotes.value = '';
  activeModal.value = 'complete';
};

const openRescheduleModal = (item) => {
  currentFollowUp.value = item;
  actionNotes.value = '';
  rescheduleDate.value = '';
  activeModal.value = 'reschedule';
};

const submitComplete = async () => {
  if (!currentFollowUp.value) return;
  try {
    await followUpsApi.complete(currentFollowUp.value.id, { notes: actionNotes.value });
    toast.success('Follow-up marked as completed!');
    activeModal.value = null;
    loadDashboard();
  } catch (err) {
    toast.error('Failed to complete follow-up.');
  }
};

const submitReschedule = async () => {
  if (!currentFollowUp.value || !rescheduleDate.value) {
    toast.error('Please select a date and time.');
    return;
  }
  try {
    await followUpsApi.reschedule(currentFollowUp.value.id, {
      scheduled_at: rescheduleDate.value,
      notes: actionNotes.value
    });
    toast.success('Follow-up rescheduled.');
    activeModal.value = null;
    loadDashboard();
  } catch (err) {
    toast.error('Failed to reschedule follow-up.');
  }
};
</script>
