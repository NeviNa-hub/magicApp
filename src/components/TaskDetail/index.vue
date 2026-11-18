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
          <view v-if="displayTitle || canRename" class="detail-work-row">
            <text class="detail-work">{{ displayTitle }}</text>
            <button v-if="canRename" class="rename-trigger" @tap="openRename">
              <view class="rename-icon"></view>
              <text class="rename-label">修改名称</text>
            </button>
          </view>
          <template v-if="isCompleted && resultUrl">
            <view
              v-if="currentType === 'video' && canRename"
              class="cover-settings"
            >
              <private-image
                v-if="coverId"
                class="cover-preview"
                :asset-id="coverId"
                :mock-url="coverUrl"
              />
              <button
                :disabled="isCoverUploading || isSavingCover"
                @tap="chooseCover"
              >
                {{
                  isCoverUploading
                    ? "封面上传中"
                    : isSavingCover
                      ? "保存中"
                      : coverId
                        ? "更换封面"
                        : "选择封面"
                }}
              </button>
              <button
                v-if="coverId"
                :disabled="isCoverUploading || isSavingCover"
                @tap="removeCover"
              >
                移除封面
              </button>
              <button v-if="isCoverUploading" @tap="cancelCoverUpload">
                取消上传
              </button>
              <button v-else-if="canRetryCover" @tap="retryCoverUpload">
                重试上传
              </button>
            </view>
            <video
              v-if="currentType === 'video'"
              :key="videoKey"
              class="result-video"
              :src="resultUrl"
              controls
              @error="handleVideoError"
            />
            <image-comparison
              v-else-if="currentType === 'optimization' && originalId"
              :original-id="originalId"
              :result-url="resultUrl"
            />
            <app-image
              v-else
              class="result-image"
              :src="resultUrl"
              mode="aspectFit"
              @tap="previewResult"
            />
            <view
              v-if="currentType === 'video' && videoError"
              class="video-error"
            >
              <text>视频播放失败，链接可能已过期</text>
              <app-flow-button
                variant="secondary"
                :loading="isRetryingVideo"
                @click="retryVideo"
              >
                重新加载
              </app-flow-button>
            </view>
            <text class="result-hint">{{ typeConfig.resultHint }}</text>
            <view v-if="canRename" class="media-actions">
              <app-flow-button :loading="isSaving" @click="saveResult">
                {{ currentType === "video" ? "保存视频" : "保存图片" }}
              </app-flow-button>
              <app-flow-button
                variant="secondary"
                :loading="isSharing"
                @click="shareResult"
              >
                分享作品
              </app-flow-button>
            </view>
            <view v-if="isSaving" class="download-status">
              <text>
                {{
                  savePhase === "saving"
                    ? "正在保存到相册…"
                    : downloadProgress === null
                      ? "正在准备下载…"
                      : `下载中 ${downloadProgress}%`
                }}
              </text>
              <button v-if="savePhase !== 'saving'" @tap="cancelSave">
                取消下载
              </button>
            </view>
          </template>
          <!-- 进度中展示进度环，任务结束后展示状态标签与提示 -->
          <template v-else-if="!isFinished">
            <view class="progress-ring">
              <text> {{ progress }}<text class="progress-unit">%</text></text>
              <label>{{ progressLabel }}</label>
            </view>
            <view class="progress-track">
              <view :style="{ width: `${progress}%` }"></view>
            </view>
          </template>
          <view v-if="tip" class="detail-tip">{{ tip }}</view>
          <view
            v-if="canCancel && !statusUnavailable"
            class="detail-task-action"
          >
            <app-flow-button
              variant="danger"
              block
              :loading="isCanceling"
              @click="cancelTask"
            >
              {{ isCanceling ? "正在取消…" : "取消创作" }}
            </app-flow-button>
          </view>
          <view v-else-if="statusUnavailable" class="detail-task-action">
            <app-flow-button
              block
              :loading="isRefreshingStatus"
              @click="refreshTaskStatus"
            >
              {{ isRefreshingStatus ? "正在查询…" : "重新查询状态" }}
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
    <app-bottom-sheet
      v-if="isRenameVisible"
      title="修改作品标题"
      placement="center"
      :close-on-mask="!isRenaming"
      @close="closeRename"
    >
      <!-- 预留 emoji 代理对占用的 UTF-16 空间，再由输入事件按 50 个字符截断。 -->
      <input
        v-model="renameTitle"
        class="rename-input"
        maxlength="100"
        placeholder="请输入作品标题"
        @input="renameTitle = normalizePromptInput($event.detail.value, 50)"
      />
      <text v-if="renameError" class="rename-error">{{ renameError }}</text>
      <template #footer>
        <view class="rename-actions">
          <app-flow-button
            variant="secondary"
            :disabled="isRenaming"
            @click="closeRename"
            >取消</app-flow-button
          >
          <app-flow-button :loading="isRenaming" @click="submitRename"
            >保存</app-flow-button
          >
        </view>
      </template>
    </app-bottom-sheet>
    <app-bottom-sheet
      v-if="isShareVisible"
      title="分享作品"
      placement="center"
      @close="closeShare"
    >
      <text class="share-note"
        >分享的是媒体原始链接，可能过期，请只分享给信任的人。</text
      >
      <template #footer>
        <view class="share-actions">
          <!-- #ifdef APP-PLUS -->
          <app-flow-button @click="shareWithSystem">系统分享</app-flow-button>
          <!-- #endif -->
          <!-- #ifdef H5 -->
          <app-flow-button v-if="canUseWebShare" @click="shareWithSystem"
            >系统分享</app-flow-button
          >
          <!-- #endif -->
          <app-flow-button variant="secondary" @click="copyShareLink"
            >复制链接</app-flow-button
          >
        </view>
      </template>
    </app-bottom-sheet>
    <app-bottom-nav active="works" desktop-only />
  </view>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import { TASK_STATUS } from "@/apis/constants";
