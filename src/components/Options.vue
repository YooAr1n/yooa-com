<template>
  <Notification />
  <div class="tabs" role="tablist">
    <button :class="{ active: currentTab === 'saving' }" @click="changeTab('Options', 'saving')">
      Saving
    </button>
    <button :class="{ active: currentTab === 'confirm' }" @click="changeTab('Options', 'confirm')">
      Confirmations
    </button>
    <button :class="{ active: currentTab === 'auth' }" @click="changeTab('Options', 'auth')">
      Account
    </button>
  </div>

  <div class="options">
    <!-- Cloud preview/confirm modal (replace the old modal block) -->
    <div v-if="cloudModalVisible" class="modal-overlay" @click.self="closeCloudModal" aria-hidden="false">
      <div class="cloud-modal card enter-pop" :aria-busy="cloudModalLoading">
        <h3 class="modal-title">🌸 YooA Save Compare <span class="title-sparkle">✨</span></h3>

        <div class="compare-row">
          <div class="compare-col local-col">
            <div class="col-badge">LOCAL</div>
            <h4>Local Save</h4>
            <div class="meta"><strong>Size:</strong> {{ cloudModalLocal.sizeHuman }}</div>

            <div class="meta stat-row"><span class="stat-label">Time played:</span>
              <span class="stat-value">{{ cloudModalLocal.timePlayed }}</span>
            </div>
            <div class="meta stat-row"><span class="stat-label">YooA Points:</span>
              <span class="stat-value">{{ cloudModalLocal.yooaPoints }}</span>
            </div>

            <div class="meta"><strong>Preview:</strong></div>
            <pre class="preview-box">{{ cloudModalLocal.sample }}</pre>
          </div>

          <div class="compare-col cloud-col" :class="{ 'cloud-diff': cloudDiff }">
            <div class="col-badge">CLOUD</div>
            <h4>Cloud Save</h4>
            <div v-if="cloudModalCloud.exists">
              <div class="meta"><strong>Version:</strong> {{ cloudModalCloud.version || '—' }}</div>
              <div class="meta"><strong>Size:</strong> {{ cloudModalCloud.sizeHuman }}</div>

              <div class="meta stat-row"><span class="stat-label">Time played:</span>
                <span class="stat-value">{{ cloudModalCloud.timePlayed }}</span>
              </div>
              <div class="meta stat-row"><span class="stat-label">YooA Points:</span>
                <span class="stat-value">{{ cloudModalCloud.yooaPoints }}</span>
              </div>

              <div class="meta"><strong>Preview:</strong></div>
              <pre class="preview-box">{{ cloudModalCloud.sample }}</pre>
            </div>
            <div v-else class="meta">No cloud save found for this slot.</div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="primary big btn-animated" @click="confirmCloudAction('overwrite')">
            {{ modalActionLabelOverwrite }}
          </button>
          <button class="ghost btn-animated" @click="confirmCloudAction('keep')">
            {{ modalActionLabelKeep }}
          </button>
        </div>

        <div v-if="cloudModalLoading" class="modal-loading">Working…</div>
        <button class="close-x" @click="closeCloudModal" aria-label="Close">✕</button>
      </div>
    </div>

    <!-- Saving Tab -->
    <transition name="tab-slide" mode="out-in">
      <div v-if="currentTab === 'saving'" key="saving" class="tab-content">
        <div class="button-grid">
          <button @click="save(true)" class="btn-animated">Save Locally</button>
          <button @click="openCloudSaveConfirm()" class="btn-animated">Cloud Save</button>
          <button @click="openCloudLoadConfirm()" class="btn-animated">Cloud Load</button>
          <button @click="exportSave()" class="btn-animated">Export</button>
          <button @click="importSave()" class="btn-animated">Import</button>
          <button @click="hardReset()" class="btn-danger btn-animated">HARD RESET</button>

          <button id="autosave" @click="autoSave()" class="btn-animated">Auto Save: {{ autoSaveOn }}</button>
          <button id="autoint" @click="changeAutoInt()" class="btn-animated">Auto Save interval: {{ interval }}</button>
          <button id="offline" @click="changeOffline()" class="btn-animated">Offline Progress: {{ offlineOn }}</button>
          <button id="news" @click="changeNews()" class="btn-animated">News Ticker: {{ newsOn }}</button>
          <button id="notation" @click="changeNotation()" class="btn-animated">Notation: {{ notation }}</button>
        </div>
      </div>
    </transition>

    <!-- Confirmations Tab -->
    <transition name="tab-slide" mode="out-in">
      <div v-if="currentTab === 'confirm'" key="confirm" class="tab-content">
        <div class="button-grid">
          <button v-for="(value, layer) in confirmations" :key="layer" @click="toggleConfirmation(layer)"
            class="btn-animated">
            {{ confirmText(layer, value) }}
          </button>
        </div>
      </div>
    </transition>

    <!-- Auth / Account Tab -->
    <transition name="tab-slide" mode="out-in">
      <div v-if="currentTab === 'auth'" key="auth" class="tab-content auth-subtab">
        <h3 class="page-title">🌸 YooA Account Management 🌸</h3>

        <!-- Guest note -->
        <div v-if="!isAuthenticated" class="auth-guest-note">
          🌸 YooA says: You are browsing as a Guest — sign in to enable cloud saves and profile features.
        </div>

        <!-- Account screen layout: left profile, right actions -->
        <div class="account-screen">
          <!-- Left: Profile panel (only visible when signed in and not verifying) -->
          <transition name="panel-pop" mode="out-in">
            <aside v-if="isAuthenticated && authView !== 'verify'" class="profile-panel" key="profile-panel">
              <!-- Avatar: show image when available, otherwise initials bubble -->
              <div class="avatar" @click="triggerAvatarUpload" title="Change avatar" role="button"
                :aria-disabled="!isAuthenticated">
                <template v-if="avatarUrl || avatarPreview">
                  <img :src="avatarPreview || avatarUrl" class="avatar-img avatar-animated" alt="Profile picture" />
                  <div v-if="isAuthenticated" class="avatar-edit">✎</div>
                </template>

                <template v-else>
                  <span class="avatar-text avatar-animated">{{ avatarInitials }}</span>
                  <div v-if="isAuthenticated" class="avatar-edit">✎</div>
                </template>
              </div>

              <div class="profile-info">
                <div class="profile-label">Display name</div>
                <div class="profile-value">{{ displayName || userDisplayFallback }}</div>

                <div class="profile-label">Email</div>
                <div class="profile-value small">{{ userEmail || '—' }}</div>

                <div class="profile-status-row">
                  <div class="status-item">
                    <div class="status-label">Email verified</div>
                    <div class="status-value">
                      <strong v-if="emailVerified === true" class="ok">✓ Yes</strong>
                      <strong v-else-if="emailVerified === false" class="no">✗ No</strong>
                      <em v-else>Checking...</em>
                    </div>
                  </div>

                  <div class="status-item">
                    <div class="status-label">Cloud version</div>
                    <div class="status-value">{{ cloudVersion || '—' }}</div>
                  </div>
                </div>

                <div class="profile-actions-vertical">
                  <button v-if="emailVerified === false" @click="openVerifyFromProfile()"
                    class="warn btn-animated">Verify
                    Email</button>
                  <button @click="refreshSession()" class="btn-animated">Refresh</button>
                  <button @click="signOut()" class="btn-animated">Sign Out</button>

                  <!-- Remove avatar button shown only when signed in and avatar exists -->
                  <button v-if="isAuthenticated && (avatarKey || avatarUrl || avatarPreview)" @click="removeAvatar()"
                    class="ghost btn-animated">Remove Avatar</button>
                </div>
              </div>
            </aside>
          </transition>

          <!-- Right: Actions panel -->
          <transition name="panel-pop" mode="out-in">
            <section class="actions-panel" key="actions-panel">
              <!-- file input for avatar (hidden) -->
              <input ref="avatarInput" type="file" accept="image/*" @change="onAvatarSelected" style="display:none" />

              <!-- CHANGE USERNAME: only show when signed in -->
              <div v-if="isAuthenticated" class="card change-username-card enter-soft">
                <h4>Change Username</h4>
                <div class="change-row">
                  <input v-model="newDisplayName" placeholder="New Username" />
                  <button @click="changeDisplayName()" class="btn-animated">Update</button>
                </div>
                <p class="hint">🌸 YooA whispers: Display names are saved to your profile (custom:displayName).</p>
              </div>

              <!-- Avatar preview + save action (when user picks a file but hasn't saved yet) -->
              <div v-if="avatarPreview && isAuthenticated" class="card preview-card enter-soft">
                <h4>Avatar preview</h4>
                <div class="preview-row">
                  <img :src="avatarPreview" alt="Preview" class="preview-img avatar-animated" />
                  <div class="preview-actions">
                    <button @click="saveAvatarToS3()" class="primary btn-animated">Save Avatar</button>
                    <button @click="cancelAvatarPreview()" class="ghost btn-animated">Cancel</button>
                  </div>
                </div>
              </div>

              <!-- Verification card: shown when explicit verify flow active -->
              <div v-if="authView === 'verify'" class="card auth-card verify-card enter-soft">
                <div class="verify-instruction">
                  Check your email — enter the verification code sent to <strong>{{ pendingUsername || email }}</strong>
                </div>

                <input v-model="verificationCode" placeholder="Verification Code" type="text" ref="verificationInput" />

                <div class="auth-actions" style="display:flex; gap:8px; flex-wrap:wrap;">
                  <button @click="verifySignUp()" class="btn-animated">Verify</button>
                  <button @click="resendVerification()" class="btn-animated">Resend Code</button>

                  <!-- NEW: Back button to return to the previous view -->
                  <button @click="goBackFromVerify()" class="ghost btn-animated">Back</button>
                </div>
              </div>

              <!-- If not signed in: auth entry choices or forms -->
              <div v-else-if="!isAuthenticated" class="card auth-card auth-flow-card enter-soft">
                <div v-if="authView === 'choice'" class="auth-choice">
                  <button class="big btn-animated" @click="goToSignIn()">Sign In</button>
                  <button class="big btn-animated" @click="goToSignUp()">Sign Up</button>
                </div>

                <div v-if="authView === 'signin'" class="form-block">
                  <input v-model="email" placeholder="Email" type="email" />
                  <div class="password-field">
                    <input v-model="password" :type="showPassword.signin ? 'text' : 'password'" placeholder="Password"
                      aria-label="Password" />
                    <button type="button" class="password-toggle" :aria-pressed="showPassword.signin"
                      @click="toggleShow('signin')" :title="showPassword.signin ? 'Hide password' : 'Show password'"
                      aria-label="Toggle password visibility">
                      <!-- eye / eye-off icons -->
                      <svg v-if="!showPassword.signin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20"
                        height="20" aria-hidden="true" focusable="false">
                        <path fill="#6b1b6b"
                          d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zM12 9a3 3 0 100 6 3 3 0 000-6z" />
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                        aria-hidden="true" focusable="false">
                        <path fill="#6b1b6b"
                          d="M2.1 2.1L.69 3.51l3.03 3.03C2.33 8.14 1.16 9.96 1 12c1.73 3.89 6 7 11 7 1.79 0 3.47-.34 5.02-.94l3.29 3.29 1.41-1.41L2.1 2.1zM12 17c-3.87 0-7.12-2.69-8.64-6 0-.06.01-.12.01-.18L8.1 11.7A5 5 0 0012 17zm7.9 1.1l-2.27-2.27A10.45 10.45 0 0023 12c-1.73-3.89-6-7-11-7-1.76 0-3.43.34-4.96.95L6.7 7.2A8.02 8.02 0 0112 5c3.87 0 7.12 2.69 8.64 6 0 .06-.01.12-.01.18l1.27 1.27L19.9 18.1z" />
                      </svg>
                    </button>
                  </div>

                  <div class="auth-actions">
                    <button @click="doSignIn()" class="btn-animated">Sign In</button>
                    <button @click="goToSignUp()" class="btn-animated">Sign Up</button>
                  </div>
                  <div class="auth-link-row">
                    <a href="#" @click.prevent="startForgotPassword">Forgot Password?</a>
                  </div>
                </div>

                <div v-if="authView === 'signup'" class="form-block">
                  <input v-model="email" placeholder="Email" type="email" />
                  <div class="password-field">
                    <input v-model="password" :type="showPassword.signup ? 'text' : 'password'" placeholder="Password"
                      aria-label="Password" />
                    <button type="button" class="password-toggle" :aria-pressed="showPassword.signup"
                      @click="toggleShow('signup')" :title="showPassword.signup ? 'Hide password' : 'Show password'"
                      aria-label="Toggle password visibility">
                      <svg v-if="!showPassword.signup" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20"
                        height="20" aria-hidden="true" focusable="false">
                        <path fill="#6b1b6b"
                          d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zM12 9a3 3 0 100 6 3 3 0 000-6z" />
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                        aria-hidden="true" focusable="false">
                        <path fill="#6b1b6b"
                          d="M2.1 2.1L.69 3.51l3.03 3.03C2.33 8.14 1.16 9.96 1 12c1.73 3.89 6 7 11 7 1.79 0 3.47-.34 5.02-.94l3.29 3.29 1.41-1.41L2.1 2.1zM12 17c-3.87 0-7.12-2.69-8.64-6 0-.06.01-.12.01-.18L8.1 11.7A5 5 0 0012 17zm7.9 1.1l-2.27-2.27A10.45 10.45 0 0023 12c-1.73-3.89-6-7-11-7-1.76 0-3.43.34-4.96.95L6.7 7.2A8.02 8.02 0 0112 5c3.87 0 7.12 2.69 8.64 6 0 .06-.01.12-.01.18l1.27 1.27L19.9 18.1z" />
                      </svg>
                    </button>
                  </div>

                  <div class="password-field">
                    <input v-model="confirmPassword" :type="showPassword.confirmSignup ? 'text' : 'password'"
                      placeholder="Confirm Password" aria-label="Confirm password" />
                    <button type="button" class="password-toggle" :aria-pressed="showPassword.confirmSignup"
                      @click="toggleShow('confirmSignup')"
                      :title="showPassword.confirmSignup ? 'Hide confirm password' : 'Show confirm password'"
                      aria-label="Toggle confirm password visibility">
                      <svg v-if="!showPassword.confirmSignup" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        width="20" height="20" aria-hidden="true" focusable="false">
                        <path fill="#6b1b6b"
                          d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zM12 9a3 3 0 100 6 3 3 0 000-6z" />
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                        aria-hidden="true" focusable="false">
                        <path fill="#6b1b6b"
                          d="M2.1 2.1L.69 3.51l3.03 3.03C2.33 8.14 1.16 9.96 1 12c1.73 3.89 6 7 11 7 1.79 0 3.47-.34 5.02-.94l3.29 3.29 1.41-1.41L2.1 2.1zM12 17c-3.87 0-7.12-2.69-8.64-6 0-.06.01-.12.01-.18L8.1 11.7A5 5 0 0012 17zm7.9 1.1l-2.27-2.27A10.45 10.45 0 0023 12c-1.73-3.89-6-7-11-7-1.76 0-3.43.34-4.96.95L6.7 7.2A8.02 8.02 0 0112 5c3.87 0 7.12 2.69 8.64 6 0 .06-.01.12-.01.18l1.27 1.27L19.9 18.1z" />
                      </svg>
                    </button>
                  </div>

                  <div class="auth-actions">
                    <button @click="doSignUp()" class="btn-animated">Create Account</button>
                    <button @click="goToSignIn()" class="btn-animated">Back to Sign In</button>
                  </div>
                </div>

                <div v-if="authView === 'forgot-request'" class="form-block">
                  <div class="verify-instruction">Enter your email to receive a password reset code</div>
                  <input v-model="email" placeholder="Email" type="email" />
                  <div class="auth-actions">
                    <button @click="sendForgotPasswordCode()" class="btn-animated">Send Code</button>
                    <button @click="goToSignIn()" class="btn-animated">Cancel</button>
                  </div>
                </div>

                <div v-if="authView === 'forgot-submit'" class="form-block">
                  <div class="verify-instruction">Enter the code you received and your new password</div>
                  <input v-model="verificationCode" placeholder="Code" type="text" />
                  <div class="password-field">
                    <input v-model="newPassword" :type="showPassword.newPassword ? 'text' : 'password'"
                      placeholder="New Password" aria-label="New password" />
                    <button type="button" class="password-toggle" :aria-pressed="showPassword.newPassword"
                      @click="toggleShow('newPassword')"
                      :title="showPassword.newPassword ? 'Hide new password' : 'Show new password'"
                      aria-label="Toggle new password visibility">
                      <svg v-if="!showPassword.newPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        width="20" height="20" aria-hidden="true" focusable="false">
                        <path fill="#6b1b6b"
                          d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zM12 9a3 3 0 100 6 3 3 0 000-6z" />
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                        aria-hidden="true" focusable="false">
                        <path fill="#6b1b6b"
                          d="M2.1 2.1L.69 3.51l3.03 3.03C2.33 8.14 1.16 9.96 1 12c1.73 3.89 6 7 11 7 1.79 0 3.47-.34 5.02-.94l3.29 3.29 1.41-1.41L2.1 2.1zM12 17c-3.87 0-7.12-2.69-8.64-6 0-.06.01-.12.01-.18L8.1 11.7A5 5 0 0012 17zm7.9 1.1l-2.27-2.27A10.45 10.45 0 0023 12c-1.73-3.89-6-7-11-7-1.76 0-3.43.34-4.96.95L6.7 7.2A8.02 8.02 0 0112 5c3.87 0 7.12 2.69 8.64 6 0 .06-.01.12-.01.18l1.27 1.27L19.9 18.1z" />
                      </svg>
                    </button>
                  </div>

                  <div class="auth-actions">
                    <button @click="submitForgotPassword()" class="btn-animated">Reset Password</button>
                    <button @click="goToSignIn()" class="btn-animated">Cancel</button>
                  </div>
                </div>
              </div><br>
            </section>
          </transition>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { Amplify } from 'aws-amplify';
import awsExports from '@/aws-exports';
import Notification from '@/components/comps/Notification.vue'

// v6 storage helpers (note: v6 helpers expect object params in many calls)
import { uploadData, getUrl, remove as storageRemove } from 'aws-amplify/storage';

import {
  signUp as v6signUp,
  signIn as v6signIn,
  signOut as v6signOut,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  updateUserAttributes,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword
} from 'aws-amplify/auth';

import { autoSave, changeAutoInt, changeOffline, changeNews, changeNotation } from "@/incremental/options.js";
import { save, exportSave, importSave, hardReset } from "@/incremental/save.js";
import { cloudSaveRaw, cloudLoadRaw, fromBase64Safe } from "@/incremental/cloud.js";

Amplify.configure(awsExports);
const API = "https://z4frjlkbjb.execute-api.us-east-1.amazonaws.com/dev";

export default {
  name: 'Options',
  components: { Notification },
  data() {
    return {
      subtab: "saving",

      // auth UI state
      authView: 'choice',
      previousAuthView: null,
      email: "",
      password: "",
      confirmPassword: "",
      newPassword: "",
      verificationCode: "",
      newDisplayName: "",

      pendingUsername: "",
      emailVerified: null, // null = checking, true = verified, false = not verified

      user: null,
      token: null,
      displayName: null,
      cloudVersion: 0,

      // avatar support
      avatarKey: null,       // short S3 key saved in Cognito (e.g. "avatars/user-123.png")
      avatarUrl: null,       // signed URL for display
      avatarPreview: null,    // temporary local preview (data URL) before save

      // cloud modal state
      cloudModalVisible: false,
      cloudModalType: null, // 'save' or 'load'
      // inside data()
      cloudModalLocal: { size: 0, sizeHuman: '—', sample: '', timePlayed: '—', yooaPoints: '—' },
      cloudModalCloud: { exists: false, version: null, size: 0, sizeHuman: '—', sample: '', timePlayed: '—', yooaPoints: '—' },
      cloudModalRawLocal: null,
      cloudModalRawCloud: null,
      cloudModalSlot: 'main',
      cloudModalLoading: false,

      // add this entry inside data()'s returned object
      showPassword: {
        signin: false,
        signup: false,
        confirmSignup: false,
        newPassword: false
      },
    };
  },

  computed: {
    confirmations() { return options.confirmations },
    currentTab() { return this.subtab },
    interval() { return formatWhole(options.autosaveInterval) + "s" },
    notation() { return options.notation},
    autoSaveOn() { return options.autosave ? "ON" : "OFF" },
    offlineOn() { return options.offline ? "ON" : "OFF" },
    newsOn() { return options.news ? "ON" : "OFF" },

    // TRUE only when we have a real authenticated session token
    isAuthenticated() {
      return !!this.token;
    },

    // UI helpers
    userEmail() {
      return this.user?.attributes?.email || this.user?.email || null;
    },
    userDisplayFallback() {
      return this.user?.username || this.userEmail || "Unknown Adventurer";
    },
    avatarInitials() {
      const name = this.displayName || this.user?.username || this.userEmail || '';
      if (!name) return 'Y';
      const parts = (name + '').split(/[\s.@_-]+/).filter(Boolean);
      if (parts.length === 1) return (parts[0][0] || 'Y').toUpperCase();
      return ((parts[0][0] || '') + (parts[1][0] || '')).toUpperCase();
    },
    modalActionLabelOverwrite() {
      return this.cloudModalType === 'save' ? 'Overwrite Cloud with Local' : 'Overwrite Local with Cloud';
    },
    modalActionLabelKeep() {
      return this.cloudModalType === 'save' ? 'Keep Cloud (Cancel)' : 'Keep Local (Cancel)';
    },
    // NEW: highlight when cloud differs from local (time or YooA points)
    cloudDiff() {
      if (!this.cloudModalCloud || !this.cloudModalCloud.exists) return false;
      // simple string compare - already formatted in modal as strings like "2h 3m 4s" or number
      return (String(this.cloudModalLocal.timePlayed) !== String(this.cloudModalCloud.timePlayed))
        || (String(this.cloudModalLocal.yooaPoints) !== String(this.cloudModalCloud.yooaPoints));
    }
  },

  async mounted() {
    window.addEventListener("GAME_EVENT.UPDATE", this.update)
    try {
      const session = await fetchAuthSession();
      const hasTokens = !!(session && session.tokens && session.tokens.idToken);
      if (hasTokens) {
        this.token = session.tokens.idToken?.toString?.() || null;
        try {
          const u = await getCurrentUser();
          this.user = u || null;
        } catch (uErr) {
          console.warn('getCurrentUser returned error even though session tokens exist:', uErr);
          this.user = null;
        }
        await this.fetchAndApplyAttributes();
        if (this.authView !== 'verify') this.authView = 'profile';
      } else {
        this.user = null;
        this.token = null;
        this.authView = 'choice';
        this.emailVerified = false;
      }
    } catch (err) {
      console.warn('mounted session/user check error', err);
      this.user = null;
      this.token = null;
      this.authView = 'choice';
      if (this.emailVerified === null) this.emailVerified = false;
    }
  },

  beforeUnmount() {
    window.removeEventListener("GAME_EVENT.UPDATE", this.update)
  },

  methods: {
    changeTab(tabName, subtab) { this.subtab = subtab; try { player.tab = tabName; player.subtabs[tabName] = subtab; } catch (e) {/**/ } },
    confirmText(layer, value) { return `${layer}: ${value ? "ON" : "OFF"}`; },
    toggleConfirmation(layer) { options.confirmations[layer] = !options.confirmations[layer]; },
    notify(message, type = 'saved', bgColor = null, layerName = null, duration = 2000) {
      window.dispatchEvent(new CustomEvent('notify', {
        detail: { message, type, bgColor, layerName, duration }
      }));
    },

    update() {
      this.subtab = player.subtabs["Options"]
    },

    // attempt to extract player object from raw saved payload
    _extractStatsFromRaw(raw) {
      // returns { timePlayed: '—', yooaPoints: '—' } or real values
      const empty = { timePlayed: '—', yooaPoints: '—' };
      if (!raw) return empty;

      let parsed = null;
      // Try: fromBase64Safe (handles encoded objects) -> JSON.parse raw -> null
      try {
        parsed = fromBase64Safe(raw) || null;
      } catch (e) {
        parsed = null;
      }

      if (!parsed) {
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          // maybe it's base64-like but not recognized, already tried fromBase64Safe above
          parsed = null;
        }
      }

      // If structure is { player: { ... } } use that
      const playerObj = parsed ? (parsed.player || parsed) : null;

      // Fallback to global `player` if needed/livable
      const source = playerObj || (typeof player !== 'undefined' ? player : null);
      if (!source) return empty;

      const tp = source?.stats?.General?.totalTime ?? source?.stats?.general?.totalTime ?? null;
      const yp = (typeof source?.YooAPoints !== 'undefined') ? source.YooAPoints : (typeof source?.yooaPoints !== 'undefined' ? source.yooaPoints : null);

      return {
        timePlayed: (tp !== null && typeof tp !== 'undefined') ? formatTime(tp) : '—',
        yooaPoints: (yp !== null && typeof yp !== 'undefined') ? format(yp) : '—'
      };
    },

    save, exportSave, importSave, hardReset, autoSave, changeAutoInt, changeOffline, changeNews, changeNotation,

    goToSignIn() { this.authView = 'signin'; },
    goToSignUp() { this.authView = 'signup'; this.confirmPassword = ""; },

    toggleShow(field) {
      if (!this.showPassword || !(field in this.showPassword)) return;
      this.showPassword[field] = !this.showPassword[field];

      // keep focus on the input after toggling where possible
      this.$nextTick(() => {
        try {
          const ariaMap = {
            signin: 'Password',
            signup: 'Password',
            confirmSignup: 'Confirm password',
            newPassword: 'New password'
          };
          const sel = `input[aria-label="${ariaMap[field]}"]`;
          const el = this.$el ? this.$el.querySelector(sel) : null;
          if (el && typeof el.focus === 'function') el.focus();
        } catch (e) { /* ignore */ }
      });
    },

    focusVerificationInput() {
      this.$nextTick(() => {
        try { const el = this.$refs.verificationInput; if (el && typeof el.focus === 'function') el.focus(); } catch (e) {/* */ }
      });
    },

    /* ---------- AVATAR: trigger file input ---------- */
    triggerAvatarUpload() {
      if (!this.isAuthenticated) return;
      const el = this.$refs.avatarInput;
      if (el && el.click) el.click();
    },

    onAvatarSelected(evt) {
      const file = (evt.target && evt.target.files && evt.target.files[0]) || null;
      if (!file) return;
      // Basic client-side size check (2 MB)
      const maxBytes = 2 * 1024 * 1024;
      if (file.size > maxBytes) {
        this.notify('🌸 YooA says: That image is too big — please choose a file under 2 MB.', 'error');
        evt.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target.result; // data URL for preview only
      };
      reader.onerror = () => {
        this.notify('🌸 YooA says: Could not read that image file.', 'error');
      };
      reader.readAsDataURL(file);
    },

    cancelAvatarPreview() {
      this.avatarPreview = null;
      if (this.$refs.avatarInput) this.$refs.avatarInput.value = '';
    },

    // Save preview -> S3, then store the S3 key in Cognito (custom:picture)
    async saveAvatarToS3() {
      if (!this.avatarPreview) {
        this.notify('🌸 YooA says: No avatar selected.', 'error');
        return
      }

      // try to get original File object from input if possible
      const input = this.$refs.avatarInput;
      const file = (input && input.files && input.files[0]) || null;

      let fileToUpload = null;
      let contentType = 'image/png';

      if (file) {
        fileToUpload = file;
        contentType = file.type || contentType;
      } else {
        // fallback: if we only have dataURL preview, convert to blob
        try {
          const blob = this.dataUrlToBlob(this.avatarPreview);
          fileToUpload = blob;
          contentType = blob.type || contentType;
        } catch (e) {
          console.error('fallback blob conversion failed', e);
          this.notify('🌸 YooA whispers... "Could not prepare the image for upload."', 'error');
          return
        }
      }

      // build a safe key
      const safeName = (this.user?.username || this.user?.attributes?.email || 'user').toString().replace(/[^a-zA-Z0-9-_]/g, '_');
      const ext = (contentType.split('/')[1] || 'png').replace(/[^a-zA-Z0-9]/g, '');
      const key = `avatars/${safeName}-${Date.now()}.${ext}`;

      await this.uploadFileAndSaveKey(fileToUpload, key, contentType);
    },

    // helper: perform the uploadData and update Cognito
    async uploadFileAndSaveKey(fileOrBlob, key, contentType) {
      try {
        console.info('Uploading avatar, generated key:', key);

        // uploadData returns a task/controller. The actual upload result may be inside .result (promise)
        const uploadTask = await uploadData({
          key,
          data: fileOrBlob,
          options: {
            contentType: contentType || 'application/octet-stream',
            level: 'protected'
          }
        });

        console.info('uploadTask (controller):', uploadTask);

        // If uploadTask has a 'result' promise, wait for it to resolve; otherwise use uploadTask directly
        let uploadRespFinal = uploadTask;
        try {
          if (uploadTask && typeof uploadTask === 'object' && uploadTask.result instanceof Promise) {
            uploadRespFinal = await uploadTask.result;
            console.info('uploadTask.result resolved:', uploadRespFinal);
          } else {
            // some SDK shapes return final response directly
            uploadRespFinal = uploadTask;
          }
        } catch (e) {
          console.warn('waiting for uploadTask.result failed, falling back to controller object', e);
        }

        console.info('uploadRespFinal:', uploadRespFinal);

        // infer storedKey from uploadRespFinal when possible, otherwise use generated key
        let storedKey = key;
        try {
          if (uploadRespFinal && typeof uploadRespFinal === 'object') {
            if ('key' in uploadRespFinal && uploadRespFinal.key) storedKey = uploadRespFinal.key;
            else if (uploadRespFinal.result && uploadRespFinal.result.key) storedKey = uploadRespFinal.result.key;
            else if (uploadRespFinal.keyString) storedKey = uploadRespFinal.keyString;
            else if (uploadRespFinal.Location) storedKey = uploadRespFinal.Location; // sometimes SDK returns location
          } else if (typeof uploadRespFinal === 'string') {
            storedKey = uploadRespFinal;
          }
        } catch (e) {
          console.warn('Could not infer storedKey from upload response — using generated key', e);
        }

        console.info('Using storedKey for Cognito:', storedKey);

        // Save the short key to Cognito
        await updateUserAttributes({
          userAttributes: {
            'custom:picture': storedKey
          }
        });

        // Immediately request a signed URL for display (use v6 getUrl signature: pass an object)
        let signed = null;
        try {
          signed = await getUrl({
            key: storedKey,
            options: {
              level: 'protected'
            }
          });
          console.info('getUrl result:', signed);
        } catch (e) {
          console.warn('getUrl failed right after upload', e);
        }

        let urlStr = null;

        if (signed) {
          const urlObj = signed?.url || signed?.result?.url || null;
          if (urlObj) {
            urlStr = typeof urlObj === 'string' ? urlObj : urlObj.toString();
          } else if (typeof signed === 'string') {
            urlStr = signed;
          } else if (signed.Location && typeof signed.Location === 'string') {
            urlStr = signed.Location;
          }
        }

        if (urlStr) {
          this.avatarUrl = urlStr;
        }

        // update UI state immediately so user sees the new avatar
        this.avatarKey = storedKey;
        this.avatarPreview = null;
        if (this.$refs.avatarInput) this.$refs.avatarInput.value = '';

        // still refresh attributes to keep local state consistent (optional)
        try {
          await this.fetchAndApplyAttributes();
        } catch (e) {
          console.warn('fetchAndApplyAttributes after upload failed (non-fatal)', e);
        }

        this.notify('🌟 YooA says: Avatar uploaded and saved — you look adorable!', 'saved');
      } catch (err) {
        console.error('uploadFileAndSaveKey error', err);
        this.notify(`🌸 YooA whispers... "Could not update avatar: ${err?.message || err}"`, 'error')
      }
    },

    // convert dataURL to blob (fallback)
    dataUrlToBlob(dataUrl) {
      const arr = dataUrl.split(',');
      const match = arr[0].match(/:(.*?);/);
      const mime = match ? match[1] : 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },

    // remove avatar: remove S3 object (if key exists) and clear Cognito attribute
    async removeAvatar() {
      if (!confirm('🌸 YooA asks: Remove your avatar?')) return;
      try {
        // If we have an avatarKey, remove from S3 (v6 remove expects an object param)
        if (this.avatarKey) {
          try {
            await storageRemove({ key: this.avatarKey, level: 'protected' });
          } catch (e) {
            console.warn('failed to delete from storage (continuing):', e);
          }
        }

        // Clear attribute in Cognito
        await updateUserAttributes({
          userAttributes: {
            'custom:picture': ''
          }
        });

        // Clear UI
        this.avatarKey = null;
        this.avatarUrl = null;
        this.avatarPreview = null;
        if (this.$refs.avatarInput) this.$refs.avatarInput.value = '';

        await this.fetchAndApplyAttributes();
        this.notify('🌸 YooA says: Avatar removed.', 'saved');
      } catch (err) {
        console.error('removeAvatar error', err);
        this.notify(`🌸 YooA whispers... "Could not remove avatar: ${err?.message || err}"`, 'error');
      }
    },

    async changeDisplayName() {
      if (!this.newDisplayName.trim()) {
        this.notify('🌸 YooA floats in saying... "Empty usernames don\'t sparkle!" ✨', 'error');
        return;
      }

      try {
        await updateUserAttributes({
          userAttributes: {
            'custom:displayName': this.newDisplayName
          }
        });

        this.notify(
          '🌸 YooA twirls her wand! "Your shiny new username is now saved!" 🌸\n' +
          '🎶 May your adventures continue with extra sparkle! ✨',
          'saved'
        );

        await this.fetchAndApplyAttributes();
        this.newDisplayName = "";

      } catch (err) {
        const msg = err?.message || err || 'Unknown error';
        this.notify(`🌸 YooA whispers... "Oops! Username update failed: ${msg}" 🌸`, 'error');
      }
    },

    // Robust attribute fetch — first ensure we have a session
    async fetchAndApplyAttributes() {
      this.emailVerified = null;

      try {
        let session = null;
        try {
          session = await fetchAuthSession();
        } catch (sErr) {
          console.warn('no session available in fetchAndApplyAttributes:', sErr);
          this.emailVerified = false;
          return;
        }

        const hasTokens = !!(session && session.tokens && session.tokens.idToken);
        if (!hasTokens) {
          this.emailVerified = false;
          return;
        }

        let attrs = null;
        try {
          if (typeof fetchUserAttributes === 'function') {
            attrs = await fetchUserAttributes();
          }
        } catch (innerErr) {
          const msg = (innerErr && (innerErr.message || innerErr.code || innerErr.name)) || '';
          console.warn('fetchUserAttributes error:', innerErr);
          if (innerErr?.name === 'UserNotConfirmedException' || /not confirmed/i.test(msg)) {
            this.pendingUsername = this.pendingUsername || this.user?.username || this.email;
            this.displayName = (this.user && this.user.attributes && this.user.attributes['custom:displayName']) || null;
            this.emailVerified = false;
            this.user = null;
            this.authView = 'verify';
            this.notify('🌸 YooA says... "Your account is not confirmed. Please check your email for the verification code."', 'error');
            this.focusVerificationInput();
            return;
          }
        }

        const attrsMap = {};
        if (Array.isArray(attrs)) {
          attrs.forEach(a => {
            const name = a.Name || a.name;
            const value = a.Value || a.value;
            if (name) attrsMap[name] = value;
          });
        } else if (attrs && typeof attrs === 'object' && Object.keys(attrs).length) {
          Object.assign(attrsMap, attrs);
        } else if (this.user && this.user.attributes && typeof this.user.attributes === 'object') {
          Object.assign(attrsMap, this.user.attributes);
        }

        // token decode fallback for email_verified
        let verifiedAttr = undefined;
        try {
          const idToken = session?.tokens?.idToken;
          let payload = null;
          if (idToken && typeof idToken === 'object' && idToken.payload) payload = idToken.payload;
          else if (idToken && typeof idToken === 'string') {
            const parts = idToken.split('.');
            if (parts.length >= 2) {
              try { payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) {/* */ }
            }
          }
          if (payload) {
            if ('email_verified' in payload) verifiedAttr = payload.email_verified;
            else if ('emailVerified' in payload) verifiedAttr = payload.emailVerified;
          }
        } catch (e) { /* ignore */ }

        if (verifiedAttr === undefined) {
          if ('email_verified' in attrsMap) verifiedAttr = attrsMap['email_verified'];
          else if ('emailVerified' in attrsMap) verifiedAttr = attrsMap['emailVerified'];
        }

        if (verifiedAttr === undefined || verifiedAttr === null) this.emailVerified = false;
        else if (typeof verifiedAttr === 'boolean') this.emailVerified = verifiedAttr;
        else if (typeof verifiedAttr === 'string') this.emailVerified = verifiedAttr.toLowerCase() === 'true';
        else this.emailVerified = !!verifiedAttr;

        // Merge attributes into this.user for UI
        this.user = { ...this.user, attributes: { ...(this.user?.attributes || {}), ...attrsMap } };
        this.displayName = attrsMap['custom:displayName'] || attrsMap['name'] || this.displayName || null;

        // Avatar handling:
        const pic = attrsMap['custom:picture'] || attrsMap['picture'] || null;

        // If pic looks like a data URL (legacy), show it directly
        if (pic && typeof pic === 'string' && pic.startsWith('data:')) {
          this.avatarKey = null;
          this.avatarUrl = pic;
        } else if (pic && typeof pic === 'string') {
          // assume this is the S3 key -> fetch signed URL
          this.avatarKey = pic;
          try {
            const signed = await getUrl({
              key: pic,
              options: {
                level: 'protected'
              }
            });

            // Extract URL - it's a URL object in v6, not a string
            const signedUrlObj = signed?.url || signed?.result?.url || null;

            if (signedUrlObj) {
              // Convert URL object to string
              const urlStr = typeof signedUrlObj === 'string'
                ? signedUrlObj
                : signedUrlObj.toString();

              this.avatarUrl = urlStr;
            } else {
              this.avatarUrl = null;
            }
          } catch (e) {
            console.warn('failed to get signed url for avatarKey', e);
            this.avatarUrl = null;
          }
        } else {
          this.avatarKey = null;
          this.avatarUrl = null;
        }
      } catch (err) {
        console.error('fetchAndApplyAttributes failed:', err);
        const msg = (err && (err.message || err.code || err.name)) || '';
        if (err?.name === 'UserNotConfirmedException' || /not confirmed/i.test(msg)) {
          this.pendingUsername = this.pendingUsername || this.user?.username || this.email;
          this.displayName = (this.user && this.user.attributes && this.user.attributes['custom:displayName']) || null;
          this.emailVerified = false;
          this.user = null;
          this.authView = 'verify';
          this.notify('🌸 YooA says... "Your account is not confirmed. Please check your email for the verification code."', 'error');
          this.focusVerificationInput();
          return;
        }
        this.emailVerified = false;
      } finally {
        if (this.emailVerified === null) setTimeout(() => { if (this.emailVerified === null) this.emailVerified = false; }, 2500);
      }
    },

    async doSignUp() {
      if (!this.email || !this.password || !this.confirmPassword) {
        this.notify('🌸 YooA says... "Empty fields are not allowed!"\n🎶 Please fill in all fields to create your magical account! 🔑✨', 'error');
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.notify('🌸 YooA says... "Passwords do not match!"\n🎶 Make sure your password and confirmation match. 🔐', 'error');
        return;
      }

      try {
        this.pendingUsername = this.email;
        await v6signUp({
          username: this.email,
          password: this.password,
          options: {
            userAttributes: {
              email: this.email,
              'custom:displayName': this.newDisplayName || ''
            }
          }
        });
        this.notify(`🌟 Welcome, ${this.email}! Your account has been created.`, 'saved');
        this.authView = 'verify';
        this.focusVerificationInput();
      } catch (err) {
        this.notify(`🌸 YooA says... "Sign up failed: ${err?.message || err}"`, 'error');
      }
    },

    async verifySignUp() {
      const username = (this.pendingUsername || this.email || "").trim();
      const code = (this.verificationCode || "").trim();
      if (!username) return this.notify('🌸 YooA says... "Missing username/email for verification."', 'error');
      if (!code) return this.notify('🌸 YooA says... "Please enter the verification code."', 'error');

      try {
        await confirmSignUp({ username: username, confirmationCode: code });
        this.notify('✅ YooA says: Email verified successfully!', 'saved');
        this.pendingUsername = "";
        this.emailVerified = true;

        if (this.password) {
          try {
            await v6signIn({ username, password: this.password });
          } catch (e) {
            console.warn('Auto sign-in after verify failed:', e);
          }
        }

        await new Promise(r => setTimeout(r, 250));
        let session = null;
        try {
          session = await fetchAuthSession();
        } catch (e) {
          console.warn('fetchAuthSession after verify returned error (likely guest):', e);
        }

        const hasTokens = !!(session && session.tokens && session.tokens.idToken);
        if (hasTokens) {
          this.token = session.tokens.idToken?.toString() || null;
          try {
            const u = await getCurrentUser();
            this.user = u || { username };
          } catch (uErr) {
            console.warn('getCurrentUser after verify/signin failed:', uErr);
            this.user = { username };
          }
          await this.fetchAndApplyAttributes();
          this.authView = 'profile';
          this.notify(`🌟 YooA says: Welcome back, ${username}! You're signed in.`, 'saved');
        } else {
          this.user = null;
          this.token = null;
          this.emailVerified = true;
          this.authView = 'signin';
          this.notify('🌸 YooA says: Verification complete! Please sign in to access your profile and cloud saves.', 'saved');
          this.focusVerificationInput();
        }
      } catch (err) {
        this.notify(`🌸 YooA says... "Verification failed: ${err?.message || err}"`, 'error');
      }
    },

    openVerifyFromProfile() {
      this.pendingUsername = this.pendingUsername || this.email || (this.user && (this.user.username || this.user.attributes?.email));
      if (!this.email && this.pendingUsername) this.email = this.pendingUsername;
      this.verificationCode = "";
      this.previousAuthView = this.authView || (this.isAuthenticated ? 'profile' : 'choice');
      this.authView = 'verify';
      this.focusVerificationInput();
    },

    // New: go back to the previous auth view (or a sensible default)
    goBackFromVerify() {
      // sensible fallback: if user was signed in show profile, else go to choice
      if (this.isAuthenticated) this.authView = 'profile';
      else this.authView = this.previousAuthView || 'choice';
      // clear pendingUsername to avoid leaking stale state
      this.pendingUsername = '';
    },

    async resendVerification() {
      const username = (this.pendingUsername || this.email || "").trim();
      if (!username) return this.notify('🌸 YooA says... "Provide the email to resend code."', 'error');
      try {
        await resendSignUpCode({ username });
        this.notify('🌟 YooA says: Verification code resent — check your email!', 'saved');
      } catch (err) {
        this.notify(`🌸 YooA says... "Resend failed: ${err?.message || err}"`, 'error');
      }
    },

    async doSignIn() {
      if (!this.email || !this.password) {
        this.notify('🌸 YooA says... "Empty fields are not allowed!"', 'error');
        return;
      }

      let signInResult = null;
      try {
        signInResult = await v6signIn({ username: this.email, password: this.password });
      } catch (err) {
        const msg = err?.message || '';
        if (err?.name === 'UserNotConfirmedException' || /not confirmed/i.test(msg)) {
          this.pendingUsername = this.email || this.pendingUsername;
          this.emailVerified = false;
          this.user = null;
          this.authView = 'verify';
          this.notify('🌸 YooA says... "Your account must be verified first. Redirecting to verification."', 'error');
          this.focusVerificationInput();
          return;
        }
        this.notify(`🌸 YooA says... "Sign in failed: ${msg || err}"`, 'error');
        return;
      }

      await new Promise(r => setTimeout(r, 250));

      let session = null;
      try {
        session = await fetchAuthSession();
      } catch (e) {
        console.warn('fetchAuthSession after signIn failed or returned guest:', e);
      }

      const hasTokens = !!(session && session.tokens && session.tokens.idToken);
      if (!hasTokens) {
        console.warn('Sign-in completed but no tokens present. Treating as unconfirmed/incomplete.', { signInResult, session });

        if (signInResult?.challengeName) {
          console.info('signIn returned challenge:', signInResult.challengeName);
        }

        this.pendingUsername = this.email;
        this.user = null;
        this.token = null;
        this.emailVerified = false;
        this.authView = 'verify';
        this.notify('🌸 YooA says... "Sign in incomplete — your account may need verification. Check your email for the code."', 'error');
        this.focusVerificationInput();
        return;
      }

      this.token = session.tokens.idToken?.toString() || null;

      try {
        const u = await getCurrentUser();
        this.user = u || { username: this.email };
      } catch (uErr) {
        console.warn('getCurrentUser after signIn failed:', uErr);
        this.user = { username: this.email };
      }

      await this.fetchAndApplyAttributes();

      if (this.authView !== 'verify') {
        this.notify(`🌟 YooA says: Signed in as ${this.email}`, 'saved');
        this.authView = 'profile';
      }
    },

    async signOut() {
      try {
        await v6signOut();
        this.user = null; this.token = null; this.emailVerified = null; this.authView = 'choice';
        this.avatarKey = null;
        this.avatarUrl = null;
        this.avatarPreview = null;
        this.notify('🌸 YooA says: Signed out.', 'saved');
      } catch (err) {
        this.notify(`🌸 YooA says... "Sign out failed: ${err?.message || err}"`, 'error');
      }
    },

    startForgotPassword() { this.verificationCode = ""; this.newPassword = ""; this.authView = 'forgot-request'; },

    async sendForgotPasswordCode() {
      if (!this.email) return this.notify('🌸 YooA says... "Please enter your email to reset password."', 'error');
      try { await resetPassword({ username: this.email }); this.notify('🌟 YooA says: Reset code sent to your email. Enter the code and new password.', 'error'); this.authView = 'forgot-submit'; }
      catch (err) { this.notify(`🌸 YooA says... "Could not send reset code: ${err?.message || err}"`, 'error'); }
    },

    async submitForgotPassword() {
      if (!this.email || !this.verificationCode || !this.newPassword) return this.notify('🌸 YooA says... "Fill all fields to reset your password."', 'error');
      try { await confirmResetPassword({ username: this.email, confirmationCode: this.verificationCode, newPassword: this.newPassword }); this.notify('✅ YooA says: Your password has been reset. Please sign in with your new password.', 'saved'); this.authView = 'signin'; }
      catch (err) { this.notify(`🌸 YooA says... "Reset failed: ${err?.message || err}"`, 'error'); }
    },

    async refreshSession() {
      try {
        const session = await fetchAuthSession({ forceRefresh: true });
        this.token = session?.tokens?.idToken?.toString() || null;
        await this.fetchAndApplyAttributes();
        this.notify('🌟 YooA says: Session and attributes refreshed.', 'saved');
      } catch (err) { this.notify(`🌸 YooA says... "Could not refresh session: ${err?.message || err}"`, 'error'); }
    },

    /* ---------- New modal helpers & updated cloud flows ---------- */

    // Open Cloud Save confirmation modal (shows local vs cloud)
    async openCloudSaveConfirm(slot = 'main') {
      try {
        const session = await fetchAuthSession().catch(() => null);
        this.token = session?.tokens?.idToken?.toString?.() || null;
      } catch (e) {
        this.token = null;
      }

      if (!this.token || this.emailVerified === false) {
        return this.notify('🌸 YooA says... "You must have a verified account and be signed in to use Cloud Save."', 'error');
      }

      this.cloudModalType = 'save';
      this.cloudModalSlot = slot;
      this.cloudModalLoading = true;
      this.cloudModalVisible = true;

      // prepare local save
      let localStr = null;
      try {
        localStr = await Promise.resolve(exportSave());
      } catch (e) {
        console.error('exportSave failed for modal', e);
      }
      if (!localStr || typeof localStr !== 'string') localStr = JSON.stringify({ player, options });

      // produce sample & sizes
      this.cloudModalRawLocal = localStr;
      this.cloudModalLocal.size = new Blob([localStr]).size;
      this.cloudModalLocal.sizeHuman = this._humanBytes(this.cloudModalLocal.size);
      this.cloudModalLocal.sample = this._sampleString(localStr);

      // extract the two stats for local
      const statsLocal = this._extractStatsFromRaw(localStr);
      this.cloudModalLocal.timePlayed = statsLocal.timePlayed;
      this.cloudModalLocal.yooaPoints = statsLocal.yooaPoints;

      // fetch cloud save (if exists) to show comparison
      let cloudResp = null;
      try {
        cloudResp = await cloudLoadRaw(this.token, slot).catch(() => null);
      } catch (e) {
        console.warn('cloudLoadRaw for save-confirm failed', e);
        cloudResp = null;
      }

      if (!cloudResp || !cloudResp.raw) {
        // no cloud save found
        this.cloudModalCloud = { exists: false, version: null, size: 0, sizeHuman: '—', sample: '', timePlayed: '—', yooaPoints: '—' };
      } else {
        const cloudRaw = cloudResp.raw;
        this.cloudModalRawCloud = cloudRaw;
        const cloudSize = new Blob([cloudRaw]).size;
        const statsCloud = this._extractStatsFromRaw(cloudRaw);
        this.cloudModalCloud = {
          exists: true,
          version: cloudResp.version || null,
          size: cloudSize,
          sizeHuman: this._humanBytes(cloudSize),
          sample: this._sampleString(cloudRaw),
          timePlayed: statsCloud.timePlayed,
          yooaPoints: statsCloud.yooaPoints
        };
      }

      this.cloudModalLoading = false;
    },

    // Open Cloud Load confirmation modal (shows local vs cloud)
    async openCloudLoadConfirm(slot = 'main') {
      try {
        const session = await fetchAuthSession().catch(() => null);
        this.token = session?.tokens?.idToken?.toString?.() || null;
      } catch (e) {
        this.token = null;
      }

      if (!this.token || this.emailVerified === false) {
        return this.notify('🌸 YooA says... "You must have a verified account and be signed in to use Cloud Load."', 'error');
      }

      this.cloudModalType = 'load';
      this.cloudModalSlot = slot;
      this.cloudModalLoading = true;
      this.cloudModalVisible = true;

      // local current save string
      let localStr = null;
      try {
        localStr = await Promise.resolve(exportSave());
      } catch (e) {
        console.error('exportSave failed for load-confirm', e);
      }
      if (!localStr || typeof localStr !== 'string') localStr = JSON.stringify({ player, options });

      this.cloudModalRawLocal = localStr;
      this.cloudModalLocal.size = new Blob([localStr]).size;
      this.cloudModalLocal.sizeHuman = this._humanBytes(this.cloudModalLocal.size);
      this.cloudModalLocal.sample = this._sampleString(localStr);

      // extract local stats
      const statsLocal = this._extractStatsFromRaw(localStr);
      this.cloudModalLocal.timePlayed = statsLocal.timePlayed;
      this.cloudModalLocal.yooaPoints = statsLocal.yooaPoints;

      // get cloud save
      let cloudResp = null;
      try {
        cloudResp = await cloudLoadRaw(this.token, slot).catch(() => null);
      } catch (e) {
        console.warn('cloudLoadRaw for load-confirm failed', e);
        cloudResp = null;
      }

      if (!cloudResp || !cloudResp.raw) {
        this.cloudModalCloud = { exists: false, version: null, size: 0, sizeHuman: '—', sample: '', timePlayed: '—', yooaPoints: '—' };
        this.cloudModalLoading = false;
        // If no cloud save, simply notify and close modal
        this.notify('🌸 YooA says: No cloud save found to load.', 'error');
        this.cloudModalVisible = false;
        return;
      }

      const cloudRaw = cloudResp.raw;
      this.cloudModalRawCloud = cloudRaw;
      const cloudSize = new Blob([cloudRaw]).size;
      const statsCloud = this._extractStatsFromRaw(cloudRaw);
      this.cloudModalCloud = {
        exists: true,
        version: cloudResp.version || null,
        size: cloudSize,
        sizeHuman: this._humanBytes(cloudSize),
        sample: this._sampleString(cloudRaw),
        timePlayed: statsCloud.timePlayed,
        yooaPoints: statsCloud.yooaPoints
      };

      this.cloudModalLoading = false;
    },

    closeCloudModal() {
      this.cloudModalVisible = false;
      this.cloudModalLoading = false;
      this.cloudModalType = null;
      this.cloudModalRawLocal = null;
      this.cloudModalRawCloud = null;
    },

    // Handler invoked when user clicks overwrite/keep in modal
    async confirmCloudAction(choice) {
      // choice: 'overwrite' or 'keep'
      if (this.cloudModalLoading) return;
      this.cloudModalLoading = true;

      const type = this.cloudModalType;
      const slot = this.cloudModalSlot;

      try {
        if (type === 'save') {
          if (choice === 'overwrite') {
            // perform cloud save using the prepared local raw
            try {
              const resp = await cloudSaveRaw(this.cloudModalRawLocal, this.token, slot);
              if (resp?.version) this.cloudVersion = resp.version;
              this.notify('🌟 YooA says: Cloud save successful!', 'saved');
              window.dispatchEvent(new Event('game-saved'));
            } catch (err) {
              console.error('confirmCloudAction overwrite save failed', err);
              this.notify(`🌸 YooA says... "Cloud save failed: ${err?.message || err}"`, 'error');
            }
          } else {
            // keep cloud: do nothing
            this.notify('🌸 YooA says: Kept cloud save — nothing changed.', 'saved');
          }
        } else if (type === 'load') {
          if (choice === 'overwrite') {
            // apply cloud to local. Prefer importSave if available.
            try {
              if (typeof importSave === 'function') {
                importSave(this.cloudModalRawCloud);
              } else {
                // fallback: try to decode base64 (if necessary) or treat as raw string that contains JSON
                const parsed = fromBase64Safe(this.cloudModalRawCloud) || (() => {
                  try { return JSON.parse(this.cloudModalRawCloud); } catch (e) { return null; }
                })();
                if (parsed) {
                  Object.assign(player, parsed.player || parsed);
                } else {
                  // cannot interpret cloud payload — warn
                  throw new Error('Could not interpret cloud payload to apply locally');
                }
              }
              this.cloudVersion = this.cloudModalCloud.version || this.cloudVersion;
              this.notify('🌟 YooA says: Cloud load applied to local save!', 'saved');
            } catch (err) {
              console.error('confirmCloudAction apply cloud failed', err);
              this.notify(`🌸 YooA says... "Could not apply cloud save: ${err?.message || err}"`, 'error');
            }
          } else {
            // keep local - cancel
            this.notify('🌸 YooA says: Kept local save — cloud not applied.', 'saved');
          }
        }
      } finally {
        this.cloudModalLoading = false;
        this.closeCloudModal();
      }
    },

    // small helper to compute human-readable bytes
    _humanBytes(bytes) {
      if (!bytes && bytes !== 0) return '—';
      const thresh = 1024;
      if (Math.abs(bytes) < thresh) return bytes + ' B';
      const units = ['KB', 'MB', 'GB', 'TB'];
      let u = -1;
      do {
        bytes /= thresh;
        ++u;
      } while (Math.abs(bytes) >= thresh && u < units.length - 1);
      return bytes.toFixed(1) + ' ' + units[u];
    },

    // helper to make a small sample preview for the modal
    _sampleString(str, max = 240) {
      if (!str) return '';
      const cleaned = String(str).replace(/\s+/g, ' ');
      if (cleaned.length <= max) return cleaned;
      return cleaned.slice(0, max) + ' …';
    },

    /* ---------- Legacy cloudSave/cloudLoad kept for reference but will route through modal functions ---------- */

    // Still available if other code calls it directly — performs immediate save (bypasses modal)
    async cloudSaveImmediate(slot = 'main') {
      try {
        const session = await fetchAuthSession().catch(() => null);
        this.token = session?.tokens?.idToken?.toString?.() || null;
      } catch (e) {
        this.token = null;
      }

      if (!this.token || this.emailVerified === false) {
        return this.notify('🌸 YooA says... "You must have a verified account and be signed in to use Cloud Save."', 'error');
      }

      try {
        if (typeof cloudSaveRaw === 'function') {
          if (typeof exportSave === 'function') {
            let saveStr;
            try {
              saveStr = await Promise.resolve(exportSave());
            } catch (e) {
              console.error('exportSave threw', e);
              this.notify('🌸 YooA whispers: Could not prepare the save (export failed).', 'error');
              return;
            }

            if (!saveStr || typeof saveStr !== 'string' || saveStr.length < 8) {
              console.error('Invalid saveStr from exportSave():', saveStr);
              this.notify('🌸 YooA says: Save string is empty or invalid — nothing was saved.', 'error');
              return;
            }

            const resp = await cloudSaveRaw(saveStr, this.token, slot);
            if (resp?.version) this.cloudVersion = resp.version;
            this.notify('🌟 YooA says: Cloud save successful!', 'saved');
            window.dispatchEvent(new Event('game-saved'));
            return;
          }

          const resp = await cloudSaveRaw({ player, options }, this.token, slot);
          if (resp?.version) this.cloudVersion = resp.version;
          this.notify('🌟 YooA says: Cloud save successful!', 'saved');
          window.dispatchEvent(new Event('game-saved'));
          return;
        }

        const res = await fetch(`${API}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ player, meta: { timestamp: new Date().toISOString() } })
        });

        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (data.version) this.cloudVersion = data.version;
        this.notify('🌟 YooA says: Cloud save successful!', 'saved');
        window.dispatchEvent(new Event('game-saved'));
      } catch (err) {
        console.error('cloudSave error', err);
        this.notify(`🌸 YooA says... "Cloud save failed: ${err?.message || err}"`, 'error');
      }
    },

    // Immediate cloud load bypassing modal (kept as fallback)
    async cloudLoadImmediate(slot = 'main') {
      try {
        const session = await fetchAuthSession().catch(() => null);
        this.token = session?.tokens?.idToken?.toString?.() || null;
      } catch (e) {
        this.token = null;
      }

      if (!this.token || this.emailVerified === false) {
        return this.notify('🌸 YooA says... "You must have a verified account and be signed in to use Cloud Load."', 'error');
      }

      try {
        if (typeof cloudLoadRaw === 'function') {
          const resp = await cloudLoadRaw(this.token, slot);
          if (!resp || !resp.raw) throw new Error('No cloud save found or could not decode saved data');

          if (typeof importSave === 'function') {
            try {
              importSave(resp.raw);
              this.cloudVersion = resp.version || this.cloudVersion;
              this.notify('🌟 YooA says: Cloud load successful!', 'saved');
              return;
            } catch (e) {
              console.warn('importSave failed, falling back to manual assign:', e);
            }
          }

          const parsed = resp.saved || fromBase64Safe(resp.raw);
          if (parsed) {
            Object.assign(player, parsed.player || parsed);
            this.cloudVersion = resp.version || this.cloudVersion;
            this.notify('🌟 YooA says: Cloud load successful! (fallback)', 'saved');
            return;
          }

          throw new Error('Could not interpret cloud save payload');
        }

        const res = await fetch(`${API}/load`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });

        if (res.status === 404) {
          return this.notify('🌸 YooA says: No cloud save found.', 'error');
        }
        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const data = await res.json();
        if (data.player) {
          Object.assign(player, data.player);
          this.cloudVersion = data.version || this.cloudVersion;
          this.notify('🌟 YooA says: Cloud load successful!', 'saved');
        } else if (data.data) {
          try {
            const decoded = fromBase64Safe(data.data);
            if (decoded) Object.assign(player, decoded.player || decoded);
            this.cloudVersion = data.version || this.cloudVersion;
            this.notify('🌟 YooA says: Cloud load successful!', 'saved');
          } catch (e) {
            throw new Error('Could not decode saved data');
          }
        }
      } catch (err) {
        console.error('cloudLoad error', err);
        this.notify(`🌸 YooA says... "Cloud load failed: ${err?.message || err}"`, 'error');
      }
    },

    async cloudSave() {
      try {
        const session = await fetchAuthSession().catch(() => null);
        this.token = session?.tokens?.idToken?.toString() || null;
      } catch (e) {
        this.token = null;
      }

      if (!this.token || this.emailVerified === false) {
        return this.notify('🌸 YooA says... "You must have a verified account and be signed in to use Cloud Save."', 'error');
      }

      try {
        // prefer cloudSaveRaw helper when available
        // safe export + validate
        if (typeof cloudSaveRaw === 'function') {
          if (typeof exportSave === 'function') {
            let saveStr;
            try {
              // support sync or async exportSave()
              saveStr = await Promise.resolve(exportSave());
            } catch (e) {
              console.error('exportSave threw', e);
              this.notify('🌸 YooA whispers: Could not prepare the save (export failed).', 'error');
              return;
            }

            if (!saveStr || typeof saveStr !== 'string' || saveStr.length < 8) {
              console.error('Invalid saveStr from exportSave():', saveStr);
              this.notify('🌸 YooA says: Save string is empty or invalid — nothing was saved.', 'error');
              return;
            }

            // debug log (remove later)
            console.log('Saving to cloud — size (chars):', saveStr.length);

            try {
              const resp = await cloudSaveRaw(saveStr, this.token);
              if (resp?.version) this.cloudVersion = resp.version;
              this.notify('🌟 YooA says: Cloud save successful!', 'saved');
              window.dispatchEvent(new Event('game-saved'));
              return;
            } catch (err) {
              console.error('cloudSaveRaw failed', err);
              this.notify(`🌸 YooA says... "Cloud save failed: ${err?.message || err}"`, 'error');
              return;
            }
          }

          // fallback if exportSave not present (keeps your prior behavior)
          const resp = await cloudSaveRaw({ player, options }, this.token);
          if (resp?.version) this.cloudVersion = resp.version;
          this.notify('🌟 YooA says: Cloud save successful!', 'saved');
          window.dispatchEvent(new Event('game-saved'));
          return;
        }

        // fallback - older behaviour (kept here for completeness)
        const res = await fetch(`${API}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ player, meta: { timestamp: new Date().toISOString() } })
        });

        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (data.version) this.cloudVersion = data.version;
        this.notify('🌟 YooA says: Cloud save successful!', 'saved');
        window.dispatchEvent(new Event('game-saved'));
      } catch (err) {
        console.error('cloudSave error', err);
        this.notify(`🌸 YooA says... "Cloud save failed: ${err?.message || err}"`, 'error');
      }
    },

    async cloudLoad() {
      try {
        const session = await fetchAuthSession().catch(() => null);
        this.token = session?.tokens?.idToken?.toString() || null;
      } catch (e) {
        this.token = null;
      }

      if (!this.token || this.emailVerified === false) {
        return this.notify('🌸 YooA says... "You must have a verified account and be signed in to use Cloud Load."', 'error');
      }

      try {
        if (typeof cloudLoadRaw === 'function') {
          const resp = await cloudLoadRaw(this.token);
          if (!resp || !resp.raw) throw new Error('No cloud save found or could not decode saved data');

          // If you have importSave(), feed the raw string into it so the game rehydrates types:
          if (typeof importSave === 'function') {
            try {
              importSave(resp.raw);   // importSave should replace/apply the full save correctly
              this.cloudVersion = resp.version || this.cloudVersion;
              this.notify('🌟 YooA says: Cloud load successful!', 'saved');
              return;
            } catch (e) {
              console.warn('importSave failed, falling back to manual assign:', e);
            }
          }

          // Fallback: try to decode base64'ed JSON into an object and apply (less ideal)
          const parsed = resp.saved || fromBase64Safe(resp.raw);
          if (parsed) {
            Object.assign(player, parsed.player || parsed);
            this.cloudVersion = resp.version || this.cloudVersion;
            this.notify('🌟 YooA says: Cloud load successful! (fallback)', 'saved');
            return;
          }

          throw new Error('Could not interpret cloud save payload');
        }

        // fallback load (kept for completeness)
        const res = await fetch(`${API}/load`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });

        if (res.status === 404) {
          return this.notify('🌸 YooA says: No cloud save found.', 'error');
        }
        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const data = await res.json();
        if (data.player) {
          Object.assign(player, data.player);
          this.cloudVersion = data.version || this.cloudVersion;
          this.notify('🌟 YooA says: Cloud load successful!', 'saved');
        } else if (data.data) {
          // defensive fallback if server returned base64 'data' directly
          // decode client-side using the helper exported from cloud.js
          try {
            // import fromBase64Safe at top of file: import { fromBase64Safe } from '@/incremental/cloud.js'
            const decoded = fromBase64Safe(data.data);
            if (decoded) Object.assign(player, decoded.player || decoded);
            this.cloudVersion = data.version || this.cloudVersion;
            this.notify('🌟 YooA says: Cloud load successful!', 'saved');
          } catch (e) {
            throw new Error('Could not decode saved data');
          }
        }
      } catch (err) {
        console.error('cloudLoad error', err);
        this.notify(`🌸 YooA says... "Cloud load failed: ${err?.message || err}"`, 'error');
      }
    },
  }
};
</script>

