<template>
  <view class="workbench-page">
    <view class="top-bar"
      ><text class="brand-name">落笔生花</text><text class="brand-tag">智能创作</text
      ><text class="credits">✦ 灵感点 八百</text><text class="avatar">●</text></view
    >
    <scroll-view scroll-y class="content">
      <text class="page-title">创作台</text>
      <view class="quota card"
        ><text>✦ 今日可用算力　<span>充足 80%</span></text
        ><text class="detail">消耗明细 ›</text
        ><text class="number">800 <small>/ 1000 点</small></text
        ><view class="progress"><view></view></view
      ></view>
      <view class="tool card teal"
        ><view class="heading"
          ><text class="index">01</text><text class="title">文字生图</text
          ><text class="tag red">墨韵·宣</text><text class="ready">● 向导就绪</text></view
        ><text class="desc">三步流式构思，从画风择定到纸墨挥毫。</text
        ><view class="image-preview"
          ><view class="ink"></view><text class="label">墨</text
          ><text class="chip one">留白神韵</text><text class="chip two">青绿工笔</text
          ><view class="side">预设<br /><br />比例<br /><br />风格</view></view
        ><view class="footer"
          ><text>♧ 支持宣纸留白与精细排版</text
          ><button @click="startTool('文字生图')">研墨生图 →</button></view
        ></view
      >
      <view class="tool card blue"
        ><view class="heading"
          ><text class="index">02</text><text class="title">视频创作</text
          ><text class="tag blue-tag">流光·镜</text
          ><text class="ready blue-text">● 多镜连贯</text></view
        ><text class="desc">精准掌控光影轨迹与运镜调度，独立成片。</text
        ><view class="film"
          ><text>▣ 水墨分镜胶卷轨道 <small>4段连贯 · 00:04</small></text
          ><view class="frames"
            ><view v-for="(frame, index) in frames" :key="frame"
              ><text>00:0{{ index }}</text
              ><i :class="`frame-${index}`"></i><small>{{ frame }}</small></view
            ></view
          ><text class="film-chip">四开画幅　 轨迹平滑　 60FPS 静帧</text></view
        ><view class="footer"
          ><text>⌗ 支持横竖比无损双裁切</text
          ><button class="blue-button" @click="startTool('视频创作')">
            逐帧调度 →
          </button></view
        ></view
      >
      <view class="tool card purple"
        ><view class="heading"
          ><text class="index">03</text><text class="title">图片优化</text
          ><text class="tag purple-tag">净辞·重塑</text
          ><text class="ready purple-text">● 无损超分</text></view
        ><text class="desc">还原本真质感，微米级去噪与旧照色彩修复。</text
        ><view class="compare"
          ><view class="old"></view><view class="new"></view><text class="handle">↔</text
          ><text class="compare-tag left">原片 · 噪点暗旧</text
          ><text class="compare-tag right">超清 · 纤毫毕现</text
          ><view class="compare-bottom">4K 超清晰　 旧影修复　 自然去噪</view></view
        ><view class="footer"
          ><text>▣ 最大支持五千万像素解析</text
          ><button class="purple-button" @click="startTool('图片优化')">
            净炼重绘 →
          </button></view
        ></view
      >
      <view class="draft card"
        ><view class="draft-title">♧ 草稿与便签库 <small>完整归档 ›</small></view
        ><view v-for="draft in drafts" :key="draft.title" class="draft-row"
          >{{ draft.title }} · {{ draft.time }} <b>{{ draft.status }}</b></view
        ></view
      >
    </scroll-view>
    <view class="bottom-nav"
      ><text>▤<small>文稿库</small></text
      ><text class="active">☷<small>创作台</small></text
      ><text>♧<small>作品库</small></text
      ><text>☷<small>工作坊</small></text></view
    >
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";

import { getWorkbenchData } from "@/apis/creation";

const frames = ref([]);
const drafts = ref([]);

onMounted(async () => {
  const response = await getWorkbenchData();
  if (response.code === 0) {
    frames.value = response.data.frames;
    drafts.value = response.data.drafts;
  }
});

