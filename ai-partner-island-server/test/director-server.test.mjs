import assert from "node:assert/strict";
import test from "node:test";

import { createDirectorServer } from "../server.mjs";

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()));
  });
}

test("GET /health reports local Codex director status", async () => {
  const server = createDirectorServer();
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.driver, "codex-local-draft");
    assert.equal(body.doubaoAdapter, "reserved");
  } finally {
    await close(server);
  }
});

test("GET / serves the playable island game HTML", async () => {
  const server = createDirectorServer();
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.match(body, /AI伙伴岛 - 家庭协作闯关游戏/);
    assert.match(body, /请求 Codex 导演/);
  } finally {
    await close(server);
  }
});

test("GET /AI伙伴岛.html serves the game file for LAN devices", async () => {
  const server = createDirectorServer();
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/AI%E4%BC%99%E4%BC%B4%E5%B2%9B.html`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.match(body, /const DRIVER_BASE_URL = resolveDriverBaseUrl\(\);/);
  } finally {
    await close(server);
  }
});

test("GET /AI伙伴岛.html includes the lightweight voice helper controls", async () => {
  const server = createDirectorServer();
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/AI%E4%BC%99%E4%BC%B4%E5%B2%9B.html`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /语音小精灵/);
    assert.match(body, /点我说话/);
    assert.match(body, /小精灵读给我听/);
    assert.match(body, /startVoiceListening/);
    assert.match(body, /handleVoiceCommand/);
    assert.match(body, /打开作品展/);
  } finally {
    await close(server);
  }
});