<style>
:root {
  --yooa: #991893;
  --yooa-dark: #6b1b6b;
  --yooa-accent: #f6faff;
}
</style>

<style scoped>
/* Tabs */
.tabs {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 8px
}

.tabs button {
  padding: 10px 18px;
  border: 2px solid #e8c8ff;
  background: #f9eaff;
  color: #5a2a7a;
  cursor: pointer;
  font-weight: 600;
  border-radius: 12px;
  font-size: 14pt;
  transition: all .25s ease
}

.tabs button:hover {
  background: #ffe8ff;
  border-color: #ffb3ff
}

.tabs button.active {
  background: #ffcfff;
  color: #3a0055;
  border-color: #ff82ff;
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(105, 15, 92, .12)
}

/* Layout */
.options {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 14px;
  padding-bottom: 36px;
  width: 100%;
  box-sizing: border-box
}

.tab-content {
  width: 100%;
  display: flex;
  justify-content: center
}

/* Transitions */
.tab-slide-enter-active,
.tab-slide-leave-active,
.panel-pop-enter-active,
.panel-pop-leave-active {
  transition: all .36s cubic-bezier(.2, .9, .2, 1)
}

.tab-slide-enter-from {
  transform: translateY(14px) scale(.99);
  opacity: 0
}

.tab-slide-leave-to {
  transform: translateY(-8px) scale(.98);
  opacity: 0
}

