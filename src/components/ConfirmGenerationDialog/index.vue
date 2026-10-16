<template>
  <view class="dialog-mask">
    <view class="dialog-sheet">
      <view class="dialog-title">{{ title }}</view>
      <view class="dialog-meta">
        <view><text>⚡</text><text>本次消耗灵感点</text><b>-{{ cost }} 点</b></view>
        <view><text>◷</text><text>预计生成耗时</text><b>{{ estimatedTime }}</b></view>
      </view>
      <text class="dialog-note">{{ note }}</text>
      <view class="dialog-actions">
        <button @click="$emit('cancel')">再斟酌下</button>
        <button class="confirm" @click="$emit('confirm')">{{ confirmText }} →</button>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  /** 弹窗标题。 */
  title: { type: String, default: "确认研墨成画" },
  /** 本次消耗的灵感点。 */
  cost: { type: [String, Number], default: 4 },
  /** 预计生成耗时。 */
  estimatedTime: { type: String, default: "约 6~8 秒" },
  /** 弹窗说明。 */
  note: { type: String, default: "确认后将送往云端研磨，期间离开或切换页面均不影响生成，可在作品库静候收卷。" },
  /** 确认按钮文案。 */
  confirmText: { type: String, default: "确认研墨成画" },
});

defineEmits(["cancel", "confirm"]);
</script>

<style scoped lang="scss">
.dialog-mask { position: fixed; z-index: 20; inset: 0; display: flex; align-items: flex-end; background: rgba(20, 28, 27, 0.52); }
.dialog-sheet { width: 100%; padding: 32rpx 28rpx 28rpx; border-radius: 32rpx 32rpx 0 0; background: #fff; box-sizing: border-box; }
.dialog-title { padding-bottom: 20rpx; border-bottom: 1rpx solid #e7ecea; color: #183c35; font: 700 28rpx serif; }
.dialog-meta { margin-top: 18rpx; padding: 14rpx 16rpx; border: 1rpx solid #f1dfab; border-radius: 18rpx; background: #fffaf0; }
.dialog-meta view { display: flex; align-items: center; min-height: 48rpx; color: #746c5b; font-size: 18rpx; }
.dialog-meta view + view { border-top: 1rpx solid #f2e8cf; }
.dialog-meta view > text:first-child { width: 38rpx; color: #d58b22; font-size: 22rpx; }
.dialog-meta b { margin-left: auto; color: #a65d17; font-size: 20rpx; }
.dialog-note { display: block; margin: 18rpx 8rpx 26rpx; color: #71817e; font-size: 18rpx; line-height: 1.5; }
.dialog-actions { display: flex; gap: 14rpx; }
.dialog-actions button { flex: 1; height: 72rpx; border-radius: 18rpx; font-size: 20rpx; }
.dialog-actions .confirm { border: 0; background: #05604c; color: #fff; }
</style>
