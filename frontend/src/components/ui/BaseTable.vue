<template>
  <div class="base-table-wrapper">
    <table class="base-table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.prop"
            :style="{ width: column.width }"
            @click="handleSort(column)"
          >
            {{ column.label }}
            <span v-if="column.sortable" class="sort-icon">
              ▲
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in processedData" :key="index">
          <td
            v-for="column in columns"
            :key="column.prop"
          >
            <slot :name="column.prop" :row="row">
              {{ row[column.prop] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'BaseTable',
  props: {
    data: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      sortBy: null,
      sortOrder: 'asc'
    }
  },
  computed: {
    processedData() {
      if (!this.sortBy) return this.data

      return [...this.data].sort((a, b) => {
        const aVal = a[this.sortBy]
        const bVal = b[this.sortBy]

        if (this.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    }
  },
  methods: {
    handleSort(column) {
      if (!column.sortable) return

      if (this.sortBy === column.prop) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortBy = column.prop
        this.sortOrder = 'asc'
      }
    }
  }
}
</script>

<style scoped>
.base-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.base-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ebeef5;
  font-size: 14px;
}

.base-table th,
.base-table td {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
  text-align: left;
}

.base-table th {
  background-color: #f5f7fa;
  color: #909399;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.base-table th:hover {
  background-color: #ebeef5;
}

.base-table tr:hover {
  background-color: #f5f7fa;
}

.sort-icon {
  margin-left: 4px;
  font-size: 12px;
  color: #c0c4cc;
}

.sort-icon.active {
  color: #409eff;
}
</style>
