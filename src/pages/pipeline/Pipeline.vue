<template>
  <!-- Loading -->
  <div v-if="loading" class="d-flex flex-column align-items-center py-5 gap-3">
    <div class="spinner-custom"></div>
    <p style="color:var(--text-secondary);font-size:0.875rem;">Loading Sales Pipeline...</p>
  </div>

  <div v-else class="pipeline-container">
    <!-- Pipeline Toolbar / Navigation -->
    <div class="pipeline-toolbar">
      <!-- Stage Filter Pills -->
      <div class="pipeline-stage-pills">
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

      <!-- Action Buttons -->
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

    <!-- Kanban Board Wrapper with Horizontal Scroll -->
    <div class="pipeline-board-wrapper" ref="boardWrapperRef">
      <div class="pipeline-board">
        <div v-for="col in filteredPipeline" :key="col.stage.id" :id="`stage-col-${col.stage.id}`" :class="[
          'pipeline-column',
          { 'drag-over': dragOverStageId === col.stage.id }
        ]" @dragover.prevent="onDragOver(col.stage.id)" @dragleave="onDragLeave(col.stage.id)"
          @drop="handleDrop($event, col.stage.id)">
          <!-- Column Header -->
          <div :class="['column-header', getStageAccentClass(col.stage.name)]">
            <div class="column-title">
              <i :class="getStageIcon(col.stage.name)"></i>
              <span :title="col.stage.name">{{ col.stage.name }}</span>
              <span class="column-count">{{ col.count }}</span>
            </div>
            <div class="column-total" :title="`Total: ${formatCurrency(col.total_value)}`">
              {{ formatCurrency(col.total_value) }}
            </div>
          </div>

          <div class="column-body">
            <div
              v-for="lead in col.leads"
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
                <span :class="['badge', `badge-${lead.priority}`]" style="font-size:0.65rem;">
                  {{ lead.priority }}
                </span>
              </div>

              <div class="kanban-card-meta">
                <i class="bi bi-building"></i>
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
            <div v-if="!col.leads.length"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import pipelineApi from '@/api/pipeline';
import leadsApi from '@/api/leads';
import { useIndianFormat } from '@/composables/useIndianFormat';
import { useLeadSource } from '@/composables/useLeadSource';
import { useToast } from '@/composables/useToast';

const { formatCurrency, formatDate } = useIndianFormat();
const { getSourceIcon, getSourceBadgeClass } = useLeadSource();
const toast = useToast();

const loading = ref(true);
const pipeline = ref([]);
const draggedLead = ref(null);
const dragOverStageId = ref(null);
const selectedStageId = ref(null);
const boardWrapperRef = ref(null);

const filteredPipeline = computed(() => {
  if (selectedStageId.value === null) {
    return pipeline.value;
  }
  return pipeline.value.filter(col => col.stage.id === selectedStageId.value);
});

const totalLeadsCount = computed(() => {
  return pipeline.value.reduce((acc, col) => acc + (col.count || 0), 0);
});

const loadPipeline = async () => {
  try {
    loading.value = true;
    const response = await pipelineApi.getPipeline();
    pipeline.value = response.data.pipeline;
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
  if (name.includes('won')) return 'bi bi-trophy-fill text-success';
  if (name.includes('lost')) return 'bi bi-x-circle-fill text-danger';
  if (name.includes('negotiat')) return 'bi bi-chat-quote-fill text-primary-custom';
  if (name.includes('quotat')) return 'bi bi-file-earmark-spreadsheet-fill text-info';
  if (name.includes('interest')) return 'bi bi-star-fill text-warning';
  if (name.includes('contact')) return 'bi bi-telephone-fill text-primary';
  return 'bi bi-flag-fill text-primary-custom';
};

const selectStage = (stageId) => {
  if (selectedStageId.value === stageId) {
    selectedStageId.value = null; // deselect / show all if re-clicked
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

const handleDrop = async (event, stageId) => {
  dragOverStageId.value = null;
  if (!draggedLead.value) return;

  const lead = draggedLead.value;
  const oldStageId = lead.stage_id;

  if (oldStageId === stageId) {
    draggedLead.value = null;
    return;
  }

  try {
    await leadsApi.updateLead(lead.id, { stage_id: stageId });
    toast.success(`Moved "${lead.name}" successfully.`);
  } catch (err) {
    toast.error('Failed to update lead stage in pipeline.');
  } finally {
    draggedLead.value = null;
    loadPipeline();
  }
};

const moveLeadViaSelect = async (lead, newStageId) => {
  const stageIdNum = parseInt(newStageId, 10);
  if (!stageIdNum || lead.stage_id === stageIdNum) return;

  try {
    await leadsApi.updateLead(lead.id, { stage_id: stageIdNum });
    toast.success(`Moved "${lead.name}" successfully.`);
    loadPipeline();
  } catch (err) {
    toast.error('Failed to move lead stage.');
  }
};
</script>
