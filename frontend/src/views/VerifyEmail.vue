<template>
  <div class="verify-email-container">
    <div class="verify-email-card">
      <div v-if="loading" class="verify-email-status">
        <div class="loading-spinner"></div>
        <p>Verifying your email...</p>
      </div>
      
      <div v-else-if="error" class="verify-email-status error">
        <i class="fas fa-times-circle"></i>
        <h2>Verification Failed</h2>
        <p>{{ error }}</p>
        <BaseButton @click="retryVerification" type="primary">
          Try Again
        </BaseButton>
      </div>
      
      <div v-else class="verify-email-status success">
        <i class="fas fa-check-circle"></i>
        <h2>Email Verified!</h2>
        <p>Your email has been successfully verified.</p>
        <BaseButton @click="goToLogin" type="primary">
          Continue to Login
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'VerifyEmail',
  components: {
    BaseButton
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(true)
    const error = ref('')

    const verifyEmail = async () => {
      const token = route.query.token
      
      if (!token) {
        error.value = 'Invalid verification link. Please request a new one.'
        loading.value = false
        return
      }

      try {
        await axios.post('/api/auth/verify-email', { token })
        loading.value = false
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to verify email. Please try again.'
        loading.value = false
      }
    }

    const retryVerification = () => {
      loading.value = true
      error.value = ''
      verifyEmail()
    }

    const goToLogin = () => {
      router.push('/login')
    }

    onMounted(() => {
      verifyEmail()
    })

    return {
      loading,
      error,
      retryVerification,
      goToLogin
    }
  }
}
</script>

<style scoped>
.verify-email-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 20px;
}

.verify-email-card {
  background: white;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.verify-email-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.verify-email-status i {
  font-size: 48px;
  margin-bottom: 8px;
}

.verify-email-status.success i {
  color: #67c23a;
}

.verify-email-status.error i {
  color: #f56c6c;
}

.verify-email-status h2 {
  margin: 0;
  color: #2c3e50;
}

.verify-email-status p {
  margin: 0;
  color: #606266;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
