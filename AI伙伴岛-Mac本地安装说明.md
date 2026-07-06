# AI伙伴岛 Mac 本地安装说明

文档对齐状态：2026-07-06 修复版。安装方式不变；当前游戏已包含家长更多设置、玩法抽屉、孵化入口、愿望入口、手机布局和伙伴回信的回归修复。

这份文件给另一台 MacBook 上的 Codex 使用。目标是让孩子在自己的 MacBook 上本地运行游戏，先不配置 N100、HTTPS、Cloudflare 或域名。

## 推荐运行方式

在 MacBook 上进入项目服务目录：

```bash
cd ai-kid-cards/ai-partner-island-server
npm install
npm start
```

然后用浏览器打开：

```text
http://localhost:8787/
```

或者直接打开游戏页：

```text
http://localhost:8787/AI伙伴岛.html
```

## 为什么用 localhost

`localhost` 在浏览器里属于安全环境，语音输入、麦克风授权通常比局域网 HTTP 地址更容易成功。不需要 HTTPS，也不需要公网 IP。

## Codex 驱动说明

如果这台 MacBook 上也安装并登录了 Codex，本地导演服务可以继续作为游戏底层驱动。游戏里的“请求 Codex 导演”会访问本机服务：

```text
http://localhost:8787/api/codex/level-draft
```

当前服务默认是本地草稿驱动，不会调用外部 API。家长预览通过后，孩子再决定是否采用内容。

## 安全边界

- 只使用昵称，不输入学校、住址、电话或真实照片。
- 麦克风必须由孩子或家长点击按钮后授权，网页不会偷偷录音。
- AI 草稿只进入家长预览，不会自动替孩子完成作品。
- 孩子保留最终选择和修改权。

## 常见问题

如果端口被占用，可以让另一台 Mac 上的 Codex 修改服务端口，或先关闭占用 `8787` 的程序。

如果麦克风不可用，先确认浏览器使用的是：

```text
http://localhost:8787/
```

不要优先使用局域网 IP 地址。
