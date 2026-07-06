# AI伙伴岛本地 Codex 导演服务

文档对齐状态：2026-07-06 修复版。服务端接口和启动方式不变；当前前端已完成家长高级设置、玩法抽屉、孵化入口、愿望入口、移动端贴纸板和伙伴回信的回归修复。

这是给 `AI伙伴岛.html` 使用的本机小服务。

项目总规范见：

```text
../AI伙伴岛-项目开发手册.md
```

当前版本支持两种驱动：

- `PROVIDER=local`：安全草稿模式，不联网。
- `PROVIDER=openai`：通过 OpenAI Responses API 生成结构化关卡草稿，作为 Codex 智能导演底层驱动。

共同安全规则：

- 默认只监听 `127.0.0.1:8787`；部署到局域网时可用 `HOST=0.0.0.0`。
- 根据游戏页面发来的关卡记录，生成一个可给家长预览的本地草稿。
- 草稿进入孩子界面前，需要家长自己判断、修改和批准。
- 同一个服务会提供游戏页面和导演 API，局域网设备只需要打开一个地址。
- API key 只放在 N100 服务端，不进入浏览器。

## 启动

```bash
cd /Users/aidi/ai启蒙电影/ai-kid-cards/ai-partner-island-server
npm start
```

启动后，打开：

```text
http://127.0.0.1:8787/health
```

如果看到 `ok: true`，说明本地导演服务已经准备好。

## 局域网部署

在 N100 或其他家庭小主机上启动：

```bash
cd ~/ai-partner-island/ai-partner-island-server
HOST=0.0.0.0 PORT=8787 npm start
```

然后在同一局域网的手机、平板、电脑里打开：

```text
http://N100的局域网IP:8787/
```

例如：

```text
http://192.168.1.20:8787/
```

注意：

- 不需要再单独启动 `python3 -m http.server`。
- 游戏页面会自动把导演 API 指向当前访问的 N100 地址。
- 进度仍然保存在每台设备自己的浏览器里。
- 如果手机打不开，优先检查 N100 防火墙是否允许 `8787` 端口。

## 启用 Codex/OpenAI 底层驱动

在 N100 上创建环境文件：

```bash
nano /home/aidi/ai-partner-island/ai-partner-island-server/.env
```

写入：

```bash
PROVIDER=openai
OPENAI_MODEL=gpt-4.1-mini
OPENAI_API_KEY=你的 OpenAI API key
```

然后重启：

```bash
systemctl --user restart ai-partner-island.service
```

检查：

```bash
curl http://127.0.0.1:8787/health
```

如果看到：

```json
{
  "provider": "openai",
  "driver": "openai-responses",
  "openaiReady": true
}
```

说明真实底层驱动已经启用。

如果不想联网，把 `.env` 改回：

```bash
PROVIDER=local
```

再重启服务即可。

## 测试

```bash
cd /Users/aidi/ai启蒙电影/ai-kid-cards/ai-partner-island-server
npm test
```

## Codex 驱动说明

当前的真实智能驱动使用 OpenAI Responses API。浏览器不直接调用 OpenAI；N100 服务端负责调用模型并要求返回结构化 JSON。无论使用 `local` 还是 `openai`：

- 浏览器只请求本地服务。
- 服务端只读取非隐私游戏状态。
- 生成结果先进家长预览。
- 豆包保持可选 adapter，不进入主流程。
