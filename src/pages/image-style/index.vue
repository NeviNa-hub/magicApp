<template>
  <creation-page title="文字生图" :steps="steps">
    <view class="flow-body">
      <app-config-card index="壹" title="画面主旨">
        <template #extra>
          <text class="prompt-count">
            {{ prompt.length }} / {{ promptLimit }} 字
          </text>
        </template>
        <textarea
          v-model="prompt"
          :maxlength="promptLimit"
          class="prompt-input"
          placeholder="写下你想描绘的意象"
        />
        <view class="prompt-tools">
          <button @click="polishPrompt">
            <!-- #ifdef H5 -->
            <el-icon class="tool-icon"><MagicStick /></el-icon>
            <!-- #endif -->
            灵感润色
          </button>
          <button @click="randomPrompt">
            <!-- #ifdef H5 -->
            <el-icon class="tool-icon"><RefreshLeft /></el-icon>
            <!-- #endif -->
            随机意象
          </button>
          <text @click="prompt = ''">清空</text>
        </view>
      </app-config-card>

      <app-config-card index="贰" title="灵感引线">
        <view class="suggestions">
          <button
            v-for="item in suggestions"
            :key="item"
            @click="appendPrompt(item)"
          >
            ＋ {{ item }}
          </button>
        </view>
      </app-config-card>

      <app-config-card index="叁" title="画境点睛">
        <view class="tuning-grid">
          <view class="tuning-row">
            <text class="tuning-label">意境基调</text>
            <text class="tuning-value">清润淡雅　墨韵沉静</text>
          </view>
          <view class="tuning-row">
            <text class="tuning-label">留白比例</text>
            <text class="tuning-value">迂阔（60%）　虚实均亭</text>
          </view>
        </view>
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
        variant="secondary"
        class="previous-button"
        @click="goBack"
      >
        上一步
      </app-flow-button>
      <app-flow-button block :loading="isSubmitting" @click="handleSubmit">
        {{ isSubmitting ? "任务创建中…" : "开始研墨成画 →" }}
      </app-flow-button>
    </template>

    <template #overlay>
      <confirm-generation-dialog
        v-if="confirmVisible"
        title="确认研墨成画"
        :cost="generationCost"
        :tokens="generationTokens"
        :estimated-time="estimatedTime || '待定'"
        note="确认后按提示词实时计价扣除灵感点，模型未产出结果时自动退回本次积分；结果链接约 1 小时后失效，请及时保存。"
        confirm-text="确认研墨成画"
        :loading="isSubmitting"
        @cancel="confirmVisible = false"
        @confirm="confirmGenerate"
      />
      <generation-dialog
        v-if="progressVisible"
        title="研墨成画"
        type="creation"
        :status="taskStatus"
        :progress="taskProgress"
        :progress-label="taskStage"
        :note="taskNote"
        :result-url="taskResultUrl"
        :canceling="isCanceling"
        :retrying="isRetrying"
        @cancel="cancelTask"
        @retry="retryTask"
        @back="uni.redirectTo({ url: '/pages/workbench/index' })"
        @library="uni.navigateTo({ url: '/pages/library/index' })"
      />
    </template>
  </creation-page>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

// #ifdef H5
import { MagicStick, RefreshLeft } from "@element-plus/icons-vue";
// #endif

import { TASK_STATUS } from "@/apis/constants";
import { getImageTaskStatus } from "@/apis/text-to-image";
import {
  getEditingDraft,
  clearEditingDraft,
  persistEditingDraft,
} from "@/utils/creation-draft";
import { submitImageGeneration } from "@/utils/image-generation";
import AppConfigCard from "@/components/AppConfigCard/index.vue";
import AppFlowButton from "@/components/AppFlowButton/index.vue";
import ConfirmGenerationDialog from "@/components/ConfirmGenerationDialog/index.vue";
import CreationPage from "@/components/CreationPage/index.vue";
import GenerationDialog from "@/components/GenerationDialog/index.vue";
import useCreationQuote from "@/hooks/useCreationQuote";
import useTaskActions from "@/hooks/useTaskActions";
import useTaskPolling from "@/hooks/useTaskPolling";
import { loadPointsBalance } from "@/stores";
import {
  DRAFT_KEYS,
  readCreationDraft,
  saveCreationDraft,
} from "@/utils/creation-draft";
import { appendPromptText, polishPromptText } from "@/utils/prompt";
import { getErrorMessage, isApiError } from "@/utils/request";
import { buildFailureNote, getTaskRetryCost } from "@/utils/task-refund";

const steps = [
  {
    label: "落墨构想",
    state: "done",
  },
  {
    label: "甄选画风",
    state: "active",
  },
];
const selectedStyle = ref("");
const prompt = ref("");
const isSavingDraft = ref(false);
const promptLimit = 400;
const suggestions = [
  "江南烟雨",
  "宋代山水",
  "青绿设色",
  "晨曦微光",
  "枯墨留白",
];
const polishSuffix = "画面空灵雅致，留白自然，笔触细腻";
const randomPromptText =
  "薄雾晨光里的青绿山水，远处层峦叠嶂，近处一叶轻舟掠过溪面";
