<template>
  <div class="registration-container">
    <div class="registration-card">
      <h1>Register</h1>
      <form @submit.prevent="handleRegistration" class="registration-form">
        <div class="form-group">
          <label for="username">Username</label>
          <BaseInput
            id="username"
            v-model="form.username"
            type="text"
            placeholder="Choose a username"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <BaseInput
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Choose a password"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <BaseInput
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="phoneNumber">Phone Number</label>
          <BaseInput
            id="phoneNumber"
            v-model="form.phoneNumber"
            type="tel"
            placeholder="+1234567890"
            :disabled="loading"
          />
          <small class="input-help">Format: +1234567890</small>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <BaseInput
            id="email"
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            :disabled="loading"
          />
        </div>
        <div class="error-message" v-if="error">
          {{ error }}
        </div>
        <div class="state-message" v-if="stateMessage">
          {{ stateMessage }}
        </div>
        <BaseButton
          type="primary"
          :disabled="loading || !isFormValid"
          class="register-button"
        >
          {{ loading ? 'Registering...' : 'Register' }}
        </BaseButton>
      </form>
      <div class="registration-footer">
        <router-link to="/login">Already have an account? Login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore, REGISTRATION_STATES } from '@/stores/registration'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'Registration',
  components: {
    BaseInput,
    BaseButton
  },
  setup() {
    const router = useRouter()
    const registrationStore = useRegistrationStore()
    
    const form = ref({
      username: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      email: ''
    })
    const loading = ref(false)

    const isFormValid = computed(() => {
      const phoneNumberPattern = /^\+[0-9]{1,15}$/
      return form.value.username &&
        form.value.password &&
        form.value.password === form.value.confirmPassword &&
        phoneNumberPattern.test(form.value.phoneNumber) &&
        form.value.email
    })

    const handleRegistration = async () => {
      if (loading.value || !isFormValid.value) return

      loading.value = true
      try {
        // Start registration process
        await registrationStore.initRegistration({
          username: form.value.username,
          password: form.value.password,
          phoneNumber: form.value.phoneNumber,
          email: form.value.email
        })

        // If validation passes, create user
        if (registrationStore.currentState === REGISTRATION_STATES.USERNAME_VALIDATED) {
          await registrationStore.createUser()
        }

        // If user created, set up system user
        if (registrationStore.currentState === REGISTRATION_STATES.USER_CREATED) {
          await registrationStore.createSystemUser()
        }

        // If system user created, configure mail
        if (registrationStore.currentState === REGISTRATION_STATES.SYSTEM_USER_CREATED) {
          await registrationStore.configureMail()
        }

        // If mail configured, send verification
        if (registrationStore.currentState === REGISTRATION_STATES.MAIL_CONFIGURED) {
          await registrationStore.sendVerification()
        }

        // If verification sent, redirect to verification page
        if (registrationStore.currentState === REGISTRATION_STATES.VERIFICATION_SENT) {
          router.push({
            name: 'verify-email',
            query: { email: form.value.email }
          })
        }
      } catch (err) {
        // Error handling is managed by the store
        console.error('Registration error:', err)
      } finally {
        loading.value = false
      }
    }

    // Computed properties for UI feedback
    const stateMessage = computed(() => {
      switch (registrationStore.currentState) {
        case REGISTRATION_STATES.INITIATED:
          return 'Validating your information...'
        case REGISTRATION_STATES.USERNAME_VALIDATED:
          return 'Creating your account...'
        case REGISTRATION_STATES.USER_CREATED:
          return 'Setting up your system access...'
        case REGISTRATION_STATES.SYSTEM_USER_CREATED:
          return 'Configuring your mail settings...'
        case REGISTRATION_STATES.MAIL_CONFIGURED:
          return 'Sending verification email...'
        case REGISTRATION_STATES.VERIFICATION_SENT:
          return 'Please check your email to verify your account.'
        case REGISTRATION_STATES.FAILED:
          return registrationStore.error || 'Registration failed. Please try again.'
        default:
          return ''
      }
    })

    return {
      form,
      loading,
      isFormValid,
      handleRegistration,
      stateMessage,
      error: computed(() => registrationStore.error),
      validationErrors: computed(() => registrationStore.validationErrors)
    }
  }
}
</script>

<style scoped>
.registration-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.registration-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.registration-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-help {
  color: #666;
  font-size: 0.8rem;
}

label {
  font-weight: 500;
  color: #333;
}

.error-message {
  color: #dc3545;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.state-message {
  color: #666;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.register-button {
  margin-top: 1rem;
}

.registration-footer {
  margin-top: 1rem;
  text-align: center;
}

.registration-footer a {
  color: #007bff;
  text-decoration: none;
}

.registration-footer a:hover {
  text-decoration: underline;
}
</style>
