/**
 * 任务退款与重试费用的展示规则。
 */

/**
 * 读取当前任务这次失败或取消已退回的积分。
 * @param {Object} [data] 任务状态数据。
 * @returns {number} 已退回积分，缺少字段时为 0。
 */
export const getTaskRefundPoints = (data) => {
  const points = Number(data?.current_refund_points ?? data?.refund_points);

  return Number.isFinite(points) && points > 0 ? points : 0;
};

/**
 * 读取重试将扣除的积分。
 * @param {Object} [data] 任务状态数据。
 * @returns {number} 重试费用，免费重试时为 0。
 */
export const getTaskRetryCost = (data) => {
  const points = Number(data?.retry_cost_points);

  return Number.isFinite(points) && points > 0 ? points : 0;
};

/**
 * 拼接失败提示；模型未产出结果时补充退回金额，重试免费时说明不会重复扣费。
 * @param {Object} [data] 任务状态数据。
 * @param {string} fallback 缺少失败原因时的兜底文案。
 * @returns {string} 展示给用户的失败提示。
 */
export const buildFailureNote = (data, fallback) => {
  const reason = data?.error_message || fallback;
  const message = /\b402\s*[:\s-]*payment required\b|\bhttp(?: error)?\s+402\b/i.test(reason)
    ? "创作服务暂不可用，请联系管理员检查服务额度。"
    : reason;

  if (!data) {
    return message;
  }

  const refundPoints = getTaskRefundPoints(data);

  if (refundPoints > 0) {
    return `${message} 本次消耗的 ${refundPoints} 积分已退回。`;
  }

  return `${message} 重试不会重复扣费。`;
};
