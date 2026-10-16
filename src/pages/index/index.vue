<template>
  <view class="home-page">
    <app-page-header title="妙笔生花" />

    <scroll-view scroll-y :show-scrollbar="false" class="main-scroll">
      <!-- 欢迎语 -->
      <view class="greeting-row">
        <view class="greeting-left">
          <text class="greeting-title">东方意象美学</text>
          <view class="greeting-marquee">
            <view class="marquee-track"> 以笔为引，以意生花 · 极简智能多模态创作 </view>
          </view>
        </view>
        <text class="weather">今日谷雨</text>
      </view>
      <!-- 推荐创作 -->
      <view class="hero-card">
        <view class="hero-art">
          <image class="hero-image" src="/static/home/home-1.png" mode="aspectFill" />
          <view class="hero-label">今日推荐 · 烟岚登翠</view>
          <view class="hero-caption">青绿水墨江南</view>
          <view class="hero-hint">
            提示词：水墨淋漓，宋式青绿设色，微风拂动湖面 ...
          </view>
        </view>
        <view class="hero-footer">
          <view class="hero-meta">
            <text class="meta-title">国产大模型</text>
            <text class="meta-subtitle">已生成 1,280 次</text>
          </view>
          <button class="try-button" @click="handleTryCreation">同款创作</button>
        </view>
      </view>

      <!-- 灵感工坊，展示推荐的创作模式 -->
      <view class="section-heading">
        <text class="section-title">灵感工坊</text>
        <text class="section-page">
          {{ currentCreation + 1 }}
          <text class="muted">/ {{ CREATION_COUNT }}</text>
        </text>
      </view>
      <!-- 创作模式卡片 -->
      <view
        class="carousel-stage"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <view class="carousel-container">
          <view
            v-for="(creation, index) in creations"
            :key="creation.title"
            class="creation-card"
            :class="[getCardPosition(index), `creation-card-${index + 1}`]"
            @click="openCreation(creation.url)"
          >
            <view>
              <text class="card-label">{{ creation.eyebrow }}</text>
              <text class="creation-title">{{ creation.title }}</text>
              <view class="mock-input">
                <text class="input-prefix">{{ creation.inputLabel }}</text>
                <text class="input-value">{{ creation.inputValue }}</text>
                <text class="input-icon">{{ creation.icon }}</text>
              </view>
            </view>

            <!-- 创作模式卡片底部 -->
            <view class="card-bottom">
              <text class="footer-note">{{ creation.note }}</text>
              <view class="action-button">
                <text>{{ creation.action }}</text>
                <!-- <text class="action-arrow">›</text> -->
              </view>
            </view>
          </view>
        </view>
      </view>
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

const creations = [
  {
    // eyebrow: "IMAGE INK",
    title: "文字生图",
    inputLabel: "意境：",
    inputValue: "宋式青绿水墨...",
    icon: "✦",
    note: "字句勾勒意境",
    action: "去探索",
    url: "/pages/image-creation/index",
  },
  {
    // eyebrow: "MOTION INK",
    title: "生成视频",
    inputLabel: "镜头：",
    inputValue: "微风荡起波澜...",
    icon: "▣",
    note: "融汇静止为流动",
    action: "去创作",
    url: "/pages/under-development/index?title=视频创作",
  },
  {
    // eyebrow: "IMAGE REFINE",
    title: "图片优化",
    inputLabel: "优化：",
    inputValue: "超高清晰画质",
    icon: "✨",
    note: "一键唤醒纤毫纹理",
    action: "还原",
    url: "/pages/image-optimization/index",
  },
];
const CREATION_COUNT = creations.length;
const currentCreation = ref(0);
const touchStartX = ref(0);

// 开始同款创作并给出轻量反馈。
const handleTryCreation = () => {
  uni.navigateTo({ url: "/pages/image-creation/index" });
};

/**
 * 打开灵感工坊卡片对应的创作页面。
 *
 * @param {string} url 创作页面地址
 * @returns {void}
 */
const openCreation = (url) => {
  uni.navigateTo({ url });
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

/**
 * 获取卡片在轮播舞台中的位置类名。
 *
 * @param {number} index 卡片索引
 * @returns {string} 卡片位置类名
 */
const getCardPosition = (index) => {
  if (index === currentCreation.value) {
    return "active";
  }

  return index === (currentCreation.value + 1) % CREATION_COUNT ? "right" : "left";
};

/**
 * 记录滑动开始时的横向坐标。
 *
 * @param {object} event 触摸开始事件
 * @returns {void}
 */
const handleTouchStart = (event) => {
  touchStartX.value = event.changedTouches[0].clientX;
};

/**
 * 根据横向滑动距离切换灵感工坊卡片。
 *
 * @param {object} event 触摸结束事件
 * @returns {void}
 */
const handleTouchEnd = (event) => {
  const distance = event.changedTouches[0].clientX - touchStartX.value;

  if (distance > 50) {
    selectCreation((currentCreation.value - 1 + CREATION_COUNT) % CREATION_COUNT);
  }

  if (distance < -50) {
    selectCreation((currentCreation.value + 1) % CREATION_COUNT);
  }
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
  background: #f8f8f4;
  color: #2d3532;
}

.main-scroll {
  height: calc(100vh - 210rpx);
  overflow: hidden;
  padding: 14rpx 36rpx 0;
  box-sizing: border-box;
}

.greeting-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.greeting-left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.greeting-title {
  color: #5f8575;
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
  color: #75827e;
}

.hero-card {
  padding: 30rpx 30rpx;
  overflow: hidden;
  border: 1rpx solid #dbe8e8;
  border-color: rgba(0, 0, 0, 0.02);
  border-radius: 34rpx;
  background: white;
  box-shadow: 0 16rpx 48rpx rgba(95, 133, 117, 0.08);
}

.hero-art {
  /* padding: 20rpx; */
  height: 280rpx;
  position: relative;
  overflow: hidden;
  border-radius: 80rpx 30rpx 100rpx 30rpx;
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
    rgba(45, 53, 50, 0.58)
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
  top: 18rpx;
  padding: 10rpx 18rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.84);
  color: #5f8575;
  font-size: 22rpx;
}

