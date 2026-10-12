<template>
  <view class="generation-progress">
    <app-page-header :title="data.title" />
    <scroll-view scroll-y :show-scrollbar="false" class="generation-content">
      <view class="progress-card">
        <text class="progress-label">{{ data.stage }}</text>
        <text class="progress-type">{{ data.type }}</text>
        <view class="progress-ring">
          <text>{{ data.progress }}<small>%</small></text>
          <label>{{ data.progress_label }}</label>
        </view>
        <view class="progress-status">
          {{ data.status }} <text>{{ data.progress }}% / 100%</text>
        </view>
        <view class="progress-track"><view :style="{ width: `${data.progress}%` }"></view></view>
      </view>
      <view class="task-card">
        <view class="task-title">
          <text class="task-mark">印</text>
          <strong>{{ data.work_name }}</strong>
          <small>{{ data.detail }}</small>
        </view>
        <view class="task-tags">
          <text v-for="tag in data.tags" :key="tag">{{ tag }}</text>
          <text class="task-cost">{{ data.cost }} 灵感点</text>
        </view>
        <view class="task-footer">{{ data.description }}<text>{{ data.estimated_time }}</text></view>
      </view>
      <view class="cloud-tip">{{ data.tip }}</view>
    </scroll-view>
    <view class="generation-actions">
      <button class="primary-action" @tap="goLibrary">前往作品库查看进度</button>
      <button class="secondary-action" @tap="goWorkbench">返回工作台</button>
    </view>
  </view>
</template>

<script setup>
import AppPageHeader from "@/components/AppPageHeader/index.vue";

defineProps({
  /** 任务进度页面展示数据。 */
  data: { type: Object, required: true },
});

// 前往作品库。
const goLibrary = () => {
  uni.navigateTo({ url: "/pages/library/index" });
};

// 返回创作台。
const goWorkbench = () => {
  uni.reLaunch({ url: "/pages/workbench/index" });
};
</script>

<style scoped>
.generation-progress { height: 100vh; overflow: hidden; background: #f6f8ff; color: #17343b; }
.generation-content { height: calc(100vh - 310rpx); padding: 44rpx 42rpx 180rpx; box-sizing: border-box; }
.progress-card { position: relative; height: 580rpx; overflow: hidden; border: 1rpx solid #e4dccb; border-radius: 48rpx; background: linear-gradient(145deg, #e4f1ee, #f3f0e6 48%, #e0e9e2); }
.progress-card::after { position: absolute; inset: 42rpx 26rpx 26rpx; border: 4rpx solid rgba(255, 255, 255, 0.78); border-radius: 38rpx; content: ""; }
.progress-label, .progress-type, .progress-status, .progress-track { position: absolute; z-index: 2; }
.progress-label { top: 40rpx; left: 48rpx; padding: 11rpx 16rpx; border-radius: 22rpx; background: rgba(255, 255, 255, 0.82); color: #617477; font-size: 18rpx; }
.progress-type { top: 48rpx; right: 48rpx; color: #829095; font-size: 18rpx; }
.progress-ring { position: absolute; z-index: 2; top: 205rpx; left: 50%; width: 236rpx; height: 236rpx; transform: translateX(-50%); border: 2rpx dashed #abd9d5; border-radius: 50%; background: rgba(255, 255, 255, 0.72); text-align: center; }
.progress-ring text { display: block; margin-top: 64rpx; color: #0d1d31; font-size: 68rpx; font-weight: 700; }
.progress-ring text small { color: #36aaa4; font-size: 28rpx; }
.progress-ring label { display: block; margin-top: 8rpx; color: #557277; font-size: 18rpx; }
.progress-status { right: 44rpx; bottom: 70rpx; left: 44rpx; color: #247a77; font-size: 18rpx; }
.progress-status text { float: right; }
.progress-track { right: 44rpx; bottom: 40rpx; left: 44rpx; height: 10rpx; border-radius: 8rpx; background: rgba(255, 255, 255, 0.5); }
.progress-track view { height: 100%; border-radius: inherit; background: #168f88; }
.task-card { margin-top: 28rpx; padding: 24rpx 28rpx; border-radius: 26rpx; background: #fff; box-shadow: 0 6rpx 18rpx rgba(47, 75, 90, 0.06); }
.task-title, .task-tags { display: flex; align-items: center; }
.task-mark { width: 36rpx; height: 36rpx; margin-right: 14rpx; background: #d63b32; color: #fff; text-align: center; line-height: 36rpx; }
.task-title strong { font-size: 24rpx; }
.task-title small { margin-left: auto; color: #a0abad; font-size: 17rpx; }
.task-tags { flex-wrap: wrap; gap: 12rpx; margin-top: 24rpx; }
.task-tags text { padding: 8rpx 14rpx; border: 1rpx solid #e1e8eb; border-radius: 18rpx; color: #60777d; font-size: 17rpx; }
.task-tags .task-cost { margin-left: auto; border-color: #86e5dc; color: #138e85; }
.task-footer { margin-top: 24rpx; padding-top: 18rpx; border-top: 1rpx solid #edf0f0; color: #71878c; font-size: 18rpx; }
.task-footer text { float: right; color: #a0afb2; }
.cloud-tip { margin-top: 24rpx; padding: 16rpx; border: 1rpx solid #8be8de; border-radius: 28rpx; color: #178e87; text-align: center; font-size: 18rpx; }
.generation-actions { position: fixed; right: 0; bottom: 0; left: 0; padding: 20rpx 42rpx 28rpx; background: rgba(255, 255, 255, 0.96); }
.generation-actions button { width: 100%; height: 78rpx; border: 0; border-radius: 38rpx; font-size: 23rpx; font-weight: 700; }
.generation-actions button::after { border: 0; }
.primary-action { background: #008477; color: #fff; }
.secondary-action { margin-top: 14rpx; background: #fff; color: #63767b; box-shadow: 0 2rpx 12rpx rgba(30, 58, 70, 0.06); }
</style>
