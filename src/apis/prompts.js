import request from "@/apis/http";

/**
 * 请求优化创作提示词。
 * @param {Object} data 包含创作类型与原提示词。
 * @param {Object} opt 取消信号等请求选项。
 * @returns {Promise<Object>} 候选提示词。
 */
export const optimizePrompt = (data = {}, opt = {}) => {
  return request({
    ...opt,
    url: "/prompts/optimize",
    method: "POST",
    data,
    timeout: 60000,
  });
};
