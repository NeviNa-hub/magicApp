import request from "@/apis/http";

/**
 * 取消进行中的生成任务。
 * @param {Object} params 请求参数，包含 taskId。
 * @returns {Promise<Object>} 取消后的任务状态。
 */
export const cancelGenerationTask = (data = {}) =>
  request({
    url: `/tasks/${encodeURIComponent(data.taskId || "")}/cancel`,
    method: "POST",
    data,
  });

/**
 * 重试失败的生成任务。
 * @param {Object} params 请求参数，包含 taskId。
 * @returns {Promise<Object>} 重新排队后的任务状态。
 */
export const retryGenerationTask = (data = {}) =>
  request({
    url: `/tasks/${encodeURIComponent(data.taskId || "")}/retry`,
    method: "POST",
    data,
  });
