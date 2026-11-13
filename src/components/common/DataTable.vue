<template>
  <div class="data-table-wrapper" :class="{ 'card': cardWrapper }">
    <!-- Optional Card / Table Header & Toolbar -->
    <div
      v-if="title || $slots.toolbar || $slots.filters || $slots['table-actions'] || searchable || selectable && selectedRows.length > 0"
      class="data-table-toolbar"
      :class="{ 'card-header': cardWrapper, 'p-3': !cardWrapper }"
    >
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 w-100">
        <!-- Title & Subtitle / Left section -->
        <div v-if="title || subtitle || $slots.title" class="data-table-title-area">
          <slot name="title">
            <h3 v-if="title" class="data-table-title mb-0">
              <i v-if="icon" :class="[icon, 'me-1 text-primary-custom']"></i>
              {{ title }}
              <span v-if="showCountBadge && !loading" class="badge bg-light text-secondary border ms-2" style="font-size:0.75rem;">
                {{ totalRecords }}
              </span>
            </h3>
            <p v-if="subtitle" class="data-table-subtitle text-secondary small mb-0 mt-1">
              {{ subtitle }}
            </p>
          </slot>
        </div>

        <!-- Bulk Actions Bar (displays when items are selected) -->
        <transition name="fade">
          <div
            v-if="selectable && selectedRows.length > 0"
            class="data-table-bulk-bar d-flex align-items-center gap-2 px-3 py-1 bg-light border rounded-3 flex-grow-1"
          >
            <span class="badge bg-primary text-white rounded-pill px-2 py-1" style="font-size:0.75rem;">
              {{ selectedRows.length }} selected
            </span>
            <slot
              name="bulk-actions"
              :selected="selectedRows"
              :count="selectedRows.length"
              :clear-selection="clearSelection"
            ></slot>
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm ms-auto py-0 px-2"
              style="font-size:0.75rem;"
              @click="clearSelection"
              title="Clear selection"
            >
              <i class="bi bi-x"></i> Deselect
            </button>
          </div>
        </transition>

        <!-- Right Side: Search, Filters, and Table Actions -->
        <div class="d-flex flex-wrap align-items-center gap-2 ms-auto">
          <!-- Search Input -->
          <div v-if="searchable" class="data-table-search">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                v-model="internalSearch"
                type="text"
                class="form-control border-start-0 ps-0"
                :placeholder="searchPlaceholder"
                @input="onSearchInput"
              />
              <button
                v-if="internalSearch"
                type="button"
                class="btn btn-outline-secondary border-start-0 border"
                @click="clearSearch"
                title="Clear search"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <!-- Filters Slot (e.g. dropdowns, date pickers) -->
          <slot name="filters"></slot>

          <!-- Table Actions Slot (e.g. Add, Export, Refresh buttons) -->
          <slot name="table-actions"></slot>

          <!-- Top Toolbar Slot -->
          <slot name="toolbar"></slot>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="data-table-error p-4 text-center">
      <slot name="error" :error="error" :retry="onRetry">
        <div class="alert alert-danger d-inline-flex align-items-center gap-2 mb-0" role="alert">
          <i class="bi bi-exclamation-triangle-fill fs-5"></i>
          <div>
            <strong>Error:</strong> {{ errorMessageText }}
          </div>
          <button v-if="retryable" type="button" class="btn btn-danger btn-sm ms-2" @click="onRetry">
            <i class="bi bi-arrow-clockwise"></i> Retry
          </button>
        </div>
      </slot>
    </div>

    <!-- Table Responsive Container -->
    <div v-else class="table-responsive border-0" :class="{ 'data-table-loading': loading }">
      <table
        class="table mb-0"
        :class="{
          'table-hover': hoverable,
          'table-striped': striped,
          'table-bordered': bordered,
          'table-mobile-cards': mobileCards
        }"
      >
        <!-- Table Header -->
        <thead>
          <tr>
            <!-- Select All Checkbox -->
            <th v-if="selectable" style="width: 44px;" class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                :checked="isAllSelected"
                :indeterminate.prop="isIndeterminate"
                @change="toggleSelectAll($event.target.checked)"
                title="Select all on this page"
                aria-label="Select all rows"
              />
            </th>

            <!-- Data Columns -->
            <th
              v-for="col in visibleColumns"
              :key="col.key"
              :style="getColumnHeaderStyle(col)"
              :class="[
                getColumnAlignClass(col.align),
                col.sortable ? 'sortable-th' : '',
                col.thClass
              ]"
              :title="col.headerTitle || (col.sortable ? `Sort by ${col.label || col.key}` : undefined)"
              @click="col.sortable ? handleSort(col) : null"
            >
              <slot :name="`header-${col.key}`" :column="col">
                <span class="th-content d-inline-flex align-items-center gap-1">
                  <span>{{ col.label || formatHeaderLabel(col.key) }}</span>
                  <span v-if="col.sortable" class="sort-icon-box">
                    <i
                      v-if="currentSortBy === (col.sortKey || col.key)"
                      :class="currentSortOrder === 'asc' ? 'bi bi-arrow-up text-primary-custom' : 'bi bi-arrow-down text-primary-custom'"
                    ></i>
                    <i v-else class="bi bi-arrow-down-up text-muted opacity-50"></i>
                  </span>
                </span>
              </slot>
            </th>
          </tr>
        </thead>

        <!-- Table Body (Loading Skeletons) -->
        <tbody v-if="loading">
          <slot name="loading">
            <tr v-for="rowIndex in skeletonRows" :key="`skeleton-${rowIndex}`" class="skeleton-row">
              <td v-if="selectable" class="text-center">
                <div class="skeleton" style="height: 16px; width: 16px; margin: 0 auto; border-radius: 4px;"></div>
              </td>
              <td v-for="(col, colIndex) in visibleColumns" :key="`skel-col-${colIndex}`" :class="getColumnAlignClass(col.align)">
                <!-- Skeleton with realistic alternating dimensions -->
                <div
                  v-if="col.type === 'badge'"
                  class="skeleton"
                  style="height: 20px; width: 65px; border-radius: 10px;"
                ></div>
                <div
                  v-else-if="col.key === 'actions' || col.type === 'actions'"
                  class="d-flex gap-1"
                >
                  <div class="skeleton" style="height: 28px; width: 28px; border-radius: 6px;"></div>
                  <div class="skeleton" style="height: 28px; width: 28px; border-radius: 6px;"></div>
                </div>
                <div v-else>
                  <div
                    class="skeleton mb-1"
                    :style="{
                      height: '14px',
                      width: getSkeletonWidth(colIndex, 1),
                      borderRadius: '4px'
                    }"
                  ></div>
                  <div
                    v-if="colIndex === 0 || colIndex === 1"
                    class="skeleton"
                    :style="{
                      height: '10px',
                      width: getSkeletonWidth(colIndex, 2),
                      borderRadius: '4px'
                    }"
                  ></div>
                </div>
              </td>
            </tr>
          </slot>
        </tbody>

        <!-- Table Body (Data Rows) -->
        <tbody v-else-if="displayData.length">
          <tr
            v-for="(row, rowIndex) in displayData"
            :key="getRowKey(row, rowIndex)"
            :class="[
              isRowSelected(row) ? 'table-active' : '',
              typeof rowClass === 'function' ? rowClass(row, rowIndex) : rowClass
            ]"
            @click="onRowClick(row, rowIndex, $event)"
          >
            <!-- Checkbox Cell -->
            <td v-if="selectable" class="text-center mobile-checkbox-cell" @click.stop>
              <span class="td-label d-md-none">Select Row</span>
              <input
                type="checkbox"
                class="form-check-input"
                :checked="isRowSelected(row)"
                @change="toggleRowSelection(row)"
                aria-label="Select row"
              />
            </td>

            <!-- Data Cells -->
            <td
              v-for="col in visibleColumns"
              :key="col.key"
              :class="[getColumnAlignClass(col.align), col.tdClass]"
              :style="getColumnCellStyle(col)"
            >
              <!-- Responsive Label for Mobile Cards -->
              <span class="td-label">{{ col.label || formatHeaderLabel(col.key) }}</span>

              <!-- Dynamic Slot by column key (e.g. #name, #status, #actions) -->
              <slot
                :name="col.key"
                :item="row"
                :value="getNestedValue(row, col.key)"
                :column="col"
                :index="rowIndex"
              >
                <!-- Alternative slot format: #cell(key) -->
                <slot
                  :name="`cell(${col.key})`"
                  :item="row"
                  :value="getNestedValue(row, col.key)"
                  :column="col"
                  :index="rowIndex"
                >
                  <!-- Built-in Cell Formatters when no slot provided -->

                  <!-- 1. Badge Type -->
                  <span
                    v-if="col.type === 'badge'"
                    :class="['badge', resolveBadgeClass(col, getNestedValue(row, col.key), row)]"
                    style="text-transform: capitalize; font-weight: 600;"
                  >
                    <i v-if="resolveBadgeIcon(col, getNestedValue(row, col.key), row)" :class="[resolveBadgeIcon(col, getNestedValue(row, col.key), row), 'me-1']"></i>
                    {{ formatCellValue(col, getNestedValue(row, col.key), row, rowIndex) }}
                  </span>

                  <!-- 2. Boolean Type -->
                  <span
                    v-else-if="col.type === 'boolean'"
                    :class="['badge', getNestedValue(row, col.key) ? 'badge-completed' : 'badge-cancelled']"
                  >
                    <i :class="getNestedValue(row, col.key) ? 'bi bi-check-circle-fill' : 'bi bi-dash-circle-fill'"></i>
                    {{ getNestedValue(row, col.key) ? (col.trueLabel || 'Active') : (col.falseLabel || 'Inactive') }}
                  </span>

                  <!-- 3. Code Type -->
                  <code v-else-if="col.type === 'code'">{{ getNestedValue(row, col.key) ?? '—' }}</code>

                  <!-- 4. Currency Type -->
                  <span v-else-if="col.type === 'currency'" class="fw-700" style="color:var(--primary);">
                    {{ formatCellValue(col, getNestedValue(row, col.key), row, rowIndex) }}
                  </span>

                  <!-- 5. Default Text / Formatted Value -->
                  <span v-else>
                    {{ formatCellValue(col, getNestedValue(row, col.key), row, rowIndex) }}
                  </span>
                </slot>
              </slot>
            </td>
          </tr>
        </tbody>

        <!-- Empty State Row (Full Width) -->
        <tbody v-else>
          <tr>
            <td :colspan="totalColumnsCount" class="p-0 border-0">
              <slot name="empty">
                <div class="empty-state py-5">
                  <div class="empty-state-icon">
                    <i :class="['bi', emptyIcon]"></i>
                  </div>
                  <span class="empty-state-title">{{ emptyTitle }}</span>
                  <p class="empty-state-desc">{{ emptyDescription }}</p>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Optional Footer / Summary Slot -->
    <slot name="footer"></slot>

    <!-- Pagination Bar -->
    <div
      v-if="pagination && (totalRecords > 0 || !loading)"
      class="data-table-pagination"
      :class="{ 'card-footer': cardWrapper, 'border-top': !cardWrapper }"
    >
      <slot
        name="pagination"
        :current-page="currentPageNum"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="currentPageSize"
        :change-page="changePage"
        :change-page-size="changePageSize"
      >
        <div class="data-table-pagination-inner d-flex justify-content-between align-items-center flex-wrap gap-3">
          <!-- Left: Records Info -->
          <div class="data-table-info text-secondary small">
            Showing <strong class="text-dark">{{ startRecord }}</strong> to
            <strong class="text-dark">{{ endRecord }}</strong> of
            <strong class="text-primary-custom">{{ totalRecords }}</strong> records
          </div>

          <!-- Right: Page Size Selector & Pagination Controls -->
          <div class="data-table-controls d-flex align-items-center gap-3 flex-wrap">
            <!-- Page Size Selector -->
            <div v-if="showPageSize" class="data-table-page-size d-flex align-items-center gap-2">
              <label class="data-table-page-size-label text-secondary small mb-0 fw-medium">Show:</label>
              <select
                :value="currentPageSize"
                class="form-select form-select-sm data-table-page-size-select"
                @change="changePageSize(Number($event.target.value))"
                aria-label="Select rows per page"
              >
                <option v-for="size in pageSizeOptions" :key="size" :value="size">
                  {{ size }}
                </option>
              </select>
            </div>

            <!-- Pagination Buttons -->
            <nav class="data-table-nav d-flex align-items-center gap-1" aria-label="Table pagination">
              <!-- First Page Button -->
              <button
                v-if="totalPages > 2"
                type="button"
                class="btn btn-secondary btn-sm p-1 px-2"
                :disabled="currentPageNum <= 1 || loading"
                @click="changePage(1)"
                title="First Page"
                aria-label="First page"
              >
                <i class="bi bi-chevron-double-left"></i>
              </button>

              <!-- Previous Button -->
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                :disabled="currentPageNum <= 1 || loading"
                @click="changePage(currentPageNum - 1)"
                aria-label="Previous page"
              >
                <i class="bi bi-chevron-left me-1"></i> Prev
              </button>

              <!-- Page Number Pills (Desktop/Tablet) -->
              <div v-if="totalPages > 1" class="d-none d-md-flex align-items-center gap-1">
                <template v-for="(p, pIdx) in paginationPills" :key="`page-${pIdx}`">
                  <span v-if="p === '...'" class="px-2 text-muted small user-select-none">&hellip;</span>
                  <button
                    v-else
                    type="button"
                    class="btn btn-sm"
                    :class="p === currentPageNum ? 'btn-primary' : 'btn-secondary'"
                    style="min-width: 32px; font-size: 0.8rem; font-weight: 600;"
                    @click="changePage(p)"
                  >
                    {{ p }}
                  </button>
                </template>
              </div>

              <!-- Single Page Pill when 1 page -->
              <div v-else class="d-none d-md-flex align-items-center">
                <button
                  type="button"
                  class="btn btn-sm btn-primary"
                  style="min-width: 32px; font-size: 0.8rem; font-weight: 600; pointer-events: none;"
                  disabled
                >
                  1
                </button>
              </div>

              <!-- Current / Total Indicator for Mobile -->
              <span class="d-md-none text-secondary small px-2 fw-medium">
                {{ currentPageNum }} / {{ Math.max(1, totalPages) }}
              </span>

              <!-- Next Button -->
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                :disabled="currentPageNum >= totalPages || loading"
                @click="changePage(currentPageNum + 1)"
                aria-label="Next page"
              >
                Next <i class="bi bi-chevron-right ms-1"></i>
              </button>

              <!-- Last Page Button -->
              <button
                v-if="totalPages > 2"
                type="button"
                class="btn btn-secondary btn-sm p-1 px-2"
                :disabled="currentPageNum >= totalPages || loading"
                @click="changePage(totalPages)"
                title="Last Page"
                aria-label="Last page"
              >
                <i class="bi bi-chevron-double-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useIndianFormat } from '@/composables/useIndianFormat';

const props = defineProps({
  // Columns definition
  columns: {
    type: Array,
    required: true,
    default: () => []
  },
  // Table Data (accepts either 'data' or 'items')
  data: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: null
  },
  // Loading & skeleton state
  loading: {
    type: Boolean,
    default: false
  },
  skeletonRows: {
    type: Number,
    default: 5
  },
  // Error handling
  error: {
    type: [String, Object, Error, Boolean],
    default: null
  },
  errorMessage: {
    type: String,
    default: 'Failed to load records.'
  },
  retryable: {
    type: Boolean,
    default: true
  },
  // Server-side mode
  serverSide: {
    type: Boolean,
    default: false
  },
  // Total record count (required for serverSide pagination)
  total: {
    type: Number,
    default: 0
  },
  // Search
  searchable: {
    type: Boolean,
    default: false
  },
  searchPlaceholder: {
    type: String,
    default: 'Search records...'
  },
  searchDebounce: {
    type: Number,
    default: 300
  },
  search: {
    type: String,
    default: ''
  },
  // Sorting
  sortBy: {
    type: String,
    default: ''
  },
  sortOrder: {
    type: String,
    default: 'asc'
  },
  // Pagination
  pagination: {
    type: Boolean,
    default: false
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 15
  },
  pageSizeOptions: {
    type: Array,
    default: () => [5, 10, 15, 25, 50, 100]
  },
  showPageSize: {
    type: Boolean,
    default: true
  },
  // Selection
  selectable: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Array,
    default: () => []
  },
  selectKey: {
    type: String,
    default: 'id'
  },
  // Visual presentation
  cardWrapper: {
    type: Boolean,
    default: false
  },
  hoverable: {
    type: Boolean,
    default: true
  },
  striped: {
    type: Boolean,
    default: false
  },
  bordered: {
    type: Boolean,
    default: false
  },
  mobileCards: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  showCountBadge: {
    type: Boolean,
    default: true
  },
  emptyTitle: {
    type: String,
    default: 'No records found'
  },
  emptyDescription: {
    type: String,
    default: 'Try adjusting your search or filters.'
  },
  emptyIcon: {
    type: String,
    default: 'bi-inbox'
  },
  rowClass: {
    type: [Function, String],
    default: null
  }
});

