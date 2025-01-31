import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Create and configure the app
const app = createApp(App)

// Create pinia instance
const pinia = createPinia()

// Use plugins
app.use(pinia)
app.use(router)

// Mount the app
app.mount('#app')

// Initialize auth state
const authStore = useAuthStore()
authStore.checkAuth()
