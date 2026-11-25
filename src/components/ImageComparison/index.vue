<template>
  <view class="comparison">
    <view class="comparison-tabs">
      <button :class="{ 'is-active': showOriginal }" @tap="showOriginal = true">
        原图
      </button>
      <button :class="{ 'is-active': !showOriginal }" @tap="showOriginal = false">
        优化后
      </button>
    </view>
    <view class="comparison-preview">
      <image
        v-if="showOriginal && originalSource"
        :key="`original-${imageVersion}`"
        class="comparison-image"
        :src="originalSource"
        mode="aspectFit"
        @error="handleOriginalError"
      />
      <text v-else-if="showOriginal" class="comparison-hint">
        {{ loading ? "正在加载原图…" : "原图暂不可用" }}
      </text>
      <image
        v-else-if="!imageError"
        :key="`result-${imageVersion}`"
        class="comparison-image"
        :src="resultUrl"
        mode="aspectFit"
        @load="imageError = false"
        @error="handleImageError"
      />
      <text v-if="!showOriginal && imageError" class="comparison-hint">
        图片加载失败，请检查网络或稍后重试
      </text>
      <button
        v-if="showOriginal ? originalFailed && !loading : imageError"
        class="fallback-retry"
        @tap.stop="retryImages"
      >
        重新加载
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from "vue";

import { API_BASE_URL, IS_API_BASE_URL_VALID } from "@/apis/config";
import { getToken } from "@/utils/auth";

/**
 * 图片优化对比。
 * @property {string} originalUrl 已选原图的本地地址。
 * @property {string} originalId 本人上传资源标识。
 * @property {string} resultUrl 优化结果地址。
 */
const props = defineProps({
  originalUrl: { type: String, default: "" },
  originalId: { type: String, default: "" },
  resultUrl: { type: String, default: "" },
});

const showOriginal = ref(false);
const downloadedUrl = ref("");
const loading = ref(false);
const imageError = ref(false);
const originalFailed = ref(false);
const imageVersion = ref(0);
const originalSource = computed(() =>
  originalFailed.value ? "" : props.originalUrl || downloadedUrl.value,
);
let downloadTask = null;
let generation = 0;

// 记录图片加载失败状态。
const handleImageError = () => {
  imageError.value = true;
};

// 记录原图加载失败状态。
const handleOriginalError = () => {
  originalFailed.value = true;
};

// 取消旧的原图下载，防止旧结果覆盖当前作品。
const cancelDownload = () => {
  generation += 1;
  downloadTask?.abort();
  downloadTask = null;
};

/**
 * 带登录凭据下载本人原图，不把凭据放入地址。
 * @param {string} id 上传资源标识。
 * @returns {void}
 */
const loadOriginal = (id) => {
  cancelDownload();
  downloadedUrl.value = "";
  imageError.value = false;
  originalFailed.value = false;
  loading.value = false;
  if (!id || props.originalUrl || !/^[1-9]\d*$/.test(id)) return;
  const token = getToken();
  if (!token || !IS_API_BASE_URL_VALID) {
    originalFailed.value = true;
    return;
  }
  const current = generation;
  loading.value = true;
  downloadTask = uni.downloadFile({
    url: `${API_BASE_URL}/uploads/images/${encodeURIComponent(id)}`,
    header: { Authorization: `Bearer ${token}` },
    success: (result) => {
      if (current !== generation || getToken() !== token) return;
      if (result.statusCode === 200 && result.tempFilePath)
        downloadedUrl.value = result.tempFilePath;
      else originalFailed.value = true;
    },
    fail: () => {
      if (current === generation && getToken() === token)
        originalFailed.value = true;
    },
    complete: () => {
      if (current === generation) {
        loading.value = false;
        downloadTask = null;
      }
    },
  });
};

// 重新加载当前选中的图片。
const retryImages = () => {
  imageVersion.value += 1;
  if (showOriginal.value) loadOriginal(props.originalId);
  else imageError.value = false;
};

watch(
  () => [props.originalId, props.originalUrl],
  ([id]) => loadOriginal(id),
  { immediate: true },
);
watch(
  () => props.resultUrl,
  () => {
    imageError.value = false;
    imageVersion.value += 1;
  },
);
onUnmounted(cancelDownload);
</script>

<style scoped lang="scss">
.comparison {
  width: 100%;
}

.comparison-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;

  button {
    flex: 1;
    margin: 0;
    border-radius: 12rpx;
    background: #f8f4ef;
    color: #745530;
    font-size: 26rpx;

    &.is-active {
      background: #89663e;
      color: #fff;
    }
  }
}

.comparison-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  height: 440rpx;
  overflow: hidden;
  border-radius: 20rpx;
  background: #f8faf7;

  .comparison-image {
    width: 100%;
    height: 100%;
  }

  .comparison-hint {
    padding: 0 24rpx;
    color: #8a6840;
    font-size: 24rpx;
    text-align: center;
  }

  .fallback-retry {
    @include image-retry-button;
  }
}

@media (min-width: $breakpoint-desktop) {
  .comparison-preview {
    height: var(--detail-preview-height, 380px);
  }
}
</style>
