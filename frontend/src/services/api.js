import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const userService = {
  // Initial registration
  async register({ name, displayName, email, systemEmail, password, phoneNumber }) {
    try {
      // Step 1: Register user with auth service
      const authResponse = await authApi.post('/api/auth/register', {
        username: name,
        displayName,
        email,
        systemEmail,
        password,
        phoneNumber
      })

      // Step 2: Create system user and setup mail
      const systemResponse = await api.post('/users/system-setup', {
        username: name,
        displayName,
        email,
        systemEmail,
        phoneNumber,
        token: authResponse.data.token
      })

      // Step 3: Send verification email
      await authApi.post('/api/auth/send-verification', {
        email,
        token: authResponse.data.token
      })

      return {
        ...authResponse.data,
        systemSetup: systemResponse.data
      }
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Verify email
  async verifyEmail(token) {
    try {
      // Step 1: Verify the email
      const verifyResponse = await authApi.post('/api/auth/verify-email', { token })
      
      // Step 2: Complete system setup if verification successful
      if (verifyResponse.data.verified) {
        await api.post('/users/complete-setup', {
          token: verifyResponse.data.token
        })
      }

      return verifyResponse.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get user system status
  async getSystemStatus(username) {
    try {
      const response = await api.get(`/users/${username}/system-status`)
      return {
        ...response.data,
        ready: response.data.systemUserCreated && 
               response.data.mailConfigured && 
               response.data.verified
      }
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}