test("GET /AI伙伴岛.html explains microphone permission before voice play", async () => {
  const server = createDirectorServer();
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/AI%E4%BC%99%E4%BC%B4%E5%B2%9B.html`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /麦克风权限/);
    assert.match(body, /家长允许后再听/);
    assert.match(body, /检查麦克风/);
    assert.match(body, /prepareVoicePermission/);
    assert.match(body, /queryMicrophonePermission/);
    assert.match(body, /navigator\.mediaDevices\.getUserMedia/);
    assert.match(body, /micPermissionState/);
    assert.match(body, /voicePermissionHint/);
    assert.match(body, /我听懂啦/);
  } finally {
    await close(server);
  }
});

test("GET /AI伙伴岛.html presents the partner growth play flow", async () => {
  const server = createDirectorServer();
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/AI%E4%BC%99%E4%BC%B4%E5%B2%9B.html`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /电子宠物向导/);
    assert.match(body, /今日冒险/);
    assert.match(body, /记下愿望/);
    assert.match(body, /换问题卡/);
    assert.match(body, /演一幕/);
    assert.match(body, /完成冒险/);
    assert.match(body, /愿望卡/);
    assert.match(body, /home-wish-kind/);
    assert.match(body, /data-wish-kind/);
    assert.match(body, /为什么/);
    assert.match(body, /今日小惊喜/);
    assert.match(body, /开场贴纸/);
    assert.match(body, /先定主角/);
    assert.match(body, /发明灯亮了/);
    assert.match(body, /功能贴纸/);
    assert.match(body, /侦探灯亮了/);
    assert.match(body, /线索贴纸/);
    assert.match(body, /宠物心情/);
    assert.match(body, /好奇冒泡/);
    assert.match(body, /故事灯/);
    assert.match(body, /安全盾/);
    assert.match(body, /宠物听到啦/);
    assert.match(body, /关卡小报/);
    assert.match(body, /打开更多玩法/);
    assert.match(body, /成长工具箱/);
    assert.match(body, /currentOpenStageDrawers/);
    assert.match(body, /restoreOpenStageDrawers/);
    assert.match(body, /小精灵游戏指引/);
    assert.match(body, /floatingGuideNext/);
    assert.match(body, /现在做/);
    assert.match(body, /完成标志/);
    assert.match(body, /AI 伙伴对话练习/);
    assert.match(body, /说愿望/);
    assert.match(body, /补细节/);
    assert.match(body, /给反馈/);
    assert.match(body, /AI 追问我/);
    assert.match(body, /安全小约定/);
    assert.match(body, /请先问我 3 个问题/);
    assert.match(body, /反馈训练/);
    assert.match(body, /更像我/);
    assert.match(body, /短一点/);
    assert.match(body, /再问我/);
    assert.match(body, /不确定/);
    assert.match(body, /AI 回答检查/);
    assert.match(body, /像我吗/);
    assert.match(body, /真实吗/);
    assert.match(body, /安全吗/);
    assert.match(body, /我决定/);
    assert.match(body, /提示词魔法配方/);
    assert.match(body, /角色/);
    assert.match(body, /地点/);
    assert.match(body, /动作/);
    assert.match(body, /风格/);
    assert.match(body, /限制/);
    assert.match(body, /data-recipe-part/);
    assert.match(body, /recipeRecord/);
    assert.match(body, /训练宠物小课堂/);
    assert.match(body, /喂例子/);
    assert.match(body, /宠物先猜/);
    assert.match(body, /我来纠正/);
    assert.match(body, /例子太少会猜错/);
    assert.match(body, /data-train-example/);
    assert.match(body, /trainingRecord/);
    assert.match(body, /AI 误会侦探/);
    assert.match(body, /不真实/);
    assert.match(body, /不像我/);
    assert.match(body, /不安全/);
    assert.match(body, /太确定/);
    assert.match(body, /data-misunderstanding-example/);
    assert.match(body, /misunderstandingRecord/);
    assert.match(body, /伙伴能力印章/);
    assert.match(body, /会说愿望/);
    assert.match(body, /会让 AI 问/);
    assert.match(body, /会教 AI 改/);
    assert.match(body, /会检查答案/);
    assert.match(body, /愿望小剧场/);
    assert.match(body, /冒险开场/);
    assert.match(body, /改造一版/);
    assert.match(body, /作品登场/);
    assert.match(body, /孩子说/);
    assert.match(body, /AI 先问/);
    assert.match(body, /我来改/);
    assert.match(body, /把小剧场放进日记/);
    assert.match(body, /好奇心许愿池/);
    assert.match(body, /换一张问题卡/);
    assert.match(body, /我想问 AI/);
    assert.match(body, /AI 先帮我/);
    assert.match(body, /我来反馈/);
    assert.match(body, /我来检查/);
    assert.match(body, /请 AI 帮我想第一步/);
    assert.match(body, /伙伴回信/);
    assert.match(body, /收到愿望/);
    assert.match(body, /收到好奇心/);
    assert.match(body, /收到小剧场/);
    assert.match(body, /下一步/);
    assert.match(body, /作品展讲解/);
    assert.match(body, /exhibitSpotlight/);
    assert.match(body, /我做的是/);
    assert.match(body, /AI 帮我/);
    assert.match(body, /我教 AI/);
    assert.match(body, /我检查了/);
    assert.match(body, /我决定/);
    assert.match(body, /伙伴共学卡/);
    assert.match(body, /互相成就/);
    assert.match(body, /AI 成就我/);
    assert.match(body, /我成就 AI/);
    assert.match(body, /跟宠物认识 AI/);
    assert.match(body, /练习和 AI 交流/);
    assert.match(body, /一起应用 AI/);
    assert.match(body, /学习 AI/);
    assert.match(body, /AI 能帮我什么/);
    assert.match(body, /能完成什么任务/);
    assert.match(body, /能学习什么/);
    assert.match(body, /怎样和 AI 配合/);
    assert.match(body, /沟通/);
    assert.match(body, /配合/);
    assert.match(body, /成长能力/);
    assert.match(body, /成长日记/);
    assert.match(body, /家长提示/);
    assert.match(body, /directAdopt/);
    assert.match(body, /directWish/);
  } finally {
    await close(server);
  }
});

