<template>
  <view class="app-page-header">
    <view v-if="canGoBack" class="header-back" @click="handleBack">‹</view>
    <view class="header-title">{{ title }}</view>
    <view class="header-points">
      <text class="points-icon">✦</text>
      <text class="points-label">灵感点</text>
      <text class="points-value">800</text>
      <text class="points-detail">明细</text>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";

defineProps({
  title: { type: String, required: true },
});

const canGoBack = ref(false);

// 根据当前页面栈决定是否显示返回箭头。
const updateBackState = () => {
  canGoBack.value = getCurrentPages().length > 1;
};

// 返回上一页。
const handleBack = () => {
  uni.navigateBack();
};

onMounted(() => {
  updateBackState();
});
</script>

<style scoped>
.app-page-header {
  height: 100rpx;
  padding: 0 35rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #e5edef;
  background: #fff;
  color: #000000;
}

.header-title {
  flex: 1;
  font-size: 33rpx;
  font-weight: 700;
  color: #03726bb4;
}

.header-back {
  width: 44rpx;
  margin-right: 4rpx;
  color: #142b3c;
  font-size: 44rpx;
  line-height: 1;
  text-align: left;
}

.header-points {
  display: flex;
  align-items: center;
  padding: 10rpx 14rpx;
  border: 1rpx solid rgba(95, 133, 117, 0.16);
  border-radius: 999rpx;
  background: #e8efea;
  color: #5f8575;
  font-size: 18rpx;
  white-space: nowrap;
}

.points-icon {
  margin-right: 6rpx;
  color: #c29b63;
  font-size: 17rpx;
}

.points-label {
  letter-spacing: 1rpx;
}

.points-value {
  margin-left: 6rpx;
  color: #477665;
  font-size: 20rpx;
  font-weight: 700;
}

.points-detail {
  margin-left: 10rpx;
  padding-left: 10rpx;
  border-left: 1rpx solid rgba(95, 133, 117, 0.22);
  color: #5f8575;
  font-size: 17rpx;
}
</style>
