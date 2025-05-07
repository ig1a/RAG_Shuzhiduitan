/*
 * 功能变更记录
 * 2025-05-06 新建 request.js - 统一封装后端请求，自动携带 JWT token
 * 2025-05-06 增强错误处理，避免类型数组相关问题
 */

// 后端基础 URL
const BASE_URL = 'https://sealos.plumeintel.tech'

// 读取本地存储的 token
export function getToken() {
  try {
    return uni.getStorageSync('token') || ''
  } catch (e) {
    return ''
  }
}

// 保存 token 到本地
export function setToken(token) {
  uni.setStorageSync('token', token)
}

// 通用请求封装
export default function request({ url, method = 'GET', data = {}, headers = {} }) {
  // 预处理数据，避免二进制数据问题
  const safeData = typeof data === 'object' && data !== null 
    ? JSON.stringify(data) // 对象转为字符串
    : data;
    
  return new Promise((resolve, reject) => {
    try {
      uni.request({
        url: BASE_URL + url,
        method,
        data: safeData, // 使用安全处理后的数据
        // 自动在 header 中加入 token
        header: {
          'Content-Type': 'application/json',
          'Authorization': getToken() ? `Bearer ${getToken()}` : '',
          ...headers
        },
        success: (res) => {
          try {
            const { statusCode, data } = res
            if (statusCode === 200) {
              resolve(data)
            } else {
              // 统一错误提示
              uni.showToast({ title: (data && data.message) || '接口错误', icon: 'none' })
              // 401 处理，清除 token
              if (statusCode === 401) setToken('')
              reject(data)
            }
          } catch (innerError) {
            console.error('处理响应时出错:', innerError)
            uni.showToast({ title: '数据处理错误', icon: 'none' })
            reject(innerError)
          }
        },
        fail: (err) => {
          uni.showToast({ title: '网络异常', icon: 'none' })
          reject(err)
        }
      })
    } catch (outerError) {
      console.error('创建请求时出错:', outerError)
      uni.showToast({ title: '请求创建失败', icon: 'none' })
      reject(outerError)
    }
  })
}
