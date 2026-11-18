import request from "@/apis/http";

/**
 * 创建文字视频任务。
 * @param {Object} data 视频创作参数。
 * @param {string} idempotencyKey 请求幂等标识。
 * @returns {Promise<Object>} 创建结果。
 */
export const createVideoGeneration = (data, idempotencyKey) => {
  return request({
    url: "/video/tasks",
    method: "POST",
    data,
    header: { "Idempotency-Key": idempotencyKey },
  });
};

/**
 * 查询视频任务状态。
 * @param {Object} params 包含任务标识。
 * @returns {Promise<Object>} 任务状态。
 */
export const getVideoTaskStatus = (params = {}) => {
  return request({
    url: `/tasks/${encodeURIComponent(params.taskId || "")}`,
    method: "GET",
    params: { ...params },
  });
};

