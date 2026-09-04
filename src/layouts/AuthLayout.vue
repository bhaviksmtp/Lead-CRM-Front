<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Brand Header -->
      <div class="auth-header text-center">
        <div class="d-flex justify-content-center align-items-center mb-3">
          <img
            src="@/assets/convera-logo-light-bg.svg"
            alt="Convera Logo"
            style="height:44px;max-width:210px;object-fit:contain;"
          />
        </div>
        <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:0;">Omnichannel Lead &amp; Sales Management CRM</p>
      </div>

      <router-view />
    </div>
  </div>
</template>

<script setup>
// Auth layout for Login page
</script>
