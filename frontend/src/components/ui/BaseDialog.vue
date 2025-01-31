<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="modelValue" class="dialog-overlay" @click="handleOverlayClick">
        <div class="dialog-wrapper">
          <div class="dialog" @click.stop>
            <div class="dialog-header">
              <h3 class="dialog-title">
                <slot name="title">{{ title }}</slot>
              </h3>
              <button class="dialog-close" @click="close">×</button>
            </div>
            
            <div class="dialog-body">
              <slot></slot>
            </div>
            
            <div v-if="$slots.footer" class="dialog-footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'BaseDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    closeOnClickOverlay: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue'],
  methods: {
    close() {
      this.$emit('update:modelValue', false)
    },
    handleOverlayClick() {
      if (this.closeOnClickOverlay) {
        this.close()
      }
    }
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.dialog-wrapper {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.dialog {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  width: 50%;
  max-width: 600px;
}

.dialog-header {
  padding: 20px;
  padding-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.dialog-close {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #909399;
}

.dialog-close:hover {
  color: #409eff;
}

.dialog-body {
  padding: 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-footer {
  padding: 20px;
  padding-top: 10px;
  text-align: right;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .dialog {
    width: 90%;
  }
}
</style>
