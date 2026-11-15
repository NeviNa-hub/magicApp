<template>
  <view class="task-detail">
    <app-page-header title="作品详情" />
    <scroll-view scroll-y :show-scrollbar="false" class="detail-content">
      <view class="detail-body">
        <view
          class="detail-card"
          :class="{ 'has-result': isCompleted && resultUrl }"
        >
          <view class="detail-head">
            <view class="detail-title-group">
              <text class="detail-heading">{{ typeConfig.progressTitle }}</text>
              <text class="detail-status" :class="statusTag.className">
                {{ statusTag.text }}
              </text>
            </view>
            <text class="detail-cost">{{ costText }}</text>
          </view>
          <text v-if="title" class="detail-work">{{ title }}</text>
          <template v-if="isCompleted && resultUrl">
            <video
              v-if="currentType === 'video'"
              class="result-video"
              :src="resultUrl"
              controls
            />
            <image
              v-else
              class="result-image"
              :src="resultUrl"
              mode="aspectFit"
              @tap="previewResult"
            />
            <text class="result-hint">{{ typeConfig.resultHint }}</text>
          </template>
          <!-- 进度中展示进度环，任务结束后展示状态标签与提示 -->
          <template v-else-if="!isFinished">
            <view class="progress-ring">
              <text> {{ progress }}<text class="progress-unit">%</text> </text>
              <label>{{ progressLabel }}</label>
            </view>
            <view class="progress-track"
              ><view :style="{ width: `${progress}%` }"></view
            ></view>
          </template>
          <view v-if="tip" class="detail-tip">{{ tip }}</view>
          <view v-if="canCancel" class="detail-task-action">
            <app-flow-button
              variant="danger"
              block
              :loading="isCanceling"
              @click="cancelTask"
            >
              {{ isCanceling ? "正在取消…" : "取消创作" }}
            </app-flow-button>
          </view>
          <view v-else-if="isFailed" class="detail-task-action">
            <app-flow-button block :loading="isRetrying" @click="retryTask">
              {{ retryActionText }}
            </app-flow-button>
          </view>
        </view>
      </view>
    </scroll-view>
    <view class="detail-actions">
      <app-flow-button block @click="handleLibraryAction">
        {{ libraryActionText }}
      </app-flow-button>
      <app-flow-button
        variant="secondary"
        block
        class="secondary-action"
        @click="goWorkbench"
      >
        返回工作台
      </app-flow-button>
    </view>
    <app-bottom-nav active="works" desktop-only />
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import { TASK_STATUS } from "@/apis/constants";
import { getImageOptimizationTaskStatus } from "@/apis/image-optimization";
import { getImageTaskStatus } from "@/apis/text-to-image";
import { getVideoTaskStatus } from "@/apis/video-creation";
import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppFlowButton from "@/components/AppFlowButton/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import useTaskActions from "@/hooks/useTaskActions";
import useTaskPolling from "@/hooks/useTaskPolling";
import { getErrorMessage, isApiError } from "@/utils/request";
import {
  buildFailureNote,
  getTaskRefundPoints,
  getTaskRetryCost,
} from "@/utils/task-refund";

/**
 * 任务详情组件。
 * @property {string} taskId 任务公开标识，用于查询进度与结果。
 * @property {string} type 任务类型：image、optimization 或 video。
 * @property {string} title 作品标题，为空时不展示。
 * @property {"creation" | "library"} from 入口来源，决定作品库按钮的文案与返回方式。
 */
const props = defineProps({
  taskId: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "image",
  },
  title: {
    type: String,
    default: "",
  },
  from: {
    type: String,
    default: "creation",
  },
});

const TYPE_CONFIGS = {
  image: {
    progressTitle: "研墨成画",
    progressLabel: "气韵流转",
    cost: 2,
    resultHint: "轻触图片放大查看；图片链接约 1 小时后失效，请及时保存",
  },
  optimization: {
    progressTitle: "淬炼重绘",
    progressLabel: "气韵流转",
    cost: 1,
    resultHint: "轻触图片放大查看；图片链接约 1 小时后失效，请及时保存",
  },
  video: {
    progressTitle: "动卷渲染",
    progressLabel: "逐帧渲染",
    cost: 5,
    resultHint: "视频链接可能过期，请及时保存",
  },
};
const STATUS_TAGS = {
  [TASK_STATUS.PENDING]: { text: "创作中", className: "is-processing" },
  [TASK_STATUS.PROCESSING]: { text: "创作中", className: "is-processing" },
  [TASK_STATUS.COMPLETED]: { text: "创作完成", className: "is-completed" },
  [TASK_STATUS.FAILED]: { text: "创作失败", className: "is-failed" },
  [TASK_STATUS.CANCELED]: { text: "已取消", className: "is-canceled" },
};
const TASK_FETCHERS = {
  image: getImageTaskStatus,
  optimization: getImageOptimizationTaskStatus,
  video: getVideoTaskStatus,
};

