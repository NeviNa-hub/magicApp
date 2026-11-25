/**
 * Mock 路由：按真实接口路径返回与后端一致的 { code, message, data } 结构。
 */
import { API_PATHS, ERROR_CODES, PAGE_DEFAULTS, TASK_STATUS } from "../apis/constants.js";
import { ACCOUNT_OVERVIEW, MOCK_LOGIN, POINTS_INFO } from "./account.js";
import { HOME_OVERVIEW, WORKBENCH_OVERVIEW, buildLibraryData, updateMockWork,
  getMockWorkMedia, deleteMockWork } from "./creation.js";
import {
  IMAGE_OPTIMIZATION_OPTIONS,
  buildOptimizationTaskStatus,
} from "./image-optimization.js";
import { isPricedTaskType, quoteCreation } from "./pricing.js";
import { countPromptCharacters, limitPromptCharacters } from "../utils/prompt.js";
import {
  buildMockTaskResult,
  cancelMockTask,
  createMockTask,
  listMockNotifications,
  readMockNotification,
  readMockTask,
  retryMockTask,
} from "./tasks.js";
import {
  IMAGE_CANVAS_OPTIONS,
  IMAGE_CREATION_OPTIONS,
  IMAGE_STYLE_OPTIONS,
  buildImageTaskStatus,
} from "./text-to-image.js";
import {
  VIDEO_CREATION_OPTIONS,
  VIDEO_RENDER_OPTIONS,
  buildVideoTaskStatus,
} from "./video-creation.js";

const ok = (data) => ({ code: ERROR_CODES.SUCCESS, message: "操作成功", data });
const fail = (code, message) => ({ code, message, data: null });

/**
 * 读取任务状态并组装响应。
 * @param {string} taskId 任务标识。
 * @param {Function} buildStatus 对应任务类型的状态组装方法。
 * @param {string} expectedType 期望的任务类型。
 * @returns {Object} 接口响应。
 */
const resolveTaskStatus = (taskId, buildStatus, expectedType) => {
  const record = readMockTask(taskId);

  if (!record || record.type !== expectedType) {
    return fail(ERROR_CODES.NOT_FOUND, "任务不存在或已过期");
  }

  return ok(buildStatus(record));
};

/**
 * 处理创建任务请求。
 * @param {string} type 任务类型。
 * @param {Object} data 请求参数。
 * @param {string[]} requiredFields 必填字段。
 * @returns {Object} 接口响应。
 */
const createTaskResponse = (type, data, requiredFields) => {
  const missingField = requiredFields.find((field) => !data?.[field]);

  if (missingField) {
    return fail(ERROR_CODES.INVALID_PARAMS, `缺少必要参数：${missingField}`);
  }

  if (data.draft_id) {
    const draft = draftStore.get(data.draft_id);
    if (!draft || draft.task_type !== type) return fail(ERROR_CODES.CONFLICT, "草稿不存在或已提交");
    draftStore.delete(data.draft_id);
  }
  const record = createMockTask(type, data);

  return ok({
    task_id: record.taskId,
    status: "processing",
    cost_points: record.costPoints,
  });
};

/**
 * 处理任务取消与重试请求，状态限制与后端保持一致。
 * @param {string} taskId 任务标识。
 * @param {"cancel" | "retry"} action 操作类型。
 * @returns {Object} 接口响应。
 */
const resolveTaskAction = (taskId, action) => {
  const record = readMockTask(taskId);

  if (!record) {
    return fail(ERROR_CODES.NOT_FOUND, "任务不存在或已过期");
  }

  if (action === "cancel") {
    if (record.status === TASK_STATUS.COMPLETED || record.status === TASK_STATUS.FAILED) {
      return fail(ERROR_CODES.CONFLICT, "任务已结束，无法取消");
    }

    return ok(buildMockTaskResult(cancelMockTask(taskId)));
  }

  if (record.status !== TASK_STATUS.FAILED) {
    return fail(ERROR_CODES.CONFLICT, "只有创作失败的任务可以重试");
  }

  return ok(buildMockTaskResult(retryMockTask(taskId)));
};

