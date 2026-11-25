<template>
  <creation-page title="图片优化">
    <view class="flow-body">
      <app-config-card index="壹" title="导入原图">
        <view class="file">
          <text v-if="selectedImage">{{ selectedImage.name }}</text>
          <text v-else>请先导入需要优化的图片</text>
          <button @click="handleChooseImage">
            <!-- #ifdef H5 -->
            <el-icon class="file-icon"><Upload /></el-icon>
            <!-- #endif -->
            {{
              isUploading
                ? "正在上传…"
                : selectedImage
                  ? "更换图片"
                  : "导入图片"
            }}
          </button>
          <text v-if="isUploading">
            {{
              uploadProgress === null
                ? "正在准备图片…"
                : `上传中 ${uploadProgress}%`
            }}
          </text>
          <button v-if="isUploading" @click.stop="cancelUpload">
            取消上传
          </button>
          <button v-else-if="canRetryUpload" @click.stop="retryUpload">
            重试上传
          </button>
        </view>
        <view
          class="preview"
          :class="{ empty: !selectedImage }"
          @click="handleChooseImage"
        >
          <app-image
            v-if="selectedImage"
            class="preview-media"
            :src="selectedImage.url || selectedImage.path"
            mode="aspectFit"
          />
          <view v-else class="empty-tip">
            <!-- #ifdef H5 -->
            <el-icon class="empty-icon"><Plus /></el-icon>
            <!-- #endif -->
            <text>从相册选择或拍摄图片</text>
          </view>
          <text v-if="selectedImage" class="cover">已选封面</text>
          <view v-if="selectedImage" class="zoom">
            <!-- #ifdef H5 -->
            <el-icon><ZoomIn /></el-icon>
            <!-- #endif -->
          </view>
        </view>
        <text class="hint">
          支持 JPEG、PNG、WebP，最大 5 MB、2500 万像素；超限 JPEG 将尝试压缩
        </text>
        <button @click="openBatchOptimization">批量优化</button>
      </app-config-card>

      <app-config-card index="贰" title="优化提示词">
        <template #extra>
          <text class="prompt-count">
            {{ promptCharacterCount }} / {{ promptLimit }} 字
          </text>
        </template>
        <textarea
          v-model="prompt"
          :maxlength="promptLimit * 2"
          @input="
            prompt = normalizePromptInput($event.detail.value, promptLimit)
          "
          class="prompt-input"
          placeholder="描述希望优化的效果，例如：提升清晰度，修复噪点，保留原有构图"
        />
        <text class="fixed-tip">{{ costNote }}</text>
        <button
          :disabled="isOptimizing || isSubmitting"
          @click="promptOptimizer?.optimize()"
        >
          {{ isOptimizing ? "优化中…" : "AI 优化提示词" }}
        </button>
        <text class="fixed-tip">
          AI 优化会将提示词发送至硅基流动，不消耗项目积分。
        </text>
        <button v-if="!costQuote" @click="refreshQuote">
          报价加载中或失败，点击重试
        </button>
      </app-config-card>
    </view>

    <template #footer>
      <app-flow-button
        variant="secondary"
        :loading="isSavingDraft"
        @click="saveDraft"
      >
        保存草稿
      </app-flow-button>
      <app-flow-button
        block
        :disabled="!selectedImage || isUploading || !costQuote || isOptimizing"
        :loading="isSubmitting"
        @click="startOptimization"
      >
        <!-- #ifdef H5 -->
        <el-icon class="action-icon"><MagicStick /></el-icon>
        <!-- #endif -->
        {{
          isSubmitting ? "正在提交，请稍候…" : `开始淬炼重绘（耗${costText}点）`
        }}
      </app-flow-button>
    </template>

    <template #overlay>
      <prompt-optimizer
        ref="promptOptimizer"
        v-model="prompt"
        task-type="optimization"
        :limit="promptLimit"
        @loading="isOptimizing = $event"
      />
      <generation-dialog
        v-if="isProgressVisible"
        type="optimization"
        :status="taskStatus"
        :progress="taskProgress"
        :progress-label="taskStageLabel"
        :note="taskNote"
        :result-url="taskResultUrl"
        :original-url="taskOriginalImage?.path || ''"
        :original-id="String(taskOriginalImage?.uploadId || '')"
        :canceling="isCanceling"
        :retrying="isRetrying"
        :status-unavailable="statusUnavailable"
        :refreshing="isRefreshingStatus"
        @cancel="cancelTask"
        @retry="retryTask"
        @refresh="refreshTaskStatus"
        @back="goWorkbench"
        @library="goLibrary"
      />
    </template>
  </creation-page>
