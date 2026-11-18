import request from "@/apis/http";

/**
 * 注册新用户。
 * @param {Object} data 注册参数。
 * @returns {Promise<Object>} 注册结果。
 */
export const registerUser = (data = {}) => {
  return request({
    url: "/auth/register",
    method: "POST",
    data,
  });
};

/**
 * 登录。
 * @param {Object} data 登录参数。
 * @returns {Promise<Object>} 登录凭证和用户资料。
 */
export const loginUser = (data = {}) => {
  return request({
    url: "/auth/login",
    method: "POST",
    data,
  });
};

/**
 * 退出登录。
 * @param {Object} data 请求参数。
 * @returns {Promise<null>} 登出结果。
 */
export const logoutUser = (data = {}) => {
  return request({
    url: "/auth/logout",
    method: "POST",
    data,
  });
};

/**
 * 校验密码并永久注销当前账号。
 * @param {Object} data 当前账号密码。
 * @returns {Promise<null>} 注销结果。
 */
export const deleteAccount = (data = {}) => {
  return request({
    url: "/auth/delete-account",
    method: "POST",
    data,
    silent: true,
  });
};
