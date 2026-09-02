<template>
  <div style="display:flex;gap:1.25rem;height:calc(100vh - 100px);overflow:hidden;">
    <!-- LEFT PANEL: Thread List -->
    <div style="width:300px;flex-shrink:0;background-color:var(--bg-secondary);border:1px solid var(--border-color);border-radius:var(--radius-lg);display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:0.875rem 1rem;border-bottom:1px solid var(--border-color);">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Filter threads..."
            id="inbox-search"
          />
        </div>
      </div>

      <div style="flex:1;overflow-y:auto;">
        <div
          v-for="item in filteredInbox"
          :key="item.id"
          :class="['inbox-item', { active: activeLead?.id === item.id }]"
          @click="selectLead(item)"
        >
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="fw-600" style="font-size:0.875rem;color:var(--text-primary);">{{ item.name }}</span>
            <span style="font-size:0.7rem;color:var(--text-muted);">{{ formatTime(item.last_message_at) }}</span>
          </div>
          <p style="font-size:0.75rem;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0;">
            <span v-if="item.last_message_direction === 'outbound'" style="color:var(--primary);">You: </span>
            {{ item.last_message || 'No messages' }}
          </p>
        </div>

        <div v-if="!filteredInbox.length" class="text-center py-4" style="color:var(--text-muted);font-size:0.8125rem;">
          No active conversations.
        </div>
      </div>
    </div>

    <!-- MIDDLE PANEL: Conversation -->
    <div style="flex:1;background-color:var(--bg-secondary);border:1px solid var(--border-color);border-radius:var(--radius-lg);display:flex;flex-direction:column;overflow:hidden;min-width:0;">
      <!-- Active Conversation -->
      <div v-if="activeLead" style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
        <!-- Chat Header -->
        <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;background:var(--bg-secondary);flex-shrink:0;">
          <div>
            <h3 style="font-size:1rem;font-weight:700;color:var(--text-primary);margin:0;">{{ activeLead.name }}</h3>
            <span style="font-size:0.75rem;color:var(--text-secondary);" class="d-inline-flex align-items-center gap-1 mt-1">
              <i class="bi bi-telephone"></i> {{ formatPhone(activeLead.phone) }}
            </span>
          </div>
          <div class="d-flex gap-2">
            <button @click="openDirectWhatsApp" class="btn btn-whatsapp btn-sm" title="Open WhatsApp Web">
              <i class="bi bi-whatsapp"></i> Open WhatsApp
            </button>
            <button @click="showTemplatesModal = true" class="btn btn-secondary btn-sm" title="Select Template">
              <i class="bi bi-file-earmark-text"></i> Templates
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div
          ref="messageArea"
          style="flex:1;padding:1.25rem;overflow-y:auto;display:flex;flex-direction:column;gap:0.75rem;background:var(--bg-primary);"
        >
          <div
            v-for="msg in messages"
            :key="msg.id"
            :style="`display:flex;flex-direction:column;align-items:${msg.direction === 'outbound' ? 'flex-end' : 'flex-start'};`"
          >
            <div
              :style="`max-width:70%;padding:0.625rem 0.875rem;border-radius:var(--radius-md);font-size:0.875rem;line-height:1.5;color:${msg.direction === 'outbound' ? '#fff' : 'var(--text-primary)'};background-color:${msg.direction === 'outbound' ? 'var(--primary)' : 'var(--bg-secondary)'};${msg.direction === 'outbound' ? 'border-bottom-right-radius:2px;' : 'border-bottom-left-radius:2px;border:1px solid var(--border-color);'}`"
            >
              <p style="white-space:pre-wrap;margin:0;">{{ msg.message }}</p>
            </div>
            <span style="font-size:0.65rem;color:var(--text-muted);margin-top:3px;padding:0 4px;">
              {{ formatDateTime(msg.created_at) }}
              <span v-if="msg.direction === 'outbound'"> · {{ msg.status }}</span>
            </span>
          </div>

          <div v-if="!messages.length" class="empty-state py-4">
            <div class="empty-state-icon"><i class="bi bi-chat-dots"></i></div>
            <span class="empty-state-title">No messages yet</span>
            <p class="empty-state-desc">Send a response or choose a template to begin conversation.</p>
          </div>
        </div>

        <!-- Message Input -->
        <div style="padding:1rem;border-top:1px solid var(--border-color);display:flex;gap:0.625rem;background:var(--bg-secondary);flex-shrink:0;">
          <input
            v-model="textMessage"
            type="text"
            class="form-control"
            placeholder="Type a follow-up response..."
            @keyup.enter="sendTextMessage"
            id="chat-message-input"
            style="flex:1;"
          />
          <button
            @click="sendTextMessage"
            class="btn btn-primary"
            :disabled="!textMessage.trim() || sending"
          >
            <span v-if="sending" class="spinner-border spinner-border-sm" style="border-color:rgba(255,255,255,0.4);border-top-color:#fff;" role="status"></span>
            <span v-else class="d-inline-flex align-items-center gap-1">
              <i class="bi bi-send-fill"></i> Send
            </span>
          </button>
        </div>
      </div>

      <!-- No Thread Selected -->
      <div v-else class="empty-state" style="flex:1;justify-content:center;">
        <div class="empty-state-icon"><i class="bi bi-chat-left-dots"></i></div>
        <span class="empty-state-title">Select a conversation</span>
        <p class="empty-state-desc">
          Choose an active contact from the left panel to view WhatsApp message history or send quick templates.
        </p>
      </div>
    </div>

    <!-- RIGHT PANEL: Lead Info -->
    <div
      v-if="activeLead"
      style="width:260px;flex-shrink:0;background-color:var(--bg-secondary);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.125rem;display:flex;flex-direction:column;gap:1rem;overflow-y:auto;"
      class="d-none d-xl-flex"
    >
      <h3 style="font-size:0.875rem;font-weight:700;color:var(--text-primary);border-bottom:1px solid var(--border-color);padding-bottom:0.75rem;margin:0;display:flex;align-items:center;gap:0.5rem;">
        <i class="bi bi-person-vcard text-primary-custom"></i>
        Lead Details
      </h3>

      <div>
        <span class="info-label">Company</span>
        <p style="font-size:0.875rem;font-weight:500;color:var(--text-primary);margin-top:2px;">{{ activeLead.company_name || '—' }}</p>
      </div>

      <div>
        <span class="info-label">Est. Value</span>
        <p style="font-size:0.875rem;font-weight:700;color:var(--primary);margin-top:2px;">{{ formatCurrency(activeLead.expected_value) }}</p>
      </div>

      <div>
        <span class="info-label">Priority</span>
        <div style="margin-top:4px;">
          <span :class="['badge', `badge-${activeLead.priority}`]">
            <i v-if="activeLead.priority === 'high'" class="bi bi-fire"></i>
            {{ activeLead.priority }}
          </span>
        </div>
      </div>

      <div>
        <span class="info-label">Location</span>
        <p style="font-size:0.8125rem;margin-top:2px;">{{ activeLead.city ? `${activeLead.city}, ${activeLead.state}` : '—' }}</p>
      </div>

      <div>
        <span class="info-label">Requirement</span>
        <p style="font-size:0.8125rem;color:var(--text-secondary);white-space:pre-wrap;line-height:1.5;margin-top:4px;">
          {{ activeLead.requirement || '—' }}
        </p>
      </div>

      <div style="margin-top:auto;border-top:1px solid var(--border-color);padding-top:1rem;">
        <router-link :to="`/leads/${activeLead.id}`" class="btn btn-secondary btn-sm w-100 justify-content-center">
          Full Lead Profile <i class="bi bi-arrow-right"></i>
        </router-link>
      </div>
    </div>

    <!-- Templates Modal -->
    <div v-if="showTemplatesModal" class="modal-overlay" @click.self="showTemplatesModal = false">
      <div class="modal-content" style="max-width:560px;">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-file-earmark-text-fill text-primary-custom"></i>
            Select WhatsApp Template
          </h5>
          <button @click="showTemplatesModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body" style="max-height:420px;overflow-y:auto;display:flex;flex-direction:column;gap:0.75rem;">
          <div
            v-for="tpl in templates"
            :key="tpl.id"
            class="inbox-item"
            style="padding:0.875rem;border:1px solid var(--border-color);border-radius:var(--radius-md);cursor:pointer;"
            @click="selectTemplate(tpl)"
          >
            <div class="fw-600 mb-1" style="font-size:0.875rem;color:var(--text-primary);">{{ tpl.name }}</div>
            <p style="font-size:0.8rem;color:var(--text-secondary);white-space:pre-wrap;line-height:1.5;margin:0;">{{ tpl.content }}</p>
          </div>
          <div v-if="!templates.length" class="empty-state py-3">
            <div class="empty-state-icon"><i class="bi bi-file-earmark-text"></i></div>
            <span class="empty-state-title">No templates</span>
            <p class="empty-state-desc">Add templates in the Templates settings.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showTemplatesModal = false" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import whatsappApi from '@/api/whatsapp';
