<template>
  <creation-page title="视频创作" :steps="steps" @step-click="goPreviousStep">
    <view class="flow-body">
      <app-config-card index="壹" title="动卷预览">
        <view class="preview-body">
          <view class="preview-thumb">
            <app-image
              class="preview-image"
              :src="previewSource"
              mode="aspectFill"
            />
            <text class="preview-badge">影片</text>
          </view>
          <view class="preview-info">
            <view class="preview-head">
              <text class="preview-title">{{ renderConfig.previewTitle }}</text>
              <text class="preview-state">已立意</text>
            </view>
            <view class="preview-tags">
              <text class="preview-tag">{{ draft.ratioName }}</text>
              <text class="preview-tag is-accent">
                {{ renderConfig.cameraMove }}
              </text>
            </view>
            <text class="preview-desc">“{{ promptText }}”</text>
          </view>
        </view>
      </app-config-card>

      <app-config-card index="贰" title="渲染资源结算">
        <template #extra>
          <button class="boost-button" @click="showBoostTip">
            <!-- #ifdef H5 -->
            <el-icon><Lightning /></el-icon>
            <!-- #endif -->
            尊享加速通道
          </button>
        </template>
        <view class="resource-grid">
          <view class="resource-item">
            <text class="resource-label">本次消耗</text>
            <view class="resource-value">
              {{ renderCost }}
              <text class="resource-unit">灵感点</text>
            </view>
          </view>
          <view class="resource-item">
            <text class="resource-label">当前可用</text>
            <view class="resource-value">
              {{ renderConfig.power }}
              <text class="resource-unit">点</text>
            </view>
          </view>
          <view class="resource-item">
            <text class="resource-label">渲染预估</text>
            <view class="resource-value">
              {{ renderConfig.estimatedTime }}
            </view>
          </view>
        </view>
      </app-config-card>
    </view>

    <template #footer>
      <app-flow-button
        variant="secondary"
        class="previous-button"
        :disabled="isSubmitting"
        @click="goPreviousStep"
      >
        <!-- #ifdef H5 -->
        <el-icon class="button-icon"><ArrowLeft /></el-icon>
        <!-- #endif -->
        上一步
      </app-flow-button>
      <app-flow-button block :loading="isSubmitting" @click="handleRender">
        <!-- #ifdef H5 -->
        <el-icon v-if="!isSubmitting" class="button-icon">
          <VideoPlay />
        </el-icon>
        <!-- #endif -->
        挥毫渲染动卷
        <!-- #ifdef H5 -->
        <el-icon v-if="!isSubmitting" class="button-icon">
          <ArrowRight />
        </el-icon>
        <!-- #endif -->
      </app-flow-button>
    </template>

    <template #overlay>
      <confirm-generation-dialog
        v-if="confirmVisible"
        title="确认挥毫渲染动卷"
        :cost="renderCost"
        :tokens="renderTokens"
        :estimated-time="renderConfig.estimatedTime"
        :note="confirmNote"
        confirm-text="确认开始渲染"
        @cancel="confirmVisible = false"
        @confirm="confirmRender"
      />
      <generation-dialog
        v-if="progressVisible"
        title="动卷渲染中"
        type="video"
        :status="taskStatus"
        :result-url="taskResultUrl"
        :progress="taskProgress"
        :progress-label="taskStage"
        :note="taskNote"
        :canceling="isCanceling"
        :retrying="isRetrying"
        @cancel="cancelTask"
        @retry="retryTask"
        @back="goWorkbench"
        @library="goLibrary"
      />
    </template>
  </creation-page>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";

// #ifdef H5
import {
  ArrowLeft,
  ArrowRight,
  Lightning,
  VideoPlay,
} from "@element-plus/icons-vue";
// #endif

import { TASK_STATUS } from "@/apis/constants";
import { getVideoTaskStatus } from "@/apis/video-creation";
import previewFallback from "@/assets/theme/theme-videos-1.jpg";
import AppConfigCard from "@/components/AppConfigCard/index.vue";
import AppFlowButton from "@/components/AppFlowButton/index.vue";
import AppImage from "@/components/AppImage/index.vue";
import ConfirmGenerationDialog from "@/components/ConfirmGenerationDialog/index.vue";
import CreationPage from "@/components/CreationPage/index.vue";
import GenerationDialog from "@/components/GenerationDialog/index.vue";
import useCreationQuote from "@/hooks/useCreationQuote";
import useTaskActions from "@/hooks/useTaskActions";
import useTaskPolling from "@/hooks/useTaskPolling";
import { loadPointsBalance } from "@/stores";
import { DRAFT_KEYS, readCreationDraft } from "@/utils/creation-draft";
import { getErrorMessage, isApiError } from "@/utils/request";
import {
  buildFailureNote,
  getTaskRefundPoints,
  getTaskRetryCost,
} from "@/utils/task-refund";
import { submitVideoGeneration } from "@/utils/video-generation";

