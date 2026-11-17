import request from "@/apis/http";

/**
 * 获取账户概览。
 * @param {Object} params 查询参数。
 * @returns {Promise<Object>} 账户数据。
 */
export const getAccountOverview = (params) => {
  return request({
    url: "/account/overview",
    method: "GET",
    params: { ...params },
  });
};

/**
 * 获取本人资料。
 * @param {Object} params 查询参数。
 * @returns {Promise<Object>} 本人资料。
 */
export const getProfile = (params = {}) => {
  return request({ url: "/profile", method: "GET", params: { ...params } });
};

/**
 * 修改本人昵称与头像。
 * @param {Object} data 资料字段。
 * @returns {Promise<Object>} 更新后的资料。
 */
export const updateProfile = (data = {}) => {
  return request({ url: "/profile", method: "PUT", data });
};
