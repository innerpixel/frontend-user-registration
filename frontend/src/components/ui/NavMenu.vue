<template>
  <nav class="nav-menu">
    <ul class="nav-list">
      <li v-for="item in items" :key="item.path">
        <router-link 
          :to="item.path"
          :class="{ active: currentPath === item.path }"
        >
          {{ item.label }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'NavMenu',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  setup() {
    const route = useRoute()
    const currentPath = computed(() => route.path)

    return {
      currentPath
    }
  }
}
</script>

<style scoped>
.nav-menu {
  background: #fff;
  border-bottom: 1px solid #eee;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1rem;
}

.nav-list a {
  display: block;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-list a:hover {
  color: #409EFF;
}

.nav-list a.active {
  color: #409EFF;
  font-weight: 500;
}
</style>