.panel-pop-enter-from {
  transform: translateX(20px) scale(.99);
  opacity: 0;
  filter: blur(6px)
}

.panel-pop-enter-to,
.tab-slide-enter-to {
  transform: none;
  opacity: 1;
  filter: none
}

.panel-pop-leave-to {
  transform: translateX(-12px);
  opacity: 0;
  filter: blur(6px)
}

.enter-soft {
  animation: cardSoftPop .34s cubic-bezier(.2, .9, .3, 1) both
}

@keyframes cardSoftPop {
  0% {
    transform: translateY(6px) scale(.995);
    opacity: 0;
    filter: blur(6px)
  }

  60% {
    transform: translateY(-4px) scale(1.01);
    opacity: 1
  }

  100% {
    transform: none;
    opacity: 1
  }
}

/* Buttons */
.button-grid {
  width: 100%;
  max-width: 920px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  justify-items: center;
  padding: 8px 12px;
  box-sizing: border-box
}

.button-grid button,
button.btn-animated,
button.primary,
button.big,
button.ghost,
button.btn-danger {
  background: #f35ebc;
  color: #fff;
  border: 0;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: background .2s, transform .15s
}

.button-grid button {
  width: 100%;
  height: 90px;
  font-size: 15pt;
  box-shadow: 0 8px 22px rgba(153, 24, 147, .06)
}

