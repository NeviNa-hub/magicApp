<template>
  <creation-page title="视频创作" :steps="steps">
    <view class="flow-body">
      <app-config-card index="壹" title="规制画幅">
        <view class="ratio-list">
          <view
            v-for="(ratio, index) in ratios"
            :key="ratio.ratioId"
            class="ratio-card"
            :class="[
              `is-ratio-${index + 1}`,
              { 'is-selected': formData.ratio === ratio.value },
            ]"
            @click="formData.ratio = ratio.value"
          >
            <text class="ratio-badge">{{ ratio.value }}</text>
            <text class="ratio-name">{{ ratio.name }}</text>
            <text class="ratio-desc">{{ ratio.description }}</text>
            <text v-if="ratio.recommended" class="recommend">推荐</text>
          </view>
        </view>
      </app-config-card>

      <app-config-card index="贰" title="创作模式">
        <view class="mode-switch">
          <view
            v-for="mode in modes"
            :key="mode.modeId"
            class="mode-option"
            :class="{ 'is-active': formData.mode === mode.modeId }"
            @click="formData.mode = mode.modeId"
          >
            <!-- #ifdef H5 -->
            <el-icon>
              <VideoCamera v-if="mode.modeId === 'text'" />
              <PictureFilled v-else />
            </el-icon>
            <!-- #endif -->
            <text>{{ mode.name }}</text>
          </view>
        </view>

        <view v-if="formData.mode === 'image'" class="image-picker">
          <app-image
            v-if="selectedImage"
            class="image-thumb"
            :src="selectedImage.url || selectedImage.path"
            mode="aspectFill"
          />
          <view class="image-copy">
            <text class="image-title">{{ imageTitle }}</text>
            <text class="image-hint">{{ imageHint }}</text>
          </view>
          <button class="image-pick-button" @click="handleChooseImage">
            <!-- #ifdef H5 -->
            <el-icon><Upload /></el-icon>
            <!-- #endif -->
            {{ isUploading ? "上传中…" : selectedImage ? "更换" : "选图" }}
          </button>
          <text v-if="isUploading">{{ uploadProgress === null ? "正在准备图片…" : `上传中 ${uploadProgress}%` }}</text>
          <button v-if="isUploading" @click.stop="cancelUpload">取消上传</button>
          <button v-else-if="canRetryUpload" @click.stop="retryUpload">重试上传</button>
        </view>
      </app-config-card>

      <app-config-card index="叁" title="意境构想">
        <template #extra>
          <button class="prompt-clear" @click="clearPrompt">
            <!-- #ifdef H5 -->
            <el-icon><RefreshLeft /></el-icon>
            <!-- #endif -->
            清空辞藻
          </button>
        </template>
        <textarea
          v-model="formData.prompt"
          :maxlength="promptLimit"
          class="prompt-input"
          placeholder="写下动卷意境，点染光影与运镜"
        />
        <view class="prompt-foot">
          <text class="prompt-count">
            {{ formData.prompt.length }} / {{ promptLimit }}字
          </text>
          <button class="polish-button" @click="polishPrompt">
            <!-- #ifdef H5 -->
            <el-icon><MagicStick /></el-icon>
            <!-- #endif -->
            润色辞藻
          </button>
        </view>

        <view class="suggestion-head">
          <!-- #ifdef H5 -->
          <el-icon><EditPen /></el-icon>
          <!-- #endif -->
          <text>笔墨词枕 · 点击引入灵感</text>
        </view>
        <view class="suggestions">
          <button
            v-for="item in suggestions"
            :key="item"
            class="suggestion-chip"
            @click="appendPrompt(item)"
          >
            <!-- #ifdef H5 -->
            <el-icon><Plus /></el-icon>
            <!-- #endif -->
            <text>{{ item }}</text>
          </button>
        </view>
      </app-config-card>
    </view>

    <template #footer>
      <app-flow-button
        variant="secondary"
        :loading="isSavingDraft"
        @click="saveDraft"
        >保存草稿</app-flow-button
      >
      <app-flow-button block :loading="isSubmitting" @click="goNext">
        下一步：规格画质
        <!-- #ifdef H5 -->
        <el-icon v-if="!isSubmitting" class="next-icon">
          <ArrowRight />
        </el-icon>
        <!-- #endif -->
      </app-flow-button>
    </template>
  </creation-page>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { getEditingDraft, persistEditingDraft } from "@/utils/creation-draft";

// #ifdef H5
import {
  ArrowRight,
  EditPen,
  MagicStick,
  PictureFilled,
  Plus,
  RefreshLeft,
  Upload,
  VideoCamera,
} from "@element-plus/icons-vue";
// #endif

