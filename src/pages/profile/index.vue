<template>
  <view class="profile-page">
    <app-page-header title="我的" />

    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <view class="profile-layout">
        <!-- 用户信息卡 -->
        <view class="profile-card">
          <view class="identity">
            <view class="avatar">
              <image v-if="avatarUrl" class="avatar-image" :src="avatarUrl" mode="aspectFill" />
              <!-- #ifdef H5 -->
              <el-icon v-if="!avatarUrl"><User /></el-icon>
              <!-- #endif -->
            </view>
            <view class="identity-copy">
              <view class="identity-name">
                <text class="username">{{ usernameText }}</text>
                <text class="identity-tag">灵感创作者</text>
              </view>
              <text class="account">账号 {{ accountText }}</text>
              <button v-if="profileLoaded" class="edit-profile" @tap="openProfileEditor">编辑资料</button>
              <button v-else class="edit-profile" @tap="loadProfile">重新加载资料</button>
            </view>
          </view>

          <view class="points-entry" @tap="openPointsDialog">
            <view class="points-badge">
              <!-- #ifdef H5 -->
              <el-icon><Coin /></el-icon>
              <!-- #endif -->
            </view>
            <view class="points-copy">
              <text class="points-label">灵感点</text>
              <text class="points-value">{{ pointsText }}</text>
            </view>
            <view class="points-action">
              <text>积分流水</text>
              <!-- #ifdef H5 -->
              <el-icon class="points-action-icon"><ArrowRight /></el-icon>
              <!-- #endif -->
            </view>
          </view>
        </view>

        <!-- 常用功能 -->
        <view class="menu-card">
          <view class="menu-title">常用功能</view>
          <view
            v-for="item in menuItems"
            :key="item.key"
            class="menu-row"
            @tap="openMenu(item)"
          >
            <view class="menu-icon" :class="`is-${item.key}`">
              <!-- #ifdef H5 -->
              <el-icon><component :is="MENU_ICONS[item.key]" /></el-icon>
              <!-- #endif -->
            </view>
            <text class="menu-label">{{ item.label }}</text>
            <!-- #ifdef H5 -->
            <el-icon class="menu-arrow"><ArrowRight /></el-icon>
            <!-- #endif -->
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="logout-bar">
      <button
        class="logout-button"
        :disabled="isLoggingOut"
        @tap="handleLogout"
      >
        退出登录
      </button>
    </view>

    <app-bottom-sheet v-if="isProfileEditorVisible" title="编辑资料" placement="center" :close-on-mask="!isSavingProfile && !isUploading" @close="closeProfileEditor">
      <view class="profile-form">
        <text>昵称</text>
        <input v-model="profileName" maxlength="64" placeholder="请输入昵称" />
        <text v-if="profileError" class="profile-error">{{ profileError }}</text>
        <button :disabled="isSavingProfile || isUploading" @tap="chooseImage">{{ isUploading ? "头像上传中" : "选择头像" }}</button>
        <text v-if="isUploading">{{ uploadProgress === null ? "正在准备图片…" : `上传中 ${uploadProgress}%` }}</text>
        <button v-if="isUploading" @tap="cancelUpload">取消上传</button>
        <button v-else-if="canRetryUpload" @tap="retryUpload">重试上传</button>
        <image v-if="editAvatarUrl" class="avatar-preview" :src="editAvatarUrl" mode="aspectFill" />
      </view>
      <template #footer>
        <view class="profile-form-actions">
          <button :disabled="isSavingProfile || isUploading" @tap="closeProfileEditor">取消</button>
          <button :disabled="isSavingProfile || isUploading" :loading="isSavingProfile" @tap="saveProfile">保存</button>
        </view>
      </template>
    </app-bottom-sheet>
    <points-dialog v-model="isPointsDialogVisible" />

    <app-bottom-nav active="profile" />
  </view>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";

// #ifdef H5
import {
  ArrowRight,
  Brush,
  Coin,
  Grid,
  PictureFilled,
  Setting,
  User,
} from "@element-plus/icons-vue";
// #endif

