/**
 * 意境文案拼接
 */

/**
 * 将灵感词追加到现有文案，已有内容时用逗号衔接。
 * @param {string} current 现有文案。
 * @param {string} value 待追加的灵感词。
 * @returns {string} 拼接后的文案。
 */
export const appendPromptText = (current, value) =>
  current ? `${current}，${value}` : value;

// 使用 Unicode 码点计数，与后端按字符限制的口径一致。
export const countPromptCharacters = (value = "") => {
  return Array.from(value).length;
};

// 按 Unicode 码点截断，避免把代理对拆开。
export const limitPromptCharacters = (value = "", limit) => {
  return Array.from(value).slice(0, limit).join("");
};

// 输入控件的 maxlength 在各端计数方式不同，统一在更新时截断。
export const normalizePromptInput = (value = "", limit) => {
  return limitPromptCharacters(value, limit);
};
