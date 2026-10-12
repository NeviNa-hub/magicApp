<template>
  <view class="workbench-page">
    <app-page-header title="创作台" />
    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <view class="tool card teal">
        <view class="heading">
          <text class="index">01</text>
          <text class="title">文字生图</text>
          <text class="tag">墨韵·宣</text>
          <text class="ready"> 向导就绪</text>
        </view>
        <text class="desc">三步流式构思，从画风择定到纸墨挥毫。</text>
        <view class="image-preview">
          <image
            class="theme-image"
            src="/static/theme/theme-images.png"
            mode="aspectFill"
          />
          <view class="ink"></view>
          <text class="chip one">留白神韵</text>
          <text class="chip two">青绿工笔</text>
        </view>
        <view class="footer">
          <text>支持宣纸留白与精细排版</text>
          <button @click="startTool('文字生图')">研墨生图</button>
        </view>
      </view>
      <view class="tool card blue">
        <view class="heading">
          <text class="index">02</text>
          <text class="title">视频创作</text>
          <text class="tag blue-tag">流光·镜</text>
          <text class="ready blue-text"> 多镜连贯</text>
        </view>
        <text class="desc">精准掌控光影轨迹与运镜调度，独立成片。</text>
        <view class="film">
          <text> 水墨分镜胶卷轨道 <small>4段连贯 · 00:04</small></text>
          <view class="frames">
            <view v-for="frame in frames" :key="frame">
              <i></i>
              <small>{{ frame }}</small>
            </view>
          </view>
          <view class="film-chip">
            <text>四开画幅</text>
            <text>轨迹平滑</text>
            <text>60FPS 帧率</text>
          </view>
        </view>
        <view class="footer">
          <button class="blue-button" @click="startTool('视频创作')">逐帧调度</button>
        </view>
      </view>
      <view class="tool card purple">
        <view class="heading">
          <text class="index">03</text>
          <text class="title">图片优化</text>
          <text class="tag purple-tag">净辞·重塑</text>
          <text class="ready purple-text"> 无损超分</text>
        </view>
        <text class="desc">还原本真质感，微米级去噪与旧照色彩修复。</text>
        <view class="compare">
          <image
            class="optimization-image"
            src="/static/theme/theme-optimization.png"
            mode="aspectFill"
          />
          <view class="old"></view>
          <view class="new"></view>
          <text class="handle">↔</text>
          <text class="compare-tag left">原片 · 噪点暗旧</text>
          <text class="compare-tag right">超清 · 纤毫毕现</text>
          <view class="compare-bottom">4K 超清晰　 旧影修复　 自然去噪</view>
        </view>
        <view class="footer">
          <text> 最大支持五千万像素解析</text>
          <button class="purple-button" @click="startTool('图片优化')">净炼重绘</button>
        </view>
      </view>
      <view class="draft card">
        <view class="draft-title">草稿与便签库 <small>完整归档</small></view>
        <view v-for="draft in drafts" :key="draft.draft_id" class="draft-row">
          {{ draft.title }} · {{ draft.time }} <b>{{ draft.status }}</b>
        </view>
      </view>
    </scroll-view>
    <app-bottom-nav active="creation" />
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";

import { getWorkbenchData } from "@/apis/creation";
import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";

const frames = ref([]);
const drafts = ref([]);

/**
 * 根据工具名称进入对应创作流程或公共待开发页。
 * @param {string} name 工具名称。
 * @returns {void}
 */
const startTool = (name) => {
  if (name === "文字生图") {
    uni.navigateTo({ url: "/pages/image-creation/index" });
    return;
  }

  if (name === "图片优化") {
    uni.navigateTo({ url: "/pages/image-optimization/index" });
    return;
  }

  uni.navigateTo({
    url: `/pages/under-development/index?title=${encodeURIComponent(name)}`,
  });
};

onMounted(async () => {
  const response = await getWorkbenchData();
  if (response.code === 0) {
    frames.value = response.data.frames;
    drafts.value = response.data.drafts;
  }
});
</script>

