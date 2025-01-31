import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    token: null
  }),

  getters: {
    userAvatar: (state) => {
      if (!state.user?.username) return null
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(state.user.username)}&background=random`
    }
  },

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/login', credentials)
        const { token, user } = response.data

        this.setToken(token)
        this.setUser(user)
        this.setAuthenticated(true)

        return response
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },

    async logout() {
      try {
        await axios.post('/logout')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.clearAuth()
      }
    },

    async checkAuth() {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        this.setToken(token)
        const response = await axios.get('/me')
        this.setUser(response.data)
        this.setAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        this.clearAuth()
      }
    },

    setToken(token) {
      this.token = token
      if (token) {
        localStorage.setItem('token', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      }
    },

    setUser(user) {
      this.user = user
    },

    setAuthenticated(value) {
      this.isAuthenticated = value
    },

    clearAuth() {
      this.setToken(null)
      this.setUser(null)
      this.setAuthenticated(false)
    }
  }
})
