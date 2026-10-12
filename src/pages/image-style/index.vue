<template>
  <view class="style-page">
    <app-page-header title="挑选画风" />
    <view class="step-bar">
      <view class="step done">一构思</view>
      <view class="step active">二甄选画风</view>
      <view class="step">三规划成画</view>
    </view>
    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <text class="step-count">步骤 2 / 3</text>
      <text class="page-title">第二步：甄选且现风格</text>
      <text class="page-desc">择取最合心意的笔触与气韵，使意境自然成章。</text>

      <view class="style-grid">
        <view
          v-for="style in styles"
          :key="style.name"
          class="style-card"
          :class="{ selected: selectedStyle === style.name }"
          @click="selectStyle(style.name)"
        >
          <view class="style-image" :class="style.class_name">
            <text v-if="style.name === '宋式水墨'">山水</text>
            <text v-else-if="style.name === '真实摄影'">茶与纸</text>
            <text v-else-if="style.name === '宋瓷青釉'">青釉</text>
            <text v-else>册页</text>
          </view>
          <view class="style-name">
            {{ style.name }}
            <app-icon
              v-if="selectedStyle === style.name"
              class="selected-mark"
              name="check"
            />
          </view>
          <text class="style-desc">{{ style.description }}</text>
          <text v-if="selectedStyle === style.name" class="current">当前</text>
        </view>
      </view>

      <view class="detail-card">
        <view class="detail-title">风格特征细调 <text>针对当前画风</text></view>
        <view class="select-row">
          <text>墨色浓淡</text>
          <text>选中</text>
        </view>
        <view class="select-row">
          <text>留白意趣</text>
          <text>三成留白</text>
        </view>
      </view>
    </scroll-view>
    <view class="bottom-actions">
      <button class="previous" @click="goBack">上一步</button>
      <button class="next" @click="goNext">下一步：设定画幅比例</button>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { getImageStyles } from "@/apis/textToImage";
import AppIcon from "@/components/AppIcon/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";

const selectedStyle = ref("");
const styles = ref([]);

/**
 * 记录当前选中的画风。
 * @param {string} name 画风名称。
 * @returns {void}
 */
const selectStyle = (name) => {
  selectedStyle.value = name;
};

// 返回上一页重新构思
const goBack = () => {
  uni.navigateBack();
};

// 校验并保存画风草稿，进入画幅设定页
const goNext = () => {
  if (!selectedStyle.value) {
    uni.showToast({ title: "请先选择一种画风", icon: "none" });
    return;
  }

  const draft = uni.getStorageSync("imageCreationDraft") || {};
  uni.setStorageSync("imageCreationDraft", { ...draft, style: selectedStyle.value });
  uni.navigateTo({ url: "/pages/image-canvas/index" });
};

onMounted(async () => {
  const response = await getImageStyles();
  if (response.code === 0) {
    selectedStyle.value = response.data.default_style;
    styles.value = response.data.lists;
  }
});

onShow(() => {
  const draft = uni.getStorageSync("imageCreationDraft");

  if (!draft?.prompt) {
    uni.showToast({ title: "请先完成构思意境", icon: "none" });
    uni.redirectTo({ url: "/pages/image-creation/index" });
  }
});
</script>

<style scoped>
page {
  height: 100%;
  overflow: hidden;
}

.style-page {
  height: 100vh;
  overflow: hidden;
  background: #f7fafb;
  color: #16363e;
}

.step-bar {
  height: 72rpx;
  margin: 12rpx 24rpx 0;
  padding: 8rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid #dce9eb;
  border-radius: 20rpx;
  background: #fff;
}

.step {
  flex: 1;
  padding: 13rpx 5rpx;
  border-radius: 15rpx;
  color: #b3bfc2;
  text-align: center;
  font-size: 19rpx;
  white-space: nowrap;
}

.step.done {
  color: #087e76;
}

.step.active {
  color: #087e76;
  background: #e8f8f6;
  font-weight: 700;
}

.content {
  height: calc(100vh - 270rpx);
  padding: 34rpx 32rpx 160rpx;
  box-sizing: border-box;
}

.step-count {
  display: block;
  color: #759096;
  font-size: 19rpx;
}

.page-title {
  display: block;
  margin-top: 10rpx;
  font: 700 34rpx serif;
}

.page-desc {
  display: block;
  margin-top: 8rpx;
  color: #748a90;
  font-size: 20rpx;
}

.style-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18rpx;
  margin-top: 28rpx;
}

.style-card {
  position: relative;
  padding: 12rpx;
  border: 1rpx solid #dce5e7;
  border-radius: 22rpx;
  background: #fff;
}

.style-card.selected {
  border: 2rpx solid #099d91;
}

.style-image {
  height: 165rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 16rpx;
  color: rgba(55, 70, 68, 0.55);
  font: 700 28rpx serif;
}

.ink-style {
  background: linear-gradient(155deg, #eeeae0, #b4c4c0);
}

.photo-style {
  background: linear-gradient(145deg, #d6dec6, #bca98c);
  color: rgba(85, 70, 50, 0.65);
}

.ceramic-style {
  background: linear-gradient(145deg, #c2d6ce, #7f9e98);
  color: rgba(255, 255, 255, 0.75);
}

.illustration-style {
  background: linear-gradient(145deg, #f1e5c7, #d5ba8f);
  color: rgba(121, 90, 56, 0.65);
}

.style-name {
  margin-top: 12rpx;
  font-size: 23rpx;
  font-weight: 700;
}

.selected-mark {
  float: right;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #099d91;
  color: #fff;
  text-align: center;
  line-height: 32rpx;
}

.style-desc {
  display: block;
  margin-top: 6rpx;
  color: #72868b;
  font-size: 17rpx;
  line-height: 1.4;
}

.current {
  position: absolute;
  right: 14rpx;
  bottom: 78rpx;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  background: #e6faf7;
  color: #118f87;
  font-size: 16rpx;
}

.detail-card {
  margin-top: 22rpx;
  padding: 20rpx;
  border: 1rpx solid #dce7ea;
  border-radius: 22rpx;
  background: #fff;
}

.detail-title {
  padding-bottom: 16rpx;
  color: #2b555d;
  font-size: 21rpx;
  font-weight: 700;
}

.detail-title text {
  float: right;
  color: #99aaae;
  font-size: 17rpx;
  font-weight: 400;
}

.select-row {
  display: flex;
  justify-content: space-between;
  margin-top: 12rpx;
  padding: 20rpx 16rpx;
  border-radius: 14rpx;
  background: #f8fafb;
  color: #4e6e74;
  font-size: 19rpx;
}

.select-row text:last-child {
  padding: 5rpx 12rpx;
  border: 1rpx solid #e1e9eb;
  border-radius: 10rpx;
  background: #fff;
  color: #637a80;
}

.bottom-actions {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  gap: 14rpx;
  padding: 18rpx 32rpx 28rpx;
  border-top: 1rpx solid #e7eeee;
  background: #fff;
}

.bottom-actions button {
  height: 70rpx;
  border-radius: 18rpx;
  font-size: 21rpx;
}

.bottom-actions button:after {
  border: 0;
}

.previous {
  width: 100rpx;
  border: 1rpx solid #e2e9eb;
  background: #fff;
  color: #7a8e93;
}

.next {
  flex: 1;
  border: 0;
  background: #007d73;
  color: #fff;
  font-weight: 700;
}
</style>
