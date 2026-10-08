<template>
  <view class="creation-page">
    <view class="top-bar">
      <view class="back" @click="goBack">‹</view>
      <text class="brand">落笔生花</text>
      <view class="top-right"
        ><text>✦ 28 灵感点</text><text class="avatar">♙</text></view
      ></view
    >
    <view class="step-bar"
      ><view class="step active">● 构思意境</view><view class="step">— 甄选画风</view
      ><view class="step">— 规划成画</view></view
    >
    <scroll-view scroll-y class="content">
      <view class="section-kicker">✎ 阶段一 · 意象炼境</view>
      <text class="page-title">落墨构想</text>
      <text class="page-desc">理顺脑海意象，赋予笔墨生命</text>

      <view class="prompt-card"
        ><view class="prompt-label"
          >✎ 画面主旨意象 <text>{{ prompt.length }} / 500字</text></view
        ><textarea
          v-model="prompt"
          maxlength="500"
          class="prompt-input"
          placeholder="写下你想描绘的意境"
        /><view class="prompt-actions"
          ><button @click="polishPrompt">✣ 灵感润色</button
          ><button @click="randomPrompt">✣ 随机意象</button
          ><text @click="clearPrompt">▣ 清空</text></view
        ></view
      >

      <view class="suggestion-head"
        ><text>✥ 灵感引导（轻触即享）</text
        ><text @click="clearPrompt">点击可组合</text></view
      >
      <view class="suggestions"
        ><button
          v-for="suggestion in suggestions"
          :key="suggestion"
          @click="appendPrompt(suggestion)"
        >
          ＋ {{ suggestion }}
        </button></view
      >
    </scroll-view>
    <view class="next-card"
      ><button @click="goNext">下一步：挑选画风 <text>→</text></button></view
    >
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";

import { getImageCreationOptions } from "@/apis/creation";

const prompt = ref("");
const suggestions = ref([]);
const polishSuffix = ref("");
const randomPromptText = ref("");

onMounted(async () => {
  const response = await getImageCreationOptions();
  if (response.code === 0) {
    suggestions.value = response.data.suggestions;
    polishSuffix.value = response.data.polishSuffix;
    randomPromptText.value = response.data.randomPrompt;
  }
});

const appendPrompt = (value) => {
  prompt.value = prompt.value ? `${prompt.value}，${value}` : value;
};

const clearPrompt = () => {
  prompt.value = "";
};

const polishPrompt = () => {
  prompt.value = prompt.value
    ? `${prompt.value}，${polishSuffix.value}`
    : `江南烟雨中的远山与归舟，${polishSuffix.value}`;
};

const randomPrompt = () => {
  prompt.value = randomPromptText.value;
};

const goBack = () => {
  uni.navigateBack();
};

const goNext = () => {
  uni.navigateTo({ url: "/pages/image-style/index" });
};
</script>

<style scoped>
page {
  height: 100%;
  overflow: hidden;
}
.creation-page {
  height: 100vh;
  overflow: hidden;
  background: #f7fafb;
  color: #16363e;
}
.top-bar {
  height: 88rpx;
  padding: 0 28rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #e7eeee;
  background: #fff;
}
.back {
  width: 46rpx;
  color: #17343b;
  font-size: 46rpx;
  line-height: 40rpx;
}
.brand {
  margin-left: 8rpx;
  font-size: 24rpx;
  font-weight: 700;
}
.top-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-left: auto;
  color: #6e858b;
  font-size: 20rpx;
}
.avatar {
  width: 42rpx;
  height: 42rpx;
  border: 1rpx solid #d9e6e8;
  border-radius: 50%;
  text-align: center;
  line-height: 42rpx;
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
  padding: 13rpx 10rpx;
  border-radius: 15rpx;
  color: #9aabb0;
  text-align: center;
  font-size: 20rpx;
  white-space: nowrap;
}
.step.active {
  color: #087e76;
  background: #e8f8f6;
  font-weight: 700;
}
.content {
  height: calc(100vh - 270rpx);
  padding: 36rpx 32rpx 160rpx;
  box-sizing: border-box;
}
.section-kicker {
  color: #168c83;
  font-size: 21rpx;
}
.page-title {
  display: block;
  margin-top: 14rpx;
  font: 700 34rpx serif;
}
.page-desc {
  display: block;
  margin-top: 8rpx;
  color: #748a90;
  font-size: 21rpx;
}
.prompt-card {
  height: 400rpx;
  margin-top: 28rpx;
  padding: 24rpx;
  box-sizing: border-box;
  border: 1rpx solid #e1e9ea;
  border-radius: 26rpx;
  background: #fff;
  box-shadow: 0 8rpx 22rpx rgba(42, 92, 94, 0.04);
}
.prompt-label {
  color: #4d6c72;
  font-size: 20rpx;
}
.prompt-label text {
  float: right;
  color: #758b91;
}
.prompt-input {
  width: 100%;
  height: 260rpx;
  margin-top: 18rpx;
  font-size: 24rpx;
}
.prompt-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.prompt-actions button,
.suggestions button {
  margin: 0;
  padding: 0 18rpx;
  height: 54rpx;
  border: 1rpx solid #dce7ea;
  border-radius: 14rpx;
  background: #fff;
  color: #25464d;
  font-size: 20rpx;
}
.prompt-actions button:after,
.suggestions button:after {
  border: 0;
}
.prompt-actions button:first-child {
  color: #188d84;
}
.prompt-actions text {
  margin-left: auto;
  color: #7d9196;
  font-size: 19rpx;
}
.suggestion-head {
  display: flex;
  justify-content: space-between;
  margin-top: 28rpx;
  color: #168c83;
  font-size: 20rpx;
}
.suggestion-head text:last-child {
  color: #8fa1a6;
  font-size: 18rpx;
}
.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}
.suggestions button {
  color: #45666c;
}
.next-card {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 18rpx 32rpx 28rpx;
  border-top: 1rpx solid #e7eeee;
  background: rgba(255, 255, 255, 0.96);
}
.next-card button {
  width: 100%;
  height: 76rpx;
  border: 0;
  border-radius: 22rpx;
  background: #007d73;
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
}
.next-card button:after {
  border: 0;
}
.next-card text {
  margin-left: 8rpx;
  font-size: 32rpx;
}
</style>
