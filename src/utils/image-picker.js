/**
 * 图片选择
 */

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 25000000;
const IMAGE_TYPES = ["jpeg", "jpg", "png", "webp"];

/**
 * 读取图片尺寸与格式。
 * @param {string} path 图片路径。
 * @returns {Promise<Object>} 图片信息。
 */
const readImageInfo = (path) => new Promise((resolve, reject) => {
  uni.getImageInfo({ src: path, success: resolve, fail: () => reject(new Error("无法读取图片，请重新选择")) });
});

/**
 * 获取压缩后文件大小。
 * @param {string} path 图片路径。
 * @returns {Promise<number>} 文件字节数。
 */
const readFileSize = (path) => new Promise((resolve, reject) => {
  if (typeof uni.getFileInfo !== "function") {
    reject(new Error("无法确认压缩后大小，请选择小于 5 MB 的图片"));
    return;
  }
  uni.getFileInfo({ filePath: path, success: (result) => resolve(Number(result.size)), fail: () => reject(new Error("无法确认图片大小，请重新选择")) });
});

/**
 * 校验图片并在允许时压缩超限 JPEG。
 * @param {Object} image 选择的图片。
 * @returns {Promise<Object>} 校验后的图片。
 */
const prepareImage = async (image) => {
  let info = await readImageInfo(image.path);
  let type = String(info.type || "").toLowerCase();
  if (!IMAGE_TYPES.includes(type)) throw new Error("仅支持 JPEG、PNG、WebP 图片");
  if (!info.width || !info.height || info.width * info.height > MAX_IMAGE_PIXELS) throw new Error("图片像素不能超过 2500 万");
  let size = Number(image.size);
  if (!Number.isFinite(size) || size <= 0) size = await readFileSize(image.path);
  if (!Number.isFinite(size) || size <= 0) throw new Error("无法确认图片大小，请重新选择");
  if (size <= MAX_IMAGE_BYTES) return image;
  if (!["jpg", "jpeg"].includes(type) || typeof uni.compressImage !== "function") throw new Error("图片不能超过 5 MB，请压缩后重新选择");
  const compressed = await new Promise((resolve, reject) => {
    uni.compressImage({ src: image.path, quality: 80, success: resolve, fail: () => reject(new Error("图片压缩失败，请压缩后重新选择")) });
  });
  if (!compressed.tempFilePath) throw new Error("图片压缩失败，请重新选择");
  size = await readFileSize(compressed.tempFilePath);
  if (!Number.isFinite(size) || size <= 0 || size > MAX_IMAGE_BYTES) throw new Error("压缩后图片仍超过 5 MB，请重新选择");
  info = await readImageInfo(compressed.tempFilePath);
  type = String(info.type || "").toLowerCase();
  if (!IMAGE_TYPES.includes(type) || !info.width || !info.height || info.width * info.height > MAX_IMAGE_PIXELS) throw new Error("压缩后的图片格式或尺寸不符合要求");
  return { ...image, path: compressed.tempFilePath, size };
};

/**
 * 选择单张图片并返回本地路径与文件名。
 * @param {Object} options 透传给 uni.chooseImage 的可选参数。
 * @returns {Promise<{path: string, name: string}>} 所选图片信息。
 */
export const chooseSingleImage = (options = {}) =>
  new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      ...options,
      success: async ({ tempFilePaths, tempFiles }) => {
        const path = tempFilePaths?.[0];
        const file = tempFiles?.[0];

        if (!path) {
          reject(new Error("未选择图片"));
          return;
        }

        try {
          const image = await prepareImage({
            path,
            name: file?.name || path.split("/").pop() || "已选图片",
            size: file?.size,
          });
          resolve(image);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => reject(error),
    });
  });

/**
 * 选择多张图片，逐张校验并保留每张的失败原因。
 * @param {number} count 最多选择的图片数量。
 * @returns {Promise<Array<Object>>} 校验结果。
 */
export const chooseImages = (count = 9) => {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType: ["original", "compressed"],
      sourceType: ["album"],
      success: async ({ tempFilePaths = [], tempFiles = [] }) => {
        const results = await Promise.all(tempFilePaths.map(async (path, index) => {
          const file = tempFiles[index];
          const image = { path, name: file?.name || path.split("/").pop() || "已选图片", size: file?.size };
          try {
            return { image: await prepareImage(image), error: "" };
          } catch (error) {
            return { image, error: error?.message || "图片校验失败" };
          }
        }));
        resolve(results);
      },
      fail: reject,
    });
  });
};