const emit = defineEmits([
  'update:search',
  'search',
  'update:sortBy',
  'update:sortOrder',
  'sort',
  'update:currentPage',
  'page-change',
  'update:pageSize',
  'page-size-change',
  'update:selected',
  'selection-change',
  'row-click',
  'retry'
]);

const { formatCurrency, formatDate, formatTime, formatDateTime, formatPhone } = useIndianFormat();

// Resolve raw data from 'data' or 'items' prop
const rawData = computed(() => {
  if (props.items !== null && props.items !== undefined) {
    return Array.isArray(props.items) ? props.items : [];
  }
  return Array.isArray(props.data) ? props.data : [];
});

// Visible columns (filter out invisible ones)
const visibleColumns = computed(() => {
  return props.columns.filter((c) => c && c.visible !== false);
});

const totalColumnsCount = computed(() => {
  return visibleColumns.value.length + (props.selectable ? 1 : 0);
});

// Error message text extraction
const errorMessageText = computed(() => {
  if (typeof props.error === 'string') return props.error;
  if (props.error && typeof props.error === 'object') {
    return props.error.message || props.errorMessage;
  }
  return props.errorMessage;
});

// Internal search state
const internalSearch = ref(props.search);
let searchDebounceTimeout = null;

watch(
  () => props.search,
  (val) => {
    if (val !== internalSearch.value) {
      internalSearch.value = val;
    }
  }
);