const steps = [
  { label: "规制与意境", state: "done", clickable: true },
  { label: "画质与渲染", state: "active" },
];
const draft = ref({ ratioName: "", prompt: "", imagePath: "" });
const DEFAULT_RENDER_COST = 5;
const renderConfig = reactive({
  power: 800,
  estimatedTime: "约 18 秒",
  previewTitle: "《江雪孤舟 · 动态长卷》",
  cameraMove: "平缓推镜",
});
const confirmVisible = ref(false);
const progressVisible = ref(false);
const isSubmitting = ref(false);
const taskId = ref("");
const taskProgress = ref(0);
const taskStatus = ref(TASK_STATUS.PENDING);
const taskResultUrl = ref("");
const taskStatusData = ref(null);
const taskRetryCost = ref(0);

const { quote: costQuote } = useCreationQuote({
  getParams: () => ({
    task_type: "video",
    prompt: draft.value.prompt,
  }),
});

const renderCost = computed(
  () => costQuote.value?.cost_points ?? DEFAULT_RENDER_COST,
);
const renderTokens = computed(() => costQuote.value?.total_tokens || 0);
const confirmNote = computed(
  () =>
    `提交后扣除 ${renderCost.value} 积分，模型未产出结果时自动退回；视频链接可能过期，请及时保存。`,
);

// 作品库携带任务标识重进时为 true，跳过规制草稿校验
let isTaskEntry = false;

const previewSource = computed(() => draft.value.imagePath || previewFallback);

const taskStage = computed(
  () => taskStatusData.value?.stageLabel || "云端逐帧重绘",
);

const taskNote = computed(
  () =>
    taskStatusData.value?.note ||
    "动卷已进入云端渲染池，退出或锁屏均不影响进度，完成后自动归档至作品库。",
);

const { start: startPolling, stop: stopPolling } = useTaskPolling({
  fetchTask: () => getVideoTaskStatus({ taskId: taskId.value }),
  interval: 3000,
  maxAttempts: 60,
  isCompleted: (data) => data.status === TASK_STATUS.COMPLETED,
  isFailed: (data) => data.status === TASK_STATUS.FAILED,
  isCanceled: (data) => data.status === TASK_STATUS.CANCELED,
  onProgress: (data) => {
    taskProgress.value = Number(data.progress) || 0;
    taskStatus.value = data.status || TASK_STATUS.PROCESSING;
    taskResultUrl.value = data.result_urls?.[0] || "";
    taskStatusData.value = {
      stageLabel: "云端逐帧渲染中",
      note: "已进入云端渲染，离开页面不影响任务进度。",
    };
  },
  onCompleted: (data) => {
    taskStatus.value = TASK_STATUS.COMPLETED;
    taskProgress.value = 100;
    taskResultUrl.value = data.result_urls?.[0] || "";
    taskStatusData.value = {
      stageLabel: "动卷已完成",
      note: "任务已完成并归档，可前往作品库查看。",
    };
  },
  onFailed: (error, data) => {
    const isRequestError = isApiError(error);
    const note = isRequestError
      ? "任务状态查询失败，请稍后在作品库确认结果。"
      : buildFailureNote(
          data,
          getErrorMessage(error, "生成失败，请稍后重试。"),
        );

    taskStatus.value = TASK_STATUS.FAILED;
    taskRetryCost.value = getTaskRetryCost(data);
    taskStatusData.value = { stageLabel: "生成失败", note };

    if (!isRequestError) {
      uni.showToast({
        title: data?.error_message || note,
        icon: "none",
      });
    }
  },
  onCanceled: (data) => applyCanceledState(data),
});

// 任务取消后停止轮询，弹窗切换为已取消状态
const applyCanceledState = (data = {}) => {
  stopPolling();
  taskStatus.value = TASK_STATUS.CANCELED;
  taskResultUrl.value = "";
  taskRetryCost.value = 0;

  const refundPoints = getTaskRefundPoints(data);

  taskStatusData.value = {
    stageLabel: "已取消创作",
    note:
      refundPoints > 0
        ? `创作已取消，本次消耗的 ${refundPoints} 积分已退回。`
        : "创作已取消。",
  };
};

const { cancelTask, retryTask, isCanceling, isRetrying } = useTaskActions({
  getTaskId: () => taskId.value,
  getRetryCost: () => taskRetryCost.value,
  onCanceled: (data) => applyCanceledState(data),
  onRetried: () => {
    taskStatus.value = TASK_STATUS.PENDING;
    taskProgress.value = 0;
    taskResultUrl.value = "";
    taskRetryCost.value = 0;
    taskStatusData.value = {
      stageLabel: "云端逐帧渲染中",
      note: "已进入云端渲染，离开页面不影响任务进度。",
    };
    startPolling();
  },
});

const promptText = computed(() => {
  const text = draft.value.prompt;

  if (!text) {
    return "以所选图卷徐徐展开，气韵流动";
  }

  return text.length > 38 ? `${text.slice(0, 38)}…` : text;
});

// 返回第一步，页面栈为空时重新进入规制页
const goPreviousStep = () => {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }

  uni.redirectTo({ url: "/pages/video-creation/index" });
};

