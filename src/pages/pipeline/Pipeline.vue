<template>
  <!-- Skeleton Loading -->
  <div v-if="loading" class="pipeline-container">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex gap-2">
        <div class="skeleton" style="height: 32px; width: 70px; border-radius: 20px;"></div>
        <div class="skeleton" style="height: 32px; width: 100px; border-radius: 20px;"></div>
        <div class="skeleton" style="height: 32px; width: 110px; border-radius: 20px;"></div>
      </div>
      <div class="skeleton" style="height: 32px; width: 90px; border-radius: 8px;"></div>
    </div>
    <div class="skeleton-kanban-board">
      <div v-for="i in 4" :key="i" class="skeleton-kanban-col">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="skeleton" style="height: 18px; width: 100px;"></div>
          <div class="skeleton" style="height: 18px; width: 40px; border-radius: 10px;"></div>
        </div>
        <div v-for="j in 3" :key="j" class="skeleton-kanban-item">
          <div class="skeleton" style="height: 14px; width: 80%;"></div>
          <div class="skeleton" style="height: 12px; width: 50%;"></div>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <div class="skeleton" style="height: 12px; width: 60px;"></div>
            <div class="skeleton" style="height: 20px; width: 50px; border-radius: 10px;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="pipeline-container">
    <!-- Pipeline Toolbar / Navigation -->
    <div class="pipeline-toolbar flex-wrap gap-2">
      <!-- Search & Filters -->
      <div class="d-flex align-items-center gap-2 flex-grow-1" style="max-width: 450px;">
        <div class="input-group input-group-sm">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Search leads in pipeline..."
          />
        </div>
        <select v-model="selectedExecutive" class="form-select form-select-sm" style="max-width: 170px;">
          <option value="">All Executives</option>
          <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
        </select>
      </div>

      <!-- Action Buttons & Scroll Controls -->
      <div class="d-flex align-items-center gap-2">
        <div class="btn-group d-none d-md-inline-flex" role="group">
          <button @click="scrollBoard('left')" class="btn btn-secondary btn-sm" title="Scroll Left">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button @click="scrollBoard('right')" class="btn btn-secondary btn-sm" title="Scroll Right">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
        <button @click="loadPipeline" class="btn btn-secondary btn-sm" :disabled="loading">
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>
    </div>

    <!-- Stage Filter Pills -->
    <div class="pipeline-stage-pills mb-3">
      <button class="stage-pill-btn"
        :class="{ active: selectedStageId === null }"
        @click="selectStage(null)">
        <span>All</span>
        <span class="badge badge-low" style="padding: 2px 6px; font-size: 0.65rem;">{{ totalLeadsCount }}</span>
      </button>
      <button v-for="col in pipeline" :key="col.stage.id" class="stage-pill-btn"
        :class="{ active: selectedStageId === col.stage.id }" @click="selectStage(col.stage.id)">
        <span>{{ col.stage.name }}</span>
        <span class="badge badge-low" style="padding: 2px 6px; font-size: 0.65rem;">{{ col.count }}</span>
      </button>
    </div>

    <!-- Kanban Board Wrapper with Horizontal Scroll -->
    <div class="pipeline-board-wrapper" ref="boardWrapperRef">
      <div class="pipeline-board">
        <div v-for="col in filteredPipeline" :key="col.stage.id" :id="`stage-col-${col.stage.id}`" :class="[
          'pipeline-column',
          { 'drag-over': dragOverStageId === col.stage.id }
        ]" @dragover.prevent="onDragOver(col.stage.id)" @dragleave="onDragLeave(col.stage.id)"
          @drop="handleDrop($event, col.stage)">
          <!-- Column Header -->
          <div :class="['column-header', getStageAccentClass(col.stage.name)]">
            <div class="column-title">
              <i :class="getStageIcon(col.stage.name)"></i>
              <span :title="col.stage.name">{{ col.stage.name }}</span>
              <span class="column-count">{{ getDisplayLeads(col.leads).length }}</span>
              <span v-if="totalLeadsCount > 0" class="badge bg-light text-secondary border ms-1" style="font-size:0.65rem;">
                {{ Math.round((col.count / totalLeadsCount) * 100) }}%
              </span>
            </div>
            <div class="column-total" :title="`Total: ${formatCurrency(col.total_value)}`">
              {{ formatCurrency(col.total_value) }}
            </div>
          </div>

          <div class="column-body">
            <div
              v-for="lead in getDisplayLeads(col.leads)"
              :key="lead.id"
              :class="['kanban-card', { 'is-dragging': draggedLead?.id === lead.id }]"
              draggable="true"
              @dragstart="handleDragStart($event, lead)"
              @dragend="handleDragEnd"
            >
              <div class="d-flex align-items-start justify-content-between gap-1">
                <router-link :to="`/leads/${lead.id}`" class="kanban-card-title text-dark text-decoration-none">
                  {{ lead.name }}
                </router-link>
                <span :class="['badge', `badge-${lead.priority || 'medium'}`]" style="font-size:0.65rem;text-transform:capitalize;">
                  {{ lead.priority || 'medium' }}
                </span>
              </div>

              <div class="kanban-card-meta">
                <i :class="lead.company_name ? 'bi bi-building text-primary-custom' : 'bi bi-person text-secondary'"></i>
                <span class="text-truncate">{{ lead.company_name || 'Individual Client' }}</span>
              </div>

              <div class="d-flex align-items-center justify-content-between gap-1 my-1">
                <span :class="['badge', getSourceBadgeClass(lead.source?.name)]"
                  style="font-size:0.65rem;font-weight:600;">
                  <i :class="getSourceIcon(lead.source?.name)"></i>
                  {{ lead.source?.name || 'Direct' }}
                </span>
                <span class="kanban-card-value">
                  {{ formatCurrency(lead.expected_value) }}
                </span>
              </div>

              <div v-if="lead.next_follow_up_date" class="d-flex align-items-center gap-1 my-1"
                style="font-size:0.7rem;color:var(--text-secondary);">
                <i class="bi bi-clock-history text-warning"></i>
                <span>Due: {{ formatDate(lead.next_follow_up_date) }}</span>
              </div>

              <div v-if="lead.assigned_user?.name" class="d-flex align-items-center gap-1 my-1"
                style="font-size:0.7rem;color:var(--text-muted);">
                <i class="bi bi-person-badge text-primary-custom"></i>
                <span class="text-truncate">{{ lead.assigned_user.name }}</span>
              </div>

              <div class="kanban-card-footer">
                <!-- Mobile / Direct Quick Stage Switcher -->
                <select class="kanban-card-move-select" :value="col.stage.id"
                  @change="moveLeadViaSelect(lead, $event.target.value)" title="Move to stage">
                  <option v-for="s in pipeline" :key="s.stage.id" :value="s.stage.id">
                    Move: {{ s.stage.name }}
                  </option>
                </select>

                <router-link :to="`/leads/${lead.id}`"
                  style="font-size:0.75rem;color:var(--text-secondary);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:3px;"
                  @mouseover="e => e.target.style.color = 'var(--primary)'"
                  @mouseleave="e => e.target.style.color = 'var(--text-secondary)'">
                  View <i class="bi bi-arrow-right"></i>
                </router-link>
              </div>
            </div>

            <!-- Empty Drop Zone -->
            <div v-if="!getDisplayLeads(col.leads).length"
              style="text-align:center;color:var(--text-muted);font-size:0.8rem;padding:2rem 1rem;border:1.5px dashed var(--border-color);border-radius:var(--radius-md);background:var(--bg-secondary);">
              <i class="bi bi-inbox d-block mb-1" style="font-size:1.3rem;opacity:0.4;"></i>
              <span>No leads in this stage</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Stages Warning -->
      <div v-if="!pipeline.length" class="empty-state" style="min-width:320px;">
        <div class="empty-state-icon"><i class="bi bi-kanban"></i></div>
        <span class="empty-state-title">No pipeline stages found</span>
        <p class="empty-state-desc">Configure your pipeline stages in settings to start tracking leads.</p>
        <router-link to="/settings/stages" class="btn btn-primary mt-2">
          <i class="bi bi-gear-fill"></i> Configure Stages
        </router-link>
      </div>
    </div>

    <!-- Mark Dropped Modal -->
    <div v-if="showLostModal" class="modal-overlay" @click.self="showLostModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-x-circle-fill text-danger me-1"></i>
            Mark Lead as Dropped
          </h5>
          <button @click="showLostModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:1rem;">
            Moving <strong>{{ activeLeadForLost?.name }}</strong> to Dropped. Please record the drop reason for reporting and deal analytics.
          </p>
          <div class="mb-3">
            <label class="form-label">Primary Drop Reason *</label>
            <select v-model="lostCategory" class="form-select" required>
              <option value="Too Expensive — Pricing Issue">Too Expensive — Pricing Issue</option>
              <option value="Chose Competitor">Chose Competitor</option>
              <option value="Client Unresponsive / Ghosted">Client Unresponsive / Ghosted</option>
              <option value="Project Postponed / Budget Reallocated">Project Postponed / Budget Reallocated</option>
              <option value="Product Specifications Mismatch">Product Specifications Mismatch</option>
              <option value="Location / Delivery Constraints">Location / Delivery Constraints</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Additional Remarks</label>
            <textarea
              v-model="lostRemarks"
              class="form-control"
              rows="3"
              placeholder="e.g. Offered 10% discount but competitor gave 25% lower price..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showLostModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitLost" class="btn btn-danger" :disabled="submittingLost">
            <span v-if="submittingLost" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-x-circle"></i>
            Confirm Lead Dropped
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import pipelineApi from '@/api/pipeline';
import leadsApi from '@/api/leads';
import usersApi from '@/api/users';
import { useIndianFormat } from '@/composables/useIndianFormat';
import { useLeadSource } from '@/composables/useLeadSource';
import { useToast } from '@/composables/useToast';

