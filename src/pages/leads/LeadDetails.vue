<template>
  <!-- Skeleton Loading State -->
  <div v-if="loading" class="d-flex flex-column gap-4">
    <div class="card p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div style="width: 50%;">
          <div class="skeleton mb-2" style="height: 24px; width: 200px;"></div>
          <div class="skeleton" style="height: 14px; width: 140px;"></div>
        </div>
        <div class="d-flex gap-2">
          <div class="skeleton" style="height: 36px; width: 80px; border-radius: 8px;"></div>
          <div class="skeleton" style="height: 36px; width: 90px; border-radius: 8px;"></div>
        </div>
      </div>
    </div>
    <div class="row g-4">
      <div class="col-lg-7">
        <div class="card p-3">
          <div class="skeleton mb-3" style="height: 18px; width: 120px;"></div>
          <div class="skeleton mb-2" style="height: 14px; width: 100%;"></div>
          <div class="skeleton mb-2" style="height: 14px; width: 80%;"></div>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="card p-3">
          <div class="skeleton mb-3" style="height: 18px; width: 150px;"></div>
          <div class="skeleton mb-2" style="height: 40px; width: 100%; border-radius: 8px;"></div>
          <div class="skeleton" style="height: 40px; width: 100%; border-radius: 8px;"></div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="lead" class="d-flex flex-column gap-4">
    <!-- Lead Header Bar -->
    <div class="card">
      <div class="card-body py-3">
        <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
          <div>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <h2 style="font-family:var(--font-display);font-size:1.6rem;font-weight:800;color:var(--text-primary);margin:0;">
                {{ lead.name }}
              </h2>
              <span :class="['badge', `badge-${lead.priority || 'medium'}`]" style="text-transform: capitalize; font-weight: 600;">
                <i v-if="lead.priority === 'high'" class="bi bi-fire text-danger me-1"></i>
                <i v-else-if="lead.priority === 'medium'" class="bi bi-dash-circle text-warning me-1"></i>
                <i v-else class="bi bi-arrow-down-circle text-secondary me-1"></i>
                {{ lead.priority || 'medium' }}
              </span>
              <span v-if="lead.stage?.name === 'Converted' || lead.stage?.name === 'Won'" class="badge badge-won">
                <i class="bi bi-award-fill"></i> Converted
              </span>
              <span v-else-if="lead.stage?.name === 'Dropped' || lead.stage?.name === 'Lost'" class="badge badge-lost">
                <i class="bi bi-x-circle-fill"></i> Dropped
              </span>
            </div>
            <p style="color:var(--text-secondary);font-size:0.875rem;margin:0.25rem 0 0;" class="d-flex align-items-center flex-wrap gap-2">
              <span v-if="lead.company_name" class="d-inline-flex align-items-center gap-1">
                <i class="bi bi-building text-primary-custom"></i>
                <strong>{{ lead.company_name }}</strong>
                <span class="badge bg-light text-secondary border ms-1" style="font-size:0.7rem;">Corporate</span>
              </span>
              <span v-else class="badge bg-light text-secondary border" style="font-size:0.75rem;">
                <i class="bi bi-person me-1"></i>Individual Client
              </span>
              <span class="text-muted">&bull;</span>
              <span>
                <i class="bi bi-geo-alt me-1"></i>
                {{ lead.city ? `${lead.city}, ${lead.state || 'India'}` : 'Location unassigned' }}
              </span>
            </p>
          </div>

          <!-- Quick Action Bar -->
          <div class="d-flex flex-wrap gap-2">
            <button @click="triggerCall(lead.phone)" class="btn btn-secondary btn-sm" title="Call Lead">
              <i class="bi bi-telephone-fill text-success"></i> Call
            </button>
            <a v-if="lead.email" :href="`mailto:${lead.email}`" class="btn btn-secondary btn-sm" title="Send Email">
              <i class="bi bi-envelope-fill text-primary-custom"></i> Email
            </a>
            <button @click="openWhatsAppTab" class="btn btn-whatsapp btn-sm" title="WhatsApp Conversation">
              <i class="bi bi-whatsapp"></i> WhatsApp Chat
            </button>
            <button @click="openActivityModal" class="btn btn-secondary btn-sm" title="Log Activity">
              <i class="bi bi-plus-circle text-info"></i> Log Activity
            </button>
            <button @click="showScheduleModal = true" class="btn btn-secondary btn-sm" title="Schedule Follow-up">
              <i class="bi bi-calendar-plus text-warning"></i> Follow-up
            </button>
            <button
              v-if="!['Won', 'Converted', 'Lost', 'Dropped'].includes(lead.stage?.name)"
              @click="markWon"
              class="btn btn-won btn-sm"
              title="Mark as Converted"
            >
              <i class="bi bi-award-fill"></i> Mark Converted
            </button>
            <button
              v-if="!['Won', 'Converted', 'Lost', 'Dropped'].includes(lead.stage?.name)"
              @click="openLostModal"
              class="btn btn-lost btn-sm"
              title="Mark as Dropped"
            >
              <i class="bi bi-x-circle-fill"></i> Mark Dropped
            </button>
            <router-link :to="`/leads/${lead.id}/edit`" class="btn btn-secondary btn-sm" title="Edit">
              <i class="bi bi-pencil"></i>
            </router-link>
            <button @click="confirmDeleteAction" class="btn btn-danger btn-sm" title="Delete">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="row g-4">
      <!-- LEFT COLUMN: Lead Information & Requirements -->
      <div class="col-12 col-lg-6">
        <!-- Next Action Card -->
        <div class="card mb-4" style="border-left:5px solid var(--primary);background:#f8faff;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span style="font-size:0.8125rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.5px;">
                <i class="bi bi-bell-fill me-1"></i> Next Follow-up Action
              </span>
              <span v-if="lead.next_follow_up_date" class="badge badge-low">
                Assigned: {{ lead.assigned_user?.name || 'Unassigned' }}
              </span>
            </div>

            <div v-if="lead.next_follow_up_date">
              <div class="fw-800 text-dark" style="font-size:1.15rem;">
                <i class="bi bi-calendar-event text-primary-custom me-1"></i>
                Due: {{ formatDate(lead.next_follow_up_date) }}
                <span style="font-weight:500;color:var(--text-secondary);font-size:0.95rem;"> at </span>
                {{ formatTime(lead.next_follow_up_time) || '10:00 AM' }}
              </div>
              <div class="d-flex gap-2 mt-3">
                <button @click="triggerCall(lead.phone)" class="btn btn-secondary btn-sm">
                  <i class="bi bi-telephone-fill"></i> Call Now
                </button>
                <button @click="openWhatsAppTab" class="btn btn-whatsapp btn-sm">
                  <i class="bi bi-whatsapp"></i> WhatsApp
                </button>
                <button @click="showScheduleModal = true" class="btn btn-secondary btn-sm">
                  <i class="bi bi-clock-history"></i> Reschedule
                </button>
              </div>
            </div>

            <div v-else>
              <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:0.75rem;">
                No upcoming follow-up scheduled.
              </p>
              <button @click="showScheduleModal = true" class="btn btn-primary btn-sm">
                <i class="bi bi-calendar-plus"></i> Schedule Follow-up
              </button>
            </div>
          </div>
        </div>

        <!-- Lead Key Profile -->
        <div class="card mb-4">
          <div class="card-header">
            <i class="bi bi-person-lines-fill"></i>
            Lead Details &amp; Deal Terms
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-6 col-md-4">
                <span class="info-label">Expected Deal Value</span>
                <span style="font-size:1.25rem;font-weight:800;color:var(--primary);">
                  {{ formatCurrency(lead.expected_value) }}
                </span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Sales Stage</span>
                <span class="badge badge-new">{{ lead.stage?.name || 'New' }}</span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Lead Status</span>
                <span class="info-value fw-600">{{ lead.status?.name || 'New' }}</span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Marketing Source</span>
                <span :class="['badge', getSourceBadgeClass(lead.source?.name)]">
                  <i :class="getSourceIcon(lead.source?.name)"></i>
                  {{ lead.source?.name || 'Direct' }}
                </span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Assigned Executive</span>
                <span class="fw-600 text-dark d-inline-flex align-items-center gap-1">
                  <i class="bi bi-person text-primary-custom"></i>
                  {{ lead.assigned_user?.name || 'Unassigned' }}
                </span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Phone Number</span>
                <span class="info-value fw-600">{{ formatPhone(lead.phone) }}</span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">WhatsApp Number</span>
                <span class="info-value fw-600 text-success">
                  <i class="bi bi-whatsapp me-1"></i>{{ formatPhone(lead.whatsapp_number || lead.phone) }}
                </span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Email Address</span>
                <span class="info-value">{{ lead.email || '—' }}</span>
              </div>
              <div class="col-6 col-md-4">
                <span class="info-label">Last Contacted</span>
                <span class="info-value">{{ lead.last_contacted_at ? formatDateTime(lead.last_contacted_at) : 'Not contacted yet' }}</span>
              </div>
              <div v-if="lead.lost_reason" class="col-12">
                <span class="info-label text-danger">Lost Reason</span>
                <div class="p-2 rounded bg-danger-subtle text-danger fw-600" style="font-size:0.875rem;">
                  {{ lead.lost_reason }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Requirements -->
        <div class="card mb-4">
          <div class="card-header">
            <i class="bi bi-card-text"></i>
            Client Requirements
          </div>
          <div class="card-body">
            <p style="font-size:0.9375rem;color:var(--text-primary);white-space:pre-line;margin:0;line-height:1.7;">
              {{ lead.requirement || 'No detailed requirements specified.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Multi-Tab Interaction Deck (WhatsApp, Timeline, Notes, Follow-ups) -->
      <div class="col-12 col-lg-6">
        <div class="card h-100 d-flex flex-column" style="min-height:560px;">
          <!-- Card Tab Header -->
          <div class="card-header p-2 bg-light border-bottom">
            <ul class="nav nav-pills nav-fill gap-1">
              <li class="nav-item">
                <button
                  type="button"
                  :class="['nav-link py-1 px-2 small fw-600', { active: activeRightTab === 'whatsapp' }]"
                  @click="activeRightTab = 'whatsapp'"
                >
                  <i class="bi bi-whatsapp text-whatsapp me-1"></i> WhatsApp
                  <span v-if="chatMessages.length" class="badge bg-secondary ms-1">{{ chatMessages.length }}</span>
                </button>
              </li>
              <li class="nav-item">
                <button
                  type="button"
                  :class="['nav-link py-1 px-2 small fw-600', { active: activeRightTab === 'timeline' }]"
                  @click="activeRightTab = 'timeline'"
                >
                  <i class="bi bi-clock-history me-1"></i> Timeline ({{ timeline.length }})
                </button>
              </li>
              <li class="nav-item">
                <button
                  type="button"
                  :class="['nav-link py-1 px-2 small fw-600', { active: activeRightTab === 'notes' }]"
                  @click="activeRightTab = 'notes'"
                >
                  <i class="bi bi-journal-text me-1"></i> Notes ({{ notesList.length }})
                </button>
              </li>
              <li class="nav-item">
                <button
                  type="button"
                  :class="['nav-link py-1 px-2 small fw-600', { active: activeRightTab === 'followups' }]"
                  @click="activeRightTab = 'followups'"
                >
                  <i class="bi bi-calendar-check me-1"></i> Tasks
                </button>
              </li>
            </ul>
          </div>

          <!-- TAB CONTENT -->
          <div class="card-body p-0 d-flex flex-column flex-grow-1" style="position:relative;">

            <!-- TAB 1: WhatsApp Conversation -->
            <div v-show="activeRightTab === 'whatsapp'" class="d-flex flex-column h-100" style="min-height:480px;">
              <!-- 24-Hour Policy Window Badge Bar -->
              <div class="p-2 border-bottom d-flex justify-content-between align-items-center bg-light" style="font-size:0.75rem;">
                <div class="d-flex align-items-center gap-1">
                  <span v-if="windowStatus.is_open" class="badge bg-success text-white">
                    <i class="bi bi-lightning-charge-fill me-1"></i> 24h Window Active ({{ windowStatus.hours_remaining }}h left)
                  </span>
                  <span v-else class="badge bg-warning text-dark" title="Meta WhatsApp customer window closed">
                    <i class="bi bi-shield-lock me-1"></i> 24h Window Expired — Use Template
                  </span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <button @click="loadWhatsAppMessages" class="btn btn-link btn-sm p-0 text-secondary" title="Refresh messages">
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                  <button @click="triggerExternalWhatsApp" class="btn btn-link btn-sm p-0 text-success" title="Open in WhatsApp Web">
                    <i class="bi bi-box-arrow-up-right"></i> Web App
                  </button>
                </div>
              </div>

              <!-- Message Bubbles Thread -->
              <div class="flex-grow-1 p-3 overflow-y-auto d-flex flex-column gap-2" style="max-height:360px;background:#efeae2;" ref="chatBoxRef">
                <div v-if="loadingMessages" class="text-center py-4">
                  <span class="spinner-border spinner-border-sm text-secondary"></span>
                </div>

                <div v-else-if="!chatMessages.length" class="text-center py-5 text-muted" style="font-size:0.875rem;">
                  <i class="bi bi-chat-dots d-block mb-1 fs-3 opacity-50"></i>
                  No WhatsApp messages yet. Send a template or message below!
                </div>

                <div
                  v-for="msg in chatMessages"
                  :key="msg.id"
                  :class="['d-flex flex-column', msg.direction === 'outbound' ? 'align-items-end' : 'align-items-start']"
                >
                  <div
                    :style="msg.direction === 'outbound'
                      ? 'background:#dcf8c6;color:#111827;border-radius:12px 12px 2px 12px;max-width:82%;padding:8px 12px;box-shadow:0 1px 2px rgba(0,0,0,0.1);'
                      : 'background:#ffffff;color:#111827;border-radius:12px 12px 12px 2px;max-width:82%;padding:8px 12px;box-shadow:0 1px 2px rgba(0,0,0,0.1);'"
                  >
                    <div v-if="msg.message_type === 'template'" class="badge bg-light text-secondary border mb-1" style="font-size:0.65rem;">
                      <i class="bi bi-file-earmark-text me-1"></i>Template Message
                    </div>
                    <div style="font-size:0.875rem;white-space:pre-wrap;word-break:break-word;">
                      {{ msg.message }}
                    </div>
                    <div class="d-flex align-items-center justify-content-end gap-1 mt-1" style="font-size:0.6875rem;color:#6b7280;">
                      <span>{{ formatTime(msg.created_at) }}</span>
                      <!-- Delivery Status Ticks -->
                      <span v-if="msg.direction === 'outbound'">
                        <i v-if="msg.status === 'read'" class="bi bi-check2-all text-primary" title="Read"></i>
                        <i v-else-if="msg.status === 'delivered'" class="bi bi-check2-all text-secondary" title="Delivered"></i>
                        <i v-else-if="msg.status === 'sent'" class="bi bi-check2 text-secondary" title="Sent"></i>
                        <i v-else-if="msg.status === 'failed'" class="bi bi-exclamation-circle-fill text-danger" :title="msg.error_message || 'Delivery failed'"></i>
                        <i v-else class="bi bi-clock text-muted" title="Pending"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Message Composer & Template Picker -->
              <div class="p-2 border-top bg-white">
                <!-- Template Quick Selector -->
                <div class="d-flex align-items-center gap-2 mb-2">
                  <select v-model="selectedTemplateId" @change="applyTemplateToComposer" class="form-select form-select-sm" style="font-size:0.8rem;">
                    <option :value="null">-- Select Approved WhatsApp Template --</option>
                    <option v-for="tpl in availableTemplates" :key="tpl.id" :value="tpl.id">
                      📋 {{ tpl.name }} ({{ tpl.category || 'MARKETING' }})
                    </option>
                  </select>
                </div>

                <div class="input-group">
                  <textarea
                    v-model="outgoingMessageText"
                    class="form-control"
                    rows="2"
                    placeholder="Type WhatsApp message..."
                    style="font-size:0.875rem;resize:none;"
                    @keydown.ctrl.enter="sendOutboundWhatsApp"
                  ></textarea>
                  <button
                    @click="sendOutboundWhatsApp"
                    class="btn btn-whatsapp d-flex align-items-center gap-1"
                    :disabled="sendingWhatsApp || (!outgoingMessageText.trim() && !selectedTemplateId)"
                  >
                    <span v-if="sendingWhatsApp" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-send-fill"></i>
                    Send
                  </button>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-1 px-1" style="font-size:0.7rem;color:var(--text-muted);">
                  <span>Press <kbd>Ctrl+Enter</kbd> to send</span>
                  <span v-if="!windowStatus.is_open && !selectedTemplateId" class="text-warning">
                    ⚠️ Window closed: You must select a template to contact this lead.
                  </span>
                </div>
              </div>
            </div>

            <!-- TAB 2: Activity Timeline -->
            <div v-show="activeRightTab === 'timeline'" class="p-3 overflow-y-auto" style="max-height:500px;">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="fw-700 small text-secondary">Timeline Events</span>
                <button @click="openActivityModal" class="btn btn-secondary btn-sm" style="font-size:0.75rem;padding:2px 8px;">
                  + Log Activity
                </button>
              </div>
              <div v-if="timeline.length" class="timeline">
                <div v-for="act in timeline" :key="act.id" class="timeline-item">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-time">
                      <i class="bi bi-clock"></i>
                      {{ formatDateTime(act.created_at) }}
                    </div>
                    <div class="timeline-title fw-700">{{ act.type }}</div>
                    <p class="timeline-desc mb-1">{{ act.description }}</p>
                    <div v-if="act.user" style="font-size:0.7rem;color:var(--text-muted);">
                      <i class="bi bi-person me-1"></i> Logged by: {{ act.user.name }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-muted small">
                No activities logged yet.
              </div>
            </div>

            <!-- TAB 3: Internal Notes -->
            <div v-show="activeRightTab === 'notes'" class="p-3 d-flex flex-column h-100" style="max-height:500px;overflow-y:auto;">
              <!-- Add Note Form -->
              <div class="mb-3 p-2 rounded bg-light border">
                <label class="form-label small fw-700 mb-1">Add Staff Remark / Observation</label>
                <textarea
                  v-model="newNote"
                  class="form-control mb-2"
                  rows="2"
                  placeholder="Enter internal staff remarks or observations..."
                  style="font-size:0.875rem;"
                ></textarea>
                <button
                  @click="submitNote"
                  class="btn btn-primary btn-sm"
                  :disabled="!newNote.trim() || savingNote"
                >
                  <span v-if="savingNote" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-floppy me-1"></i> Save Note
                </button>
              </div>

              <!-- Saved Notes List -->
              <div class="fw-700 small text-secondary mb-2">Previous Notes ({{ notesList.length }})</div>
              <div v-if="notesList.length" class="d-flex flex-column gap-2">
                <div
                  v-for="note in notesList"
                  :key="note.id"
                  class="p-2 rounded border bg-white shadow-xs"
                >
                  <div class="d-flex justify-content-between align-items-center mb-1" style="font-size:0.75rem;">
                    <span class="fw-700 text-dark d-flex align-items-center gap-1">
                      <i class="bi bi-person-fill text-primary"></i>
                      {{ note.user?.name || 'Staff' }}
                    </span>
                    <span class="text-muted">{{ formatDateTime(note.created_at) }}</span>
                  </div>
                  <p class="mb-0 text-dark" style="font-size:0.875rem;white-space:pre-wrap;">{{ note.note }}</p>
                </div>
              </div>
              <div v-else class="text-center py-4 text-muted small">
                No internal notes recorded for this lead yet.
              </div>
            </div>

            <!-- TAB 4: Follow-up Tasks -->
            <div v-show="activeRightTab === 'followups'" class="p-3 overflow-y-auto" style="max-height:500px;">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="fw-700 small text-secondary">Follow-up Tasks</span>
                <button @click="showScheduleModal = true" class="btn btn-secondary btn-sm" style="font-size:0.75rem;padding:2px 8px;">
                  + Schedule Task
                </button>
              </div>
              <div v-if="leadFollowUps.length" class="d-flex flex-column gap-2">
                <div
                  v-for="task in leadFollowUps"
                  :key="task.id"
                  class="p-2 rounded border bg-white shadow-xs"
                >
                  <div class="d-flex justify-content-between align-items-start mb-1">
                    <div>
                      <span :class="['badge me-1', getFollowUpTypeBadgeClass(task.type)]">
                        {{ task.type }}
                      </span>
                      <span :class="['badge', `badge-${task.status}`]">
                        {{ task.status }}
                      </span>
                    </div>
                    <span style="font-size:0.75rem;font-weight:600;">
                      <i class="bi bi-clock me-1 text-muted"></i>{{ formatDateTime(task.scheduled_at) }}
                    </span>
                  </div>
                  <p v-if="task.notes" class="mb-1 text-dark" style="font-size:0.8125rem;">{{ task.notes }}</p>
                  <div class="text-muted small" style="font-size:0.7rem;">
                    Assigned: {{ task.assigned_user?.name || 'Unassigned' }}
                    <span v-if="task.completed_at"> &bull; Completed: {{ formatDateTime(task.completed_at) }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-muted small">
                No follow-up tasks recorded for this lead.
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Log Activity Modal -->
    <div v-if="showActivityModal" class="modal-overlay" @click.self="showActivityModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-plus-circle text-primary-custom"></i> Log Activity</h5>
          <button @click="showActivityModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Activity Type *</label>
            <select v-model="activityForm.type" class="form-select">
              <option value="Phone Call">Phone Call</option>
              <option value="WhatsApp Message">WhatsApp Message</option>
              <option value="Email Sent">Email Sent</option>
              <option value="Meeting / Demo">In-Person Meeting / Demo</option>
              <option value="Note Added">General Note</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Description *</label>
            <textarea
              v-model="activityForm.description"
              class="form-control"
              rows="3"
              placeholder="Summary of interaction..."
              required
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showActivityModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitActivity" class="btn btn-primary" :disabled="!activityForm.description.trim()">
            Save Activity Log
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Follow-up Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click.self="showScheduleModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-calendar-plus text-primary-custom"></i> Schedule Follow-up</h5>
          <button @click="showScheduleModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Follow-up Type *</label>
            <select v-model="followUpForm.type" class="form-select">
              <option value="call">Phone Call</option>
              <option value="whatsapp">WhatsApp Message</option>
              <option value="email">Email</option>
              <option value="meeting">In-Person Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Date &amp; Time *</label>
            <input v-model="followUpForm.scheduled_at" type="datetime-local" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Notes / Purpose</label>
            <textarea v-model="followUpForm.notes" class="form-control" rows="2" placeholder="Agenda or discussion points..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showScheduleModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitFollowUp" class="btn btn-primary" :disabled="submittingFollowUp">
            <span v-if="submittingFollowUp" class="spinner-border spinner-border-sm me-1"></span>
            Schedule Task
          </button>
        </div>
      </div>
    </div>

    <!-- Mark Dropped Modal -->
    <div v-if="showLostModal" class="modal-overlay" @click.self="showLostModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-x-circle-fill text-danger me-1"></i> Mark Lead as Dropped</h5>
          <button @click="showLostModal = false" class="modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Drop Reason Category *</label>
            <select v-model="lostReasonCategory" class="form-select">
              <option value="Too Expensive — Pricing Issue">Too Expensive — Pricing Issue</option>
              <option value="Chose Competitor">Chose Competitor</option>
              <option value="Client Unresponsive / Ghosted">Client Unresponsive / Ghosted</option>
              <option value="Project Postponed / Budget Reallocated">Project Postponed / Budget Reallocated</option>
              <option value="Product Specifications Mismatch">Product Specifications Mismatch</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Additional Remarks</label>
            <textarea v-model="lostReasonNotes" class="form-control" rows="3" placeholder="Context on why this lead was dropped..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showLostModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitLost" class="btn btn-danger" :disabled="submittingLost">
            Confirm Lead Dropped
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLeadsStore } from '@/stores/leads';
import { useFollowUpsStore } from '@/stores/followups';
import { useIndianFormat } from '@/composables/useIndianFormat';
import { useWhatsApp } from '@/composables/useWhatsApp';
import { useLeadSource } from '@/composables/useLeadSource';
import { useToast } from '@/composables/useToast';
import { useSwal } from '@/composables/useSwal';
import whatsappApi from '@/api/whatsapp';
import followupsApi from '@/api/followups';

const route = useRoute();
const router = useRouter();
const leadsStore = useLeadsStore();
const followUpsStore = useFollowUpsStore();
const { formatCurrency, formatDate, formatTime, formatDateTime, formatPhone } = useIndianFormat();
const { openWhatsApp } = useWhatsApp();
const { getSourceIcon, getSourceBadgeClass } = useLeadSource();
const toast = useToast();
const { confirmDelete } = useSwal();

const loading = ref(true);
const lead = computed(() => leadsStore.currentLead);
const timeline = computed(() => leadsStore.timeline);
const notesList = computed(() => leadsStore.notes);

const activeRightTab = ref('whatsapp');
const chatBoxRef = ref(null);

// WhatsApp Live Chat State
const chatMessages = ref([]);
const loadingMessages = ref(false);
const sendingWhatsApp = ref(false);
const outgoingMessageText = ref('');
const selectedTemplateId = ref(null);
const availableTemplates = ref([]);
const windowStatus = ref({ is_open: false, hours_remaining: 0 });

// Notes State
const newNote = ref('');
const savingNote = ref(false);

// Follow-up history for lead
const leadFollowUps = ref([]);

// Modals
const showActivityModal = ref(false);
const showScheduleModal = ref(false);
const showLostModal = ref(false);
const lostReasonCategory = ref('Too Expensive — Pricing Issue');
const lostReasonNotes = ref('');
const submittingLost = ref(false);
const submittingFollowUp = ref(false);

const activityForm = reactive({ type: 'Phone Call', description: '' });
const followUpForm = reactive({ type: 'call', scheduled_at: '', notes: '' });

const loadLeadDetails = async () => {
  try {
    const leadId = route.params.id;
    await leadsStore.fetchLead(leadId);
    await Promise.all([
      leadsStore.fetchTimeline(leadId),
      leadsStore.fetchNotes(leadId),
      loadWhatsAppMessages(),
      loadLeadFollowUps(),
      loadTemplates(),
    ]);
  } catch (err) {
    toast.error('Failed to load lead details.');
  } finally {
    loading.value = false;
  }
};

const loadWhatsAppMessages = async () => {
  if (!route.params.id) return;
  loadingMessages.value = true;
  try {
    const res = await whatsappApi.getMessages(route.params.id);
    chatMessages.value = res.data.messages || [];
    windowStatus.value = res.data.window_status || { is_open: false, hours_remaining: 0 };
    await nextTick();
    scrollChatToBottom();
  } catch {
    // Ignore if not loaded
  } finally {
    loadingMessages.value = false;
  }
};

const loadTemplates = async () => {
  try {
    const res = await whatsappApi.getTemplates();
    availableTemplates.value = res.data.templates || [];
  } catch {
    // Ignore
  }
};

const loadLeadFollowUps = async () => {
  try {
    const res = await followupsApi.getFollowUps({ tab: 'all' });
    const all = res.data.follow_ups || [];
    leadFollowUps.value = all.filter(f => f.lead_id === parseInt(route.params.id, 10));
  } catch {
    // Ignore
  }
};

const scrollChatToBottom = () => {
  if (chatBoxRef.value) {
    chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight;
  }
};

onMounted(() => {
  loadLeadDetails();
});

const openWhatsAppTab = () => {
  activeRightTab.value = 'whatsapp';
  loadWhatsAppMessages();
};

const triggerCall = (phone) => {
  if (phone) window.open(`tel:${phone}`);
};

const triggerExternalWhatsApp = () => {
  const phoneToUse = lead.value?.whatsapp_number || lead.value?.phone;
  if (phoneToUse) {
    openWhatsApp(phoneToUse, `Hi ${lead.value.name}, connecting from Convera.`);
  }
};

const applyTemplateToComposer = () => {
  if (!selectedTemplateId.value) return;
  const tpl = availableTemplates.value.find(t => t.id === selectedTemplateId.value);
  if (tpl && lead.value) {
    // Replace merge tags
    let content = tpl.content;
    content = content.replace(/{{name}}/g, lead.value.name || '');
    content = content.replace(/{{company}}/g, lead.value.company_name || lead.value.company?.name || 'our company');
    content = content.replace(/{{requirement}}/g, lead.value.requirement || 'your requirement');
    content = content.replace(/{{deal_value}}/g, lead.value.expected_value ? '₹' + formatCurrency(lead.value.expected_value) : '');
    outgoingMessageText.value = content;
  }
};

const sendOutboundWhatsApp = async () => {
  if (!outgoingMessageText.value.trim() && !selectedTemplateId.value) return;
  sendingWhatsApp.value = true;
  try {
    const payload = {
      message: outgoingMessageText.value.trim(),
      template_id: selectedTemplateId.value || undefined,
    };
    const res = await whatsappApi.sendMessage(lead.value.id, payload);
    toast.success('WhatsApp message sent!');
    outgoingMessageText.value = '';
    selectedTemplateId.value = null;
    if (res.data?.whatsapp_message) {
      chatMessages.value.push(res.data.whatsapp_message);
    }
    if (res.data?.window_status) {
      windowStatus.value = res.data.window_status;
    }
    await leadsStore.fetchTimeline(lead.value.id);
    await nextTick();
    scrollChatToBottom();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to send WhatsApp message.');
  } finally {
    sendingWhatsApp.value = false;
  }
};

const submitNote = async () => {
  if (!newNote.value.trim() || savingNote.value) return;
  savingNote.value = true;
  try {
    await leadsStore.addNote(lead.value.id, newNote.value.trim());
    toast.success('Internal note saved.');
    newNote.value = '';
  } catch (err) {
    toast.error('Failed to save note.');
  } finally {
    savingNote.value = false;
  }
};

const openActivityModal = () => {
  activityForm.type = 'Phone Call';
  activityForm.description = '';
  showActivityModal.value = true;
};

const submitActivity = async () => {
  if (!activityForm.description.trim()) return;
  try {
    await leadsStore.logActivity(lead.value.id, {
      type: activityForm.type,
      description: activityForm.description.trim(),
    });
    toast.success('Activity logged.');
    showActivityModal.value = false;
  } catch (err) {
    toast.error('Failed to log activity.');
  }
};

const submitFollowUp = async () => {
  if (!followUpForm.scheduled_at) {
    toast.error('Please select date and time.');
    return;
  }
  submittingFollowUp.value = true;
  try {
    await followUpsStore.createFollowUp({
      lead_id: lead.value.id,
      assigned_to: lead.value.assigned_to || undefined,
      ...followUpForm
    });
    toast.success('Follow-up scheduled.');
    showScheduleModal.value = false;
    await Promise.all([
      leadsStore.fetchLead(lead.value.id),
      loadLeadFollowUps(),
    ]);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to create follow-up task.');
  } finally {
    submittingFollowUp.value = false;
  }
};

const markWon = async () => {
  try {
    await leadsStore.markWon(lead.value.id);
    toast.success('Lead Converted successfully!');
    loadLeadDetails();
  } catch (err) {
    toast.error('Failed to update stage to Converted.');
  }
};

const openLostModal = () => {
  lostReasonCategory.value = 'Too Expensive — Pricing Issue';
  lostReasonNotes.value = '';
  showLostModal.value = true;
};

const submitLost = async () => {
  const fullReason = lostReasonNotes.value.trim()
    ? `${lostReasonCategory.value} — ${lostReasonNotes.value.trim()}`
    : lostReasonCategory.value;

  submittingLost.value = true;
  try {
    await leadsStore.markLost(lead.value.id, fullReason);
    toast.success('Lead marked as Dropped.');
    showLostModal.value = false;
    loadLeadDetails();
  } catch (err) {
    toast.error('Failed to mark lead as Dropped.');
  } finally {
    submittingLost.value = false;
  }
};

const confirmDeleteAction = async () => {
  const confirmed = await confirmDelete(`lead "${lead.value.name}"`);
  if (confirmed) {
    try {
      await leadsStore.deleteLead(lead.value.id);
      toast.success('Lead deleted.');
      router.push('/leads');
    } catch {
      toast.error('Failed to delete lead.');
    }
  }
};

const getFollowUpTypeBadgeClass = (type) => {
  return `badge-${type || 'call'}`;
};
</script>
