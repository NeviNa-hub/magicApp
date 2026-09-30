<template>
  <view class="home-page">
    <view class="top-bar">
      <view class="brand-group"><text class="brand-name">落笔生花</text><text class="brand-tag">智能创作</text></view>
      <view class="top-actions"><view class="credits-pill">✦ 灵感点 <text class="credits-count">八百</text></view><view class="profile-button">●</view></view>
    </view>

    <scroll-view scroll-y class="main-scroll">
      <view class="greeting-row"><view><text class="greeting-label">·东方意象美学</text><text class="greeting-title">落笔生花</text><text class="greeting-subtitle">以笔为引，以意生花 · 极简智能多模态创作</text></view><text class="weather">今日谷雨</text></view>

      <view class="hero-card">
        <view class="hero-art"><view class="mountain mountain-back"></view><view class="mountain mountain-mid"></view><view class="mountain mountain-front"></view><view class="hero-label">✦ 今日推荐 · 烟岚登翠</view><view class="hero-caption">青绿水墨江南 · 云峰藏雾</view><view class="hero-hint">提示词：水墨淋漓，宋式青绿设色，微风拂动湖面，...</view></view>
        <view class="hero-footer"><view class="hero-meta"><view class="meta-icon">♧</view><view><text class="meta-title">国风效果大模型</text><text class="meta-subtitle">已生成 1,280 次</text></view></view><button class="try-button" @click="handleTryCreation">同款创作 <text>→</text></button></view>
      </view>

      <view class="section-heading"><text>核心创想矩阵</text><text class="section-tag">灵感工坊</text><text class="section-page">01 <text class="muted">/ 03</text> ⇄</text></view>
      <scroll-view scroll-x class="creation-scroll" :show-scrollbar="false"><view class="creation-card creation-card-main" @click="openWorkbench"><view class="card-topline"><text class="card-badge">墨韵境 · 01</text><text class="card-type">全自动引擎</text></view><text class="creation-title">文字生图 · 写意画境</text><text class="creation-desc">千字绘图，万象由心 · 意境回流东方神韵</text><view class="chips"><text>宋式水墨</text><text>留白神韵</text><text>青绿工笔</text></view><view class="card-bottom"><text>● 多尺度画幅支持</text><text class="enter-link">灵感浮动 →</text></view></view><view class="creation-card creation-card-side" @click="openWorkbench"><view class="card-topline"><text class="card-badge">天青馆 · 02</text></view><text class="creation-title">视频创作</text><text class="creation-desc">光影入笔，流动成诗</text><view class="chips"><text>远景镜头</text></view></view></scroll-view>
      <view class="pagination-dots"><text class="active-dot"></text><text></text><text></text></view><view class="quote">造法自然 · 意致千里</view>
    </scroll-view>

    <view class="bottom-nav"><view class="nav-item"><text class="nav-icon">▤</text><text>文稿库</text></view><view class="nav-item is-active" @click="handleCreationClick"><text class="nav-icon">☷</text><text>创作台</text></view><view class="nav-item"><text class="nav-icon">♧</text><text>灵感录</text></view><view class="nav-item"><text class="nav-icon">☷</text><text>工作坊</text></view></view>
  </view>
</template>

<script setup>
import { ref } from "vue";

const hasStarted = ref(false);

// 开始同款创作并给出轻量反馈。
const handleTryCreation = () => {
  hasStarted.value = true;
  uni.showToast({ title: "已开启同款创作", icon: "none" });
};

// 进入创作台。
const handleCreationClick = () => {
  openWorkbench();
};

// 进入独立创作台页面。
const openWorkbench = () => {
  uni.navigateTo({ url: "/pages/workbench/index" });
};
</script>