.button-grid button:hover,
.btn-animated:hover,
.primary:hover,
.big:hover,
.ghost:hover,
.btn-danger:hover {
  transform: translateY(-6px);
  filter: brightness(1.08)
}

.button-grid button:hover {
  box-shadow: 0 18px 46px rgba(153, 24, 147, .12)
}

.btn-danger {
  background: linear-gradient(180deg, #ff6b6b, #ff4a8a)
}

.primary {
  background: linear-gradient(180deg, #3a80bf, #2b6fb1);
  box-shadow: 0 10px 28px rgba(43, 111, 177, .12)
}

.primary:hover {
  box-shadow: 0 22px 56px rgba(43, 111, 177, .18)
}

.ghost {
  background: rgba(255, 255, 255, .15);
  border: 1px solid rgba(255, 255, 255, .3)
}

.big {
  font-weight: 800;
  background: #f3f8ff;
  color: var(--yooa);
  border: 2px solid var(--yooa);
  padding: 12px 18px
}

.btn-animated:active::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  transform: translate(-50%, -50%) scale(1);
  background: rgba(255, 255, 255, .16);
  animation: rippleQuick .36s forwards
}

@keyframes rippleQuick {
  0% {
    transform: translate(-50%, -50%) scale(.6);
    opacity: .85
  }

  100% {
    transform: translate(-50%, -50%) scale(6.4);
    opacity: 0
  }
}

/* Auth */
.auth-subtab {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 0 20px
}

.page-title {
  font-size: 24pt;
  margin-bottom: 0;
  color: #d17be2;
  letter-spacing: .2px;
  text-align: center
}

.auth-guest-note {
  width: 100%;
  background: linear-gradient(135deg, #fff8ff, #f0e8ff);
  border-radius: 16px;
  padding: 16px 24px;
  box-shadow: 0 8px 24px rgba(153, 24, 147, .08);
  color: #5b2a5b;
  text-align: center;
  font-size: 14pt;
  border: 2px solid rgba(153, 24, 147, .1)
}

/* Account - NEW CENTERED LAYOUT */
.account-screen {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  padding: 0;
  box-sizing: border-box
}

.profile-panel {
  background: linear-gradient(180deg, #fff, #fff6fb);
  border-radius: 20px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  box-shadow: 0 12px 36px rgba(153, 24, 147, .1);
  width: 100%;
  max-width: 480px
}

.actions-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 640px;
  align-items: center
}

/* Avatar - Centered */
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f6d0ff, #fbe8ff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 32px rgba(105, 15, 92, .12), inset 0 -8px 18px rgba(255, 255, 255, .6);
  position: relative;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  transition: transform .36s, box-shadow .36s
}

.avatar:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 24px 56px rgba(140, 40, 140, .16)
}