const currentType = ref(
  Object.prototype.hasOwnProperty.call(TYPE_CONFIGS, props.type)
    ? props.type
    : "image",
);
const status = ref(TASK_STATUS.PENDING);
const progress = ref(0);
const resultUrl = ref("");
const failureMessage = ref("");
const costPoints = ref(null);
const refundPoints = ref(0);
const retryCostPoints = ref(0);

const typeConfig = computed(() => TYPE_CONFIGS[currentType.value]);
const displayCost = computed(() => costPoints.value ?? typeConfig.value.cost);
const statusTag = computed(
  () => STATUS_TAGS[status.value] || STATUS_TAGS[TASK_STATUS.PENDING],
);
const isCompleted = computed(() => status.value === TASK_STATUS.COMPLETED);
const isFailed = computed(() => status.value === TASK_STATUS.FAILED);
const isCanceled = computed(() => status.value === TASK_STATUS.CANCELED);
const canCancel = computed(
  () =>
    status.value === TASK_STATUS.PENDING ||
    status.value === TASK_STATUS.PROCESSING,
);
const isFinished = computed(
  () => isCompleted.value || isFailed.value || isCanceled.value,
);
const progressLabel = computed(() => {
  if (isCompleted.value) {
    return "生成完成";
  }

  if (isFailed.value) {
    return "生成失败";
  }

  if (isCanceled.value) {
    return "已取消创作";
  }

  return typeConfig.value.progressLabel;
});
const tip = computed(() => {
  if (isFailed.value) {
    return failureMessage.value || "任务处理失败，请返回重新尝试。";
  }

  if (isCanceled.value) {
    return refundPoints.value > 0
      ? `创作已取消，本次消耗的 ${refundPoints.value} 积分已退回。`
      : "创作已取消。";
  }

  if (isFinished.value) {
    return "";
  }

  return "已进入云端处理，离开页面不影响任务进度。";
});
const retryActionText = computed(() => {
  if (isRetrying.value) {
    return "正在重试…";
  }

  return retryCostPoints.value > 0
    ? `重试创作（扣 ${retryCostPoints.value} 积分）`
    : "重试创作";
});
// 失败或取消且已退款时展示退回金额，重试后重新扣费则恢复为消耗金额
const costText = computed(() => {
  if ((isFailed.value || isCanceled.value) && refundPoints.value > 0) {
    return `已退回 ${refundPoints.value} 积分`;
  }

  return `消耗 ${displayCost.value} 积分`;
});
const libraryActionText = computed(() =>
  props.from === "library" ? "返回作品库" : "前往作品库查看进度",
);

/**
 * 任务查询接口统一返回任务类型，据此纠正入口未传或传错的类型。
 * @param {Object} data 任务状态数据。
 * @returns {void}
 */
const syncTaskType = (data) => {
  if (Object.prototype.hasOwnProperty.call(TYPE_CONFIGS, data.task_type)) {
    currentType.value = data.task_type;
  }
};

/**
 * 状态接口返回实际扣费，优先展示；旧任务缺少该字段时沿用类型默认值。
 * @param {Object} data 任务状态数据。
 * @returns {void}
 */
const syncTaskCost = (data) => {
  if (typeof data.cost_points === "number") {
    costPoints.value = data.cost_points;
  }
};

/**
 * 同步退款金额与重试费用，供取消提示和重试按钮展示。
 * @param {Object} data 任务状态数据。
 * @returns {void}
 */
const syncTaskBilling = (data) => {
  refundPoints.value = getTaskRefundPoints(data);
  retryCostPoints.value = getTaskRetryCost(data);
};

// 按任务类型选择状态查询接口，三类任务共用同一个查询地址
const fetchTaskStatus = () =>
  TASK_FETCHERS[currentType.value]({ taskId: props.taskId });

