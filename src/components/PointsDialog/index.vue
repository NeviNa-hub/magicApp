<template>
  <app-bottom-sheet
    v-if="modelValue"
    title="积分使用流水"
    placement="center"
    align="left"
    show-close
    @close="closeDialog"
  >
    <view class="points-summary">
      <view class="summary-item">
        <text class="summary-label">当前余额</text>
        <text class="summary-value">{{ pointsText }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">已使用</text>
        <text class="summary-value">{{ usedPointsText }}</text>
      </view>
    </view>

    <app-state-hint
      v-if="isLoading"
      class="points-state"
      type="loading"
      title="正在载入积分流水"
    />
    <app-state-hint
      v-else-if="loadError"
      class="points-state"
      type="error"
      title="积分流水加载失败"
      description="请检查网络后重试"
      action-text="重新加载"
      @action="loadPointsInfo"
    />
    <scroll-view v-else-if="items.length" scroll-y class="points-list">
      <view v-for="item in items" :key="item.ledger_id" class="points-item">
        <view class="points-item-details">
          <text class="points-item-reason">
            {{ reasonText(item.reason) }}
          </text>
          <text class="points-item-time">
            {{ formatDateTime(item.created_at) }}
          </text>
        </view>
        <text class="points-item-value" :class="{ 'is-used': item.delta < 0 }">
          {{ item.delta > 0 ? "+" + item.delta : item.delta }}
        </text>
      </view>
      <button
        v-if="items.length < total"
        class="points-more"
        :disabled="isLoadingMore"
        @tap="loadMorePoints"
      >
        {{
          isLoadingMore
            ? "加载中…"
            : moreError
              ? "加载失败，点击重试"
              : "加载更多"
        }}
      </button>
    </scroll-view>
    <app-state-hint
      v-else
      class="points-state"
      type="empty"
      title="暂无积分流水"
      description="完成创作或消耗灵感点后会记录在这里"
    />
  </app-bottom-sheet>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from "vue";

import { getPointsInfo } from "@/apis/points";
import AppBottomSheet from "@/components/AppBottomSheet/index.vue";
import AppStateHint from "@/components/AppStateHint/index.vue";
import { pointsState, setPointsBalance } from "@/stores";
import { formatDateTime } from "@/utils/date";

const POINTS_PAGE_SIZE = 20;

/**
 * @property {boolean} modelValue 是否展示积分流水弹窗。
 */
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:modelValue"]);

const items = ref([]);
const isLoading = ref(false);
const loadError = ref(false);
const isLoadingMore = ref(false);
const moreError = ref(false);
const currentPage = ref(0);
const total = ref(0);
let requestVersion = 0;

/**
 * 将流水原因转换为易读文案。
 * @param {string} reason 流水原因。
 * @returns {string} 展示文案。
 */
const reasonText = (reason) => {
  const labels = {
    image_generation: "文字生图",
    image_optimization: "图片优化",
    video_generation: "视频创作",
    task_retry_charge: "任务重试",
    task_cancel_refund: "取消任务退款",
    task_fail_refund: "任务失败退款",
  };
  return labels[reason] || "积分变动";
};

const pointsText = computed(() =>
  pointsState.balance === null ? "—" : pointsState.balance,
);
const usedPointsText = computed(() =>
  pointsState.usedPoints === null ? "—" : pointsState.usedPoints,
);

/**
 * 加载灵感点流水，并回填共享的余额缓存。
 * @returns {Promise<void>}
 */
const loadPointsInfo = async () => {
  const version = ++requestVersion;
  isLoading.value = true;
  loadError.value = false;
  moreError.value = false;
  isLoadingMore.value = false;
  currentPage.value = 0;
  total.value = 0;
  items.value = [];

  try {
    const data = await getPointsInfo(
      { page: 1, page_size: POINTS_PAGE_SIZE },
      { silent: true },
    );
    if (version !== requestVersion) return;

    setPointsBalance({
      balance: data.points_balance,
      usedPoints: data.used_points,
    });
    items.value = data.items;
    currentPage.value = data.page;
    total.value = data.total;
  } catch {
    if (version === requestVersion) loadError.value = true;
  } finally {
    if (version === requestVersion) isLoading.value = false;
  }
};

// 分页读取更多流水，失败时保留已有记录。
const loadMorePoints = async () => {
  if (isLoadingMore.value || items.value.length >= total.value) return;
  const version = requestVersion;
  isLoadingMore.value = true;
  moreError.value = false;
  try {
    const data = await getPointsInfo(
      { page: currentPage.value + 1, page_size: POINTS_PAGE_SIZE },
      { silent: true },
    );
    if (version !== requestVersion) return;
    const knownIds = new Set(items.value.map((item) => item.ledger_id));
    items.value = items.value.concat(
      data.items.filter((item) => !knownIds.has(item.ledger_id)),
    );
    currentPage.value = data.page;
    total.value = data.total;
  } catch {
    if (version === requestVersion) moreError.value = true;
  } finally {
    if (version === requestVersion) isLoadingMore.value = false;
  }
};

// 关闭弹窗并通知父级同步显隐
const closeDialog = () => {
  requestVersion += 1;
  emit("update:modelValue", false);
};

// 每次打开都拉取最新流水，避免展示缓存中的旧记录
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      loadPointsInfo();
    } else {
      requestVersion += 1;
    }
  },
  { immediate: true },
);
onUnmounted(() => {
  requestVersion += 1;
});
</script>

<style scoped lang="scss">
.points-summary {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.summary-item {
  flex: 1;
  padding: 20rpx;
  border-radius: 20rpx;
  background: #f8faf7;
}

.summary-label {
  display: block;
  color: $color-muted;
  font-size: 24rpx;
}

.summary-value {
  display: block;
  margin-top: 12rpx;
  color: $color-primary;
  font-size: 30rpx;
  font-weight: 700;
  @include numeric;
}

.points-state {
  margin-top: 24rpx;
}

.points-list {
  margin-top: 16rpx;
  height: 40vh;
}

.points-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $color-line;
}

.points-item-details {
  flex: 1;
  min-width: 0;
}

.points-item-reason,
.points-item-time {
  display: block;
  color: #4e665e;
  font-size: 24rpx;
  line-height: 1.6;
  @include text-ellipsis;
}

.points-more {
  margin: 16rpx 0;
  font-size: 24rpx;
}

.points-item-value {
  flex-shrink: 0;
  margin-left: 16rpx;
  color: $color-primary;
  font-size: 30rpx;
  font-weight: 700;
  @include numeric;

  &.is-used {
    color: $color-danger;
  }
}
</style>