</template>

<script setup>
import { computed, onUnmounted, ref } from "vue";

// #ifdef H5
import { MagicStick, Plus, Upload, ZoomIn } from "@element-plus/icons-vue";
// #endif

import { API_BASE_URL, IS_API_BASE_URL_VALID, USE_MOCK } from "@/apis/config";
import { TASK_STATUS } from "@/apis/constants";
import { getImageOptimizationTaskStatus } from "@/apis/image-optimization";
import AppConfigCard from "@/components/AppConfigCard/index.vue";
import AppFlowButton from "@/components/AppFlowButton/index.vue";
import AppImage from "@/components/AppImage/index.vue";
import CreationPage from "@/components/CreationPage/index.vue";
import PromptOptimizer from "@/components/PromptOptimizer/index.vue";
import GenerationDialog from "@/components/GenerationDialog/index.vue";
import useCreationQuote from "@/hooks/useCreationQuote";
import useImageUpload from "@/hooks/useImageUpload";
import useTaskActions from "@/hooks/useTaskActions";
import useTaskPolling from "@/hooks/useTaskPolling";
import { loadPointsBalance } from "@/stores";
import {
  getEditingDraft,
  clearEditingDraft,
  persistEditingDraft,
} from "@/utils/creation-draft";
import { submitImageOptimization } from "@/utils/image-optimization";
import { getErrorMessage, isApiError } from "@/utils/request";
import { getToken } from "@/utils/auth";
import {
  countPromptCharacters,
  limitPromptCharacters,
  normalizePromptInput,
} from "@/utils/prompt";
import {
  buildFailureNote,
  getTaskRefundPoints,
  getTaskRetryCost,
} from "@/utils/task-refund";

const promptLimit = 200; // 最大字符数
const promptCharacterCount = computed(() =>
  countPromptCharacters(prompt.value),
);
const progressNote = "已投入云端优化池，离开页面不影响任务进度。";
const prompt = ref("");
const selectedImage = ref(null);
const taskOriginalImage = ref(null);
const isSavingDraft = ref(false);
const isOptimizing = ref(false);
const promptOptimizer = ref(null);
let draftImageTask = null;
const editingDraft = getEditingDraft();
if (editingDraft?.task_type === "optimization") {
  prompt.value = limitPromptCharacters(
    editingDraft.input_data.prompt || "",
    promptLimit,
  );
  if (editingDraft.input_data.upload_id)
    selectedImage.value = {
      name: "已上传图片",
      uploadId: editingDraft.input_data.upload_id,
    };
}

// 草稿只存资源标识，通过鉴权下载恢复图片预览。
if (
  editingDraft?.task_type === "optimization" &&
  selectedImage.value?.uploadId &&
  !USE_MOCK
) {
  const token = getToken();
  const uploadId = selectedImage.value.uploadId;
  if (token && IS_API_BASE_URL_VALID) {
    draftImageTask = uni.downloadFile({
      url: `${API_BASE_URL}/uploads/images/${encodeURIComponent(uploadId)}`,
      header: { Authorization: `Bearer ${token}` },
      success: (result) => {
        if (
          result.statusCode === 200 &&
          selectedImage.value?.uploadId === uploadId
        ) {
          selectedImage.value = {
            ...selectedImage.value,
            path: result.tempFilePath,
          };
        }
      },
    });
  }
}
onUnmounted(() => draftImageTask?.abort());
const isSubmitting = ref(false);
const isProgressVisible = ref(false);
const taskId = ref("");
const taskProgress = ref(0);
const taskStatus = ref(TASK_STATUS.PENDING);
const statusUnavailable = ref(false);
const isRefreshingStatus = ref(false);
const taskResultUrl = ref("");
const taskNote = ref(progressNote);
const taskRetryCost = ref(0);

const { quote: costQuote, refreshQuote } = useCreationQuote({
  getParams: () => {
    prompt.value = normalizePromptInput(prompt.value, promptLimit);
    return { task_type: "optimization", prompt: prompt.value.trim() };
  },
});

const costText = computed(() => costQuote.value?.cost_points ?? "—");
const costNote = computed(() => {
  if (!costQuote.value) return "正在获取报价，失败时请点击重试。";
  const tokens = costQuote.value?.total_tokens;
  const tokenText = tokens ? `（约 ${tokens} tokens）` : "";

  return `按提示词实时计价${tokenText}，提交扣除 ${costText.value} 积分，模型未产出结果时自动退回；结果链接约 1 小时后失效。`;
});

