import request from "@/apis/http";

/**
 * 获取积分余额与流水。
 * @param {Object} params 分页查询参数。
 * @param {Object} opt 请求选项。
 * @returns {Promise<Object>} 积分余额与流水数据。
 */
export const getPointsInfo = (params = {}, opt = {}) => {
  return request({
    ...opt,
    url: "/points/myInfo",
    method: "GET",
    params: { ...params },
  });
};
