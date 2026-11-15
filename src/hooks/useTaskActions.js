/**
 * 任务取消与重试操作
 */
import { ref } from "vue";

import { cancelGenerationTask, retryGenerationTask } from "@/apis/tasks";
import { loadPointsBalance } from "@/stores";
import { getErrorMessage, isApiError } from "@/utils/request";

/**
 * 创建任务操作控制器，统一取消确认、提交中状态与成功提示。
 * @param {Object} options 操作配置。
 * @param {Function} options.getTaskId 返回当前任务标识。
 * @param {Function} options.getRetryCost 返回本次重试将扣除的积分，免费重试返回 0。
 * @param {Function} options.onCanceled 取消成功后的回调，参数为任务状态。
 * @param {Function} options.onRetried 重试成功后的回调，参数为任务状态。
 * @returns {{cancelTask: Function, retryTask: Function, isCanceling: import("vue").Ref<boolean>, isRetrying: import("vue").Ref<boolean>}}
 *   任务操作控制器。
 */
const useTaskActions = (options = {}) => {
  const isCanceling = ref(false);
  const isRetrying = ref(false);

  // 取消会中断生成，操作前先二次确认；弹窗异常按放弃处理
  const confirmCancel = () =>
    new Promise((resolve) => {
      uni.showModal({
        title: "取消创作",
        content: "取消后任务将停止生成，本次消耗的积分会退回。",
        confirmText: "确认取消",
        cancelText: "继续创作",
        success: (result) => resolve(Boolean(result.confirm)),
        fail: () => resolve(false),
      });
    });

  // 上次失败已自动退款时，重试需要重新扣费，先确认再提交
  const confirmRetry = (cost) =>
    new Promise((resolve) => {
      if (cost <= 0) {
        resolve(true);
        return;
      }

      uni.showModal({
        title: "重试创作",
        content: `上次失败已退回积分，重试将再次扣除 ${cost} 积分。`,
        confirmText: "确认重试",
        cancelText: "暂不重试",
        success: (result) => resolve(Boolean(result.confirm)),
        fail: () => resolve(false),
      });
    });

  // 请求层已统一提示接口异常，这里只兜底非接口异常
  const showActionError = (error, fallback) => {
    if (!isApiError(error)) {
      uni.showToast({ title: getErrorMessage(error, fallback), icon: "none" });
    }
  };

  // 取消进行中的任务，成功后由调用方停止轮询并展示取消状态
  const cancelTask = async () => {
    const taskId = options.getTaskId?.();

    if (!taskId || isCanceling.value || isRetrying.value) {
      return;
    }

    if (!(await confirmCancel())) {
      return;
    }

    isCanceling.value = true;

    try {
      const data = await cancelGenerationTask({ taskId });

      uni.showToast({ title: "已取消创作", icon: "none" });
      // 取消已退回积分，刷新共享余额供页头展示
      loadPointsBalance({ force: true });
      options.onCanceled?.(data);
    } catch (error) {
      showActionError(error, "取消失败，请稍后重试");
    } finally {
      isCanceling.value = false;
    }
  };

  // 重试失败任务；已退款的任务重新扣费，未退款的任务免费重排
  const retryTask = async () => {
    const taskId = options.getTaskId?.();

    if (!taskId || isCanceling.value || isRetrying.value) {
      return;
    }

    const retryCost = Number(options.getRetryCost?.()) || 0;

    if (!(await confirmRetry(retryCost))) {
      return;
    }

    isRetrying.value = true;

    try {
      const data = await retryGenerationTask({ taskId });

      uni.showToast({ title: "已重新开始创作", icon: "none" });

      if (retryCost > 0) {
        loadPointsBalance({ force: true });
      }

      options.onRetried?.(data);
    } catch (error) {
      showActionError(error, "重试失败，请稍后重试");
    } finally {
      isRetrying.value = false;
    }
  };

  return {
    cancelTask,
    retryTask,
    isCanceling,
    isRetrying,
  };
};

export default useTaskActions;
