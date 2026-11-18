/**
 * 创作积分 Demo 计价：与后端 app/core/pricing.py 使用同一公式。
 */

export const POINTS_PER_1K_TOKENS = 2;
export const MIN_TASK_POINTS = 1;
export const OUTPUT_TOKEN_BUDGETS = {
  image: 900,
  optimization: 450,
  video: 2200,
};

const CJK_PATTERN =
  /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]/g;

/**
 * 估算文本 token 数：中日韩字符约 1 字 1 token，其余按 4 字符 1 token。
 * @param {string} text 待估算文本。
 * @returns {number} token 数。
 */
export const estimateTextTokens = (text = "") => {
  const value = String(text || "");
  const cjkCount = (value.match(CJK_PATTERN) || []).length;

  return cjkCount + Math.ceil((value.length - cjkCount) / 4);
};

/**
 * 计算创作任务的预计 token 与积分消耗。
 * @param {Object} params 报价参数。
 * @param {string} params.task_type 任务类型：image / optimization / video。
 * @param {string} [params.prompt] 提示词。
 * @param {string} [params.style] 画风文案。
 * @returns {Object} 与后端 /pricing/quote 一致的报价。
 */
export const quoteCreation = ({ task_type: taskType, prompt = "", style = "", duration = 5 } = {}) => {
  const baseOutput = OUTPUT_TOKEN_BUDGETS[taskType] || 0;
  const outputTokens = taskType === "video" ? Math.ceil(baseOutput * duration / 5) : baseOutput;
  const inputTokens = estimateTextTokens(prompt) + estimateTextTokens(style);
  const totalTokens = inputTokens + outputTokens;

  // 积分只随 token 增长，不设价格上限；提示词长度由创作页限制为 1000 字。
  return {
    task_type: taskType,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: totalTokens,
    cost_points: Math.max(
      MIN_TASK_POINTS,
      Math.ceil((totalTokens * POINTS_PER_1K_TOKENS) / 1000)
    ),
    points_per_1k_tokens: POINTS_PER_1K_TOKENS,
  };
};

/**
 * 判断是否为支持计价的任务类型。
 * @param {string} taskType 任务类型。
 * @returns {boolean} 是否支持。
 */
export const isPricedTaskType = (taskType) =>
  Object.prototype.hasOwnProperty.call(OUTPUT_TOKEN_BUDGETS, taskType);