const { formatCurrency, formatDate } = useIndianFormat();
const { getSourceIcon, getSourceBadgeClass } = useLeadSource();
const toast = useToast();

const loading = ref(true);
const pipeline = ref([]);
const users = ref([]);
const draggedLead = ref(null);
const dragOverStageId = ref(null);
const selectedStageId = ref(null);
const boardWrapperRef = ref(null);

const searchQuery = ref('');
const selectedExecutive = ref('');

// Lost modal state
const showLostModal = ref(false);
const activeLeadForLost = ref(null);
const lostCategory = ref('Too Expensive — Pricing Issue');
const lostRemarks = ref('');
const submittingLost = ref(false);

const filteredPipeline = computed(() => {
  if (selectedStageId.value === null) {
    return pipeline.value;
  }
  return pipeline.value.filter(col => col.stage.id === selectedStageId.value);
});

const getDisplayLeads = (leadsList = []) => {
  let list = leadsList;
  if (selectedExecutive.value) {
    const execId = parseInt(selectedExecutive.value, 10);
    list = list.filter(l => l.assigned_to === execId);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(l =>
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.company_name && l.company_name.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q))
    );
  }
  return list;
};

const totalLeadsCount = computed(() => {
  return pipeline.value.reduce((acc, col) => acc + (col.count || 0), 0);
});

