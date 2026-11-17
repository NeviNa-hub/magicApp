import { onUnmounted, ref } from "vue";

import { uploadImage } from "@/apis/upload";
import { ERROR_CODES } from "@/apis/constants";
import { chooseSingleImage } from "@/utils/image-picker";
import { getErrorMessage } from "@/utils/request";

/**
 * 管理单张图片的选择、上传、取消和重试。
 * @param {Function} onUploaded 上传成功后的回调。
 * @returns {Object} 上传状态和操作方法。
 */
const useImageUpload = (onUploaded) => {
  const isUploading = ref(false);
  const uploadProgress = ref(null);
  const canRetryUpload = ref(false);
  let pendingImage = null;
  let controller = null;
  let generation = 0;

  // 取消上传并使旧响应失效。
  const cancelUpload = () => {
    generation += 1;
    controller?.abort();
    controller = null;
    isUploading.value = false;
    canRetryUpload.value = Boolean(pendingImage);
  };

  // 清空上次选择和重试状态。
  const resetUpload = () => {
    cancelUpload();
    pendingImage = null;
    canRetryUpload.value = false;
    uploadProgress.value = null;
  };

  // 上传已选择的图片；失败后保留图片供重试。
  const retryUpload = async () => {
    if (!pendingImage || isUploading.value) return;
    const current = ++generation;
    controller = new AbortController();
    isUploading.value = true;
    canRetryUpload.value = false;
    uploadProgress.value = null;
    try {
      const image = pendingImage;
      const result = await uploadImage({ file_path: image.path, name: image.name }, {
        signal: controller.signal,
        onProgress: (progress) => {
          if (current === generation) uploadProgress.value = progress;
        },
      });
      if (current !== generation) return;
      if (!result?.upload_id) throw new Error("上传结果无效");
      pendingImage = null;
      onUploaded({ ...image, uploadId: result.upload_id });
    } catch (error) {
      if (current !== generation) return;
      canRetryUpload.value = Boolean(pendingImage);
      if (error?.code !== ERROR_CODES.REQUEST_ABORTED) {
        uni.showToast({ title: getErrorMessage(error, "上传失败，请重试"), icon: "none" });
      }
    } finally {
      if (current === generation) {
        controller = null;
        isUploading.value = false;
      }
    }
  };

  // 选择并校验图片后开始上传。
  const chooseImage = async () => {
    if (isUploading.value) return;
    isUploading.value = true;
    const current = ++generation;
    try {
      const image = await chooseSingleImage();
      if (current !== generation) return;
      pendingImage = image;
      isUploading.value = false;
      await retryUpload();
    } catch (error) {
      if (current === generation && !String(error?.errMsg || "").includes("cancel")) {
        uni.showToast({ title: getErrorMessage(error, "选择图片失败"), icon: "none" });
      }
    } finally {
      if (current === generation) isUploading.value = false;
    }
  };

  onUnmounted(cancelUpload);
  return { isUploading, uploadProgress, canRetryUpload, chooseImage, retryUpload, cancelUpload, resetUpload };
};

export default useImageUpload;
