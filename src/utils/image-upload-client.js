import { USE_MOCK } from "@/apis/config";
import { ERROR_CODES } from "@/apis/constants";
import demoRequest from "@/apis/demo/client";
import { ApiError } from "@/utils/request";
import { uploadFile } from "@/utils/upload-file";

/**
 * 根据环境选择图片上传传输方式。
 * @param {Object} config 请求配置。
 * @returns {Promise<Object>} 上传结果。
 */
export const requestImageUpload = (config) => {
  if (!USE_MOCK) return uploadFile(config);

  return new Promise((resolve, reject) => {
    const signal = config.signal;
    let finished = false;

    const finish = (callback, value) => {
      if (finished) return;
      finished = true;
      signal?.removeEventListener("abort", abortUpload);
      callback(value);
    };

    const abortUpload = () => {
      finish(reject, new ApiError(ERROR_CODES.REQUEST_ABORTED, "上传已取消"));
    };

    if (signal?.aborted) {
      abortUpload();
      return;
    }
    signal?.addEventListener("abort", abortUpload, { once: true });
    demoRequest(config).then((result) => {
      if (!finished) config.onProgress?.(100);
      finish(resolve, result);
    }, (error) => finish(reject, error));
  });
};
