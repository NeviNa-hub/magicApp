<template>
  <task-detail :task-id="taskId" :type="type" :title="workTitle" />
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import TaskDetail from "@/components/TaskDetail/index.vue";

// uni-app 会把路由查询参数透传到页面根组件，屏蔽后避免覆盖详情组件的同名 title 属性
defineOptions({ inheritAttrs: false });

const taskId = ref("");
const type = ref("image");
const workTitle = ref("");

/**
 * 读取创作流程传入的任务标识，图片优化复用同一详情组件。
 * @param {{mode?: string, taskId?: string, title?: string}} query 页面查询参数。
 * @returns {void}
 */
onLoad((query) => {
  taskId.value = query.taskId || "";
  type.value = query.mode === "optimization" ? "optimization" : "image";
  workTitle.value = query.title || "";
});
</script>
