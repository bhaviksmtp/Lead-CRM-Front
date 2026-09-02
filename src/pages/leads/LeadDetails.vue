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
              <h2 style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--text-primary);margin:0;">
                {{ lead.name }}
              </h2>
              <span :class="['badge', `badge-${lead.priority}`]">
                <i v-if="lead.priority === 'high'" class="bi bi-fire"></i>
                {{ lead.priority }}
              </span>
            </div>
            <p style="color:var(--text-secondary);font-size:0.875rem;margin:0.25rem 0 0;">
              <i class="bi bi-building me-1"></i>
              {{ lead.company_name || 'Individual Client' }}
            </p>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <button @click="triggerCall(lead.phone)" class="btn btn-secondary btn-sm" title="Call Lead">
              <i class="bi bi-telephone-fill"></i> Call
            </button>
            <button @click="openWhatsAppChat" class="btn btn-whatsapp btn-sm" title="Open WhatsApp Chat">
              <i class="bi bi-whatsapp"></i> WhatsApp
            </button>
            <button
              v-if="lead.stage?.name !== 'Won' && lead.stage?.name !== 'Lost'"
              @click="markWon"
              class="btn btn-won btn-sm"
              title="Mark Lead as Won"
            >
              <i class="bi bi-trophy-fill"></i> Mark Won
            </button>
            <button
              v-if="lead.stage?.name !== 'Won' && lead.stage?.name !== 'Lost'"
              @click="openLostModal"
              class="btn btn-lost btn-sm"
              title="Mark Lead as Lost"
            >
              <i class="bi bi-x-circle-fill"></i> Mark Lost
            </button>
            <router-link :to="`/leads/${lead.id}/edit`" class="btn btn-secondary btn-sm" title="Edit Lead">
              <i class="bi bi-pencil"></i> Edit
            </router-link>
            <button @click="confirmDeleteAction" class="btn btn-danger btn-sm" title="Delete Lead">
              <i class="bi bi-trash3"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="row g-4">
      <!-- LEFT COLUMN -->
      <div class="col-12 col-lg-7">
        <!-- Lead Information -->
        <div class="card mb-4">
          <div class="card-header">
            <i class="bi bi-person-lines-fill"></i>
            Lead Information
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-6">
                <span class="info-label">Estimated Value</span>
                <span style="font-size:1.25rem;font-weight:800;color:var(--primary);">
                  {{ formatCurrency(lead.expected_value) }}
                </span>
              </div>
              <div class="col-6">
                <span class="info-label">Executive Owner</span>
                <span class="fw-600 text-dark d-inline-flex align-items-center gap-1">
                  <i class="bi bi-person-check text-primary-custom"></i>
                  {{ lead.assigned_user?.name || 'Unassigned' }}
                </span>
              </div>
              <div class="col-6">
                <span class="info-label">Lead Source</span>
                <span class="badge badge-low">{{ lead.source?.name || 'Unknown' }}</span>
              </div>
              <div class="col-6">
                <span class="info-label">Sales Stage</span>
                <span class="badge badge-new">{{ lead.stage?.name || 'New Lead' }}</span>
              </div>
              <div class="col-6">
                <span class="info-label">Email Address</span>
                <span class="info-value">{{ lead.email || '—' }}</span>
              </div>
              <div class="col-6">
                <span class="info-label">Lead Status</span>
                <span class="info-value fw-600">{{ lead.status?.name || 'New' }}</span>
              </div>
              <div class="col-6">
                <span class="info-label">City</span>
                <span class="info-value">{{ lead.city || '—' }}</span>
              </div>
              <div class="col-6">
                <span class="info-label">State</span>
                <span class="info-value">{{ lead.state || '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Requirements -->
        <div class="card mb-4">
          <div class="card-header">
            <i class="bi bi-card-text"></i>
            Requirements
          </div>
          <div class="card-body">
            <p style="font-size:0.875rem;color:var(--text-primary);white-space:pre-line;margin:0;line-height:1.7;">
              {{ lead.requirement || 'No requirements specified.' }}
            </p>
          </div>
        </div>

        <!-- Add Note -->
        <div class="card">
          <div class="card-header">
            <i class="bi bi-pencil-square"></i>
            Add Custom Note
          </div>
          <div class="card-body">
            <textarea
              v-model="newNote"
              class="form-control mb-3"
              rows="3"
              placeholder="Enter private staff remarks or observations..."
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

      <!-- RIGHT COLUMN -->
      <div class="col-12 col-lg-5">
        <!-- Next Follow-up -->
        <div class="card mb-4" style="border-left:4px solid var(--warning);">
          <div class="card-header">
            <i class="bi bi-alarm-fill text-warning"></i>
            Next Follow-up Task
          </div>
          <div class="card-body">
            <div v-if="lead.next_follow_up_date" style="font-size:0.875rem;">
              <div class="fw-600" style="font-size:1rem;color:var(--text-primary);">
                <i class="bi bi-calendar-event me-1 text-primary-custom"></i>
                {{ formatDate(lead.next_follow_up_date) }}
                <span style="color:var(--text-secondary);font-weight:400;"> at </span>
                <i class="bi bi-clock me-1 text-muted"></i>
                {{ lead.next_follow_up_time || 'N/A' }}
              </div>
              <p style="color:var(--text-secondary);margin-top:0.375rem;font-size:0.8125rem;">
                Task will appear automatically in the follow-ups schedule.
              </p>
            </div>
            <div v-else>
              <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:0.75rem;">
                No upcoming follow-up scheduled.
              </p>
              <button @click="showScheduleModal = true" class="btn btn-secondary btn-sm">
                <i class="bi bi-calendar-plus"></i> Schedule Action
              </button>
            </div>
          </div>
        </div>

        <!-- Activity Timeline -->
        <div class="card" style="max-height:520px;overflow-y:auto;">
          <div class="card-header">
            <i class="bi bi-clock-history"></i>
            Activity Log
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
                  <div class="timeline-title">{{ act.type }}</div>
                  <p class="timeline-desc">{{ act.description }}</p>
                  <div v-if="act.user" style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">
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
            <textarea
              v-model="lostReason"
              :class="['form-control', { 'is-invalid': lostReasonError }]"
              rows="3"
              placeholder="e.g. Higher pricing than competitors / Customer cancelled project"
              @input="lostReasonError = ''"
              required
            ></textarea>
            <div v-if="lostReasonError" class="invalid-feedback">{{ lostReasonError }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showLostModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitLost" class="btn btn-danger" :disabled="submittingLost">
            <span v-if="submittingLost" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="bi bi-x-circle"></i>
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
          <button @click="showScheduleModal = false" class="btn btn-secondary">Cancel</button>
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
import { useRoute, useRouter } from 'vue-router';
import { useLeadsStore } from '@/stores/leads';
import { useFollowUpsStore } from '@/stores/followups';
import { useIndianFormat } from '@/composables/useIndianFormat';
import { useToast } from '@/composables/useToast';
import { useSwal } from '@/composables/useSwal';

const route = useRoute();
const router = useRouter();
const leadsStore = useLeadsStore();
const followUpsStore = useFollowUpsStore();
const { formatCurrency, formatDate, formatDateTime } = useIndianFormat();
const toast = useToast();
const { confirmDelete } = useSwal();

const loading = ref(true);
const lead = computed(() => leadsStore.currentLead);
const timeline = computed(() => leadsStore.timeline);

const newNote = ref('');
const showLostModal = ref(false);
const lostReason = ref('');
const lostReasonError = ref('');
const submittingLost = ref(false);

const showScheduleModal = ref(false);
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
  window.open(`tel:${phone}`);
};

const openWhatsAppChat = () => {
  router.push('/whatsapp/inbox');
};

const markWon = async () => {
  try {
    await leadsStore.markWon(lead.value.id);
    toast.success('Lead marked as closed WON!');
    loadLeadDetails();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to update stage to Won.');
  }
};

const openLostModal = () => {
  lostReason.value = '';
  lostReasonError.value = '';
  showLostModal.value = true;
};

const submitLost = async () => {
  if (!lostReason.value.trim()) {
    lostReasonError.value = 'Please provide a reason for losing this lead.';
    toast.error('Lost reason is required.');
    return;
  }
  submittingLost.value = true;
  try {
    await leadsStore.markLost(lead.value.id, lostReason.value.trim());
    toast.success('Lead marked as lost.');
    showLostModal.value = false;
    loadLeadDetails();
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || 'Failed to update stage to Lost.');
  } finally {
    submittingLost.value = false;
  }
};

const submitNote = async () => {
  if (!newNote.value.trim()) return;
  try {
    await leadsStore.addNote(lead.value.id, newNote.value.trim());
    toast.success('Note added successfully.');
    newNote.value = '';
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || 'Failed to save note.');
  }
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
      lead_id: lead.value.id,
      assigned_to: lead.value.assigned_to || undefined,
      ...followUpForm
    });
    toast.success('Follow-up task scheduled.');
    showScheduleModal.value = false;
    loadLeadDetails();
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

const confirmDeleteAction = async () => {
  const confirmed = await confirmDelete(`lead "${lead.value.name}"`);
  if (confirmed) {
    try {
      await leadsStore.deleteLead(lead.value.id);
      toast.success('Lead deleted.');
      router.push('/leads');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete lead.');
    }
  }
};
</script>