const estimatedTime = "约 6~8 秒";
const DEFAULT_GENERATION_COST = 2;
const TASK_STAGE_TEXT = {
  [TASK_STATUS.PENDING]: "排队等待",
  [TASK_STATUS.PROCESSING]: "气韵流转",
  [TASK_STATUS.COMPLETED]: "生成完成",
  [TASK_STATUS.FAILED]: "生成失败",
  [TASK_STATUS.CANCELED]: "已取消创作",
};
const TASK_NOTE_TEXT = {
  [TASK_STATUS.PENDING]:
    "任务已创建，正在排队等待云端处理，离开页面不影响生成。",
  [TASK_STATUS.PROCESSING]: "云端研墨中，离开页面或切换画风不影响生成。",
  [TASK_STATUS.COMPLETED]: "画卷已完成，可轻触画卷放大查看或前往作品库。",
  [TASK_STATUS.CANCELED]: "创作已取消，本次消耗的积分已退回。",
};
const draft = ref(readCreationDraft(DRAFT_KEYS.image) || {});
const confirmVisible = ref(false);
const progressVisible = ref(false);
const isSubmitting = ref(false);
const taskId = ref("");
const taskProgress = ref(0);
const taskStatus = ref(TASK_STATUS.PENDING);
const taskMessage = ref("");
const taskResultUrl = ref("");
const taskRetryCost = ref(0);

const { quote: costQuote } = useCreationQuote({
  getParams: () => ({
    task_type: "image",
    prompt: prompt.value.trim(),
    style: selectedStyle.value,
  }),
});

const generationCost = computed(
  () => costQuote.value?.cost_points ?? DEFAULT_GENERATION_COST,
);
const generationTokens = computed(() => costQuote.value?.total_tokens || 0);

const taskStage = computed(
  () => TASK_STAGE_TEXT[taskStatus.value] || "任务已创建",
);

const taskNote = computed(() => {
  if (taskStatus.value === TASK_STATUS.FAILED) {
    return taskMessage.value || "生成失败，请返回重新尝试。";
  }

  return (
    TASK_NOTE_TEXT[taskStatus.value] || TASK_NOTE_TEXT[TASK_STATUS.PENDING]
  );
});

const { start: startPolling, stop: stopPolling } = useTaskPolling({
  fetchTask: () => getImageTaskStatus({ taskId: taskId.value }),
  interval: 3000,
  maxAttempts: 60,
  isCompleted: (data) => data.status === TASK_STATUS.COMPLETED,
  isFailed: (data) => data.status === TASK_STATUS.FAILED,
  isCanceled: (data) => data.status === TASK_STATUS.CANCELED,
  onProgress: (data) => {
    taskStatus.value = data.status || TASK_STATUS.PROCESSING;
    taskProgress.value = Number(data.progress) || 0;

    if (data.result_urls?.[0]) {
      taskResultUrl.value = data.result_urls[0];
    }
  },
  onCompleted: (data) => {
    taskStatus.value = TASK_STATUS.COMPLETED;
    taskProgress.value = 100;
    taskResultUrl.value = data.result_urls?.[0] || "";
  },
  onFailed: (error, data) => {
    const isRequestError = isApiError(error);

    taskStatus.value = TASK_STATUS.FAILED;
    taskRetryCost.value = getTaskRetryCost(data);
    taskMessage.value = isRequestError
      ? "任务状态查询失败，请稍后在作品库确认结果。"
      : buildFailureNote(
          data,
          getErrorMessage(error, "生成失败，请稍后重试。"),
        );

    if (!isRequestError) {
      uni.showToast({
        title: data?.error_message || taskMessage.value,
        icon: "none",
      });
    }
  },
  onCanceled: () => applyCanceledState(),
});

// 任务取消后停止轮询，弹窗切换为已取消状态
const applyCanceledState = () => {
  stopPolling();
  taskStatus.value = TASK_STATUS.CANCELED;
  taskResultUrl.value = "";
  taskMessage.value = "";
};

// 在现有主旨后追加润色意象，空主旨时使用默认起笔句式
const polishPrompt = () => {
  prompt.value = polishPromptText(
    prompt.value,
    polishSuffix,
    `江南烟雨中的远山与归舟，${polishSuffix}`,
  );
};

// 用随机意象覆盖当前主旨
const randomPrompt = () => {
  prompt.value = randomPromptText;
};

/**
 * 将灵感词追加到画面主旨，已有内容时用逗号衔接。
 * @param {string} value 待追加的灵感词。
 * @returns {void}
 */
const appendPrompt = (value) => {
  prompt.value = appendPromptText(prompt.value, value);
};

// 返回上一页重新构思；页面栈为空时（如 H5 刷新后直达）回到构思页
const goBack = () => {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }

  uni.redirectTo({ url: "/pages/image-creation/index" });
};

