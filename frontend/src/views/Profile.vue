<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>Profile</h1>
    </div>
    <div class="profile-content">
      <div class="profile-section">
        <div class="profile-avatar">
          <img :src="authStore.userAvatar" alt="User avatar" />
          <BaseButton type="primary" size="small" @click="handleAvatarUpload">
            Change Avatar
          </BaseButton>
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            accept="image/*"
            @change="onFileSelected"
          />
        </div>
        <div class="profile-info">
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-group">
              <label>Username</label>
              <BaseInput
                v-model="form.username"
                :disabled="true"
                placeholder="Username"
              />
            </div>
            <div class="form-group">
              <label>Email</label>
              <BaseInput
                v-model="form.email"
                type="email"
                placeholder="Enter your email"
              />
            </div>
            <div class="form-group">
              <label>Full Name</label>
              <BaseInput
                v-model="form.fullName"
                placeholder="Enter your full name"
              />
            </div>
            <div class="error-message" v-if="error">
              {{ error }}
            </div>
            <BaseButton
              type="primary"
              :disabled="loading"
              class="save-button"
            >
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </BaseButton>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import axios from 'axios'

export default {
  name: 'Profile',
  components: {
    BaseInput,
    BaseButton
  },
  setup() {
    const authStore = useAuthStore()
    const fileInput = ref(null)
    const form = ref({
      username: '',
      email: '',
      fullName: ''
    })
    const loading = ref(false)
    const error = ref('')

    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/users/profile')
        form.value = response.data
      } catch (err) {
        error.value = 'Failed to load profile data'
      }
    }

    const updateProfile = async () => {
      if (loading.value) return

      loading.value = true
      error.value = ''

      try {
        await axios.put('/api/users/profile', form.value)
        // Update store if needed
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to update profile'
      } finally {
        loading.value = false
      }
    }

    const handleAvatarUpload = () => {
      fileInput.value.click()
    }

    const onFileSelected = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('avatar', file)

      try {
        loading.value = true
        await axios.post('/api/users/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        // Refresh auth store to get new avatar
        await authStore.checkAuth()
      } catch (err) {
        error.value = 'Failed to upload avatar'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchProfile()
    })

    return {
      authStore,
      fileInput,
      form,
      loading,
      error,
      updateProfile,
      handleAvatarUpload,
      onFileSelected
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 24px;
}

.profile-header h1 {
  color: #2c3e50;
  margin: 0;
}

.profile-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.profile-section {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 32px;
}

.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.profile-avatar img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-info {
  flex: 1;
}

.profile-form {
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

.error-message {
  color: #f56c6c;
  font-size: 14px;
}

.save-button {
  align-self: flex-start;
}

@media (max-width: 768px) {
  .profile-section {
    grid-template-columns: 1fr;
  }

  .profile-avatar {
    margin-bottom: 24px;
  }
}
</style>
