<template>
  <view class="comparison">
    <view v-if="originalSource" class="comparison-frame" :style="{ '--split': `${position}%` }">
      <image class="comparison-image" :src="resultUrl" mode="aspectFit" @error="handleImageError" />
      <image class="comparison-image comparison-original" :src="originalSource" mode="aspectFit" @error="handleOriginalError" />
      <text class="comparison-label is-original">原图</text>
      <text class="comparison-label is-result">优化后</text>
      <view class="comparison-divider"></view>
    </view>
    <text v-else class="comparison-hint">{{ loading ? "正在加载原图…" : "原图暂不可用，仍可查看优化结果" }}</text>
    <image v-if="!originalSource" class="comparison-fallback" :src="resultUrl" mode="aspectFit" />
    <slider v-if="originalSource" :value="position" :min="0" :max="100" active-color="#b8864e" @changing="changePosition" @change="changePosition" />
    <text v-if="imageError" class="comparison-hint">图片加载失败，请检查网络或稍后重试</text>
  </view>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from "vue";

import { API_BASE_URL } from "@/apis/config";
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

const position = ref(50);
const downloadedUrl = ref("");
const loading = ref(false);
const imageError = ref(false);
const originalFailed = ref(false);
const originalSource = computed(() =>
  originalFailed.value ? "" : props.originalUrl || downloadedUrl.value
);
let downloadTask = null;
let generation = 0;

/**
 * 同步滑块位置。
 * @param {Object} event 滑块事件。
 * @returns {void}
 */
const changePosition = (event) => {
  position.value = Number(event.detail.value);
};

// 记录图片加载失败状态。
const handleImageError = () => {
  imageError.value = true;
};

// 原图失效时回退为结果图。
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
  if (!token) return;
  const current = generation;
  loading.value = true;
  downloadTask = uni.downloadFile({
    url: `${API_BASE_URL}/uploads/images/${encodeURIComponent(id)}`,
    header: { Authorization: `Bearer ${token}` },
    success: (result) => {
      if (current === generation && result.statusCode === 200) downloadedUrl.value = result.tempFilePath;
    },
    complete: () => {
      if (current === generation) {
        loading.value = false;
        downloadTask = null;
      }
    },
  });
};

watch(() => [props.originalId, props.originalUrl], ([id]) => loadOriginal(id), { immediate: true });
onUnmounted(cancelDownload);
</script>

<style scoped lang="scss">
.comparison { width: 100%; }

.comparison-frame { position: relative; width: 100%; height: 440rpx; overflow: hidden; border-radius: 20rpx; background: #f8faf7; }

.comparison-image { position: absolute; inset: 0; width: 100%; height: 100%; }

.comparison-original { clip-path: inset(0 0 calc(100% - var(--split)) 0); }

.comparison-divider { position: absolute; top: var(--split); right: 0; left: 0; height: 2px; background: #fff; box-shadow: 0 0 4px #555; pointer-events: none; }

.comparison-label { position: absolute; right: 12rpx; padding: 4rpx 12rpx; border-radius: 8rpx; background: rgba(0, 0, 0, 0.55); color: #fff; font-size: 22rpx; }

.is-original { top: 12rpx; }

.is-result { bottom: 12rpx; }

.comparison-hint { display: block; margin: 12rpx 0; color: #8a6840; font-size: 24rpx; }

.comparison-fallback { width: 100%; height: 440rpx; }

@media (min-width: $breakpoint-desktop) {
  .comparison-frame { height: 380px; }

  .comparison-original { clip-path: inset(0 calc(100% - var(--split)) 0 0); }

  .comparison-divider { top: 0; bottom: 0; left: var(--split); width: 2px; height: auto; }

  .is-original { right: auto; left: 12rpx; }
}
</style>
