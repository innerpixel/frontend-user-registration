<template>
  <div class="users-list">
    <div class="header">
      <h2>System Users</h2>
      <div class="filters">
        <div class="search-filter">
          <BaseInput
            v-model="searchQuery"
            type="search"
            placeholder="Search users..."
            icon="search-icon"
          />
        </div>
        <div class="status-filter">
          <BaseSelect
            v-model="statusFilter"
            :options="[
              { value: '', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' },
              { value: 'inactive', label: 'Inactive' }
            ]"
            placeholder="Status"
            clearable
          />
        </div>
      </div>
    </div>

    <BaseTable
      v-loading="loading"
      :data="filteredUsers"
      style="width: 100%"
      border
    >
      <template #username="{ row }">
        <div class="user-info">
          <img :src="getUserAvatar(row.username)" class="user-avatar" alt="User avatar" />
          <span>{{ row.username }}</span>
        </div>
      </template>
      
      <template #status="{ row }">
        <BaseTag :type="getStatusType(row.status)">
          {{ row.status }}
        </BaseTag>
      </template>

      <template #lastLogin="{ row }">
        {{ formatDate(row.lastLogin) }}
      </template>

      <template #homeDir="{ row }">
        {{ row.homeDir }}
      </template>

      <template #actions="{ row }">
        <div class="action-buttons">
          <BaseButton
            icon="view-icon"
            type="primary"
            size="small"
            @click="viewUserDetails(row)"
          >
            View
          </BaseButton>
          <BaseButton
            icon="delete-icon"
            type="danger"
            size="small"
            :disabled="!canRemoveUser(row)"
            @click="confirmRemoveUser(row)"
          >
            Remove
          </BaseButton>
        </div>
      </template>
    </BaseTable>

    <!-- User Details Dialog -->
    <BaseDialog
      v-model="detailsDialog.visible"
      :title="'User Details: ' + (detailsDialog.user?.username || '')"
      width="600px"
    >
      <div v-if="detailsDialog.user" class="user-details">
        <div class="detail-row">
          <span class="detail-label">Username:</span>
          <span class="detail-value">{{ detailsDialog.user.username }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <BaseTag :type="getStatusType(detailsDialog.user.status)">
            {{ detailsDialog.user.status }}
          </BaseTag>
        </div>
        <div class="detail-row">
          <span class="detail-label">Home Directory:</span>
          <span class="detail-value">{{ detailsDialog.user.homeDir }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Mail Directory:</span>
          <span class="detail-value">{{ detailsDialog.user.mailDir }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Last Login:</span>
          <span class="detail-value">{{ formatDate(detailsDialog.user.lastLogin) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">System Info:</span>
          <span class="detail-value">{{ detailsDialog.user.systemInfo }}</span>
        </div>
      </div>
    </BaseDialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { format } from 'date-fns';
import BaseInput from './ui/BaseInput.vue';
import BaseSelect from './ui/BaseSelect.vue';
import BaseTable from './ui/BaseTable.vue';
import BaseButton from './ui/BaseButton.vue';
import BaseTag from './ui/BaseTag.vue';
import BaseDialog from './ui/BaseDialog.vue';

export default {
  name: 'UsersList',
  components: {
    BaseInput,
    BaseSelect,
    BaseTable,
    BaseButton,
    BaseTag,
    BaseDialog
  },
  setup() {
    const users = ref([]);
    const loading = ref(false);
    const searchQuery = ref('');
    const statusFilter = ref('');
    const detailsDialog = ref({
      visible: false,
      user: null
    });

    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        const matchesSearch = !searchQuery.value || 
          user.username.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesStatus = !statusFilter.value || 
          user.status.toLowerCase() === statusFilter.value.toLowerCase();
        return matchesSearch && matchesStatus;
      });
    });

    const fetchUsers = async () => {
      try {
        loading.value = true;
        const response = await axios.get('/api/users/system');
        users.value = response.data.users.map(user => ({
          ...user,
          status: determineUserStatus(user)
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        loading.value = false;
      }
    };

    const determineUserStatus = (user) => {
      if (!user.lastLogin || user.lastLogin.includes('Never logged in')) {
        return 'pending';
      }
      // Add more status logic as needed
      return 'active';
    };

    const getStatusType = (status) => {
      const types = {
        active: 'success',
        pending: 'warning',
        inactive: 'info'
      };
      return types[status] || 'info';
    };

    const getUserAvatar = (username) => {
      return `https://ui-avatars.com/api/?name=${username}&background=random`;
    };

    const formatDate = (date) => {
      if (!date || date.includes('Never')) return 'Never';
      try {
        return format(new Date(date), 'PPp');
      } catch (error) {
        return date;
      }
    };

    const viewUserDetails = (user) => {
      detailsDialog.value = {
        visible: true,
        user
      };
    };

    const canRemoveUser = (user) => {
      // Add logic to determine if user can be removed
      return true;
    };

    const confirmRemoveUser = (user) => {
      if (confirm(`Are you sure you want to remove user ${user.username}? This action cannot be undone.`)) {
        removeUser(user);
      }
    };

    const removeUser = async (user) => {
      try {
        loading.value = true;
        await axios.delete(`/api/users/system/${user.username}`);
        console.log(`User ${user.username} removed successfully`);
        await fetchUsers();
      } catch (error) {
        console.error('Error removing user:', error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      loading,
      searchQuery,
      statusFilter,
      filteredUsers,
      detailsDialog,
      getStatusType,
      getUserAvatar,
      formatDate,
      viewUserDetails,
      canRemoveUser,
      confirmRemoveUser
    };
  }
};
</script>

<style scoped>
.users-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-details {
  margin-top: 20px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-label {
  font-weight: 500;
  color: #606266;
  width: 120px;
}

.detail-value {
  color: #303133;
}
</style>
