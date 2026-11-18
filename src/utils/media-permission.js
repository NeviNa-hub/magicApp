/**
 * 权限被拒绝时提示用户，可由用户选择打开设置。
 * @param {Object} error 平台返回的错误。
 * @param {string} purpose 权限用途描述。
 * @returns {boolean} 是否识别并处理了权限拒绝。
 */
export const showMediaPermissionHelp = (error, purpose) => {
  const text = String(error?.errMsg || error?.message || "").toLowerCase();
  if (!/(auth deny|permission denied|permission deny|no permission|not authorized|unauthorized|权限.*(拒绝|不足|未授权))/.test(text)) {
    return false;
  }
  let openSettings = null;
  // #ifdef APP-PLUS
  if (typeof uni.openAppAuthorizeSetting === "function") {
    openSettings = () => uni.openAppAuthorizeSetting({
      fail: () => uni.showToast({ title: "请在系统设置中开启权限", icon: "none" }),
    });
  }
  // #endif
  // #ifdef MP-WEIXIN
  if (typeof uni.openSetting === "function") {
    openSettings = () => uni.openSetting({
      fail: () => uni.showToast({ title: "请在小程序设置中开启权限", icon: "none" }),
    });
  }
  // #endif
  uni.showModal({
    title: "需要授权",
    content: `${purpose}需要相应权限，请在设置中开启后重试。`,
    showCancel: Boolean(openSettings),
    confirmText: openSettings ? "去设置" : "知道了",
    success: (result) => {
      if (result.confirm && openSettings) openSettings();
    },
  });
  return true;
};
