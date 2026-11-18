import request from "@/apis/http";

/**
 * 创建文字生图任务。
 * @param {Object} data 生图参数。
 * @param {string} idempotencyKey 本次请求的幂等标识。
 * @returns {Promise<Object>} 创建结果。
 */
export const createImageGeneration = (data, idempotencyKey) => {
  return request({
    url: "/text-to-image/tasks",
    method: "POST",
    data,
    header: { "Idempotency-Key": idempotencyKey },
  });
};

/**
 * 查询文字生图任务状态。
 * @param {Object} params 路径参数，包含 taskId。
 * @returns {Promise<Object>} 任务状态。
 */
export const getImageTaskStatus = (params = {}) => {
  return request({
    url: `/tasks/${encodeURIComponent(params.taskId || "")}`,
    method: "GET",
    params: { ...params },
  });
};
