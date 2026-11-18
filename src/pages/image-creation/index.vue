<template>
  <creation-page title="文字生图" :steps="steps">
    <view class="flow-body">
      <app-config-card index="壹" title="风格定品">
        <view class="option-grid">
          <view
            v-for="(style, index) in styleOptions"
            :key="style.styleId"
            class="option-card"
            :class="[
              `is-style-${index + 1}`,
              { selected: selectedStyleId === style.styleId },
            ]"
            @click="selectedStyleId = style.styleId"
          >
            <!-- #ifdef H5 -->
            <el-icon class="option-icon">
              <component :is="STYLE_ICONS[style.styleId]" />
            </el-icon>
            <!-- #endif -->
            <text class="option-name">{{ style.name }}</text>
          </view>
        </view>
      </app-config-card>

      <app-config-card index="贰" title="画幅比例">
        <view class="option-grid is-four">
          <view
            v-for="(ratio, index) in ratios"
            :key="ratio.ratioId"
            class="option-card is-compact"
            :class="[
              `is-ratio-${index + 1}`,
              { selected: selectedRatio === ratio.value },
            ]"
            @click="selectedRatio = ratio.value"
          >
            <view class="ratio-glyph"></view>
            <text class="ratio-value">{{ ratio.value }}</text>
            <text class="ratio-label">{{ ratio.label }}</text>
          </view>
        </view>
      </app-config-card>
    </view>

    <template #footer>
      <app-flow-button block @click="goNext">
        下一步：构想意象
        <!-- #ifdef H5 -->
        <el-icon class="next-icon"><ArrowRight /></el-icon>
        <!-- #endif -->
      </app-flow-button>
    </template>
  </creation-page>
</template>

<script setup>
import { onLoad } from "@dcloudio/uni-app";
import { computed, ref } from "vue";

// #ifdef H5
import {
  ArrowRight,
  Brush,
  Camera,
  MagicStick,
  Sunny,
} from "@element-plus/icons-vue";
// #endif

import AppConfigCard from "@/components/AppConfigCard/index.vue";
import AppFlowButton from "@/components/AppFlowButton/index.vue";
import CreationPage from "@/components/CreationPage/index.vue";
import {
  DRAFT_KEYS,
  readCreationDraft,
  saveCreationDraft,
} from "@/utils/creation-draft";
import { limitPromptCharacters } from "@/utils/prompt";

const steps = [
  { label: "落墨构想", state: "active" },
  { label: "甄选画风", state: "inactive" },
];
const styleOptions = [
  { styleId: 1, name: "古风水墨" },
  { styleId: 2, name: "真实摄影" },
  { styleId: 3, name: "卡通风格" },
  { styleId: 4, name: "温润插画" },
];
// #ifdef H5
// 图标只在 H5 构建中存在，按风格标识取用，避免 APP 端引用未定义变量
const STYLE_ICONS = {
  1: Brush,
  2: Camera,
  3: Sunny,
  4: MagicStick,
};
// #endif
const ratios = [
  { ratioId: 1, value: "1:1", label: "方形" },
  { ratioId: 2, value: "16:9", label: "横卷" },
  { ratioId: 3, value: "9:16", label: "立轴" },
  { ratioId: 4, value: "4:3", label: "经典" },
];
const selectedStyleId = ref(1);
const selectedRatio = ref("1:1");
let templatePrompt = "";

// 模板预填画风和画幅，仍允许在本页调整。
onLoad((query) => {
  if (query?.template !== "1") return;
  const template = readCreationDraft(DRAFT_KEYS.image) || {};
  selectedStyleId.value =
    styleOptions.find((item) => item.name === template.style)?.styleId || 1;
  selectedRatio.value = ratios.some((item) => item.value === template.ratio)
    ? template.ratio
    : "1:1";
  templatePrompt = limitPromptCharacters(template.prompt || "", 400);
});

const selectedStyleName = computed(
  () =>
    styleOptions.find((style) => style.styleId === selectedStyleId.value)
      ?.name || "",
);

// 校验并保存构思草稿，进入画风挑选页
const goNext = () => {
  if (!selectedStyleName.value) {
    uni.showToast({ title: "请先选择画风", icon: "none" });
    return;
  }

  saveCreationDraft(DRAFT_KEYS.image, {
    style: selectedStyleName.value,
    styleId: selectedStyleId.value,
    ratio: selectedRatio.value,
    prompt: templatePrompt,
  });
  uni.navigateTo({ url: "/pages/image-style/index" });
};
</script>

<style scoped lang="scss">
.flow-body {
  @include flow-body(2);
}

.option-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.option-grid.is-four {
  grid-template-columns: repeat(4, 1fr);
}

@media (min-width: $breakpoint-desktop) {
  .option-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  min-height: 150rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.08);
  border-radius: 16rpx;
  background: linear-gradient(135deg, #fcfcfa 0%, #fafbf9 100%);
  color: $color-ink;
  font-size: 30rpx;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.option-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  background: $color-primary-light;
  color: $color-primary;
  font-size: 30rpx;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

/* 各画风图标的识别色，选中时统一归为主色 */
.option-card.is-style-1 .option-icon {
  background: #e6f2ee;
  color: $color-primary;
}

.option-card.is-style-2 .option-icon {
  background: rgba(80, 181, 255, 0.16);
  color: #1e7cc8;
}

.option-card.is-style-3 .option-icon {
  background: #fff3d6;
  color: #f08c1e;
}

.option-card.is-style-4 .option-icon {
  background: #eceaf6;
  color: #595bdc;
}

.option-name {
  font-weight: 700;
}

.option-card.selected {
  /* 用阴影描边替代加粗边框，避免选中时卡片抖动 */
  border-color: $color-primary;
  background: linear-gradient(135deg, #f7edde 0%, #f7faf8 100%);
  color: $color-primary;
  box-shadow: 0 0 0 1rpx $color-primary inset;
}

.option-card.selected .option-icon {
  background: $color-primary;
  color: #fff;
}

/* 画幅磁贴：字形 + 比例值 + 小类目标签 */
.option-card.is-compact {
  min-height: 150rpx;
  padding: 16rpx 8rpx 12rpx;
  gap: 8rpx;
  line-height: 1.3;
}

.ratio-glyph {
  display: block;
  border-radius: 6rpx;
  transition: background 0.2s ease;
}

.option-card.is-ratio-1 .ratio-glyph {
  width: 40rpx;
  height: 40rpx;
  background: #e6f2ee;
  box-shadow: inset 0 0 0 1rpx rgba(5, 96, 76, 0.35);
}

.option-card.is-ratio-2 .ratio-glyph {
  width: 54rpx;
  height: 32rpx;
  background: rgba(80, 181, 255, 0.16);
  box-shadow: inset 0 0 0 1rpx rgba(30, 124, 200, 0.35);
}

.option-card.is-ratio-3 .ratio-glyph {
  width: 32rpx;
  height: 54rpx;
  background: #fdf6e8;
  box-shadow: inset 0 0 0 1rpx rgba(169, 118, 28, 0.35);
}

.option-card.is-ratio-4 .ratio-glyph {
  width: 50rpx;
  height: 38rpx;
  background: #eceaf6;
  box-shadow: inset 0 0 0 1rpx rgba(89, 91, 220, 0.35);
}

.ratio-value {
  font-weight: 700;
}

.ratio-label {
  color: $color-muted;
  font-size: 22rpx;
}

.next-icon {
  margin-left: 8rpx;
  font-size: 26rpx;
}
</style>
