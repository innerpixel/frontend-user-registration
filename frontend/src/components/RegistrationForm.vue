<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRegistrationStore, REGISTRATION_STATES } from '../stores/registration'

const registrationStore = useRegistrationStore()

const formData = ref({
  name: '',
  displayName: '',
  email: '',
  password: '',
  simNumber: ''
})

const isSubmitting = ref(false)
const verificationToken = ref('')

// Computed properties for UI state
const currentStep = computed(() => {
  switch (registrationStore.currentState) {
    case REGISTRATION_STATES.VERIFICATION_SENT:
      return 'verification'
    case REGISTRATION_STATES.VERIFIED:
      return 'success'
    default:
      return 'registration'
  }
})

const error = computed(() => registrationStore.error)
const validationErrors = computed(() => registrationStore.validationErrors)

const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    
    // Create the system email from the username
    const systemEmail = `${formData.value.name}@local.domain`
    
    // Initialize registration process
    await registrationStore.initRegistration({
      username: formData.value.name,
      displayName: formData.value.displayName,
      email: formData.value.email,
      systemEmail,
      password: formData.value.password,
      phoneNumber: formData.value.simNumber
    })

    // If validation passes, create user
    if (registrationStore.currentState === REGISTRATION_STATES.USERNAME_VALIDATED) {
      await registrationStore.createUser()
    }

    // If user created, create system user
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
    
  } catch (err) {
    // Error handling is managed by the store
    console.error('Registration error:', err)
  } finally {
    isSubmitting.value = false
  }
}

const handleVerification = async () => {
  try {
    isSubmitting.value = true
    await registrationStore.verifyEmail(verificationToken.value)
  } catch (err) {
    console.error('Verification error:', err)
  } finally {
    isSubmitting.value = false
  }
}

// Reset store when component unmounts
onUnmounted(() => {
  registrationStore.reset()
})
</script>

<template>
  <div class="max-w-md w-full mx-auto p-6">
    <!-- Registration Form -->
    <form v-if="currentStep === 'registration'" @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <input
          v-model="formData.name"
          type="text"
          placeholder="Name"
          required
          class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-sm 
                 placeholder:text-white/40 focus:outline-none focus:border-white/40
                 hover:bg-white/10 transition-colors"
        />
      </div>
      
      <div>
        <input
          v-model="formData.displayName"
          type="text"
          placeholder="Display Name"
          required
          class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-sm 
                 placeholder:text-white/40 focus:outline-none focus:border-white/40
                 hover:bg-white/10 transition-colors"
        />
      </div>

      <div>
        <input
          v-model="formData.email"
          type="email"
          placeholder="Email"
          required
          class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-sm 
                 placeholder:text-white/40 focus:outline-none focus:border-white/40
                 hover:bg-white/10 transition-colors"
        />
      </div>

      <div>
        <input
          v-model="formData.password"
          type="password"
          placeholder="Password"
          required
          class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-sm 
                 placeholder:text-white/40 focus:outline-none focus:border-white/40
                 hover:bg-white/10 transition-colors"
        />
      </div>

      <div>
        <input
          v-model="formData.simNumber"
          type="text"
          placeholder="SIM Number"
          required
          class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-sm 
                 placeholder:text-white/40 focus:outline-none focus:border-white/40
                 hover:bg-white/10 transition-colors"
        />
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full btn"
      >
        {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
      </button>

      <p v-if="error" class="text-red-400 text-sm mt-2">{{ error }}</p>
    </form>

    <!-- Verification Form -->
    <form v-else-if="currentStep === 'verification'" @submit.prevent="handleVerification" class="space-y-4">
      <p class="text-white/70 text-center mb-4">
        Please check your email for the verification code.
      </p>
      
      <div>
        <input
          v-model="verificationToken"
          type="text"
          placeholder="Enter verification code"
          required
          class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-sm 
                 placeholder:text-white/40 focus:outline-none focus:border-white/40
                 hover:bg-white/10 transition-colors"
        />
      </div>

      <div v-if="error" class="text-red-500">
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full px-4 py-3 bg-blue-600 text-white rounded-sm
               hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
               disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? 'Verifying...' : 'Verify Email' }}
      </button>
    </form>

    <!-- Success Message -->
    <div v-else class="text-center">
      <h2 class="text-2xl font-bold mb-4">Registration Complete!</h2>
      <p>Your account has been successfully created and verified.</p>
    </div>
  </div>
</template>
