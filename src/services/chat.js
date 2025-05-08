/*
 * 功能变更记录
 * 2025-05-06 新建 chat.js - 流式对话接口封装 (SSE)
 * 2025-05-06 修复 SSE 解析问题，增加调试日志
 * 2025-05-06 适配服务器返回的实际 SSE 格式
 * 2025-05-06 修复真机运行时 Int8Array 错误
 * 2025-05-08 重构流式传输实现，使用 enableChunked 和 onChunkReceived 实现真正的流式效果
 */

import request, { getToken } from '@/utils/request.js'

// 流式对话接口封装，解析 Server-Sent Events (SSE)
export function streamChat({ isbn, messages, onMessage, onError, onComplete }) {
  console.log('发送聊天请求:', { isbn, messages: messages.length })
  
  // 标记是否接收到完成标志或发生错误
  let isDone = false
  
  try {
    // 使用分块传输模式，实现真正的流式数据接收
    const task = uni.request({
      url: 'https://sealos.plumeintel.tech/api/chat/stream/',
      method: 'POST',
      data: JSON.stringify({ isbn, messages }), // 显式字符串化
      header: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',  // 指定接受 SSE 格式
        'Authorization': `Bearer ${getToken()}`
      },
      // 启用分块传输编码，允许实时接收数据块
      enableChunked: true, // 关键参数：启用分块传输
      
      // 请求成功回调 - 当完整请求结束时调用
      success: (res) => {
        console.log('请求完成:', res.statusCode)
        // 如果没有通过 onChunkReceived 触发结束，在这里保证调用结束回调
        if (!isDone) {
          console.log('请求正常结束，触发完成回调')
          isDone = true
          onComplete && onComplete()
        }
      },
      // 请求失败回调
      fail: (err) => {
        console.error('请求失败:', err)
        isDone = true
        onError && onError(err)
      }
    })
    
    // 监听并处理每个到达的数据块
    task.onChunkReceived((chunk) => {
      try {
        // 将二进制数据转换为文本
        let text = '';
        
        // 处理不同类型的数据
        if (chunk.data instanceof ArrayBuffer) {
          // 将 ArrayBuffer 转换为 Uint8Array
          const uint8Array = new Uint8Array(chunk.data);
          // 转换为字符串 - 使用更安全的解码方式
          text = decodeURIComponent(escape(String.fromCharCode.apply(null, uint8Array)));
        } else if (typeof chunk.data === 'string') {
          // 如果已经是字符串则直接使用
          text = chunk.data;
        } else {
          // 其他类型尝试转为字符串
          text = String(chunk.data);
        }
        
        console.log('收到数据块:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
        
        // 处理 SSE 格式数据（data: 开头的行）
        if (text.includes('data:')) {
          // 按行分割处理
          const lines = text.split(/\r?\n/).filter(line => line.trim());
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            // 处理完成标记
            if (trimmedLine === 'data: [DONE]') {
              console.log('收到完成标记');
              isDone = true;
              onComplete && onComplete();
              continue;
            }
            
            // 处理数据行
            if (trimmedLine.startsWith('data:')) {
              try {
                const jsonText = trimmedLine.substring(5).trim();
                // 解析 JSON 数据
                const json = JSON.parse(jsonText);
                // 立即传递给回调处理
                onMessage && onMessage(json);
              } catch (e) {
                console.warn('解析 JSON 失败:', trimmedLine, e);
              }
            }
          }
        } else {
          // 尝试解析为 JSON（非 SSE 格式）
          try {
            const json = JSON.parse(text);
            onMessage && onMessage(json);
          } catch (e) {
            // 不是有效的 JSON，可能是部分数据
            console.warn('接收到非 JSON 格式数据块:', text);
          }
        }
      } catch (e) {
        console.error('处理数据块时出错:', e);
      }
    });
    
    // 返回请求任务引用，便于外部取消
    return task;
  } catch (e) {
    console.error('创建请求时出错:', e);
    onError && onError(e);
    return null;
  }
}
