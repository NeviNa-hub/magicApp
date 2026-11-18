import request from "@/apis/http";

/**
 * 获取创作台数据。
 * @param {Object} params 查询参数。
 * @returns {Promise<Object>} 创作台数据。
 */
export const getWorkbenchData = (params) => {
  return request({
    url: "/workbench",
    method: "GET",
    params: { ...params },
  });
};

/**
 * 获取作品库列表。
 * @param {Object} params 查询参数。
 * @returns {Promise<Object>} 作品库数据。
 */
export const getLibraryData = (params = {}) => {
  return request({
    url: "/library",
    method: "GET",
    params: { ...params },
  });
};

/**
 * 删除本人作品。
 * @param {Object} params 删除参数，包含 workId。
 * @returns {Promise<Object>} 删除结果。
 */
export const deleteLibraryWork = (params = {}) => {
  return request({
    url: `/library/works/${encodeURIComponent(params.workId)}`,
    method: "DELETE",
    params: { ...params },
  });
};

/**
 * 修改作品标题。
 * @param {Object} params 包含作品标识。
 * @param {Object} data 包含新标题。
 * @returns {Promise<Object>} 更新结果。
 */
export const updateLibraryWorkTitle = (params = {}, data = {}) => {
  return request({
    url: `/library/works/${encodeURIComponent(params.workId)}`,
    method: "PUT",
    data,
  });
};

/**
 * 设置视频作品封面。
 * @param {Object} params 包含作品标识。
 * @param {Object} data 包含封面资源标识。
 * @returns {Promise<Object>} 更新结果。
 */
export const updateLibraryWorkCover = (params = {}, data = {}) => {
  return request({
    url: `/library/works/${encodeURIComponent(params.workId)}/cover`,
    method: "PUT",
    data,
  });
};


/**
 * 获取本人作品的媒体地址。
 * @param {Object} params 作品标识。
 * @param {Object} opt 请求选项。
 * @returns {Promise<Object>} 媒体信息。
 */
export const getLibraryWorkMedia = (params = {}, opt = {}) => {
  return request({
    ...opt,
    url: `/library/works/${encodeURIComponent(params.workId)}/media`,
    method: "GET",
    params: { ...params },
  });
};
