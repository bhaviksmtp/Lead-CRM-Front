<template>
  <!-- Skeleton Loading State -->
  <div v-if="loading" class="d-flex flex-column gap-4">
    <div class="stats-grid">
      <div v-for="i in 4" :key="i" class="stat-card p-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div style="width: 60%;">
            <div class="skeleton mb-2" style="height: 12px; width: 80px;"></div>
            <div class="skeleton" style="height: 28px; width: 60px; border-radius: 6px;"></div>
          </div>
          <div class="skeleton" style="width: 44px; height: 44px; border-radius: 10px;"></div>
        </div>
        <div class="skeleton" style="height: 12px; width: 110px;"></div>
      </div>
    </div>
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card p-3">
          <div class="skeleton mb-3" style="height: 20px; width: 140px;"></div>
          <div class="skeleton" style="height: 200px; width: 100%; border-radius: 8px;"></div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card p-3">
          <div class="skeleton mb-3" style="height: 20px; width: 120px;"></div>
          <div class="skeleton" style="height: 200px; width: 100%; border-radius: 8px;"></div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="d-flex flex-column gap-4">
    <!-- Dashboard Top Bar: Date Range Filter -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-grid-1x2-fill"></i> Dashboard &amp; Sales Analytics
        </h2>
        <p class="page-header-sub">Real-time performance metrics and sales conversion pipeline</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="text-secondary small fw-600"><i class="bi bi-calendar3 me-1"></i>Period:</span>
        <div class="btn-group btn-group-sm" role="group">
          <button
            v-for="period in periodOptions"
            :key="period.value"
            type="button"
            class="btn"
            :class="selectedPeriod === period.value ? 'btn-primary' : 'btn-secondary'"
            @click="setPeriod(period.value)"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
    </div>

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
      <router-link to="/follow-ups?tab=overdue" class="btn btn-danger btn-sm" style="font-size:0.8125rem;">
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

      <router-link
        to="/follow-ups?tab=overdue"
        class="stat-card text-decoration-none"
        :style="stats.overdue_follow_ups > 0 ? 'border-color: #fca5a5; background: #fffbfb; cursor: pointer;' : 'cursor: pointer;'"
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
      </router-link>

      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <span class="stat-label">Converted Deals</span>
            <div class="stat-value mt-1" style="color:var(--won);">{{ stats.converted_leads ?? stats.won_leads ?? 0 }}</div>
          </div>
          <div class="stat-icon-well green"><i class="bi bi-award-fill"></i></div>
        </div>
        <span class="stat-footer"><i class="bi bi-check-all text-won"></i> Successfully converted</span>
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

    <!-- Employee & Team Performance Section -->
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h3 class="card-title mb-1">
              <i class="bi bi-award-fill text-warning"></i>
              Employee &amp; Team Performance
            </h3>
            <span class="text-secondary small">
              Sales conversion benchmarks, revenue won, and follow-up discipline
            </span>
          </div>
          <router-link to="/performance" class="btn btn-secondary btn-sm">
            <i class="bi bi-people-fill text-primary-custom me-1"></i> View All Employees
          </router-link>
        </div>

        <DataTable
          :columns="teamColumns"
          :data="teamPerformance"
          :loading="loading"
          :pagination="false"
          empty-title="No team performance data available"
        >
          <template #rank="{ index }">
            <span v-if="index === 0" class="badge-rank gold" title="1st Place">🥇</span>
            <span v-else-if="index === 1" class="badge-rank silver" title="2nd Place">🥈</span>
            <span v-else-if="index === 2" class="badge-rank bronze" title="3rd Place">🥉</span>
            <span v-else class="text-muted small">#{{ index + 1 }}</span>
          </template>

          <template #employee="{ item }">
            <div class="d-flex align-items-center gap-2">
              <div class="avatar-circle-sm" :style="getAvatarStyle(item.name)">
                {{ getInitials(item.name) }}
              </div>
              <div>
                <div class="fw-700 text-dark" style="font-size:0.875rem;">{{ item.name }}</div>
                <div class="text-secondary small" style="font-size:0.75rem;">{{ item.email }}</div>
              </div>
            </div>
          </template>

          <template #role="{ item }">
            <span :class="['badge', getRoleBadgeClass(item.role)]" style="font-size:0.75rem;">
              {{ item.role }}
            </span>
          </template>

          <template #leads_count="{ item }">
            <span class="fw-700">{{ item.leads_count }}</span>
            <div class="text-secondary small" style="font-size:0.7rem;">
              {{ item.open_count ?? (item.leads_count - item.won_count - item.lost_count) }} open
            </div>
          </template>

          <template #won_lost="{ item }">
            <div class="d-inline-flex align-items-center gap-1">
              <span class="badge badge-won px-2" title="Converted Leads">{{ item.won_count }} Converted</span>
              <span class="badge badge-lost px-2" title="Dropped Leads">{{ item.lost_count }} Dropped</span>
            </div>
          </template>

          <template #conversion_rate="{ item }">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="fw-700 small" :class="item.conversion_rate >= 20 ? 'text-success' : 'text-primary-custom'">
                {{ item.conversion_rate }}%
              </span>
              <span class="text-muted small" style="font-size:0.6875rem;">conversion rate</span>
            </div>
            <div class="progress" style="height: 5px;">
              <div
                class="progress-bar"
                role="progressbar"
                :style="`width:${Math.min(100, item.conversion_rate)}%;background:${item.conversion_rate >= 20 ? 'var(--won)' : 'var(--primary)'};`"
              ></div>
            </div>
          </template>

          <template #won_revenue="{ item }">
            <span class="fw-800 text-won" style="font-size:0.925rem;">
              {{ formatCurrency(item.won_revenue) }}
            </span>
          </template>

          <template #follow_ups="{ item }">
            <span class="badge badge-completed me-1" title="Completed Tasks">
              <i class="bi bi-check-circle-fill me-1"></i>{{ item.follow_ups_completed }}
            </span>
            <span v-if="item.follow_ups_missed > 0" class="badge badge-missed" title="Missed Tasks">
              <i class="bi bi-x-circle-fill me-1"></i>{{ item.follow_ups_missed }}
            </span>
          </template>

          <template #action="{ item }">
            <router-link :to="`/leads?assigned_to=${item.id}`" class="btn btn-secondary btn-sm py-0 px-2" style="font-size:0.75rem;">
              <i class="bi bi-eye"></i> Leads
            </router-link>
          </template>
        </DataTable>
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

        <DataTable
          :columns="todayFollowUpColumns"
          :data="todayFollowUpsList"
          :loading="loading"
          :pagination="false"
          empty-icon="bi-calendar-check"
          empty-title="No follow-ups scheduled for today"
          empty-description="You're all caught up for today. Visit Leads to schedule new actions."
        >
          <template #lead="{ item }">
            <router-link :to="`/leads/${item.lead_id}`" class="fw-600 text-dark text-decoration-none">
              {{ item.lead?.name || 'N/A' }}
            </router-link>
            <div style="font-size:0.75rem;color:var(--text-secondary);">{{ item.lead?.company_name || '—' }}</div>
          </template>

          <template #contact="{ item }">
            <div style="font-size:0.875rem;font-weight:500;">{{ formatPhone(item.lead?.phone) }}</div>
          </template>

          <template #type="{ item }">
            <span :class="['badge', getFollowUpTypeBadgeClass(item.type)]">
              <i :class="getFollowUpTypeIcon(item.type)"></i>
              {{ item.type }}
            </span>
          </template>

          <template #time="{ item }">
            <span class="fw-600"><i class="bi bi-clock me-1 text-muted"></i>{{ formatTime(item.scheduled_at) }}</span>
          </template>

          <template #executive="{ item }">
            <span class="d-inline-flex align-items-center gap-1">
              <i class="bi bi-person text-secondary"></i>
              {{ item.assigned_user?.name || item.lead?.assigned_user?.name || 'Unassigned' }}
            </span>
          </template>

          <template #actions="{ item }">
            <div class="d-flex flex-wrap gap-1">
              <button @click="triggerCall(item.lead?.phone)" class="btn btn-secondary btn-sm" title="Call">
                <i class="bi bi-telephone-fill"></i>
              </button>
              <button @click="handleWhatsAppAction(item.lead)" class="btn btn-whatsapp btn-sm" title="WhatsApp">
                <i class="bi bi-whatsapp"></i>
              </button>
              <button @click="openRescheduleModal(item)" class="btn btn-secondary btn-sm" title="Reschedule">
                <i class="bi bi-calendar-event"></i>
              </button>
              <button @click="markComplete(item)" class="btn btn-primary btn-sm" title="Complete">
                <i class="bi bi-check-lg"></i> Complete
              </button>
            </div>
          </template>
        </DataTable>
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
          <button @click="showWhatsAppModal = false" class="btn btn-secondary" :disabled="submittingWhatsApp">Close</button>
          <button @click="saveWhatsAppActivity" class="btn btn-whatsapp" :disabled="!whatsAppNote.trim() || submittingWhatsApp">
            <span v-if="submittingWhatsApp" class="spinner-border spinner-border-sm me-1" role="status"></span>
            <i v-else class="bi bi-floppy"></i>
            {{ submittingWhatsApp ? 'Saving...' : 'Save Activity Log' }}
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
const teamPerformance = ref([]);

