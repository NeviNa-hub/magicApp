<template>
  <view class="library-page">
    <view class="top-bar"><view class="logo">〆</view><text class="brand">落笔生花</text><view class="credits">✦ 128 点</view><text class="avatar">♙</text></view>
    <scroll-view scroll-y class="content"><view class="title-row"><text class="page-title">作品库</text><text class="summary">● {{ summary }}</text></view><view class="tabs"><text v-for="tab in tabs" :key="tab.name" :class="{ active: activeTab === tab.name }" @click="activeTab = tab.name">{{ tab.name }}　{{ tab.count }}</text></view><view class="generating"><view class="generating-label">造物<br />中</view><view class="generating-body"><text>《宋式水墨远山图》</text><text class="status">♨ 墨骨勾勒中（68%）</text><view class="progress"><view></view></view></view><text class="remaining">预计还需 10 秒</text><text class="close">×</text></view><view class="section-title">历史画卷 <text>长按可批量导出</text></view><view class="work-grid"><view v-for="work in works" :key="work.title" class="work-card"><view class="art" :class="work.className"><text>逸才意境</text></view><text class="more">•••</text><text class="work-title">{{ work.title }}</text></view></view></scroll-view><view class="bottom-nav"><text class="active">▱<small>文稿库</small></text><text>☷<small>创作台</small></text><text>♧<small>作品库</small></text><text>♧<small>工作坊</small></text></view>
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";

import { getLibraryData } from "@/apis/creation";

const activeTab = ref("全部");
const summary = ref("");
const works = ref([]);
const tabs = [
  { name: "全部", count: 19 },
  { name: "已完成", count: 12 },
  { name: "创作中", count: 4 },
  { name: "草稿", count: 3 },
];

onMounted(async () => {
  const response = await getLibraryData();
  if (response.code === 0) {
    summary.value = response.data.summary;
    works.value = response.data.works;
  }
});
</script>

