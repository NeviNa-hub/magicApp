<template>
  <view class="page">
    <app-page-header title="图片优化" />
    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <view class="file">
        <text v-if="selectedImage"> {{ selectedImage.name }}</text>
        <text v-else>请先导入需要优化的图片</text>
        <button @click="chooseImage">
          {{ selectedImage ? "更换图片" : "导入图片" }}
        </button>
      </view>
      <view
        class="preview"
        :class="{ empty: !selectedImage }"
        @click="chooseImage"
      >
        <image
          v-if="selectedImage"
          :src="selectedImage.path"
          mode="aspectFit"
        />
        <text v-else class="empty-tip">
          ＋<small>从相册选择或拍摄图片</small>
        </text>
        <text v-if="selectedImage" class="cover"> 已选封面</text>
        <text v-if="selectedImage" class="ready">
          原图解析就绪 · 4K重绘待命</text
        >
        <text v-if="selectedImage" class="zoom">⌕</text>
      </view>
      <view class="hint" @click="chooseImage"
        >　点击重新从系统相册导入或拍摄</view
      >
      <view class="heading">优化方向 <small>单选</small></view>
      <view class="directions">
        <view
          v-for="item in directions"
          :key="item.title"
          class="direction"
          :class="{ selected: direction === item.title }"
          @click="direction = item.title"
        >
          <app-icon :name="item.icon_name" />
          <strong>{{ item.title }}</strong>
          <small>{{ item.description }}</small>
        </view>
      </view>
      <view class="heading"
        >重绘强度 <small class="accent">均衡重构（推荐）</small></view
      >
      <view class="intensity">
        <text
          v-for="item in intensities"
          :key="item"
          :class="{ selected: intensity === item }"
          @click="intensity = item"
        >
          {{ item }}
        </text>
      </view>
      <view class="switch-row">
        <view>
          <strong>◉　保留原画面部细节</strong>
          <small>避免AI拟合过度导致的五官微变</small>
        </view>
        <switch
          :checked="keepDetail"
          color="#087c73"
          @change="keepDetail = $event.detail.value"
        />
      </view>
    </scroll-view>
    <view class="actions">
      <view class="cost">
        <text>预计消耗 {{ cost }} 灵感点</text>
        <text>账户结余 800 点</text>
      </view>
      <button
        :disabled="!selectedImage || isSubmitting"
        @click="startOptimization"
      >
        开始淬炼重绘（耗{{ cost }}点）
      </button>
      <text>云端蒸馏级处理 · 支持高清直存至作品库</text>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";

import {
  createImageOptimization,
  getImageOptimizationOptions,
} from "@/apis/imageOptimization";
import AppIcon from "@/components/AppIcon/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";

const directions = ref([]);
const intensities = ref([]);
const direction = ref("");
const intensity = ref("");
const keepDetail = ref(true);
const selectedImage = ref(null);
const cost = ref(0);
const isSubmitting = ref(false);

// 从系统相册或相机选择待优化图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["original", "compressed"],
    sourceType: ["album", "camera"],
    success: ({ tempFilePaths, tempFiles }) => {
      const file = tempFiles?.[0];
      const path = tempFilePaths[0];
      selectedImage.value = {
        path,
        name: file?.name || path.split("/").pop() || "已选图片",
      };
    },
  });
};

// 校验图片后开始优化任务
const startOptimization = async () => {
  if (!selectedImage.value) {
    uni.showToast({ title: "请先导入需要优化的图片", icon: "none" });
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await createImageOptimization({
      image_path: selectedImage.value.path,
      direction: direction.value,
      intensity: intensity.value,
      keep_detail: keepDetail.value,
    });
    if (response.code !== 0) {
      uni.showToast({
        title: response.message || "创建任务失败",
        icon: "none",
      });
      return;
    }

    uni.navigateTo({
      url: `/pages/image-generation/index?mode=optimization&task_id=${response.data.task_id}`,
    });
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  const response = await getImageOptimizationOptions();
  if (response.code === 0) {
    directions.value = response.data.directions;
    intensities.value = response.data.intensities;
    direction.value = response.data.default_direction;
    intensity.value = response.data.default_intensity;
    cost.value = response.data.cost;
  }
});
</script>

<style scoped>
page {
  height: 100%;
  overflow: hidden;
}

