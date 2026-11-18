import request from "@/apis/http";

/**
 * 获取创作任务按 token 计算的积分报价。
 * @param {Object} data 报价参数：task_type、prompt、style、duration。
 * @returns {Promise<Object>} 输入/输出 token 与预计积分。
 */
export const getCreationQuote = (data = {}) => {
  return request({
    url: "/pricing/quote",
    method: "POST",
    data,
    // 报价随输入变化，失败提示由页面处理。
    silent: true,
  });
};