.avatar-animated {
  animation: yooaFloat 5.8s ease-in-out infinite;
  display: block
}

@keyframes yooaFloat {

  0%,
  100% {
    transform: translateY(0)
  }

  50% {
    transform: translateY(-8px)
  }
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 999px
}

.avatar-text {
  font-weight: 900;
  font-size: 42px;
  color: var(--yooa-dark)
}

.avatar-edit {
  position: absolute;
  right: 8px;
  bottom: 8px;
  background: rgba(255, 255, 255, .95);
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 14pt;
  color: #ee01ee;
  box-shadow: 0 4px 12px rgba(0, 0, 0, .1);
  transition: transform .18s
}

.avatar-edit:hover {
  transform: translateY(-2px) scale(1.05)
}

/* Profile - Centered */
.profile-info {
  width: 100%;
  text-align: center
}

.profile-label {
  font-size: 12px;
  color: #8a6c8a;
  margin-top: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600
}

.profile-value {
  font-size: 18px;
  font-weight: 700;
  color: #40203f;
  margin-top: 6px
}

.profile-value.small {
  font-size: 14px;
  color: #6a5a6a;
  font-weight: 500
}

.profile-status-row {
  display: flex;
  gap: 32px;
  margin-top: 24px;
  justify-content: center;
  flex-wrap: wrap
}

