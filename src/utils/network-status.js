import { reactive } from "vue";

// 仅展示系统报告的网络状态，不将网络类型等同于后端可用性。
export const networkStatus = reactive({ type: "unknown", isConnected: true });

let isListening = false;
let isRegistered = false;
let revision = 0;

/**
 * 更新设备网络状态。
 * @param {Object} result uni-app 网络状态。
 * @returns {void}
 */
const updateNetworkStatus = (result) => {
  const type = result.networkType || "unknown";
  networkStatus.type = type;
  networkStatus.isConnected = result.isConnected !== false && type !== "none";
};

/**
 * 处理网络变化，阻止较早的初始查询覆盖新状态。
 * @param {Object} result 网络变化事件。
 * @returns {void}
 */
const handleNetworkChange = (result) => {
  if (!isListening) return;
  revision += 1;
  updateNetworkStatus(result);
};

// 应用进入前台时查询并监听网络状态。
export const startNetworkStatus = () => {
  if (isListening) return;
  isListening = true;
  const current = ++revision;
  if (!isRegistered && typeof uni.onNetworkStatusChange === "function") {
    uni.onNetworkStatusChange(handleNetworkChange);
    isRegistered = true;
  }
  if (typeof uni.getNetworkType === "function") {
    uni.getNetworkType({
      success: (result) => {
        if (isListening && current === revision) updateNetworkStatus(result);
      },
    });
  }
};

// 应用进入后台时移除监听，回到前台重新查询。
export const stopNetworkStatus = () => {
  if (!isListening) return;
  isListening = false;
  revision += 1;
  if (isRegistered && typeof uni.offNetworkStatusChange === "function") {
    uni.offNetworkStatusChange(handleNetworkChange);
    isRegistered = false;
  }
};
