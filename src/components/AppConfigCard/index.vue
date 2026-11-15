<template>
  <view class="app-config-card">
    <view v-if="title" class="config-title">
      <view class="config-title-main">
        <text v-if="index" class="config-index">{{ index }} ·</text>
        <text>{{ title }}</text>
      </view>
      <slot name="extra"></slot>
    </view>
    <slot></slot>
  </view>
</template>

<script setup>
/**
 * 配置卡片组件。
 * @property {string} index 区块序号，如“壹”，为空时不展示。
 * @property {string} title 区块标题，为空时不展示标题行。
 */
defineProps({
  index: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
});
</script>

<style scoped lang="scss">
.app-config-card {
  min-width: 0;
  padding: 28rpx;
  border-radius: 24rpx;
  background: $color-surface;
  box-shadow: 0 6rpx 20rpx rgba(150, 100, 40, 0.14);
  box-sizing: border-box;
}

.config-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding-bottom: 28rpx;
  color: $color-primary-deep;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.3;
}

.config-title-main {
  display: flex;
  align-items: baseline;
  min-width: 0;
}

.config-index {
  flex-shrink: 0;
  margin-right: 8rpx;
  color: #d9be9b;
}
</style>
