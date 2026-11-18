<template>
  <app-bottom-sheet
    v-if="visible"
    title="优化提示词"
    placement="center"
    @close="closeDialog"
  >
    <text class="tip">可继续修改，确认后替换原提示词。</text>
    <textarea
      v-model="candidate"
      :maxlength="limit * 2"
      class="candidate"
      @input="candidate = normalizePromptInput($event.detail.value, limit)"
    />
    <text class="tip">{{ candidateCharacterCount }} / {{ limit }} 字</text>
    <template #footer>
      <view class="actions">
        <button @tap="closeDialog">取消</button>
        <button @tap="applyCandidate">使用提示词</button>
      </view>
    </template>
  </app-bottom-sheet>
</template>

<script setup>
import { computed, onUnmounted, ref } from "vue";

import { optimizePrompt } from "@/apis/prompts";
import { ERROR_CODES } from "@/apis/constants";
import AppBottomSheet from "@/components/AppBottomSheet/index.vue";
import { getErrorMessage, isApiError } from "@/utils/request";
import { countPromptCharacters, limitPromptCharacters } from "@/utils/prompt";

/**
 * @property {string} modelValue 当前提示词。
 * @property {string} taskType 创作类型。
 * @property {number} limit 页面提示词上限。
 */
const props = defineProps({
  modelValue: { type: String, default: "" },
  taskType: { type: String, required: true },
  limit: { type: Number, required: true },
});
const emit = defineEmits(["update:modelValue", "loading"]);
const visible = ref(false);
const candidate = ref("");
const candidateCharacterCount = computed(() =>
  countPromptCharacters(candidate.value),
);
let controller = null;
let version = 0;
let original = "";

// 请求候选文本；请求期间用户继续编辑时不覆盖输入。
const optimize = async () => {
  if (controller) return;
  const prompt = props.modelValue.trim();
  if (!prompt) {
    uni.showToast({ title: "请先填写提示词", icon: "none" });
    return;
  }
  original = props.modelValue;
  const current = ++version;
  controller = new AbortController();
  emit("loading", true);
  try {
    const data = await optimizePrompt(
      { task_type: props.taskType, prompt },
      { signal: controller.signal },
    );
    if (current !== version) return;
    if (props.modelValue !== original) {
      uni.showToast({ title: "提示词已修改，请重新优化", icon: "none" });
      return;
    }
    if (
      typeof data?.prompt !== "string" ||
      !data.prompt.trim() ||
      countPromptCharacters(data.prompt) > props.limit
    ) {
      throw new Error("优化结果无效或过长，请重试");
    }
    candidate.value = data.prompt;
    visible.value = true;
  } catch (error) {
    if (
      current === version &&
      error?.code !== ERROR_CODES.REQUEST_ABORTED &&
      !isApiError(error)
    ) {
      uni.showToast({
        title: getErrorMessage(error, "优化失败，请重试"),
        icon: "none",
      });
    }
  } finally {
    if (current === version) {
      controller = null;
      emit("loading", false);
    }
  }
};

// 不使用候选结果。
const closeDialog = () => {
  visible.value = false;
  candidate.value = "";
};

// 用户确认后才替换原提示词。
const applyCandidate = () => {
  const value = limitPromptCharacters(candidate.value.trim(), props.limit);
  if (!value) {
    uni.showToast({ title: `请输入 1 至 ${props.limit} 字`, icon: "none" });
    return;
  }
  if (props.modelValue !== original) {
    uni.showToast({ title: "原提示词已修改，请重新优化", icon: "none" });
    closeDialog();
    return;
  }
  emit("update:modelValue", value);
  closeDialog();
};

defineExpose({ optimize });
onUnmounted(() => {
  version += 1;
  controller?.abort();
});
</script>

<style scoped lang="scss">
.tip {
  display: block;
  margin: 12rpx 0;
  color: #6f8179;
  font-size: 24rpx;
}

.candidate {
  box-sizing: border-box;
  width: 100%;
  height: 260rpx;
  padding: 20rpx;
  border: 1rpx solid #d2ddd6;
  border-radius: 16rpx;
}

.actions {
  display: flex;
  width: 100%;
  gap: 16rpx;
}

.actions button {
  flex: 1;
  font-size: 26rpx;
}
</style>