<style scoped>
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

.content {
  height: calc(100vh - 210rpx);
  overflow: hidden;
  padding: 30rpx 32rpx;
  box-sizing: border-box;
}

.card {
  margin-bottom: 26rpx;
  padding: 24rpx;
  border: 1rpx solid #dce7eb;
  border-radius: 28rpx;
  background: #fff;
}

.tool.card {
  position: relative;
  overflow: visible;
  padding-bottom: 82rpx;
  border: 0;
}

.tool.card.teal {
  /* box-shadow: 0 0 26rpx 6rpx rgba(41, 185, 169, 0.26),
    0 12rpx 30rpx rgba(41, 185, 169, 0.18); */
}

.tool.card.blue {
  padding-bottom: 24rpx;
  /* box-shadow: 0 0 26rpx 6rpx rgba(50, 156, 232, 0.25),
    0 12rpx 30rpx rgba(50, 156, 232, 0.17); */
}

.tool.card.purple {
  /* box-shadow: 0 0 26rpx 6rpx rgba(94, 81, 214, 0.25),
    0 12rpx 30rpx rgba(94, 81, 214, 0.17); */
}

.heading,
.footer {
  display: flex;
  align-items: center;
}

/* 序号标签暂不展示 */
.index {
  display: none;
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
  font-size: 20rpx;
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

.image-preview,
.film,
.compare {
  border-radius: 22rpx;
  box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.45);
}

.theme-image,
.optimization-image {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
}