const { start: startPolling, stop: stopPolling } = useTaskPolling({
  fetchTask: fetchTaskStatus,
  interval: 3000,
  maxAttempts: 60,
  isCompleted: (data) => data.status === TASK_STATUS.COMPLETED,
  isFailed: (data) => data.status === TASK_STATUS.FAILED,
  isCanceled: (data) => data.status === TASK_STATUS.CANCELED,
  onProgress: (data) => {
    syncTaskType(data);
    syncTaskCost(data);
    syncTaskBilling(data);
    status.value = data.status || TASK_STATUS.PROCESSING;
    progress.value = Number(data.progress) || 0;

    if (data.result_urls?.[0]) {
      resultUrl.value = data.result_urls[0];
    }
  },
  onCompleted: (data) => {
    syncTaskType(data);
    syncTaskCost(data);
    syncTaskBilling(data);
    status.value = TASK_STATUS.COMPLETED;
    progress.value = 100;
    resultUrl.value = data.result_urls?.[0] || "";
  },
  onFailed: (error, data) => {
    const isRequestError = isApiError(error);

    if (data) {
      syncTaskType(data);
      syncTaskCost(data);
      syncTaskBilling(data);
    }

    status.value = TASK_STATUS.FAILED;
    failureMessage.value = isRequestError
      ? "任务状态查询失败，请稍后在作品库确认结果。"
      : buildFailureNote(
          data,
          getErrorMessage(error, "任务进度获取失败，请稍后重试"),
        );

    if (!isRequestError) {
      uni.showToast({
        title: data?.error_message || failureMessage.value,
        icon: "none",
      });
    }
  },
  onCanceled: (data) => applyCanceledState(data),
});

/**
 * 取消成功后停止轮询并展示已取消状态。
 * @param {Object} [data] 取消接口返回的任务状态。
 * @returns {void}
 */
const applyCanceledState = (data = {}) => {
  stopPolling();
  syncTaskCost(data);
  syncTaskBilling(data);
  status.value = TASK_STATUS.CANCELED;
  progress.value = Number(data.progress) || progress.value;
  resultUrl.value = "";
  failureMessage.value = "";
};

const { cancelTask, retryTask, isCanceling, isRetrying } = useTaskActions({
  getTaskId: () => props.taskId,
  getRetryCost: () => retryCostPoints.value,
  onCanceled: (data) => applyCanceledState(data),
  onRetried: (data) => {
    syncTaskCost(data);
    syncTaskBilling(data);
    status.value = TASK_STATUS.PENDING;
    progress.value = Number(data?.progress) || 0;
    resultUrl.value = "";
    failureMessage.value = "";
    startPolling();
  },
});

// 预览生成结果大图
const previewResult = () => {
  if (!resultUrl.value) {
    return;
  }

  uni.previewImage({ urls: [resultUrl.value] });
};

// 从作品库进入时返回上一页，避免把作品库重复压入页面栈
const handleLibraryAction = () => {
  if (props.from === "library" && getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }

  if (props.from === "library") {
    uni.reLaunch({ url: "/pages/library/index" });
    return;
  }

  uni.navigateTo({ url: "/pages/library/index" });
};

// 返回创作台
const goWorkbench = () => {
  uni.reLaunch({ url: "/pages/workbench/index" });
};

onMounted(() => {
  if (!props.taskId) {
    uni.showToast({ title: "缺少任务标识", icon: "none" });
    return;
  }

  startPolling();
});
</script>

<style scoped lang="scss">
.task-detail {
  @include page-shell;
}

