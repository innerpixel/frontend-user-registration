<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Login</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <BaseInput
            id="username"
            v-model="form.username"
            type="text"
            placeholder="Enter your username"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <BaseInput
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            :disabled="loading"
          />
        </div>
        <div class="error-message" v-if="error">
          {{ error }}
        </div>
        <BaseButton
          type="primary"
          :disabled="loading"
          class="login-button"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </BaseButton>
      </form>
      <div class="login-footer">
        <router-link to="/registration">Don't have an account? Register</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'Login',
  components: {
    BaseInput,
    BaseButton
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const form = ref({
      username: '',
      password: ''
    })
    const loading = ref(false)
    const error = ref('')

    const handleLogin = async () => {
      if (loading.value) return

      loading.value = true
      error.value = ''

      try {
        await authStore.login(form.value)
        router.push('/dashboard')
      } catch (err) {
        error.value = err.response?.data?.message || 'Login failed. Please try again.'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-card {
  background: white;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  margin: 0 0 24px 0;
  text-align: center;
  color: #2c3e50;
}

.login-form {
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
  text-align: center;
}

.login-button {
  width: 100%;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.login-footer a {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>
