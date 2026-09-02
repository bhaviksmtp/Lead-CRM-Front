<template>
  <div class="d-flex flex-column gap-4">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-buildings-fill"></i>
          Company Settings
        </h2>
        <p class="page-header-sub">Manage your business profile and local deployment configuration</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-flex flex-column align-items-center py-5 gap-3">
      <div class="spinner-custom"></div>
      <p style="color:var(--text-secondary);font-size:0.875rem;">Loading company settings...</p>
    </div>

    <form v-else @submit.prevent="updateCompany">
      <div class="row g-4">
        <div class="col-12 col-lg-8">
          <div class="card">
            <div class="card-header">
              <i class="bi bi-building"></i>
              Business Profile
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label" for="company-name">Business Name *</label>
                <input
                  id="company-name"
                  v-model="form.name"
                  type="text"
                  :class="['form-control', { 'is-invalid': validationErrors.name }]"
                  @input="clearError('name')"
                  required
                />
                <div v-if="validationErrors.name" class="invalid-feedback">{{ validationErrors.name[0] }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="company-email">Email Address *</label>
                <input
                  id="company-email"
                  v-model="form.email"
                  type="email"
                  :class="['form-control', { 'is-invalid': validationErrors.email }]"
                  @input="clearError('email')"
                  required
                />
                <div v-if="validationErrors.email" class="invalid-feedback">{{ validationErrors.email[0] }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="company-phone">Contact Phone</label>
                <input
                  id="company-phone"
                  v-model="form.phone"
                  type="text"
                  :class="['form-control', { 'is-invalid': validationErrors.phone }]"
                  @input="clearError('phone')"
                />
                <div v-if="validationErrors.phone" class="invalid-feedback">{{ validationErrors.phone[0] }}</div>
              </div>

              <div class="row g-3 mb-0">
                <div class="col-6">
                  <label class="form-label" for="company-country">Country Code</label>
                  <input id="company-country" v-model="form.country" type="text" class="form-control" readonly />
                </div>
                <div class="col-6">
                  <label class="form-label" for="company-timezone">Default Timezone</label>
                  <input id="company-timezone" v-model="form.timezone" type="text" class="form-control" readonly />
                </div>
              </div>
            </div>
            <div class="card-footer d-flex justify-content-end">
              <button type="submit" class="btn btn-primary" :disabled="saving" id="save-company-btn">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" style="border-color:rgba(255,255,255,0.4);border-top-color:#fff;" role="status"></span>
                <span v-if="saving">Saving...</span>
                <span v-else>
                  <i class="bi bi-floppy"></i> Update Profile
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Info Panel -->
        <div class="col-12 col-lg-4">
          <div class="card">
            <div class="card-header">
              <i class="bi bi-info-circle-fill"></i>
              Configuration Info
            </div>
            <div class="card-body d-flex flex-column gap-3" style="font-size:0.875rem;">
              <div>
                <span class="info-label">Region</span>
                <p style="color:var(--text-primary);margin:0;font-weight:500;">India (IN)</p>
              </div>
              <div>
                <span class="info-label">Timezone</span>
                <p style="color:var(--text-primary);margin:0;font-weight:500;">Asia/Kolkata (IST +05:30)</p>
              </div>
              <div>
                <span class="info-label">Currency</span>
                <p style="color:var(--text-primary);margin:0;font-weight:500;">Indian Rupee (₹ INR)</p>
              </div>
              <div style="padding:0.75rem;background:var(--bg-tertiary);border-radius:var(--radius-md);border:1px solid var(--border-color);" class="mt-2">
                <p style="font-size:0.8rem;color:var(--text-secondary);margin:0;line-height:1.6;">
                  Country and timezone settings are fixed for this deployment. Contact support to change region-specific configurations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useToast } from '@/composables/useToast';
import api from '@/api/axios';

const toast = useToast();

const loading = ref(true);
const saving = ref(false);
const validationErrors = ref({});

const clearError = (field) => {
  if (validationErrors.value[field]) {
    delete validationErrors.value[field];
  }
};

const form = reactive({
  name: '',
  email: '',
  phone: '',
  country: 'IN',
  timezone: 'Asia/Kolkata'
});

const loadCompany = async () => {
  try {
    const response = await api.get('/company');
    const company = response.data.company;

    if (company) {
      form.name = company.name || '';
      form.email = company.email || '';
      form.phone = company.phone || '';
      form.country = company.country || 'IN';
      form.timezone = company.timezone || 'Asia/Kolkata';
    }
  } catch (err) {
    // Fallback to user company data if available
    try {
      const userRes = await api.get('/user');
      const user = userRes.data.user;
      if (user?.company) {
        form.name = user.company.name || '';
        form.email = user.company.email || '';
        form.phone = user.company.phone || '';
      }
    } catch {
      toast.error('Failed to load company profile.');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCompany();
});

const updateCompany = async () => {
  saving.value = true;
  validationErrors.value = {};
  try {
    const response = await api.put('/company', {
      name: form.name,
      email: form.email,
      phone: form.phone,
    });
    if (response.data?.company) {
      form.name = response.data.company.name;
      form.email = response.data.company.email;
      form.phone = response.data.company.phone;
    }
    toast.success('Company profile updated successfully.');
  } catch (err) {
    if (err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors;
      const firstMsg = Object.values(err.response.data.errors).flat()[0];
      toast.error(firstMsg || 'Failed to save company settings.');
    } else {
      toast.error(err.response?.data?.message || err.message || 'Failed to save company settings.');
    }
  } finally {
    saving.value = false;
  }
};
</script>