import { USE_MOCK } from "@/apis/config";
import {
  getLibraryWorkMedia,
  updateLibraryWorkCover,
  updateLibraryWorkTitle,
} from "@/apis/creation";
import { getImageOptimizationTaskStatus } from "@/apis/image-optimization";
import { getImageTaskStatus } from "@/apis/text-to-image";
import { getVideoTaskStatus } from "@/apis/video-creation";
import AppBottomSheet from "@/components/AppBottomSheet/index.vue";
import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppFlowButton from "@/components/AppFlowButton/index.vue";
import AppImage from "@/components/AppImage/index.vue";
import ImageComparison from "@/components/ImageComparison/index.vue";
import PrivateImage from "@/components/PrivateImage/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import useTaskActions from "@/hooks/useTaskActions";
import useTaskPolling from "@/hooks/useTaskPolling";
import useImageUpload from "@/hooks/useImageUpload";
import { getErrorMessage, isApiError } from "@/utils/request";
import { saveWorkMedia } from "@/utils/save-work-media";
import { countPromptCharacters, normalizePromptInput } from "@/utils/prompt";
import { showMediaPermissionHelp } from "@/utils/media-permission";
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
 * @property {string} workId 已完成作品的标识，用于修改标题。
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
  workId: { type: String, default: "" },
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
const displayTitle = ref(props.title);
const isRenameVisible = ref(false);
const renameTitle = ref("");
const renameError = ref("");
const isRenaming = ref(false);
const coverId = ref(null);
const coverUrl = ref("");
const isSavingCover = ref(false);
let coverGeneration = 0;
const isSaving = ref(false);
const savePhase = ref("");
const downloadProgress = ref(null);
let saveController = null;
let saveGeneration = 0;
const isSharing = ref(false);
const isShareVisible = ref(false);
const shareUrl = ref("");
let shareGeneration = 0;
// #ifdef H5
const canUseWebShare =
  typeof navigator !== "undefined" && typeof navigator.share === "function";
// #endif
const status = ref(TASK_STATUS.PENDING);
const progress = ref(0);
const resultUrl = ref("");
const originalId = ref("");
const videoError = ref(false);
const videoKey = ref(0);
const isRetryingVideo = ref(false);
let videoRequestId = 0;
let pollingRefreshGeneration = 0;
const failureMessage = ref("");
const statusUnavailable = ref(false);
const isRefreshingStatus = ref(false);
const costPoints = ref(null);
const refundPoints = ref(0);
const retryCostPoints = ref(0);

/**
 * 保存封面资源并更新预览。
 * @param {number|string|null} assetId 本人图片资源标识。
 * @param {string} localUrl 模拟模式的图片路径。
 * @returns {Promise<void>} 无返回值。
 */
const saveCover = async (assetId, localUrl = "") => {
  if (isSavingCover.value) return;
  const version = ++coverGeneration;
  isSavingCover.value = true;
  try {
    const result = await updateLibraryWorkCover(
      { workId: props.workId },
      { cover_asset_id: assetId },
    );
    if (version !== coverGeneration) return;
    coverId.value = result.cover_asset_id;
    coverUrl.value = localUrl;
    uni.showToast({ title: "封面已更新", icon: "none" });
  } catch (error) {
    if (!isApiError(error))
      uni.showToast({
        title: getErrorMessage(error, "封面保存失败"),
        icon: "none",
      });
  } finally {
    if (version === coverGeneration) isSavingCover.value = false;
  }
};

