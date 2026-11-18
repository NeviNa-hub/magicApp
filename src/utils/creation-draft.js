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
