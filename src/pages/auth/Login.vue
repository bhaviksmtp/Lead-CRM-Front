<template>
  <form @submit.prevent="handleLogin">
    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger d-flex align-items-center gap-2 mb-3">
      <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
      <span>{{ error }}</span>
    </div>

    <div class="mb-3">
      <label class="form-label" for="login-email">Email Address</label>
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-envelope"></i></span>
        <input
          id="login-email"
          v-model="form.email"
          type="email"
          class="form-control"
          placeholder="admin@convera.com"
          autocomplete="email"
          required
        />
      </div>
      <div v-if="validationErrors.email" class="form-error">{{ validationErrors.email[0] }}</div>
    </div>

    <div class="mb-4">
      <label class="form-label" for="login-password">Password</label>
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-lock"></i></span>
        <input
          id="login-password"
          v-model="form.password"
          type="password"
          class="form-control"
          placeholder="Enter your password"
          autocomplete="current-password"
          required
        />
      </div>
      <div v-if="validationErrors.password" class="form-error">{{ validationErrors.password[0] }}</div>
    </div>

    <button type="submit" class="btn btn-primary w-100 py-2 justify-content-center" :disabled="loading" id="login-submit-btn">
      <span v-if="loading" class="spinner-border spinner-border-sm me-2" style="border-color:rgba(255,255,255,0.4);border-top-color:#fff;" role="status"></span>
      <span v-if="loading">Signing in...</span>
      <span v-else class="d-inline-flex align-items-center gap-2">
        <i class="bi bi-box-arrow-in-right"></i> Sign In Securely
      </span>
    </button>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: ''
});

const loading = ref(false);
const error = ref(null);
const validationErrors = ref({});

const handleLogin = async () => {
  loading.value = true;
  error.value = null;
  validationErrors.value = {};

  try {
    await authStore.login(form);
    router.push('/dashboard');
  } catch (err) {
    if (err.errors) {
      validationErrors.value = err.errors;
    } else {
      error.value = err.message || 'Authentication failed. Please verify credentials.';
    }
  } finally {
    loading.value = false;
  }
};
</script>