import { logoutUser } from "@/apis/auth";
import { getProfile, updateProfile } from "@/apis/account";
import { API_BASE_URL, USE_MOCK } from "@/apis/config";
import { PAGE_PATHS } from "@/apis/constants";
import AppBottomSheet from "@/components/AppBottomSheet/index.vue";
import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import PointsDialog from "@/components/PointsDialog/index.vue";
import useImageUpload from "@/hooks/useImageUpload";
import { getToken } from "@/utils/auth";
import {
  clearSession,
  loadPointsBalance,
  pointsState,
  sessionState,
  updateSessionUser,
} from "@/stores";

const menuItems = [
  {
    key: "creation",
    label: "创作台",
    url: "/pages/workbench/index",
    relaunch: true,
  },
  {
    key: "works",
    label: "作品库",
    url: "/pages/library/index",
    relaunch: true,
  },
  {
    key: "workshop",
    label: "工作坊",
    url: "/pages/under-development/index?title=工作坊",
    relaunch: false,
  },
  {
    key: "setting",
    label: "设置",
    url: "/pages/under-development/index?title=设置",
    relaunch: false,
  },
];
// #ifdef H5
// 图标只在 H5 构建中存在，按菜单标识取用，避免 APP 端引用未定义变量
const MENU_ICONS = {
  creation: Brush,
  works: PictureFilled,
  workshop: Grid,
  setting: Setting,
};
// #endif

const isPointsDialogVisible = ref(false);
const isLoggingOut = ref(false);
const profileLoaded = ref(false);
const isProfileEditorVisible = ref(false);
const isSavingProfile = ref(false);
const profileName = ref("");
const profileError = ref("");
const avatarId = ref(null);
const editAvatarId = ref(null);
const avatarUrl = ref("");
const editAvatarUrl = ref("");
let avatarTask = null;
let profileGeneration = 0;

const { isUploading, uploadProgress, canRetryUpload, chooseImage, retryUpload, cancelUpload, resetUpload } = useImageUpload((image) => {
  editAvatarId.value = image.uploadId;
  editAvatarUrl.value = image.path;
});

const usernameText = computed(() => sessionState.user?.username || "—");
const accountText = computed(() => sessionState.user?.account || "—");
const pointsText = computed(() =>
  pointsState.balance === null ? "—" : pointsState.balance,
);

// 读取本人头像，访问私有资源时通过请求头传递凭据。
const loadAvatar = (id) => {
  avatarTask?.abort();
  avatarUrl.value = "";
  if (!id || USE_MOCK) return;
  const current = profileGeneration;
  const token = getToken();
  if (!token) return;
  avatarTask = uni.downloadFile({
    url: `${API_BASE_URL}/uploads/images/${encodeURIComponent(id)}`,
    header: { Authorization: `Bearer ${token}` },
    success: (result) => {
      if (current === profileGeneration && result.statusCode === 200) avatarUrl.value = result.tempFilePath;
    },
  });
};

// 读取最新资料，避免依赖本地缓存作为服务端状态。
const loadProfile = async () => {
  const current = ++profileGeneration;
  try {
    const data = await getProfile();
    if (current !== profileGeneration) return;
    avatarId.value = data.avatar_asset_id;
    updateSessionUser(data);
    profileLoaded.value = true;
    loadAvatar(avatarId.value);
  } catch {
    if (current === profileGeneration) profileLoaded.value = false;
  }
};

// 打开编辑弹窗并恢复服务端资料。
const openProfileEditor = () => {
  resetUpload();
  profileName.value = sessionState.user?.username || "";
  profileError.value = "";
  editAvatarId.value = avatarId.value;
  editAvatarUrl.value = avatarUrl.value;
  isProfileEditorVisible.value = true;
};

// 关闭弹窗时取消未完成的头像上传。
const closeProfileEditor = () => {
  if (isSavingProfile.value) return;
  resetUpload();
  isProfileEditorVisible.value = false;
};