const onSearchInput = () => {
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    emit('update:search', internalSearch.value);
    emit('search', internalSearch.value);
    if (!props.serverSide) {
      currentPageNum.value = 1;
    }
  }, props.searchDebounce);
};

const clearSearch = () => {
  internalSearch.value = '';
  emit('update:search', '');
  emit('search', '');
  if (!props.serverSide) {
    currentPageNum.value = 1;
  }
};

// Internal Sort state
const currentSortBy = ref(props.sortBy);
const currentSortOrder = ref(props.sortOrder || 'asc');

watch(
  () => props.sortBy,
  (val) => {
    currentSortBy.value = val;
  }
);

watch(
  () => props.sortOrder,
  (val) => {
    currentSortOrder.value = val || 'asc';
  }
);

const handleSort = (col) => {
  const sortKey = col.sortKey || col.key;
  if (!sortKey) return;

  if (currentSortBy.value === sortKey) {
    currentSortOrder.value = currentSortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    currentSortBy.value = sortKey;
    currentSortOrder.value = 'asc';
  }

  emit('update:sortBy', currentSortBy.value);
  emit('update:sortOrder', currentSortOrder.value);
  emit('sort', {
    sortBy: currentSortBy.value,
    sortOrder: currentSortOrder.value
  });

  if (!props.serverSide) {
    currentPageNum.value = 1;
  }
};

