<template>
  <view class="profile-page">
    <app-page-header title="我的" />

    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <view class="profile-layout">
        <!-- 用户信息卡 -->
        <view class="profile-card">
          <view class="identity">
            <view class="avatar">
              <image
                v-if="avatarUrl"
                class="avatar-image"
                :src="avatarUrl"
                mode="aspectFill"
                @error="handleAvatarError"
              />
              <button
                v-else-if="avatarError"
                class="avatar-retry"
                @tap="retryAvatar"
              >
                重试
              </button>
              <!-- #ifdef H5 -->
              <el-icon v-if="!avatarUrl && !avatarError"><User /></el-icon>
              <!-- #endif -->
            </view>
            <view class="identity-copy">
              <view class="identity-name">
                <text class="username">{{ usernameText }}</text>
                <text class="identity-tag">灵感创作者</text>
              </view>
              <text class="account">账号 {{ accountText }}</text>
              <button
                class="edit-profile"
                @tap="profileLoaded ? openProfileEditor() : loadProfile()"
              >
                <text v-if="profileLoaded" class="edit-profile-icon">✎</text>
                <text v-if="profileLoaded" class="edit-profile-label">
                  编辑资料
                </text>
                <text v-else> 重新加载资料 </text>
              </button>
            </view>
          </view>

          <view class="points-entry" @tap="openPointsDialog">
            <view class="points-badge">
              <!-- #ifdef H5 -->
              <el-icon><Coin /></el-icon>
              <!-- #endif -->
            </view>
            <view class="points-copy">
              <text class="points-label">积分</text>
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
            <text
              v-if="item.key === 'notifications' && notificationUnread > 0"
              class="notification-count"
            >
              {{ notificationUnread > 99 ? "99+" : notificationUnread }}
            </text>
            <!-- #ifdef H5 -->
            <el-icon class="menu-arrow"><ArrowRight /></el-icon>
            <!-- #endif -->
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="logout-bar">
      <view class="account-actions">
        <button
          class="delete-account-entry"
          :disabled="isLoggingOut"
          @tap="openAccountDeletion"
        >
          注销账号
        </button>
        <button
          class="logout-button"
          :disabled="isLoggingOut"
          @tap="handleLogout"
        >
          退出登录
        </button>
      </view>
    </view>

    <app-bottom-sheet
      v-if="isSettingsVisible"
      title="设置"
      placement="center"
      show-close
      @close="isSettingsVisible = false"
    >
      <view class="settings-content">
        <text class="settings-description">
          设置功能还在建设中，可以先去试试我们的创作功能。
        </text>
        <inspiration-carousel class="settings-carousel" />
      </view>
    </app-bottom-sheet>
    <app-bottom-sheet
      v-if="isProfileEditorVisible"
      title="编辑资料"
      placement="center"
      :close-on-mask="!isSavingProfile && !isUploading"
      @close="closeProfileEditor"
    >
      <view class="profile-form">
        <text>昵称</text>
        <!-- 预留 emoji 代理对占用的 UTF-16 空间，再由输入事件按 64 个字符截断。 -->
        <input
          v-model="profileName"
          maxlength="128"
          placeholder="请输入昵称"
          @input="profileName = normalizePromptInput($event.detail.value, 64)"
        />
        <text v-if="profileError" class="profile-error">{{
          profileError
        }}</text>
        <text>头像</text>
        <view class="avatar-editor">
          <app-image
            v-if="editAvatarUrl"
            class="avatar-preview"
            :src="editAvatarUrl"
            mode="aspectFill"
          />
          <button :disabled="isSavingProfile || isUploading" @tap="chooseImage">
            {{ editAvatarUrl ? "更换头像" : "选择头像" }}
          </button>
        </view>
        <view v-if="isUploading && !isChoosing" class="avatar-upload-actions">
          <text>{{
            uploadProgress === null
              ? "正在上传头像…"
              : `上传中 ${uploadProgress}%`
          }}</text>
          <button @tap="cancelUpload">取消上传</button>
        </view>
        <view
          v-else-if="canRetryUpload && !isChoosing"
          class="avatar-upload-actions"
        >
          <button @tap="retryUpload">重试上传</button>
        </view>
      </view>
      <template #footer>
        <view class="profile-form-actions">
          <button
            :disabled="isSavingProfile || isUploading"
            @tap="closeProfileEditor"
          >
            取消
          </button>
          <button
            :disabled="isSavingProfile || isUploading"
            :loading="isSavingProfile"
            @tap="saveProfile"
          >
            保存
          </button>
        </view>
      </template>
    </app-bottom-sheet>
    <points-dialog v-model="isPointsDialogVisible" />
    <app-bottom-sheet
      v-if="isDeleteVisible"
      title="注销账号"
      placement="center"
      :close-on-mask="!isDeleting"
      @close="closeAccountDeletion"
    >
      <view class="profile-form">
        <text>
          注销后，账号、作品、草稿和积分将永久删除，无法恢复。请先完成或取消进行中的创作。
        </text>
        <input
          v-model="deletePassword"
          password
          maxlength="128"
          placeholder="请输入当前密码"
        />
        <text v-if="deleteError" class="profile-error">{{ deleteError }}</text>
      </view>
      <template #footer>
        <view class="profile-form-actions">
          <button :disabled="isDeleting" @tap="closeAccountDeletion">
            取消
          </button>
          <button
            :disabled="isDeleting"
            :loading="isDeleting"
            @tap="confirmAccountDeletion"
          >
            确认注销
          </button>
        </view>
      </template>
    </app-bottom-sheet>

    <app-bottom-nav active="profile" />
  </view>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

