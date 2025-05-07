<!--
# 变更记录
- 2025-05-06 新建 API 文档，添加登录、书籍信息、对话及预留用户功能接口说明
-->

# 书智对谈小程序后端 API 文档

> 后端框架：Django 4.x + Django REST Framework (DRF)
> 
> 大模型：DeepSeek R1，通过 OpenAI Python SDK 调用（兼容 OpenAI 接口）。
> 
> 通信格式：JSON；流式对话采用 `text/event-stream`（SSE）或 `application/x-ndjson`。

---

## 目录
1. 认证模块
2. 书籍模块
3. 对话模块（流式）
4. 用户模块（预留）
5. 错误码
6. 后端开发注意事项（Dev Notes）

---

## 1. 认证模块

### 1.1 微信登录
- **URL**：`POST /api/auth/login/wechat/`
- **说明**：前端获取到 `wx.login` 返回的 `code` 后调用此接口换取 `JWT`。游客禁止访问，其余接口需携带 `Authorization: Bearer <token>`。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | `wx.login` 获取的临时登录凭证 |

#### 请求示例
```json
{
  "code": "033z2dDx1K2LhE0yXKCx1DdHnK2z2dDx"
}
```

#### 成功响应 `200`
```json
{
  "token": "<jwt_token>",
  "expires_in": 7200,
  "user": {
    "id": 1,
    "nickname": "阿书",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

---

## 2. 书籍模块

### 2.1 获取书籍信息
- **URL**：`GET /api/books/{isbn}/`
- **说明**：后端先查内部缓存，未命中则抓取第三方公开源（如豆瓣 / OpenLibrary），并入库缓存。
- **权限**：需要登录

| 路径参数 | 类型 | 说明 |
|-----------|------|------|
| isbn | string | 10 位或 13 位 ISBN |

#### 成功响应 `200`
```json
{
  "isbn": "9787115549449",
  "title": "JavaScript 高级程序设计（第4版）",
  "author": "马特·弗里斯比",
  "publisher": "人民邮电出版社",
  "introduction": "……",
  "cover_url": "https://img3.doubanio.com/view/subject/s/public/s33561554.jpg"
}
```

---

## 3. 对话模块（流式）

### 3.1 发起/继续与书籍的 AI 对话（SSE 流式）
- **URL**：`POST /api/chat/stream/`
- **Headers**：
  - `Authorization: Bearer <token>`
  - `Accept: text/event-stream`
- **说明**：客户端传入当前上下文消息列表，服务端调用 DeepSeek R1（OpenAI SDK）并以流式事件返回。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isbn | string | 是 | 当前对话关联的书籍 ISBN |
| messages | array | 是 | 消息数组，结构同 OpenAI `messages` 字段 |

#### 请求示例
```json
{
  "isbn": "9787115549449",
  "messages": [
    { "role": "user", "content": "这本书的作者是谁？" }
  ]
}
```

#### 流式响应示例（`text/event-stream`）
```
data: {"id":"chatcmpl-123","choices":[{"delta":{"role":"assistant","content":"《JavaScript 高级程序设计》的作者是"}}]}

data: {"choices":[{"delta":{"content":"马特·弗里斯比。"}}]}

data: [DONE]
```
前端监听 `onMessage`，逐段拼接显示。

---

## 4. 用户模块（预留接口，仅列出占位）

| 功能 | Method & URL | 说明 |
|------|--------------|------|
| 获取阅读历史 | `GET /api/user/history/` | 列出用户最近的对话/书籍记录 |
| 删除历史记录 | `DELETE /api/user/history/{id}/` | |
| 书籍收藏列表 | `GET /api/user/collections/` | |
| 收藏/取消收藏 | `POST /api/user/collections/` / `DELETE /api/user/collections/{isbn}/` | |
| 个人信息 | `GET /api/user/profile/` | |
| 更新个人信息 | `PUT /api/user/profile/` | |

> 以上接口暂未在前端实现，但已预留 URL 及资源设计，后期可直接对接。

---

## 5. 全局错误码

| HTTP Status | code | message | 说明 |
|-------------|------|---------|------|
| 400 | `INVALID_PARAMS` | 参数校验失败 |
| 401 | `UNAUTHORIZED` | 未登录或 Token 失效 |
| 404 | `NOT_FOUND` | 资源不存在 |
| 429 | `RATE_LIMIT` | 触发频率限制 |
| 500 | `SERVER_ERROR` | 服务器错误 |
| 503 | `MODEL_ERROR` | 调用大模型失败 |

---

### 示例错误响应
```json
{
  "code": "UNAUTHORIZED",
  "message": "请先登录"
}
```

---

### 接口约定
1. 所有成功响应使用 HTTP `200`，业务错误通过 `code` 字段区分。
2. 时间字段统一使用 ISO 8601 字符串。
3. 分页采用 `limit` / `offset` 查询参数；响应返回 `count`、`next`、`previous`。
4. 长任务（如模型推理）可返回 `202 Accepted` + 任务 ID，客户端轮询。当前对话接口采用流式返回，可忽略此机制。

---

## 6. 后端开发注意事项（Dev Notes）

1. 鉴权 & 中间件
   - 使用 `django-rest-framework-simplejwt`，AccessToken 2h，RefreshToken 7d；将匿名访问全局禁用。
   - 在 `settings.py` 配置 `REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES']` 为 JWT。
   - 对 SSE 视图要关闭 `CsrfViewMiddleware`，改用自定义 `JWTAuthentication`。

2. CORS
   - 小程序请求域名已备案：`https://sealos.plumeintel.tech`。
   - 安装 `django-cors-headers`，允许 `*.weixin.qq.com` 及正式域名。

3. 速率限制
   - 推荐 `django-ratelimit`，对 `/api/chat/stream/` 做 IP + user 限流，例如 60 次/分钟。

4. 书籍抓取与缓存
   - 抓取顺序：自库 → 豆瓣 API → OpenLibrary；若全失败返回 404。
   - 建议使用 `Celery + Redis` 异步抓取，接口先返回 202，前端轮询；本文档中直接同步返回。
   - 书籍信息缓存 30 天；封面图 URL 建议代理至自有 OSS 以规避防盗链。

5. SSE 实现
   - 视图需 `@gzip_page` **禁用**，避免 Django 自动压缩。
   - 使用 `StreamingHttpResponse`，`content_type='text/event-stream'`，并在每块数据后加 `\n\n`。
   - 若部署 Nginx，设置 `proxy_buffering off;` 以免缓存流。

6. 大模型调用
   - DeepSeek R1 API 与 OpenAI 兼容，使用 `openai==1.3+`。
   - 流式参数：`stream=True`；每次 yield 的 `chunk.choices[0].delta.content` 直接写入 SSE。
   - 建议在服务端追加 `user_id` 入 `openai.ChatCompletion.create(..., user=user.id)`，便于审计。

7. 日志与监控
   - 使用 `django-structlog` 输出 JSON 日志；敏感信息（token、prompts）应脱敏。
   - 接入 `Prometheus` 监控接口 QPS、延迟、token 消耗。

8. 部署
   - 生产环境：Python 3.11 + Gunicorn + Uvicorn Worker；SSE 需要 `--worker-connections 1000`。
   - 若使用容器，记得开放 `--add-host host.docker.internal:host-gateway` 供模型服务访问。

