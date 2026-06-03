#!/usr/bin/env node
import { spawn } from "child_process";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import os from "os";

const configDir = join(os.homedir(), ".openclaw");
const configPath = join(configDir, "openclaw.json");
const workspaceDir = join(configDir, "workspace");

// Create dirs if needed
mkdirSync(configDir, { recursive: true });
mkdirSync(workspaceDir, { recursive: true });

// Build config from env vars
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const LLM_BEARER_TOKEN = process.env.LLM_BEARER_TOKEN;

for (const [key, val] of [
  ["TELEGRAM_BOT_TOKEN", TELEGRAM_BOT_TOKEN],
  ["TELEGRAM_CHAT_ID", TELEGRAM_CHAT_ID],
  ["LLM_BEARER_TOKEN", LLM_BEARER_TOKEN],
]) {
  if (!val) {
    console.error(`❌ Missing required secret: ${key}`);
    process.exit(1);
  }
}

const config = {
  gateway: { mode: "local" },
  agents: {
    defaults: {
      workspace: workspaceDir,
      model: { primary: "atxp/claude-opus-4-8" },
    },
    list: [
      {
        id: "main",
        identity: {
          name: "Assistant",
          theme: "helpful AI assistant",
          emoji: "🤖",
        },
      },
    ],
  },
  models: {
    mode: "merge",
    providers: {
      atxp: {
        baseUrl: "https://llm.atxp.ai/v1",
        apiKey: LLM_BEARER_TOKEN,
        api: "openai-completions",
        timeoutSeconds: 120,
        models: [
          {
            id: "claude-opus-4-8",
            name: "Claude Opus 4.8 (atxp)",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 200000,
            maxTokens: 8192,
          },
        ],
      },
    },
  },
  channels: {
    telegram: {
      enabled: true,
      botToken: TELEGRAM_BOT_TOKEN,
      dmPolicy: "allowlist",
      allowFrom: [TELEGRAM_CHAT_ID],
      groups: { "*": { requireMention: false } },
    },
  },
  logging: {
    level: "info",
    consoleLevel: "info",
    consoleStyle: "pretty",
  },
};

// Write resolved config
const resolvedPath = join(configDir, "openclaw.resolved.json");
writeFileSync(resolvedPath, JSON.stringify(config, null, 2));

console.log("✅ OpenClaw config resolved");
console.log("🤖 Starting OpenClaw gateway...");
console.log(`📱 Telegram bot connected`);
console.log(`🧠 Model: atxp/claude-opus-4-8`);

// Find openclaw binary
const __dirname = dirname(fileURLToPath(import.meta.url));
const openclawBin = join(__dirname, "../node_modules/openclaw/openclaw.mjs");

// Start openclaw gateway with resolved config
const openclaw = spawn("node", [openclawBin, "gateway"], {
  env: {
    ...process.env,
    OPENCLAW_CONFIG_PATH: resolvedPath,
  },
  stdio: "inherit",
});

openclaw.on("error", (err) => {
  console.error("Failed to start OpenClaw:", err.message);
  process.exit(1);
});

openclaw.on("exit", (code) => {
  console.log(`OpenClaw exited with code ${code}`);
  process.exit(code ?? 0);
});

// Handle shutdown
process.on("SIGTERM", () => openclaw.kill("SIGTERM"));
process.on("SIGINT", () => openclaw.kill("SIGINT"));