.status-item {
  text-align: center;
  min-width: 140px
}

.status-label {
  font-size: 11px;
  color: #8a6c8a;
  text-transform: uppercase;
  letter-spacing: .5px;
  font-weight: 600
}

.status-value {
  font-weight: 700;
  margin-top: 8px;
  font-size: 16px;
  color: #433042
}

.profile-actions-vertical {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
  justify-content: center
}

.profile-actions-vertical button,
.actions-panel button,
.auth-card button {
  background: var(--yooa);
  color: #fff;
  border: 0;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all .2s
}

.profile-actions-vertical button:hover,
.actions-panel button:hover,
.auth-card button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(153, 24, 147, .2)
}

.profile-actions-vertical .warn {
  background: #e67700
}

/* Cards */
.card {
  background: linear-gradient(180deg, #fff, #fffbf8);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(153, 24, 147, .06);
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(153, 24, 147, .05)
}

.change-username-card h4,
.info-card h4 {
  margin: 0 0 16px 0;
  font-size: 16pt;
  color: #4a2a4a;
  text-align: center
}

.change-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap
}

.change-row input {
  padding: 12px 16px;
  font-size: 14pt;
  border-radius: 10px;
  border: 2px solid #e6d7ec;
  flex: 1;
  min-width: 200px;
  box-shadow: inset 0 -2px 8px rgba(255, 255, 255, .8);
  transition: border-color .2s
}