const loadPipeline = async () => {
  try {
    loading.value = true;
    const [pipelineRes, usersRes] = await Promise.all([
      pipelineApi.getPipeline(),
      usersApi.getUsers().catch(() => ({ data: { users: [] } })),
    ]);
    pipeline.value = pipelineRes.data.pipeline;
    users.value = usersRes.data.users || [];
    loading.value = false;
  } catch (err) {
    toast.error('Failed to load Sales Pipeline Kanban Board.');
    loading.value = false;
  }
};

onMounted(() => {
  loadPipeline();
});

const getStageAccentClass = (stageName) => {
  const normalized = (stageName || '').toLowerCase().replace(/\s+/g, '-');
  return `stage-accent-${normalized}`;
};

const getStageIcon = (stageName) => {
  const name = (stageName || '').toLowerCase();
  if (name.includes('converted') || name.includes('won')) return 'bi bi-award-fill text-success';
  if (name.includes('dropped') || name.includes('lost')) return 'bi bi-x-circle-fill text-danger';
  if (name.includes('negotiat')) return 'bi bi-chat-quote-fill text-primary-custom';
  if (name.includes('quotat')) return 'bi bi-file-earmark-spreadsheet-fill text-info';
  if (name.includes('interest')) return 'bi bi-star-fill text-warning';
  if (name.includes('contact')) return 'bi bi-telephone-fill text-primary';
  return 'bi bi-flag-fill text-primary-custom';
};

