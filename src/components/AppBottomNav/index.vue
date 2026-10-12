<template>
  <view class="app-bottom-nav">
    <view
      v-for="item in NAV_ITEMS"
      :key="item.key"
      class="nav-item"
      :class="{ 'is-active': active === item.key }"
      @tap="navigateTo(item)"
    >
      <app-icon class="nav-icon" :name="item.icon" />
      <text>{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup>
import AppIcon from "@/components/AppIcon/index.vue";

const NAV_ITEMS = [
  { key: "drafts", icon: "grid", label: "文稿库", url: "/pages/index/index" },
  { key: "creation", icon: "grid", label: "创作台", url: "/pages/workbench/index" },
  { key: "works", icon: "grid", label: "作品库", url: "/pages/library/index" },
  {
    key: "workshop",
    icon: "grid",
    label: "工作坊",
    url: "/pages/under-development/index?title=工作坊",
  },
];

/**
 * 当前激活的导航项。
 * @property {"drafts" | "creation" | "works" | "workshop"} active 当前导航标识。
 */
const props = defineProps({ active: { type: String, required: true } });

/**
 * 切换主导航页面。
 * @param {{label: string, url: string}} item 导航配置。
 * @returns {void}
 */
const navigateTo = (item) => {
  if (props.active === item.key) {
    return;
  }

  uni.reLaunch({ url: item.url });
};
</script>

<style scoped>
.app-bottom-nav {
  position: fixed;
  z-index: 20;
  right: 0;
  bottom: 0;
  left: 0;
  height: 102rpx;
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  border-top: 1rpx solid #e2eeee;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -4rpx 16rpx rgba(32, 66, 75, 0.05);
}

.nav-item {
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  color: #98aabd;
  font-size: 19rpx;
}

.nav-item.is-active {
  color: #168d84;
}

.nav-icon {
  margin-bottom: 6rpx;
  font-size: 30rpx;
  line-height: 1;
}
</style>