const taskStageLabel = computed(() => {
  if (taskStatus.value === TASK_STATUS.COMPLETED) {
    return "生成完成";
  }

  if (taskStatus.value === TASK_STATUS.FAILED) {
    return "生成失败";
  }

  if (taskStatus.value === TASK_STATUS.CANCELED) {
    return "已取消创作";
  }

  return "云端淬炼中";
});

const { start: startPolling, stop: stopPolling } = useTaskPolling({
  fetchTask: () => getImageOptimizationTaskStatus({ taskId: taskId.value }),
  interval: 3000,
  maxAttempts: 60,
  isCompleted: (data) => data.status === TASK_STATUS.COMPLETED,
  isFailed: (data) => data.status === TASK_STATUS.FAILED,
  isCanceled: (data) => data.status === TASK_STATUS.CANCELED,
  onProgress: (data) => {
    statusUnavailable.value = false;
    isRefreshingStatus.value = false;
    taskStatus.value = data.status || TASK_STATUS.PROCESSING;
    taskProgress.value = Number(data.progress) || 0;

    if (data.result_urls?.[0]) {
      taskResultUrl.value = data.result_urls[0];
    }
  },
  onCompleted: (data) => {
    isRefreshingStatus.value = false;
    taskStatus.value = TASK_STATUS.COMPLETED;
    taskProgress.value = 100;
    taskResultUrl.value = data.result_urls?.[0] || "";
    taskNote.value = "任务已完成，可前往作品库查看。";
  },
  onFailed: (error, data) => {
    isRefreshingStatus.value = false;
    taskStatus.value = TASK_STATUS.FAILED;
    taskRetryCost.value = getTaskRetryCost(data);
    taskNote.value = buildFailureNote(
      data,
      getErrorMessage(error, "任务进度获取失败，请稍后重试"),
    );
    uni.showToast({
      title: taskNote.value,
      icon: "none",
    });
  },
  onUnavailable: () => {
    isRefreshingStatus.value = false;
    statusUnavailable.value = true;
    taskNote.value = "暂时无法获取任务状态，任务仍可能在处理中。";
  },
  onCanceled: (data) => applyCanceledState(data),
});

// 任务取消后停止轮询，弹窗切换为已取消状态
const applyCanceledState = (data = {}) => {
  stopPolling();
  isRefreshingStatus.value = false;
  statusUnavailable.value = false;
  taskStatus.value = TASK_STATUS.CANCELED;
  taskResultUrl.value = "";
  taskRetryCost.value = 0;

  const refundPoints = getTaskRefundPoints(data);

  taskNote.value =
    refundPoints > 0
      ? `创作已取消，本次消耗的 ${refundPoints} 积分已退回。`
      : "创作已取消。";
};

// 状态查询恢复后继续查询原任务，不重新创建或扣费
const refreshTaskStatus = () => {
  if (isRefreshingStatus.value) return;
  isRefreshingStatus.value = true;
  statusUnavailable.value = false;
  startPolling();
};

const { cancelTask, retryTask, isCanceling, isRetrying } = useTaskActions({
  getTaskId: () => taskId.value,
  getRetryCost: () => taskRetryCost.value,
  onCanceled: (data) => applyCanceledState(data),
  onRetried: () => {
    statusUnavailable.value = false;
    taskStatus.value = TASK_STATUS.PENDING;
    taskProgress.value = 0;
    taskResultUrl.value = "";
    taskNote.value = progressNote;
    taskRetryCost.value = 0;
    startPolling();
  },
});

const {
  isUploading,
  uploadProgress,
  canRetryUpload,
  chooseImage,
  retryUpload,
  cancelUpload,
} = useImageUpload((image) => {
  selectedImage.value = image;
});

// 提交任务时禁止更换图片。
const handleChooseImage = () => {
  if (!isSubmitting.value) chooseImage();
};

// 批量入口创建独立任务，不复用当前草稿。
const openBatchOptimization = () => {
  if (isSubmitting.value || isSavingDraft.value || isUploading.value) return;
  uni.navigateTo({ url: "/pages/batch-optimization/index" });
};

