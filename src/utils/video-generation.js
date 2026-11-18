import { createVideoGeneration } from "@/apis/video-creation";

const pendingRequests = new Map();

/** 相同请求重试沿用幂等标识，避免重复扣费。 */
export const submitVideoGeneration = async (params) => {
  const signature = JSON.stringify(params);
  if (!pendingRequests.has(signature)) {
    pendingRequests.set(signature, `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);
  }
  const key = pendingRequests.get(signature);
  const result = await createVideoGeneration(params, key);
  if (!result?.task_id) throw new Error("任务创建结果无效，请使用相同参数重试");
  if (pendingRequests.get(signature) === key) pendingRequests.delete(signature);
  return result;
};
