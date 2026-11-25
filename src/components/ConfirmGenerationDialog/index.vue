<template>
  <!-- 确认结果由底部按钮决定，点击遮罩不关闭，避免误触丢失当前配置 -->
  <app-bottom-sheet placement="bottom" :title="title" :close-on-mask="false">
    <view class="dialog-meta">
      <view class="meta-row">
        <!-- #ifdef H5 -->
        <el-icon class="meta-icon"><Lightning /></el-icon>
        <!-- #endif -->
        <!-- #ifndef H5 -->
        <text class="meta-icon meta-icon-text">耗</text>
        <!-- #endif -->
        <text>本次消耗积分</text>
        <text class="meta-value">-{{ cost }} 积分</text>
      </view>
      <view v-if="tokens > 0" class="meta-row">
        <!-- #ifdef H5 -->
        <el-icon class="meta-icon"><Coin /></el-icon>
        <!-- #endif -->
        <!-- #ifndef H5 -->
        <text class="meta-icon meta-icon-text">量</text>
        <!-- #endif -->
        <text>预计消耗 token</text>
        <text class="meta-value">{{ tokens }} tokens</text>
      </view>
      <view class="meta-row">
        <!-- #ifdef H5 -->
        <el-icon class="meta-icon"><Timer /></el-icon>
        <!-- #endif -->
        <!-- #ifndef H5 -->
        <text class="meta-icon meta-icon-text">时</text>
        <!-- #endif -->
        <text>预计生成耗时</text>
        <text class="meta-value">{{ estimatedTime }}</text>
      </view>
    </view>
    <text class="dialog-note">{{ note }}</text>

    <template #footer>
      <app-flow-button
        variant="secondary"
        block
        :disabled="loading"
        @click="$emit('cancel')"
      >
        再斟酌下
      </app-flow-button>
      <app-flow-button block :loading="loading" @click="$emit('confirm')">
        {{ confirmText }}
        <!-- #ifdef H5 -->
        <el-icon v-if="!loading" class="confirm-icon">
          <ArrowRight />
        </el-icon>
        <!-- #endif -->
      </app-flow-button>
    </template>
  </app-bottom-sheet>
</template>

<script setup>
import AppBottomSheet from "@/components/AppBottomSheet/index.vue";
import AppFlowButton from "@/components/AppFlowButton/index.vue";

// #ifdef H5
import { ArrowRight, Coin, Lightning, Timer } from "@element-plus/icons-vue";
// #endif

defineProps({
  /** 弹窗标题。 */
  title: { type: String, default: "确认研墨成画" },
  /** 本次消耗的积分。 */
  cost: { type: [String, Number], default: 4 },
  /** 本次任务的预计 token 消耗，为 0 时不展示。 */
  tokens: { type: Number, default: 0 },
  /** 预计生成耗时。 */
  estimatedTime: { type: String, default: "约 6~8 秒" },
  /** 弹窗说明。 */
  note: {
    type: String,
    default:
      "确认后将送往云端研磨，期间离开或切换页面均不影响生成，可在作品库静候收卷。",
  },
  /** 确认按钮文案。 */
  confirmText: { type: String, default: "确认研墨成画" },
  /** 是否正在提交任务，提交中禁用操作并展示加载状态。 */
  loading: { type: Boolean, default: false },
});

defineEmits(["cancel", "confirm"]);
</script>

<style scoped lang="scss">
.dialog-meta {
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
  border: 1rpx solid #f0e0bd;
  border-radius: 20rpx;
  background: #fdf6e8;
}

.meta-row {
  display: flex;
  align-items: center;
  min-height: 56rpx;
  color: #746c5b;
  font-size: 24rpx;
}

.meta-row + .meta-row {
  border-top: 1rpx solid #f2e8cf;
}

.meta-icon {
  width: 38rpx;
  flex-shrink: 0;
  color: $color-warning;
  font-size: 24rpx;
}

.meta-icon-text {
  font-size: 22rpx;
  text-align: center;
}

.meta-value {
  margin-left: auto;
  color: #a65d17;
  font-size: 26rpx;
  font-weight: 700;
  @include numeric;
}

.dialog-note {
  display: block;
  margin: 20rpx 8rpx 0;
  color: $color-muted;
  font-size: 24rpx;
  line-height: 1.6;
}

.confirm-icon {
  font-size: 22rpx;
}
</style>
