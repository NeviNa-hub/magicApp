<template>
  <button
    class="app-flow-button"
    :class="[`is-${variant}`, { 'is-block': block, 'is-loading': loading }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <view v-if="loading" class="loading-dot"></view>
    <slot></slot>
  </button>
</template>

<script setup>
/**
 * 流式按钮组件。
 * @property {"primary"|"secondary"|"danger"} variant 按钮视觉类型。
 * @property {boolean} block 是否撑满剩余宽度。
 * @property {boolean} disabled 是否禁用。
 * @property {boolean} loading 是否处于提交中，展示加载点并禁用点击。
 */
const props = defineProps({
  variant: {
    type: String,
    default: "primary",
  },
  block: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

// 提交中或禁用时不触发点击
const handleClick = () => {
  if (props.disabled || props.loading) {
    return;
  }

  emit("click");
};
</script>

<style scoped lang="scss">
.app-flow-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  min-width: 0;
  height: $tap-size;
  margin: 0;
  padding: 0 24rpx;
  border: 1rpx solid transparent;
  border-radius: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1;

  /* 清除小程序原生按钮的伪元素描边，保证两端外观一致 */
  &::after {
    border: 0;
  }
}

.app-flow-button.is-block {
  flex: 1;
  width: 100%;
}

.app-flow-button.is-primary {
  @include primary-fill;
  color: #fff;
}

.app-flow-button.is-secondary {
  border-color: $color-line;
  background: $color-surface;
  color: #4e665e;
  font-weight: 400;
}

.app-flow-button.is-danger {
  border-color: #f0c9c5;
  background: #fdf5f4;
  color: $color-danger;
  font-weight: 400;
}

.app-flow-button[disabled] {
  opacity: 0.55;
}

.loading-dot {
  width: 28rpx;
  height: 28rpx;
  flex-shrink: 0;
  border: 3rpx solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  border-radius: 50%;
  animation: flow-button-spin 0.8s linear infinite;
}

.is-secondary .loading-dot,
.is-danger .loading-dot {
  border-color: rgba(184, 134, 78, 0.25);
  border-top-color: $color-primary;
}

@keyframes flow-button-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (hover: hover) {
  .app-flow-button.is-primary:hover {
    background: $color-primary-hover;
  }

  .app-flow-button.is-secondary:hover {
    border-color: #bfd8ce;
    background: #f8faf7;
    color: $color-primary;
  }

  .app-flow-button.is-danger:hover {
    border-color: #e3a9a3;
    background: #fbeceb;
    color: $color-danger;
  }
}
</style>