// 提示加速通道尚未开放
const showBoostTip = () => {
  uni.showToast({ title: "尊享加速通道筹备中", icon: "none" });
};

// 打开渲染确认弹窗
const handleRender = () => {
  if (isSubmitting.value) {
    return;
  }

  confirmVisible.value = true;
};

// 确认后创建视频生成任务，并轮询真实任务进度
const confirmRender = async () => {
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const task = await submitVideoGeneration({
      mode: draft.value.mode,
      ratio: draft.value.ratio,
      prompt: draft.value.prompt,
    });

    if (!task?.task_id) {
      uni.showToast({ title: "任务创建失败，请重试", icon: "none" });
      return;
    }

    confirmVisible.value = false;
    progressVisible.value = true;
    // 创建任务已扣减灵感点，刷新共享缓存供页头展示。
    loadPointsBalance({ force: true });
    taskId.value = task.task_id;
    taskProgress.value = 0;
    taskStatusData.value = null;
    startPolling();
  } catch (error) {
    // 请求层已统一提示接口异常，这里只兜底非接口异常
    if (!isApiError(error)) {
      uni.showToast({
        title: getErrorMessage(error, "创建任务失败，请稍后重试"),
        icon: "none",
      });
    }
  } finally {
    isSubmitting.value = false;
  }
};

// 返回创作台
const goWorkbench = () => {
  uni.reLaunch({ url: "/pages/workbench/index" });
};

// 前往作品库查看
const goLibrary = () => {
  uni.navigateTo({ url: "/pages/library/index" });
};

/**
 * 作品库重进：携带任务标识时直接进入渲染进度，不再校验规制草稿。
 * @param {{taskId?: string}} query 页面查询参数。
 * @returns {void}
 */
onLoad((query) => {
  if (!query.taskId) {
    return;
  }

  isTaskEntry = true;
  taskId.value = query.taskId;
  progressVisible.value = true;
  taskStatus.value = TASK_STATUS.PROCESSING;
  startPolling();
});

onShow(() => {
  // 从作品库进入的进度查看不依赖规制草稿
  if (isTaskEntry) {
    return;
  }

  const stored = readCreationDraft(DRAFT_KEYS.video);

  if (!stored?.ratio) {
    uni.showToast({ title: "请先完成规制与意境", icon: "none" });
    uni.redirectTo({ url: "/pages/video-creation/index" });
    return;
  }

  draft.value = {
    ...stored,
    ratioName: stored.ratioName || stored.ratio,
    imagePath: stored.imagePath || "",
  };
});
</script>

<style scoped lang="scss">
.flow-body {
  @include flow-body(2);
}

/* 动卷预览 */
.preview-body {
  display: flex;
  gap: 20rpx;
}

.preview-thumb {
  position: relative;
  flex-shrink: 0;
  width: 180rpx;
  height: 140rpx;
  overflow: hidden;
  border-radius: 12rpx;
  background: #eef2ef;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.preview-badge {
  position: absolute;
  bottom: 8rpx;
  left: 8rpx;
  padding: 4rpx 8rpx;
  border-radius: 6rpx;
  background: rgba(20, 45, 38, 0.72);
  color: #fff;
  font-size: 22rpx;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.preview-title {
  flex: 1;
  min-width: 0;
  color: $color-ink;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1.3;
  @include line-clamp(2);
}

.preview-state {
  flex-shrink: 0;
  color: $color-primary-deep;
  font-size: 22rpx;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.preview-tag {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  background: #f8faf7;
  color: #4e665e;
  font-size: 22rpx;

  &.is-accent {
    background: #f3e4cd;
    color: $color-primary;
  }
}

.preview-desc {
  margin-top: 12rpx;
  color: $color-muted;
  font-size: 22rpx;
  line-height: 1.6;
  @include line-clamp(2);
}

/* 资源结算 */
.boost-button {
  @include tap-area(64rpx);
  flex-shrink: 0;
  height: 64rpx;
  margin: 0;
  padding: 0 16rpx;
  border: 1rpx solid #bfe0d1;
  border-radius: 12rpx;
  background: $color-surface;
  color: $color-primary-deep;
  font-size: 22rpx;
  line-height: 1;
}

.boost-button:after {
  border: 0;
}

.resource-grid {
  display: flex;
  padding: 20rpx 12rpx;
  border-radius: 16rpx;
  background: #f8faf7;
}

.resource-item {
  flex: 1;
  min-width: 0;
  text-align: center;

  & + & {
    border-left: 1rpx solid #edf2ef;
  }
}

.resource-label {
  display: block;
  color: $color-muted;
  font-size: 22rpx;
}

.resource-value {
  margin-top: 12rpx;
  color: $color-primary-deep;
  font-size: 28rpx;
  font-weight: 700;
  @include numeric;
}

.resource-unit {
  margin-left: 4rpx;
  color: #4e665e;
  font-size: 22rpx;
  font-weight: 400;
}

.previous-button {
  width: 150rpx;
  flex-shrink: 0;
}

.button-icon {
  font-size: 22rpx;
}
</style>
