<template>
  <!-- 用遮罩位置类切换对齐方式，避免依赖 :has()，兼容低版本 Android WebView -->
  <view
    class="sheet-mask"
    :class="`is-placement-${placement}`"
    @tap="handleMaskTap"
  >
    <view
      class="sheet"
      :class="[`is-${placement}`, `is-align-${align}`]"
      @tap.stop
    >
      <view v-if="title || showClose" class="sheet-header">
        <text class="sheet-title">{{ title }}</text>
        <slot name="extra"></slot>
        <text v-if="showClose" class="sheet-close" @tap="emitClose">×</text>
      </view>
      <view class="sheet-body">
        <slot></slot>
      </view>
      <view v-if="$slots.footer" class="sheet-footer">
        <slot name="footer"></slot>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 底部弹板组件。
 * @property {string} title 弹层标题，为空且不展示关闭按钮时隐藏标题行。
 * @property {"bottom"|"center"} placement 弹层位置：底部弹板或居中弹窗。
 * @property {boolean} showClose 是否展示右上角关闭按钮。
 * @property {boolean} closeOnMask 点击遮罩是否关闭。
 * @property {"left"|"center"} align 内容对齐方式。
 */
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  placement: {
    type: String,
    default: "bottom",
  },
  showClose: {
    type: Boolean,
    default: false,
  },
  closeOnMask: {
    type: Boolean,
    default: true,
  },
  align: {
    type: String,
    default: "left",
  },
});

const emit = defineEmits(["close"]);

// 按配置关闭弹层
const emitClose = () => {
  emit("close");
};

// 点击遮罩时按配置关闭弹层
const handleMaskTap = () => {
  if (!props.closeOnMask) {
    return;
  }

  emitClose();
};
</script>

<style scoped lang="scss">
.sheet-mask {
  position: fixed;
  /* 高于底部导航（20），弹层出现时导航与侧栏一并被遮罩覆盖 */
  z-index: 40;
  inset: 0;
  display: flex;
  align-items: flex-end;
  background: rgba(20, 28, 27, 0.52);
}

.sheet-mask.is-placement-center {
  align-items: center;
  justify-content: center;
  padding: 0 48rpx;
  box-sizing: border-box;
}

.sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 88vh;
  background: $color-surface;
  box-sizing: border-box;
}

.sheet.is-bottom {
  padding: 32rpx 28rpx;
  padding-bottom: calc(#{24rpx} + constant(safe-area-inset-bottom));
  padding-bottom: calc(#{24rpx} + env(safe-area-inset-bottom));
  border-radius: 32rpx 32rpx 0 0;
  margin: 0 auto;

  /* 宽屏下与页面内容区同宽居中，避免底部弹板横跨整屏 */
  @media (min-width: $breakpoint-tablet) {
    max-width: 750px;
  }
}

.sheet.is-center {
  width: 100%;
  max-height: 72vh;
  padding: 32rpx 28rpx;
  border-radius: 32rpx;

  @media (min-width: $breakpoint-tablet) {
    max-width: 640px;
  }
}

.sheet-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 16rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid $color-line;
}

.sheet-title {
  flex: 1;
  min-width: 0;
  color: $color-ink;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.3;
  @include text-ellipsis;
}

.sheet-close {
  @include tap-area(72rpx);
  flex-shrink: 0;
  margin-right: -12rpx;
  color: $color-muted;
  font-size: 34rpx;
  line-height: 1;
}

.sheet-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.sheet.is-align-center .sheet-body {
  text-align: center;
}

.sheet-footer {
  flex-shrink: 0;
  gap: 16rpx;
  padding-top: 24rpx;
}
</style>