// #ifdef H5
import {
  ArrowRight,
  Brush,
  Coin,
  Bell,
  Grid,
  PictureFilled,
  Setting,
  User,
} from "@element-plus/icons-vue";
// #endif

import { deleteAccount, logoutUser } from "@/apis/auth";
import { getProfile, updateProfile } from "@/apis/account";
import { getNotifications } from "@/apis/notifications";
import { API_BASE_URL, IS_API_BASE_URL_VALID, USE_MOCK } from "@/apis/config";
import { PAGE_PATHS } from "@/apis/constants";
import AppBottomSheet from "@/components/AppBottomSheet/index.vue";
import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppImage from "@/components/AppImage/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import InspirationCarousel from "@/components/InspirationCarousel/index.vue";
import PointsDialog from "@/components/PointsDialog/index.vue";
import useImageUpload from "@/hooks/useImageUpload";
import { getToken } from "@/utils/auth";
import { countPromptCharacters, normalizePromptInput } from "@/utils/prompt";
import {
  clearSession,
  loadPointsBalance,
  pointsState,
  sessionState,
  updateSessionUser,
} from "@/stores";

const menuItems = [
  {
    key: "notifications",
    label: "完成通知",
    url: "/pages/notifications/index",
    relaunch: false,
  },
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
    url: "/pages/workshop/index",
    relaunch: true,
  },
  {
    key: "setting",
    label: "设置",
  },
];
// #ifdef H5
// 图标只在 H5 构建中存在，按菜单标识取用，避免 APP 端引用未定义变量
const MENU_ICONS = {
  notifications: Bell,
  creation: Brush,
  works: PictureFilled,
  workshop: Grid,
  setting: Setting,
};
// #endif

const isPointsDialogVisible = ref(false);
const notificationUnread = ref(0);
let notificationRequestVersion = 0;
const isLoggingOut = ref(false);
const isDeleteVisible = ref(false);
const isDeleting = ref(false);
const deletePassword = ref("");
const deleteError = ref("");
const profileLoaded = ref(false);
const isProfileEditorVisible = ref(false);
const isSettingsVisible = ref(false);
const isSavingProfile = ref(false);
const profileName = ref("");
const profileError = ref("");
const avatarId = ref(null);
const editAvatarId = ref(null);
const avatarUrl = ref("");
const avatarError = ref(false);
const editAvatarUrl = ref("");
let avatarTask = null;
let avatarGeneration = 0;
let profileGeneration = 0;

const {
  isChoosing,
  isUploading,
  uploadProgress,
  canRetryUpload,
  chooseImage,
  retryUpload,
  cancelUpload,
  resetUpload,
} = useImageUpload((image) => {
  editAvatarId.value = image.uploadId;
  editAvatarUrl.value = image.path;
});

const usernameText = computed(() => sessionState.user?.username || "—");
const accountText = computed(() => sessionState.user?.account || "—");
const pointsText = computed(() =>
  pointsState.balance === null ? "—" : pointsState.balance,
);

// 每次回到个人页时刷新未读数量，静默失败不影响其他功能。
const loadNotificationCount = async () => {
  const version = ++notificationRequestVersion;
  try {
    const result = await getNotifications(
      { page: 1, page_size: 1 },
      { silent: true },
    );
    if (version === notificationRequestVersion)
      notificationUnread.value = result.unread_count;
  } catch {
    if (version === notificationRequestVersion) notificationUnread.value = 0;
  }
};

