<template>
  <view class="generation-page">
    <view class="top-bar">
      <view class="back" @click="goBack">&lt;</view>
      <view class="top-title"><text>● 墨色化境</text><small>宋画再造进行中</small></view>
      <text class="close" @click="goBack">×</text>
    </view>
    <scroll-view scroll-y class="content">
      <view class="art-card">
        <view class="art-label">▣ 立轴画心 · 析出中</view>
        <text class="art-type">✦ 天工化育</text>
        <view class="progress-ring"><text>{{ status.progress }}<small>%</small></text><label>气韵流转</label></view>
        <view class="mist"></view>
        <view class="art-status">● 第二阶段 · 丹青晕染 <text>68% / 100%</text></view>
        <view class="art-progress"><view :style="{ width: `${status.progress}%` }"></view></view>
      </view>
      <view class="info-card">
        <view class="info-heading"><text>印</text><strong>《宋式水墨远山图》</strong><small>天宝妙染 · 竖屏卷</small></view>
        <view class="chips"><text>⌁ 宋式水墨</text><text>▣ 1:1方画心</text><text>▣ 高清写意</text><text class="cost">ϟ 10 算力</text></view>
        <view class="info-footer">♧ 研墨调色，点染山石梧桐与溪桥花茂... <text>约需 8 秒</text></view>
      </view>
      <view class="cloud-tip">♧ 已投入云端渲染池，离开页面不影响成画卷</view>
    </scroll-view>
    <view class="actions"><button class="library" @click="goLibrary">前往作品库查看进度　→</button><button class="back-workbench" @click="goWorkbench">♧ 返回工作台</button></view>
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";

import { getImageGenerationStatus } from "@/apis/creation";

const status = ref({ progress: 98 });

onMounted(async () => {
  const response = await getImageGenerationStatus();
  if (response.code === 0) {
    status.value = response.data;
  }
});

const goBack = () => {
  uni.navigateBack();
};

const goLibrary = () => {
  uni.navigateTo({ url: "/pages/library/index" });
};

const goWorkbench = () => {
  uni.reLaunch({ url: "/pages/workbench/index" });
};
</script>

<style scoped>
page { height: 100%; overflow: hidden; }
.generation-page { height: 100vh; overflow: hidden; background: #f6f8ff; color: #17343b; }
.top-bar { height: 104rpx; padding: 0 34rpx; display: flex; align-items: center; border-bottom: 1rpx solid #e8edf2; background: #fff; }
.back { width: 60rpx; color: #53646b; font-size: 50rpx; }
.top-title { flex: 1; text-align: center; }
.top-title text, .top-title small { display: block; }
.top-title text { color: #526b70; font-size: 27rpx; font-weight: 700; }
.top-title small { margin-top: 4rpx; color: #a9b6b9; font-size: 16rpx; }
.close { color: #53646b; font-size: 38rpx; }
.content { height: calc(100vh - 310rpx); padding: 44rpx 42rpx 180rpx; box-sizing: border-box; }
.art-card { position: relative; height: 580rpx; overflow: hidden; border: 1rpx solid #e4dccb; border-radius: 48rpx; background: linear-gradient(145deg, #e4f1ee, #f3f0e6 48%, #e0e9e2); box-shadow: 0 12rpx 25rpx rgba(52, 87, 90, .1); }
.art-card:after { content: ""; position: absolute; inset: 42rpx 26rpx 26rpx; border: 4rpx solid rgba(255,255,255,.78); border-radius: 38rpx; pointer-events: none; }
.art-label { position: absolute; z-index: 2; top: 40rpx; left: 48rpx; padding: 11rpx 16rpx; border-radius: 22rpx; background: rgba(255,255,255,.82); color: #617477; font-size: 18rpx; }
.art-type { position: absolute; z-index: 2; top: 48rpx; right: 48rpx; color: #829095; font-size: 18rpx; }
.progress-ring { position: absolute; z-index: 2; top: 205rpx; left: 50%; width: 236rpx; height: 236rpx; transform: translateX(-50%); border: 2rpx dashed #abd9d5; border-radius: 50%; background: rgba(255,255,255,.72); box-shadow: 0 0 0 18rpx rgba(255,255,255,.36), 0 0 0 20rpx rgba(158,211,207,.35); text-align: center; }
.progress-ring text { display: block; margin-top: 64rpx; color: #0d1d31; font: 700 68rpx serif; }
.progress-ring text small { color: #36aaa4; font: 28rpx sans-serif; }
.progress-ring label { display: block; margin-top: 8rpx; color: #557277; font-size: 18rpx; }
.mist { position: absolute; right: -40rpx; bottom: 72rpx; left: -40rpx; height: 150rpx; border-radius: 50% 50% 0 0; background: linear-gradient(165deg, rgba(180,231,226,.75), rgba(64,126,119,.82)); transform: skewY(-5deg); }
.art-status { position: absolute; z-index: 2; right: 44rpx; bottom: 70rpx; left: 44rpx; color: #247a77; font-size: 18rpx; }
.art-status text { float: right; }
.art-progress { position: absolute; z-index: 2; right: 44rpx; bottom: 40rpx; left: 44rpx; height: 10rpx; border-radius: 8rpx; background: rgba(255,255,255,.5); }
.art-progress view { height: 100%; border-radius: inherit; background: #168f88; }
.info-card { margin-top: 28rpx; padding: 24rpx 28rpx; border-radius: 26rpx; background: #fff; box-shadow: 0 6rpx 18rpx rgba(47,75,90,.06); }
.info-heading { display: flex; align-items: center; }
.info-heading > text { width: 36rpx; height: 36rpx; margin-right: 14rpx; background: #d63b32; color: #fff; text-align: center; line-height: 36rpx; font-size: 18rpx; }
.info-heading strong { font: 700 24rpx serif; }
.info-heading small { margin-left: auto; color: #a0abad; font-size: 17rpx; }
.chips { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 24rpx; }
.chips text { padding: 8rpx 14rpx; border: 1rpx solid #e1e8eb; border-radius: 18rpx; color: #60777d; font-size: 17rpx; }
.chips .cost { margin-left: auto; border-color: #86e5dc; color: #138e85; }
.info-footer { margin-top: 24rpx; padding-top: 18rpx; border-top: 1rpx solid #edf0f0; color: #71878c; font-size: 18rpx; }
.info-footer text { float: right; color: #a0afb2; }
.cloud-tip { margin-top: 24rpx; padding: 16rpx; border: 1rpx solid #8be8de; border-radius: 28rpx; color: #178e87; text-align: center; font-size: 18rpx; }
.actions { position: fixed; right: 0; bottom: 0; left: 0; padding: 20rpx 42rpx 28rpx; background: rgba(255,255,255,.96); }
.actions button { width: 100%; height: 78rpx; border: 0; border-radius: 38rpx; font-size: 23rpx; font-weight: 700; }
.actions button:after { border: 0; }
.library { background: #008477; color: #fff; }
.back-workbench { margin-top: 14rpx; background: #fff; color: #63767b; box-shadow: 0 2rpx 12rpx rgba(30,58,70,.06); }
</style>