test("GET /AI伙伴岛.html leads with the pet egg onboarding path", async () => {
  const server = createDirectorServer();
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/AI%E4%BC%99%E4%BC%B4%E5%B2%9B.html`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /一颗会学习的电子宠物蛋/);
    assert.match(body, /今天要做什么/);
    assert.match(body, /选大小、颜色、形状和能力/);
    assert.match(body, /孵化我的宠物/);
    assert.match(body, /说一句愿望/);
    assert.match(body, /打开作品展/);
    assert.match(body, /宠物蛋还在充能/);
    assert.match(body, /1\. 说愿望/);
    assert.match(body, /2\. 让 AI 想一版/);
    assert.match(body, /3\. 我来决定/);
    assert.match(body, /data-action="startHatching"/);
  } finally {
    await close(server);
  }
});

test("GET /AI伙伴岛.html separates child mode from parent tools", async () => {
  const server = createDirectorServer();
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/AI%E4%BC%99%E4%BC%B4%E5%B2%9B.html`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /家长看一眼/);
    assert.match(body, /回到游戏/);
    assert.match(body, /parent-only/);
    assert.match(body, /parent-advanced/);
    assert.match(body, /parent-advanced-mode/);
    assert.match(body, /body\.parent-mode\.parent-advanced-mode \.parent-advanced/);
    assert.doesNotMatch(body, /document\.body\.classList\.toggle\("parent-advanced",/);
    assert.match(body, /toggleParentMode/);
    assert.match(body, /toggleParentAdvanced/);
    assert.match(body, /更多设置/);
    assert.match(body, /冒险地图/);
    assert.match(body, /孩子任务贴纸板/);
    assert.match(body, /今天的小冒险/);
    assert.match(body, /完成会得到/);
    assert.match(body, /合作三句话/);
    assert.match(body, /kid-side-board\.flat-board\s*\{\s*grid-template-columns: 1fr;/);
  } finally {
    await close(server);
  }
});

test("GET /AI伙伴岛.html embeds knowledge learning inside pet parameter design", async () => {
  const server = createDirectorServer();
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/AI%E4%BC%99%E4%BC%B4%E5%B2%9B.html`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /电子宠物孵化舱/);
    assert.match(body, /参数里学习知识/);
    assert.match(body, /尺寸/);
    assert.match(body, /颜色/);
    assert.match(body, /形状/);
    assert.match(body, /移动方式/);
    assert.match(body, /能量食物/);
    assert.match(body, /英文名字/);
    assert.match(body, /数学：大小、长度、比例、单位/);
    assert.match(body, /语文表达：把想法说具体/);
    assert.match(body, /英语：给宠物起英文名/);
    assert.match(body, /物理：移动、速度和力/);
    assert.match(body, /科学：能量、材料和变化/);
    assert.match(body, /我想让 AI 帮我设计一只/);
    assert.match(body, /petDesignOptions/);
    assert.match(body, /data-pet-param/);
    assert.match(body, /英文名字/);
    assert.match(body, /syncVisiblePetDesignSummary/);
    assert.match(body, /宠物档案/);
  } finally {
    await close(server);
  }
});

test("GET /AI伙伴岛.html includes lightweight celebration effects for key moments", async () => {
  const server = createDirectorServer();
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/AI%E4%BC%99%E4%BC%B4%E5%B2%9B.html`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /celebration-overlay/);
    assert.match(body, /celebration-card/);
    assert.match(body, /pet-hatch-success/);
    assert.match(body, /knowledge-sparkle/);
    assert.match(body, /task-complete-spark/);
    assert.match(body, /cooperation-success/);
    assert.match(body, /triggerCelebration/);
    assert.match(body, /celebrateTaskSuccess/);
    assert.match(body, /celebrateCooperation/);
    assert.match(body, /豆豆孵化成功/);
    assert.match(body, /获得知识宝石/);
    assert.match(body, /配合成功/);
    assert.match(body, /prefers-reduced-motion/);
  } finally {
    await close(server);
  }
});

test("GET / serves the printable standalone walkthrough link and page", async () => {
  const server = createDirectorServer();
  const baseUrl = await listen(server);

  try {
    const indexResponse = await fetch(`${baseUrl}/index.html`);
    const indexBody = await indexResponse.text();
    assert.equal(indexResponse.status, 200);
    assert.match(indexBody, /AI伙伴岛-单独通关说明-打印版\.html/);
    assert.match(indexBody, /AI伙伴岛-单独通关说明-黑白扫描版\.html/);

    const printResponse = await fetch(`${baseUrl}/AI%E4%BC%99%E4%BC%B4%E5%B2%9B-%E5%8D%95%E7%8B%AC%E9%80%9A%E5%85%B3%E8%AF%B4%E6%98%8E-%E6%89%93%E5%8D%B0%E7%89%88.html`);
    const printBody = await printResponse.text();
    assert.equal(printResponse.status, 200);
    assert.match(printResponse.headers.get("content-type"), /text\/html/);
    assert.match(printBody, /AI伙伴岛通关说明/);
    assert.match(printBody, /window\.print/);
    assert.match(printBody, /@media print/);

    const scanResponse = await fetch(`${baseUrl}/AI%E4%BC%99%E4%BC%B4%E5%B2%9B-%E5%8D%95%E7%8B%AC%E9%80%9A%E5%85%B3%E8%AF%B4%E6%98%8E-%E9%BB%91%E7%99%BD%E6%89%AB%E6%8F%8F%E7%89%88.html`);
    const scanBody = await scanResponse.text();
    assert.equal(scanResponse.status, 200);
    assert.match(scanResponse.headers.get("content-type"), /text\/html/);
    assert.match(scanBody, /黑白扫描版/);
    assert.match(scanBody, /复印任务单/);
    assert.match(scanBody, /window\.print/);
    assert.match(scanBody, /@media print/);
  } finally {
    await close(server);
  }
});

