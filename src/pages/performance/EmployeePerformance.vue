<template>
  <div class="employee-performance-page">
    <!-- Clean Page Header -->
    <div class="page-header mb-3">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-award-fill text-warning"></i>
          Employee Performance
        </h2>
        <p class="page-header-sub">
          Performance metrics, won revenue, conversion rates, and activities for sales employees
        </p>
      </div>
      <div class="d-flex gap-2 align-items-center">
        <button @click="loadData" class="btn btn-secondary btn-sm" :disabled="loading" title="Refresh performance data">
          <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i> Refresh
        </button>
        <router-link to="/dashboard" class="btn btn-secondary btn-sm">
          <i class="bi bi-grid-1x2-fill"></i> Dashboard
        </router-link>
      </div>
    </div>

    <!-- Search & Sort Filter Toolbar -->
    <div class="card mb-3">
      <div class="card-body py-3">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-5">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Search employee by name, email, or phone..."
              />
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select v-model="selectedRole" class="form-select">
              <option value="">All Employee Roles</option>
              <option value="Salesperson">Salesperson</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <div class="col-6 col-md-4">
            <select v-model="sortBy" class="form-select">
              <option value="won_revenue">Sort by Won Revenue (High to Low)</option>
              <option value="conversion_rate">Sort by Conversion Rate</option>
              <option value="won_count">Sort by Won Deals</option>
              <option value="leads_count">Sort by Total Leads</option>
              <option value="follow_ups_completed">Sort by Follow-ups Completed</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="loading" class="card p-3">
      <div class="skeleton mb-3" style="height: 24px; width: 180px;"></div>
      <div v-for="i in 5" :key="i" class="skeleton mb-2" style="height: 52px; width: 100%; border-radius: 6px;"></div>
    </div>

    <!-- Employee List Card -->
    <div v-else class="card">
      <div class="card-body p-0">
        <div class="p-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <h3 class="card-title m-0">
              <i class="bi bi-people-fill text-primary-custom me-1"></i>
              Employee List
            </h3>
            <span class="badge bg-light text-secondary border px-2 py-1" style="font-size:0.8rem;">
              {{ filteredTeam.length }} {{ filteredTeam.length === 1 ? 'Employee' : 'Employees' }}
            </span>
          </div>
          <span class="text-secondary small">
            Excludes admin accounts &bull; Sorted by {{ getSortLabel(sortBy) }}
          </span>
        </div>

        <!-- Fully Responsive Employee DataTable -->
        <DataTable
          :columns="employeeColumns"
          :data="filteredTeam"
          :loading="loading"
          :pagination="true"
          :page-size="15"
          empty-icon="bi-person-x"
          empty-title="No employees found"
          empty-description="No sales employees match the specified filters or search query."
        >
          <!-- Rank -->
          <template #rank="{ index }">
            <span v-if="index === 0" class="badge-rank gold" title="1st Place">🥇</span>
            <span v-else-if="index === 1" class="badge-rank silver" title="2nd Place">🥈</span>
            <span v-else-if="index === 2" class="badge-rank bronze" title="3rd Place">🥉</span>
            <span v-else class="text-muted small fw-600">#{{ index + 1 }}</span>
          </template>

          <!-- Employee Info -->
          <template #employee="{ item }">
            <div class="d-flex align-items-center gap-2">
              <div class="avatar-circle" :style="getAvatarStyle(item.name)">
                {{ getInitials(item.name) }}
              </div>
              <div>
                <div class="fw-700 text-dark" style="font-size:0.875rem;">{{ item.name }}</div>
                <div class="text-secondary small" style="font-size:0.75rem;">{{ item.email }}</div>
                <div v-if="item.phone" class="text-muted small" style="font-size:0.75rem;">
                  <i class="bi bi-telephone me-1"></i>{{ item.phone }}
                </div>
              </div>
            </div>
          </template>

          <!-- Role -->
          <template #role="{ item }">
            <span :class="['badge', getRoleBadgeClass(item.role)]" style="font-size:0.75rem;">
              {{ item.role }}
            </span>
          </template>

          <!-- Assigned Leads -->
          <template #leads_count="{ item }">
            <span class="fw-700" style="font-size:0.95rem;">{{ item.leads_count }}</span>
            <div class="text-secondary small" style="font-size:0.7rem;">
              {{ item.open_count ?? (item.leads_count - item.won_count - item.lost_count) }} open
            </div>
          </template>

          <!-- Won / Lost -->
          <template #won_lost="{ item }">
            <div class="d-inline-flex align-items-center gap-1">
              <span class="badge badge-won px-2" title="Won Deals">
                <i class="bi bi-check-circle me-1"></i>{{ item.won_count }}
              </span>
              <span class="badge badge-lost px-2" title="Lost Deals">
                <i class="bi bi-x-circle me-1"></i>{{ item.lost_count }}
              </span>
            </div>
          </template>

          <!-- Conversion Rate -->
          <template #conversion_rate="{ item }">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="fw-700 small" :class="getRateColorClass(item.conversion_rate)">
                {{ item.conversion_rate }}%
              </span>
              <span class="text-secondary small" style="font-size:0.7rem;">Win Rate</span>
            </div>
            <div class="progress" style="height: 6px; background-color: var(--border-color);">
              <div
                class="progress-bar rounded"
                role="progressbar"
                :style="`width: ${Math.min(100, item.conversion_rate)}%; background-color: ${getRateBarColor(item.conversion_rate)};`"
              ></div>
            </div>
          </template>

          <!-- Won Revenue -->
          <template #won_revenue="{ item }">
            <div class="fw-700" style="color:var(--won);font-size:0.95rem;">
              {{ formatCurrency(item.won_revenue) }}
            </div>
            <div v-if="item.pipeline_value > 0" class="text-secondary small" style="font-size:0.7rem;">
              {{ formatCurrency(item.pipeline_value) }} pipeline
            </div>
          </template>

          <!-- Follow-up Tasks -->
          <template #follow_ups="{ item }">
            <div class="d-flex flex-wrap gap-1">
              <span class="badge badge-completed d-inline-flex align-items-center gap-1" style="font-size:0.7rem;">
                <i class="bi bi-check-lg"></i> {{ item.follow_ups_completed }} Done
              </span>
              <span v-if="item.follow_ups_missed > 0" class="badge badge-missed d-inline-flex align-items-center gap-1" style="font-size:0.7rem;">
                <i class="bi bi-exclamation-circle-fill"></i> {{ item.follow_ups_missed }} Missed
              </span>
            </div>
          </template>

          <!-- Activities -->
          <template #activities="{ item }">
            <span class="badge bg-light text-secondary border px-2 py-1" style="font-size:0.75rem;">
              <i class="bi bi-chat-left-text me-1 text-primary-custom"></i>
              {{ item.activities_count ?? 0 }}
            </span>
          </template>

          <!-- Action -->
          <template #action="{ item }">
            <router-link
              :to="`/leads?assigned_to=${item.id}`"
              class="btn btn-secondary btn-sm px-2 py-1"
              title="View leads assigned to this employee"
            >
              <i class="bi bi-eye me-1"></i> Leads
            </router-link>
          </template>

          <!-- Empty State -->
          <template #empty>
            <div class="empty-state py-5 text-center">
              <div class="empty-state-icon mb-2"><i class="bi bi-person-x" style="font-size:2rem;color:var(--text-muted);"></i></div>
              <span class="empty-state-title fw-700">No employees found</span>
              <p class="empty-state-desc text-secondary small">
                No sales employees match the specified filters or search query.
              </p>
              <button @click="resetFilters" class="btn btn-secondary btn-sm mt-2">Reset Filters</button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useIndianFormat } from '@/composables/useIndianFormat';