// 校验构思内容后弹出生成确认
const handleSubmit = () => {
  if (isSubmitting.value) {
    return;
  }

  if (!selectedStyle.value) {
    uni.showToast({ title: "请先选择一种画风", icon: "none" });
    return;
  }

  if (!prompt.value.trim()) {
    uni.showToast({ title: "请先填写画面主旨意象", icon: "none" });
    return;
  }

  confirmVisible.value = true;
};

// 启动任务轮询并重置当前任务状态
const startTaskPolling = () => {
  taskProgress.value = 0;
  taskStatus.value = TASK_STATUS.PENDING;
  taskMessage.value = "";
  taskResultUrl.value = "";
  taskRetryCost.value = 0;
  startPolling();
};

const { cancelTask, retryTask, isCanceling, isRetrying } = useTaskActions({
  getTaskId: () => taskId.value,
  getRetryCost: () => taskRetryCost.value,
  onCanceled: () => applyCanceledState(),
  onRetried: () => startTaskPolling(),
});

// 保存当前文字生图参数。
const saveDraft = async () => {
  if (isSavingDraft.value || !prompt.value.trim()) {
    if (!prompt.value.trim())
      uni.showToast({ title: "请填写提示词", icon: "none" });
    return;
  }
  isSavingDraft.value = true;
  try {
    await persistEditingDraft("image", {
      prompt: prompt.value.trim(),
      style: selectedStyle.value,
      ratio: draft.value.ratio,
    });
    uni.showToast({ title: "草稿已保存", icon: "none" });
  } catch {
    uni.showToast({ title: "保存失败", icon: "none" });
  } finally {
    isSavingDraft.value = false;
  }
};

/**
 * 确认生成后创建文字生图任务。
 * @returns {Promise<void>}
 */
const confirmGenerate = async () => {
  if (isSubmitting.value) {
    return;
  }

  const requestData = {
    prompt: prompt.value.trim(),
    style: selectedStyle.value,
    ratio: draft.value.ratio || "1:1",
  };

  isSubmitting.value = true;

  try {
    const task = await submitImageGeneration({
      prompt: requestData.prompt,
      style: requestData.style,
      ratio: requestData.ratio,
      ...(getEditingDraft()?.task_type === "image"
        ? { draft_id: getEditingDraft().id }
        : {}),
    });

    if (!task?.task_id) {
      uni.showToast({ title: "任务创建失败，请重试", icon: "none" });
      return;
    }

    clearEditingDraft();
    confirmVisible.value = false;
    draft.value = { ...draft.value, ...requestData };
    saveCreationDraft(DRAFT_KEYS.image, draft.value);
    // 创建任务已扣减灵感点，刷新共享缓存供页头展示。
    loadPointsBalance({ force: true });
    taskId.value = task.task_id;
    progressVisible.value = true;
    startTaskPolling();
    taskStatus.value = task.status || TASK_STATUS.PENDING;
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

onShow(() => {
  const currentDraft = readCreationDraft(DRAFT_KEYS.image);

  if (!currentDraft?.style) {
    uni.showToast({ title: "请先完成构思意境", icon: "none" });
    uni.redirectTo({ url: "/pages/image-creation/index" });
    return;
  }

  draft.value = currentDraft;
  selectedStyle.value = currentDraft.style;
  prompt.value = currentDraft.prompt || "";
});
</script>

<style scoped lang="scss">
.flow-body {
  @include flow-body(3);
}

.prompt-count {
  flex-shrink: 0;
  color: $color-muted;
  font-size: 24rpx;
  font-weight: 400;
}

.prompt-input {
  width: 100%;
  height: 250rpx;
  font-size: 28rpx;
  line-height: 1.6;
  box-sizing: border-box;
}

.prompt-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
}

.prompt-tools button,
.suggestions button {
  @include tap-area(64rpx);
  gap: 8rpx;
  margin: 0;
  padding: 0 16rpx;
  border: 1rpx solid $color-line;
  border-radius: 12rpx;
  background: $color-surface;
  color: $color-primary-deep;
  font-size: 24rpx;
  line-height: 1;
}

.prompt-tools button:after,
.suggestions button:after {
  border: 0;
}

.tool-icon {
  font-size: 26rpx;
}

.prompt-tools text {
  margin-left: auto;
  color: $color-muted;
  font-size: 24rpx;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.suggestions button {
  color: #4e665e;
}

.tuning-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 16rpx 0;
  border-top: 1rpx solid $color-line;
}

.tuning-label {
  flex-shrink: 0;
  color: $color-ink;
  font-size: 28rpx;
  font-weight: 700;
}

.tuning-value {
  color: $color-muted;
  font-size: 24rpx;
}

.previous-button {
  width: 150rpx;
  flex-shrink: 0;
}

@media (min-width: $breakpoint-desktop) {
  .tuning-row {
    border-top: 0;
    flex-wrap: wrap;
  }
}
</style>
