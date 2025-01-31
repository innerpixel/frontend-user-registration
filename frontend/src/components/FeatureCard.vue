<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="p-6 rounded border border-white/10 bg-white/5">
    <div class="w-12 h-12 mb-4 flex items-center justify-center">
      <span class="text-2xl">{{ icon }}</span>
    </div>
    <h3 class="text-xl font-bold text-white/90 mb-2">{{ title }}</h3>
    <p class="text-white/60">{{ description }}</p>
  </div>
</template>