// Internal Pagination state
const currentPageNum = ref(props.currentPage || 1);
const currentPageSize = ref(props.pageSize || 15);

watch(
  () => props.currentPage,
  (val) => {
    if (val && val !== currentPageNum.value) {
      currentPageNum.value = val;
    }
  }
);

watch(
  () => props.pageSize,
  (val) => {
    if (val && val !== currentPageSize.value) {
      currentPageSize.value = val;
    }
  }
);

const changePage = (page) => {
  if (page < 1 || (totalPages.value && page > totalPages.value)) return;
  currentPageNum.value = page;
  emit('update:currentPage', page);
  emit('page-change', page);
};

const changePageSize = (size) => {
  currentPageSize.value = size;
  currentPageNum.value = 1;
  emit('update:pageSize', size);
  emit('page-size-change', size);
  emit('update:currentPage', 1);
  emit('page-change', 1);
};

// Helper to access nested property safely: e.g. "assigned_user.name"
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  if (path in obj) return obj[path];
  const keys = String(path).split('.');
  let current = obj;
  for (const k of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[k];
  }
  return current;
};

// Client-side filtering & sorting logic (when not serverSide)
const filteredData = computed(() => {
  const data = rawData.value;
  if (props.serverSide) return data;

  let result = [...data];

  // 1. Client Search Filter
  const query = internalSearch.value ? internalSearch.value.trim().toLowerCase() : '';
  if (query) {
    result = result.filter((row) => {
      // Search in visible columns or all keys
      return visibleColumns.value.some((col) => {
        const val = getNestedValue(row, col.key);
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }

  // 2. Client Sorting
  if (currentSortBy.value) {
    const key = currentSortBy.value;
    const isAsc = currentSortOrder.value === 'asc';

    result.sort((a, b) => {
      let valA = getNestedValue(a, key);
      let valB = getNestedValue(b, key);

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      // Number comparison
      if (typeof valA === 'number' && typeof valB === 'number') {
        return isAsc ? valA - valB : valB - valA;
      }

      // Date comparison
      const dateA = new Date(valA);
      const dateB = new Date(valB);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime()) && typeof valA !== 'number') {
        return isAsc ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      }

      // String comparison
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return isAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }

  return result;
});

// Total records count
const totalRecords = computed(() => {
  if (props.serverSide) {
    return Number(props.total) || 0;
  }
  return filteredData.value.length;
});

// Total Pages
const totalPages = computed(() => {
  if (!props.pagination) return 1;
  const size = currentPageSize.value || 15;
  return Math.ceil(totalRecords.value / size) || 1;
});

// Start & End Record counts for pagination info
const startRecord = computed(() => {
  if (totalRecords.value === 0) return 0;
  return (currentPageNum.value - 1) * currentPageSize.value + 1;
});

const endRecord = computed(() => {
  if (totalRecords.value === 0) return 0;
  return Math.min(currentPageNum.value * currentPageSize.value, totalRecords.value);
});

// Sliced data for display (if client pagination enabled)
const displayData = computed(() => {
  if (props.serverSide || !props.pagination) {
    return filteredData.value;
  }
  const start = (currentPageNum.value - 1) * currentPageSize.value;
  const end = start + currentPageSize.value;
  return filteredData.value.slice(start, end);
});

// Smart pagination pills: [1, 2, '...', 5, 6, 7, '...', 12]
const paginationPills = computed(() => {
  const current = currentPageNum.value;
  const total = totalPages.value;
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pills = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pills.push(i);
    pills.push('...');
    pills.push(total);
  } else if (current >= total - 3) {
    pills.push(1);
    pills.push('...');
    for (let i = total - 4; i <= total; i++) pills.push(i);
  } else {
    pills.push(1);
    pills.push('...');
    pills.push(current - 1);
    pills.push(current);
    pills.push(current + 1);
    pills.push('...');
    pills.push(total);
  }
  return pills;
});

// Selection Logic
const selectedRows = computed({
  get: () => props.selected || [],
  set: (val) => {
    emit('update:selected', val);
    emit('selection-change', val);
  }
});

const getRowKey = (row, index) => {
  if (!row) return index;
  return row[props.selectKey] !== undefined ? row[props.selectKey] : index;
};

const isRowSelected = (row) => {
  if (!row) return false;
  const key = props.selectKey;
  const target = row[key] !== undefined ? row[key] : row;
  return selectedRows.value.some((item) => {
    const itemTarget = item && item[key] !== undefined ? item[key] : item;
    return itemTarget === target;
  });
};

const isAllSelected = computed(() => {
  if (!displayData.value.length) return false;
  return displayData.value.every((row) => isRowSelected(row));
});

const isIndeterminate = computed(() => {
  if (!displayData.value.length) return false;
  const selectedOnPage = displayData.value.filter((row) => isRowSelected(row));
  return selectedOnPage.length > 0 && selectedOnPage.length < displayData.value.length;
});

const toggleSelectAll = (checked) => {
  const key = props.selectKey;
  let newSelected = [...selectedRows.value];

  if (checked) {
    // Add all current page items not already selected
    displayData.value.forEach((row) => {
      const target = row[key] !== undefined ? row[key] : row;
      const exists = newSelected.some((item) => {
        const itemTarget = item && item[key] !== undefined ? item[key] : item;
        return itemTarget === target;
      });
      if (!exists) {
        newSelected.push(row);
      }
    });
  } else {
    // Remove all current page items
    const pageKeys = new Set(displayData.value.map((r) => (r[key] !== undefined ? r[key] : r)));
    newSelected = newSelected.filter((item) => {
      const itemTarget = item && item[key] !== undefined ? item[key] : item;
      return !pageKeys.has(itemTarget);
    });
  }

  selectedRows.value = newSelected;
};

const toggleRowSelection = (row) => {
  const key = props.selectKey;
  const target = row[key] !== undefined ? row[key] : row;
  let newSelected = [...selectedRows.value];

  const index = newSelected.findIndex((item) => {
    const itemTarget = item && item[key] !== undefined ? item[key] : item;
    return itemTarget === target;
  });

  if (index >= 0) {
    newSelected.splice(index, 1);
  } else {
    newSelected.push(row);
  }

  selectedRows.value = newSelected;
};

const clearSelection = () => {
  selectedRows.value = [];
};

// Row click handler
const onRowClick = (item, index, event) => {
  // Ignore clicks on buttons, links, inputs, icons inside buttons
  if (event.target.closest('button, a, input, select, textarea, .dropdown-menu')) {
    return;
  }
  emit('row-click', { item, index, event });
};

const onRetry = () => {
  emit('retry');
};

// Alignment helper
const getColumnAlignClass = (align) => {
  if (align === 'center') return 'text-center';
  if (align === 'end' || align === 'right') return 'text-end';
  return 'text-start';
};

// Header style helper
const getColumnHeaderStyle = (col) => {
  const style = {};
  if (col.width) style.width = col.width;
  if (col.minWidth) style.minWidth = col.minWidth;
  return style;
};

// Cell style helper (width & minWidth)
const getColumnCellStyle = (col) => {
  const style = {};
  if (col.width) style.width = col.width;
  if (col.minWidth) style.minWidth = col.minWidth;
  return style;
};

// Humanize key for label: 'first_name' -> 'First Name'
const formatHeaderLabel = (key) => {
  if (!key) return '';
  const lastPart = key.split('.').pop();
  return lastPart
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
};

// Skeleton width randomizer for natural shimmer
const getSkeletonWidth = (colIdx, line) => {
  const widths = ['85%', '70%', '55%', '90%', '60%', '75%'];
  const offset = (colIdx * 2 + line) % widths.length;
  return widths[offset];
};

// Cell Value Formatter
const formatCellValue = (col, value, row, index) => {
  if (col.formatter && typeof col.formatter === 'function') {
    return col.formatter(value, row, index);
  }
  if (value === null || value === undefined) return '—';

  switch (col.type) {
    case 'currency':
      return formatCurrency(value);
    case 'date':
      return formatDate(value);
    case 'datetime':
      return formatDateTime(value);
    case 'time':
      return formatTime(value);
    case 'phone':
      return formatPhone(value);
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value;
    default:
      return value;
  }
};

// Badge Class Resolver
const resolveBadgeClass = (col, value, row) => {
  if (typeof col.badgeClass === 'function') {
    return col.badgeClass(value, row);
  }
  if (col.badgeClass && typeof col.badgeClass === 'object') {
    return col.badgeClass[value] || 'badge-low';
  }
  if (typeof col.badgeClass === 'string') {
    return col.badgeClass;
  }
  return value ? `badge-${String(value).toLowerCase().replace(/\s+/g, '-')}` : 'badge-low';
};

// Badge Icon Resolver
const resolveBadgeIcon = (col, value, row) => {
  if (typeof col.badgeIcon === 'function') {
    return col.badgeIcon(value, row);
  }
  if (col.badgeIcon && typeof col.badgeIcon === 'object') {
    return col.badgeIcon[value] || '';
  }
  if (typeof col.badgeIcon === 'string') {
    return col.badgeIcon;
  }
  return '';
};
</script>

<style scoped>
.data-table-wrapper {
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  width: 100%;
  max-width: 100%;
  transition: box-shadow 0.2s ease;
}

.data-table-wrapper.card {
  border: 1px solid var(--border-color) !important;
}

.data-table-toolbar {
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
}

.data-table-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.data-table-search {
  min-width: 220px;
  max-width: 320px;
}

.sortable-th {
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.sortable-th:hover {
  background-color: #edf2f7 !important;
  color: var(--primary) !important;
}

.sortable-th:hover .sort-icon-box i {
  color: var(--primary) !important;
  opacity: 1 !important;
}

.sort-icon-box {
  display: inline-flex;
  align-items: center;
  font-size: 0.85em;
}

.data-table-loading {
  pointer-events: none;
  opacity: 0.85;
}

.skeleton-row td {
  padding: 0.875rem 1rem;
  vertical-align: middle;
}

.data-table-bulk-bar {
  animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Pagination Bar & Page Size Selector Styles */
.data-table-pagination {
  background-color: #ffffff;
  border-top: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
}

.data-table-info {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.data-table-page-size-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.data-table-page-size-select {
  width: auto !important;
  min-width: 72px !important;
  height: 32px !important;
  padding: 0.25rem 2rem 0.25rem 0.75rem !important;
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  color: var(--text-primary) !important;
  background-color: #ffffff !important;
  background-position: right 0.65rem center !important;
  background-size: 14px 10px !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--radius-sm) !important;
  line-height: 1.4 !important;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.data-table-page-size-select:hover {
  border-color: #94a3b8 !important;
}

.data-table-page-size-select:focus {
  border-color: var(--primary) !important;
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
}

.data-table-nav .btn {
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.data-table-nav .btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .data-table-pagination-inner {
    flex-direction: column !important;
    align-items: center !important;
    gap: 0.75rem !important;
    text-align: center;
  }

  .data-table-controls {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .data-table-info {
    text-align: center;
    width: 100%;
  }

  .data-table-search {
    min-width: 100%;
    max-width: 100%;
    width: 100%;
  }

  .data-table-toolbar > div {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
  }
}

@media (max-width: 576px) {
  .data-table-controls {
    flex-direction: column !important;
    gap: 0.65rem !important;
  }

  .data-table-page-size {
    justify-content: center;
    width: 100%;
  }

  .data-table-nav {
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
