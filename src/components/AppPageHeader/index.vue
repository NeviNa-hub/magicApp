<template>
  <view class="app-page-header">
    <view class="header-title">{{ title }}</view>
    <view class="header-points">
      <text>灵感点</text>
      <text class="points-value">800</text>
      <text class="points-detail">明细</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  /** 页面标题。 */
  title: { type: String, required: true },
});
</script>

<style scoped>
.app-page-header {
  height: 50rpx;
  padding: 0 32rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #e5edef;
  background: #fff;
  color: #000000;
}

.header-title {
  flex: 1;
  font-size: 20rpx;
  font-weight: 700;
}

.header-points {
  justify-content: flex-end;
  color: #5c737a;
  font-size: 15rpx;
  white-space: nowrap;
}

.points-value {
  margin-left: 10rpx;
  color: #158d84;
}

.points-detail {
  margin-left: 10rpx;
  color: #82979c;
}
</style>
