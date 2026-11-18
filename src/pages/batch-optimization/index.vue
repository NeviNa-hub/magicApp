<template>
  <creation-page title="批量图片优化">
    <view class="batch-page">
      <view class="description">
        最多选择 9 张图片，使用同一提示词逐张创建任务。
      </view>
      <button :disabled="isBusy || rows.length >= 9" @tap="chooseBatch">
        选择图片
      </button>
      <textarea
        v-model="prompt"
        :disabled="isBusy"
        :maxlength="promptLimit * 2"
        placeholder="描述希望优化的效果"
        @input="prompt = normalizePromptInput($event.detail.value, promptLimit)"
      />
      <view class="description">
        {{ promptCharacterCount }} / {{ promptLimit }} 字
      </view>
      <view class="description">
        提交前显示预计积分，实际扣费以每项任务创建结果为准。
      </view>
      <view class="description">
        提交未确认的图片可在本机重新进入页面后重试，已创建任务可在作品库查看。
      </view>
      <view v-for="row in rows" :key="row.id" class="batch-row">
        <image
          v-if="row.path"
          class="thumbnail"
          :src="row.path"
          mode="aspectFill"
        />
        <view class="row-content">
          <text class="row-name">{{ row.name }}</text>
          <text class="row-status">{{ row.message }}</text>
          <text v-if="row.lockedPrompt && !row.taskId" class="row-prompt">
            重试提示词：{{ row.lockedPrompt }}</text
          >
        </view>
        <button v-if="row.taskId" @tap="openTask(row)">查看</button>
        <button v-else :disabled="isBusy" @tap="removeRow(row)">移除</button>
      </view>
    </view>
    <template #footer>
      <app-flow-button block :loading="isBusy" @click="submitBatch">
        提交待处理图片
      </app-flow-button>
    </template>
  </creation-page>
</template>

<script setup>
import { computed, onUnmounted, ref } from "vue";

import {
  createImageOptimization,
  getImageOptimizationTaskStatus,
} from "@/apis/image-optimization";
import { getCreationQuote } from "@/apis/pricing";
import { uploadImage } from "@/apis/upload";
import { USE_MOCK } from "@/apis/config";
import { ERROR_CODES } from "@/apis/constants";
import AppFlowButton from "@/components/AppFlowButton/index.vue";
import CreationPage from "@/components/CreationPage/index.vue";
import { loadPointsBalance, sessionState } from "@/stores";
import { chooseImages } from "@/utils/image-picker";
import { showMediaPermissionHelp } from "@/utils/media-permission";
import { countPromptCharacters, normalizePromptInput } from "@/utils/prompt";
const currentUserId = sessionState.user?.userId;
const recoveryKey =
  currentUserId && !USE_MOCK
    ? `batch_optimization_pending_${currentUserId}`
    : "";
const savedPending = recoveryKey ? uni.getStorageSync(recoveryKey) : [];
const rows = ref(
  Array.isArray(savedPending)
    ? savedPending.map((item, index) => ({
        id: index + 1,
        name: "已上传图片",
        uploadId: item.uploadId,
        lockedPrompt: item.prompt,
        requestKey: item.requestKey,
        taskId: "",
        error: "",
        message: "提交未确认，可安全重试",
      }))
    : [],
);
const prompt = ref("");
const promptLimit = 200;
const promptCharacterCount = computed(() =>
  countPromptCharacters(prompt.value),
);
const isBusy = ref(false);
let sequence = rows.value.length;
let active = true;
let pollTimer = null;
let pollVersion = 0;

/**
 * 保存或清除单项未确认请求，避免不同页面实例覆盖彼此的数据。
 * @param {Object} row 任务项。
 * @param {boolean} save 是否保存。
 * @returns {void}
 */
const updatePending = (row, save) => {
  if (!recoveryKey || !row.requestKey) return;
  const stored = uni.getStorageSync(recoveryKey);
  const pending = Array.isArray(stored)
    ? stored.filter((item) => item.requestKey !== row.requestKey)
    : [];
  if (save)
    pending.push({
      uploadId: row.uploadId,
      prompt: row.lockedPrompt,
      requestKey: row.requestKey,
    });
  if (pending.length) uni.setStorageSync(recoveryKey, pending);
  else uni.removeStorageSync(recoveryKey);
};

// 选择图片后逐项展示校验错误。
const chooseBatch = async () => {
  if (isBusy.value || rows.value.length >= 9) return;
  isBusy.value = true;
  try {
    const selected = await chooseImages(9 - rows.value.length);
    if (!active) return;
    rows.value.push(
      ...selected.map(({ image, error }) => ({
        ...image,
        id: ++sequence,
        taskId: "",
        uploadId: "",
        lockedPrompt: "",
        error,
        message: error || "待提交",
      })),
    );
  } catch (error) {
    if (!String(error?.errMsg || "").includes("cancel")) {
      if (!showMediaPermissionHelp(error, "选择图片")) {
        uni.showToast({ title: "选择图片失败", icon: "none" });
      }
    }
  } finally {
    if (active) isBusy.value = false;
  }
};

/**
 * 移除尚未创建任务的图片。
 * @param {Object} row 图片项。
 * @returns {void}
 */
