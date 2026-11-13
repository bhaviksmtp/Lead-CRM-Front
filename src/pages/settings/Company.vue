<template>
  <div class="d-flex flex-column gap-4">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-header-title">
          <i class="bi bi-buildings-fill"></i>
          Company &amp; WhatsApp Settings
        </h2>
        <p class="page-header-sub">Configure your corporate identity and Meta WhatsApp Cloud API integration</p>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="card p-4">
      <div class="skeleton mb-4" style="height: 20px; width: 140px;"></div>
      <div v-for="i in 3" :key="i" class="mb-3">
        <div class="skeleton mb-2" style="height: 12px; width: 100px;"></div>
        <div class="skeleton" style="height: 38px; width: 100%; border-radius: 8px;"></div>
      </div>
    </div>

    <form v-else @submit.prevent="updateCompany">
      <div class="row g-4">
        <!-- LEFT: Business Profile & WhatsApp Configuration -->
        <div class="col-12 col-lg-8 d-flex flex-column gap-4">
          <!-- Card 1: Business Profile -->
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
                <label class="form-label" for="company-phone">Primary Contact Phone</label>
                <input
                  id="company-phone"
                  v-model="form.phone"
                  type="text"
                  :class="['form-control', { 'is-invalid': validationErrors.phone }]"
                  placeholder="e.g. +91 98765 43210"
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
          </div>

          <!-- Card 2: Meta WhatsApp Cloud API Integration -->
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-whatsapp text-whatsapp fs-5"></i>
                <span class="fw-700">Meta WhatsApp Business Cloud API Configuration</span>
              </div>
              <button
                type="button"
                @click="testWhatsAppConnection"
                class="btn btn-secondary btn-sm"
                :disabled="testingConnection || !form.whatsapp_phone_number_id"
              >
                <span v-if="testingConnection" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <i v-else class="bi bi-activity text-success me-1"></i>
                {{ testingConnection ? 'Pinging Meta API...' : 'Test Connection' }}
              </button>
            </div>
            <div class="card-body">
              <!-- Connection Alert Status Banner -->
              <div
                v-if="connectionStatus"
                :class="['p-3 rounded mb-3 border d-flex align-items-start gap-2', connectionStatus.connected ? 'bg-success-subtle border-success-subtle text-success-emphasis' : 'bg-warning-subtle border-warning-subtle text-warning-emphasis']"
              >
                <i :class="connectionStatus.connected ? 'bi bi-check-circle-fill text-success fs-5' : 'bi bi-exclamation-triangle-fill text-warning fs-5'"></i>
                <div class="flex-grow-1" style="font-size:0.875rem;">
                  <strong class="d-block">{{ connectionStatus.connected ? 'Connected to Meta WhatsApp Cloud API' : 'Connection Incomplete / Error' }}</strong>
                  <span>{{ connectionStatus.message || (connectionStatus.connected ? `Verified Account: ${connectionStatus.verified_name} (${connectionStatus.display_phone_number}) — Quality: ${connectionStatus.quality_rating}` : '') }}</span>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-12 col-md-6">
                  <label class="form-label" for="whatsapp-phone-id">
                    WhatsApp Phone Number ID *
                    <small class="text-muted">(From Meta App Dashboard)</small>
                  </label>
                  <input
                    id="whatsapp-phone-id"
                    v-model="form.whatsapp_phone_number_id"
                    type="text"
                    class="form-control"
                    placeholder="e.g. 104859284950291"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label" for="whatsapp-waba-id">
                    WhatsApp Business Account ID (WABA ID)
                  </label>
                  <input
                    id="whatsapp-waba-id"
                    v-model="form.whatsapp_business_id"
                    type="text"
                    class="form-control"
                    placeholder="e.g. 984729104857201"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="whatsapp-number">
                  Public WhatsApp Display Number
                </label>
                <input
                  id="whatsapp-number"
                  v-model="form.whatsapp_number"
                  type="text"
                  class="form-control"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div class="mb-3">
                <label class="form-label" for="whatsapp-token">
                  Permanent Meta System User Access Token
                  <span v-if="hasExistingToken" class="badge bg-success-subtle text-success border border-success-subtle ms-1">Token Saved</span>
                </label>
                <div class="input-group">
                  <input
                    id="whatsapp-token"
                    v-model="form.whatsapp_access_token"
                    :type="showToken ? 'text' : 'password'"
                    class="form-control"
                    :placeholder="hasExistingToken ? '•••••••••••••••••••••••••••••••• (Leave blank to keep current token)' : 'EAABwz... (Paste Meta Permanent Token)'"
                  />
                  <button type="button" @click="showToken = !showToken" class="btn btn-secondary">
                    <i :class="showToken ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <small class="text-muted d-block mt-1" style="font-size:0.75rem;">
                  Generate a Permanent System User Token in Meta Business Manager with permissions: <code>whatsapp_business_messaging</code> and <code>whatsapp_business_management</code>.
                </small>
              </div>

              <!-- Webhook Configuration -->
              <div class="p-3 rounded mt-3" style="background:var(--bg-tertiary);border:1px solid var(--border-color);">
                <div class="fw-700 text-dark mb-2">
                  <i class="bi bi-link-45deg text-primary me-1"></i>
                  Meta Webhook Callback Settings
                </div>
                <div class="mb-3">
                  <label class="form-label small text-secondary">Callback URL (Paste into Meta Dashboard):</label>
                  <div class="input-group">
                    <input type="text" class="form-control bg-light" :value="webhookUrl" readonly />
                    <button type="button" @click="copyToClipboard(webhookUrl, 'Webhook URL')" class="btn btn-secondary btn-sm">
                      <i class="bi bi-clipboard"></i> Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label class="form-label small text-secondary">Webhook Verify Token:</label>
                  <div class="input-group">
                    <input
                      v-model="form.whatsapp_webhook_verify_token"
                      type="text"
                      class="form-control bg-white"
                      placeholder="e.g. convera_crm_webhook_verify_secret"
                    />
                    <button type="button" @click="copyToClipboard(form.whatsapp_webhook_verify_token, 'Verify Token')" class="btn btn-secondary btn-sm">
                      <i class="bi bi-clipboard"></i> Copy
                    </button>
                  </div>
                  <small class="text-muted d-block mt-1" style="font-size:0.75rem;">
                    Must match the Verify Token string you enter in Meta Developers App Dashboard &gt; WhatsApp &gt; Configuration.
                  </small>
                </div>
              </div>
            </div>
            <div class="card-footer d-flex justify-content-end">
              <button type="submit" class="btn btn-primary" :disabled="saving" id="save-company-btn">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <span v-if="saving">Saving...</span>
                <span v-else>
                  <i class="bi bi-floppy"></i> Save All Settings
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT: Setup Guide & Environment Info -->
        <div class="col-12 col-lg-4 d-flex flex-column gap-4">
          <!-- Setup Instructions Card -->
          <div class="card">
            <div class="card-header">
              <i class="bi bi-journal-check text-primary"></i>
              Meta Setup Instructions
            </div>
            <div class="card-body" style="font-size:0.8125rem;line-height:1.6;">
              <ol class="ps-3 mb-0 d-flex flex-column gap-2 text-secondary">
                <li>
                  Go to <a href="https://developers.facebook.com" target="_blank" class="fw-600 text-decoration-none">developers.facebook.com</a> and select your App.
                </li>
                <li>
                  Under <strong>WhatsApp &gt; API Setup</strong>, copy your <strong>Phone Number ID</strong> and <strong>WABA ID</strong> into the fields on the left.
                </li>
                <li>
                  Under <strong>WhatsApp &gt; Configuration</strong>, click <strong>Edit Webhook</strong>.
                </li>
                <li>
                  Paste the <strong>Callback URL</strong> and <strong>Verify Token</strong> generated here.
                </li>
                <li>
                  Click <strong>Verify and Save</strong>. Then click <strong>Manage Webhook fields</strong> and check <strong>messages</strong>.
                </li>
                <li>
                  Click <strong>Test Connection</strong> above to verify live 2-way sync!
                </li>
              </ol>
            </div>
          </div>

          <!-- Deployment Info -->
          <div class="card">
            <div class="card-header">
              <i class="bi bi-info-circle-fill"></i>
              Deployment Region &amp; Locale
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
                  All outbound messages comply with Meta's 24-hour customer messaging policy. Outside the 24-hour window, use approved Meta Templates.
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
import whatsappApi from '@/api/whatsapp';

