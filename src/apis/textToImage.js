const IMAGE_STYLES = [
  {
    style_id: 1,
    name: "宋式水墨",
    description: "写意淡墨，温润留白，淡雅韵味。",
    class_name: "ink-style",
  },
  {
    style_id: 2,
    name: "真实摄影",
    description: "微质感，柔和光影，细腻真实。",
    class_name: "photo-style",
  },
  {
    style_id: 3,
    name: "宋瓷青釉",
    description: "手工釉色肌理，低饱和大地色。",
    class_name: "ceramic-style",
  },
  {
    style_id: 4,
    name: "温润插画",
    description: "轻笔与木刻手绘感，质朴温暖。",
    class_name: "illustration-style",
  },
];

const CANVAS_OPTIONS = {
  ratios: [
    {
      ratio_id: 1,
      name: "1:1 方形",
      description: "适合朋友圈 / 头像",
      value: "1:1",
    },
    {
      ratio_id: 2,
      name: "16:9 横卷",
      description: "电脑宽幅长卷",
      value: "16:9",
    },
    {
      ratio_id: 3,
      name: "9:16 立轴",
      description: "移动壁纸画轴",
      value: "9:16",
    },
    {
      ratio_id: 4,
      name: "4:3 经典",
      description: "雅致画册典藏",
      value: "4:3",
    },
  ],
  counts: [
    { count_id: 1, name: "单张", value: 1, cost: 2 },
    { count_id: 2, name: "双张", value: 2, cost: 4 },
    { count_id: 3, name: "四张", value: 4, cost: 8 },
  ],
};

/** 获取文字生图构思配置。 @returns {Promise<Object>} 构思配置响应。 */
export function getImageCreationOptions() {
  return Promise.resolve({
    code: 0,
    message: "success",
    data: {
      suggestions: ["江南烟雨", "宋代山水", "青绿设色", "晨曦微光", "枯墨留白"],
      polish_suffix: "画面空灵雅致，留白自然，笔触细腻",
      random_prompt: "薄雾晨光里的青绿山水，远处层峦叠嶂，近处一叶轻舟掠过溪面",
    },
  });
}

/** 获取文字生图画风列表。 @returns {Promise<Object>} 画风列表响应。 */
export function getImageStyles() {
  return Promise.resolve({
    code: 0,
    message: "success",
    data: {
      default_style: "宋式水墨",
      lists: IMAGE_STYLES,
    },
  });
}

/** 获取文字生图画幅配置。 @returns {Promise<Object>} 画幅配置响应。 */
export function getImageCanvasOptions() {
  return Promise.resolve({ code: 0, message: "success", data: CANVAS_OPTIONS });
}

/** 创建文字生图任务。 @param {Object} data 生成参数。 @returns {Promise<Object>} 创建任务响应。 */
export function createImageGeneration(data) {
  return Promise.resolve({
    code: 0,
    message: "success",
    data: {
      task_id: `image-${Date.now()}`,
      status: "processing",
      ...data,
    },
  });
}

/** 获取文字生图任务进度。 @param {Object} params 查询参数。 @returns {Promise<Object>} 进度响应。 */
export function getImageGenerationStatus(params = {}) {
  return Promise.resolve({
    code: 0,
    message: "success",
    data: {
      task_id: params.task_id || "mock-task",
      progress: 68,
      status: "processing",
    },
  });
}
