<template>
  <view class="creation-page">
    <app-page-header title="文字生图" />
    <view class="step-bar">
      <view class="step active"><i>1</i><text>落墨构想</text></view>
      <view class="step-connector"></view>
      <view class="step inactive"><i>2</i><text>甄选画风</text></view>
    </view>
    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <!-- <view class="section-kicker">阶段一 · 意象炼境</view> -->
      <!-- <text class="page-title">落墨构想</text> -->
      <!-- <text class="page-desc">理顺脑海意象，赋予笔墨生命</text> -->

      <view class="config-card">
        <view class="config-title"><em>壹 ·</em> 风格定品</view>
        <view class="option-grid">
          <view
            v-for="style in styleOptions"
            :key="style.name"
            class="option-card"
            :class="{ selected: selectedStyle === style.name }"
            @click="selectedStyle = style.name"
          >
            <text>{{ style.name }}</text>
            <small>{{ style.description }}</small>
          </view>
        </view>
      </view>
      <view class="config-card">
        <view class="config-title"><em>贰 ·</em> 画幅比例</view>
        <view class="option-grid four">
          <view
            v-for="ratio in ratios"
            :key="ratio"
            class="option-card compact"
            :class="{ selected: selectedRatio === ratio }"
            @click="selectedRatio = ratio"
            >{{ ratio }}</view
          >
        </view>
      </view>
      <view class="config-card">
        <view class="config-title"><em>叁 ·</em> 生成规则</view>
        <view class="option-grid three">
          <view
            v-for="count in counts"
            :key="count"
            class="option-card compact"
            :class="{ selected: selectedCount === count }"
            @click="selectedCount = count"
            >{{ count }}</view
          >
        </view>
      </view>
    </scroll-view>
    <view class="next-card">
      <button @click="goNext">下一步：构想意象</button>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";

import { getImageCreationOptions, getImageStyles } from "@/apis/textToImage";
import AppPageHeader from "@/components/AppPageHeader/index.vue";

const prompt = ref("");
const suggestions = ref([]);
const polishSuffix = ref("");
const randomPromptText = ref("");
const styleOptions = ref([]);
const selectedStyle = ref("");
const selectedRatio = ref("1:1");
const selectedCount = ref("双张");
const ratios = ["1:1", "16:9", "9:16", "4:3"];
const counts = ["单张", "双张", "四张"];

/**
 * 将灵感词追加到画面主旨，已有内容时用逗号衔接。
 * @param {string} value 待追加的灵感词。
 * @returns {void}
 */
const appendPrompt = (value) => {
  prompt.value = prompt.value ? `${prompt.value}，${value}` : value;
};

// 清空画面主旨输入
const clearPrompt = () => {
  prompt.value = "";
};

// 在现有主旨后追加润色意象，空主旨时使用默认起笔句式
const polishPrompt = () => {
  prompt.value = prompt.value
    ? `${prompt.value}，${polishSuffix.value}`
    : `江南烟雨中的远山与归舟，${polishSuffix.value}`;
};

// 用随机意象覆盖当前主旨
const randomPrompt = () => {
  prompt.value = randomPromptText.value;
};

// 校验并保存构思草稿，进入画风挑选页
const goNext = () => {
  const normalizedPrompt = "待输入意象";

  if (!normalizedPrompt) {
    uni.showToast({ title: "请先填写画面主旨意象", icon: "none" });
    return;
  }

  if (!selectedStyle.value) {
    uni.showToast({ title: "请先选择画风", icon: "none" });
    return;
  }
  uni.setStorageSync("imageCreationDraft", {
    style: selectedStyle.value,
    ratio: selectedRatio.value,
    count: selectedCount.value,
  });
  uni.navigateTo({ url: "/pages/image-style/index" });
};

onMounted(async () => {
  const response = await getImageCreationOptions();
  if (response.code === 0) {
    suggestions.value = response.data.suggestions;
    polishSuffix.value = response.data.polish_suffix;
    randomPromptText.value = response.data.random_prompt;
  }
  const styleResponse = await getImageStyles();
  if (styleResponse.code === 0) {
    styleOptions.value = styleResponse.data.lists;
    selectedStyle.value = styleResponse.data.default_style;
  }
});
</script>

<style scoped>
page {
  height: 100%;
  overflow: hidden;
}

.creation-page {
  height: 100vh;
  overflow: hidden;
  background: #f9f9f6;
  color: #2a302e;
}

