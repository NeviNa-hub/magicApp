/**
 * 下载作品并保存到当前设备。
 * @param {Object} media 媒体地址及类型。
 * @param {Object} options 下载取消信号、进度及阶段回调。
 * @returns {Promise<void>} 下载或保存完成。
 */
export const saveWorkMedia = async (media, options = {}) => {
  const { signal, onProgress, onSaving } = options;
  // #ifdef H5
  const response = await fetch(media.media_url, { signal });
  if (!response.ok) throw new Error("下载失败，链接可能已过期");
  let blob;
  const length = Number(response.headers.get("content-length"));
  if (response.body?.getReader) {
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      chunks.push(part.value);
      received += part.value.byteLength;
      if (length > 0) onProgress?.(Math.min(100, Math.round((received / length) * 100)));
    }
    blob = new Blob(chunks, { type: response.headers.get("content-type") || "" });
  } else {
    blob = await response.blob();
  }
  if (signal?.aborted) throw new Error("下载已取消");
  const suffix = media.media_type === "video" ? ".mp4" : blob.type === "image/png" ? ".png" : ".jpg";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `作品${suffix}`;
  try {
    link.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  // #endif
  // #ifndef H5
  const path = await new Promise((resolve, reject) => {
    let task = null;
    let finished = false;
    const finish = (callback, value) => {
      if (finished) return;
      finished = true;
      signal?.removeEventListener("abort", abortDownload);
      callback(value);
    };
    const abortDownload = () => {
      finish(reject, new Error("下载已取消"));
      task?.abort();
    };
    if (signal?.aborted) {
      abortDownload();
      return;
    }
    task = uni.downloadFile({
      url: media.media_url,
      success: (result) => result.statusCode === 200
        ? finish(resolve, result.tempFilePath)
        : finish(reject, new Error("下载失败，链接可能已过期")),
      fail: () => finish(reject, new Error("下载失败，请检查网络或存储空间")),
    });
    task?.onProgressUpdate?.((event) => {
      if (!finished && Number.isFinite(event.progress)) onProgress?.(event.progress);
    });
    if (!finished) {
      signal?.addEventListener("abort", abortDownload, { once: true });
      if (signal?.aborted) abortDownload();
    }
  });
  if (signal?.aborted) throw new Error("下载已取消");
  // 相册写入由系统控制，开始后不能可靠取消。
  onSaving?.();
  await new Promise((resolve, reject) => {
    const save = media.media_type === "video" ? uni.saveVideoToPhotosAlbum : uni.saveImageToPhotosAlbum;
    if (typeof save !== "function") {
      reject(new Error("当前平台不支持保存到相册"));
      return;
    }
    save({
      filePath: path,
      success: resolve,
      fail: (error) => {
        const failure = new Error("保存失败，请检查相册权限或存储空间");
        failure.platformError = error;
        reject(failure);
      },
    });
  });
  // #endif
};
