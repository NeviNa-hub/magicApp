const WORKBENCH_DATA = {
  frames: ["起势·淡雾", "承转·远山", "流光·松石", "收敛·留白"],
  drafts: [
    {
      draft_id: 1,
      title: "《松山夜笛》插图构思",
      time: "2小时前",
      status: "待生成",
    },
    {
      draft_id: 2,
      title: "茶室空间运镜脚本设计",
      time: "昨日",
      status: "已分镜",
    },
    {
      draft_id: 3,
      title: "老照片人物去污处理",
      time: "3日前",
      status: "已完成",
    },
  ],
};

const LIBRARY_TABS = [
  { status: "all", name: "全部", count: 19 },
  { status: "completed", name: "已完成", count: 12 },
  { status: "creating", name: "创作中", count: 4 },
  { status: "draft", name: "草稿", count: 3 },
];

const WORKS = [
  {
    work_id: 1,
    title: "《寒江独钓图》",
    status: "completed",
    class_name: "river-work",
  },
  {
    work_id: 2,
    title: "《空山新雨竹影》",
    status: "completed",
    class_name: "bamboo-work",
  },
  {
    work_id: 3,
    title: "《茶室听雪静物》",
    status: "creating",
    class_name: "tea-work",
  },
  {
    work_id: 4,
    title: "《烟渚微茫图》",
    status: "draft",
    class_name: "mist-work",
  },
];

/** 获取创作台数据。 @returns {Promise<Object>} 创作台响应。 */
export function getWorkbenchData() {
  return Promise.resolve({ code: 0, message: "success", data: WORKBENCH_DATA });
}

/** 获取作品库列表。 @param {Object} params 查询参数。 @returns {Promise<Object>} 作品库响应。 */
export function getLibraryData(params = {}) {
  const status = params.status || "all";
  const lists = WORKS.filter((item) => status === "all" || item.status === status);
  const page = params.page || 1;
  const pageSize = params.page_size || 10;
  const start = (page - 1) * pageSize;

  return Promise.resolve({
    code: 0,
    message: "success",
    data: {
      summary: "共 18 幅典藏 · 1 幅研墨中",
      tabs: LIBRARY_TABS,
      page_info: { page, page_size: pageSize, total: lists.length },
      lists: lists.slice(start, start + pageSize),
    },
  });
}