test("POST /api/codex/level-draft returns a parent-review draft", async () => {
  const server = createDirectorServer();
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/api/codex/level-draft`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        levelId: 4,
        levelTitle: "电子宠物诞生",
        playerName: "小队长",
        spriteName: "灵灵",
        petName: "豆豆",
        note: "我想让豆豆会开心地眨眼，还能提醒我不要直接相信 AI。"
      })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.requiresParentApproval, true);
    assert.equal(body.driver, "codex-local-draft");
    assert.equal(body.draft.levelId, 4);
    assert.match(body.draft.title, /电子宠物档案/);
    assert.match(body.draft.story, /宠物蛋/);
    assert.match(body.draft.childMission.join("\n"), /宠物台词/);
    assert.match(body.draft.childMission.join("\n"), /宠物技能/);
    assert.ok(body.draft.childMission.length >= 2);
    assert.ok(body.safetyChecklist.includes("只使用昵称，不填写学校、住址、电话或真实照片。"));
  } finally {
    await close(server);
  }
});

test("POST /api/codex/level-draft can use OpenAI Responses provider", async () => {
  let capturedRequest = null;
  const fetchImpl = async (url, options) => {
    capturedRequest = {
      url,
      headers: options.headers,
      body: JSON.parse(options.body)
    };
    return new Response(JSON.stringify({
      output_text: JSON.stringify({
        title: "电子宠物诞生 · Codex 智能导演",
        story: "豆豆在宠物湾醒来，灵灵提醒小队长先决定规则，再请 AI 帮忙整理。",
        childMission: ["给豆豆设计一个开心动作", "说出 AI 帮了哪一步"],
        parentGuide: ["先让孩子选择", "再一起检查有没有隐私信息"],
        rewardIdea: "奖励豆豆一颗安全星星。"
      })
    }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };

  const server = createDirectorServer({
    provider: "openai",
    openaiApiKey: "test-key",
    openaiModel: "gpt-4.1-mini",
    fetchImpl
  });
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/api/codex/level-draft`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        levelId: 4,
        levelTitle: "电子宠物诞生",
        playerName: "小队长",
        spriteName: "灵灵",
        petName: "豆豆",
        note: "豆豆会眨眼。"
      })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.driver, "openai-responses");
    assert.equal(body.requiresParentApproval, true);
    assert.equal(body.draft.levelId, 4);
    assert.equal(body.draft.title, "电子宠物诞生 · Codex 智能导演");
    assert.equal(capturedRequest.url, "https://api.openai.com/v1/responses");
    assert.equal(capturedRequest.headers.authorization, "Bearer test-key");
    assert.equal(capturedRequest.body.model, "gpt-4.1-mini");
    assert.equal(capturedRequest.body.text.format.type, "json_schema");
  } finally {
    await close(server);
  }
});

test("POST /api/codex/level-draft reports missing OpenAI API key", async () => {
  const server = createDirectorServer({ provider: "openai", openaiApiKey: "" });
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/api/codex/level-draft`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        levelId: 1,
        levelTitle: "唤醒 AI 小精灵",
        playerName: "小队长",
        spriteName: "灵灵",
        petName: "豆豆",
        note: ""
      })
    });
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.ok, false);
    assert.match(body.message, /OPENAI_API_KEY/);
  } finally {
    await close(server);
  }
});

test("POST /api/codex/level-draft rejects invalid JSON shape", async () => {
  const server = createDirectorServer();
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/api/codex/level-draft`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ levelId: "4" })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.ok, false);
    assert.match(body.message, /levelId/);
  } finally {
    await close(server);
  }
});
