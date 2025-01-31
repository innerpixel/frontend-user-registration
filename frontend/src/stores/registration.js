import { defineStore } from 'pinia'
import { userService } from '@/services/api'

export const REGISTRATION_STATES = {
  INITIATED: 'INITIATED',
  USERNAME_VALIDATED: 'USERNAME_VALIDATED',
  USER_CREATED: 'USER_CREATED',
  SYSTEM_USER_CREATED: 'SYSTEM_USER_CREATED',
  MAIL_CONFIGURED: 'MAIL_CONFIGURED',
  VERIFICATION_SENT: 'VERIFICATION_SENT',
  VERIFIED: 'VERIFIED',
  FAILED: 'FAILED'
}

export const useRegistrationStore = defineStore('registration', {
  state: () => ({
    currentState: null,
    userData: null,
    error: null,
    validationErrors: {},
    lastSuccessfulState: null
  }),

  getters: {
    isCompleted: (state) => state.currentState === REGISTRATION_STATES.VERIFIED,
    canProceed: (state) => state.currentState && !state.error,
    currentStateData: (state) => ({
      state: state.currentState,
      error: state.error,
      userData: state.userData
    })
  },

  actions: {
    async initRegistration(formData) {
      this.currentState = REGISTRATION_STATES.INITIATED
      this.userData = formData
      this.error = null
      this.validationErrors = {}

      try {
        // Validate username and email availability
        const validationResult = await userService.validateRegistration({
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber
        })

        if (validationResult.isValid) {
          this.currentState = REGISTRATION_STATES.USERNAME_VALIDATED
          this.lastSuccessfulState = REGISTRATION_STATES.USERNAME_VALIDATED
        } else {
          this.validationErrors = validationResult.errors
          this.currentState = REGISTRATION_STATES.FAILED
          throw new Error('Validation failed')
        }
      } catch (error) {
        this.handleError(error)
      }
    },

    async createUser() {
      try {
        const response = await userService.register(this.userData)
        this.userData = { ...this.userData, ...response.data }
        this.currentState = REGISTRATION_STATES.USER_CREATED
        this.lastSuccessfulState = REGISTRATION_STATES.USER_CREATED
      } catch (error) {
        this.handleError(error)
      }
    },

    async createSystemUser() {
      try {
        const response = await userService.createSystemUser(this.userData)
        this.userData = { ...this.userData, systemUser: response.data }
        this.currentState = REGISTRATION_STATES.SYSTEM_USER_CREATED
        this.lastSuccessfulState = REGISTRATION_STATES.SYSTEM_USER_CREATED
      } catch (error) {
        this.handleError(error)
      }
    },

    async configureMail() {
      try {
        const response = await userService.configureUserMail(this.userData)
        this.userData = { ...this.userData, mailConfig: response.data }
        this.currentState = REGISTRATION_STATES.MAIL_CONFIGURED
        this.lastSuccessfulState = REGISTRATION_STATES.MAIL_CONFIGURED
      } catch (error) {
        this.handleError(error)
      }
    },

    async sendVerification() {
      try {
        await userService.sendVerificationEmail(this.userData)
        this.currentState = REGISTRATION_STATES.VERIFICATION_SENT
        this.lastSuccessfulState = REGISTRATION_STATES.VERIFICATION_SENT
      } catch (error) {
        this.handleError(error)
      }
    },

    async verifyEmail(token) {
      try {
        const response = await userService.verifyEmail(token)
        this.userData = { ...this.userData, verified: true }
        this.currentState = REGISTRATION_STATES.VERIFIED
        this.lastSuccessfulState = REGISTRATION_STATES.VERIFIED
        return response
      } catch (error) {
        this.handleError(error)
      }
    },

    handleError(error) {
      this.error = error.message || 'An error occurred'
      this.currentState = REGISTRATION_STATES.FAILED
    },

    async retryFromLastState() {
      this.error = null
      if (!this.lastSuccessfulState) {
        await this.initRegistration(this.userData)
        return
      }

      switch (this.lastSuccessfulState) {
        case REGISTRATION_STATES.USERNAME_VALIDATED:
          await this.createUser()
          break
        case REGISTRATION_STATES.USER_CREATED:
          await this.createSystemUser()
          break
        case REGISTRATION_STATES.SYSTEM_USER_CREATED:
          await this.configureMail()
          break
        case REGISTRATION_STATES.MAIL_CONFIGURED:
          await this.sendVerification()
          break
        case REGISTRATION_STATES.VERIFICATION_SENT:
          // Can't retry verification automatically, user needs the token
          break
      }
    },

    reset() {
      this.currentState = null
      this.userData = null
      this.error = null
      this.validationErrors = {}
      this.lastSuccessfulState = null
    }
  }
})
