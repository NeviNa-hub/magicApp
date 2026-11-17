import { requestImageUpload } from "@/utils/image-upload-client";

/**
 * 上传图片。
 * @param {Object} data 上传参数，包含本地文件路径。
 * @param {Object} options 取消信号和进度回调。
 * @returns {Promise<Object>} 上传结果。
 */
export const uploadImage = (data = {}, options = {}) => {
  return requestImageUpload({
    ...options,
    url: "/uploads/images",
    method: "POST",
    data,
  });
};
