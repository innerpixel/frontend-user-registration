<template>
  <span
    class="base-tag"
    :class="[
      `base-tag--${type}`,
      size ? `base-tag--${size}` : ''
    ]"
  >
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'BaseTag',
  props: {
    type: {
      type: String,
      default: 'default',
      validator: value => ['default', 'success', 'warning', 'danger', 'info'].includes(value)
    },
    size: {
      type: String,
      default: 'default',
      validator: value => ['small', 'default', 'large'].includes(value)
    }
  }
}
</script>

<style scoped>
.base-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  line-height: 1;
  border-radius: 4px;
  white-space: nowrap;
  color: #fff;
}

.base-tag--default {
  background-color: #909399;
}

.base-tag--success {
  background-color: #67c23a;
}

.base-tag--warning {
  background-color: #e6a23c;
}

.base-tag--danger {
  background-color: #f56c6c;
}

.base-tag--info {
  background-color: #909399;
}

.base-tag--small {
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
}

.base-tag--large {
  height: 28px;
  padding: 0 10px;
  font-size: 13px;
}
</style>