const selectedPeriod = ref('all');
const periodOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'This Quarter', value: 'this_quarter' },
  { label: 'This Year', value: 'this_year' }
];

const setPeriod = (period) => {
  selectedPeriod.value = period;
  loadDashboard();
};

const teamColumns = [
  { key: 'rank', label: '#', align: 'center', width: '50px', minWidth: '40px' },
  { key: 'employee', label: 'Executive', sortable: true, sortKey: 'name', minWidth: '160px' },
  { key: 'role', label: 'Role', sortable: true, minWidth: '110px' },
  { key: 'leads_count', label: 'Assigned Leads', align: 'center', sortable: true, minWidth: '120px' },
  { key: 'won_lost', label: 'Converted / Dropped', align: 'center', minWidth: '160px' },
  { key: 'conversion_rate', label: 'Conversion Rate', sortable: true, minWidth: '130px' },
  { key: 'won_revenue', label: 'Revenue Converted', sortable: true, minWidth: '130px' },
  { key: 'follow_ups', label: 'Follow-up Tasks', minWidth: '130px' },
  { key: 'action', label: 'Action', align: 'center', minWidth: '90px' }
];

const todayFollowUpColumns = [
  { key: 'lead', label: 'Lead Name', sortable: true, sortKey: 'lead.name', minWidth: '160px' },
  { key: 'contact', label: 'Contact Info', minWidth: '140px' },
  { key: 'type', label: 'Type', sortable: true, minWidth: '110px' },
  { key: 'time', label: 'Time', sortable: true, sortKey: 'scheduled_at', minWidth: '100px' },
  { key: 'executive', label: 'Executive', sortable: true, sortKey: 'assigned_user.name', minWidth: '130px' },
  { key: 'actions', label: 'Actions', minWidth: '140px', align: 'end' }
];

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
    const params = selectedPeriod.value !== 'all' ? { date_range: selectedPeriod.value } : {};
    const res = await dashboardApi.getStats(params);
    const d = res.data.data;
    stats.value = d.stats || {};
    charts.value = d.charts || {};
    todayFollowUpsList.value = d.today_follow_ups_list || [];
    const rawTeam = d.team_performance || [];
    teamPerformance.value = rawTeam.filter(u => {
      const r = (u.role || '').toLowerCase();
      return !r.includes('admin');
    });
  } catch (err) {
    toast.error('Failed to load dashboard data.');
  } finally {
    loading.value = false;
  }
};

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'Company Admin':
    case 'Super Admin':
      return 'badge-primary';
    case 'Manager':
      return 'badge-medium';
    default:
      return 'badge-low';
  }
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

const submittingWhatsApp = ref(false);

const saveWhatsAppActivity = async () => {
  if (!activeWhatsAppLead.value || !whatsAppNote.value.trim() || submittingWhatsApp.value) return;
  submittingWhatsApp.value = true;
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
  } finally {
    submittingWhatsApp.value = false;
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

<style scoped>
.avatar-circle-sm {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.badge-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
</style>
