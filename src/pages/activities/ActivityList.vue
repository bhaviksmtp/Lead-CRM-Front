<template>
  <div class="d-flex flex-column gap-4">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-clock-history"></i>
          Universal Activities Feed
        </h2>
        <p class="page-header-sub">Full audit trail of calls, WhatsApp notes, emails, meetings, and stage changes</p>
      </div>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="loading" class="card p-4">
      <div v-for="i in 5" :key="i" class="mb-4 pb-2">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="d-flex align-items-center gap-2">
            <div class="skeleton" style="height: 16px; width: 100px;"></div>
            <div class="skeleton" style="height: 20px; width: 120px; border-radius: 10px;"></div>
          </div>
          <div class="skeleton" style="height: 12px; width: 80px;"></div>
        </div>
        <div class="skeleton" style="height: 14px; width: 70%;"></div>
      </div>
    </div>

    <!-- Activities Feed -->
    <div v-else-if="activities.length" class="card">
      <div class="card-body">
        <div class="timeline">
          <div v-for="act in activities" :key="act.id" class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-1">
                <div class="d-flex align-items-center gap-2">
                  <span class="timeline-title fw-700" style="font-size:0.9375rem;">{{ act.type }}</span>
                  <router-link
                    v-if="act.lead"
                    :to="`/leads/${act.lead.id}`"
                    class="badge badge-low text-decoration-none hover-primary"
                  >
                    <i class="bi bi-person me-1"></i>{{ act.lead.name }} ({{ act.lead.company_name || 'Individual' }})
                  </router-link>
                </div>
                <div class="timeline-time" style="font-size:0.8125rem;">
                  <i class="bi bi-clock me-1"></i>
                  {{ formatDateTime(act.created_at) }}
                </div>
              </div>
              <p class="timeline-desc mb-1" style="font-size:0.875rem;color:var(--text-primary);">
                {{ act.description }}
              </p>
              <div v-if="act.user" style="font-size:0.75rem;color:var(--text-secondary);">
                <i class="bi bi-person-check me-1"></i> Recorded by: <strong>{{ act.user.name }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card">
      <div class="card-body empty-state py-5">
        <div class="empty-state-icon"><i class="bi bi-clock-history"></i></div>
        <span class="empty-state-title">No activities recorded yet</span>
        <p class="empty-state-desc">Interactions, calls, notes, and stage changes will be logged here automatically.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useIndianFormat } from '@/composables/useIndianFormat';
import leadsApi from '@/api/leads';

const { formatDateTime } = useIndianFormat();

const loading = ref(true);
const activities = ref([]);

const loadActivities = async () => {
  loading.value = true;
  try {
    const res = await leadsApi.getAllActivities();
    activities.value = res.data.activities.data || res.data.activities || [];
  } catch (e) {
    console.error('Failed to load activities', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadActivities();
});
</script>

<style scoped>
.hover-primary:hover {
  color: var(--primary) !important;
}
</style>
