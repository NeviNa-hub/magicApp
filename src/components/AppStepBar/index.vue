<template>
  <view class="app-step-bar">
    <template v-for="(step, index) in steps" :key="step.label">
      <view v-if="index > 0" class="step-connector"></view>
      <view
        class="step"
        :class="[
          `is-${step.state || 'inactive'}`,
          { 'is-clickable': step.clickable },
        ]"
        @click="handleStepClick(step, index)"
      >
        <text class="step-index">{{ index + 1 }}</text>
        <text>{{ step.label }}</text>
      </view>
    </template>
  </view>
</template>

<script setup>
/**
 * 步骤条组件。
 * @property {Array<{label: string, state?: string, clickable?: boolean}>} steps
 *   步骤列表；state 支持 done / active / inactive，clickable 表示该步骤可回跳。
 */
defineProps({
  steps: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["step-click"]);

/**
 * 点击可回跳步骤时向上抛出步骤下标。
 * @param {Object} step 步骤配置。
 * @param {number} index 步骤下标。
 * @returns {void}
 */
const handleStepClick = (step, index) => {
  if (!step.clickable) {
    return;
  }

  emit("step-click", index);
};
</script>

<style scoped lang="scss">
.app-step-bar {
  flex: none;
  height: 82rpx;
  margin: 16rpx 32rpx 0;
  padding: 8rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid rgba(63, 102, 86, 0.12);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8rpx 22rpx rgba(19, 76, 68, 0.06);
}

.step {
  flex: 1;
  padding: 12rpx 0;
  border-radius: 16rpx;
  color: $color-muted;
  text-align: center;
  font-size: 24rpx;
  white-space: nowrap;

  .step-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40rpx;
    height: 40rpx;
    margin-right: 8rpx;
    border-radius: 50%;
    background: #dfdfd5;
    color: $color-muted;
    font-size: 22rpx;
  }
}

.step-connector {
  flex: 1;
  height: 2rpx;
  margin: 0 16rpx;
  background: linear-gradient(90deg, $color-primary-deep, #dfdfd5);
}

.step.is-done {
  color: $color-primary-deep;

  .step-index {
    background: $color-primary-light;
    color: $color-primary;
  }
}

.step.is-active {
  @include primary-fill;
  color: #fff;
  font-weight: 700;

  /* 徽章底色与步骤底色一致时改为半透明白底，避免圆形徽章融进背景 */
  .step-index {
    background: rgba(255, 255, 255, 0.24);
    color: #fff;
  }
}

.step.is-clickable {
  cursor: pointer;
}

@media (hover: hover) {
  .step.is-clickable:hover {
    color: $color-primary;
  }
}
</style>