const selectStage = (stageId) => {
  if (selectedStageId.value === stageId) {
    selectedStageId.value = null;
  } else {
    selectedStageId.value = stageId;
  }
};

const scrollBoard = (direction) => {
  if (boardWrapperRef.value) {
    const scrollAmount = 320;
    const current = boardWrapperRef.value.scrollLeft;
    boardWrapperRef.value.scrollTo({
      left: direction === 'left' ? current - scrollAmount : current + scrollAmount,
      behavior: 'smooth'
    });
  }
};

const handleDragStart = (event, lead) => {
  draggedLead.value = lead;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', lead.id);
};

const handleDragEnd = () => {
  draggedLead.value = null;
  dragOverStageId.value = null;
};

const onDragOver = (stageId) => {
  dragOverStageId.value = stageId;
};

const onDragLeave = (stageId) => {
  if (dragOverStageId.value === stageId) {
    dragOverStageId.value = null;
  }
};

const handleDrop = async (event, targetStage) => {
  dragOverStageId.value = null;
  if (!draggedLead.value) return;

  const lead = draggedLead.value;
  const oldStageId = lead.stage_id;
  const stageId = targetStage.id;
  const stageName = (targetStage.name || '').toLowerCase();

  if (oldStageId === stageId) {
    draggedLead.value = null;
    return;
  }

  // Handle special stages
  if (stageName.includes('won') || stageName.includes('converted')) {
    draggedLead.value = null;
    try {
      await leadsApi.markWon(lead.id);
      toast.success(`Lead Converted! "${lead.name}" successfully converted.`);
      loadPipeline();
    } catch (err) {
      toast.error('Failed to mark lead as Converted.');
    }
    return;
  }

  if (stageName.includes('lost') || stageName.includes('dropped')) {
    activeLeadForLost.value = lead;
    lostCategory.value = 'Too Expensive — Pricing Issue';
    lostRemarks.value = '';
    showLostModal.value = true;
    draggedLead.value = null;
    return;
  }

  try {
    await leadsApi.updateLead(lead.id, { stage_id: stageId });
    toast.success(`Moved "${lead.name}" to ${targetStage.name}.`);
  } catch (err) {
    toast.error('Failed to update lead stage in pipeline.');
  } finally {
    draggedLead.value = null;
    loadPipeline();
  }
};

const submitLost = async () => {
  if (!activeLeadForLost.value) return;
  submittingLost.value = true;
  const fullReason = lostRemarks.value.trim()
    ? `${lostCategory.value} — ${lostRemarks.value.trim()}`
    : lostCategory.value;

  try {
    await leadsApi.markLost(activeLeadForLost.value.id, fullReason);
    toast.success(`Lead "${activeLeadForLost.value.name}" marked as Dropped.`);
    showLostModal.value = false;
    loadPipeline();
  } catch (err) {
    toast.error('Failed to mark lead as Dropped.');
  } finally {
    submittingLost.value = false;
  }
};

const moveLeadViaSelect = async (lead, newStageId) => {
  const stageIdNum = parseInt(newStageId, 10);
  if (!stageIdNum || lead.stage_id === stageIdNum) return;

  const targetStage = pipeline.value.find(s => s.stage.id === stageIdNum)?.stage;
  const stageName = (targetStage?.name || '').toLowerCase();

  if (stageName.includes('won') || stageName.includes('converted')) {
    try {
      await leadsApi.markWon(lead.id);
      toast.success(`Lead Converted! "${lead.name}" successfully converted.`);
      loadPipeline();
    } catch {
      toast.error('Failed to mark lead as Converted.');
    }
    return;
  }

  if (stageName.includes('lost') || stageName.includes('dropped')) {
    activeLeadForLost.value = lead;
    lostCategory.value = 'Too Expensive — Pricing Issue';
    lostRemarks.value = '';
    showLostModal.value = true;
    return;
  }

  try {
    await leadsApi.updateLead(lead.id, { stage_id: stageIdNum });
    toast.success(`Moved "${lead.name}" successfully.`);
    loadPipeline();
  } catch (err) {
    toast.error('Failed to move lead stage.');
  }
};
</script>
