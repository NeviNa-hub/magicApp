<template>
  <!-- 进度弹窗不提供遮罩关闭，避免任务进行中误触后失去进度入口 -->
  <app-bottom-sheet
    class="generation-dialog"
    placement="bottom"
    align="center"
    :title="dialogTitle"
    :close-on-mask="false"
  >
    <template v-if="status === 'completed' && resultUrl && type === 'video'">
      <video class="result-image" :src="resultUrl" controls />
      <text class="result-hint">视频链接可能过期，请及时保存</text>
    </template>
    <template
      v-else-if="status === 'completed' && resultUrl && type === 'optimization'"
    >
      <image-comparison
        :original-url="originalUrl"
        :original-id="originalId"
        :result-url="resultUrl"
      />
    </template>
    <template v-else-if="status === 'completed' && resultUrl">
      <view class="result-preview">
        <app-image
          class="result-image"
          :src="resultUrl"
          mode="aspectFit"
          @tap="previewResult"
        />
      </view>
      <text class="result-hint"
        >轻触图片放大查看；图片链接约 1 小时后失效，请及时保存</text
      >
    </template>
    <view v-else-if="status === 'canceled'" class="canceled-mark">已取消</view>
    <template v-else>
      <view class="progress-circle">
        {{ progress }}<text class="progress-unit">%</text>
      </view>
      <text class="progress-label">{{ progressLabel }}</text>
    </template>
    <text class="progress-note">{{ note }}</text>
    <view
      v-if="showCancelAction || showRetryAction || showRefreshAction"
      class="progress-actions"
    >
      <app-flow-button
        v-if="showCancelAction"
        variant="danger"
        block
        :loading="canceling"
        :disabled="retrying"
        @click="$emit('cancel')"
      >
        {{ canceling ? "正在取消…" : "取消创作" }}
      </app-flow-button>
      <app-flow-button
        v-if="showRefreshAction"
        block
        :loading="refreshing"
        @click="$emit('refresh')"
      >
        {{ refreshing ? "正在查询…" : "重新查询状态" }}
      </app-flow-button>
      <app-flow-button
        v-else-if="showRetryAction"
        block
        :loading="retrying"
        :disabled="canceling"
        @click="$emit('retry')"
      >
        {{ retrying ? "正在重试…" : "重试创作" }}
      </app-flow-button>
    </view>

    <template #footer>
      <app-flow-button variant="secondary" block @click="$emit('back')">
        <!-- #ifdef H5 -->
        <el-icon class="action-icon"><House /></el-icon>
        <!-- #endif -->
        返回工作台
      </app-flow-button>
      <app-flow-button block @click="$emit('library')">
        <!-- #ifdef H5 -->
        <el-icon class="action-icon"><Collection /></el-icon>
        <!-- #endif -->
        前往作品库查看
      </app-flow-button>
    </template>
  </app-bottom-sheet>
</template>

<script setup>
import { computed } from "vue";

import { TASK_STATUS } from "@/apis/constants";
import AppBottomSheet from "@/components/AppBottomSheet/index.vue";
import AppFlowButton from "@/components/AppFlowButton/index.vue";
import AppImage from "@/components/AppImage/index.vue";
import ImageComparison from "@/components/ImageComparison/index.vue";

// #ifdef H5
import { Collection, House } from "@element-plus/icons-vue";
// #endif

/**
 * 生成弹窗组件。
 * @param title 弹窗标题，为空时按任务类型使用默认文案。
 * @param progress 当前生成进度。
 * @param progressLabel 进度说明。
 * @param note 弹窗提示。
 * @param status 任务状态，完成时切换为结果展示。
 * @param resultUrl 生成结果地址，任务完成时展示。
 * @param originalUrl 优化原图本地地址。
 * @param originalId 优化原图上传标识。
 * @param canceling 是否正在提交取消请求。
 * @param retrying 是否正在提交重试请求。
 * @param statusUnavailable 任务状态暂时无法查询。
 * @param refreshing 是否正在重新查询。
 */
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "creation",
  },
  progress: {
    type: [String, Number],
    default: 0,
  },
  progressLabel: {
    type: String,
    default: "生成进度",
  },
  note: {
    type: String,
    default: "已进入云端渲染，期间离开或切换页面不影响生成，可在作品库查看。",
  },
  status: {
    type: String,
    default: "",
  },
  resultUrl: {
    type: String,
    default: "",
  },
  originalUrl: { type: String, default: "" },
  originalId: { type: String, default: "" },
  canceling: {
    type: Boolean,
    default: false,
  },
  retrying: {
    type: Boolean,
    default: false,
  },
  statusUnavailable: {
    type: Boolean,
    default: false,
  },
  refreshing: {
    type: Boolean,
    default: false,
  },
});
defineEmits(["back", "library", "cancel", "retry", "refresh"]);

const dialogTitle = computed(
  () =>
    props.title || (props.type === "optimization" ? "淬炼重绘" : "研墨成画"),
);

// 进行中的任务可取消，失败的任务可重试；两者互斥
const showCancelAction = computed(
  () =>
    props.status === TASK_STATUS.PENDING ||
    props.status === TASK_STATUS.PROCESSING,
);
const showRetryAction = computed(() => props.status === TASK_STATUS.FAILED);
const showRefreshAction = computed(() => props.statusUnavailable);

// 预览生成结果大图
const previewResult = () => {
  if (!props.resultUrl) {
    return;
  }

  uni.previewImage({ urls: [props.resultUrl] });
};
</script>

<style scoped lang="scss">
@media (min-width: $breakpoint-desktop) {
  .generation-dialog {
    align-items: center;
    justify-content: center;

    :deep(.sheet.is-bottom) {
      border-radius: 20px;
    }
  }
}

.progress-circle {
  width: 150rpx;
  height: 150rpx;
  margin: 24rpx auto 20rpx;
  border: 6rpx solid $color-primary;
  border-radius: 50%;
  color: $color-ink;
  font-size: 56rpx;
  font-weight: 700;
  line-height: 150rpx;
  @include numeric;
}

.progress-unit {
  font-size: 24rpx;
  font-weight: 400;
}

.progress-label {
  display: block;
  color: $color-primary;
  font-size: 24rpx;
  font-weight: 700;
}

.progress-note {
  display: block;
  margin: 24rpx 0;
  color: $color-muted;
  font-size: 24rpx;
  line-height: 1.6;
}

.canceled-mark {
  width: 220rpx;
  margin: 28rpx auto 12rpx;
  padding: 24rpx 0;
  border: 2rpx dashed #cfd8d3;
  border-radius: 24rpx;
  background: #f6f7f6;
  color: $color-muted;
  font-size: 28rpx;
  font-weight: 700;
}

.progress-actions {
  display: flex;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.result-preview {
  height: 480rpx;
  margin: 24rpx 0 12rpx;
  border-radius: 24rpx;
  overflow: hidden;
  background: #f8faf7;
}

.result-image {
  width: 100%;
  height: 100%;
}

.result-hint {
  display: block;
  color: $color-muted;
  font-size: 22rpx;
}

.action-icon {
  font-size: 22rpx;
}
</style>