// 保存优化草稿，只记录已上传的资源标识。
const saveDraft = async () => {
  prompt.value = normalizePromptInput(prompt.value, promptLimit);
  if (isSavingDraft.value || isUploading.value || isSubmitting.value) return;
  if (!selectedImage.value?.uploadId) {
    uni.showToast({ title: "请先上传图片", icon: "none" });
    return;
  }
  isSavingDraft.value = true;
  try {
    await persistEditingDraft("optimization", {
      upload_id: selectedImage.value.uploadId,
      prompt: prompt.value.trim(),
    });
    uni.showToast({ title: "草稿已保存", icon: "none" });
  } catch {
    uni.showToast({ title: "保存失败", icon: "none" });
  } finally {
    isSavingDraft.value = false;
  }
};

// 校验图片后开始优化任务
const startOptimization = async () => {
  prompt.value = normalizePromptInput(prompt.value, promptLimit);
  if (
    isSubmitting.value ||
    isUploading.value ||
    isSavingDraft.value ||
    isOptimizing.value ||
    !costQuote.value
  ) {
    return;
  }

  if (!selectedImage.value) {
    uni.showToast({ title: "请先导入需要优化的图片", icon: "none" });
    return;
  }

  if (!prompt.value.trim()) {
    uni.showToast({ title: "请填写优化提示词", icon: "none" });
    return;
  }

  isSubmitting.value = true;
  const submittedImage = { ...selectedImage.value };

  try {
    const task = await submitImageOptimization({
      ...(USE_MOCK
        ? {
            image_path: submittedImage.path || submittedImage.uploadId,
          }
        : { upload_id: submittedImage.uploadId }),
      prompt: prompt.value.trim(),
      ...(getEditingDraft()?.task_type === "optimization"
        ? { draft_id: getEditingDraft().id }
        : {}),
    });

    if (!task?.task_id) {
      uni.showToast({ title: "任务创建失败，请重试", icon: "none" });
      return;
    }

    clearEditingDraft();
    taskOriginalImage.value = submittedImage;
    taskId.value = task.task_id;
    taskProgress.value = 0;
    taskStatus.value = TASK_STATUS.PROCESSING;
    taskResultUrl.value = "";
    taskNote.value = progressNote;
    isProgressVisible.value = true;
    // 创建任务已扣减积分，刷新共享缓存供页头展示。
    loadPointsBalance({ force: true });
    startPolling();
  } catch (error) {
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
</script>

<style scoped lang="scss">
.flow-body {
  @include flow-body(2);
}

/* 导入区 */
.file {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
  color: $color-ink;
  font-size: 26rpx;
  font-weight: 700;
}

.file text {
  flex: 1;
  min-width: 0;
  @include text-ellipsis;
}

.file button {
  @include tap-area(64rpx);
  flex-shrink: 0;
  gap: 8rpx;
  margin: 0;
  padding: 0 20rpx;
  border: 0;
  border-radius: 999rpx;
  background: $color-primary-light;
  color: $color-primary;
  font-size: 24rpx;
  line-height: 1;
}

.file button:after {
  border: 0;
}

.file-icon {
  font-size: 26rpx;
}

.preview {
  position: relative;
  height: 320rpx;
  margin-top: 20rpx;
  overflow: hidden;
  border-radius: 20rpx;
  background: #f8faf7;
}

.preview-media {
  width: 100%;
  height: 100%;
}

.preview.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #d2ddd6;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  color: $color-muted;
  font-size: 24rpx;
}

.empty-icon {
  color: #a3b1ab;
  font-size: 44rpx;
}

.cover,
.zoom {
  position: absolute;
  background: rgba(22, 53, 47, 0.82);
  color: #fff;
}

.cover {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  top: 16rpx;
  left: 16rpx;
}

.zoom {
  @include tap-area(56rpx);
  right: 16rpx;
  bottom: 16rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  font-size: 28rpx;
  line-height: 1;
}

.hint {
  display: block;
  margin-top: 16rpx;
  color: $color-muted;
  font-size: 22rpx;
  text-align: center;
}

/* 提示词区 */
.prompt-count {
  flex-shrink: 0;
  color: $color-muted;
  font-size: 24rpx;
  font-weight: 400;
  @include numeric;
}

.prompt-input {
  width: 100%;
  height: 200rpx;
  color: $color-ink;
  font-size: 26rpx;
  line-height: 1.6;
  box-sizing: border-box;
}

.fixed-tip {
  display: block;
  margin-top: 16rpx;
  color: $color-muted;
  font-size: 22rpx;
}

.action-icon {
  font-size: 26rpx;
}
</style>
