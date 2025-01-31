<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <div class="dashboard-stats">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p class="stat-value">{{ stats.totalUsers }}</p>
      </div>
      <div class="stat-card">
        <h3>Active Users</h3>
        <p class="stat-value">{{ stats.activeUsers }}</p>
      </div>
      <div class="stat-card">
        <h3>System Load</h3>
        <p class="stat-value">{{ stats.systemLoad }}%</p>
      </div>
    </div>
    <div class="recent-activity">
      <h2>Recent Activity</h2>
      <div class="activity-list">
        <div v-for="(activity, index) in recentActivities" :key="index" class="activity-item">
          <span class="activity-time">{{ formatDate(activity.timestamp) }}</span>
          <span class="activity-description">{{ activity.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import axios from 'axios'

export default {
  name: 'Dashboard',
  setup() {
    const stats = ref({
      totalUsers: 0,
      activeUsers: 0,
      systemLoad: 0
    })

    const recentActivities = ref([])

    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/stats')
        stats.value = response.data
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      }
    }

    const fetchRecentActivities = async () => {
      try {
        const response = await axios.get('/api/dashboard/activities')
        recentActivities.value = response.data
      } catch (error) {
        console.error('Failed to fetch recent activities:', error)
      }
    }

    const formatDate = (date) => {
      return format(new Date(date), 'MMM d, yyyy HH:mm')
    }

    onMounted(() => {
      fetchStats()
      fetchRecentActivities()
    })

    return {
      stats,
      recentActivities,
      formatDate
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard h1 {
  margin-bottom: 24px;
  color: #2c3e50;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card h3 {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.stat-value {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.recent-activity {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.recent-activity h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #2c3e50;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.activity-time {
  font-size: 14px;
  color: #666;
  min-width: 150px;
}

.activity-description {
  color: #2c3e50;
}
</style>