import useImageUpload from "@/hooks/useImageUpload";
import AppConfigCard from "@/components/AppConfigCard/index.vue";
import AppFlowButton from "@/components/AppFlowButton/index.vue";
import AppImage from "@/components/AppImage/index.vue";
import CreationPage from "@/components/CreationPage/index.vue";
import { DRAFT_KEYS, saveCreationDraft } from "@/utils/creation-draft";
import { appendPromptText, polishPromptText } from "@/utils/prompt";
import { getErrorMessage } from "@/utils/request";

const steps = [
  {
    label: "规制与意境",
    state: "active",
  },
  {
    label: "画质与渲染",
    state: "inactive",
  },
];
const ratios = [
  {
    ratioId: 1,
    value: "16:9",
    name: "横屏画卷",
    description: "磅礴画卷",
    recommended: true,
  },
  {
    ratioId: 2,
    value: "9:16",
    name: "竖屏立轴",
    description: "适宜移轴",
  },
  {
    ratioId: 3,
    value: "1:1",
    name: "方正镜心",
    description: "斗方小品",
  },
];
const modes = [{ modeId: "text", name: "文字生视频" }];
const suggestions = ["清溪泛舟", "浮岚暖翠", "寒江雪霁", "竹影摇曳"];
const promptLimit = 1000;
const polishSuffix = "水波微澜，晨雾轻笼，气韵徐徐流转";
const selectedImage = ref(null);
const isSavingDraft = ref(false);
const isSubmitting = ref(false);
const formData = reactive({
  ratio: "16:9",
  mode: "text",
  prompt: "孤舟蓑笠，江雪霏霏，水波微澜，远山在晨雾中徐徐隐退",
  imagePath: "",
});

const imageTitle = computed(() => selectedImage.value?.name || "传入一张图卷");
const imageHint = computed(() =>
  selectedImage.value
    ? "点击更换图卷，将以图卷起点延展运镜"
    : "从相册选择或拍摄，作为动卷起点",
);

/**
 * 将灵感词追加到意境构想，已有内容时用逗号衔接。
 * @param {string} value 待追加的灵感词。
 * @returns {void}
 */
const appendPrompt = (value) => {
  formData.prompt = appendPromptText(formData.prompt, value);
};

// 清空意境构想
const clearPrompt = () => {
  formData.prompt = "";
};

// 在现有意境后追加润色句式，空意境时以寒江雪意起笔
const polishPrompt = () => {
  formData.prompt = polishPromptText(
    formData.prompt.trim(),
    polishSuffix,
    `寒江孤舟，雪意朦胧，水波缓缓流动，${polishSuffix}`,
  );
};

const { isUploading, uploadProgress, canRetryUpload, chooseImage, retryUpload, cancelUpload } = useImageUpload((image) => {
  selectedImage.value = image;
  formData.imagePath = image.path;
});

// 提交任务时禁止更换图片。
const handleChooseImage = () => {
  if (!isSubmitting.value) chooseImage();
};

// 保存视频创作参数。
const saveDraft = async () => {
  if (isSavingDraft.value || !formData.prompt.trim()) return;
  isSavingDraft.value = true;
  try {
    await persistEditingDraft("video", {
      mode: formData.mode,
      ratio: formData.ratio,
      prompt: formData.prompt.trim(),
    });
    uni.showToast({ title: "草稿已保存", icon: "none" });
  } catch {
    uni.showToast({ title: "保存失败", icon: "none" });
  } finally {
    isSavingDraft.value = false;
  }
};

onShow(() => {
  const current = getEditingDraft();
  if (current?.task_type === "video")
    Object.assign(formData, current.input_data);
});

// 校验规制与意境后保存草稿，进入画质与渲染页
const goNext = () => {
  if (isSubmitting.value || isUploading.value) {
    return;
  }

  if (!formData.ratio) {
    uni.showToast({ title: "请先选择画幅", icon: "none" });
    return;
  }

  if (formData.mode === "image" && !formData.imagePath) {
    uni.showToast({ title: "请先传入一张图卷", icon: "none" });
    return;
  }

  if (formData.mode === "text" && !formData.prompt.trim()) {
    uni.showToast({ title: "请先填写意境构想", icon: "none" });
    return;
  }

  const selectedRatioItem = ratios.find(
    (ratio) => ratio.value === formData.ratio,
  );

  isSubmitting.value = true;
  saveCreationDraft(DRAFT_KEYS.video, {
    mode: formData.mode,
    ratio: formData.ratio,
    ratioName: selectedRatioItem?.name || formData.ratio,
    prompt: formData.prompt.trim(),
    imagePath: formData.imagePath,
    uploadId: selectedImage.value?.uploadId || "",
  });
  uni.navigateTo({
    url: "/pages/video-render/index",
    complete: () => {
      isSubmitting.value = false;
    },
  });
};
</script>

<style scoped lang="scss">
.flow-body {
  @include flow-body(2);
}

/* 画幅规制 */
.ratio-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  width: 100%;
}

.ratio-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  width: 100%;
  min-width: 0;
  padding: 24rpx 12rpx 16rpx;
  border: 2rpx solid transparent;
  border-radius: 20rpx;
  background: #f8faf7;
  box-sizing: border-box;
  cursor: pointer;
}

