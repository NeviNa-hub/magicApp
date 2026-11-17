<template>
  <view class="app-image">
    <image
      v-if="!isUnavailable"
      :key="imageKey"
      class="app-image-media"
      :src="src"
      :mode="mode"
      @error="handleError"
    />
    <view v-else class="app-image-fallback">
      <text class="fallback-mark">墨</text>
      <button v-if="failed && src && retryable" class="fallback-retry" @tap.stop="retryImage">
        重新加载
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from "vue";

/**
 * @property {string} src 图片地址，为空时直接展示占位。
 * @property {string} mode 图片裁剪模式，透传给 image。
 * @property {boolean} retryable 图片失败时是否允许重试。
 */
const props = defineProps({
  src: { type: String, default: "" },
  mode: { type: String, default: "aspectFill" },
  retryable: { type: Boolean, default: true },
});

const failed = ref(false);
const imageKey = ref(0);
const isUnavailable = computed(() => failed.value || !props.src);

// 图片地址变化时重置失败状态
watch(
  () => props.src,
  () => {
    failed.value = false;
    imageKey.value += 1;
  }
);

// 记录加载失败，统一改用占位底纹
const handleError = () => {
  failed.value = true;
};
// 重新创建图片组件，重试当前地址。
const retryImage = () => {
  imageKey.value += 1;
  failed.value = false;
};
</script>

<style scoped lang="scss">
.app-image {
  display: block;
  overflow: hidden;
  background: #f8faf7;
}

.app-image-media {
  display: block;
  width: 100%;
  height: 100%;
}

.app-image-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f7edde;
  color: #8a6840;
}

.fallback-retry {
  margin: 8rpx 0 0;
  padding: 4rpx 12rpx;
  border: 1rpx solid currentColor;
  border-radius: 8rpx;
  background: transparent;
  color: inherit;
  font-size: 20rpx;
  line-height: 1.5;

  &::after {
    border: 0;
  }
}

.fallback-mark {
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.3;
}
</style>
