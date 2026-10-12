<template>
  <generation-progress :data="progressData" />
</template>

<script setup>
import { computed, onMounted, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import { getImageGenerationStatus } from "@/apis/textToImage";
import GenerationProgress from "@/components/GenerationProgress/index.vue";

const task = reactive({ mode: "creation", taskId: "", progress: 68 });

const progressData = computed(() => {
  const isOptimization = task.mode === "optimization";

  return {
    title: isOptimization ? "图片优化" : "画卷生成中",
    stage: isOptimization ? "高清图像·重绘中" : "立轴画心·析出中",
    type: isOptimization ? "无损超清" : "天工化育",
    progress: task.progress,
    progress_label: "气韵流转",
    status: isOptimization ? "第二阶段·细节重塑" : "第二阶段·丹青晕染",
    work_name: isOptimization ? "图片优化任务" : "《宋式水墨远山图》",
    detail: isOptimization ? "云端蒸馏·高清重绘" : "天宝妙染·竖屏卷",
    tags: isOptimization
      ? ["无损超清", "4K重绘", "高清写意"]
      : ["宋式水墨", "1:1方画心", "高清写意"],
    cost: isOptimization ? 3 : 10,
    description: isOptimization
      ? "云端蒸馏级处理，完成后自动保存至作品库"
      : "研墨调色，点染山石梧桐与溪桥花茂",
    estimated_time: "约需 8 秒",
    tip: "已投入云端渲染池，离开页面不影响任务进度",
  };
});

/**
 * 读取任务类型并加载进度。
 * @param {{mode?: string, task_id?: string}} query 页面查询参数。
 * @returns {void}
 */
onLoad((query) => {
  task.mode = query.mode === "optimization" ? "optimization" : "creation";
  task.taskId = query.task_id || "";
});

onMounted(async () => {
  const response = await getImageGenerationStatus({ task_id: task.taskId });
  if (response.code === 0) {
    task.progress = response.data.progress;
  }
});
</script>