const sampleDraft = {
  id: "mock-editable-draft",
  task_type: "video",
  title: "待继续创作的草稿",
  input_data: { mode: "text", ratio: "16:9", prompt: "远山在晨雾中徐徐隐退" },
  updated_at: "2026-11-13T09:30:00",
};
const draftStore = new Map([[sampleDraft.id, sampleDraft]]);
const mockUploadedImages = new Map();
let draftSequence = 0;

let mockProfile = { user_id: MOCK_LOGIN.user_id, username: "体验用户", account: "demo", avatar_asset_id: null };

const exactRoutes = {
  "POST /prompts/optimize": (data) => {
    const limits = { image: 400, optimization: 200, video: 1000 };
    const limit = limits[data.task_type];
    const prompt = typeof data.prompt === "string" ? data.prompt.trim() : "";
    if (!limit || !prompt || countPromptCharacters(prompt) > limit) {
      return fail(ERROR_CODES.INVALID_PARAMS, "提示词无效");
    }
    return ok({ prompt: limitPromptCharacters(`${prompt}，画面细节清晰`, limit) });
  },
  "GET /templates": (params) => {
    const templates = [
      { id: "image-mountains", title: "晨雾山水", type: "image", description: "青绿山水与晨雾", params: { prompt: "晨雾缭绕的山水，远山层叠，溪边一叶小舟，画面宁静通透", style: "古风水墨", ratio: "16:9" } },
      { id: "image-cat", title: "午后小猫", type: "image", description: "温暖治愈的生活场景", params: { prompt: "阳光洒在窗边，一只橘猫安静地睡在软垫上，温暖柔和", style: "真实摄影", ratio: "1:1" } },
      { id: "video-river", title: "溪流远山", type: "video", description: "缓慢移动的自然镜头", params: { prompt: "清晨山间溪水缓缓流动，薄雾掠过远山，镜头平稳向前推进", mode: "text", ratio: "16:9" } },
      { id: "video-rain", title: "雨后街景", type: "video", description: "细雨与街道光影", params: { prompt: "雨后街道映着柔和灯光，行人撑伞缓缓走过，镜头轻轻移动", mode: "text", ratio: "9:16" } },
    ];
    return ok({ items: templates.filter((item) => !params.type || params.type === "all" || item.type === params.type) });
  },
  "GET /notifications": (params) => {
    const tasks = listMockNotifications();
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    return ok({
      items: tasks.slice((page - 1) * pageSize, page * pageSize).map((task) => ({
        task_id: task.taskId,
        task_type: task.type,
        work_id: null,
        title: task.payload.title || "创作任务",
        created_at: new Date(task.createdAt).toISOString(),
        is_read: Boolean(task.notificationRead),
      })),
      total: tasks.length,
      unread_count: tasks.filter((task) => !task.notificationRead).length,
      page,
      page_size: pageSize,
    });
  },
  "GET /profile": () => ok({ ...mockProfile }),
  "PUT /profile": (params) => {
    const username = typeof params.username === "string" ? params.username.trim() : "";
    if (!username || countPromptCharacters(username) > 64) return fail(ERROR_CODES.INVALID_PARAMS, "昵称须为 1 至 64 字");
    mockProfile = { ...mockProfile, username, avatar_asset_id: params.avatar_asset_id || null };
    return ok({ ...mockProfile });
  },
  "GET /drafts": (params) => {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.max(1, Number(params.page_size) || 10);
    const items = [...draftStore.values()].reverse();
    return ok({ items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, page_size: pageSize });
  },
  "POST /drafts": (params) => {
    const title = typeof params.title === "string" ? params.title.trim() : "";
    const taskTypes = ["image", "optimization", "video"];
    if (
      !taskTypes.includes(params.task_type) ||
      !title ||
      countPromptCharacters(title) > 50 ||
      !params.input_data ||
      typeof params.input_data !== "object" ||
      Array.isArray(params.input_data) ||
      !Object.keys(params.input_data).length
    ) {
      return fail(ERROR_CODES.INVALID_PARAMS, "草稿内容无效");
    }
    const id = `draft-${++draftSequence}`;
    const draft = { ...params, title, id, updated_at: new Date().toISOString() };
    draftStore.set(id, draft);
    return ok(draft);
  },
  [`POST ${API_PATHS.AUTH_REGISTER}`]: (params) => {
    if (!params?.username || !params?.account || !params?.password) {
      return fail(ERROR_CODES.INVALID_PARAMS, "缺少必要参数：username/account/password");
    }

    // 与真实契约一致：注册只返回用户资料，不签发令牌
    return ok({
      user_id: MOCK_LOGIN.user_id,
      username: params.username,
      account: params.account,
    });
  },
  [`POST ${API_PATHS.AUTH_LOGIN}`]: (params) => {
    if (!params?.account || !params?.password) {
      return fail(ERROR_CODES.INVALID_PARAMS, "缺少必要参数：account/password");
    }

    mockProfile = { user_id: MOCK_LOGIN.user_id, username: params.account, account: params.account, avatar_asset_id: null };
    // 本地 Mock 不校验口令，任意账号密码均可登录，便于离线开发
    return ok({
      ...MOCK_LOGIN,
      username: params.account,
      account: params.account,
    });
  },
  [`POST ${API_PATHS.AUTH_LOGOUT}`]: () => ok(null),
  "POST /auth/delete-account": (params) => params.password
    ? ok(null)
    : fail(ERROR_CODES.INVALID_PARAMS, "请输入密码"),
  [`GET ${API_PATHS.ACCOUNT_OVERVIEW}`]: () => ok(ACCOUNT_OVERVIEW),
  [`GET ${API_PATHS.POINTS_MY_INFO}`]: (params, scenario) => {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    const items = scenario === "empty" ? [] : POINTS_INFO.items;
    return ok({ ...POINTS_INFO, page, page_size: pageSize, total: items.length, items: items.slice((page - 1) * pageSize, page * pageSize) });
  },
  [`POST ${API_PATHS.PRICING_QUOTE}`]: (params) => {
    if (!isPricedTaskType(params?.task_type)) {
      return fail(ERROR_CODES.INVALID_PARAMS, "缺少必要参数：task_type");
    }

    if (params.duration !== undefined && (!Number.isInteger(params.duration) || params.duration < 5 || params.duration > 15)) {
      return fail(ERROR_CODES.INVALID_PARAMS, "视频时长须为 5 至 15 秒");
    }

    return ok(quoteCreation(params));
  },
  [`GET ${API_PATHS.HOME_OVERVIEW}`]: (_params, scenario) => {
    if (scenario === "empty") {
      return ok({ ...HOME_OVERVIEW, creations: [] });
    }

    return ok(HOME_OVERVIEW);
  },
  [`GET ${API_PATHS.WORKBENCH}`]: (_params, scenario) => {
    if (scenario === "empty") {
      return ok({ ...WORKBENCH_OVERVIEW, frames: [], drafts: [] });
    }

    return ok(WORKBENCH_OVERVIEW);
  },
  [`GET ${API_PATHS.LIBRARY}`]: (params, scenario) => {
    const page = Number(params.page) || PAGE_DEFAULTS.PAGE;
    const pageSize = Math.min(
      Number(params.page_size) || PAGE_DEFAULTS.PAGE_SIZE,
      PAGE_DEFAULTS.MAX_PAGE_SIZE
    );

    return ok(
      buildLibraryData({ ...params, page, page_size: pageSize }, scenario === "empty")
    );
  },
  [`GET ${API_PATHS.IMAGE_CREATION_OPTIONS}`]: () => ok(IMAGE_CREATION_OPTIONS),
  [`GET ${API_PATHS.IMAGE_STYLES}`]: () => ok(IMAGE_STYLE_OPTIONS),
  [`GET ${API_PATHS.IMAGE_CANVAS_OPTIONS}`]: () => ok(IMAGE_CANVAS_OPTIONS),
  [`POST ${API_PATHS.IMAGE_TASKS}`]: (params) =>
    createTaskResponse("image", params, ["prompt", "style"]),
  [`GET ${API_PATHS.IMAGE_OPTIMIZATION_OPTIONS}`]: () => ok(IMAGE_OPTIMIZATION_OPTIONS),
  [`POST ${API_PATHS.IMAGE_OPTIMIZATION_TASKS}`]: (params) =>
    createTaskResponse("optimization", params, ["image_path", "prompt"]),
  [`GET ${API_PATHS.VIDEO_CREATION_OPTIONS}`]: () => ok(VIDEO_CREATION_OPTIONS),
  [`GET ${API_PATHS.VIDEO_RENDER_OPTIONS}`]: () => ok(VIDEO_RENDER_OPTIONS),
  [`POST ${API_PATHS.VIDEO_TASKS}`]: (params) => {
    if (params.duration !== undefined && (!Number.isInteger(params.duration) || params.duration < 5 || params.duration > 15)) {
      return fail(ERROR_CODES.INVALID_PARAMS, "视频时长须为 5 至 15 秒");
    }
    if (params?.mode === "image") {
      return createTaskResponse("video", params, ["ratio", "image_path"]);
    }

    return createTaskResponse("video", params, ["ratio", "prompt"]);
  },
  [`POST ${API_PATHS.UPLOADS}`]: (params) => {
    if (!params?.file_path) {
      return fail(ERROR_CODES.INVALID_PARAMS, "缺少必要参数：file_path");
    }

    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    mockUploadedImages.set(uploadId, params.file_path);
    return ok({
      upload_id: uploadId,
      url: params.file_path,
      name: params.name || "已选图片",
    });
  },
};

