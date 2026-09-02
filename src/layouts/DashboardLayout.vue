<template>
  <div class="app-layout">
    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
      style="position:fixed;inset:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(2px);z-index:1045;"
    ></div>

    <!-- Sidebar -->
    <aside :class="['sidebar', { open: sidebarOpen }]">
      <!-- Brand -->
      <div class="sidebar-brand">
        <img src="@/assets/convera-icon-color.svg" alt="Convera" style="width:34px;height:34px;border-radius:9px;box-shadow:0 3px 10px rgba(67,56,202,0.4);" />
        <div class="brand-text">
          <span>Convera</span>
          <span class="brand-sub">WhatsApp Sales Suite</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-menu">
        <router-link to="/dashboard" class="menu-item" active-class="active" @click="sidebarOpen = false">
          <span class="menu-icon"><i class="bi bi-grid-1x2-fill"></i></span>
          <span>Dashboard</span>
        </router-link>

        <router-link
          v-if="canAny(['view leads', 'view all leads', 'view own leads'])"
          to="/leads"
          class="menu-item"
          active-class="active"
          @click="sidebarOpen = false"
        >
          <span class="menu-icon"><i class="bi bi-people-fill"></i></span>
          <span>Leads</span>
        </router-link>

        <router-link
          v-if="can('manage follow-ups')"
          to="/follow-ups"
          class="menu-item"
          active-class="active"
          @click="sidebarOpen = false"
        >
          <span class="menu-icon"><i class="bi bi-calendar-event-fill"></i></span>
          <span>Follow-ups</span>
        </router-link>

        <router-link
          v-if="can('manage pipeline')"
          to="/pipeline"
          class="menu-item"
          active-class="active"
          @click="sidebarOpen = false"
        >
          <span class="menu-icon"><i class="bi bi-kanban-fill"></i></span>
          <span>Pipeline</span>
        </router-link>

        <router-link
          v-if="can('manage WhatsApp')"
          to="/whatsapp/inbox"
          class="menu-item"
          active-class="active"
          @click="sidebarOpen = false"
        >
          <span class="menu-icon"><i class="bi bi-whatsapp"></i></span>
          <span>WhatsApp Chat</span>
        </router-link>

        <!-- Configuration Section (Only shown if user has any configuration permission) -->
        <template v-if="canAny(['manage WhatsApp', 'manage settings', 'manage users'])">
          <div class="menu-divider"></div>
          <div class="menu-header">Configuration</div>

          <router-link
            v-if="canAny(['manage WhatsApp', 'manage settings'])"
            to="/whatsapp/templates"
            class="menu-item"
            active-class="active"
            @click="sidebarOpen = false"
          >
            <span class="menu-icon"><i class="bi bi-file-earmark-text-fill"></i></span>
            <span>Templates</span>
          </router-link>

          <router-link
            v-if="can('manage users')"
            to="/settings/users"
            class="menu-item"
            active-class="active"
            @click="sidebarOpen = false"
          >
            <span class="menu-icon"><i class="bi bi-person-badge-fill"></i></span>
            <span>Team Members</span>
          </router-link>

          <router-link
            v-if="can('manage users')"
            to="/settings/roles"
            class="menu-item"
            active-class="active"
            @click="sidebarOpen = false"
          >
            <span class="menu-icon"><i class="bi bi-shield-lock-fill"></i></span>
            <span>Roles & Permissions</span>
          </router-link>

          <router-link
            v-if="can('manage settings')"
            to="/settings/company"
            class="menu-item"
            active-class="active"
            @click="sidebarOpen = false"
          >
            <span class="menu-icon"><i class="bi bi-buildings-fill"></i></span>
            <span>Company Settings</span>
          </router-link>

          <router-link
            v-if="can('manage settings')"
            to="/settings/sources"
            class="menu-item"
            active-class="active"
            @click="sidebarOpen = false"
          >
            <span class="menu-icon"><i class="bi bi-funnel-fill"></i></span>
            <span>Lead Sources</span>
          </router-link>

          <router-link
            v-if="can('manage settings')"
            to="/settings/statuses"
            class="menu-item"
            active-class="active"
            @click="sidebarOpen = false"
          >
            <span class="menu-icon"><i class="bi bi-tags-fill"></i></span>
            <span>Lead Statuses</span>
          </router-link>

          <router-link
            v-if="can('manage settings')"
            to="/settings/stages"
            class="menu-item"
            active-class="active"
            @click="sidebarOpen = false"
          >
            <span class="menu-icon"><i class="bi bi-flag-fill"></i></span>
            <span>Pipeline Stages</span>
          </router-link>
        </template>
      </nav>

      <!-- User Footer -->
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">{{ userInitials }}</div>
          <div class="user-details">
            <span class="user-name">{{ currentUser?.name || 'User' }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
        </div>
        <button class="logout-btn" title="Sign out" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-wrapper">
      <!-- Top Header -->
      <header class="top-header">
        <div class="d-flex align-items-center gap-3">
          <button class="mobile-header-toggle" @click="sidebarOpen = !sidebarOpen" aria-label="Toggle sidebar">
            <i class="bi bi-list"></i>
          </button>
          <div class="header-title">
            <h1>{{ pageTitle }}</h1>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="company-badge d-none d-sm-inline-flex">
            <i class="bi bi-building"></i>
            {{ currentUser?.company?.name || 'Convera' }}
          </span>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-container">
        <!-- Toast Notifications -->
        <div class="toast-container">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            :class="['toast', `toast-${toast.type}`]"
          >
            <div class="d-flex align-items-center gap-2">
              <i v-if="toast.type === 'success'" class="bi bi-check-circle-fill text-won"></i>
              <i v-else-if="toast.type === 'danger'" class="bi bi-exclamation-triangle-fill text-danger-custom"></i>
              <i v-else-if="toast.type === 'warning'" class="bi bi-exclamation-circle-fill text-warning"></i>
              <i v-else class="bi bi-info-circle-fill text-primary-custom"></i>
              <span>{{ toast.message }}</span>
            </div>
            <button
              @click="removeToast(toast.id)"
              style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:1.1rem;line-height:1;padding:0;opacity:0.7;"
            ><i class="bi bi-x"></i></button>
          </div>
        </div>

        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePermissions } from '@/composables/usePermissions';
import { useToast } from '@/composables/useToast';
import { useSwal } from '@/composables/useSwal';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { can, canAny } = usePermissions();
const { toasts, removeToast } = useToast();
const { confirmLogout } = useSwal();

const sidebarOpen = ref(false);

const currentUser = computed(() => authStore.user);
const userRole = computed(() => authStore.userRole);

const userInitials = computed(() => {
  if (!currentUser.value?.name) return 'U';
  return currentUser.value.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
});

const pageTitle = computed(() => {
  const metaTitle = route.meta?.title;
  return metaTitle || 'CRM';
});

onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      await authStore.fetchUser();
    } catch (e) {
      console.warn('Could not sync user profile', e);
    }
  }
});

const handleLogout = async () => {
  const confirmed = await confirmLogout();
  if (confirmed) {
    await authStore.logout();
    router.push('/login');
  }
};
</script>