const toast = useToast();

const loading = ref(true);
const saving = ref(false);
const testingConnection = ref(false);
const connectionStatus = ref(null);
const showToken = ref(false);
const hasExistingToken = ref(false);
const webhookUrl = ref('');
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
  timezone: 'Asia/Kolkata',
  whatsapp_number: '',
  whatsapp_phone_number_id: '',
  whatsapp_business_id: '',
  whatsapp_access_token: '',
  whatsapp_webhook_verify_token: 'convera_crm_webhook_verify_secret',
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
      form.whatsapp_number = company.whatsapp_number || '';
      form.whatsapp_phone_number_id = company.whatsapp_phone_number_id || '';
      form.whatsapp_business_id = company.whatsapp_business_id || '';
      form.whatsapp_webhook_verify_token = company.whatsapp_webhook_verify_token || 'convera_crm_webhook_verify_secret';
      hasExistingToken.value = !!company.has_whatsapp_access_token;
      webhookUrl.value = company.whatsapp_webhook_url || `${window.location.origin}/api/v1/whatsapp/webhook`;
    }
  } catch (err) {
    toast.error('Failed to load company profile.');
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
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      whatsapp_number: form.whatsapp_number,
      whatsapp_phone_number_id: form.whatsapp_phone_number_id,
      whatsapp_business_id: form.whatsapp_business_id,
      whatsapp_webhook_verify_token: form.whatsapp_webhook_verify_token,
    };

    if (form.whatsapp_access_token.trim()) {
      payload.whatsapp_access_token = form.whatsapp_access_token.trim();
    }

    const response = await api.put('/company', payload);
    if (response.data?.company) {
      hasExistingToken.value = !!response.data.company.has_whatsapp_access_token;
      form.whatsapp_access_token = '';
    }
    toast.success('Company settings & WhatsApp credentials saved.');
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

const testWhatsAppConnection = async () => {
  testingConnection.value = true;
  connectionStatus.value = null;
  try {
    const res = await whatsappApi.getStatus();
    connectionStatus.value = res.data.connection;
    if (res.data.connection?.connected) {
      toast.success('Connected to Meta WhatsApp Cloud API successfully!');
    } else {
      toast.error(res.data.connection?.message || 'Meta connection verification failed.');
    }
  } catch (err) {
    connectionStatus.value = {
      connected: false,
      message: err.response?.data?.message || err.message || 'Connection test failed.',
    };
    toast.error('Connection test failed.');
  } finally {
    testingConnection.value = false;
  }
};

const copyToClipboard = async (text, label) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  } catch {
    toast.error('Failed to copy to clipboard.');
  }
};
</script>
