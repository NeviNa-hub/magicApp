<template>
  <view class="library-page">
    <app-page-header title="作品库" />
    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <view class="title-row">
        <text class="page-title">作品库</text>
        <text class="summary"> {{ summary }}</text>
      </view>
      <view class="tabs">
        <text
          v-for="tab in tabs"
          :key="tab.name"
          :class="{ active: activeStatus === tab.status }"
          @click="handleTabChange(tab.status)"
        >
          {{ tab.name }}　{{ tab.count }}
        </text>
      </view>
      <view class="generating">
        <view class="generating-label">造物<br />中</view>
        <view class="generating-body">
          <text>《宋式水墨远山图》</text>
          <text class="status"> 墨骨勾勒中（68%）</text>
          <view class="progress">
            <view></view>
          </view>
        </view>
        <text class="remaining">预计还需 10 秒</text>
        <text class="close">×</text>
      </view>
      <view class="section-title">历史画卷 <text>长按可批量导出</text></view>
      <view class="work-grid">
        <view v-for="work in works" :key="work.work_id" class="work-card">
          <view class="art" :class="work.class_name">
            <text>逸才意境</text>
          </view>
          <text class="more">•••</text>
          <text class="work-title">{{ work.title }}</text>
        </view>
      </view>
    </scroll-view>
    <app-bottom-nav active="works" />
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";

import { getLibraryData } from "@/apis/creation";
import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";

const activeStatus = ref("all");
const summary = ref("");
const works = ref([]);
const tabs = ref([]);

// 加载作品库数据。
const loadLibraryData = async () => {
  const response = await getLibraryData({
    page: 1,
    page_size: 10,
    status: activeStatus.value,
  });
  if (response.code === 0) {
    summary.value = response.data.summary;
    tabs.value = response.data.tabs;
    works.value = response.data.lists;
  }
};

/**
 * 切换作品状态筛选并重新加载列表。
 * @param {string} status 作品状态。
 * @returns {Promise<void>}
 */
const handleTabChange = async (status) => {
  activeStatus.value = status;
  await loadLibraryData();
};

onMounted(async () => {
  await loadLibraryData();
});
</script>

<style scoped>
page {
  height: 100%;
  overflow: hidden;
}

.library-page {
  height: 100vh;
  overflow: hidden;
  background: #f7f9ff;
  color: #142b3c;
}

.content {
  height: calc(100vh - 214rpx);
  padding: 30rpx 36rpx 30rpx;
  box-sizing: border-box;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font: 700 44rpx serif;
}

.summary {
  padding: 10rpx 16rpx;
  border-radius: 24rpx;
  background: #eef5fc;
  color: #546a73;
  font-size: 19rpx;
}

.summary:first-letter {
  color: #54bdb6;
}

.tabs {
  display: flex;
  gap: 10rpx;
  margin-top: 24rpx;
}

.tabs text {
  padding: 18rpx 24rpx;
  border-radius: 22rpx;
  background: #fff;
  color: #55666e;
  font-size: 22rpx;
  box-shadow: 0 3rpx 10rpx rgba(38, 70, 88, 0.04);
}

.tabs text.active {
  background: #007d73;
  color: #fff;
}

.generating {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 142rpx;
  margin-top: 28rpx;
  padding: 20rpx 22rpx;
  border: 1rpx solid #e3edf1;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 5rpx 14rpx rgba(39, 76, 96, 0.08);
}

.generating-label {
  width: 64rpx;
  padding: 8rpx 4rpx;
  border-radius: 6rpx;
  background: #fff0f0;
  color: #d53136;
  font-weight: 700;
  line-height: 1.15;
  text-align: center;
}

.generating-body {
  flex: 1;
  margin-left: 16rpx;
}

.generating-body > text {
  display: block;
  font-size: 22rpx;
  font-weight: 700;
}

.generating-body > text:first-child {
  color: #172e40;
  font-size: 26rpx;
}

.generating-body .status {
  margin-top: 14rpx;
  color: #148f87;
  font-size: 19rpx;
  font-weight: 600;
}

.progress {
  height: 10rpx;
  margin-top: 12rpx;
  border-radius: 8rpx;
  background: #dcecf1;
}

.progress view {
  width: 68%;
  height: 100%;
  border-radius: inherit;
  background: #057e76;
  box-shadow: 0 0 8rpx rgba(0, 137, 126, 0.22);
}

.remaining {
  align-self: flex-end;
  margin: 0 6rpx 34rpx 20rpx;
  color: #788b91;
  font-size: 18rpx;
  white-space: nowrap;
}

.close {
  position: absolute;
  top: 14rpx;
  right: 18rpx;
  color: #8a9a9e;
  font-size: 32rpx;
  font-weight: 300;
}

.section-title {
  display: flex;
  justify-content: space-between;
  margin: 36rpx 0 18rpx;
  font: 700 28rpx serif;
}

.section-title text {
  color: #75878c;
  font: 20rpx sans-serif;
}

.work-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.work-card {
  position: relative;
  overflow: hidden;
  border-radius: 18rpx;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(30, 55, 70, 0.06);
}

.art {
  height: 330rpx;
  padding: 14rpx;
  box-sizing: border-box;
  color: #435e61;
  font-size: 16rpx;
}

.river-work {
  background: linear-gradient(145deg, #e7e5d8 5%, #aebbb2 55%, #657c7b);
}

.bamboo-work {
  background: linear-gradient(145deg, #f2eee1 15%, #b1cdbb 55%, #6c947b);
}

.tea-work {
  background: linear-gradient(145deg, #8b684c 0 12%, #f0e7d9 13% 68%, #c5a47b);
}

.mist-work {
  background: linear-gradient(145deg, #f0eee1, #b3c4be 52%, #576f71);
}

.more {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  color: #425761;
  text-align: center;
  line-height: 36rpx;
}

.work-title {
  display: block;
  padding: 18rpx;
  font: 24rpx serif;
}
</style>