import { useToast } from '@/composables/useToast';
import dashboardApi from '@/api/dashboard';

const { formatCurrency } = useIndianFormat();
const toast = useToast();

const loading = ref(true);
const teamMembers = ref([]);
const searchQuery = ref('');
const selectedRole = ref('');
const sortBy = ref('won_revenue');

const employeeColumns = [
  { key: 'rank', label: '#', align: 'center', width: '50px', minWidth: '40px' },
  { key: 'employee', label: 'Employee', sortable: true, sortKey: 'name', minWidth: '180px' },
  { key: 'role', label: 'Role', sortable: true, minWidth: '110px' },
  { key: 'leads_count', label: 'Assigned Leads', align: 'center', sortable: true, minWidth: '120px' },
  { key: 'won_lost', label: 'Won / Lost', align: 'center', minWidth: '110px' },
  { key: 'conversion_rate', label: 'Conversion Rate', sortable: true, minWidth: '140px' },
  { key: 'won_revenue', label: 'Revenue Won', sortable: true, minWidth: '120px' },
  { key: 'follow_ups', label: 'Follow-up Tasks', minWidth: '140px' },
  { key: 'activities', label: 'Activities', align: 'center', sortable: true, sortKey: 'activities_count', minWidth: '100px' },
  { key: 'action', label: 'Action', align: 'center', minWidth: '100px' }
];

