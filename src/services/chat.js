/*
 * 功能变更记录
 * 2025-05-06 新建 chat.js - 流式对话接口封装 (SSE)
 * 2025-05-06 修复 SSE 解析问题，增加调试日志
 * 2025-05-06 适配服务器返回的实际 SSE 格式
 * 2025-05-06 修复真机运行时 Int8Array 错误
 */

import request, { getToken } from '@/utils/request.js'

// 流式对话接口封装，解析 Server-Sent Events (SSE)
export function streamChat({ isbn, messages, onMessage, onError, onComplete }) {
  console.log('发送聊天请求:', { isbn, messages: messages.length })
  
  // 标记是否开始处理过响应数据，用于确保完成回调只触发一次
  let hasStartedProcessing = false 
  
  try {
    // 使用安全的请求方式，避免 Int8Array 错误
    const task = uni.request({
      url: 'https://sealos.plumeintel.tech/api/chat/stream/',
      method: 'POST',
      data: JSON.stringify({ isbn, messages }), // 显式字符串化
      header: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',  // 指定接受 SSE 格式
        'Authorization': `Bearer ${getToken()}`
      },
      // 不使用 responseType，改为默认处理模式
      // responseType: 'text',  // 可能导致类型数组问题
      
      // 请求成功回调
      success: (res) => {
        console.log('请求成功:', res.statusCode)
        
        // 检查返回数据是否为空
        if (!res.data) {
          console.error('响应没有数据')
          onError && onError(new Error('响应没有数据'))
          return
        }
        
        try {
          // 直接处理标准响应格式
          if (typeof res.data === 'object' && !Array.isArray(res.data)) {
            // 非流式响应，直接返回对象
            console.log('收到标准JSON响应')
            onMessage && onMessage(res.data)
            onComplete && onComplete()
            return
          }
          
          // 如果是文本响应，尝试解析 SSE 格式
          const responseText = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
          console.log('响应预览:', responseText.substring(0, 100) + '...')
          
          if (responseText.includes('data:')) {
            // 按行分割处理 SSE
            const lines = responseText.split(/\r?\n/).filter(line => line.trim())
            console.log(`拆分为 ${lines.length} 行`)
            
            for (const line of lines) {
              const trimmedLine = line.trim()
              if (!trimmedLine) continue
              
              // 处理 [DONE] 标记
              if (trimmedLine === 'data: [DONE]') {
                console.log('检测到完成标记')
                hasStartedProcessing = true
                onComplete && onComplete()
                continue
              }
              
              // 解析 JSON 数据
              if (trimmedLine.startsWith('data:')) {
                try {
                  const jsonText = trimmedLine.substring(5).trim()
                  // 安全解析 JSON
                  const json = JSON.parse(jsonText)
                  hasStartedProcessing = true
                  onMessage && onMessage(json)
                } catch (e) {
                  console.warn('解析 JSON 失败:', trimmedLine)
                }
              }
            }
            
            // 处理完成所有行后，如果有处理过数据但没有明确结束标记，也调用完成函数
            if (hasStartedProcessing && !responseText.includes('data: [DONE]')) {
              console.log('响应解析完成，触发结束回调')
              onComplete && onComplete()
            }
          } else {
            // 非 SSE 格式，尝试作为普通 JSON 处理
            try {
              const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
              console.log('解析为普通响应')
              onMessage && onMessage(data)
              onComplete && onComplete()
            } catch (e) {
              console.error('解析响应失败')
              onError && onError(new Error('无法解析响应数据'))
            }
          }
        } catch (processError) {
          console.error('处理响应时出错:', processError)
          onError && onError(processError)
        }
      },
      // 请求失败回调
      fail: (err) => {
        console.error('请求失败:', err)
        onError && onError(err)
      }
    })
    
    // 返回请求任务引用，便于外部取消
    return task
  } catch (e) {
    console.error('创建请求时出错:', e)
    onError && onError(e)
    return null
  }
}