import { useWhatsApp } from '@/composables/useWhatsApp';
import { useIndianFormat } from '@/composables/useIndianFormat';
import { useToast } from '@/composables/useToast';

const { openWhatsApp } = useWhatsApp();
const { formatCurrency, formatDateTime, formatPhone } = useIndianFormat();
const toast = useToast();

const inbox = ref([]);
const searchQuery = ref('');
const activeLead = ref(null);
const messages = ref([]);
const templates = ref([]);
const textMessage = ref('');
const sending = ref(false);
const showTemplatesModal = ref(false);
const messageArea = ref(null);

const filteredInbox = computed(() => {
  if (!searchQuery.value.trim()) return inbox.value;
  const q = searchQuery.value.toLowerCase();
  return inbox.value.filter(item =>
    item.name.toLowerCase().includes(q) ||
    (item.company_name && item.company_name.toLowerCase().includes(q))
  );
});

const loadInbox = async () => {
  try {
    const response = await whatsappApi.getInbox();
    inbox.value = response.data.inbox;
  } catch (err) {
    toast.error('Failed to load inbox threads.');
  }
};

const loadTemplates = async () => {
  try {
    const response = await whatsappApi.getTemplates();
    templates.value = response.data.templates.filter(t => t.is_active);
  } catch (err) {
    console.error('Failed to fetch templates list');
  }
};