.detail-content {
  height: calc(100vh - #{100rpx} - var(--status-bar-height, 0px));
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  padding: 28rpx 32rpx;
  padding-bottom: calc(250rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(250rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* 详情模块整体垂直居中，内容较矮时不在顶部留出大片空白 */
.detail-body {
  width: 100%;
  margin: auto 0;
}

.detail-card {
  padding: 36rpx 40rpx 40rpx;
  border-radius: 32rpx;
  background: $color-surface;
  box-shadow: 0 10rpx 30rpx rgba(95, 133, 117, 0.06);
  text-align: center;
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.detail-title-group {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}

.detail-heading {
  overflow: hidden;
  color: $color-ink;
  font-size: 34rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-status {
  flex-shrink: 0;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  line-height: 1.6;

  &.is-processing {
    background: #fdf6e8;
    color: #b8864e;
  }

  &.is-completed {
    background: #e8f6ee;
    color: #2f8f5b;
  }

  &.is-failed {
    background: #fdeeee;
    color: $color-danger;
  }

  &.is-canceled {
    background: #f1f2f1;
    color: $color-muted;
  }
}

.detail-cost {
  flex-shrink: 0;
  padding: 8rpx 20rpx;
  border: 1rpx solid #86e5dc;
  border-radius: 999rpx;
  color: $color-primary;
  font-size: 22rpx;
  line-height: 1.4;
  @include numeric;
}

.detail-work {
  display: block;
  margin-top: 16rpx;
  color: $color-muted;
  font-size: 24rpx;
  line-height: 1.5;
  text-align: left;
  @include text-ellipsis;
}

.progress-ring {
  margin: 48rpx auto 0;
  width: 240rpx;
  height: 240rpx;
  border: 2rpx dashed #abd9d5;
  border-radius: 50%;
  background: rgba(228, 241, 238, 0.45);
  text-align: center;
}

.progress-ring text {
  display: block;
  margin-top: 68rpx;
  color: $color-ink;
  font-size: 68rpx;
  font-weight: 700;
  @include numeric;
}

.progress-unit {
  color: $color-primary;
  font-size: 26rpx;
}

.progress-ring label {
  display: block;
  margin-top: 8rpx;
  color: #4e665e;
  font-size: 24rpx;
}

.progress-track {
  height: 12rpx;
  margin-top: 48rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: #edf2ef;
}

.progress-track view {
  height: 100%;
  border-radius: inherit;
  background: $color-primary;
}

.result-image {
  width: 100%;
  height: 440rpx;
  margin-top: 32rpx;
  border-radius: 20rpx;
  background: #f8faf7;
}

.result-video {
  width: 100%;
  height: 440rpx;
  margin-top: 32rpx;
  border-radius: 20rpx;
  background: #000;
}

.result-hint {
  display: block;
  margin-top: 16rpx;
  color: $color-muted;
  font-size: 22rpx;
}

.detail-tip {
  margin-top: 28rpx;
  padding: 16rpx;
  border: 1rpx solid #b8e3d7;
  border-radius: 24rpx;
  background: #f8faf7;
  color: #8a6840;
  font-size: 24rpx;
  line-height: 1.6;
  text-align: center;
}

/* 进度下方的取消/重试入口，与底部固定操作栏区分 */
.detail-task-action {
  margin-top: 24rpx;
}

.detail-task-action button {
  width: 100%;
}

/* 底部固定操作栏须在桌面覆盖规则之前声明，保证样式按预期生效 */
.detail-actions {
  @include action-bar;
}

.secondary-action {
  margin-top: 16rpx;
}

/* ============================================================
 * 桌面 H5 适配：卡片与操作栏使用居中窄栏，页头沿用全局左右贴边布局
 * ============================================================ */
@media (min-width: $breakpoint-desktop) {
  /* 内容区高度固定为页头与操作栏之间，卡片超出时收缩而不是整页滚动 */
  .detail-content {
    max-width: 760px;
    margin: 0 auto;
    padding: 40px 0;
    padding-bottom: calc(120px + env(safe-area-inset-bottom));
  }

  /* scroll-view 内部内容层撑满可视高度，供卡片按剩余空间计算图片高度 */
  .detail-content :deep(.uni-scroll-view-content) {
    height: 100%;
  }

  .detail-body {
    height: 100%;
    margin: 0;
  }

  .detail-card {
    padding: 28px 32px 32px;
    border-radius: 16px;
  }

  .detail-card.has-result {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    box-sizing: border-box;
  }

  .detail-card.has-result .detail-head,
  .detail-card.has-result .detail-work,
  .detail-card.has-result .result-hint {
    flex-shrink: 0;
  }

  .detail-heading {
    font-size: 22px;
  }

  .detail-status {
    padding: 2px 10px;
    font-size: 12px;
  }

  .detail-cost {
    padding: 4px 14px;
    font-size: 13px;
  }

  .detail-work {
    margin-top: 10px;
    font-size: 14px;
  }

  .progress-ring {
    width: 160px;
    height: 160px;
    margin-top: 32px;
  }

  .progress-ring text {
    margin-top: 44px;
    font-size: 40px;
  }

  .progress-unit {
    font-size: 16px;
  }

  .progress-ring label {
    margin-top: 4px;
    font-size: 14px;
  }

  .progress-track {
    height: 8px;
    margin-top: 32px;
  }

  /* 结果图按原比例居中留边，容器不再整栏宽高比失衡；高度不足时先压缩图片 */
  .result-image {
    flex: 0 1 460px;
    width: min(100%, 560px);
    min-height: 0;
    height: auto;
    margin: 24px auto 0;
    border-radius: 12px;
  }

  .result-video {
    flex: 0 1 420px;
    width: min(100%, 640px);
    min-height: 0;
    height: auto;
    margin: 24px auto 0;
    border-radius: 12px;
  }

  .result-hint {
    margin-top: 12px;
    font-size: 12px;
  }

  .detail-tip {
    margin-top: 24px;
    padding: 12px;
    font-size: 13px;
  }

  .detail-task-action {
    margin-top: 16px;
  }

  .detail-task-action button {
    max-width: 320px;
    margin: 0 auto;
  }

  .detail-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding: 16px 32px 28px;
  }

  .detail-actions button {
    max-width: 320px;
  }

  .detail-actions .secondary-action {
    margin-top: 0;
  }
}
</style>