// 读取本人头像，访问私有资源时通过请求头传递凭据。
const loadAvatar = (id) => {
  const current = ++avatarGeneration;
  avatarTask?.abort();
  avatarError.value = false;
  if (USE_MOCK) return;
  avatarUrl.value = "";
  if (!id) return;
  const token = getToken();
  if (!token || !IS_API_BASE_URL_VALID) {
    avatarError.value = true;
    return;
  }
  avatarTask = uni.downloadFile({
    url: `${API_BASE_URL}/uploads/images/${encodeURIComponent(id)}`,
    header: { Authorization: `Bearer ${token}` },
    success: (result) => {
      if (current !== avatarGeneration || getToken() !== token) return;
      if (result.statusCode === 200 && result.tempFilePath)
        avatarUrl.value = result.tempFilePath;
      else avatarError.value = true;
    },
    fail: () => {
      if (current === avatarGeneration && getToken() === token)
        avatarError.value = true;
    },
  });
};

// 头像文件解码失败时显示重试入口。
const handleAvatarError = () => {
  avatarUrl.value = "";
  avatarError.value = true;
};

// 重新下载本人头像。
const retryAvatar = () => {
  loadAvatar(avatarId.value);
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
  if (!username || countPromptCharacters(username) > 64) {
    profileError.value = "请输入 1 至 64 字的昵称";
    return;
  }
  isSavingProfile.value = true;
  const current = profileGeneration;
  try {
    const data = await updateProfile({
      username,
      avatar_asset_id: editAvatarId.value
        ? USE_MOCK
          ? editAvatarId.value
          : Number(editAvatarId.value)
        : null,
    });
    if (current !== profileGeneration) return;
    updateSessionUser(data);
    avatarGeneration += 1;
    avatarTask?.abort();
    avatarId.value = data.avatar_asset_id;
    avatarUrl.value = editAvatarUrl.value;
    avatarError.value = false;
    isProfileEditorVisible.value = false;
    uni.showToast({ title: "资料已保存", icon: "none" });
  } catch (error) {
    if (current === profileGeneration)
      profileError.value = error?.message || "保存失败，请重试";
  } finally {
    if (current === profileGeneration) isSavingProfile.value = false;
  }
};

// 打开积分流水弹窗，数据由弹窗组件加载。
const openPointsDialog = () => {
  isPointsDialogVisible.value = true;
};

// 打开注销弹窗并重置密码。
const openAccountDeletion = () => {
  if (isLoggingOut.value || isDeleting.value) return;
  deletePassword.value = "";
  deleteError.value = "";
  isDeleteVisible.value = true;
};

// 关闭弹窗时清除密码。
const closeAccountDeletion = () => {
  if (isDeleting.value) return;
  isDeleteVisible.value = false;
  deletePassword.value = "";
  deleteError.value = "";
};

// 二次确认后提交注销请求；失败时保留会话并显示原因。
const confirmAccountDeletion = async () => {
  if (isDeleting.value) return;
  if (!deletePassword.value) {
    deleteError.value = "请输入当前密码";
    return;
  }
  isDeleting.value = true;
  const currentToken = getToken();
  const currentUserId = sessionState.user?.userId;
  const confirmed = await new Promise((resolve) =>
    uni.showModal({
      title: "确认永久注销",
      content: "账号、作品、草稿和积分将被永久删除，确认继续吗？",
      confirmText: "确认注销",
      confirmColor: "#b93a2f",
      success: (result) => resolve(Boolean(result.confirm)),
      fail: () => resolve(false),
    }),
  );
  if (!confirmed) {
    isDeleting.value = false;
    return;
  }
  if (
    !currentToken ||
    getToken() !== currentToken ||
    sessionState.user?.userId !== currentUserId
  ) {
    deleteError.value = "登录状态已变化，请重新操作";
    isDeleting.value = false;
    return;
  }
  try {
    await deleteAccount({ password: deletePassword.value });
    const userId = sessionState.user?.userId;
    try {
      if (userId) uni.removeStorageSync(`batch_optimization_pending_${userId}`);
      uni.removeStorageSync("imageCreationDraft");
      uni.removeStorageSync("videoCreationDraft");
    } catch {
      uni.showToast({ title: "账号已注销，本地缓存清理失败", icon: "none" });
    }
    deletePassword.value = "";
    clearSession();
    uni.reLaunch({ url: PAGE_PATHS.AUTH });
    uni.showToast({ title: "账号已注销", icon: "none" });
  } catch (error) {
    deleteError.value = error?.message || "注销失败，请稍后重试";
  } finally {
    isDeleting.value = false;
  }
};