.hero-caption {
  bottom: 58rpx;
  font-size: 25rpx;
  font-weight: 700;
}

.hero-hint {
  bottom: 20rpx;
  font-size: 19rpx;
  opacity: 0.86;
}

.hero-footer {
  /* padding: 16rpx 24rpx 18rpx; */
  /* background: red; */
  padding-top: 30rpx;
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
  color: #2d3532;
  font-size: 30rpx;
  font-weight: 700;
}

.meta-subtitle {
  margin-left: 10rpx;
  color: #75827e;
  font-size: 5rpx;
}

.try-button {
  margin: 0;
  padding: 0 22rpx;
  height: 56rpx;
  border-radius: 30rpx;
  background: #5f8575;
  color: white;
  font-size: 22rpx;
}

.try-button:after {
  border: 0;
}

.section-heading {
  display: flex;
  align-items: center;
  margin: 20rpx 4rpx 4rpx;
  color: #5f8575;
  font-size: 28rpx;
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
  color: #5f8575;
  font-size: 20rpx;
}

.muted {
  color: #afc5c5;
}

.carousel-stage {
  position: relative;
  margin: 30rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
}

.carousel-container {
  position: relative;
  width: 480rpx;
  height: 400rpx;
  transform-style: preserve-3d;
}

.creation-card {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 30rpx;
  box-sizing: border-box;
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 48rpx;
  transition: transform 0.6s ease, opacity 0.6s ease, filter 0.6s ease;
  pointer-events: none;
}

.creation-card-1 {
  background: linear-gradient(135deg, #ffffff 30%, #e8f1ec 100%);
}

.creation-card-2 {
  background: linear-gradient(135deg, #ffffff 30%, #faf0e4 100%);
}

.creation-card-3 {
  background: linear-gradient(135deg, #ffffff 30%, #ece8f1 100%);
}

.creation-card.active {
  z-index: 3;
  transform: translate3d(0, 0, 0) scale(1);
  opacity: 1;
  filter: blur(0);
  pointer-events: auto;
  box-shadow: 0 28rpx 60rpx rgba(95, 133, 117, 0.15);
}

.creation-card.left {
  z-index: 1;
  transform: translate3d(-150rpx, 0, -120rpx) scale(0.85) rotateY(40deg);
  opacity: 0.55;
  filter: blur(1rpx);
}

.creation-card.right {
  z-index: 1;
  transform: translate3d(150rpx, 0, -120rpx) scale(0.85) rotateY(-40deg);
  opacity: 0.55;
  filter: blur(1rpx);
}

.creation-title {
  display: block;
  margin-top: 8rpx;
  color: #202022;
  font-size: 28rpx;
  font-weight: 700;
}

.card-label {
  display: block;
  color: rgba(32, 32, 34, 0.38);
  font-size: 18rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.mock-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 22rpx;
  padding: 18rpx 20rpx;
  border: 1rpx solid rgba(32, 32, 34, 0.06);
  border-top: 1rpx solid rgba(212, 189, 150, 0.3);
  border-bottom: 1rpx solid rgba(212, 189, 150, 0.3);
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  background: #faf9f5;
  box-shadow: none;
  font-size: 20rpx;
}

.input-prefix {
  flex-shrink: 0;
  color: #9b999f;
}

.input-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #2d2b30;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-icon {
  flex-shrink: 0;
  margin-left: 16rpx;
  color: #c84b31;
}

.card-bottom {
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(32, 32, 34, 0.07);
  justify-content: space-between;
  font-size: 19rpx;
}

.footer-note {
  color: #aaa7ae;
}

.action-button {
  display: flex;
  align-items: center;
  border-radius: 999rpx;
  width: 120rpx;
  height: 70rpx;
  justify-content: center;
  background: #117204;
  color: #fff;
  font-size: 16rpx;
  font-weight: 700;
}

.pagination-dots {
  text-align: center;
  padding: 8rpx 0 18rpx;
}

.pagination-dots text {
  display: inline-block;
  width: 10rpx;
  height: 10rpx;
  margin: 0 5rpx;
  border-radius: 50%;
  background: #d1d5d4;
}

.pagination-dots .active-dot {
  width: 40rpx;
  border-radius: 8rpx;
  background: #5f8575;
}

.quote {
  padding-bottom: 25rpx;
  text-align: center;
  color: #75827e;
  font-size: 20rpx;
}
</style>
