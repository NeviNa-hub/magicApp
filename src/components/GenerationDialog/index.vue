<template>
  <view class="dialog-mask">
    <view class="dialog-sheet progress-sheet">
      <view class="dialog-title">{{ title }}</view>
      <view class="progress-circle">{{ progress }}<small>%</small></view>
      <text class="progress-label">{{ progressLabel }}</text>
      <text class="progress-note">{{ note }}</text>
      <view class="dialog-actions">
        <button @click="$emit('back')">返回工作台</button>
        <button class="confirm" @click="$emit('library')">前往作品库查看</button>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 生成弹窗组件。
 * @param title 弹窗标题。
 * @param progress 当前生成进度。
 * @param progressLabel 进度说明。
 * @param note 弹窗提示。
 */
defineProps({
  title: { type: String, default: "研墨成画" },
  progress: { type: [String, Number], default: 98 },
  progressLabel: { type: String, default: "生成进度" },
  note: {
    type: String,
    default: "已进入云端渲染，期间离开或切换页面不影响生成，可在作品库查看。",
  },
});

defineEmits(["back", "library"]);
</script>

<style scoped lang="scss">
.dialog-mask {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: flex;
  align-items: flex-end;
  background: rgba(20, 28, 27, 0.52);
}
.dialog-sheet {
  width: 100%;
  padding: 32rpx 28rpx 28rpx;
  border-radius: 32rpx 32rpx 0 0;
  background: #fff;
  box-sizing: border-box;
}
.dialog-title {
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #e7ecea;
  color: #183c35;
  font: 700 28rpx serif;
}
.progress-sheet {
  text-align: center;
}
.progress-circle {
  width: 150rpx;
  height: 150rpx;
  margin: 22rpx auto 18rpx;
  border: 6rpx solid #0c9b86;
  border-radius: 50%;
  color: #16463d;
  font-size: 52rpx;
  line-height: 150rpx;
}
.progress-circle small {
  font-size: 22rpx;
}
.progress-label {
  display: block;
  color: #087761;
  font-size: 18rpx;
  font-weight: 700;
}
.progress-note {
  display: block;
  margin: 24rpx 0;
  color: #73817e;
  font-size: 18rpx;
  line-height: 1.5;
}
.dialog-actions {
  display: flex;
  gap: 14rpx;
}
.dialog-actions button {
  flex: 1;
  height: 72rpx;
  border-radius: 18rpx;
  font-size: 20rpx;
}
.dialog-actions .confirm {
  border: 0;
  background: #05604c;
  color: #fff;
}
</style>