const {
  isUploading: isCoverUploading,
  canRetryUpload: canRetryCover,
  chooseImage: chooseCover,
  retryUpload: retryCoverUpload,
  cancelUpload: cancelCoverUpload,
} = useImageUpload((image) => {
  const assetId = USE_MOCK ? image.uploadId : Number(image.uploadId);
  saveCover(assetId, image.path);
});

// 移除关联，不删除用户上传的图片。
const removeCover = () => {
  saveCover(null);
};

// 打开详情时读取已保存的封面。
const loadCover = async () => {
  const version = coverGeneration;
  try {
    const result = await getLibraryWorkMedia(
      { workId: props.workId },
      { silent: true },
    );
    if (version !== coverGeneration) return;
    coverId.value = result.cover_asset_id || null;
    coverUrl.value = result.cover_url || "";
  } catch {
    if (version === coverGeneration) coverId.value = null;
  }
};

const typeConfig = computed(() => TYPE_CONFIGS[currentType.value]);
const displayCost = computed(() => costPoints.value ?? typeConfig.value.cost);
const statusTag = computed(
  () => STATUS_TAGS[status.value] || STATUS_TAGS[TASK_STATUS.PENDING],
);
const isCompleted = computed(() => status.value === TASK_STATUS.COMPLETED);
const canRename = computed(
  () =>
    props.from === "library" && Number(props.workId) > 0 && isCompleted.value,
);
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
  if (statusUnavailable.value) {
    return failureMessage.value || "暂时无法获取任务状态，请稍后重试。";
  }

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
    statusUnavailable.value = false;
    failureMessage.value = "";
    syncTaskType(data);
    syncTaskCost(data);
    syncTaskBilling(data);
    originalId.value = String(data.original_upload_id || "");
    status.value = data.status || TASK_STATUS.PROCESSING;
    progress.value = Number(data.progress) || 0;

    if (data.result_urls?.[0]) {
      resultUrl.value = data.result_urls[0];
    }
  },
  onCompleted: (data) => {
    statusUnavailable.value = false;
    failureMessage.value = "";
    syncTaskType(data);
    syncTaskCost(data);
    syncTaskBilling(data);
    status.value = TASK_STATUS.COMPLETED;
    progress.value = 100;
    resultUrl.value = data.result_urls?.[0] || "";
  },
  onFailed: (error, data) => {
    if (data) {
      syncTaskType(data);
      syncTaskCost(data);
      syncTaskBilling(data);
    }

    status.value = TASK_STATUS.FAILED;
    failureMessage.value = buildFailureNote(
      data,
      getErrorMessage(error, "任务进度获取失败，请稍后重试"),
    );
    uni.showToast({
      title: data?.error_message || failureMessage.value,
      icon: "none",
    });
  },
  onUnavailable: () => {
    statusUnavailable.value = true;
    failureMessage.value = "暂时无法获取任务状态，任务仍可能在处理中。";
  },
  onCanceled: (data) => applyCanceledState(data),
});

// 状态查询恢复后继续查询当前任务，不重复创建任务或扣费
const refreshTaskStatus = async () => {
  if (isRefreshingStatus.value) return;
  isRefreshingStatus.value = true;
  const generation = ++pollingRefreshGeneration;
  statusUnavailable.value = false;
  try {
    const data = await fetchTaskStatus();
    if (generation !== pollingRefreshGeneration) return;
    statusUnavailable.value = false;
    syncTaskType(data);
    syncTaskCost(data);
    syncTaskBilling(data);
    status.value = data.status || TASK_STATUS.PROCESSING;
    progress.value = Number(data.progress) || 0;
    resultUrl.value = data.result_urls?.[0] || "";
    if (data.status === TASK_STATUS.COMPLETED) {
      status.value = TASK_STATUS.COMPLETED;
      progress.value = 100;
      failureMessage.value = "";
      stopPolling();
      return;
    }
    if (data.status === TASK_STATUS.FAILED) {
      status.value = TASK_STATUS.FAILED;
      failureMessage.value = buildFailureNote(data, "任务处理失败，请稍后重试");
    } else if (data.status === TASK_STATUS.CANCELED) {
      applyCanceledState(data);
    } else {
      failureMessage.value = "";
      if (![TASK_STATUS.COMPLETED, TASK_STATUS.CANCELED].includes(data.status))
        startPolling();
    }
  } catch (error) {
    if (generation !== pollingRefreshGeneration) return;
    statusUnavailable.value = true;
    failureMessage.value = "暂时无法获取任务状态，请检查网络后重试。";
  } finally {
    if (generation === pollingRefreshGeneration)
      isRefreshingStatus.value = false;
  }
};

