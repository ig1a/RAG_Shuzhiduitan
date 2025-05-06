# 书智对谈 API 接口文档

**文件修改记录**：
- 初始API文档创建，包含书籍信息查询和智能对话功能

## 目录

- [1. 简介](#1-简介)
- [2. 通用约定](#2-通用约定)
- [3. 认证方式](#3-认证方式)
- [4. API 接口](#4-api-接口)
  - [4.1 书籍识别](#41-书籍识别)
  - [4.2 智能对话](#42-智能对话)
- [5. 数据模型](#5-数据模型)
- [6. 错误码](#6-错误码)

## 1. 简介

本文档详细描述了"书智对谈"微信小程序的后端API接口，供前端开发人员和后端开发人员参考。API基于RESTful设计原则，使用Django框架实现。

## 2. 通用约定

- 所有API请求均使用HTTPS协议
- 请求和响应数据均使用JSON格式
- API的基础URL为: `https://api.example.com/v1`（实际地址需替换）
- 所有时间格式采用ISO 8601标准: `YYYY-MM-DDTHH:MM:SSZ`
- 分页参数统一使用: `page`（页码，从1开始）和`page_size`（每页条目数）

## 3. 认证方式

API使用微信小程序登录态作为认证方式：

1. 前端通过微信登录API获取登录凭证（code）
2. 前端将code传给后端
3. 后端调用微信接口获取openid和session_key
4. 后端生成自定义登录态token返回给前端
5. 前端后续请求通过HTTP头部中的Authorization字段携带token

**请求示例：**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuaWQiOiJvUE...
```

## 4. API 接口

### 4.1 书籍识别

#### 4.1.1 通过ISBN获取书籍信息

**接口描述：** 根据ISBN码获取书籍详细信息，包括书名、作者、出版社、封面和简介等

**请求方法：** GET

**请求URL：** `/books/isbn/{isbn}`

**路径参数：**

| 参数名 | 类型   | 是否必须 | 描述       |
| ------ | ------ | -------- | ---------- |
| isbn   | string | 是       | 书籍ISBN码 |

**响应参数：**

| 参数名       | 类型   | 描述         |
| ------------ | ------ | ------------ |
| isbn         | string | 书籍ISBN码   |
| title        | string | 书籍标题     |
| author       | string | 作者         |
| publisher    | string | 出版社       |
| publish_date | string | 出版日期     |
| cover_url    | string | 封面图片URL  |
| introduction | string | 书籍简介     |
| tags         | array  | 标签列表     |
| price        | string | 价格         |
| success      | boolean | 请求是否成功 |
| error_code   | integer | 错误码，成功时为0 |
| error_msg    | string  | 错误信息，成功时为空 |

**响应示例：**

```json
{
  "isbn": "9787115546081",
  "title": "JavaScript高级编程（第4版）",
  "author": "马特·弗里斯比",
  "publisher": "人民邮电出版社",
  "publish_date": "2020-04-01",
  "cover_url": "https://img3.doubanio.com/view/subject/s/public/s33561554.jpg",
  "introduction": "《JavaScript高级程序设计》是JavaScript经典图书，新版涵盖ECMAScript 2019，全面介绍JavaScript基础与最佳实践。",
  "tags": ["编程", "JavaScript", "前端开发"],
  "price": "129.00",
  "success": true,
  "error_code": 0,
  "error_msg": ""
}
```

**错误响应示例：**

```json
{
  "success": false,
  "error_code": 1001,
  "error_msg": "无效的ISBN码"
}
```

#### 4.1.2 通过书名搜索书籍

**接口描述：** 根据书名关键词搜索相关书籍

**请求方法：** GET

**请求URL：** `/books/search`

**查询参数：**

| 参数名    | 类型   | 是否必须 | 描述                 |
| --------- | ------ | -------- | -------------------- |
| keyword   | string | 是       | 搜索关键词           |
| page      | integer | 否       | 页码，默认为1        |
| page_size | integer | 否       | 每页条目数，默认为10 |

**响应参数：**

| 参数名       | 类型    | 描述               |
| ------------ | ------- | ------------------ |
| total        | integer | 总条目数           |
| total_pages  | integer | 总页数             |
| current_page | integer | 当前页码           |
| books        | array   | 书籍列表           |
| success      | boolean | 请求是否成功       |
| error_code   | integer | 错误码，成功时为0  |
| error_msg    | string  | 错误信息，成功时为空 |

**books数组中每个元素的结构：**

| 参数名       | 类型   | 描述         |
| ------------ | ------ | ------------ |
| isbn         | string | 书籍ISBN码   |
| title        | string | 书籍标题     |
| author       | string | 作者         |
| publisher    | string | 出版社       |
| cover_url    | string | 封面图片URL  |
| introduction | string | 书籍简介(摘要) |

**响应示例：**

```json
{
  "total": 25,
  "total_pages": 3,
  "current_page": 1,
  "books": [
    {
      "isbn": "9787115546081",
      "title": "JavaScript高级编程（第4版）",
      "author": "马特·弗里斯比",
      "publisher": "人民邮电出版社",
      "cover_url": "https://img3.doubanio.com/view/subject/s/public/s33561554.jpg",
      "introduction": "《JavaScript高级程序设计》是JavaScript经典图书，新版涵盖ECMAScript 2019..."
    },
    // 更多书籍...
  ],
  "success": true,
  "error_code": 0,
  "error_msg": ""
}
```

### 4.2 智能对话

#### 4.2.1 开始与书籍对话

**接口描述：** 初始化与指定书籍的对话，返回AI的开场白

**请求方法：** POST

**请求URL：** `/chat/start`

**请求参数：**

| 参数名 | 类型   | 是否必须 | 描述       |
| ------ | ------ | -------- | ---------- |
| isbn   | string | 是       | 书籍ISBN码 |

**响应参数：**

| 参数名       | 类型    | 描述              |
| ------------ | ------- | ----------------- |
| chat_id      | string  | 对话会话ID        |
| book_info    | object  | 书籍基本信息      |
| message      | string  | AI的开场白        |
| success      | boolean | 请求是否成功      |
| error_code   | integer | 错误码，成功时为0 |
| error_msg    | string  | 错误信息，成功时为空 |

**book_info对象结构：**

| 参数名       | 类型   | 描述         |
| ------------ | ------ | ------------ |
| isbn         | string | 书籍ISBN码   |
| title        | string | 书籍标题     |
| author       | string | 作者         |
| publisher    | string | 出版社       |
| cover_url    | string | 封面图片URL  |

**响应示例：**

```json
{
  "chat_id": "c123456789",
  "book_info": {
    "isbn": "9787115546081",
    "title": "JavaScript高级编程（第4版）",
    "author": "马特·弗里斯比",
    "publisher": "人民邮电出版社",
    "cover_url": "https://img3.doubanio.com/view/subject/s/public/s33561554.jpg"
  },
  "message": "你好，我是《JavaScript高级编程（第4版）》的智能助手，请问有什么可以帮助你的吗？",
  "success": true,
  "error_code": 0,
  "error_msg": ""
}
```

#### 4.2.2 发送消息

**接口描述：** 向AI发送消息，获取AI响应

**请求方法：** POST

**请求URL：** `/chat/message`

**请求参数：**

| 参数名   | 类型   | 是否必须 | 描述           |
| -------- | ------ | -------- | -------------- |
| chat_id  | string | 是       | 对话会话ID     |
| message  | string | 是       | 用户发送的消息 |

**响应参数：**

| 参数名       | 类型    | 描述               |
| ------------ | ------- | ------------------ |
| message_id   | string  | 消息ID             |
| content      | string  | AI回复的消息内容   |
| created_at   | string  | 消息创建时间       |
| success      | boolean | 请求是否成功       |
| error_code   | integer | 错误码，成功时为0  |
| error_msg    | string  | 错误信息，成功时为空 |

**响应示例：**

```json
{
  "message_id": "m987654321",
  "content": "在JavaScript中，变量声明有三种方式：var、let和const。其中，let和const是ES6新增的块级作用域声明方式，解决了var的一些问题，例如变量提升和全局作用域污染。let声明的变量值可以修改，而const声明的是常量，其值不可重新赋值。",
  "created_at": "2025-05-04T12:42:15Z",
  "success": true,
  "error_code": 0,
  "error_msg": ""
}
```

#### 4.2.3 获取对话历史

**接口描述：** 获取与指定书籍的对话历史记录

**请求方法：** GET

**请求URL：** `/chat/history/{chat_id}`

**路径参数：**

| 参数名  | 类型   | 是否必须 | 描述       |
| ------- | ------ | -------- | ---------- |
| chat_id | string | 是       | 对话会话ID |

**查询参数：**

| 参数名    | 类型   | 是否必须 | 描述                 |
| --------- | ------ | -------- | -------------------- |
| page      | integer | 否       | 页码，默认为1        |
| page_size | integer | 否       | 每页条目数，默认为20 |

**响应参数：**

| 参数名       | 类型    | 描述               |
| ------------ | ------- | ------------------ |
| chat_id      | string  | 对话会话ID         |
| book_info    | object  | 书籍基本信息       |
| messages     | array   | 消息记录列表       |
| total        | integer | 消息总数           |
| total_pages  | integer | 总页数             |
| current_page | integer | 当前页码           |
| success      | boolean | 请求是否成功       |
| error_code   | integer | 错误码，成功时为0  |
| error_msg    | string  | 错误信息，成功时为空 |

**book_info对象结构：**

| 参数名       | 类型   | 描述         |
| ------------ | ------ | ------------ |
| isbn         | string | 书籍ISBN码   |
| title        | string | 书籍标题     |
| author       | string | 作者         |
| publisher    | string | 出版社       |
| cover_url    | string | 封面图片URL  |

**messages数组中每个元素的结构：**

| 参数名     | 类型   | 描述         |
| ---------- | ------ | ------------ |
| message_id | string | 消息ID       |
| sender     | string | 发送者类型：'user'或'bot' |
| content    | string | 消息内容     |
| created_at | string | 消息创建时间 |

**响应示例：**

```json
{
  "chat_id": "c123456789",
  "book_info": {
    "isbn": "9787115546081",
    "title": "JavaScript高级编程（第4版）",
    "author": "马特·弗里斯比",
    "publisher": "人民邮电出版社",
    "cover_url": "https://img3.doubanio.com/view/subject/s/public/s33561554.jpg"
  },
  "messages": [
    {
      "message_id": "m123456781",
      "sender": "bot",
      "content": "你好，我是《JavaScript高级编程（第4版）》的智能助手，请问有什么可以帮助你的吗？",
      "created_at": "2025-05-04T12:40:10Z"
    },
    {
      "message_id": "m123456782",
      "sender": "user",
      "content": "JavaScript中var、let和const有什么区别？",
      "created_at": "2025-05-04T12:41:05Z"
    },
    {
      "message_id": "m123456783",
      "sender": "bot",
      "content": "在JavaScript中，变量声明有三种方式：var、let和const。其中，let和const是ES6新增的块级作用域声明方式，解决了var的一些问题，例如变量提升和全局作用域污染。let声明的变量值可以修改，而const声明的是常量，其值不可重新赋值。",
      "created_at": "2025-05-04T12:41:15Z"
    }
  ],
  "total": 3,
  "total_pages": 1,
  "current_page": 1,
  "success": true,
  "error_code": 0,
  "error_msg": ""
}
```

#### 4.2.4 结束对话

**接口描述：** 结束与指定书籍的对话会话

**请求方法：** POST

**请求URL：** `/chat/end`

**请求参数：**

| 参数名  | 类型   | 是否必须 | 描述       |
| ------- | ------ | -------- | ---------- |
| chat_id | string | 是       | 对话会话ID |

**响应参数：**

| 参数名     | 类型    | 描述               |
| ---------- | ------- | ------------------ |
| success    | boolean | 请求是否成功       |
| error_code | integer | 错误码，成功时为0  |
| error_msg  | string  | 错误信息，成功时为空 |

**响应示例：**

```json
{
  "success": true,
  "error_code": 0,
  "error_msg": ""
}
```

## 5. 数据模型

以下是API相关的主要数据模型设计：

### 5.1 Book（书籍）

| 字段名       | 类型        | 描述         |
| ------------ | ----------- | ------------ |
| isbn         | CharField   | 书籍ISBN码，主键 |
| title        | CharField   | 书籍标题     |
| author       | CharField   | 作者         |
| publisher    | CharField   | 出版社       |
| publish_date | DateField   | 出版日期     |
| cover_url    | URLField    | 封面图片URL  |
| introduction | TextField   | 书籍简介     |
| tags         | ManyToMany  | 标签列表     |
| price        | DecimalField| 价格         |
| created_at   | DateTimeField | 创建时间   |
| updated_at   | DateTimeField | 更新时间   |

### 5.2 ChatSession（对话会话）

| 字段名     | 类型          | 描述       |
| ---------- | ------------- | ---------- |
| id         | UUIDField     | 会话ID，主键 |
| user       | ForeignKey    | 用户引用   |
| book       | ForeignKey    | 书籍引用   |
| is_active  | BooleanField  | 是否活跃   |
| created_at | DateTimeField | 创建时间   |
| updated_at | DateTimeField | 更新时间   |

### 5.3 Message（消息）

| 字段名      | 类型          | 描述       |
| ----------- | ------------- | ---------- |
| id          | UUIDField     | 消息ID，主键 |
| chat_session| ForeignKey    | 会话引用   |
| sender_type | CharField     | 发送者类型：'user'或'bot' |
| content     | TextField     | 消息内容   |
| created_at  | DateTimeField | 创建时间   |

## 6. 错误码

| 错误码 | 描述           | HTTP状态码 |
| ------ | -------------- | ---------- |
| 0      | 成功           | 200        |
| 1000   | 系统内部错误   | 500        |
| 1001   | 参数错误       | 400        |
| 1002   | 资源不存在     | 404        |
| 1003   | 认证失败       | 401        |
| 1004   | 权限不足       | 403        |
| 2001   | 书籍不存在     | 404        |
| 2002   | ISBN格式无效   | 400        |
| 3001   | 会话不存在     | 404        |
| 3002   | 会话已结束     | 400        |