const loadData = async () => {
  loading.value = true;
  try {
    const res = await dashboardApi.getStats();
    const raw = res.data.data?.team_performance || [];
    
    // Strictly exclude Super Admin, Admin, and Company Admin accounts
    teamMembers.value = raw.filter(m => {
      const role = (m.role || '').toLowerCase();
      return !role.includes('admin');
    });
  } catch (err) {
    toast.error('Failed to load employee performance data.');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

const filteredTeam = computed(() => {
  let list = [...teamMembers.value];

  // Secondary safeguard: filter out any admin
  list = list.filter(m => {
    const role = (m.role || '').toLowerCase();
    return !role.includes('admin');
  });

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q)
    );
  }

  // Role filter
  if (selectedRole.value) {
    list = list.filter(m => m.role === selectedRole.value);
  }

  // Sorting
  list.sort((a, b) => {
    const valA = Number(a[sortBy.value]) || 0;
    const valB = Number(b[sortBy.value]) || 0;
    return valB - valA;
  });

  return list;
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedRole.value = '';
  sortBy.value = 'won_revenue';
};

const getSortLabel = (key) => {
  switch (key) {
    case 'won_revenue': return 'Revenue Won';
    case 'conversion_rate': return 'Conversion Rate';
    case 'won_count': return 'Deals Won';
    case 'leads_count': return 'Total Leads';
    case 'follow_ups_completed': return 'Follow-ups Completed';
    default: return 'Rank';
  }
};

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'Manager':
      return 'badge-medium';
    case 'Salesperson':
    case 'Sales Executive':
      return 'badge-primary';
    default:
      return 'badge-low';
  }
};

const getRateColorClass = (rate) => {
  if (rate >= 20) return 'text-success';
  if (rate >= 10) return 'text-primary-custom';
  return 'text-secondary';
};

const getRateBarColor = (rate) => {
  if (rate >= 20) return 'var(--won)';
  if (rate >= 10) return 'var(--primary)';
  return '#94a3b8';
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
</script>

<style scoped>
.employee-performance-page {
  display: flex;
  flex-direction: column;
}

/* Avatar styling */
.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Rank Badges */
.badge-rank {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.badge-rank.gold {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}
.badge-rank.silver {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
}
.badge-rank.bronze {
  background: #ffedd5;
  color: #9a3412;
  border: 1px solid #fed7aa;
}

/* Responsive Table */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table th,
.table td {
  vertical-align: middle;
  white-space: nowrap;
}



.spin {
  animation: rotate 1s linear infinite;
}
@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}
</style>