<style scoped>
.bottom-nav > text:first-child small { display: none; }.bottom-nav > text:first-child:after { content: "作品库"; display: block; margin-top: 8rpx; font-size: 19rpx; }.bottom-nav > text:nth-child(3) small { display: none; }.bottom-nav > text:nth-child(3):after { content: "灵感录"; display: block; margin-top: 8rpx; font-size: 19rpx; }
.generating { min-height: 142rpx; padding: 22rpx 28rpx; border: 1rpx solid #e3edf1; border-radius: 22rpx; background: linear-gradient(112deg, #fff, #f8ffff 62%, #e3faf9); box-shadow: 0 8rpx 20rpx rgba(34, 78, 99, .1); }.generating-label { width: 72rpx; padding: 8rpx 4rpx; border-radius: 6rpx; background: #fff0f0; color: #cb353b; line-height: 1.15; }.generating-body { margin-left: 20rpx; }.generating-body > text:first-child { color: #172e40; font-size: 26rpx; }.generating-body .status { margin-top: 16rpx; color: #168c85; font-size: 21rpx; font-weight: 600; }.progress { height: 12rpx; margin-top: 14rpx; background: #dcebf3; }.progress view { background: linear-gradient(90deg, #087b72, #078f83); box-shadow: 0 0 8rpx rgba(0, 137, 126, .22); }.remaining { align-self: flex-end; margin: 0 6rpx 34rpx 18rpx; color: #71848b; font-size: 20rpx; white-space: nowrap; }.close { top: 18rpx; right: 24rpx; color: #607279; font-size: 38rpx; font-weight: 300; }
page { height: 100%; overflow: hidden; }.library-page { height: 100vh; overflow: hidden; background: #f7f9ff; color: #142b3c; }.top-bar, .bottom-nav { background: #fff; }.top-bar { height: 112rpx; padding: 0 36rpx; display: flex; align-items: center; border-bottom: 1rpx solid #edf0f5; }.logo { width: 62rpx; height: 62rpx; border-radius: 20rpx; background: #d7eef0; color: #158a8b; text-align: center; line-height: 62rpx; font-size: 38rpx; }.brand { margin-left: 16rpx; font: 700 34rpx serif; }.credits { margin-left: auto; padding: 12rpx 18rpx; border-radius: 24rpx; background: #d8faf5; color: #168d85; font-size: 20rpx; }.avatar { width: 58rpx; height: 58rpx; margin-left: 16rpx; border-radius: 50%; background: #007d73; color: #fff; text-align: center; line-height: 58rpx; }.content { height: calc(100vh - 214rpx); padding: 30rpx 36rpx 30rpx; box-sizing: border-box; }.title-row { display: flex; align-items: center; justify-content: space-between; }.page-title { font: 700 44rpx serif; }.summary { padding: 10rpx 16rpx; border-radius: 24rpx; background: #eef5fc; color: #546a73; font-size: 19rpx; }.summary:first-letter { color: #54bdb6; }.tabs { display: flex; gap: 10rpx; margin-top: 24rpx; }.tabs text { padding: 18rpx 24rpx; border-radius: 22rpx; background: #fff; color: #55666e; font-size: 22rpx; box-shadow: 0 3rpx 10rpx rgba(38, 70, 88, .04); }.tabs text.active { background: #007d73; color: #fff; }.generating { position: relative; display: flex; align-items: center; margin-top: 28rpx; padding: 20rpx 22rpx; border-radius: 20rpx; background: #fff; box-shadow: 0 5rpx 14rpx rgba(39, 76, 96, .08); }.generating-label { width: 64rpx; color: #d53136; font-weight: 700; text-align: center; }.generating-body { flex: 1; margin-left: 16rpx; }.generating-body > text { display: block; font-size: 22rpx; font-weight: 700; }.generating-body .status { margin-top: 14rpx; color: #148f87; font-size: 19rpx; }.progress { height: 10rpx; margin-top: 12rpx; border-radius: 8rpx; background: #dcecf1; }.progress view { width: 68%; height: 100%; border-radius: inherit; background: #057e76; }.remaining { margin-left: 20rpx; color: #788b91; font-size: 18rpx; }.close { position: absolute; top: 14rpx; right: 18rpx; color: #8a9a9e; font-size: 32rpx; }.section-title { display: flex; justify-content: space-between; margin: 36rpx 0 18rpx; font: 700 28rpx serif; }.section-title text { color: #75878c; font: 20rpx sans-serif; }.work-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }.work-card { position: relative; overflow: hidden; border-radius: 18rpx; background: #fff; box-shadow: 0 2rpx 8rpx rgba(30, 55, 70, .06); }.art { height: 330rpx; padding: 14rpx; box-sizing: border-box; color: #435e61; font-size: 16rpx; }.river-work { background: linear-gradient(145deg, #e7e5d8 5%, #aebbb2 55%, #657c7b); }.bamboo-work { background: linear-gradient(145deg, #f2eee1 15%, #b1cdbb 55%, #6c947b); }.tea-work { background: linear-gradient(145deg, #8b684c 0 12%, #f0e7d9 13% 68%, #c5a47b); }.mist-work { background: linear-gradient(145deg, #f0eee1, #b3c4be 52%, #576f71); }.more { position: absolute; top: 12rpx; right: 12rpx; width: 46rpx; height: 46rpx; border-radius: 50%; background: rgba(255, 255, 255, .88); color: #425761; text-align: center; line-height: 36rpx; }.work-title { display: block; padding: 18rpx; font: 24rpx serif; }.bottom-nav { position: fixed; right: 0; bottom: 0; left: 0; height: 102rpx; display: flex; justify-content: space-around; border-top: 1rpx solid #e2e8ef; }.bottom-nav > text { padding-top: 16rpx; color: #7b8c96; text-align: center; font-size: 30rpx; }.bottom-nav small { display: block; font-size: 19rpx; }.bottom-nav .active { color: #00877d; }
</style>