onMounted(() => {
  loadInbox();
  loadTemplates();
});

const selectLead = async (lead) => {
  activeLead.value = lead;
  textMessage.value = '';
  await fetchMessages();
};

const fetchMessages = async () => {
  try {
    const response = await whatsappApi.getMessages(activeLead.value.id);
    messages.value = response.data.messages;
    scrollToBottom();
  } catch (err) {
    toast.error('Failed to fetch conversation history.');
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messageArea.value) {
      messageArea.value.scrollTop = messageArea.value.scrollHeight;
    }
  });
};

const sendTextMessage = async () => {
  if (!textMessage.value.trim() || sending.value) return;
  sending.value = true;
  try {
    await whatsappApi.sendMessage(activeLead.value.id, { message: textMessage.value });
    textMessage.value = '';
    await fetchMessages();
    loadInbox();
  } catch (err) {
    toast.error('Failed to register/send message.');
  } finally {
    sending.value = false;
  }
};

const selectTemplate = async (template) => {
  showTemplatesModal.value = false;
  sending.value = true;
  try {
    await whatsappApi.sendMessage(activeLead.value.id, { template_id: template.id });
    toast.success('Template message logged.');
    await fetchMessages();
    loadInbox();
  } catch (err) {
    toast.error('Failed to send template message.');
  } finally {
    sending.value = false;
  }
};

const openDirectWhatsApp = () => {
  if (!activeLead.value) return;
  const lastMsg = messages.value[messages.value.length - 1]?.message || '';
  openWhatsApp(activeLead.value.phone, lastMsg);
};

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0');
};
</script>

<style scoped>
.inbox-item.active {
  background-color: var(--bg-tertiary) !important;
  border-left: 3px solid var(--primary);
}
.inbox-item:hover:not(.active) {
  background-color: var(--bg-tertiary);
  cursor: pointer;
}
</style>