.ratio-badge {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 52rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 700;
}

/* 各画幅徽章的识别色，选中时统一归为主色 */
.ratio-card.is-ratio-1 .ratio-badge {
  background: #e6f2ee;
  color: $color-primary;
}

.ratio-card.is-ratio-2 .ratio-badge {
  background: #f7efdd;
  color: $color-warning;
}

.ratio-card.is-ratio-3 .ratio-badge {
  background: #eceaf6;
  color: #595bdc;
}

.ratio-card.is-selected {
  border-color: $color-primary;
  background: linear-gradient(135deg, #f7edde 0%, #f7faf8 100%);
  box-shadow: 0 0 0 1rpx $color-primary inset;
}

.ratio-card.is-selected .ratio-badge {
  background: $color-primary;
  color: #fff;
}

.ratio-name {
  color: $color-ink;
  font-size: 24rpx;
  font-weight: 700;
}

.ratio-card.is-selected .ratio-name {
  color: $color-primary;
}

.ratio-desc {
  color: $color-muted;
  font-size: 22rpx;
  line-height: 1.3;
  @include text-ellipsis;
}

.recommend {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  background: #9dff3d;
  color: #1c5e09;
  font-size: 18rpx;
  line-height: 1.5;
}

/* 创作模式 */
.mode-switch {
  display: flex;
  gap: 8rpx;
  width: 100%;
  padding: 8rpx;
  border-radius: 20rpx;
  background: $color-primary-light;
  box-sizing: border-box;
}

.mode-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 76rpx;
  border-radius: 16rpx;
  color: #4e665e;
  font-size: 24rpx;
}

.mode-option.is-active {
  background: $color-surface;
  color: $color-primary;
  font-weight: 700;
  box-shadow: 0 4rpx 12rpx rgba(5, 96, 76, 0.08);
}

.mode-option .el-icon {
  font-size: 22rpx;
}

/* 图卷选择 */
.image-picker {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 20rpx;
  padding: 20rpx 24rpx;
  border: 2rpx dashed #bfd8ce;
  border-radius: 20rpx;
  background: $color-surface;
}

.image-thumb {
  flex-shrink: 0;
  width: 104rpx;
  height: 78rpx;
  border-radius: 8rpx;
}

.image-copy {
  flex: 1;
  min-width: 0;
}

.image-title {
  display: block;
  overflow: hidden;
  color: $color-ink;
  font-size: 26rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-hint {
  display: block;
  margin-top: 8rpx;
  color: $color-muted;
  font-size: 22rpx;
  line-height: 1.6;
}

.image-pick-button {
  @include tap-area(72rpx);
  flex-shrink: 0;
  height: 72rpx;
  margin: 0;
  padding: 0 16rpx;
  border: 1rpx solid #bfd8ce;
  border-radius: 12rpx;
  background: #f8faf7;
  color: $color-primary-deep;
  font-size: 22rpx;
  line-height: 1;
}

.image-pick-button:after {
  border: 0;
}

/* 意境构想 */
.prompt-clear {
  @include tap-area(56rpx);
  flex-shrink: 0;
  height: 56rpx;
  margin: 0;
  padding: 0 8rpx;
  border: 0;
  background: transparent;
  color: $color-muted;
  font-size: 24rpx;
  line-height: 1;
}

.prompt-clear:after {
  border: 0;
}

.prompt-input {
  width: 100%;
  height: 210rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f8faf7;
  box-sizing: border-box;
  color: $color-ink;
  font-size: 28rpx;
  line-height: 1.6;
}

.prompt-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.prompt-count {
  color: $color-muted;
  font-size: 22rpx;
  @include numeric;
}

.polish-button {
  @include tap-area(64rpx);
  height: 64rpx;
  margin: 0;
  padding: 0 24rpx;
  border: 0;
  border-radius: 16rpx;
  background: #f3e4cd;
  color: $color-primary;
  font-size: 22rpx;
  line-height: 1;
}

.polish-button:after {
  border: 0;
}

/* 灵感词枕 */
.suggestion-head {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin: 24rpx 8rpx 0;
  color: $color-primary-deep;
  font-size: 24rpx;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.suggestion-chip {
  @include tap-area(64rpx);
  gap: 6rpx;
  height: 64rpx;
  margin: 0;
  padding: 0 16rpx;
  border: 1rpx solid $color-line;
  border-radius: 16rpx;
  background: $color-surface;
  color: #4e665e;
  font-size: 22rpx;
  font-weight: 400;
  line-height: 1;
}

.suggestion-chip:after {
  border: 0;
}

.next-icon {
  font-size: 22rpx;
}

@media (min-width: $breakpoint-desktop) {
  /* 意境构想卡内容最多，桌面端占满整行 */
  .flow-body > :nth-child(3) {
    grid-column: 1 / -1;
  }
}
</style>
