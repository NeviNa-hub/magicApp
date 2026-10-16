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

      <view class="prompt-card">
        <view class="prompt-head"
          ><text>画面主旨意象</text><text>{{ prompt.length }} / 500字</text></view
        >
        <textarea
          v-model="prompt"
          maxlength="500"
          class="prompt-input"
          placeholder="写下你想描绘的意象"
        />
        <view class="prompt-tools"
          ><button @click="polishPrompt">✦ 灵感润色</button
          ><button @click="randomPrompt">⟳ 随机意象</button
          ><text @click="prompt = ''">清空</text></view
        >
      </view>
      <view class="suggestion-head"
        ><text>灵感引线（轻触即添）</text><text>点击注入画面要素</text></view
      >
      <view class="suggestions"
        ><button v-for="item in suggestions" :key="item" @click="appendPrompt(item)">
          ＋ {{ item }}
        </button></view
      >
      <view class="tuning-card"
        ><view>● 画境点睛 · 气韵微调</view><text>意境基调　清润淡雅　墨韵沉静</text
        ><text>留白比例　迂阔（60%）　虚实均亭</text></view
      >

      <!-- <view class="style-grid legacy-style-grid">
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
      </view> -->

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
      <button class="next" @click="goNext">开始研墨成画 →</button>
    </view>
    <confirm-generation-dialog
      v-if="confirmVisible"
      @cancel="confirmVisible = false"
      @confirm="confirmGenerate"
    />
    <generation-dialog
      v-if="progressVisible"
      @back="uni.redirectTo({ url: '/pages/workbench/index' })"
      @library="uni.navigateTo({ url: '/pages/library/index' })"
    />
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { createImageGeneration, getImageStyles } from "@/apis/textToImage";
import AppIcon from "@/components/AppIcon/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import ConfirmGenerationDialog from "@/components/ConfirmGenerationDialog/index.vue";
import GenerationDialog from "@/components/GenerationDialog/index.vue";

const selectedStyle = ref("");
const styles = ref([]);
const prompt = ref("");
const suggestions = ref([]);
const confirmVisible = ref(false);
const progressVisible = ref(false);
const polishPrompt = () => {
  prompt.value = prompt.value
    ? `${prompt.value}，墨色清润，留白有致`
    : "秋日薄暮，远山叠嶂，水墨氤氲";
};
const randomPrompt = () => {
  prompt.value = "江南烟雨中的远山与归舟，疏朗留白，清润水墨";
};
const appendPrompt = (value) => {
  prompt.value = prompt.value ? `${prompt.value}，${value}` : value;
};

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
const goNext = async () => {
  if (!selectedStyle.value) {
    uni.showToast({ title: "请先选择一种画风", icon: "none" });
    return;
  }

  const draft = uni.getStorageSync("imageCreationDraft") || {};
  if (!prompt.value.trim()) {
    uni.showToast({ title: "请先填写画面主旨意象", icon: "none" });
    return;
  }
  if (!confirmVisible.value) {
    confirmVisible.value = true;
    return;
  }
  confirmVisible.value = false;
  const requestData = {
    prompt: prompt.value.trim(),
    style: selectedStyle.value,
    ratio: "1:1",
    count: "鍙屽紶",
  };
  const response = await createImageGeneration(requestData);
  if (response.code !== 0) {
    uni.showToast({
      title: response.message || "鍒涘缓浠诲姟澶辫触",
      icon: "none",
    });
    return;
  }
  uni.setStorageSync("imageCreationDraft", requestData);
  progressVisible.value = true;
};

const confirmGenerate = async () => {
  await goNext();
};

onMounted(async () => {
  const response = await getImageStyles();
  if (response.code === 0) {
    selectedStyle.value = response.data.default_style;
    styles.value = response.data.lists;
    suggestions.value = [
      "寒林萧寺",
      "江南烟雨",
      "苍松怪石",
      "孤舟蓑笠",
      "烟岚浮动",
      "残阳泛金",
    ];
    prompt.value = (uni.getStorageSync("imageCreationDraft") || {}).prompt || "";
  }
});