// 校验并保存昵称和头像。
const saveProfile = async () => {
  if (isSavingProfile.value || isUploading.value) return;
  const username = profileName.value.trim();
  if (!username || username.length > 64) {
    profileError.value = "请输入 1 至 64 字的昵称";
    return;
  }
  isSavingProfile.value = true;
  const current = profileGeneration;
  try {
    const data = await updateProfile({ username, avatar_asset_id: editAvatarId.value ? (USE_MOCK ? editAvatarId.value : Number(editAvatarId.value)) : null });
    if (current !== profileGeneration) return;
    updateSessionUser(data);
    avatarId.value = data.avatar_asset_id;
    avatarUrl.value = editAvatarUrl.value;
    isProfileEditorVisible.value = false;
    uni.showToast({ title: "资料已保存", icon: "none" });
  } catch (error) {
    if (current === profileGeneration) profileError.value = error?.message || "保存失败，请重试";
  } finally {
    if (current === profileGeneration) isSavingProfile.value = false;
  }
};

// 打开灵感点流水弹窗，数据由弹窗组件加载。
const openPointsDialog = () => {
  isPointsDialogVisible.value = true;
};

/**
 * 打开常用功能页面；主页面与底部导航一致用 reLaunch，次级页保留返回路径。
 *
 * @param {{url: string, relaunch: boolean}} item 菜单配置。
 * @returns {void}
 */
const openMenu = (item) => {
  if (item.relaunch) {
    uni.reLaunch({ url: item.url });

    return;
  }

  uni.navigateTo({ url: item.url });
};

/**
 * 二次确认后退出登录：调用登出接口并清理本地会话。
 * @returns {Promise<void>}
 */
const handleLogout = async () => {
  if (isLoggingOut.value) {
    return;
  }

  const isConfirmed = await new Promise((resolve) => {
    uni.showModal({
      title: "退出登录",
      content: "退出后需要重新登录才能继续创作，确认退出吗？",
      confirmText: "退出",
      confirmColor: "#b93a2f",
      success: (result) => resolve(Boolean(result.confirm)),
      fail: () => resolve(false),
    });
  });

  if (!isConfirmed) {
    return;
  }

  isLoggingOut.value = true;

  try {
    await logoutUser();
  } catch (error) {
    // 登出接口失败不阻塞本地会话清理。
  } finally {
    clearSession();
    uni.reLaunch({ url: PAGE_PATHS.AUTH });
  }
};

onMounted(() => {
  // 余额走共享缓存（登录时已拉取），本页不再额外请求积分接口。
  loadPointsBalance();
  loadProfile();
});

onUnmounted(() => {
  profileGeneration += 1;
  avatarTask?.abort();
});
</script>

<style scoped lang="scss">
.profile-page {
  @include page-shell;
}

.content {
  height: calc(
    100vh - #{100rpx} - #{102rpx} - 120rpx - var(--status-bar-height, 0px)
  );
  overflow-x: hidden;
  padding: 28rpx 32rpx;
  box-sizing: border-box;
}

.profile-card {
  @include card-surface(24rpx, 28rpx);
}

.identity {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #d9a86b 0%, #b8864e 100%);
  color: #fff;
  font-size: 44rpx;
  box-shadow: 0 8rpx 20rpx rgba(184, 134, 78, 0.3);
}

.avatar-image { width: 100%; height: 100%; border-radius: 50%; }

