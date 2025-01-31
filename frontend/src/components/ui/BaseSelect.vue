<template>
  <div class="base-select" @click="toggleDropdown" v-click-outside="closeDropdown">
    <div class="select-trigger" :class="{ 'is-open': isOpen }">
      <span class="selected-value">{{ displayValue }}</span>
      <span class="select-arrow"></span>
    </div>
    <div v-show="isOpen" class="select-dropdown">
      <div 
        v-if="clearable" 
        class="select-option" 
        @click="selectOption(null)"
      >
        Clear
      </div>
      <div
        v-for="option in options"
        :key="option.value"
        class="select-option"
        :class="{ 'is-selected': option.value === modelValue }"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseSelect',
  props: {
    modelValue: {
      type: [String, Number, Boolean],
      default: ''
    },
    options: {
      type: Array,
      required: true
    },
    placeholder: {
      type: String,
      default: 'Select option'
    },
    clearable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isOpen: false
    }
  },
  computed: {
    displayValue() {
      if (!this.modelValue && this.modelValue !== 0) {
        return this.placeholder
      }
      const option = this.options.find(opt => opt.value === this.modelValue)
      return option ? option.label : this.placeholder
    }
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },
    closeDropdown() {
      this.isOpen = false
    },
    selectOption(value) {
      this.$emit('update:modelValue', value)
      this.closeDropdown()
    }
  },
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el.clickOutsideEvent = function(event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value()
          }
        }
        document.addEventListener('click', el.clickOutsideEvent)
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent)
      }
    }
  }
}
</script>

<style scoped>
.base-select {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.2s;
}

.select-trigger:hover {
  border-color: #c0c4cc;
}

.select-trigger.is-open {
  border-color: #409eff;
}

.select-arrow {
  border-style: solid;
  border-width: 5px 5px 0 5px;
  border-color: #c0c4cc transparent transparent transparent;
  transition: transform 0.2s;
}

.is-open .select-arrow {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  padding: 4px 0;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  z-index: 100;
}

.select-option {
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
}

.select-option:hover {
  background-color: #f5f7fa;
}

.select-option.is-selected {
  color: #409eff;
  font-weight: bold;
  background-color: #ecf5ff;
}
</style>
