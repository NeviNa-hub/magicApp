/**
 * 下载作品并保存到当前设备。
 * @param {Object} media 包含媒体地址及类型。
 * @returns {Promise<void>} 保存完成。
 */
export const saveWorkMedia = async (media) => {
  // #ifdef H5
  const response = await fetch(media.media_url);
  if (!response.ok) throw new Error("下载失败，链接可能已过期");
  const blob = await response.blob();
  const suffix = media.media_type === "video" ? ".mp4" : blob.type === "image/png" ? ".png" : ".jpg";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `作品${suffix}`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  // #endif
  // #ifndef H5
  const path = await new Promise((resolve, reject) => {
    uni.downloadFile({
      url: media.media_url,
      success: (result) => result.statusCode === 200
        ? resolve(result.tempFilePath)
        : reject(new Error("下载失败，链接可能已过期")),
      fail: reject,
    });
  });
  await new Promise((resolve, reject) => {
    const save = media.media_type === "video" ? uni.saveVideoToPhotosAlbum : uni.saveImageToPhotosAlbum;
    save({ filePath: path, success: resolve, fail: reject });
  });
  // #endif
};
