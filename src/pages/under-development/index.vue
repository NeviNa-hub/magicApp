<template>
  <view class="development-page">
    <app-page-header :title="title" />
    <view class="content-card">
      <view class="icon"></view>
      <text class="title">{{ title }}正在建设中</text>
      <text class="description">该功能暂未开放，我们正在持续完善创作体验。</text>
      <button class="primary-button" @tap="goWorkbench">返回创作台</button>
      <button class="secondary-button" @tap="goBack">返回上一页</button>
    </view>
    <app-bottom-nav active="workshop" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";

const title = ref("功能");

/**
 * 读取待开发功能名称。
 * @param {{title?: string}} query 页面查询参数。
 * @returns {void}
 */
onLoad((query) => {
  title.value = query.title ? decodeURIComponent(query.title) : "功能";
  uni.setNavigationBarTitle({ title: `${title.value}建设中` });
});

// 返回创作台。
const goWorkbench = () => {
  uni.reLaunch({ url: "/pages/workbench/index" });
};

// 返回上一页。
const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
page {
  height: 100%;
  overflow: hidden;
}

.development-page {
  height: 100vh;
  padding: 80rpx 36rpx 140rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6fafb;
  color: #17343b;
}

.content-card {
  width: 100%;
  padding: 64rpx 40rpx;
  box-sizing: border-box;
  border: 1rpx solid #dce9ea;
  border-radius: 28rpx;
  background: #fff;
  box-shadow: 0 12rpx 30rpx rgba(35, 77, 79, 0.08);
  text-align: center;
}

.icon {
  width: 112rpx;
  height: 112rpx;
  margin: 0 auto;
  border-radius: 50%;
  background: #e7f8f5;
  color: #168d84;
  font-size: 52rpx;
  line-height: 112rpx;
}

.title,
.description {
  display: block;
}

.title {
  margin-top: 32rpx;
  font-size: 34rpx;
  font-weight: 700;
}

.description {
  margin: 18rpx 0 40rpx;
  color: #71878c;
  font-size: 22rpx;
  line-height: 1.7;
}

.primary-button,
.secondary-button {
  width: 100%;
  height: 76rpx;
  border-radius: 22rpx;
  font-size: 23rpx;
}

.primary-button:after,
.secondary-button:after {
  border: 0;
}

.primary-button {
  border: 0;
  background: #087d74;
  color: #fff;
}

.secondary-button {
  margin-top: 16rpx;
  border: 1rpx solid #dce7e9;
  background: #fff;
  color: #61777c;
}
</style>