const removeRow = (row) => {
  if (isBusy.value) return;
  const remove = () => {
    rows.value = rows.value.filter((item) => item.id !== row.id);
    updatePending(row, false);
  };
  if (!row.requestKey) {
    remove();
    return;
  }
  uni.showModal({
    title: "移除未确认的任务",
    content: "任务可能已创建。移除后请先在作品库核对，避免重复提交。",
    success: (result) => {
      if (result.confirm) remove();
    },
  });
};

/**
 * 打开已创建任务的详情。
 * @param {Object} row 图片项。
 * @returns {void}
 */
const openTask = (row) => {
  uni.navigateTo({
    url: `/pages/work-detail/index?type=optimization&taskId=${encodeURIComponent(row.taskId)}`,
  });
};

// 刷新任务状态；离开页面后不再轮询。
const refreshTasks = async (version = pollVersion) => {
  const pending = rows.value.filter((row) => row.taskId && !row.finished);
  await Promise.all(
    pending.map(async (row) => {
      try {
        const task = await getImageOptimizationTaskStatus(
          { taskId: row.taskId },
          { silent: true },
        );
        if (!active || version !== pollVersion) return;
        const labels = {
          pending: "排队中",
          processing: "优化中",
          completed: "已完成",
          failed: "失败，可查看详情",
          canceled: "已取消",
        };
        row.message = labels[task.status] || "状态更新中";
        row.finished = ["completed", "failed", "canceled"].includes(
          task.status,
        );
      } catch {
        if (active && version === pollVersion)
          row.message = "状态查询失败，稍后重试";
      }
    }),
  );
  if (
    active &&
    version === pollVersion &&
    rows.value.some((row) => row.taskId && !row.finished)
  ) {
    pollTimer = setTimeout(() => refreshTasks(version), 5000);
  }
};

// 预估费用并确认后，逐张上传和创建独立任务。
const submitBatch = async () => {
  if (isBusy.value) return;
  if (!USE_MOCK && !recoveryKey) {
    uni.showToast({ title: "用户信息不可用，请重新登录", icon: "none" });
    return;
  }
  const pending = rows.value.filter((row) => !row.taskId && !row.error);
  const currentPrompt = normalizePromptInput(prompt.value.trim(), promptLimit);
  if (
    !pending.length ||
    (!currentPrompt && pending.some((row) => !row.lockedPrompt))
  ) {
    uni.showToast({ title: "请选择图片并填写提示词", icon: "none" });
    return;
  }
  isBusy.value = true;
  try {
    const quotes = await Promise.all(
      pending.map((row) =>
        getCreationQuote({
          task_type: "optimization",
          prompt: row.lockedPrompt || currentPrompt,
        }),
      ),
    );
    if (
      quotes.some(
        (quote) =>
          typeof quote?.cost_points !== "number" ||
          !Number.isFinite(quote.cost_points),
      )
    ) {
      throw new Error("暂时无法获取报价，请重试");
    }
    const total = quotes.reduce(
      (sum, quote) => sum + Number(quote.cost_points),
      0,
    );
    const confirmed = await new Promise((resolve) =>
      uni.showModal({
        title: "确认批量创作",
        content: `共 ${pending.length} 张，预计消耗 ${total} 积分；逐张创建，实际扣费以服务端为准。`,
        success: (result) => resolve(Boolean(result.confirm)),
        fail: () => resolve(false),
      }),
    );
    if (!confirmed || !active) return;
    for (const row of pending) {
      if (!active) break;
      try {
        if (!row.uploadId) {
          row.message = "上传中";
          const upload = await uploadImage({
            file_path: row.path,
            name: row.name,
          });
          if (!upload?.upload_id) throw new Error("上传结果无效");
          row.uploadId = upload.upload_id;
        }
        if (!active) break;
        row.lockedPrompt ||= currentPrompt;
        row.message = "创建任务中";
        const payload = USE_MOCK
          ? { image_path: row.path }
          : { upload_id: row.uploadId };
        row.requestKey ||= `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
        // 先保存幂等标识再提交，保存失败时不发起扣费请求。
        updatePending(row, true);
        const task = await createImageOptimization(
          { ...payload, prompt: row.lockedPrompt },
          row.requestKey,
        );
        if (!task?.task_id) throw new Error("任务结果无效");
        row.taskId = task.task_id;
        updatePending(row, false);
        row.message = "排队中";
        loadPointsBalance({ force: true });
      } catch (error) {
        row.message = row.uploadId
          ? "提交未确认，请使用原提示词重试"
          : "上传失败，请重试";
        if (error?.code === ERROR_CODES.UNAUTHORIZED) break;
      }
    }
    pollVersion += 1;
    clearTimeout(pollTimer);
    if (active) refreshTasks();
  } catch (error) {
    if (active)
      uni.showToast({
        title: error?.message || "获取报价失败，请重试",
        icon: "none",
      });
  } finally {
    if (active) isBusy.value = false;
  }
};

onUnmounted(() => {
  active = false;
  pollVersion += 1;
  clearTimeout(pollTimer);
});
</script>

<style scoped lang="scss">
.batch-page {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 24rpx;
}

.description,
.row-status,
.row-prompt {
  color: #6f8179;
  font-size: 24rpx;
}

textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 180rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #fff;
}

.batch-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #fff;
}

.thumbnail {
  flex-shrink: 0;
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
}

.row-content {
  flex: 1;
  min-width: 0;
}

.row-name,
.row-status,
.row-prompt {
  display: block;
  overflow-wrap: anywhere;
}

.batch-row button {
  flex-shrink: 0;
  margin: 0;
  font-size: 24rpx;
}
</style>
