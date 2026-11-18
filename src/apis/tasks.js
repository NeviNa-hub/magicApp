import request from "@/apis/http";

/**
 * 取消进行中的生成任务。
 * @param {Object} params 路径参数，包含 taskId。
 * @param {Object} data 请求体。
 * @returns {Promise<Object>} 取消后的任务状态。
 */
export const cancelGenerationTask = (params = {}, data = {}) => {
  return request({
    url: `/tasks/${encodeURIComponent(params.taskId || "")}/cancel`,
    method: "POST",
    data,
  });
};

/**
 * 重试失败的生成任务。
 * @param {Object} params 路径参数，包含 taskId。
 * @param {Object} data 请求体。
 * @returns {Promise<Object>} 重新排队后的任务状态。
 */
export const retryGenerationTask = (params = {}, data = {}) => {
  return request({
    url: `/tasks/${encodeURIComponent(params.taskId || "")}/retry`,
    method: "POST",
    data,
  });
};
