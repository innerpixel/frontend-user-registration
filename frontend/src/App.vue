<template>
  <div class="app-container">
    <header class="main-header">
      <nav class="main-nav">
        <div class="logo">
          <img src="@/assets/logo.svg" alt="Logo" />
          <span>Cosmic User Management</span>
        </div>
        <NavMenu :items="menuItems" />
        <div class="user-menu" v-if="authStore.isAuthenticated">
          <div class="user-dropdown" @click="toggleDropdown">
            <div class="user-avatar">
              <img :src="authStore.userAvatar" alt="User avatar" />
            </div>
            <span>{{ authStore.user?.username }}</span>
            <div v-if="showDropdown" class="dropdown-menu">
              <button @click="handleCommand('profile')">Profile</button>
              <button @click="handleCommand('settings')">Settings</button>
              <button @click="handleCommand('logout')">Logout</button>
            </div>
          </div>
        </div>
      </nav>
    </header>
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavMenu from '@/components/ui/NavMenu.vue'

export default {
  name: 'App',
  components: {
    NavMenu
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const showDropdown = ref(false)
    
    const menuItems = [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/users', label: 'System Users' },
      { path: '/registration', label: 'Register' }
    ]

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value
    }

    const handleCommand = async (command) => {
      showDropdown.value = false
      switch (command) {
        case 'profile':
          router.push('/profile')
          break
        case 'settings':
          router.push('/settings')
          break
        case 'logout':
          await authStore.logout()
          router.push('/login')
          break
      }
    }

    return {
      authStore,
      menuItems,
      showDropdown,
      toggleDropdown,
      handleCommand
    }
  }
}
</script>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.main-nav {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 2rem;
}

.logo img {
  height: 32px;
  width: auto;
}

.user-menu {
  margin-left: auto;
  position: relative;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.user-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  padding: 0.5rem 0;
  min-width: 120px;
}

.dropdown-menu button {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
}

.dropdown-menu button:hover {
  background: #f5f7fa;
}

.main-content {
  flex: 1;
  padding: 1rem;
}
</style>
