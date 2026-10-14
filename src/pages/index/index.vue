<template>
  <view class="home-page">
    <app-page-header title="首页" />

    <scroll-view scroll-y :show-scrollbar="false" class="main-scroll">
      <view class="greeting-row">
        <view class="greeting-left">
          <text class="greeting-title">东方意象美学</text>
          <view class="greeting-marquee">
            <view class="marquee-track">
              以笔为引，以意生花 · 极简智能多模态创作
            </view>
          </view>
        </view>
        <text class="weather">今日谷雨</text>
      </view>

      <view class="hero-card">
        <view class="hero-art">
          <image
            class="hero-image"
            src="/static/home/home-1.png"
            mode="aspectFill"
          />
          <view class="hero-label">今日推荐 · 烟岚登翠</view>
          <view class="hero-caption">青绿水墨江南</view>
          <view class="hero-hint">
            提示词：水墨淋漓，宋式青绿设色，微风拂动湖面 ...
          </view>
        </view>
        <view class="hero-footer">
          <view class="hero-meta">
            <!-- <view class="meta-icon"></view> -->
            <view>
              <text class="meta-title">国产大模型</text>
              <text class="meta-subtitle">已生成 1,280 次</text>
            </view>
          </view>
          <button class="try-button" @click="handleTryCreation">
            同款创作
          </button>
        </view>
      </view>

      <view class="section-heading">
        <text>灵感工坊</text>
        <text class="section-page"
          >0{{ currentCreation + 1 }}
          <text class="muted">/ 0{{ CREATION_COUNT }}</text> ⇄</text
        >
      </view>
      <swiper
        class="creation-swiper"
        :current="currentCreation"
        @change="handleCreationChange"
      >
        <swiper-item>
          <view class="creation-card creation-card-main" @click="openWorkbench">
            <view class="card-topline">
              <text class="card-badge">01 · 文字生图</text>
              <text class="card-type">写意画境</text>
            </view>
            <text class="creation-title"
              >千字绘图，万象由心 · 意境回流东方神韵</text
            >
            <view class="chips">
              <text>宋式水墨</text>
              <text>留白神韵</text>
              <text>青绿工笔</text>
            </view>
            <view class="card-bottom">
              <text> 多尺度画幅支持</text>
              <text class="enter-link">灵感浮动 </text>
            </view>
          </view>
        </swiper-item>
        <swiper-item>
          <view
            class="creation-card creation-card-side"
            @click="openVideoCreation"
          >
            <view class="card-topline">
              <text class="card-badge">02 · 视频创作</text>
            </view>
            <text class="creation-title">光影入笔，流动成诗</text>
            <view class="chips">
              <text>远景镜头</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
      <view class="pagination-dots">
        <text
          v-for="index in CREATION_COUNT"
          :key="index"
          :class="{ 'active-dot': index - 1 === currentCreation }"
          @click="selectCreation(index - 1)"
        ></text>
      </view>
      <view class="quote">造法自然 · 意致千里</view>
    </scroll-view>

    <app-bottom-nav active="drafts" />
  </view>
</template>

<script setup>
import { ref } from "vue";

import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";

const CREATION_COUNT = 2;
const currentCreation = ref(0);

// 开始同款创作并给出轻量反馈。
const handleTryCreation = () => {
  uni.navigateTo({ url: "/pages/image-creation/index" });
};

// 进入独立创作台页面。
const openWorkbench = () => {
  uni.navigateTo({ url: "/pages/workbench/index" });
};

// 打开视频创作的公共待开发页面。
const openVideoCreation = () => {
  uni.navigateTo({ url: "/pages/under-development/index?title=视频创作" });
};

/**
 * 记录灵感工坊当前切换到的卡片索引。
 *
 * @param {object} event swiper 切换事件
 * @param {object} event.detail 切换详情
 * @param {number} event.detail.current 切换后的卡片索引
 * @returns {void}
 */
const handleCreationChange = (event) => {
  currentCreation.value = event.detail.current;
};

/**
 * 切换到指定索引的灵感工坊卡片。
 *
 * @param {number} index 目标卡片索引
 * @returns {void}
 */
const selectCreation = (index) => {
  currentCreation.value = index;
};
</script>

<style scoped>
page {
  height: 100%;
  overflow: hidden;
}

.home-page {
  height: 100vh;
  overflow: hidden;
  background: #f6fafb;
  color: #17343b;
}

.main-scroll {
  height: calc(100vh - 210rpx);
  overflow: hidden;
  padding: 34rpx 36rpx 0;
  box-sizing: border-box;
}

.greeting-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.greeting-left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.greeting-title {
  color: #148d86;
  display: inline-block;
  font-size: 28rpx;
  font-weight: 600;
  animation: title-pulse 5s ease-in-out infinite;
}

