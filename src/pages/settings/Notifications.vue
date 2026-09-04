<template>
  <div class="d-flex flex-column gap-4">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-bell-fill"></i>
          Notification Preferences
        </h2>
        <p class="page-header-sub">Configure in-app and browser notifications for lead assignments and task reminders</p>
      </div>
    </div>

    <!-- Notification Settings Card -->
    <div class="card">
      <div class="card-body">
        <h3 class="card-title mb-3">Alert Channels</h3>

        <div class="d-flex flex-column gap-4">
          <!-- In-App Reminders -->
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 border-bottom">
            <div>
              <div class="fw-700 text-dark">In-App Banner &amp; Toast Alerts</div>
              <p style="font-size:0.875rem;color:var(--text-secondary);margin:0;">
                Show real-time toast alerts when follow-ups are due and leads are assigned.
              </p>
            </div>
            <div class="form-check form-switch fs-5">
              <input v-model="settings.inApp" type="checkbox" class="form-check-input" />
            </div>
          </div>

          <!-- Browser Push Notifications -->
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 border-bottom">
            <div>
              <div class="fw-700 text-dark">Desktop / Browser Notifications</div>
              <p style="font-size:0.875rem;color:var(--text-secondary);margin:0;">
                Deliver browser desktop notifications 15 minutes before scheduled calls or meetings.
              </p>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button
                v-if="!browserPermissionGranted"
                @click="requestBrowserPermission"
                class="btn btn-secondary btn-sm"
              >
                <i class="bi bi-shield-check"></i> Request Permission
              </button>
              <div class="form-check form-switch fs-5">
                <input v-model="settings.browser" type="checkbox" class="form-check-input" />
              </div>
            </div>
          </div>

          <!-- Lead Assignment -->
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 border-bottom">
            <div>
              <div class="fw-700 text-dark">New Lead Assignment Reminders</div>
              <p style="font-size:0.875rem;color:var(--text-secondary);margin:0;">
                Alert sales executive immediately when a new prospective lead is assigned to them.
              </p>
            </div>
            <div class="form-check form-switch fs-5">
              <input v-model="settings.leadAssignment" type="checkbox" class="form-check-input" />
            </div>
          </div>

          <!-- Daily Overdue Summary -->
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div class="fw-700 text-dark">Daily Overdue Digest</div>
              <p style="font-size:0.875rem;color:var(--text-secondary);margin:0;">
                Prompt sales executives upon login if overdue tasks remain incomplete.
              </p>
            </div>
            <div class="form-check form-switch fs-5">
              <input v-model="settings.overdueSummary" type="checkbox" class="form-check-input" />
            </div>
          </div>
        </div>

        <div class="mt-4 text-end">
          <button @click="savePreferences" class="btn btn-primary">
            <i class="bi bi-floppy"></i> Save Preferences
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useToast } from '@/composables/useToast';

const toast = useToast();
const browserPermissionGranted = ref(false);

const settings = reactive({
  inApp: true,
  browser: true,
  leadAssignment: true,
  overdueSummary: true
});

onMounted(() => {
  if ('Notification' in window) {
    browserPermissionGranted.value = Notification.permission === 'granted';
  }
});

const requestBrowserPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      browserPermissionGranted.value = true;
      toast.success('Browser notification permission granted.');
    } else {
      toast.error('Permission denied by browser.');
    }
  } else {
    toast.error('Browser does not support notifications.');
  }
};

const savePreferences = () => {
  toast.success('Notification preferences saved successfully.');
};
</script>
