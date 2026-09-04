import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Layouts
import AuthLayout from '@/layouts/AuthLayout.vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

// Auth Pages
import Login from '@/pages/auth/Login.vue';

// Core Business Pages
import Dashboard from '@/pages/dashboard/Dashboard.vue';
import LeadList from '@/pages/leads/LeadList.vue';
import LeadCreate from '@/pages/leads/LeadCreate.vue';
import LeadEdit from '@/pages/leads/LeadEdit.vue';
import LeadDetails from '@/pages/leads/LeadDetails.vue';
import Pipeline from '@/pages/pipeline/Pipeline.vue';
import FollowUpList from '@/pages/followups/FollowUpList.vue';
import ActivityList from '@/pages/activities/ActivityList.vue';

// Settings Pages
import Company from '@/pages/settings/Company.vue';
import Users from '@/pages/settings/Users.vue';
import RolesPermissions from '@/pages/settings/RolesPermissions.vue';
import Sources from '@/pages/settings/Sources.vue';
import Statuses from '@/pages/settings/Statuses.vue';
import Stages from '@/pages/settings/Stages.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login,
        meta: { guestOnly: true }
      }
    ]
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '📊 Sales Dashboard' }
      },
      {
        path: 'leads',
        name: 'Leads',
        component: LeadList,
        meta: { title: '👥 Leads Management', permission: ['view leads', 'view all leads', 'view own leads'] }
      },
      {
        path: 'leads/create',
        name: 'LeadCreate',
        component: LeadCreate,
        meta: { title: '➕ Add New Lead', permission: 'create leads' }
      },
      {
        path: 'leads/:id',
        name: 'LeadDetails',
        component: LeadDetails,
        meta: { title: '📄 Lead 360° Details', permission: ['view leads', 'view all leads', 'view own leads'] }
      },
      {
        path: 'leads/:id/edit',
        name: 'LeadEdit',
        component: LeadEdit,
        meta: { title: '✏️ Edit Lead', permission: 'edit leads' }
      },
      {
        path: 'pipeline',
        name: 'Pipeline',
        component: Pipeline,
        meta: { title: '🎯 Sales Pipeline Kanban', permission: 'manage pipeline' }
      },
      {
        path: 'follow-ups',
        name: 'FollowUps',
        component: FollowUpList,
        meta: { title: '📅 Follow-ups Schedule', permission: 'manage follow-ups' }
      },
      {
        path: 'activities',
        name: 'Activities',
        component: ActivityList,
        meta: { title: '🕒 Activity Log' }
      },
      {
        path: 'settings/company',
        name: 'CompanySettings',
        component: Company,
        meta: { title: '🏢 Company Profile Settings', permission: 'manage settings' }
      },
      {
        path: 'settings/users',
        name: 'UserSettings',
        component: Users,
        meta: { title: '👥 Manage Team Users', permission: 'manage users' }
      },
      {
        path: 'settings/roles',
        name: 'RolesPermissionsSettings',
        component: RolesPermissions,
        meta: { title: '🛡️ Roles & Permissions', permission: 'manage users' }
      },
      {
        path: 'settings/sources',
        name: 'SourceSettings',
        component: Sources,
        meta: { title: '🔗 Lead Sources Settings', permission: 'manage settings' }
      },
      {
        path: 'settings/statuses',
        name: 'StatusSettings',
        component: Statuses,
        meta: { title: '📈 Lead Statuses Settings', permission: 'manage settings' }
      },
      {
        path: 'settings/stages',
        name: 'StageSettings',
        component: Stages,
        meta: { title: '🏁 Pipeline Stages Settings', permission: 'manage settings' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Guard checks
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next('/dashboard');
  } else if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
