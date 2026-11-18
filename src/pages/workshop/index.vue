<template>
  <view class="workshop-page">
    <app-page-header title="工作坊" />
    <scroll-view scroll-y class="content">
      <view class="heading">创作模板</view>
      <view class="intro">选择灵感，带入创作页面后可以继续修改</view>
      <view class="filters">
        <button
          v-for="item in filters"
          :key="item.value"
          :class="{ active: selectedType === item.value }"
          @tap="changeType(item.value)"
        >
          {{ item.label }}
        </button>
      </view>
      <app-state-hint v-if="isLoading" type="loading" title="正在加载模板" />
      <app-state-hint
        v-else-if="hasError"
        type="error"
        title="模板加载失败"
        action-text="重新加载"
        @action="loadTemplates"
      />
      <app-state-hint v-else-if="!templates.length" title="暂无模板" />
      <view v-else class="template-list">
        <view v-for="item in templates" :key="item.id" class="template-card">
          <view class="template-type">
            {{ item.type === "image" ? "文字生图" : "视频创作" }}
          </view>
          <view class="template-title">{{ item.title }}</view>
          <view class="template-description">{{ item.description }}</view>
          <view class="template-prompt">{{ item.params.prompt }}</view>
          <button class="use-button" @tap="useTemplate(item)">使用同款</button>
        </view>
      </view>
    </scroll-view>
    <app-bottom-nav active="workshop" />
  </view>
</template>

<script setup>
import { onUnmounted, ref } from "vue";

import { getTemplates } from "@/apis/templates";
import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import AppStateHint from "@/components/AppStateHint/index.vue";
import {
  clearEditingDraft,
  DRAFT_KEYS,
  saveCreationDraft,
} from "@/utils/creation-draft";

const filters = [
  {
    value: "all",
    label: "全部",
  },
  {
    value: "image",
    label: "文字生图",
  },
  {
    value: "video",
    label: "视频创作",
  },
];
const selectedType = ref("all");
const templates = ref([]);
const isLoading = ref(false);
const hasError = ref(false);
let requestVersion = 0;

// 切换分类时忽略已过期的查询结果。
const loadTemplates = async () => {
  const version = ++requestVersion;
  isLoading.value = true;
  hasError.value = false;
  try {
    const data = await getTemplates({ type: selectedType.value });
    if (version === requestVersion) templates.value = data.items;
  } catch {
    if (version === requestVersion) hasError.value = true;
  } finally {
    if (version === requestVersion) isLoading.value = false;
  }
};

/**
 * 按创作类型筛选模板。
 * @param {string} type 创作类型。
 * @returns {void}
 */
const changeType = (type) => {
  if (selectedType.value === type) return;
  selectedType.value = type;
  loadTemplates();
};

/**
 * 带入模板参数，进入对应创作页面。
 * @param {Object} item 模板数据。
 * @returns {void}
 */
const useTemplate = (item) => {
  if (!DRAFT_KEYS[item.type]) return;
  clearEditingDraft();
  saveCreationDraft(DRAFT_KEYS[item.type], { ...item.params });
  const url =
    item.type === "image"
      ? "/pages/image-creation/index?template=1"
      : "/pages/video-creation/index?template=1";
  uni.navigateTo({ url });
};

loadTemplates();
onUnmounted(() => {
  requestVersion += 1;
});
</script>

<style scoped lang="scss">
.workshop-page {
  @include page-shell;
}

.content {
  box-sizing: border-box;
  height: calc(100vh - 200rpx - var(--status-bar-height, 0px));
  padding: 32rpx;
}

.heading {
  color: $color-primary-deep;
  font-size: 36rpx;
  font-weight: 700;
}

.intro {
  margin: 8rpx 0 24rpx;
  color: $color-muted;
  font-size: 26rpx;
}

.filters {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.filters button {
  margin: 0;
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  background: #fff;
  color: $color-primary-deep;
  font-size: 25rpx;
  line-height: 1.8;
}

.filters button.active {
  background: #b98349;
  color: #fff;
}

.template-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20rpx;
}

.template-card {
  min-width: 0;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #fff;
}

.template-type,
.template-description {
  color: $color-muted;
  font-size: 24rpx;
}

.template-title {
  margin: 12rpx 0;
  color: $color-primary-deep;
  font-size: 32rpx;
  font-weight: 600;
}

.template-prompt {
  min-height: 72rpx;
  margin: 20rpx 0;
  color: #536960;
  font-size: 26rpx;
}

.use-button {
  background: #b98349;
  color: #fff;
  font-size: 26rpx;
}
</style>