/**
 * 打开常用功能或设置弹窗；主页面与底部导航一致用 reLaunch。
 *
 * @param {{key: string, url?: string, relaunch?: boolean}} item 菜单配置。
 * @returns {void}
 */
const openMenu = (item) => {
  if (item.key === "setting") {
    isSettingsVisible.value = true;

    return;
  }

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
  if (isLoggingOut.value || isDeleting.value) {
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

onShow(loadNotificationCount);

onUnmounted(() => {
  notificationRequestVersion += 1;
  profileGeneration += 1;
  avatarGeneration += 1;
  avatarTask?.abort();
});
</script>

<style scoped lang="scss">
.delete-account-entry {
  @include tap-area($tap-size);
  margin: 0;
  padding: 0;
  border: 1rpx solid #e5c9c5;
  border-radius: 20rpx;
  box-sizing: border-box;
  background: #fff;
  color: #b93a2f;
  font-size: 28rpx;
  line-height: 1;

  &::after {
    border: 0;
  }
}
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
  position: relative;
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

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-retry {
  margin: 0;
  padding: 0 8rpx;
  background: transparent;
  color: #8a6840;
  font-size: 20rpx;
  line-height: 1.5;
}

.edit-profile {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 64rpx;
  min-height: 64rpx;
  margin: 0;
  padding: 0 16rpx;
  border: 1rpx solid #ead8bd;
  border-radius: 999rpx;
  background: #fffaf2;
  color: #8a6840;
  font-size: 24rpx;
  line-height: 1;
  gap: 8rpx;
}

.edit-profile::after {
  border: 0;
}

.settings-content {
  padding-top: 20rpx;
}

.settings-description {
  display: block;
  color: $color-muted;
  font-size: 24rpx;
  line-height: 1.6;
}

.settings-carousel {
  margin-top: 12rpx;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.profile-form input {
  padding: 14rpx;
  border: 1rpx solid #d8d2c5;
  border-radius: 10rpx;
}

.profile-error {
  color: #b93a2f;
  font-size: 24rpx;
}

.avatar-editor {
  flex-direction: column;
}

.avatar-editor,
.avatar-upload-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;

  button {
    margin: 0;
    padding: 6rpx 20rpx;
    border-radius: 10rpx;
    background: #f7edde;
    color: #805e36;
    font-size: 24rpx;
    line-height: 1.6;
  }
}

.avatar-preview {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
}

.profile-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.profile-form-actions button {
  min-width: 144rpx;
  margin: 0;
  padding: 0 24rpx;
  border: 1rpx solid #e6d9c7;
  border-radius: 12rpx;
  background: #fff;
  color: $color-ink;
  font-size: 28rpx;
  line-height: 2.5;
}

.profile-form-actions button:last-child {
  border-color: $color-primary;
  background: $color-primary;
  color: #fff;
}

.profile-form-actions button::after {
  border: 0;
}

.edit-profile-icon {
  font-size: 30rpx;
  line-height: 1;
}

.edit-profile-label {
  display: none;
}

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

.notification-count {
  padding: 2rpx 12rpx;
  border-radius: 20rpx;
  background: #b98349;
  color: #fff;
  font-size: 22rpx;
}

.menu-arrow {
  color: #c9b79b;
  font-size: 26rpx;
}

/* 桌面端上方展示资料与积分，下方展示常用功能。 */
@media (min-width: $breakpoint-desktop) {
  .content {
    height: calc(100vh - 50px - 100px);
    padding: 32px;
  }

  .profile-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }

  .profile-card,
  .menu-card {
    box-sizing: border-box;
    padding: 24px;
  }

  .profile-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: center;
    gap: 32px;
  }

  .identity-copy {
    padding-right: 120px;
  }

  .points-entry {
    margin-top: 0;
  }

  .identity-tag,
  .menu-label,
  .points-action {
    white-space: nowrap;
  }

  .edit-profile {
    min-width: 0;
    min-height: 36px;
    padding: 0 14px;
    font-size: 14px;
  }

  .edit-profile-label {
    display: inline;
  }

  .edit-profile-icon {
    font-size: 18px;
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

  /* App 端上下排列，整体避开底部导航。 */
  .account-actions {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    width: 100%;
  }

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

    .account-actions {
      flex-direction: row;
      align-items: center;
      gap: 16px;
      max-width: 1024px;
      margin: 0 auto;
    }

    .delete-account-entry,
    .logout-button {
      flex: 1;
      width: auto;
      max-width: none;
      margin: 0;
    }
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
    width: 100%;
  }
}
</style>
