<template>
  <!-- Loading State -->
  <div v-if="loading" class="d-flex flex-column align-items-center py-5 gap-3">
    <div class="spinner-custom"></div>
    <p style="color:var(--text-secondary);font-size:0.875rem;">Loading lead details...</p>
  </div>

  <div v-else-if="lead" class="d-flex flex-column gap-4">
    <!-- Lead Header Bar -->
    <div class="card">
      <div class="card-body py-3">
        <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
          <div>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <h2 style="font-family:var(--font-display);font-size:1.6rem;font-weight:800;color:var(--text-primary);margin:0;">
                {{ lead.name }}
              </h2>
              <span :class="['badge', `badge-${lead.priority}`]">
                <i v-if="lead.priority === 'high'" class="bi bi-fire"></i>
                {{ lead.priority }}
              </span>
              <span v-if="lead.stage?.name === 'Won'" class="badge badge-won">
                <i class="bi bi-trophy-fill"></i> Closed Won
              </span>
              <span v-else-if="lead.stage?.name === 'Lost'" class="badge badge-lost">
                <i class="bi bi-x-circle-fill"></i> Closed Lost
              </span>
            </div>
            <p style="color:var(--text-secondary);font-size:0.875rem;margin:0.25rem 0 0;">
              <i class="bi bi-building me-1"></i>
              {{ lead.company_name || 'Individual Client' }} &bull;
              <i class="bi bi-geo-alt me-1"></i>
              {{ lead.city ? `${lead.city}, ${lead.state || 'India'}` : 'Location unassigned' }}
            </p>
          </div>

          <!-- Quick Action Bar -->
          <div class="d-flex flex-wrap gap-2">
            <button @click="triggerCall(lead.phone)" class="btn btn-secondary btn-sm" title="Call Lead">
              <i class="bi bi-telephone-fill text-success"></i> Call
            </button>
            <a v-if="lead.email" :href="`mailto:${lead.email}`" class="btn btn-secondary btn-sm" title="Send Email">
              <i class="bi bi-envelope-fill text-primary-custom"></i> Email
            </a>
            <button @click="handleWhatsAppAction" class="btn btn-whatsapp btn-sm" title="WhatsApp Message">
              <i class="bi bi-whatsapp"></i> WhatsApp
            </button>
            <button @click="openActivityModal" class="btn btn-secondary btn-sm" title="Log Activity">
              <i class="bi bi-plus-circle text-info"></i> Log Activity
            </button>
            <button @click="showScheduleModal = true" class="btn btn-secondary btn-sm" title="Schedule Follow-up">
              <i class="bi bi-calendar-plus text-warning"></i> Follow-up
            </button>
            <button
              v-if="lead.stage?.name !== 'Won' && lead.stage?.name !== 'Lost'"
              @click="markWon"
              class="btn btn-won btn-sm"
              title="Mark Won"
            >
              <i class="bi bi-trophy-fill"></i> Mark Won
            </button>
            <button
              v-if="lead.stage?.name !== 'Won' && lead.stage?.name !== 'Lost'"
              @click="openLostModal"
              class="btn btn-lost btn-sm"
              title="Mark Lost"
            >
              <i class="bi bi-x-circle-fill"></i> Mark Lost
            </button>
            <router-link :to="`/leads/${lead.id}/edit`" class="btn btn-secondary btn-sm" title="Edit">
              <i class="bi bi-pencil"></i>
            </router-link>
            <button @click="confirmDeleteAction" class="btn btn-danger btn-sm" title="Delete">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="row g-4">
      <!-- LEFT COLUMN: Lead Information & Requirements -->
      <div class="col-12 col-lg-7">
        <!-- Next Action Card (Highly visible) -->
        <div class="card mb-4" style="border-left:5px solid var(--primary);background:#f8faff;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span style="font-size:0.8125rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.5px;">
                <i class="bi bi-bell-fill me-1"></i> Next Follow-up Action
              </span>
              <span v-if="lead.next_follow_up_date" class="badge badge-low">
                Assigned: {{ lead.assigned_user?.name || 'Unassigned' }}
              </span>
            </div>

            <div v-if="lead.next_follow_up_date">
              <div class="fw-800 text-dark" style="font-size:1.15rem;">
                <i class="bi bi-calendar-event text-primary-custom me-1"></i>
                Due: {{ formatDate(lead.next_follow_up_date) }}
                <span style="font-weight:500;color:var(--text-secondary);font-size:0.95rem;"> at </span>
                {{ formatTime(lead.next_follow_up_time) || '10:00 AM' }}
              </div>
              <div class="d-flex gap-2 mt-3">
                <button @click="triggerCall(lead.phone)" class="btn btn-secondary btn-sm">
                  <i class="bi bi-telephone-fill"></i> Call Now
                </button>
                <button @click="handleWhatsAppAction" class="btn btn-whatsapp btn-sm">
                  <i class="bi bi-whatsapp"></i> WhatsApp
                </button>
                <button @click="showScheduleModal = true" class="btn btn-secondary btn-sm">
                  <i class="bi bi-clock-history"></i> Reschedule
                </button>
              </div>
            </div>

            <div v-else>
              <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:0.75rem;">
                No upcoming follow-up scheduled.
              </p>
              <button @click="showScheduleModal = true" class="btn btn-primary btn-sm">
                <i class="bi bi-calendar-plus"></i> Schedule Follow-up
              </button>
            </div>
          </div>
        </div>

        <!-- Lead Key Profile -->
        <div class="card mb-4">
          <div class="card-header">
            <i class="bi bi-person-lines-fill"></i>
            Lead Details &amp; Deal Terms
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-6 col-md-4">
                <span class="info-label">Expected Deal Value</span>
                <span style="font-size:1.25rem;font-weight:800;color:var(--primary);">
                  {{ formatCurrency(lead.expected_value) }}
                </span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Sales Stage</span>
                <span class="badge badge-new">{{ lead.stage?.name || 'New' }}</span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Lead Status</span>
                <span class="info-value fw-600">{{ lead.status?.name || 'New' }}</span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Marketing Source</span>
                <span :class="['badge', getSourceBadgeClass(lead.source?.name)]">
                  <i :class="getSourceIcon(lead.source?.name)"></i>
                  {{ lead.source?.name || 'Direct' }}
                </span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Assigned Executive</span>
                <span class="fw-600 text-dark d-inline-flex align-items-center gap-1">
                  <i class="bi bi-person text-primary-custom"></i>
                  {{ lead.assigned_user?.name || 'Unassigned' }}
                </span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Phone Number</span>
                <span class="info-value fw-600">{{ formatPhone(lead.phone) }}</span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Email Address</span>
                <span class="info-value">{{ lead.email || '—' }}</span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Last Contacted</span>
                <span class="info-value">{{ lead.last_contacted_at ? formatDateTime(lead.last_contacted_at) : 'Not contacted yet' }}</span>
              </div>
              <div v-if="lead.lost_reason" class="col-12">
                <span class="info-label text-danger">Lost Reason</span>
                <div class="p-2 rounded bg-danger-subtle text-danger fw-600" style="font-size:0.875rem;">
                  {{ lead.lost_reason }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Requirements -->
        <div class="card mb-4">
          <div class="card-header">
            <i class="bi bi-card-text"></i>
            Client Requirements
          </div>
          <div class="card-body">
            <p style="font-size:0.9375rem;color:var(--text-primary);white-space:pre-line;margin:0;line-height:1.7;">
              {{ lead.requirement || 'No detailed requirements specified.' }}
            </p>
          </div>
        </div>

        <!-- Add Note -->
        <div class="card">
          <div class="card-header">
            <i class="bi bi-pencil-square"></i>
            Add Quick Note
          </div>
          <div class="card-body">
            <textarea
              v-model="newNote"
              class="form-control mb-3"
              rows="3"
              placeholder="Enter internal staff remarks or observations..."
            ></textarea>
            <button
              @click="submitNote"
              class="btn btn-primary btn-sm"
              :disabled="!newNote.trim()"
            >
              <i class="bi bi-floppy"></i> Save Note
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Activity Log Timeline -->
      <div class="col-12 col-lg-5">
        <div class="card" style="max-height:680px;overflow-y:auto;">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
              <i class="bi bi-clock-history"></i>
              Activity Timeline ({{ timeline.length }})
            </div>
            <button @click="openActivityModal" class="btn btn-secondary btn-sm" style="font-size:0.75rem;padding:2px 8px;">
              + Log Activity
            </button>
          </div>
          <div class="card-body">
            <div v-if="timeline.length" class="timeline">
              <div v-for="act in timeline" :key="act.id" class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <div class="timeline-time">
                    <i class="bi bi-clock"></i>
                    {{ formatDateTime(act.created_at) }}
                  </div>
                  <div class="timeline-title fw-700">{{ act.type }}</div>
                  <p class="timeline-desc mb-1">{{ act.description }}</p>
                  <div v-if="act.user" style="font-size:0.7rem;color:var(--text-muted);">
                    <i class="bi bi-person me-1"></i> Logged by: {{ act.user.name }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4" style="color:var(--text-muted);font-size:0.875rem;">
              <i class="bi bi-journal-x d-block mb-1" style="font-size:1.5rem;opacity:0.4;"></i>
              No activities logged yet.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Log Activity Modal -->
    <div v-if="showActivityModal" class="modal-overlay" @click.self="showActivityModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-plus-circle text-primary-custom"></i> Log Activity</h5>
          <button @click="showActivityModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Activity Type *</label>
            <select v-model="activityForm.type" class="form-select">
              <option value="Phone Call">Phone Call</option>
              <option value="WhatsApp Message">WhatsApp Message</option>
              <option value="Email Sent">Email Sent</option>
              <option value="Meeting / Demo">In-Person Meeting / Demo</option>
              <option value="Note Added">General Note</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Description *</label>
            <textarea
              v-model="activityForm.description"
              class="form-control"
              rows="3"
              placeholder="Summary of interaction..."
              required
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showActivityModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitActivity" class="btn btn-primary" :disabled="!activityForm.description.trim()">
            Save Activity Log
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
            Log WhatsApp Message Activity &bull; {{ lead?.name }}
          </h5>
          <button @click="showWhatsAppModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:1rem;">
            <i class="bi bi-info-circle me-1"></i>
            WhatsApp web/app was opened. Record your notes below to save the interaction in the lead timeline.
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

    <!-- Mark Lost Modal -->
    <div v-if="showLostModal" class="modal-overlay" @click.self="showLostModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-x-circle-fill text-danger"></i>
            Mark Lead as Lost
          </h5>
          <button @click="showLostModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Lost Reason *</label>
            <select v-model="lostReasonCategory" class="form-select mb-2" required>
              <option value="Too Expensive">Too Expensive / High Price</option>
              <option value="Competitor">Chose Competitor</option>
              <option value="No Response">Customer Stopped Responding</option>
              <option value="Timing">Project Postponed / Bad Timing</option>
              <option value="Product Not Suitable">Product Not Suitable</option>
              <option value="Budget Issue">Budget Issue</option>
              <option value="Other">Other Reason</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Additional Remarks</label>
            <textarea
              v-model="lostReasonNotes"
              class="form-control"
              rows="2"
              placeholder="Further details..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showLostModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitLost" class="btn btn-danger" :disabled="submittingLost">
            <span v-if="submittingLost" class="spinner-border spinner-border-sm me-1"></span>
            Confirm Lost
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Follow-up Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click.self="showScheduleModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-calendar-plus text-primary-custom"></i>
            Schedule Follow-up Action
          </h5>
          <button @click="showScheduleModal = false" class="modal-close"><i class="bi bi-x"></i></button>
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
          <button @click="showScheduleModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitFollowUp" class="btn btn-primary" :disabled="submittingFollowUp">
            <span v-if="submittingFollowUp" class="spinner-border spinner-border-sm me-1"></span>
            Schedule Task
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLeadsStore } from '@/stores/leads';
import { useFollowUpsStore } from '@/stores/followups';
import { useIndianFormat } from '@/composables/useIndianFormat';
import { useWhatsApp } from '@/composables/useWhatsApp';
import { useLeadSource } from '@/composables/useLeadSource';
import { useToast } from '@/composables/useToast';
import { useSwal } from '@/composables/useSwal';

const route = useRoute();
const router = useRouter();
const leadsStore = useLeadsStore();
const followUpsStore = useFollowUpsStore();
const { formatCurrency, formatDate, formatTime, formatDateTime, formatPhone } = useIndianFormat();
const { openWhatsApp } = useWhatsApp();
const { getSourceIcon, getSourceBadgeClass } = useLeadSource();
const toast = useToast();
const { confirmDelete } = useSwal();

const loading = ref(true);
const lead = computed(() => leadsStore.currentLead);
const timeline = computed(() => leadsStore.timeline);

const newNote = ref('');
const showLostModal = ref(false);
const lostReasonCategory = ref('Too Expensive');
const lostReasonNotes = ref('');
const submittingLost = ref(false);

const showActivityModal = ref(false);
const activityForm = reactive({ type: 'Phone Call', description: '' });

const showWhatsAppModal = ref(false);
const whatsAppNote = ref('');

const showScheduleModal = ref(false);
const submittingFollowUp = ref(false);
const followUpForm = reactive({
  type: 'call',
  scheduled_at: '',
  notes: ''
});

const loadLeadDetails = async () => {
  try {
    await leadsStore.fetchLead(route.params.id);
    await leadsStore.fetchTimeline(route.params.id);
    loading.value = false;
  } catch (err) {
    toast.error('Failed to load lead details.');
  }
};

onMounted(() => {
  loadLeadDetails();
});

const triggerCall = (phone) => {
  if (phone) window.open(`tel:${phone}`);
};

const handleWhatsAppAction = () => {
  if (lead.value?.phone) {
    openWhatsApp(lead.value.phone, `Hi ${lead.value.name}, connecting from Convera.`);
  }
  whatsAppNote.value = '';
  showWhatsAppModal.value = true;
};

const saveWhatsAppActivity = async () => {
  if (!whatsAppNote.value.trim()) return;
  try {
    await leadsStore.logActivity(lead.value.id, {
      type: 'WhatsApp Message',
      description: whatsAppNote.value.trim(),
    });
    toast.success('WhatsApp activity logged in timeline.');
    showWhatsAppModal.value = false;
    whatsAppNote.value = '';
  } catch (err) {
    toast.error('Failed to log WhatsApp activity.');
  }
};

const openActivityModal = () => {
  activityForm.type = 'Phone Call';
  activityForm.description = '';
  showActivityModal.value = true;
};

const submitActivity = async () => {
  if (!activityForm.description.trim()) return;
  try {
    await leadsStore.logActivity(lead.value.id, {
      type: activityForm.type,
      description: activityForm.description.trim(),
    });
    toast.success('Activity logged.');
    showActivityModal.value = false;
  } catch (err) {
    toast.error('Failed to log activity.');
  }
};

const markWon = async () => {
  try {
    await leadsStore.markWon(lead.value.id);
    toast.success('Lead marked as closed WON!');
    loadLeadDetails();
  } catch (err) {
    toast.error('Failed to update stage to Won.');
  }
};

const openLostModal = () => {
  lostReasonCategory.value = 'Too Expensive';
  lostReasonNotes.value = '';
  showLostModal.value = true;
};

const submitLost = async () => {
  const fullReason = lostReasonNotes.value.trim()
    ? `${lostReasonCategory.value} — ${lostReasonNotes.value.trim()}`
    : lostReasonCategory.value;

  submittingLost.value = true;
  try {
    await leadsStore.markLost(lead.value.id, fullReason);
    toast.success('Lead marked as lost.');
    showLostModal.value = false;
    loadLeadDetails();
  } catch (err) {
    toast.error('Failed to mark lead as lost.');
  } finally {
    submittingLost.value = false;
  }
};

const submitNote = async () => {
  if (!newNote.value.trim()) return;
  try {
    await leadsStore.addNote(lead.value.id, newNote.value.trim());
    toast.success('Note added.');
    newNote.value = '';
  } catch (err) {
    toast.error('Failed to save note.');
  }
};

const submitFollowUp = async () => {
  if (!followUpForm.scheduled_at) {
    toast.error('Please select date and time.');
    return;
  }
  submittingFollowUp.value = true;
  try {
    await followUpsStore.createFollowUp({
      lead_id: lead.value.id,
      assigned_to: lead.value.assigned_to || undefined,
      ...followUpForm
    });
    toast.success('Follow-up scheduled.');
    showScheduleModal.value = false;
    loadLeadDetails();
  } catch (err) {
    toast.error('Failed to create follow-up task.');
  } finally {
    submittingFollowUp.value = false;
  }
};

const confirmDeleteAction = async () => {
  const confirmed = await confirmDelete(`lead "${lead.value.name}"`);
  if (confirmed) {
    try {
      await leadsStore.deleteLead(lead.value.id);
      toast.success('Lead deleted.');
      router.push('/leads');
    } catch (err) {
      toast.error('Failed to delete lead.');
    }
  }
};
</script>