.page {
  height: 100vh;
  background: #f7f8ff;
  color: #17343b;
}

.content {
  height: calc(100vh - 220rpx);
  padding: 34rpx 40rpx 220rpx;
  box-sizing: border-box;
}

.file {
  display: flex;
  align-items: center;
  font-size: 23rpx;
  font-weight: 700;
}

.file button {
  margin-left: auto;
  height: 54rpx;
  padding: 0 20rpx;
  border: 0;
  border-radius: 28rpx;
  background: #edf5ff;
  color: #087c73;
  font-size: 18rpx;
}

.file button:after {
  border: 0;
}

.preview {
  position: relative;
  height: 520rpx;
  margin-top: 20rpx;
  overflow: hidden;
  border-radius: 14rpx;
  background: #d8dce4;
}

.preview image {
  width: 100%;
  height: 100%;
}

.preview.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #a9bec5;
  background: #f1f5f7;
}

.empty-tip {
  color: #7c9399;
  font-size: 54rpx;
  text-align: center;
}

.empty-tip small {
  display: block;
  margin-top: 14rpx;
  font-size: 20rpx;
}

.cover,
.ready,
.zoom {
  position: absolute;
  background: rgba(45, 64, 78, 0.88);
  color: #fff;
}

.cover,
.ready {
  padding: 10rpx 16rpx;
  border-radius: 24rpx;
  font-size: 17rpx;
}

.cover {
  top: 18rpx;
  left: 18rpx;
}

.ready {
  bottom: 20rpx;
  left: 18rpx;
}

.zoom {
  right: 18rpx;
  bottom: 20rpx;
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  text-align: center;
  line-height: 52rpx;
  font-size: 30rpx;
}

.hint {
  margin-top: 20rpx;
  padding: 22rpx;
  border: 1rpx dashed #a9bec5;
  border-radius: 14rpx;
  color: #71858b;
  text-align: center;
  font-size: 18rpx;
}

.heading {
  display: flex;
  justify-content: space-between;
  margin-top: 28rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.heading small {
  color: #869497;
  font-size: 17rpx;
  font-weight: 400;
}

.heading .accent {
  color: #087c73;
}

.directions {
  display: flex;
  gap: 14rpx;
  margin-top: 14rpx;
}

.direction {
  flex: 1;
  padding: 20rpx 8rpx;
  border: 1rpx solid #dce4ea;
  border-radius: 16rpx;
  background: #fff;
  text-align: center;
}

.direction.selected {
  border-color: #087c73;
  background: #087c73;
  color: #fff;
}

.direction text,
.direction strong,
.direction small {
  display: block;
}

.direction strong {
  margin-top: 12rpx;
  font-size: 20rpx;
}

.direction small {
  margin-top: 4rpx;
  color: #8a9a9e;
  font-size: 16rpx;
}

.direction.selected small {
  color: #d5f2ed;
}

.intensity {
  display: flex;
  margin-top: 14rpx;
  padding: 8rpx;
  border-radius: 12rpx;
  background: #edf2ff;
}

.intensity text {
  flex: 1;
  padding: 12rpx 0;
  color: #52656d;
  text-align: center;
  font-size: 18rpx;
}

.intensity .selected {
  border-radius: 10rpx;
  background: #fff;
  color: #087c73;
  font-weight: 700;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 26rpx;
  padding: 22rpx;
  border: 1rpx solid #e2e8ec;
  border-radius: 16rpx;
  background: #fff;
}

.switch-row strong,
.switch-row small {
  display: block;
}

.switch-row strong {
  font-size: 20rpx;
}

.switch-row small {
  margin-top: 6rpx;
  color: #839296;
  font-size: 16rpx;
}

.cost {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 6rpx 16rpx;
  color: #748589;
  font-size: 17rpx;
}

.actions {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 18rpx 40rpx 28rpx;
  background: rgba(255, 255, 255, 0.96);
  text-align: center;
}

.actions button {
  width: 100%;
  height: 76rpx;
  border: 0;
  border-radius: 24rpx;
  background: #087c73;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
}

.actions button:after {
  border: 0;
}

.actions button[disabled] {
  background: #a9b8b8;
  color: #edf2f2;
}

.actions text {
  display: block;
  margin-top: 14rpx;
  color: #819093;
  font-size: 16rpx;
}
</style>
