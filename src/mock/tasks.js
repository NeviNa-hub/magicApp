/**
 * Mock 任务存储：按创建时间推进进度，供轮询接口读取。
 */
import { TASK_STATUS } from "../apis/constants.js";
import { quoteCreation } from "./pricing.js";

const TASK_DURATION = 12000;

const taskStore = new Map();
let taskSequence = 0;

// 通知复用模拟任务的完成状态和已读标记。
export const listMockNotifications = () => {
  return Array.from(taskStore.keys())
    .map(readMockTask)
    .filter((task) => task.status === TASK_STATUS.COMPLETED)
    .reverse();
};

/**
 * 标记已完成的模拟任务通知。
 * @param {string} taskId 任务标识。
 * @returns {boolean} 通知是否存在。
 */
export const readMockNotification = (taskId) => {
  const task = readMockTask(taskId);
  if (!task || task.status !== TASK_STATUS.COMPLETED) return false;
  taskStore.get(taskId).notificationRead = true;
  return true;
};

/**
 * 创建一个模拟任务并返回任务记录。
 * @param {string} type 任务类型：image / optimization / video。
 * @param {Object} payload 创建任务时的业务参数。
 * @returns {Object} 模拟任务记录，含任务标识与实际扣费。
 */
export const createMockTask = (type, payload = {}) => {
  taskSequence += 1;

  const taskId = payload.draft_id || `${type}-${Date.now()}-${taskSequence}`;
  const quote = quoteCreation({
    task_type: type,
    prompt: payload.prompt,
    style: payload.style,
    duration: payload.duration,
  });
  const record = {
    taskId,
    type,
    payload,
    costPoints: quote.cost_points,
    createdAt: Date.now(),
    statusOverride: null,
    frozenProgress: 0,
  };

  taskStore.set(taskId, record);

  return record;
};

/**
 * 读取模拟任务并按时间推进进度。
 * @param {string} taskId 任务标识。
 * @returns {Object|null} 任务快照，不存在时返回 null。
 */
export const readMockTask = (taskId) => {
  const record = taskStore.get(taskId);

  if (!record) {
    return null;
  }

  if (record.statusOverride) {
    return {
      ...record,
      progress: record.frozenProgress,
      status: record.statusOverride,
    };
  }

  const elapsed = Date.now() - record.createdAt;
  const progress = Math.min(100, Math.floor((elapsed / TASK_DURATION) * 100));

  return {
    ...record,
    progress,
    status: progress >= 100 ? TASK_STATUS.COMPLETED : TASK_STATUS.PROCESSING,
  };
};

/**
 * 取消进行中的模拟任务，已结束的任务保持原状态。
 * @param {string} taskId 任务标识。
 * @returns {Object|null} 取消后的任务快照。
 */
export const cancelMockTask = (taskId) => {
  const stored = taskStore.get(taskId);
  const snapshot = readMockTask(taskId);

  if (!stored || !snapshot) {
    return null;
  }

  if (
    snapshot.status === TASK_STATUS.PENDING ||
    snapshot.status === TASK_STATUS.PROCESSING
  ) {
    stored.statusOverride = TASK_STATUS.CANCELED;
    stored.frozenProgress = snapshot.progress;
  }

  return readMockTask(taskId);
};

/**
 * 重新排队失败的模拟任务。
 * @param {string} taskId 任务标识。
 * @returns {Object|null} 重新排队后的任务快照。
 */
export const retryMockTask = (taskId) => {
  const stored = taskStore.get(taskId);
  const snapshot = readMockTask(taskId);

  if (!stored || !snapshot) {
    return null;
  }

  if (snapshot.status === TASK_STATUS.FAILED) {
    stored.statusOverride = null;
    stored.createdAt = Date.now();
  }

  return readMockTask(taskId);
};

/**
 * 组装任务操作接口的通用响应，字段与后端 TaskResult 保持一致。
 * @param {Object} record 任务快照。
 * @returns {Object} 任务状态数据。
 */
export const buildMockTaskResult = (record) => ({
  task_id: record.taskId,
  task_type: record.type,
  status: record.status,
  progress: record.status === TASK_STATUS.COMPLETED ? 100 : record.progress,
  result_urls: [],
  error_message: record.status === TASK_STATUS.FAILED ? "模拟创作失败" : null,
  cost_points: record.costPoints || 0,
  refund_points: 0,
  retry_cost_points: 0,
});
