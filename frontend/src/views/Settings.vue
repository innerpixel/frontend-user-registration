<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1>Settings</h1>
    </div>
    <div class="settings-content">
      <div class="settings-section">
        <h2>Password</h2>
        <form @submit.prevent="updatePassword" class="settings-form">
          <div class="form-group">
            <label>Current Password</label>
            <BaseInput
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="Enter current password"
            />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <BaseInput
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="Enter new password"
            />
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <BaseInput
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Confirm new password"
            />
          </div>
          <div class="error-message" v-if="passwordError">
            {{ passwordError }}
          </div>
          <BaseButton
            type="primary"
            :disabled="passwordLoading || !isPasswordFormValid"
          >
            {{ passwordLoading ? 'Updating...' : 'Update Password' }}
          </BaseButton>
        </form>
      </div>

      <div class="settings-section">
        <h2>Notifications</h2>
        <div class="settings-form">
          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="notifications.email"
                :disabled="notificationsLoading"
              />
              Email Notifications
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="notifications.system"
                :disabled="notificationsLoading"
              />
              System Notifications
            </label>
          </div>
          <div class="error-message" v-if="notificationsError">
            {{ notificationsError }}
          </div>
          <BaseButton
            type="primary"
            :disabled="notificationsLoading"
            @click="updateNotifications"
          >
            {{ notificationsLoading ? 'Saving...' : 'Save Preferences' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import axios from 'axios'

export default {
  name: 'Settings',
  components: {
    BaseInput,
    BaseButton
  },
  setup() {
    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    const passwordLoading = ref(false)
    const passwordError = ref('')

    const notifications = ref({
      email: false,
      system: true
    })
    const notificationsLoading = ref(false)
    const notificationsError = ref('')

    const isPasswordFormValid = computed(() => {
      return passwordForm.value.currentPassword &&
        passwordForm.value.newPassword &&
        passwordForm.value.newPassword === passwordForm.value.confirmPassword
    })

    const updatePassword = async () => {
      if (passwordLoading.value || !isPasswordFormValid.value) return

      passwordLoading.value = true
      passwordError.value = ''

      try {
        await axios.put('/api/users/password', {
          currentPassword: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword
        })
        
        // Clear form after successful update
        passwordForm.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      } catch (err) {
        passwordError.value = err.response?.data?.message || 'Failed to update password'
      } finally {
        passwordLoading.value = false
      }
    }

    const updateNotifications = async () => {
      if (notificationsLoading.value) return

      notificationsLoading.value = true
      notificationsError.value = ''

      try {
        await axios.put('/api/users/notifications', notifications.value)
      } catch (err) {
        notificationsError.value = err.response?.data?.message || 'Failed to update notification preferences'
      } finally {
        notificationsLoading.value = false
      }
    }

    return {
      passwordForm,
      passwordLoading,
      passwordError,
      isPasswordFormValid,
      updatePassword,
      notifications,
      notificationsLoading,
      notificationsError,
      updateNotifications
    }
  }
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-header h1 {
  color: #2c3e50;
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.settings-section h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #2c3e50;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: #606266;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
}
</style>
