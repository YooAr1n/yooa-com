<template>
  <div class="notification-container">
    <div v-for="notif in notifications" :key="notif.id" class="notification" :class="{
      'notification-import': notif.type === 'import',
      'notification-export': notif.type === 'export',
      'notification-saved': notif.type === 'saved',
      'notification-achievement': notif.type === 'achievement',
      'notification-complete': notif.type === 'challenge',
      leaving: notif.leaving, // Add the leaving class dynamically
    }" @click="removeNotification(notif.id)">
      <span>{{ notif.message }}</span>
    </div>
  </div>
</template>

<script>
import { save } from '@/incremental/save.js';
import { options } from '@/incremental/options.js';

export default {
  name: 'Notification',
  data() {
    return {
      notifications: [],          // Notifications array
      notificationTimeouts: {},     // To store timeout IDs
      autosaveTimer: null,          // Autosave interval reference
      nextNotificationId: 1,        // Unique notification counter
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
        this.startAutosave();
      } else {
        clearInterval(this.autosaveTimer);
        this.autosaveTimer = null;
      }
    },
    autosaveInterval() {
      this.startAutosave(); // Restart with new interval
    },
  },
  methods: {
    addNotification(message = 'Game saved!', type = 'saved') {
      // Use an internal counter to generate a unique ID
      const id = this.nextNotificationId++;
      const newNotif = { id, message, type, leaving: false };

      // Add new notification to the array
      this.notifications.unshift(newNotif);

      // Automatically remove the notification after 2 seconds
      const timeoutId = setTimeout(() => {
        this.removeNotification(id);
      }, 2000);

      // Store the timeout ID
      this.notificationTimeouts[id] = timeoutId;
    },
    removeNotification(id) {
      const notifIndex = this.notifications.findIndex((notif) => notif.id === id);

      if (notifIndex !== -1) {
        // Mark notification as leaving
        this.notifications[notifIndex].leaving = true;

        // Wait for the animation to complete before removing
        setTimeout(() => {
          this.notifications.splice(notifIndex, 1);
        }, 500); // Match the CSS animation duration
      }

      // Clear the timeout if it exists
      if (this.notificationTimeouts[id]) {
        clearTimeout(this.notificationTimeouts[id]);
        delete this.notificationTimeouts[id];
      }
    },
    startAutosave() {
      if (this.autosaveTimer) {
        clearInterval(this.autosaveTimer);
      }

      if (this.autosaveEnabled) {
        this.autosaveTimer = setInterval(() => {
          this.performAutosave();
        }, this.autosaveInterval * 1000);
      }
    },
    performAutosave() {
      if (this.autosaveEnabled) {
        save(); // Call save function

        // Prevent error if 'offline' is not defined
        if (typeof offline === 'undefined' || !offline.nosave) {
          this.addNotification('Game autosaved!', 'saved');
        }
      }
    },
    // Event handler methods for proper add/remove of listeners
    handleGameSaved() {
      this.addNotification('Game saved!', 'saved');
    },
    handleExportCompleted() {
      this.addNotification('Export successful!', 'export');
    },
    handleImportCompleted() {
      this.addNotification('Import successful!', 'import');
    },
    handleAchievementUnlocked(e) {
      this.addNotification(e.detail, 'achievement');
    },
    handleChallengeCompleted(e) {
      this.addNotification(e.detail, 'challenge');
    },
  },
  mounted() {
    this.startAutosave();
    window.addEventListener('game-saved', this.handleGameSaved);
    window.addEventListener('export-completed', this.handleExportCompleted);
    window.addEventListener('import-completed', this.handleImportCompleted);
    window.addEventListener('achievement-unlocked', this.handleAchievementUnlocked);
    window.addEventListener('challenge-completed', this.handleChallengeCompleted);
  },
  beforeUnmount() {
    if (this.autosaveTimer) clearInterval(this.autosaveTimer);
    Object.values(this.notificationTimeouts).forEach(clearTimeout);
    window.removeEventListener('game-saved', this.handleGameSaved);
    window.removeEventListener('export-completed', this.handleExportCompleted);
    window.removeEventListener('import-completed', this.handleImportCompleted);
    window.removeEventListener('achievement-unlocked', this.handleAchievementUnlocked);
    window.removeEventListener('challenge-completed', this.handleChallengeCompleted);
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
  white-space: nowrap;
  display: block;
  width: fit-content;
  margin-bottom: 10px;
  margin-left: auto;
  cursor: pointer;
  animation: fadeIn 0.5s ease forwards;
}

/* Notification types */
.notification-saved {
  background-color: #28a745;
}

.notification-export {
  background-color: #007bff;
}

.notification-import {
  background-color: #78009c;
}

.notification-achievement {
  background-color: #b8981a;
}

.notification-complete {
  background-color: #10b981;
}

/* Keyframes for entering animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Keyframes for leaving animation */
@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }

  to {
    opacity: 0;
    transform: translateX(20px);
  }
}

/* Custom class for leaving state */
.notification.leaving {
  animation: fadeOut 0.5s ease forwards;
}
</style>
