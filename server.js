import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "25kb" }));

app.get("/health", (_req, res) => {
res.json({ ok: true, service: "KronBank AI server" });
});

app.post("/api/ai", async (req, res) => {
const key = process.env.DEEPSEEK_API_KEY;

if (!key) {
return res.status(500).json({
error: "DEEPSEEK_API_KEY is not configured on the server"
});
}

const messages = req.body?.messages;

if (!Array.isArray(messages) || messages.length > 12) {
return res.status(400).json({ error: "Invalid messages" });
}

try {
const response = await fetch(
"https://api.deepseek.com/chat/completions",
{
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": "Bearer ${key}"
},
body: JSON.stringify({
model: "deepseek-chat",
messages,
response_format: req.body.response_format || {
type: "json_object"
},
temperature: req.body.temperature ?? 0.8,
max_tokens: Math.min(Number(req.body.max_tokens) || 800, 800)
})
}
);

res.status(response.status)
  .type("application/json")
  .send(await response.text());

} catch {
res.status(502).json({
error: "Could not reach the AI provider"
});
}
});

app.use(express.static(process.cwd()));

app.get("*", (_req, res) => {
res.sendFile(process.cwd() + "/index.html");
});

app.listen(port, "0.0.0.0", () => {
console.log("KronBank listening on ${port}");
});