@keyframes title-pulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.greeting-marquee {
  overflow: hidden;
  width: 320rpx;
  margin-left: 16rpx;
}

.marquee-track {
  font-size: 16rpx;
  display: inline-flex;
  white-space: nowrap;
  animation: marquee-scroll 8s linear infinite;
}

/* .marquee-item {
  padding-right: 60rpx;
  color: #566b70;
  font-size: 24rpx;
} */

@keyframes marquee-scroll {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

.weather {
  font-size: 23rpx;
  color: #273941;
}

.hero-card {
  overflow: hidden;
  border: 1rpx solid #dbe8e8;
  border-radius: 26rpx;
  background: white;
  box-shadow: 0 10rpx 25rpx rgba(37, 82, 83, 0.06);
}

.hero-art {
  height: 300rpx;
  position: relative;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-art:after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.28),
    transparent 45%,
    rgba(20, 37, 44, 0.72)
  );
}

.hero-label,
.hero-caption,
.hero-hint {
  position: absolute;
  z-index: 1;
  left: 28rpx;
  color: white;
}

.hero-label {
  top: 26rpx;
  padding: 10rpx 18rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.84);
  color: #687d7d;
  font-size: 22rpx;
}

.hero-caption {
  bottom: 76rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.hero-hint {
  bottom: 28rpx;
  font-size: 22rpx;
  opacity: 0.86;
}

.hero-footer {
  padding: 22rpx 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-meta,
.card-topline,
.card-bottom {
  display: flex;
  align-items: center;
}

.meta-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 14rpx;
  border-radius: 50%;
  background: #e8faf7;
  color: #159b92;
  text-align: center;
  line-height: 48rpx;
}

.meta-title,
.meta-subtitle {
  display: block;
}

.meta-title {
  font-size: 25rpx;
  font-weight: 700;
}

.meta-subtitle {
  margin-top: 5rpx;
  color: #a0b4b5;
  font-size: 19rpx;
}

.try-button {
  margin: 0;
  padding: 0 22rpx;
  height: 56rpx;
  border-radius: 30rpx;
  background: #118d83;
  color: white;
  font-size: 22rpx;
}

.try-button:after {
  border: 0;
}

.section-heading {
  display: flex;
  align-items: center;
  margin: 38rpx 4rpx 22rpx;
  font-size: 27rpx;
  font-weight: 700;
}

.section-tag {
  margin-left: 14rpx;
  padding: 6rpx 12rpx;
  border-radius: 20rpx;
  color: #168f87;
  background: #e9faf6;
  font-size: 20rpx;
}

.section-page {
  margin-left: auto;
  color: #148f87;
  font-size: 20rpx;
}

.muted {
  color: #afc5c5;
}

.creation-swiper {
  height: 300rpx;
}

.creation-card {
  display: flex;
  flex-direction: column;
  height: 300rpx;
  padding: 22rpx;
  box-sizing: border-box;
  border-radius: 28rpx;
}

.creation-card-main {
  width: calc(100vw - 100rpx);
  border: 1rpx solid #ccefe9;
  background: linear-gradient(135deg, #fff, #eafbf8);
}

.creation-card-side {
  width: calc(100vw - 100rpx);
  border: 1rpx solid #e0edf2;
  background: #fff;
}

.card-badge {
  padding: 7rpx 13rpx;
  border-radius: 20rpx;
  color: white;
  background: #128e84;
  font-size: 19rpx;
}

.card-type {
  margin-left: 12rpx;
  color: #169a91;
  font-size: 20rpx;
}

.creation-title {
  color: #617a7e;
  margin-top: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
}

/* .creation-desc {
  margin-top: 9rpx;
  
  font-size: 21rpx;
} */

.chips {
  display: flex;
  margin-top: 20rpx;
  gap: 10rpx;
}

.chips text {
  padding: 7rpx 12rpx;
  border-radius: 8rpx;
  background: #d8f7f2;
  color: #148e86;
  font-size: 18rpx;
}

.card-bottom {
  margin-top: auto;
  justify-content: space-between;
  color: #91aaac;
  font-size: 19rpx;
}

.enter-link {
  color: #157e77;
}

.pagination-dots {
  text-align: center;
  padding: 28rpx 0;
}

.pagination-dots text {
  display: inline-block;
  width: 10rpx;
  height: 10rpx;
  margin: 0 5rpx;
  border-radius: 50%;
  background: #c8dce0;
}

.pagination-dots .active-dot {
  width: 40rpx;
  border-radius: 8rpx;
  background: #138d84;
}

.quote {
  padding-bottom: 25rpx;
  text-align: center;
  color: #a0b2b5;
  font-size: 20rpx;
}
</style>
