const OPTIMIZATION_OPTIONS = {
  directions: [
    {
      direction_id: 1,
      icon_name: "grid",
      title: "无损超清",
      description: "4K超分重塑",
    },
    {
      direction_id: 2,
      icon_name: "spark",
      title: "旧画去噪",
      description: "质感抚平",
    },
    {
      direction_id: 3,
      icon_name: "spark",
      title: "意境重绘",
      description: "笔触唤醒",
    },
  ],
  intensities: ["微调修润", "均衡重构", "深度淬炼"],
  default_direction: "无损超清",
  default_intensity: "均衡重构",
  cost: 3,
};

/** 获取图片优化配置。 @returns {Promise<Object>} 优化配置响应。 */
export function getImageOptimizationOptions() {
  return Promise.resolve({
    code: 0,
    message: "success",
    data: OPTIMIZATION_OPTIONS,
  });
}

/** 创建图片优化任务。 @param {Object} data 优化参数。 @returns {Promise<Object>} 创建任务响应。 */
export function createImageOptimization(data) {
  return Promise.resolve({
    code: 0,
    message: "success",
    data: {
      task_id: `optimization-${Date.now()}`,
      status: "processing",
      ...data,
    },
  });
}