/**
 * 取消成功后停止轮询并展示已取消状态。
 * @param {Object} [data] 取消接口返回的任务状态。
 * @returns {void}
 */
const applyCanceledState = (data = {}) => {
  stopPolling();
  statusUnavailable.value = false;
  isRefreshingStatus.value = false;
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

// 打开标题编辑并重置输入状态。
const openRename = () => {
  renameTitle.value = displayTitle.value;
  renameError.value = "";
  isRenameVisible.value = true;
};

// 提交期间保留弹窗，避免重复提交。
const closeRename = () => {
  if (!isRenaming.value) isRenameVisible.value = false;
};

// 校验并保存作品标题，成功后同步详情显示。
const submitRename = async () => {
  if (isRenaming.value || !canRename.value) return;
  const title = renameTitle.value.trim();
  if (!title || countPromptCharacters(title) > 50) {
    renameError.value = "请输入 1 至 50 字的作品标题";
    return;
  }
  isRenaming.value = true;
  try {
    await updateLibraryWorkTitle({ workId: props.workId }, { title });
    displayTitle.value = title;
    isRenameVisible.value = false;
    uni.showToast({ title: "标题已修改", icon: "none" });
  } catch (error) {
    renameError.value = getErrorMessage(error, "修改失败，请重试");
  } finally {
    isRenaming.value = false;
  }
};

// 取消下载并让未完成的请求结果失效。
const cancelSave = () => {
  saveGeneration += 1;
  saveController?.abort();
  saveController = null;
  isSaving.value = false;
  savePhase.value = "";
};

// 保存媒体文件并展示下载进度。
const saveResult = async () => {
  if (isSaving.value) return;
  const current = ++saveGeneration;
  saveController = new AbortController();
  const signal = saveController.signal;
  isSaving.value = true;
  savePhase.value = "downloading";
  downloadProgress.value = null;
  try {
    const media = await getLibraryWorkMedia({ workId: props.workId });
    if (current !== saveGeneration || signal.aborted) return;
    if (!/^https?:\/\//i.test(media.media_url || ""))
      throw new Error("媒体地址不可用");
    await saveWorkMedia(media, {
      signal,
      onProgress: (progress) => {
        if (current === saveGeneration) downloadProgress.value = progress;
      },
      onSaving: () => {
        if (current === saveGeneration) savePhase.value = "saving";
      },
    });
    if (current !== saveGeneration) return;
    // #ifdef H5
    uni.showToast({ title: "已开始下载", icon: "none" });
    // #endif
    // #ifndef H5
    uni.showToast({ title: "已保存到相册", icon: "none" });
    // #endif
  } catch (error) {
    if (current === saveGeneration && !signal.aborted && !isApiError(error)) {
      if (!showMediaPermissionHelp(error.platformError, "保存作品到相册")) {
        uni.showToast({
          title: getErrorMessage(error, "保存失败，请稍后重试"),
          icon: "none",
        });
      }
    }
  } finally {
    if (current === saveGeneration) {
      saveController = null;
      isSaving.value = false;
      savePhase.value = "";
    }
  }
};

// 获取本人作品地址后展示分享选择，明确提醒链接有效期。
const shareResult = async () => {
  if (isSharing.value) return;
  const current = ++shareGeneration;
  isSharing.value = true;
  try {
    const media = await getLibraryWorkMedia({ workId: props.workId });
    if (current !== shareGeneration) return;
    if (!/^https?:\/\//i.test(media.media_url || ""))
      throw new Error("媒体地址不可用");
    shareUrl.value = media.media_url;
    isShareVisible.value = true;
  } catch (error) {
    if (current === shareGeneration && !isApiError(error)) {
      uni.showToast({
        title: getErrorMessage(error, "分享失败，请稍后重试"),
        icon: "none",
      });
    }
  } finally {
    if (current === shareGeneration) isSharing.value = false;
  }
};

// 关闭分享弹窗并清除临时链接。
const closeShare = () => {
  isShareVisible.value = false;
  shareUrl.value = "";
};

// 复制媒体链接；链接有效期由媒体服务决定。
const copyShareLink = () => {
  if (!shareUrl.value) return;
  uni.setClipboardData({
    data: shareUrl.value,
    success: () => {
      closeShare();
      uni.showToast({ title: "链接已复制，可能过期", icon: "none" });
    },
    fail: () => uni.showToast({ title: "复制失败，请重试", icon: "none" }),
  });
};

// 系统分享由用户再次点击触发，满足浏览器的用户交互要求。
const shareWithSystem = async () => {
  if (!shareUrl.value) return;
  // #ifdef H5
  try {
    await navigator.share({
      title: displayTitle.value || "我的作品",
      url: shareUrl.value,
    });
    closeShare();
  } catch (error) {
    if (error?.name !== "AbortError")
      uni.showToast({ title: "系统分享不可用，可复制链接", icon: "none" });
  }
  // #endif
  // #ifdef APP-PLUS
  if (typeof uni.shareWithSystem !== "function") {
    uni.showToast({ title: "系统分享不可用，可复制链接", icon: "none" });
    return;
  }
  uni.shareWithSystem({
    type: "text",
    summary: `${displayTitle.value || "我的作品"} ${shareUrl.value}`,
    href: shareUrl.value,
    success: () => closeShare(),
    fail: (error) => {
      if (
        !String(error?.errMsg || "")
          .toLowerCase()
          .includes("cancel")
      ) {
        uni.showToast({ title: "系统分享不可用，可复制链接", icon: "none" });
      }
    },
  });
  // #endif
};

// 展示视频播放失败状态。
const handleVideoError = () => {
  videoError.value = true;
};

// 重新查询媒体地址并重新加载视频。
const retryVideo = async () => {
  if (isRetryingVideo.value) return;
  isRetryingVideo.value = true;
  const requestId = ++videoRequestId;
  try {
    const data =
      props.from === "library" && Number(props.workId) > 0
        ? await getLibraryWorkMedia({ workId: props.workId })
        : await fetchTaskStatus();
    if (requestId !== videoRequestId) return;
    const url = data.media_url || data.result_urls?.[0];
    if (!url) throw new Error("视频地址不可用，请稍后重试");
    resultUrl.value = url;
    videoError.value = false;
    videoKey.value += 1;
  } catch (error) {
    if (requestId === videoRequestId && !isApiError(error)) {
      uni.showToast({
        title: getErrorMessage(error, "视频加载失败"),
        icon: "none",
      });
    }
  } finally {
    if (requestId === videoRequestId) isRetryingVideo.value = false;
  }
};

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

watch(
  () => props.title,
  (title) => {
    displayTitle.value = title;
  },
);

onUnmounted(() => {
  coverGeneration += 1;
  cancelSave();
  videoRequestId += 1;
  shareGeneration += 1;
});

onMounted(() => {
  if (props.workId && props.type === "video") loadCover();
  if (!props.taskId) {
    uni.showToast({ title: "缺少任务标识", icon: "none" });
    return;
  }

  startPolling();
});
</script>

<style scoped lang="scss">
.cover-settings {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.cover-preview {
  width: 120rpx;
  height: 80rpx;
  border-radius: 12rpx;
}
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

.detail-work-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
}

.detail-work {
  flex: 1;
  min-width: 0;
  color: $color-muted;
  font-size: 24rpx;
  line-height: 1.5;
  text-align: left;
  @include text-ellipsis;
}

.rename-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 60rpx;
  height: 60rpx;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: $color-primary;

  &::after {
    border: 0;
  }
}

.rename-icon {
  width: 24rpx;
  height: 7rpx;
  border: 2rpx solid currentColor;
  border-radius: 2rpx;
  transform: rotate(-45deg);
}

.rename-label {
  display: none;
}
.rename-input {
  padding: 16rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
}
.rename-error {
  display: block;
  margin-top: 10rpx;
  color: #b93a2f;
  font-size: 24rpx;
}
.rename-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
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

.share-note {
  display: block;
  color: $color-muted;
  font-size: 24rpx;
  line-height: 1.6;
}

.share-actions {
  display: flex;
  justify-content: center;
  gap: 16rpx;
}

.download-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 12rpx;
  color: $color-muted;
  font-size: 24rpx;

  button {
    margin: 0;
    font-size: 24rpx;
  }
}

.media-actions {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  margin-top: 20rpx;
}

.video-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-top: 16rpx;
  color: $color-danger;
  font-size: 24rpx;
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
  .detail-card.has-result .detail-work-row,
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

  .detail-work-row {
    margin-top: 10px;
  }

  .detail-work {
    font-size: 14px;
  }

  .rename-trigger {
    width: auto;
    height: auto;
    gap: 8px;
    padding: 6px 12px;
    border: 1px solid rgba(184, 134, 78, 0.35);
    border-radius: 999px;
    font-size: 13px;
  }

  .rename-icon {
    width: 12px;
    height: 4px;
    border-width: 1px;
  }

  .rename-label {
    display: block;
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