const startTool = (name) => {
  if (name === "文字生图") {
    uni.navigateTo({ url: "/pages/image-creation/index" });
    return;
  }

  uni.showToast({ title: `${name}工作流已就绪`, icon: "none" });
};
</script>

<style scoped>
.bottom-nav > text:first-child small { display: none; }.bottom-nav > text:first-child:after { content: "作品库"; display: block; margin-top: 8rpx; font-size: 19rpx; }
.index {
  display: none;
}
.footer {
  justify-content: space-between;
}
.footer button {
  margin-left: auto;
  flex-shrink: 0;
}
page {
  height: 100%;
  overflow: hidden;
}
.workbench-page {
  height: 100vh;
  overflow: hidden;
  background: #f8fbfc;
  color: #17343b;
}
.top-bar,
.bottom-nav {
  background: #fff;
}
.top-bar {
  height: 108rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border-bottom: 1rpx solid #edf3f3;
}
.brand-name {
  font: 700 34rpx serif;
}
.brand-tag,
.quota span {
  padding: 6rpx 12rpx;
  border: 1rpx solid #8ee8dd;
  border-radius: 20rpx;
  color: #168f87;
  font-size: 20rpx;
}
.credits {
  margin-left: auto;
  color: #71868d;
  font-size: 21rpx;
}
.avatar {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: #182633;
  color: #fff;
  line-height: 52rpx;
  text-align: center;
}
.content {
  height: calc(100vh - 210rpx);
  overflow: hidden;
  padding: 30rpx 32rpx;
  box-sizing: border-box;
}
.page-title {
  display: block;
  margin-bottom: 24rpx;
  font: 700 40rpx serif;
}
.card {
  margin-bottom: 26rpx;
  padding: 24rpx;
  border: 1rpx solid #dce7eb;
  border-radius: 28rpx;
  background: #fff;
}
.quota {
  position: relative;
}
.quota span {
  margin-left: 8rpx;
  font-size: 18rpx;
}
.detail {
  position: absolute;
  right: 24rpx;
  color: #71868d;
  font-size: 20rpx;
}
.number {
  display: block;
  margin-top: 14rpx;
  font-size: 38rpx;
}
.number small {
  color: #9baeb4;
  font-size: 20rpx;
}
.progress {
  height: 12rpx;
  margin-top: 22rpx;
  border-radius: 10rpx;
  background: #edf1f3;
}
.progress view {
  width: 80%;
  height: 100%;
  border-radius: 10rpx;
  background: #168b81;
}
.teal {
  border-color: #75e6dc;
}
.blue {
  border-color: #8fceff;
}
.purple {
  border-color: #b4baff;
}
.heading,
.footer {
  display: flex;
  align-items: center;
}
.index {
  padding: 8rpx 14rpx;
  border: 1rpx solid #65d9d1;
  border-radius: 10rpx;
  color: #128d84;
  font-size: 20rpx;
}
.title {
  margin-left: 18rpx;
  font: 700 29rpx serif;
}
.tag {
  margin-left: 16rpx;
  padding: 6rpx 10rpx;
  border: 1rpx solid #ff6b6b;
  color: #ed5757;
  font-size: 18rpx;
}
.blue-tag {
  border-color: #51a9ff;
  color: #288ad9;
}
.purple-tag {
  border-color: #7476ff;
  color: #595bdc;
}
.ready {
  margin-left: auto;
  color: #179a90;
  font-size: 20rpx;
}
.blue-text {
  color: #168fd5;
}
.purple-text {
  color: #514ed5;
}
.desc {
  display: block;
  margin: 20rpx 0;
  color: #637980;
  font-size: 21rpx;
}
.image-preview {
  position: relative;
  height: 300rpx;
  overflow: hidden;
  border: 1rpx solid #e2d9cd;
  border-radius: 22rpx;
  background: linear-gradient(140deg, #eee8dc, #c5d0ce);
}
.ink {
  position: absolute;
  left: 24%;
  bottom: -60rpx;
  width: 320rpx;
  height: 200rpx;
  border-radius: 50%;
  background: #91a8a2;
  transform: rotate(35deg);
}
.label,
.chip,
.compare-tag {
  position: absolute;
  padding: 7rpx 10rpx;
  border-radius: 8rpx;
  background: #3e4b55;
  color: #fff;
  font-size: 17rpx;
}
.label {
  top: 16rpx;
  left: 16rpx;
  background: #f45e66;
}
.chip {
  bottom: 14rpx;
  background: #fff;
  color: #60747b;
}
.one {
  left: 16rpx;
}
.two {
  left: 150rpx;
}
.side {
  position: absolute;
  top: 0;
  right: 0;
  width: 100rpx;
  height: 100%;
  padding: 24rpx 12rpx;
  box-sizing: border-box;
  background: #eef0f3;
  color: #86949c;
  font-size: 17rpx;
}
.footer {
  margin-top: 22rpx;
  color: #65777e;
  font-size: 20rpx;
}
.footer button {
  margin-left: auto;
  padding: 0 22rpx;
  height: 62rpx;
  border: 0;
  border-radius: 24rpx;
  background: #08776e;
  color: #fff;
  font-size: 22rpx;
}
.footer button:after {
  border: 0;
}
.blue-button {
  background: #00699b !important;
}
.purple-button {
  background: #302693 !important;
}
.film {
  padding: 18rpx;
  border: 1rpx solid #b9ddff;
  border-radius: 20rpx;
  background: #f2f8ff;
  color: #17628a;
  font-size: 20rpx;
}
.film small {
  float: right;
  color: #92a3ac;
}
.frames {
  display: flex;
  gap: 10rpx;
  margin: 18rpx 0;
}
.frames view {
  flex: 1;
  overflow: hidden;
  border: 1rpx solid #8fb9d9;
  border-radius: 8rpx;
  color: #41677d;
  font-size: 15rpx;
}
.frames i {
  display: block;
  height: 90rpx;
  margin: 4rpx;
  background: linear-gradient(145deg, #b9c7c9, #e4ddd0);
}
.frames small {
  display: block;
  padding: 4rpx;
  text-align: center;
}
.film-chip {
  display: block;
  padding: 8rpx;
  border: 1rpx solid #85ceff;
  border-radius: 8rpx;
}
.compare {
  position: relative;
  height: 300rpx;
  overflow: hidden;
  border: 1rpx solid #657191;
  border-radius: 22rpx;
  background: #999;
}
.old,
.new {
  position: absolute;
  top: 0;
  bottom: 66rpx;
  width: 50%;
}
.old {
  left: 0;
  background: linear-gradient(135deg, #c6c6c6, #777);
  filter: grayscale(1);
}
.new {
  right: 0;
  background: linear-gradient(135deg, #222, #aaa);
}
.handle {
  position: absolute;
  top: 42%;
  left: calc(50% - 23rpx);
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  background: #fff;
  color: #595bdc;
  text-align: center;
  line-height: 46rpx;
}
.compare-tag {
  bottom: 82rpx;
}
.left {
  left: 12rpx;
}
.right {
  right: 12rpx;
}
.compare-bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 66rpx;
  line-height: 66rpx;
  background: #7c8299;
  color: #fff;
  font-size: 18rpx;
  text-align: center;
}
.draft-title {
  font: 700 29rpx serif;
}
.draft-title small {
  float: right;
  color: #75868c;
  font: 20rpx sans-serif;
}
.draft-row {
  margin-top: 12rpx;
  padding: 22rpx 18rpx;
  border: 1rpx solid #e7e8e8;
  border-radius: 18rpx;
  color: #60727a;
  font-size: 20rpx;
}
.draft-row b {
  float: right;
  padding: 5rpx 12rpx;
  border: 1rpx solid #85e4da;
  border-radius: 8rpx;
  color: #159d92;
  font-weight: 400;
}
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 102rpx;
  display: flex;
  justify-content: space-around;
  border-top: 1rpx solid #e2eeee;
}
.bottom-nav > text {
  padding-top: 16rpx;
  color: #98aabd;
  text-align: center;
  font-size: 30rpx;
}
.bottom-nav small {
  display: block;
  font-size: 19rpx;
}
.bottom-nav .active {
  color: #168d84;
}
</style>
