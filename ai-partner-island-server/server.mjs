import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8787);
const DEFAULT_PROVIDER = process.env.PROVIDER || "local";
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const MAX_BODY_BYTES = 32 * 1024;
const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url));
const STATIC_ROOT = path.resolve(SERVER_DIR, "..");

const safetyChecklist = [
  "只使用昵称，不填写学校、住址、电话或真实照片。",
  "AI 生成内容先给家长看，再决定是否放进游戏。",
  "孩子保留最终决定权：喜欢、修改、不要，都可以。"
];

const draftJsonSchema = {
  name: "ai_partner_island_level_draft",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "story", "childMission", "parentGuide", "rewardIdea"],
    properties: {
      title: { type: "string" },
      story: { type: "string" },
      childMission: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: { type: "string" }
      },
      parentGuide: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: { type: "string" }
      },
      rewardIdea: { type: "string" }
    }
  }
};

function jsonResponse(response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store"
  });
  response.end(body);
}

function textResponse(response, statusCode, contentType, body) {
  response.writeHead(statusCode, {
    "content-type": contentType,
    "cache-control": "no-store"
  });
  response.end(body);
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml; charset=utf-8";
  if (ext === ".png") return "image/png";
  if (ext === ".md") return "text/markdown; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  return "text/plain; charset=utf-8";
}

async function serveStatic(url, response) {
  const pathname = url.pathname === "/" ? "/AI伙伴岛.html" : url.pathname;
  let decodedPath = "";
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    textResponse(response, 400, "text/plain; charset=utf-8", "路径格式不正确。");
    return true;
  }

  const filePath = path.resolve(STATIC_ROOT, `.${decodedPath}`);
  if (!filePath.startsWith(`${STATIC_ROOT}${path.sep}`)) {
    textResponse(response, 403, "text/plain; charset=utf-8", "不能访问这个路径。");
    return true;
  }

  try {
    const file = await readFile(filePath);
    textResponse(response, 200, contentTypeFor(filePath), file);
  } catch {
    return false;
  }
  return true;
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", chunk => {
      raw += chunk;
      if (raw.length > MAX_BODY_BYTES) {
        reject(new Error("请求内容太长，请减少成长日记后再试。"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("请求不是有效的 JSON。"));
      }
    });
    request.on("error", reject);
  });
}

function cleanText(value, fallback) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.slice(0, 280) || fallback;
}

function validateLevelPayload(payload) {
  if (!Number.isInteger(payload.levelId)) {
    return "levelId 必须是数字。";
  }
  if (payload.levelId < 1 || payload.levelId > 10) {
    return "levelId 必须在 1 到 10 之间。";
  }
  return "";
}

