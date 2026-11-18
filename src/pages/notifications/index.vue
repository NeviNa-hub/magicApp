<template>
  <view class="notifications-page">
    <app-page-header title="完成通知" :show-points="false" />
    <scroll-view class="content" scroll-y @scrolltolower="loadMore">
      <view class="summary">未读 {{ unreadCount }} 条</view>
      <view v-if="hasError" class="state" @tap="reloadNotifications">
        加载失败，点击重试
      </view>
      <view v-else-if="!isLoading && items.length === 0" class="state">
        暂无完成通知
      </view>
      <view
        v-for="item in items"
        :key="item.task_id"
        class="notification"
        @tap="openNotification(item)"
      >
        <view class="notification-main">
          <text class="notification-title">
            {{ item.title || "创作任务" }} 已完成
          </text>
          <text class="notification-time">
            创建于 {{ formatDate(item.created_at) }}
          </text>
        </view>
        <text v-if="!item.is_read" class="unread">未读</text>
        <text class="arrow">›</text>
      </view>
      <view v-if="isLoading" class="state">加载中…</view>
      <view
        v-else-if="items.length && items.length < total"
        class="state"
        @tap="loadMore"
      >
        点击加载更多
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { onUnmounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { getNotifications, markNotificationRead } from "@/apis/notifications";
import AppPageHeader from "@/components/AppPageHeader/index.vue";

const items = ref([]);
const unreadCount = ref(0);
const total = ref(0);
const page = ref(0);
const isLoading = ref(false);
const hasError = ref(false);
const openingTaskId = ref("");
let requestVersion = 0;

/**
 * 格式化任务创建时间。
 * @param {string} value 后端返回的时间。
 * @returns {string} 可读时间。
 */
const formatDate = (value) => {
  return value ? value.replace("T", " ").slice(0, 19) : "";
};

// 加载下一页，旧请求不能覆盖重新进入页面后的数据。
const loadMore = async () => {
  if (isLoading.value || (page.value > 0 && items.value.length >= total.value))
    return;
  const version = requestVersion;
  isLoading.value = true;
  hasError.value = false;
  try {
    const result = await getNotifications({
      page: page.value + 1,
      page_size: 20,
    });
    if (version !== requestVersion) return;
    items.value = [...items.value, ...result.items];
    unreadCount.value = result.unread_count;
    total.value = result.total;
    page.value = result.page;
  } catch {
    if (version === requestVersion) hasError.value = true;
  } finally {
    if (version === requestVersion) isLoading.value = false;
  }
};

// 刷新通知及未读数量。
const reloadNotifications = () => {
  requestVersion += 1;
  items.value = [];
  page.value = 0;
  total.value = 0;
  isLoading.value = false;
  loadMore();
};

/**
 * 标记通知已读并打开对应任务详情。
 * @param {Object} item 通知数据。
 * @returns {Promise<void>} 无返回值。
 */
const openNotification = async (item) => {
  if (openingTaskId.value) return;
  openingTaskId.value = item.task_id;
  try {
    if (!item.is_read) {
      await markNotificationRead({ taskId: item.task_id });
      item.is_read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
    const taskId = encodeURIComponent(item.task_id);
    const type = encodeURIComponent(item.task_type);
    const title = encodeURIComponent(item.title || "创作任务");
    const workId = encodeURIComponent(item.work_id || "");
    uni.navigateTo({
      url: `/pages/work-detail/index?taskId=${taskId}&type=${type}&title=${title}&workId=${workId}`,
    });
  } catch {
    // 请求失败时保留未读状态，列表仍可重新操作。
    return;
  } finally {
    openingTaskId.value = "";
  }
};

onShow(reloadNotifications);
onUnmounted(() => {
  requestVersion += 1;
});
</script>

<style scoped lang="scss">
.notifications-page {
  min-height: 100vh;
  background: #fff8ee;
}

.content {
  box-sizing: border-box;
  height: calc(100vh - 64px);
  padding: 24rpx;
}

.summary {
  margin-bottom: 20rpx;
  color: #98734e;
}

.notification {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 16rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #fff;
}

.notification-main {
  flex: 1;
  min-width: 0;
}

.notification-title,
.notification-time {
  display: block;
}

.notification-title {
  color: #25443d;
  font-weight: 600;
}

.notification-time {
  margin-top: 10rpx;
  color: #87958f;
  font-size: 24rpx;
}

.unread {
  color: #b77f43;
  font-size: 24rpx;
}

.arrow {
  color: #b7a28b;
  font-size: 40rpx;
}

.state {
  padding: 40rpx;
  color: #87958f;
  text-align: center;
}
</style>
