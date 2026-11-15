<template>
  <view class="task-detail">
    <app-page-header title="作品详情" />
    <scroll-view scroll-y :show-scrollbar="false" class="detail-content">
      <view class="detail-body">
        <view class="detail-card">
          <view class="detail-head">
            <view class="detail-title-group">
              <text class="detail-heading">{{ typeConfig.progressTitle }}</text>
              <text class="detail-status" :class="statusTag.className">
                {{ statusTag.text }}
              </text>
            </view>
            <text class="detail-cost">消耗 {{ typeConfig.cost }} 积分</text>
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
              <text>{{ progress }}<small>%</small></text>
              <label>{{ progressLabel }}</label>
            </view>
            <view class="progress-track"
              ><view :style="{ width: `${progress}%` }"></view
            ></view>
          </template>
          <view v-if="tip" class="detail-tip">{{ tip }}</view>
        </view>
      </view>
    </scroll-view>
    <view class="detail-actions">
      <button class="primary-action" @tap="handleLibraryAction">
        {{ libraryActionText }}
      </button>
      <button class="secondary-action" @tap="goWorkbench">返回工作台</button>
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
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import useTaskPolling from "@/hooks/useTaskPolling";
import { getErrorMessage, isApiError } from "@/utils/request";

/**
 * @property {string} taskId 任务公开标识，用于查询进度与结果。
 * @property {string} type 任务类型：image、optimization 或 video。
 * @property {string} title 作品标题，为空时不展示。
 * @property {"creation" | "library"} from 入口来源，决定作品库按钮的文案与返回方式。
 */
const props = defineProps({
  taskId: { type: String, default: "" },
  type: { type: String, default: "image" },
  title: { type: String, default: "" },
  from: { type: String, default: "creation" },
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

const typeConfig = computed(() => TYPE_CONFIGS[currentType.value]);
const statusTag = computed(
  () => STATUS_TAGS[status.value] || STATUS_TAGS[TASK_STATUS.PENDING],
);
const isCompleted = computed(() => status.value === TASK_STATUS.COMPLETED);
const isFinished = computed(
  () => isCompleted.value || status.value === TASK_STATUS.FAILED,
);
const progressLabel = computed(() => {
  if (isCompleted.value) {
    return "生成完成";
  }

  if (status.value === TASK_STATUS.FAILED) {
    return "生成失败";
  }

  return typeConfig.value.progressLabel;
});
const tip = computed(() => {
  if (status.value === TASK_STATUS.FAILED) {
    return failureMessage.value || "任务处理失败，请返回重新尝试。";
  }

  if (isFinished.value) {
    return "";
  }

  return "已进入云端处理，离开页面不影响任务进度。";
});
const libraryActionText = computed(() =>
  props.from === "library" ? "返回作品库" : "前往作品库查看进度",
);

// 任务查询接口统一返回任务类型，据此纠正入口未传或传错的类型
const syncTaskType = (data) => {
  if (Object.prototype.hasOwnProperty.call(TYPE_CONFIGS, data.task_type)) {
    currentType.value = data.task_type;
  }
};

// 按任务类型选择状态查询接口，三类任务共用同一个查询地址
const fetchTaskStatus = () =>
  TASK_FETCHERS[currentType.value]({ taskId: props.taskId });

const { start: startPolling } = useTaskPolling({
  fetchTask: fetchTaskStatus,
  interval: 3000,
  maxAttempts: 60,
  isCompleted: (data) => data.status === TASK_STATUS.COMPLETED,
  isFailed: (data) => data.status === TASK_STATUS.FAILED,
  onProgress: (data) => {
    syncTaskType(data);
    status.value = data.status || TASK_STATUS.PROCESSING;
    progress.value = Number(data.progress) || 0;

    if (data.result_urls?.[0]) {
      resultUrl.value = data.result_urls[0];
    }
  },
  onCompleted: (data) => {
    syncTaskType(data);
    status.value = TASK_STATUS.COMPLETED;
    progress.value = 100;
    resultUrl.value = data.result_urls?.[0] || "";
  },
  onFailed: (error) => {
    const isRequestError = isApiError(error);

    status.value = TASK_STATUS.FAILED;
    failureMessage.value = isRequestError
      ? "任务状态查询失败，请稍后在作品库确认结果。"
      : getErrorMessage(error, "任务进度获取失败，请稍后重试");

    if (!isRequestError) {
      uni.showToast({ title: failureMessage.value, icon: "none" });
    }
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
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;
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

.progress-ring text small {
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

/* ============================================================
 * 桌面 H5 适配：卡片与操作栏使用居中窄栏，页头沿用全局左右贴边布局
 * ============================================================ */
@media (min-width: $breakpoint-desktop) {
  .detail-content {
    max-width: 760px;
    margin: 0 auto;
    padding: 40px 0;
    padding-bottom: calc(120px + env(safe-area-inset-bottom));
  }

  .detail-card {
    padding: 28px 32px 32px;
    border-radius: 16px;
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

  .progress-ring text small {
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

  /* 结果图按原比例居中留边，容器不再整栏宽高比失衡 */
  .result-image {
    width: min(100%, 560px);
    height: 460px;
    margin: 24px auto 0;
    border-radius: 12px;
  }

  .result-video {
    width: min(100%, 640px);
    height: 420px;
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

  .detail-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding: 16px 32px 28px;
  }

  .detail-actions button {
    max-width: 320px;
    height: 44px;
    border-radius: 12px;
    font-size: 15px;
  }

  .detail-actions .secondary-action {
    margin-top: 0;
  }
}

.detail-actions {
  @include action-bar;
}

.detail-actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: $tap-size;
  padding: 0;
  border-radius: 16rpx;
  font-size: 28rpx;
  line-height: 1;
}

.detail-actions button::after {
  border: 0;
}

.primary-action {
  border: 0;
  background: $color-primary;
  color: #fff;
  font-weight: 700;
}

.secondary-action {
  margin-top: 16rpx;
  border: 1rpx solid $color-line;
  background: $color-surface;
  color: #4e665e;
}
</style>