function buildLocalDraft(payload) {
  const levelId = payload.levelId;
  const levelTitle = cleanText(payload.levelTitle, `第 ${levelId} 关`);
  const playerName = cleanText(payload.playerName, "小队长");
  const spriteName = cleanText(payload.spriteName, "灵灵");
  const petName = cleanText(payload.petName, "豆豆");
  const note = cleanText(payload.note, "还没有成长日记，先从一个小目标开始。");

  if (levelId === 4) {
    return {
      id: `draft-${Date.now()}-${levelId}`,
      levelId,
      title: `${petName}的电子宠物档案 · Codex 导演草稿`,
      story: `${petName}从宠物蛋里探出头，身上带着孩子刚刚选好的参数。${spriteName}提醒${playerName}：AI 可以把想法整理成档案，但宠物规则要由你决定。`,
      childMission: [
        `宠物档案：${petName}是一只来自伙伴岛的电子宠物，设定灵感是“${note}”。`,
        `宠物台词 1：我会记住你的选择，不会偷看你的秘密。`,
        `宠物台词 2：如果 AI 乱猜，我会亮起检查灯。`,
        `宠物技能：开心时跳三下，提醒小队长把 AI 草稿改成自己的说法。`
      ],
      parentGuide: [
        "请先确认孩子只使用昵称，没有学校、住址、电话或真实照片。",
        "让孩子挑一个最喜欢的台词，再改一个词，让它更像自己的宠物。",
        "追问孩子：AI 帮你整理了什么？你自己决定了什么？"
      ],
      rewardIdea: `如果孩子能改出一句自己的宠物台词，就奖励 ${petName} 一颗知识宝石和一次开心升级。`
    };
  }

  if (levelId === 3) {
    return {
      id: `draft-${Date.now()}-${levelId}`,
      levelId,
      title: `${levelTitle} · 清楚表达草稿`,
      story: `${spriteName}把${playerName}的短想法放到提示词桥上，桥面亮起了“角色、颜色、地点、动作”四块石头。`,
      childMission: [
        `简单版：${note}`,
        `更清楚版：请把角色、颜色、地点和动作补进去，再告诉 AI 不要出现什么。`,
        "选一个细节加进去，看看 AI 的回答有没有更接近你的想法。"
      ],
      parentGuide: [
        "只问引导问题，不替孩子写完整提示词。",
        "让孩子指出自己加了哪个细节。",
        "如果 AI 结果不合适，把它当成继续修改的材料。"
      ],
      rewardIdea: "孩子能说出“我加了什么细节”，就点亮说清楚徽章。"
    };
  }

  if (levelId === 9) {
    return {
      id: `draft-${Date.now()}-${levelId}`,
      levelId,
      title: `${levelTitle} · 真假侦探记录`,
      story: `${spriteName}递给${playerName}一只放大镜：聪明不是马上相信，而是先分一分、问一问、查一查。`,
      childMission: [
        "把 AI 回答分成三栏：比较确定、可能是猜的、需要查证。",
        "问一句：你怎么知道的？",
        "和家长一起查证一条资料。"
      ],
      parentGuide: [
        "把质疑做成侦探游戏，不责备孩子相信过 AI。",
        "优先选择安全、生活化的问题来查证。",
        "提醒孩子隐私问题 AI 不应该乱猜。"
      ],
      rewardIdea: "孩子能找出一个需要查证的地方，就获得侦探徽章。"
    };
  }

  return {
    id: `draft-${Date.now()}-${levelId}`,
    levelId,
    title: `${levelTitle} · Codex 导演草稿`,
    story: `${petName}收到一张发光任务卡，${spriteName}提醒${playerName}：AI 可以帮忙整理点子，但最后的选择权在你手里。`,
    childMission: [
      `把这条成长日记变成一句角色台词：${note}`,
      `选出你最喜欢的一句，再改一个更像自己的版本。`,
      `说清楚：AI 帮了哪一步？你自己决定了哪一步？`
    ],
    parentGuide: [
      "先读草稿，再问孩子是否喜欢这个方向。",
      "如果内容太像大人写的，让孩子换成自己的说法。",
      "保留孩子的奇怪想象，不急着改得很标准。"
    ],
    rewardIdea: `如果孩子能说出“AI 帮忙”和“我自己决定”的区别，就奖励 ${petName} 一次开心升级。`
  };
}

function normalizeDraft(rawDraft, payload, driver) {
  const fallback = buildLocalDraft(payload);
  const levelId = payload.levelId;
  const title = cleanText(rawDraft?.title, fallback.title);
  const story = cleanText(rawDraft?.story, fallback.story);
  const childMission = Array.isArray(rawDraft?.childMission)
    ? rawDraft.childMission.map(item => cleanText(item, "")).filter(Boolean).slice(0, 4)
    : fallback.childMission;
  const parentGuide = Array.isArray(rawDraft?.parentGuide)
    ? rawDraft.parentGuide.map(item => cleanText(item, "")).filter(Boolean).slice(0, 4)
    : fallback.parentGuide;
  const rewardIdea = cleanText(rawDraft?.rewardIdea, fallback.rewardIdea);

  return {
    ...fallback,
    id: `${driver}-${Date.now()}-${levelId}`,
    levelId,
    title,
    story,
    childMission: childMission.length >= 2 ? childMission : fallback.childMission,
    parentGuide: parentGuide.length >= 2 ? parentGuide : fallback.parentGuide,
    rewardIdea
  };
}

function buildOpenAiInput(payload) {
  const levelTitle = cleanText(payload.levelTitle, `第 ${payload.levelId} 关`);
  const playerName = cleanText(payload.playerName, "小队长");
  const spriteName = cleanText(payload.spriteName, "灵灵");
  const petName = cleanText(payload.petName, "豆豆");
  const note = cleanText(payload.note, "孩子还没有写成长日记。");

  return [
    {
      role: "system",
      content: [
        {
          type: "input_text",
          text: [
            "你是《AI伙伴岛》的 Codex 智能导演，服务对象是一名 8 岁孩子和家长。",
            "目标是激发兴趣、保护安全、让孩子觉得 AI 是可以合作的工具。",
            "只返回符合 JSON schema 的内容，不要包含 Markdown。",
            "内容必须适合儿童，不能要求真实姓名、学校、住址、电话或真实照片。",
            "AI 是助手，孩子是小队长，家长负责预览和安全。"
          ].join("\n")
        }
      ]
    },
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: [
            `关卡编号：${payload.levelId}`,
            `关卡标题：${levelTitle}`,
            `孩子昵称：${playerName}`,
            `AI 小精灵昵称：${spriteName}`,
            `电子宠物昵称：${petName}`,
            `孩子成长日记：${note}`,
            "请生成一个家长预览草稿，包括：有画面感但不吓人的故事、孩子可以玩的任务、家长引导、奖励建议。"
          ].join("\n")
        }
      ]
    }
  ];
}

