import request from "@/apis/http";

/**
 * 取消进行中的生成任务。
 * @param {Object} params 请求参数，包含 taskId。
 * @returns {Promise<Object>} 取消后的任务状态。
 */
export const cancelGenerationTask = (params = {}) =>
  request({
    url: `/tasks/${encodeURIComponent(params.taskId || "")}/cancel`,
    method: "POST",
    params
  });

/**
 * 重试失败的生成任务。
 * @param {Object} params 请求参数，包含 taskId。
 * @returns {Promise<Object>} 重新排队后的任务状态。
 */
export const retryGenerationTask = (params = {}) =>
  request({
    url: `/tasks/${encodeURIComponent(params.taskId || "")}/retry`,
    method: "POST",
    params
  });