.change-row input:focus {
  border-color: #c799ff
}

.change-row button {
  background: var(--yooa);
  color: #fff;
  border: 0;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600
}

.preview-row {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap
}

.preview-img {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  object-fit: cover;
  border: 3px solid #f0d0ff;
  box-shadow: 0 8px 24px rgba(153, 24, 147, .12)
}

.preview-actions {
  display: flex;
  flex-direction: column;
  gap: 12px
}

/* Forms */
.verify-instruction {
  font-size: 14pt;
  margin-bottom: 16px;
  text-align: center;
  color: #5d3b5d;
  line-height: 1.6
}

.hint {
  margin-top: 12px;
  font-size: 13px;
  color: #866;
  text-align: center;
  line-height: 1.5
}

.auth-choice {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap
}

.form-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%
}

.form-block input,
.change-row input {
  width: 100%;
  min-width: 0
}

.form-block input {
  padding: 12px 16px;
  border-radius: 10px;
  border: 2px solid #e6d7ec;
  font-size: 14pt;
  transition: border-color .2s
}

.form-block input:focus {
  border-color: #c799ff
}

/* Preview box */
.preview-box {
  max-height: 160px;
  max-width: 100%;
  overflow: auto;
  background: #fff;
  border: 1px solid #f0e9f2;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  color: #3b2a3b;
  white-space: pre-wrap;
  word-break: break-word;
  transition: transform .18s, box-shadow .22s
}