.edit-profile { margin: 8rpx 0 0; padding: 0; background: transparent; color: #8a6840; font-size: 24rpx; text-align: left; line-height: 1.5; }

.edit-profile::after { border: 0; }

.profile-form { display: flex; flex-direction: column; gap: 16rpx; }

.profile-form input { padding: 14rpx; border: 1rpx solid #d8d2c5; border-radius: 10rpx; }

.profile-error { color: #b93a2f; font-size: 24rpx; }

.avatar-preview { width: 96rpx; height: 96rpx; border-radius: 50%; }

.profile-form-actions { display: flex; gap: 16rpx; }

.identity-copy {
  flex: 1;
  min-width: 0;
}

.identity-name {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.username {
  color: $color-ink;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.3;
}

.identity-tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: $color-primary-light;
  color: $color-primary;
  font-size: 20rpx;
}

.account {
  display: block;
  margin-top: 8rpx;
  color: $color-muted;
  font-size: 24rpx;
}

.points-entry {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 28rpx;
  padding: 24rpx;
  border: 1rpx solid #efdfc2;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #faf0df 0%, #f5e6cd 100%);
}

.points-badge {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: $color-primary;
  color: #fff;
  font-size: 32rpx;
  box-shadow: 0 6rpx 16rpx rgba(184, 134, 78, 0.32);
}

.points-copy {
  display: flex;
  flex-direction: column;
}

.points-label {
  color: #8a6840;
  font-size: 24rpx;
}

.points-value {
  color: $color-primary;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.2;
  @include numeric;
}

.points-action {
  display: flex;
  align-items: center;
  gap: 4rpx;
  margin-left: auto;
  color: #8a6840;
  font-size: 24rpx;
}

.points-action-icon {
  font-size: 24rpx;
}

/* 常用功能 */
.menu-card {
  @include card-surface(24rpx, 16rpx 28rpx);
  margin-top: 24rpx;
}

.menu-title {
  padding: 8rpx 0 4rpx;
  color: $color-ink;
  font-size: 28rpx;
  font-weight: 700;
}

.menu-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 0;
}

.menu-row + .menu-row {
  border-top: 1rpx solid #f0e9df;
}

.menu-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: $color-primary-light;
  color: $color-primary;
  font-size: 32rpx;
}

.menu-icon.is-works {
  background: #f1f0fd;
  color: #595bdc;
}

.menu-icon.is-workshop {
  background: #fdf6e8;
  color: $color-warning;
}

.menu-icon.is-setting {
  background: #f8faf7;
  color: $color-muted;
}

.menu-label {
  flex: 1;
  color: $color-ink;
  font-size: 28rpx;
}

.menu-arrow {
  color: #c9b79b;
  font-size: 26rpx;
}

/* ============================================================
 * 桌面 H5 适配：1200px 以上用户卡与功能菜单左右分栏，菜单双列
 * ============================================================ */
@media (min-width: $breakpoint-desktop) {
  .content {
    height: calc(100vh - 50px - 100px);
    padding: 32px;
  }

  .profile-layout {
    display: grid;
    grid-template-columns: minmax(300px, 400px) minmax(0, 600px);
    justify-content: center;
    gap: 24px;
    align-items: start;
  }

  .profile-card,
  .menu-card {
    box-sizing: border-box;
    padding: 24px;
  }

  .identity-tag,
  .menu-label,
  .points-action {
    white-space: nowrap;
  }

  .menu-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 24rpx;
    margin-top: 0;
  }

  .menu-title {
    grid-column: 1 / -1;
  }

  .menu-row + .menu-row {
    border-top: 0;
  }

  .menu-row {
    padding: 16px 12px;
  }
}

.logout-bar {
  position: fixed;
  z-index: 10;
  right: 0;
  bottom: calc(#{102rpx} + constant(safe-area-inset-bottom));
  bottom: calc(#{102rpx} + env(safe-area-inset-bottom));
  left: 0;
  padding: 16rpx 32rpx;

  /* 窄屏过渡：750px 居中 */
  @media (min-width: $breakpoint-tablet) and (max-width: 1199px) {
    right: auto;
    left: 50%;
    width: 750px;
    transform: translateX(-50%);
  }

  /* 桌面端对齐侧栏右侧的内容区，且底部不再有导航占用 */
  @media (min-width: $breakpoint-desktop) {
    right: 0;
    bottom: 0;
    left: $desktop-sidebar;
    width: auto;
    box-sizing: border-box;
    transform: none;
  }
}

.logout-button {
  @include tap-area($tap-size);
  margin: 0;
  padding: 0;
  border: 1rpx solid #d2ddd6;
  border-radius: 20rpx;
  background: $color-surface;
  color: $color-danger;
  font-size: 28rpx;
  line-height: 1;

  &::after {
    border: 0;
  }

  @media (min-width: $breakpoint-desktop) {
    width: min(100%, 1024px);
    margin: 0 auto;
  }
}
</style>
