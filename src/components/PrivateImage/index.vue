<template>
  <view class="private-image">
    <image
      v-if="source && !failed"
      class="private-image-media"
      :src="source"
      :mode="mode"
      @error="handleImageError"
    />
    <view v-else class="private-image-placeholder">
      <text v-if="!failed">加载中</text>
      <button v-else @tap.stop="loadImage">重试</button>
    </view>
  </view>
</template>

<script setup>
import { onUnmounted, ref, watch } from "vue";

import { API_BASE_URL, IS_API_BASE_URL_VALID, USE_MOCK } from "@/apis/config";
import { getToken } from "@/utils/auth";

/**
 * @property {number|string|null} assetId 图片资源标识。
 * @property {string} mockUrl 模拟环境的图片地址。
 * @property {string} mode 图片裁剪方式。
 */
const props = defineProps({
  assetId: {
    type: [Number, String],
    default: null,
  },
  mockUrl: {
    type: String,
    default: "",
  },
  mode: {
    type: String,
    default: "aspectFill",
  },
});

const source = ref("");
const failed = ref(false);
let downloadTask = null;
let generation = 0;

// 图片资源需要鉴权，先下载到临时文件再展示。
const loadImage = () => {
  const current = ++generation;
  downloadTask?.abort();
  source.value = "";
  failed.value = false;
  if (USE_MOCK) {
    source.value = props.mockUrl;
    failed.value = !props.mockUrl;
    return;
  }
  const token = getToken();
  if (!props.assetId || !token || !IS_API_BASE_URL_VALID) {
    failed.value = true;
    return;
  }
  downloadTask = uni.downloadFile({
    url: `${API_BASE_URL}/uploads/images/${encodeURIComponent(props.assetId)}`,
    header: { Authorization: `Bearer ${token}` },
    success: (result) => {
      if (current !== generation || getToken() !== token) return;
      if (result.statusCode === 200 && result.tempFilePath)
        source.value = result.tempFilePath;
      else failed.value = true;
    },
    fail: () => {
      if (current === generation && getToken() === token) failed.value = true;
    },
  });
};

// 已下载的图片无法解码时允许重新获取。
const handleImageError = () => {
  failed.value = true;
};

watch(() => [props.assetId, props.mockUrl], loadImage, { immediate: true });
onUnmounted(() => {
  generation += 1;
  downloadTask?.abort();
});
</script>

<style scoped lang="scss">
.private-image {
  overflow: hidden;
  background: #f7edde;
}

.private-image-media,
.private-image-placeholder {
  width: 100%;
  height: 100%;
}

.private-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a6840;
  font-size: 20rpx;
}

.private-image-placeholder button {
  margin: 0;
  padding: 0 8rpx;
  background: transparent;
  color: inherit;
  font-size: 20rpx;
  line-height: 1.4;
}
</style>