.preview-box:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 36px rgba(150, 70, 150, .06)
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 7, 20, .55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 18px;
  box-sizing: border-box;
  animation: overlayFade .28s forwards
}

@keyframes overlayFade {
  from {
    background: rgba(20, 7, 20, 0)
  }

  to {
    background: rgba(20, 7, 20, .55)
  }
}

.cloud-modal {
  width: 980px;
  max-width: calc(100% - 32px);
  background: linear-gradient(180deg, #fff, #fffaf8);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 18px 48px rgba(30, 8, 40, .16);
  color: #3d2b3d;
  position: relative;
  animation: popIn .34s both, subtleGlow 3s infinite alternate
}

@keyframes popIn {
  0% {
    transform: translateY(8px) scale(.96);
    opacity: 0;
    filter: blur(6px)
  }

  60% {
    transform: translateY(-6px) scale(1.02);
    opacity: 1;
    filter: none
  }

  100% {
    transform: none;
    opacity: 1
  }
}

@keyframes subtleGlow {
  from {
    box-shadow: 0 8px 28px rgba(30, 8, 40, .06)
  }

  to {
    box-shadow: 0 18px 48px rgba(30, 8, 40, .1)
  }
}

.modal-title {
  margin: 0 0 8px 0;
  color: #7a2a7a;
  font-size: 16pt;
  text-align: center;
  display: inline-block;
  font-weight: 900
}

.modal-title .title-sparkle {
  display: inline-block;
  margin-left: 8px;
  animation: sparklePop 1.8s infinite
}

@keyframes sparklePop {
  0% {
    transform: scale(.9) rotate(-10deg);
    opacity: .35
  }

  30% {
    transform: translateY(-6px) scale(1.12) rotate(6deg);
    opacity: 1
  }

  60% {
    transform: translateY(-2px) scale(1.05);
    opacity: .9
  }

  100% {
    transform: none;
    opacity: .8
  }
}

.compare-row {
  display: flex;
  gap: 12px;
  margin-top: 8px
}

.compare-col {
  flex: 1;
  min-width: 0;
  padding: 12px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(255, 255, 255, .98), rgba(255, 250, 255, .98));
  transition: transform .18s, box-shadow .18s
}

.col-badge {
  display: inline-block;
  font-weight: 900;
  font-size: 10px;
  padding: 6px 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 255, 255, .95), rgba(255, 245, 255, .8));
  color: var(--yooa-dark);
  border: 1px solid rgba(107, 27, 107, .06);
  box-shadow: 0 6px 18px rgba(155, 40, 155, .04), inset 0 -6px 14px rgba(255, 255, 255, .5);
  margin-bottom: 8px
}

.meta {
  font-size: 13px;
  color: #654a65;
  margin-bottom: 6px
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center
}

.stat-label {
  color: #856;
  font-weight: 700;
  font-size: 13px
}

.stat-value {
  font-weight: 900;
  color: #3a1d3a
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 12px
}

.modal-loading {
  text-align: center;
  color: #5a3b5a;
  margin-top: 8px;
  font-style: italic
}

.cloud-col.cloud-diff {
  animation: cloudPulse 1.6s ease-in-out 0s 2;
  box-shadow: 0 14px 40px rgba(189, 95, 189, .06);
  position: relative
}

@keyframes cloudPulse {

  0%,
  100% {
    transform: none;
    box-shadow: 0 6px 18px rgba(189, 95, 189, .04)
  }

  50% {
    transform: translateY(-5px);
    box-shadow: 0 18px 48px rgba(189, 95, 189, .12)
  }
}

.cloud-col.cloud-diff::after {
  content: '🌟';
  position: absolute;
  right: 12px;
  top: -14px;
  font-size: 18px;
  animation: twinkle 1.6s linear 0s 2;
  filter: drop-shadow(0 6px 10px rgba(220, 150, 220, .18))
}

@keyframes twinkle {
  0% {
    transform: scale(.6) translateY(0) rotate(-10deg);
    opacity: 0
  }

  30% {
    transform: scale(1.06) translateY(-10px) rotate(20deg);
    opacity: 1
  }

  70% {
    transform: scale(1) translateY(-6px) rotate(-6deg);
    opacity: .9
  }

  100% {
    transform: scale(.8) translateY(0) rotate(0);
    opacity: 0
  }
}

.close-x {
  position: absolute;
  right: 12px;
  top: 12px;
  border: 0;
  background: transparent;
  color: #7a2a7a;
  font-size: 18px;
  cursor: pointer;
  opacity: .95;
  transition: transform .14s, opacity .14s
}

.close-x:hover {
  transform: rotate(90deg) scale(1.05);
  opacity: 1
}

/* Password field - CRITICAL FIX */
.password-field {
  position: relative;
  width: 100%;
  display: block
}

.password-field input {
  width: 100%;
  padding: 12px 50px 12px 16px;
  box-sizing: border-box;
  height: 48px;
  font-size: 14pt;
  border-radius: 10px;
  border: 2px solid #e6d7ec;
  transition: border-color .2s;
  margin: 0;
}

.password-field input:focus {
  border-color: #c799ff;
  outline: 3px solid rgba(155, 40, 155, .18);
  outline-offset: 2px;
}

.password-toggle {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: 0;
  background: transparent !important;
  cursor: pointer;
  padding: 0;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background .12s;
  color: #6b1b6b;
  z-index: 2
}

.password-toggle:hover {
  background: rgba(153, 24, 147, .06) !important;
  transform: translateY(-50%) !important;
  /* Keep centered, don't move up */
}

/* Prevent active ripple effect on password toggle */
.password-toggle:active::after {
  display: none !important;
}

.password-toggle svg {
  display: block;
  flex-shrink: 0;
  pointer-events: none
}

/* Inputs */
input,
textarea,
select {
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important
}

button:focus,
input:focus,
textarea:focus {
  outline: 3px solid rgba(155, 40, 155, .18);
  outline-offset: 2px;
  border-radius: 8px
}

.ok {
  color: #22c55e;
  font-size: 16px
}

.no {
  color: #ef4444;
  font-size: 16px
}

/* Responsive */
@media (max-width:880px) {
  .account-screen {
    padding: 0 16px
  }

  .profile-panel {
    padding: 24px
  }

  .avatar {
    width: 100px;
    height: 100px
  }

  .avatar-text {
    font-size: 36px
  }

  .profile-actions-vertical {
    flex-direction: column;
    width: 100%
  }

  .profile-actions-vertical button {
    width: 100%
  }

  .compare-row {
    flex-direction: column;
    gap: 10px
  }

  .cloud-modal {
    padding: 14px;
    max-width: 720px;
    width: calc(100% - 28px)
  }

  .col-badge {
    font-size: 9px;
    padding: 5px 6px
  }

  .page-title {
    font-size: 20pt
  }

  .change-row {
    flex-direction: column
  }

  .change-row input,
  .change-row button {
    width: 100%
  }
}
</style>