# AI Gateway

Прокси для OpenAI и Stability AI. Запускается на VPS.

```bash
npm install
cp .env.example .env
# заполнить OPENAI_API_KEY, STABILITY_API_KEY
npm start
```

Порты: GET /health, POST /api/ai/generate/openai, POST /api/ai/generate/stability
