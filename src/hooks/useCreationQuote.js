import { onUnmounted, ref, watch } from "vue";

import { getCreationQuote } from "@/apis/pricing";

const DEFAULT_DEBOUNCE = 300; // 默认防抖时长，单位毫秒。

/**
 * 按提示词实时获取创作报价；输入变化后防抖请求，旧响应不会覆盖新结果。
 * @param {Object} options 报价参数。
 * @param {() => Object} options.getParams 返回 task_type、prompt、style 的取值方法。
 * @param {number} [options.delay] 防抖时长，默认 300 毫秒。
 * @returns {{ quote: import("vue").Ref<Object|null>, refreshQuote: Function }} 报价结果和刷新方法。
 */
const useCreationQuote = ({ getParams, delay = DEFAULT_DEBOUNCE }) => {
  const quote = ref(null);

  let timer = null;
  let requestSequence = 0;

  const fetchQuote = async (sequence) => {

    try {
      const data = await getCreationQuote(getParams());

      if (sequence === requestSequence) {
        quote.value = data;
      }
    } catch {
      // 报价失败时保持空状态，避免将旧参数的报价当成新报价。
    }
  };

  const scheduleQuote = () => {
    clearTimeout(timer);
    const sequence = ++requestSequence;
    quote.value = null;
    timer = setTimeout(() => fetchQuote(sequence), delay);
  };

  watch(getParams, scheduleQuote, { immediate: true });

  onUnmounted(() => {
    clearTimeout(timer);
    requestSequence += 1;
  });

  return { quote, refreshQuote: scheduleQuote };
};

export default useCreationQuote;
