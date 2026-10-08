// 获取创作台展示数据。
export const getWorkbenchData = () => Promise.resolve({
  code: 0,
  message: "success",
  data: {
    frames: ["起势·淡雾", "承转·远山", "流光·松石", "收敛·留白"],
    drafts: [
      { title: "《松山夜笛》插图构思", time: "2小时前", status: "待生成" },
      { title: "茶室空间运镜脚本设计", time: "昨日", status: "已分镜" },
      { title: "老照片人物去污处理", time: "3日前", status: "已完成" },
    ],
  },
});

// 获取文字生图第一步的模拟配置。
export const getImageCreationOptions = () => Promise.resolve({
  code: 0,
  message: "success",
  data: {
    suggestions: ["江南烟雨", "宋代山水", "青绿设色", "晨曦微光", "枯墨留白"],
    polishSuffix: "画面空灵雅致，留白自然，笔触细腻",
    randomPrompt: "薄雾晨光里的青绿山水，远处层峦叠嶂，近处一叶轻舟掠过溪面",
  },
});

// 获取文字生图第二步的模拟画风配置。
export const getImageStyles = () => Promise.resolve({
  code: 0,
  message: "success",
  data: {
    defaultStyle: "宋式水墨",
    styles: [
      { name: "宋式水墨", description: "写意淡墨，温润留白，淡雅韵味。", className: "ink-style" },
      { name: "真实摄影", description: "微质感，柔和光影，细腻真实。", className: "photo-style" },
      { name: "宋瓷青釉", description: "手工釉色肌理，低饱和大地色。", className: "ceramic-style" },
      { name: "温润插画", description: "轻笔与木刻手绘感，质朴温暖。", className: "illustration-style" },
    ],
  },
});

// 获取文字生图第三步的模拟画幅配置。
export const getImageCanvasOptions = () => Promise.resolve({
  code: 0,
  message: "success",
  data: {
    prompt: "秋日午后微风拂过，远山薄雾……",
    style: "宋式水墨（温润留白）",
    ratios: [
      { name: "1:1 方形", description: "适合朋友圈 / 头像", value: "1:1" },
      { name: "16:9 横卷", description: "电脑宽幅长卷", value: "16:9" },
      { name: "9:16 立轴", description: "移动壁纸画轴", value: "9:16" },
      { name: "4:3 经典", description: "雅致画册典藏", value: "4:3" },
    ],
    counts: [{ name: "单张", cost: 2 }, { name: "双张", cost: 4 }, { name: "四张", cost: 8 }],
  },
});

// 获取画卷生成进度。
export const getImageGenerationStatus = () => Promise.resolve({
  code: 0,
  message: "success",
  data: { progress: 98 },
});

// 获取作品库模拟数据。
export const getLibraryData = () => Promise.resolve({
  code: 0,
  message: "success",
  data: {
    summary: "共 18 幅典藏 · 1 幅研墨中",
    tabs: [{ name: "全部", count: 19 }, { name: "已完成", count: 12 }, { name: "创作中", count: 4 }, { name: "草稿", count: 3 }],
    works: [
      { title: "《寒江独钓图》", className: "river-work" },
      { title: "《空山新雨竹影》", className: "bamboo-work" },
      { title: "《茶室听雪静物》", className: "tea-work" },
      { title: "《烟渚微茫图》", className: "mist-work" },
    ],
  },
});
