/*
 * 功能变更记录
 * 2025-05-06 新建 book.js
 * - 获取书籍信息接口封装
 */

import request from '@/utils/request.js'

export async function getBook(isbn) {
  return await request({
    url: `/api/books/${isbn}/`,
    method: 'GET'
  })
}