onShow(() => {
  const draft = uni.getStorageSync("imageCreationDraft");

  if (!draft?.style) {
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

.step-bar .step:nth-child(3) {
  display: none;
}

.step-bar {
  margin: 18rpx 32rpx 0;
  height: 82rpx;
  border-radius: 28rpx;
  box-shadow: 0 8rpx 22rpx rgba(19, 76, 68, 0.06);
}

.step.active {
  color: #fff;
  background: #05604c;
}

.content {
  height: calc(100vh - 270rpx);
  padding: 34rpx 32rpx 160rpx;
  box-sizing: border-box;
}

.legacy-style-grid,
.detail-card {
  display: none;
}

.prompt-card,
.tuning-card {
  margin-top: 24rpx;
  padding: 22rpx;
  border: 1rpx solid #e0e7e4;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 8rpx 22rpx rgba(19, 76, 68, 0.05);
}

.prompt-head,
.prompt-tools,
.suggestion-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prompt-head text:last-child,
.suggestion-head text:last-child,
.tuning-card text {
  color: #91a1a4;
  font-size: 18rpx;
}

.prompt-input {
  width: 100%;
  height: 250rpx;
  margin-top: 18rpx;
  font-size: 24rpx;
}

.prompt-tools button,
.suggestions button {
  margin: 0 10rpx 0 0;
  padding: 0 16rpx;
  height: 52rpx;
  border: 1rpx solid #dce7e3;
  border-radius: 14rpx;
  background: #fff;
  color: #176954;
  font-size: 19rpx;
}

.prompt-tools text {
  color: #a0aaab;
  font-size: 18rpx;
}
.suggestion-head {
  margin-top: 26rpx;
  color: #146c59;
  font-size: 21rpx;
}
.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 14rpx;
}
.suggestions button {
  color: #47615f;
}
.tuning-card view {
  margin-bottom: 16rpx;
  color: #17463d;
  font-weight: 700;
}
.tuning-card text {
  display: block;
  padding: 12rpx 0;
  border-top: 1rpx solid #edf1ef;
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
  box-shadow: 0 0 0 3rpx rgba(9, 157, 145, 0.1);
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

.modal-mask {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: flex;
  align-items: flex-end;
  background: rgba(20, 28, 27, 0.52);
}

.confirm-sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 32rpx 28rpx 28rpx;
  border-radius: 32rpx 32rpx 0 0;
  background: #fff;
  box-sizing: border-box;
}

.confirm-title {
  order: 1;
}
.confirm-meta {
  order: 2;
}
.confirm-note {
  order: 3;
}
.confirm-actions {
  order: 4;
}

.confirm-title {
  color: #183c35;
  font: 700 28rpx serif;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #e7ecea;
}

.confirm-sheet > text:first-of-type {
  display: none;
}
.confirm-sheet > text {
  display: block;
  margin: 18rpx 0 26rpx;
  color: #758582;
  font-size: 20rpx;
}

.confirm-note {
  padding: 14rpx 8rpx;
  color: #71817e;
  font-size: 18rpx;
  line-height: 1.5;
}

.confirm-meta {
  margin-top: 18rpx;
  padding: 14rpx 16rpx;
  border: 1rpx solid #f1dfab;
  border-radius: 18rpx;
  background: #fffaf0;
}

.confirm-meta view {
  display: flex;
  align-items: center;
  min-height: 48rpx;
  color: #746c5b;
  font-size: 18rpx;
}

.confirm-meta view + view {
  border-top: 1rpx solid #f2e8cf;
}

.confirm-meta view > text:first-child {
  width: 38rpx;
  color: #d58b22;
  font-size: 22rpx;
}

.confirm-meta b {
  margin-left: auto;
  color: #a65d17;
  font-size: 20rpx;
}
.confirm-actions {
  display: flex;
  gap: 14rpx;
}
.confirm-actions button {
  flex: 1;
  height: 72rpx;
  border-radius: 18rpx;
  font-size: 20rpx;
}
.confirm-actions .confirm {
  border: 0;
  background: #05604c;
  color: #fff;
}
.progress-sheet {
  text-align: center;
}

.progress-title {
  width: 100%;
  text-align: left;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #e7ecea;
  color: #183c35;
  font: 700 30rpx serif;
}

.progress-subtitle,
.progress-status,
.progress-note {
  display: block;
  color: #73817e;
  font-size: 18rpx;
}

.progress-sheet > text:not(.progress-subtitle):not(.progress-status):not(.progress-note) {
  display: none;
}

.progress-subtitle {
  margin-top: 10rpx;
}

.progress-sheet .progress-circle {
  margin-top: 22rpx;
}

.progress-status {
  margin-top: 18rpx;
  color: #087761;
  font-weight: 700;
}

.progress-note {
  margin: 14rpx 0 24rpx;
  line-height: 1.5;
}
.progress-circle {
  width: 150rpx;
  height: 150rpx;
  margin: 0 auto 22rpx;
  border: 6rpx solid #0c9b86;
  border-radius: 50%;
  color: #16463d;
  font-size: 52rpx;
  line-height: 150rpx;
}
.progress-circle small {
  font-size: 22rpx;
}
</style>
