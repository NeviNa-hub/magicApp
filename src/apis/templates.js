import request from "@/apis/http";

/**
 * 查询创作模板。
 * @param {Object} params 模板类型筛选条件。
 * @returns {Promise<Object>} 模板列表。
 */
export const getTemplates = (params = {}) => {
  return request({ 
    url: "/templates", 
    method: "GET", 
    params: { ...params } 
  });
};
