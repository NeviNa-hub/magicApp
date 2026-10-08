<template>
  <view class="canvas-page">
    <view class="top-bar"><view class="back" @click="goBack">‹</view><text class="brand">落笔生花</text><text class="page-tag">文稿详情</text><view class="top-right">✦ 灵感点 800 <text class="avatar">♙</text></view></view>
    <view class="step-bar"><view class="step done">✓ 一构思</view><view class="step done">✓ 二画风</view><view class="step active">❸ 三规划成画</view></view>
    <scroll-view scroll-y class="content">
      <text class="step-count">步骤 3 / 3</text><text class="page-title">第三步：设定画幅并落墨</text><text class="page-desc">厘定比例与画幅张数，即将落笔成卷</text>
      <view class="summary-card"><view class="summary-title">☷ 创作意念回溯 <text @click="editPrompt">修改内容 ›</text></view><view class="summary-row">构想意境　{{ options.prompt }}</view><view class="summary-row">甄选画风　{{ options.style }}</view></view>
      <view class="section-title">画幅比例 <text>影响构图与空间意象</text></view>
      <view class="ratio-grid"><view v-for="ratio in options.ratios" :key="ratio.value" class="ratio-card" :class="{ selected: selectedRatio === ratio.value }" @click="selectedRatio = ratio.value"><view class="ratio-icon">■</view><text class="ratio-name">{{ ratio.name }}</text><text class="ratio-desc">{{ ratio.description }}</text><text v-if="selectedRatio === ratio.value" class="chosen">已选</text></view></view>
      <view class="section-title count-title">生成张数 <text>多图可甄选微调意趣</text></view>
      <view class="count-list"><view v-for="count in options.counts" :key="count.name" class="count-card" :class="{ selected: selectedCount === count.name }" @click="selectedCount = count.name"><text>{{ count.name }}</text><small>消耗 {{ count.cost }} 灵感点</small></view></view>
      <view class="cost-card">◎ 当前剩余灵感点 <b>240</b><text>本次需量扣除 <b>{{ selectedCost }} 点</b></text></view>
    </scroll-view>
    <view class="bottom-actions"><button class="previous" @click="goBack">← 修改画风</button><button class="generate" @click="generate">✎ 研墨成画（扣除 {{ selectedCost }} 点）</button></view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import { getImageCanvasOptions } from "@/apis/creation";

const options = ref({ prompt: "", style: "", ratios: [], counts: [] });
const selectedRatio = ref("1:1");
const selectedCount = ref("双张");

const selectedCost = computed(() => options.value.counts.find((item) => item.name === selectedCount.value)?.cost || 4);

onMounted(async () => {
  const response = await getImageCanvasOptions();
  if (response.code === 0) {
    options.value = response.data;
  }
});

const goBack = () => {
  uni.navigateBack();
};

const editPrompt = () => {
  uni.showToast({ title: "可返回修改内容", icon: "none" });
};

const generate = () => {
  uni.navigateTo({ url: "/pages/image-generation/index" });
};
</script>

