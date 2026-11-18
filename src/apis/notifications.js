import request from "@/apis/http";

/**
 * 查询创作完成通知。
 * @param {Object} params 分页参数。
 * @param {Object} opt 请求选项。
 * @returns {Promise<Object>} 通知列表和未读数量。
 */
export const getNotifications = (params = {}, opt = {}) => {
  return request({ ...opt, url: "/notifications", method: "GET", params: { ...params } });
};

/**
 * 标记一条通知为已读。
 * @param {Object} params 包含任务标识。
 * @param {Object} data 请求体。
 * @returns {Promise<Object>} 已读结果。
 */
export const markNotificationRead = (params = {}, data = {}) => {
  return request({
    url: `/notifications/${encodeURIComponent(params.taskId)}/read`,
    method: "PUT",
    data,
  });
};
