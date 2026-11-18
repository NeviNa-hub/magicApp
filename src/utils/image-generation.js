import { createImageGeneration } from "@/apis/text-to-image";

const pendingRequests = new Map();

/**
 * 创建文字生图任务；同一参数的失败请求重试沿用幂等标识。
 * @param {Object} params 生图参数。
 * @returns {Promise<Object>} 创建结果。
 */
export const submitImageGeneration = async (params) => {
  const signature = JSON.stringify(params);

  if (!pendingRequests.has(signature)) {
    pendingRequests.set(signature, `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);
  }
  const key = pendingRequests.get(signature);
  const result = await createImageGeneration(params, key);
  if (!result?.task_id) throw new Error("任务创建结果无效，请使用相同参数重试");
  if (pendingRequests.get(signature) === key) pendingRequests.delete(signature);
  return result;
};
