import { createDraft, updateDraft } from "@/apis/drafts";

/**
 * 创作草稿存储
 */

export const DRAFT_KEYS = {
  image: "imageCreationDraft",
  video: "videoCreationDraft",
};

/**
 * 读取指定创作草稿。
 * @param {string} key 草稿键名。
 * @returns {Object|null} 草稿内容，不存在时返回 null。
 */
export const readCreationDraft = (key) => uni.getStorageSync(key) || null;

/**
 * 保存指定创作草稿。
 * @param {string} key 草稿键名。
 * @param {Object} data 草稿内容。
 * @returns {void}
 */
export const saveCreationDraft = (key, data) => {
  uni.setStorageSync(key, data);
};

/**
 * 保存恢复中的草稿信息。
 * @param {Object} draft 草稿详情。
 * @returns {void}
 */
export const setEditingDraft = (draft) => uni.setStorageSync("editing_draft", draft);

/**
 * 恢复草稿参数并打开对应创作表单。
 * @param {Object} draft 服务端返回的草稿详情。
 * @param {Object} [options] 导航选项。
 * @param {boolean} [options.replaceCurrent] 从草稿详情进入时替换当前页。
 * @returns {Promise<void>} 页面跳转完成。
 */
export const openDraftEditor = async (draft, { replaceCurrent = false } = {}) => {
  const paths = {
    image: "/pages/image-style/index",
    optimization: "/pages/image-optimization/index",
    video: "/pages/video-creation/index",
  };
  if (!draft?.id || !Object.hasOwn(paths, draft.task_type) || !draft.input_data) {
    throw new Error("草稿内容不可用");
  }

  setEditingDraft(draft);
  const key = DRAFT_KEYS[draft.task_type];
  if (key) saveCreationDraft(key, draft.input_data);
  const url = paths[draft.task_type];
  if (replaceCurrent) {
    await uni.redirectTo({ url });
  } else {
    await uni.navigateTo({ url });
  }
};

// 读取当前编辑草稿。
export const getEditingDraft = () => uni.getStorageSync("editing_draft") || null;

// 清除当前编辑草稿。
export const clearEditingDraft = () => uni.removeStorageSync("editing_draft");

/**
 * 创建或更新当前类型的手动草稿。
 * @param {string} type 创作类型。
 * @param {Object} data 当前参数。
 * @returns {Promise<Object>} 保存后的草稿。
 */
export const persistEditingDraft = async (type, data) => {
  const current = getEditingDraft();
  const payload = { task_type: type, title: current?.task_type === type ? current.title : (data.prompt?.trim().slice(0, 30) || "未命名草稿"), input_data: data };
  const result = current?.task_type === type ? await updateDraft({ draftId: current.id }, payload) : await createDraft(payload);
  setEditingDraft(result);
  return result;
};