.step-bar {
  height: 70rpx;
  margin: 12rpx 24rpx 0;
  padding: 8rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid rgba(63, 102, 86, 0.12);
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.86);
}

.step {
  flex: 1;
  padding: 13rpx 10rpx;
  border-radius: 15rpx;
  color: #7a8581;
  text-align: center;
  font-size: 20rpx;
  white-space: nowrap;
}

.step i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  margin-right: 8rpx;
  border-radius: 50%;
  background: #dfdfd5;
  color: #7a8581;
  font-style: normal;
  font-size: 18rpx;
}

.step.active i {
  background: #3f6656;
  color: #fff;
}

.step-connector {
  flex: 1;
  height: 2rpx;
  margin: 0 16rpx;
  background: linear-gradient(90deg, #3f6656, #dfdfd5);
}

.step.active {
  color: #3f6656;
  /* background: #3f6656; */
  font-weight: 700;
}

.step-bar .step:nth-child(3) {
  display: flex;
}

.step-bar {
  margin: 18rpx 32rpx 0;
  height: 82rpx;
  border-radius: 28rpx;
  box-shadow: 0 8rpx 22rpx rgba(19, 76, 68, 0.06);
}

.step.active {
  color: #fff;

  /* background: #05604c; */
  i {
    background: #05604c;
  }
}

.content {
  height: calc(100vh - 270rpx);
  /* padding: 28rpx 28rpx 160rpx; */
  padding: 35rpx;
  box-sizing: border-box;
}

.section-kicker {
  color: #3f6656;
  font-size: 21rpx;
}

.page-title {
  display: block;
  margin-top: 14rpx;
  color: #2a302e;
  font: 700 32rpx serif;
}

.page-desc {
  display: block;
  margin-top: 8rpx;
  color: #7a8581;
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

.section-kicker {
  display: inline-block;
  padding: 8rpx 16rpx;
  border: 1rpx solid #9fe8d9;
  border-radius: 10rpx;
  background: #f0fffa;
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

.config-card {
  margin-top: 30rpx;
  padding: 30rpx;
  /* border: 1rpx solid rgba(0, 0, 0, 0.02); */
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 10rpx 30rpx rgba(95, 133, 117, 0.04);
}

.creation-page .prompt-card,
.creation-page .suggestion-head,
.creation-page .suggestions {
  display: none;
}

.config-title {
  /* margin: 8rpx 0 16rpx; */
  padding-bottom: 30rpx;
  /* background: green; */
  color: #3F6656;
  font: 700 30rpx serif;
}

.config-title em {
  color: #d9be9b;
  /* font-style: normal; */
}

.option-grid {
  /* background: green; */
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30rpx;
  /* margin-bottom: 30rpx; */
}

.option-grid.four {
  grid-template-columns: repeat(4, 1fr);
}

.option-grid.three {
  grid-template-columns: repeat(3, 1fr);
}

.option-card {
  min-height: 70rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.08);
  border-radius: 18rpx;
  background: linear-gradient(135deg, #fcfcfa 0%, #fafbf9 100%);
  color: #2a302e;
  font-size: 30rpx;
}

.option-card small {
  display: block;
  margin-top: 10rpx;
  color: #bbbdbd;
  font-size: 12rpx;
}

.option-card.compact {
  min-height: auto;
  padding: 18rpx 8rpx;
  text-align: center;
}

.option-grid.four .option-card.compact::before {
  display: block;
  width: 38rpx;
  height: 38rpx;
  margin: 0 auto 10rpx;
  border: 1rpx solid #7a8581;
  border-radius: 5rpx;
  content: "";
}

.option-grid.four .option-card:nth-child(2)::before {
  /* background: green; */
  width: 48rpx;
  height: 28rpx;
}
.option-grid.four .option-card:nth-child(3)::before {
  width: 28rpx;
  height: 48rpx;
}
.option-grid.four .option-card:nth-child(4)::before {
  width: 44rpx;
  height: 34rpx;
}

.option-card.selected {
  border: 2rpx solid #05604c;
  background: linear-gradient(135deg, #e6f0ea 0%, #fafbf9 100%);
  color: #3f6656;
  font-weight: 700;
}

.option-grid.four .option-card.selected::before {
  border-color: #3f6656;
  background: #3f6656;
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
  background: linear-gradient(135deg, #3f6656 0%, #2e4e42 100%);
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
}

.next-card button:after {
  border: 0;
}
</style>