<style scoped>
page { height: 100%; overflow: hidden; }.home-page { height: 100vh; overflow: hidden; background: #f6fafb; color: #17343b; }.top-bar, .bottom-nav { background: rgba(255, 255, 255, .96); }.top-bar { height: 108rpx; padding: 0 36rpx; display: flex; align-items: center; justify-content: space-between; border-bottom: 1rpx solid #edf3f3; }.brand-group, .top-actions, .hero-meta, .card-topline, .card-bottom { display: flex; align-items: center; }.brand-name { font-size: 34rpx; font-weight: 700; letter-spacing: 2rpx; }.brand-tag, .section-tag { margin-left: 14rpx; padding: 6rpx 12rpx; border-radius: 20rpx; color: #168f87; background: #e9faf6; font-size: 20rpx; }.credits-pill { padding: 14rpx 18rpx; border: 1rpx solid #e4efef; border-radius: 32rpx; color: #789094; font-size: 22rpx; }.credits-count { color: #168f87; margin-left: 6rpx; }.profile-button { width: 52rpx; height: 52rpx; margin-left: 14rpx; border-radius: 50%; background: #24343e; color: white; text-align: center; line-height: 52rpx; font-size: 20rpx; }.main-scroll { height: calc(100vh - 210rpx); overflow: hidden; padding: 34rpx 36rpx 0; box-sizing: border-box; }.greeting-row { display: flex; justify-content: space-between; margin-bottom: 28rpx; }.greeting-label { display: block; color: #148d86; font-size: 25rpx; font-weight: 600; }.greeting-title { display: block; margin-top: 14rpx; font-size: 28rpx; font-weight: 700; }.greeting-subtitle { display: block; margin-top: 8rpx; color: #566b70; font-size: 24rpx; }.weather { font-size: 23rpx; color: #273941; }.hero-card { overflow: hidden; border: 1rpx solid #dbe8e8; border-radius: 26rpx; background: white; box-shadow: 0 10rpx 25rpx rgba(37, 82, 83, .06); }.hero-art { height: 350rpx; position: relative; overflow: hidden; background: linear-gradient(160deg, #d5e5e1, #9fbdb6 45%, #486c6e); }.hero-art:after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,.28), transparent 45%, rgba(20,37,44,.72)); }.mountain { position: absolute; bottom: 0; border-radius: 50% 50% 0 0; transform: rotate(45deg); opacity: .7; }.mountain-back { width: 360rpx; height: 260rpx; left: 8%; background: #b4cdca; }.mountain-mid { width: 400rpx; height: 320rpx; left: 34%; background: #8badab; }.mountain-front { width: 500rpx; height: 230rpx; left: 12%; background: #527978; opacity: .9; }.hero-label, .hero-caption, .hero-hint { position: absolute; z-index: 1; left: 28rpx; color: white; }.hero-label { top: 26rpx; padding: 10rpx 18rpx; border-radius: 30rpx; background: rgba(255,255,255,.84); color: #687d7d; font-size: 22rpx; }.hero-caption { bottom: 76rpx; font-size: 28rpx; font-weight: 700; }.hero-hint { bottom: 28rpx; font-size: 22rpx; opacity: .86; }.hero-footer { padding: 22rpx 28rpx; display: flex; align-items: center; justify-content: space-between; }.meta-icon { width: 48rpx; height: 48rpx; margin-right: 14rpx; border-radius: 50%; background: #e8faf7; color: #159b92; text-align: center; line-height: 48rpx; }.meta-title, .meta-subtitle { display: block; }.meta-title { font-size: 25rpx; font-weight: 700; }.meta-subtitle { margin-top: 5rpx; color: #a0b4b5; font-size: 19rpx; }.try-button { margin: 0; padding: 0 22rpx; height: 56rpx; border-radius: 30rpx; background: #118d83; color: white; font-size: 22rpx; }.try-button:after { border: 0; }.section-heading { display: flex; align-items: center; margin: 38rpx 4rpx 22rpx; font-size: 27rpx; font-weight: 700; }.section-page { margin-left: auto; color: #148f87; font-size: 20rpx; }.muted { color: #afc5c5; }.pagination-dots { text-align: center; padding: 28rpx 0; }.pagination-dots text { display: inline-block; width: 10rpx; height: 10rpx; margin: 0 5rpx; border-radius: 50%; background: #c8dce0; }.pagination-dots .active-dot { width: 40rpx; border-radius: 8rpx; background: #138d84; }.creation-scroll { white-space: nowrap; width: calc(100vw - 36rpx); margin-left: -36rpx; padding-left: 36rpx; }.creation-card { display: inline-flex; vertical-align: top; flex-direction: column; height: 300rpx; padding: 22rpx; box-sizing: border-box; border-radius: 28rpx; white-space: normal; }.creation-card-main { width: calc(100vw - 100rpx); border: 1rpx solid #ccefe9; background: linear-gradient(135deg, #fff, #eafbf8); }.creation-card-side { width: 250rpx; margin-left: 18rpx; border: 1rpx solid #e0edf2; background: #fff; }.card-badge { padding: 7rpx 13rpx; border-radius: 20rpx; color: white; background: #128e84; font-size: 19rpx; }.card-type { margin-left: 12rpx; color: #169a91; font-size: 20rpx; }.creation-title { margin-top: 18rpx; font-size: 28rpx; font-weight: 700; }.creation-desc { margin-top: 9rpx; color: #617a7e; font-size: 21rpx; }.chips { display: flex; margin-top: 20rpx; gap: 10rpx; }.chips text { padding: 7rpx 12rpx; border-radius: 8rpx; background: #d8f7f2; color: #148e86; font-size: 18rpx; }.card-bottom { margin-top: auto; justify-content: space-between; color: #91aaac; font-size: 19rpx; }.enter-link { color: #157e77; }.quote { padding-bottom: 25rpx; text-align: center; color: #a0b2b5; font-size: 20rpx; }.bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; height: 102rpx; display: flex; justify-content: space-around; border-top: 1rpx solid #e2eeee; }.nav-item { display: flex; align-items: center; flex-direction: column; justify-content: center; color: #98aabd; font-size: 19rpx; }.nav-item.is-active { color: #168d84; }.nav-icon { margin-bottom: 6rpx; font-size: 30rpx; }
</style>
