import { API_BASE_URL, REQUEST_TIMEOUT } from "@/apis/config";
import { ERROR_CODES } from "@/apis/constants";
import { clearSession } from "@/stores";
import { getToken } from "@/utils/auth";
import { ApiError } from "@/utils/request";

/**
 * 通过 multipart 上传本地图片并解析统一响应。
 * @param {Object} config 上传请求配置。
 * @returns {Promise<Object>} 上传结果。
 */
export const uploadFile = (config) =>
  new Promise((resolve, reject) => {
    const token = getToken();
    const signal = config.signal;
    let task = null;
    let finished = false;

    // 同一上传只结束一次，同时移除取消监听。
    const finish = (callback, value) => {
      if (finished) return;
      finished = true;
      signal?.removeEventListener("abort", abortUpload);
      callback(value);
    };

    // 主动取消不作为网络错误提示。
    const abortUpload = () => {
      task?.abort();
      finish(reject, new ApiError(ERROR_CODES.REQUEST_ABORTED, "上传已取消"));
    };

    if (signal?.aborted) {
      abortUpload();
      return;
    }

    task = uni.uploadFile({
      url: `${API_BASE_URL}${config.url}`,
      filePath: config.data.file_path,
      name: "file",
      header: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: REQUEST_TIMEOUT,
      success: (response) => {
        let body;
        try {
          body = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
        } catch {
          finish(reject, new ApiError(500, "上传响应格式不正确"));
          return;
        }
        if (response.statusCode < 200 || response.statusCode >= 300 || body?.code !== 200) {
          if ((body?.code === 401 || response.statusCode === 401) && token) {
            clearSession();
            uni.reLaunch({ url: "/pages/auth/index" });
          }
          finish(reject, new ApiError(body?.code || response.statusCode || 500, body?.message || "上传失败"));
          return;
        }
        finish(resolve, body.data);
      },
      fail: () => finish(reject, signal?.aborted
        ? new ApiError(ERROR_CODES.REQUEST_ABORTED, "上传已取消")
        : new ApiError(ERROR_CODES.NETWORK_ERROR, "图片上传失败，请检查网络后重试")),
    });
    task?.onProgressUpdate?.((event) => {
      if (!finished && Number.isFinite(event.progress)) config.onProgress?.(event.progress);
    });
    if (!finished) {
      signal?.addEventListener("abort", abortUpload, { once: true });
      if (signal?.aborted) abortUpload();
    }
  });
