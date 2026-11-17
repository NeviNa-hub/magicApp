import request from "@/apis/http";

/** 创建编辑草稿。
 * @param {Object} data 草稿内容。
 * @returns {Promise<Object>} 草稿详情。
 */
export const createDraft = (data) => {
    return request({ 
        url: "/drafts", 
        method: "POST", 
        data 
    });
}

/** 查询草稿列表。
 * @param {Object} params 分页参数。
 * @returns {Promise<Object>} 草稿列表。
 */
export const getDrafts = (params = {}) => {
    return request({ url: "/drafts", method: "GET", params });
}

/** 获取草稿详情。
 * @param {string} id 草稿标识。
 * @returns {Promise<Object>} 草稿详情。
 */
export const getDraft = (id) => {
    return request({ url: `/drafts/${encodeURIComponent(id)}`, method: "GET" });
}   

/** 更新草稿。
 * @param {string} id 草稿标识。
 * @param {Object} data 草稿内容。
 * @returns {Promise<Object>} 草稿详情。
 */
export const updateDraft = (id, data) => {
    return request({ url: `/drafts/${encodeURIComponent(id)}`, method: "PUT", data });
}

/** 删除草稿。
 * @param {string} id 草稿标识。
 * @returns {Promise<Object>} 删除结果。
 */
export const deleteDraft = (id) => {
    return request({ url: `/drafts/${encodeURIComponent(id)}`, method: "DELETE" });
}

