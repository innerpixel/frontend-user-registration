<template>
  <button
    class="base-button"
    :class="[
      type ? `base-button--${type}` : '',
      size ? `base-button--${size}` : '',
      { 'is-disabled': disabled }
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <i v-if="icon" :class="icon" class="button-icon"></i>
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    type: {
      type: String,
      default: 'default',
      validator: value => ['default', 'primary', 'success', 'warning', 'danger'].includes(value)
    },
    size: {
      type: String,
      default: 'default',
      validator: value => ['small', 'default', 'large'].includes(value)
    },
    icon: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  background-color: #fff;
  color: #606266;
  cursor: pointer;
  transition: .3s;
  outline: none;
}

.base-button:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.base-button:active {
  color: #3a8ee6;
  border-color: #3a8ee6;
}

.base-button.is-disabled {
  color: #c0c4cc;
  cursor: not-allowed;
  background-image: none;
  background-color: #fff;
  border-color: #ebeef5;
}

.base-button--primary {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}

.base-button--primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
  color: #fff;
}

.base-button--success {
  color: #fff;
  background-color: #67c23a;
  border-color: #67c23a;
}

.base-button--success:hover {
  background: #85ce61;
  border-color: #85ce61;
  color: #fff;
}

.base-button--warning {
  color: #fff;
  background-color: #e6a23c;
  border-color: #e6a23c;
}

.base-button--warning:hover {
  background: #ebb563;
  border-color: #ebb563;
  color: #fff;
}

.base-button--danger {
  color: #fff;
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.base-button--danger:hover {
  background: #f78989;
  border-color: #f78989;
  color: #fff;
}

.base-button--small {
  padding: 6px 12px;
  font-size: 12px;
}

.base-button--large {
  padding: 12px 20px;
  font-size: 16px;
}

.button-icon {
  margin-right: 4px;
}
</style>
