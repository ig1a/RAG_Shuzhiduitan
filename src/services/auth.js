/*
 * 功能变更记录
 * 2025-05-06 新建 auth.js - 微信登录封装，获取 JWT Token 并本地缓存
 * 2025-05-06 新增 mockLogin 函数，暂时跳过微信登录流程，用于开发测试
 */

import request, { setToken } from '@/utils/request.js'

// 微信登录：获取 code -> 换取 JWT
export async function login() {
  // 1. 获取小程序登录凭证 code
  const { code } = await new Promise((resolve, reject) => {
    uni.login({
      success: resolve,
      fail: reject
    })
  })

  // 2. 调用后端接口换取 token
  const data = await request({
    url: '/api/auth/login/wechat/',
    method: 'POST',
    data: { code }
  })

  // 3. 缓存 token
  setToken(data.token)
  return data
}

// 模拟登录，用于开发测试，跳过微信登录流程
export async function mockLogin() {
  console.log('使用模拟登录')
  // 模拟一个固定的 JWT token
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJuaWNrbmFtZSI6Iua4uOiLseeUqOaItyJ9.mock_token_for_development'
  
  // 缓存 token
  setToken(mockToken)
  
  // 返回模拟数据
  return {
    token: mockToken,
    expires_in: 7200,
    user: {
      id: 1,
      nickname: '测试用户',
      avatar_url: 'https://thirdwx.qlogo.cn/mmopen/vi_32/mock_avatar/132'
    }
  }
}