function extractOpenAiText(body) {
  if (typeof body.output_text === "string") return body.output_text;
  const textParts = [];
  for (const item of body.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") textParts.push(content.text);
    }
  }
  return textParts.join("\n");
}

async function buildOpenAiDraft(payload, options) {
  const apiKey = options.openaiApiKey;
  if (!apiKey) {
    const error = new Error("OPENAI_API_KEY 未配置，不能启用 OpenAI/Codex 底层驱动。");
    error.statusCode = 503;
    throw error;
  }

  const fetchImpl = options.fetchImpl || fetch;
  const response = await fetchImpl("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: options.openaiModel,
      input: buildOpenAiInput(payload),
      text: {
        format: {
          type: "json_schema",
          ...draftJsonSchema
        }
      }
    })
  });

  const body = await response.json();
  if (!response.ok) {
    const message = body?.error?.message || "OpenAI/Codex 底层驱动请求失败。";
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  const rawText = extractOpenAiText(body);
  let rawDraft = {};
  try {
    rawDraft = JSON.parse(rawText);
  } catch {
    const error = new Error("OpenAI/Codex 返回内容不是有效的草稿 JSON。");
    error.statusCode = 502;
    throw error;
  }
  return normalizeDraft(rawDraft, payload, "openai");
}

async function buildDraft(payload, options) {
  if (options.provider === "openai") {
    return {
      driver: "openai-responses",
      draft: await buildOpenAiDraft(payload, options)
    };
  }

  return {
    driver: "codex-local-draft",
    draft: buildLocalDraft(payload)
  };
}

function createOptions(overrides = {}) {
  return {
    provider: overrides.provider || DEFAULT_PROVIDER,
    openaiApiKey: overrides.openaiApiKey ?? process.env.OPENAI_API_KEY ?? "",
    openaiModel: overrides.openaiModel || DEFAULT_OPENAI_MODEL,
    fetchImpl: overrides.fetchImpl || fetch
  };
}

export function createDirectorServer(overrides = {}) {
  const options = createOptions(overrides);
  return createServer(async (request, response) => {
    const url = new URL(request.url || "/", `http://${request.headers.host || HOST}`);

    if (request.method === "OPTIONS") {
      jsonResponse(response, 204, {});
      return;
    }

    if (request.method === "GET" && url.pathname === "/health") {
      jsonResponse(response, 200, {
        ok: true,
        driver: options.provider === "openai" ? "openai-responses" : "codex-local-draft",
        provider: options.provider,
        model: options.provider === "openai" ? options.openaiModel : "local-draft",
        openaiReady: options.provider !== "openai" || Boolean(options.openaiApiKey),
        doubaoAdapter: "reserved",
        message: options.provider === "openai"
          ? "AI伙伴岛 Codex/OpenAI 底层驱动已启用。生成结果仍会进入家长预览。"
          : "AI伙伴岛本地导演服务已启动。当前是安全草稿模式，未调用外部 API。"
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/codex/level-draft") {
      try {
        const payload = await readJson(request);
        const validationMessage = validateLevelPayload(payload);
        if (validationMessage) {
          jsonResponse(response, 400, { ok: false, message: validationMessage });
          return;
        }

        const result = await buildDraft(payload, options);

        jsonResponse(response, 200, {
          ok: true,
          driver: result.driver,
          requiresParentApproval: true,
          safetyChecklist,
          draft: result.draft
        });
      } catch (error) {
        jsonResponse(response, error.statusCode || 400, {
          ok: false,
          message: error instanceof Error ? error.message : "请求处理失败。"
        });
      }
      return;
    }

    if (request.method === "GET") {
      const served = await serveStatic(url, response);
      if (served) return;
    }

    jsonResponse(response, 404, {
      ok: false,
      message: "没有找到这个本地导演接口。"
    });
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createDirectorServer();
  server.listen(PORT, HOST, () => {
    console.log(`AI伙伴岛本地 Codex 导演服务：http://${HOST}:${PORT}`);
    console.log("局域网部署时请使用：HOST=0.0.0.0 PORT=8787 npm start");
    console.log(`当前驱动：${DEFAULT_PROVIDER === "openai" ? `OpenAI Responses / ${DEFAULT_OPENAI_MODEL}` : "本地草稿，不调用外部 API"}`);
  });
}