.image-preview {
  position: relative;
  height: 300rpx;
  overflow: hidden;
  border: 1rpx solid #e2d9cd;
  background: linear-gradient(140deg, #eee8dc, #c5d0ce);
}

/* 预览改由封面图呈现，水墨装饰层暂不展示 */
.image-preview .ink {
  display: none;
  position: absolute;
  left: 24%;
  bottom: -60rpx;
  width: 320rpx;
  height: 200rpx;
  border-radius: 50%;
  background: #91a8a2;
  transform: rotate(35deg);
}

.image-preview .chip,
.compare .handle,
.compare .compare-tag,
.compare .compare-bottom {
  z-index: 1;
}

.chip,
.compare-tag {
  position: absolute;
  padding: 7rpx 10rpx;
  border-radius: 8rpx;
  background: #3e4b55;
  color: #fff;
  font-size: 17rpx;
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

.film {
  background: #f2f8ff;
  color: #17628a;
  font-size: 20rpx;
}

.film small {
  float: right;
  color: #92a3ac;
}

.tool.card.blue .film {
  height: 360rpx;
  min-height: 360rpx;
  padding: 22rpx;
  border: 0;
  border-radius: 24rpx;
  background: linear-gradient(180deg, #e5f3fb 0%, #f5fbfd 54%, #fff 100%);
  box-shadow: inset 0 0 0 1rpx #d7eaf5;
}

.tool.card.blue .film > text:first-child {
  display: block;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #d8e8f0;
  color: #174f70;
  font-size: 21rpx;
  font-weight: 700;
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

.tool.card.blue .frames {
  align-items: flex-end;
  gap: 14rpx;
}

.tool.card.blue .frames view {
  padding: 8rpx;
  border: 1rpx solid #a9cde4;
  border-radius: 14rpx;
  background: #fff;
  color: #5a7888;
  text-align: center;
}

.tool.card.blue .frames view:nth-child(1) {
  flex: 0.6;
}

.tool.card.blue .frames view:nth-child(2) {
  flex: 0.75;
}

.tool.card.blue .frames view:nth-child(3) {
  flex: 0.85;
}

.tool.card.blue .frames view:nth-child(4) {
  flex: 1;
  border-color: #50b5ff;
  box-shadow: 0 6rpx 16rpx rgba(50, 156, 232, 0.2);
}

.tool.card.blue .frames i {
  height: 120rpx;
  margin: 0 0 8rpx;
  border-radius: 8rpx;
  background-position: center;
  background-size: cover;
}

.tool.card.blue .frames view:nth-child(1) i {
  height: 88rpx;
  background-image: url("../../assets/theme/theme-videos-1.png");
}

.tool.card.blue .frames view:nth-child(2) i {
  height: 104rpx;
  background-image: url("../../assets/theme/theme-videos-2.png");
}

.tool.card.blue .frames view:nth-child(3) i {
  height: 120rpx;
  background-image: url("../../assets/theme/theme-videos-3.png");
}

.tool.card.blue .frames view:nth-child(4) i {
  height: 140rpx;
  background-image: url("../../assets/theme/theme-videos-1.png");
}

.tool.card.blue .film-chip {
  display: flex;
  width: auto;
  gap: 12rpx;
  align-items: center;
  justify-content: flex-start;
}

.tool.card.blue .film-chip text {
  padding: 8rpx 14rpx;
  border: 1rpx solid #dce7ea;
  border-radius: 18rpx;
  background: #fff;
  color: #60777d;
  font-size: 17rpx;
  letter-spacing: 0;
  white-space: nowrap;
}

.footer {
  justify-content: space-between;
  margin-top: 22rpx;
  color: #65777e;
  font-size: 20rpx;
}

.tool .footer {
  position: absolute;
  right: 26rpx;
  bottom: 20rpx;
  left: 26rpx;
  margin-top: 0;
}

.footer button {
  height: 52rpx;
  margin-left: auto;
  padding: 0 18rpx;
  border: 0;
  border-radius: 20rpx;
  outline: none;
  background: #08776e;
  color: #fff;
  font-size: 20rpx;
  flex-shrink: 0;
}

.footer button:after {
  border: 0;
}

.footer button.blue-button {
  background: #00699b;
}

.footer button.purple-button {
  background: #302693;
}

.tool .footer button {
  position: absolute;
  right: 0;
  bottom: 0;
  min-width: 118rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 18rpx rgba(0, 137, 126, 0.35);
}

.tool.blue .footer button {
  box-shadow: 0 8rpx 18rpx rgba(0, 105, 155, 0.35);
}

.tool.purple .footer button {
  box-shadow: 0 8rpx 18rpx rgba(48, 38, 147, 0.35);
}

.tool .footer button:before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -80%;
  width: 45%;
  background: linear-gradient(
    100deg,
    transparent,
    rgba(255, 255, 255, 0.65),
    transparent
  );
  transform: skewX(-20deg);
  animation: button-shimmer 2.8s infinite;
}

@keyframes button-shimmer {
  0% {
    left: -80%;
  }

  55%,
  100% {
    left: 140%;
  }
}

.tool.card.blue .footer {
  bottom: 16rpx;
  height: 0;
}

.tool.card.blue .footer button {
  bottom: 90rpx;
}

.compare {
  position: relative;
  height: 300rpx;
  overflow: hidden;
  border: 1rpx solid #657191;
  background: #999;
}

/* 对比效果改由封面图呈现，旧/新分屏图层暂不展示 */
.compare .old,
.compare .new {
  display: none;
  position: absolute;
  top: 0;
  bottom: 66rpx;
  width: 50%;
}

.compare .old {
  left: 0;
  background: linear-gradient(135deg, #c6c6c6, #777);
  filter: grayscale(1);
}

.compare .new {
  right: 0;
  background: linear-gradient(135deg, #222, #aaa);
}

.compare .handle {
  position: absolute;
  top: 42%;
  left: calc(50% - 23rpx);
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  background: #fff;
  color: #595bdc;
  line-height: 46rpx;
  text-align: center;
}

.compare .compare-tag {
  bottom: 82rpx;
}

.left {
  left: 12rpx;
}

.right {
  right: 12rpx;
}

.compare .compare-bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 66rpx;
  background: #7c8299;
  color: #fff;
  font-size: 18rpx;
  line-height: 66rpx;
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
</style>
