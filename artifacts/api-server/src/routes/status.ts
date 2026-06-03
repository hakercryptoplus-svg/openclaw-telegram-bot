import { Router } from "express";

const router = Router();
const startedAt = new Date().toISOString();

router.get("/status", (req, res) => {
  const uptimeSeconds = Math.floor(
    (Date.now() - new Date(startedAt).getTime()) / 1000,
  );
  res.json({
    status: "online",
    botName: "@Agent_x_claw_bot",
    model: "atxp/claude-opus-4-8",
    uptimeSeconds,
    startedAt,
  });
});

export default router;