const taskRoutes = [
  {
    method: "PUT",
    pattern: /^\/library\/works\/([^/]+)\/cover$/,
    handler: (workId, data) => {
      const work = getMockWorkMedia(workId);
      const coverUrl = data.cover_asset_id ? mockUploadedImages.get(data.cover_asset_id) : "";
      if (!work || work.type_name !== "视频创作" || (data.cover_asset_id && !coverUrl)) {
        return fail(ERROR_CODES.NOT_FOUND, "视频作品或封面不存在");
      }
      updateMockWork(workId, { cover_asset_id: data.cover_asset_id || null, cover_url: coverUrl || "" });
      return ok({ work_id: work.work_id, cover_asset_id: data.cover_asset_id || null, cover_url: coverUrl || "" });
    },
  },
  {
    method: "PUT",
    pattern: /^\/notifications\/([^/]+)\/read$/,
    handler: (taskId) => readMockNotification(taskId)
      ? ok({ task_id: taskId, is_read: true })
      : fail(ERROR_CODES.NOT_FOUND, "通知不存在"),
  },
  ...["GET", "PUT", "DELETE"].map((method) => ({
    method, pattern: /^\/drafts\/([^/]+)$/,
    handler: (id, data) => {
      const draft = draftStore.get(id);
      if (!draft) return fail(ERROR_CODES.NOT_FOUND, "草稿不存在或已提交");
      if (method === "GET") return ok(draft);
      if (method === "DELETE") { draftStore.delete(id); return ok({ id }); }
      const title = typeof data.title === "string" ? data.title.trim() : "";
      if (
        !title ||
        countPromptCharacters(title) > 50 ||
        draft.task_type !== data.task_type ||
        !data.input_data ||
        typeof data.input_data !== "object" ||
        Array.isArray(data.input_data) ||
        !Object.keys(data.input_data).length
      ) {
        return fail(ERROR_CODES.INVALID_PARAMS, "草稿内容无效");
      }
      const updated = { ...draft, ...data, title, updated_at: new Date().toISOString() };
      draftStore.set(id, updated);
      return ok(updated);
    },
  })),
  {
    method: "GET",
    pattern: /^\/library\/works\/([^/]+)\/media$/,
    handler: (workId) => {
      const work = getMockWorkMedia(workId);
      return work && work.media_url
        ? ok({ work_id: work.work_id, media_url: work.media_url, media_type: work.type_name === "视频创作" ? "video" : "image", cover_asset_id: work.cover_asset_id || null, cover_url: work.cover_url || "" })
        : fail(ERROR_CODES.NOT_FOUND, "作品媒体不存在");
    },
  },
  {
    method: "DELETE",
    pattern: /^\/library\/works\/([^/]+)$/,
    handler: (workId) =>
      deleteMockWork(workId) ? ok(null) : fail(ERROR_CODES.NOT_FOUND, "作品不存在或无法删除"),
  },
  {
    method: "PUT",
    pattern: /^\/library\/works\/([^/]+)$/,
    handler: (workId, params) => {
      const title = typeof params.title === "string" ? params.title.trim() : "";
      if (!title || countPromptCharacters(title) > 50) {
        return fail(ERROR_CODES.INVALID_PARAMS, "标题须为 1 至 50 字");
      }
      const work = updateMockWork(workId, { title });
      return work ? ok({ work_id: work.work_id, title: work.title }) : fail(ERROR_CODES.NOT_FOUND, "作品不存在");
    },
  },
  {
    method: "GET",
    pattern: /^\/tasks\/([^/]+)$/,
    handler: (taskId) => {
      const record = readMockTask(taskId);
      if (!record) return fail(ERROR_CODES.NOT_FOUND, "任务不存在或已过期");
      if (record.type === "image") return ok(buildImageTaskStatus(record));
      if (record.type === "optimization") return ok(buildOptimizationTaskStatus(record));
      if (record.type === "video") return ok(buildVideoTaskStatus(record));
      return fail(ERROR_CODES.NOT_FOUND, "任务不存在或已过期");
    },
  },
  {
    method: "POST",
    pattern: /^\/tasks\/([^/]+)\/cancel$/,
    handler: (taskId) => resolveTaskAction(taskId, "cancel"),
  },
  {
    method: "POST",
    pattern: /^\/tasks\/([^/]+)\/retry$/,
    handler: (taskId) => resolveTaskAction(taskId, "retry"),
  },
  {
    method: "GET",
    pattern: /^\/text-to-image\/tasks\/([^/]+)$/,
    handler: (taskId) => resolveTaskStatus(taskId, buildImageTaskStatus, "image"),
  },
  {
    method: "GET",
    pattern: /^\/image-optimization\/tasks\/([^/]+)$/,
    handler: (taskId) =>
      resolveTaskStatus(taskId, buildOptimizationTaskStatus, "optimization"),
  },
  {
    method: "GET",
    pattern: /^\/video\/tasks\/([^/]+)$/,
    handler: (taskId) => resolveTaskStatus(taskId, buildVideoTaskStatus, "video"),
  },
];

/**
 * 分发 Mock 请求。
 * @param {string} method 请求方法。
 * @param {string} url 接口路径。
 * @param {Object} params 请求参数。
 * @param {string} scenario Mock 场景。
 * @returns {Object} 接口响应。
 */
export const resolveMock = (method, url, params = {}, scenario = "normal") => {
  const routeKey = `${method} ${url}`;
  const exactHandler = exactRoutes[routeKey];

  if (exactHandler) {
    return exactHandler(params, scenario);
  }

  const dynamicRoute = taskRoutes.find(
    (route) => route.method === method && route.pattern.test(url)
  );

  if (dynamicRoute) {
    const matched = url.match(dynamicRoute.pattern);

    return dynamicRoute.handler(decodeURIComponent(matched[1]), params);
  }

  return fail(ERROR_CODES.NOT_FOUND, `未实现的 Mock 接口：${routeKey}`);
};
