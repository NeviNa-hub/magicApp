import request from "@/apis/http";

/**
 * 获取创作任务按 token 计算的积分报价。
 * @param {Object} data 报价参数：task_type、prompt、style。
 * @returns {Promise<Object>} 输入/输出 token 与预计积分。
 */
export const getCreationQuote = (data = {}) => {
    return request({
        url: "/pricing/quote",
        method: "POST",
        data,
        // 计价请求随输入实时触发，失败时保留上次价格，不弹全局错误提示
        silent: true,
    });
} 

  // 关于 silent 的说明：
// silent 通常是请求库（如 uni.request、axios 或项目封装的请求方法）中的一个可选配置项。
// 它的作用是控制是否静默处理错误提示：
// - silent: true  表示静默模式，请求失败时不自动弹出 toast 或 loading 等错误提示，
//                 由调用方自行处理错误逻辑。
// - silent: false 或不设置  表示非静默模式，请求失败时会自动显示统一的错误提示（如 "网络异常，请稍后重试"）。
//
// 常见使用场景：
// 1. 页面初始化时的加载请求：通常设置 silent: true，避免用户进入页面就看到错误弹框；
// 2. 用户主动触发的操作（如提交表单）：通常不设置或设为 false，让用户明确知道操作成功/失败；
// 3. 某些轮询或后台静默请求：必须设置 silent: true，避免频繁弹出提示干扰用户。
//
// 你可以在项目的请求封装层（通常是 src/utils/request.js 或 src/apis/request.js）中找到 silent 的具体实现。