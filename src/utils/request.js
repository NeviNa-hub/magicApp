const BASE_URL = "";

/**
 * 统一发起业务请求并返回响应数据。
 * @param {Object} config 请求配置。
 * @returns {Promise<Object>} 接口响应。
 */
export default function request(config) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${config.url}`,
      method: config.method?.toUpperCase() || "GET",
      data: config.params || config.data || {},
      success: (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data);
          return;
        }

        reject(new Error(response.data?.message || "请求失败"));
      },
      fail: (error) => reject(error),
    });
  });
}