<style scoped>
page { height: 100%; overflow: hidden; }.canvas-page { height: 100vh; overflow: hidden; background: #f7fafb; color: #16363e; }.top-bar, .bottom-actions { background: #fff; }.top-bar { height: 88rpx; padding: 0 28rpx; display: flex; align-items: center; border-bottom: 1rpx solid #e7eeee; }.back { width: 46rpx; font-size: 46rpx; }.brand { font-size: 24rpx; font-weight: 700; }.page-tag { margin-left: 12rpx; padding: 5rpx 10rpx; border-radius: 12rpx; background: #f0f5f5; color: #8a9da1; font-size: 17rpx; }.top-right { display: flex; align-items: center; gap: 14rpx; margin-left: auto; color: #6e858b; font-size: 19rpx; }.avatar { width: 42rpx; height: 42rpx; border: 1rpx solid #d9e6e8; border-radius: 50%; text-align: center; line-height: 42rpx; }.step-bar { height: 72rpx; margin: 12rpx 24rpx 0; padding: 8rpx; display: flex; align-items: center; border: 1rpx solid #dce9eb; border-radius: 20rpx; background: #fff; }.step { flex: 1; padding: 13rpx 5rpx; border-radius: 15rpx; color: #b3bfc2; text-align: center; font-size: 19rpx; white-space: nowrap; }.step.done { color: #087e76; }.step.active { color: #087e76; background: #e8f8f6; font-weight: 700; }.content { height: calc(100vh - 270rpx); padding: 34rpx 32rpx 170rpx; box-sizing: border-box; }.step-count { display: block; color: #759096; font-size: 19rpx; }.page-title { display: block; margin-top: 10rpx; font: 700 32rpx serif; }.page-desc { display: block; margin-top: 8rpx; color: #748a90; font-size: 20rpx; }.summary-card { margin-top: 26rpx; padding: 22rpx; border: 1rpx solid #e0e9eb; border-radius: 22rpx; background: #fff; }.summary-title { padding-bottom: 16rpx; color: #2d5960; font-size: 20rpx; font-weight: 700; }.summary-title text { float: right; color: #168c83; font-size: 18rpx; font-weight: 400; }.summary-row { margin-top: 10rpx; padding: 18rpx; border-radius: 14rpx; background: #f7fafb; color: #70878d; font-size: 19rpx; }.section-title { display: flex; justify-content: space-between; margin-top: 26rpx; color: #31545b; font-size: 21rpx; font-weight: 700; }.section-title text { color: #97a8ad; font-size: 17rpx; font-weight: 400; }.ratio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; margin-top: 16rpx; }.ratio-card { position: relative; padding: 22rpx; border: 1rpx solid #dce7ea; border-radius: 22rpx; background: #fff; }.ratio-card.selected { border: 2rpx solid #07998e; }.ratio-icon { width: 38rpx; height: 38rpx; margin-bottom: 16rpx; color: #96a9b6; line-height: 38rpx; }.ratio-card.selected .ratio-icon { color: #07998e; }.ratio-name { display: block; font-size: 22rpx; font-weight: 700; }.ratio-desc { display: block; margin-top: 6rpx; color: #98a8ad; font-size: 17rpx; }.chosen { position: absolute; top: 14rpx; right: 14rpx; padding: 5rpx 9rpx; border-radius: 12rpx; background: #07998e; color: #fff; font-size: 16rpx; }.count-title { margin-top: 26rpx; }.count-list { display: flex; gap: 12rpx; margin-top: 16rpx; }.count-card { flex: 1; padding: 20rpx 10rpx; border: 1rpx solid #dce7ea; border-radius: 20rpx; background: #fff; text-align: center; }.count-card.selected { border: 2rpx solid #07998e; }.count-card text, .count-card small { display: block; }.count-card text { font-size: 23rpx; }.count-card small { margin-top: 8rpx; color: #9caaae; font-size: 16rpx; }.cost-card { margin-top: 22rpx; padding: 24rpx 18rpx; border: 1rpx solid #e0e9eb; border-radius: 22rpx; background: #fff; color: #71858a; font-size: 18rpx; }.cost-card b { color: #168c83; }.cost-card text { float: right; }.bottom-actions { position: fixed; right: 0; bottom: 0; left: 0; display: flex; gap: 14rpx; padding: 18rpx 32rpx 28rpx; border-top: 1rpx solid #e7eeee; }.bottom-actions button { height: 70rpx; border-radius: 18rpx; font-size: 20rpx; }.bottom-actions button:after { border: 0; }.previous { width: 150rpx; border: 1rpx solid #e2e9eb; background: #fff; color: #7a8e93; }.generate { flex: 1; border: 0; background: #07998e; color: #fff; font-weight: 700; }
</style>
