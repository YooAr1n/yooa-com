<template>
  <div class="notification-container">
    <TransitionGroup name="fade" tag="div">
      <div v-for="notif in notifications" :key="notif.id" class="notification" :class="{
        'notification-import': notif.type === 'import',
        'notification-export': notif.type === 'export',
        'notification-saved': notif.type === 'saved',
        'notification-achievement': notif.type === 'achievement'
      }" @click="removeNotification(notif.id)">
        <span>{{ notif.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import { save } from '@/incremental/save.js';
import { options } from '@/incremental/options.js';

export default {
  name: 'Notification',
  data() {
    return {
      notifications: [],
      notificationTimeouts: {}, // To store timeout ids for each notification
      autosaveTimer: null,  // Timer reference for the autosave
    };
  },
  computed: {
    autosaveInterval() {
      return options.autosaveInterval;
    },
    autosaveEnabled() {
      return options.autosave; // Dynamically bind to options.autosave
    },
  },
  watch: {
    autosaveEnabled(newValue) {
      if (newValue) {
        this.startAutosave(); // Start autosave if enabled
      } else {
        clearInterval(this.autosaveTimer); // Stop autosave if disabled
        this.autosaveTimer = null;
      }
    },
    autosaveInterval() {
      this.startAutosave(); // Restart the autosave timer with the new interval
    },
  },
  methods: {
    addNotification(message = 'Game saved!', type = 'saved') {
      const id = Date.now(); // Unique ID for each notification
      const newNotif = { id, message, type };

      // Add new notification to the start of the array
      this.notifications.unshift(newNotif);

      // Set a timeout to automatically remove the notification
      const timeoutId = setTimeout(() => {
        this.removeNotification(id);
      }, 500); // Auto removal

      // Track the timeout ID for each notification
      this.notificationTimeouts[id] = timeoutId;
    },
    removeNotification(id) {
      // If there's a timeout, clear it first
      if (this.notificationTimeouts[id]) {
        clearTimeout(this.notificationTimeouts[id]);
        delete this.notificationTimeouts[id];
      }

      // Remove the notification
      this.notifications = this.notifications.filter(notif => notif.id !== id);
    },
    startAutosave() {
      if (this.autosaveTimer) {
        clearInterval(this.autosaveTimer); // Clear any existing timer
      }

      // Start a new timer based on the autosave interval
      if (this.autosaveEnabled) {
        this.autosaveTimer = setInterval(() => {
          this.performAutosave();
        }, this.autosaveInterval * 1000);
      }
    },
    performAutosave() {
      if (this.autosaveEnabled) {
        // Call the save function
        save();

        // Dispatch a notification
        this.addNotification('Game autosaved!', 'saved');
      }
    },
    updateAutosaveInterval(newInterval) {
      // Update the autosave interval dynamically
      this.autosaveInterval = newInterval;
    },
  },
  mounted() {
    this.startAutosave(); // Start autosave when the component is mounted
    window.addEventListener('game-saved', () => this.addNotification('Game saved!', 'saved'));
    window.addEventListener('export-completed', () => this.addNotification('Export successful!', 'export'));
    window.addEventListener('import-completed', () => this.addNotification('Import successful!', 'import'));
    window.addEventListener('achievement-unlocked', (e) => {
      this.addNotification(e.detail, 'achievement');
    });
  },
  beforeUnmount() {
    // Cleanup timers and listeners
    if (this.autosaveTimer) clearInterval(this.autosaveTimer);
    Object.values(this.notificationTimeouts).forEach(clearTimeout);
    window.removeEventListener('game-saved', this.addNotification);
    window.removeEventListener('export-completed', this.addNotification);
    window.removeEventListener('import-completed', this.addNotification);
    window.removeEventListener('achievement-unlocked', this.addNotification);
  },
};
</script>


<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  /* Stack notifications vertically */
  align-items: flex-end;
}

.notification {
  background-color: #28a745;
  color: white;
  font-size: 14pt;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(255, 255, 255, 0.151);
  opacity: 0;
  transform: translateX(20px);
  /* Initially off-screen horizontally */
  transition: opacity 0.5s, transform 0.5s;
  /* Smooth fade and slide in/out */
  white-space: nowrap;
  /* Prevent text from wrapping */
  display: block;
  /* Keep notifications as block elements, stacked vertically */
  width: fit-content;
  /* Ensure width only as needed based on the content */
  margin-bottom: 10px;
  margin-left: auto;
  /* Align notifications to the right of their container */
  cursor: pointer;
  /* Indicate that the notification is clickable */
}

.notification-saved {
  background-color: #28a745;
  /* Green */
}

.notification-export {
  background-color: #007bff;
  /* Blue */
}

.notification-import {
  background-color: #78009c;
  /* Purple */
}

.notification-achievement {
  background-color: #b8981a;
  /* Gold */
}

/* Transitions for fade-in and fade-out */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active in <2.1.8 */
  {
  opacity: 0;
  transform: translateX(20px);
  /* Slide in/out effect */
}

.fade-enter-to,
.fade-leave {
  opacity: 1;
  transform: translateX(0);
  /* Normal position */
}
</style>