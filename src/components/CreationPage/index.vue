<template>
  <view class="creation-page">
    <app-page-header :title="title" />
    <app-step-bar
      v-if="steps.length"
      :steps="steps"
      @step-click="handleStepClick"
    />
    <view class="scroll-window">
      <scroll-view
        scroll-y
        :show-scrollbar="false"
        class="content"
        :style="contentStyle"
      >
        <view class="creation-body">
          <slot></slot>
        </view>
      </scroll-view>
    </view>
    <view class="bottom-bar" :style="footerStyle">
      <slot name="footer"></slot>
    </view>
    <app-bottom-nav active="creation" desktop-only />
    <!-- 弹层挂在页面根部，避免被滚动容器裁剪 -->
    <slot name="overlay"></slot>
  </view>
</template>

<script setup>
import { computed } from "vue";

import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import AppStepBar from "@/components/AppStepBar/index.vue";
import useKeyboardInset from "@/hooks/useKeyboardInset";

/**
 * 创建页面组件。
 * @property {string} title 页面标题。
 * @property {Array<{label: string, state?: string, clickable?: boolean}>} steps
 *   步骤条配置，为空数组时不渲染步骤条。
 */
defineProps({
  title: {
    type: String,
    required: true,
  },
  steps: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["step-click"]);

// 键盘弹出时同步抬高底部操作栏，并给滚动内容预留同等空间
const { keyboardInset } = useKeyboardInset();

const contentStyle = computed(() => ({
  paddingBottom:
    keyboardInset.value > 0 ? `${keyboardInset.value}px` : undefined,
}));

const footerStyle = computed(() => ({
  bottom: keyboardInset.value > 0 ? `${keyboardInset.value}px` : undefined,
}));

/**
 * 将步骤条回调透传给页面。
 * @param {number} index 被点击的步骤下标。
 * @returns {void}
 */
const handleStepClick = (index) => {
  emit("step-click", index);
};
</script>

<style scoped lang="scss">
.creation-page {
  @include flow-shell;
}

.app-page-header {
  flex: none;
}

.scroll-window {
  @include scroll-window;
}

.content {
  @include flow-content;
}

.creation-body {
  padding: 28rpx 0 48rpx;
  min-width: 0;
}

.bottom-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  @include action-bar;
}
</style>
