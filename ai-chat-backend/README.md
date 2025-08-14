# AI Chat Backend

Minimal Express.js server that proxies requests to Google Gemini API with security, rate limiting, and streaming support.

## Features

- **Security**: CORS protection, origin validation, optional Bearer auth, Turnstile verification
- **Rate Limiting**: 20 requests/minute per IP
- **Streaming**: Server-Sent Events (SSE) for real-time responses
- **Models**: Support for Gemini 1.5 Flash and Pro
- **Error Handling**: Consistent JSON error responses

## Environment Variables

### Required
- `GOOGLE_API_KEY` - Your Google AI Studio API key

### Optional
- `ALLOWED_ORIGIN` - Frontend origin (default: `https://sanketmuchhala.github.io`)
- `API_AUTH_TOKEN` - Bearer token for API access
- `TURNSTILE_SECRET` - Cloudflare Turnstile secret key
- `PORT` - Server port (default: 3001)

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   ```bash
   export GOOGLE_API_KEY="your-gemini-api-key"
   export ALLOWED_ORIGIN="http://localhost:3000"
   ```

3. **Run the server:**
   ```bash
   npm start
   ```

## Railway Deployment

1. **Login to Railway:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize project:**
   ```bash
   railway init
   ```

3. **Set environment variables:**
   ```bash
   railway variables set GOOGLE_API_KEY="your-gemini-api-key"
   railway variables set ALLOWED_ORIGIN="https://sanketmuchhala.github.io"
   # Optional:
   railway variables set API_AUTH_TOKEN="your-secret-token"
   railway variables set TURNSTILE_SECRET="your-turnstile-secret"
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Get your deployed URL:**
   ```bash
   railway status
   ```

## API Endpoints

### POST /chat
Non-streaming chat completion.

**Request:**
```json
{
  "prompt": "Hello, how are you?",
  "model": "gemini-1.5-flash",
  "temperature": 0.7,
  "system": "You are a helpful assistant",
  "turnstileToken": "optional-turnstile-token"
}
```

**Response:**
```json
{
  "text": "Hello! I'm doing well, thank you for asking..."
}
```

### POST /stream
Streaming chat completion using Server-Sent Events.

**Request:** Same as `/chat`

**Response:** SSE stream with events:
```
event: message
data: {"delta": "Hello"}

event: message
data: {"delta": "! I'm doing"}

event: message
data: {"done": true}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## curl Examples

### Basic chat:
```bash
curl -X POST https://your-railway-url.railway.app/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is the capital of France?",
    "model": "gemini-1.5-flash"
  }'
```

### With authentication:
```bash
curl -X POST https://your-railway-url.railway.app/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "prompt": "Explain quantum computing",
    "model": "gemini-1.5-pro",
    "temperature": 0.8
  }'
```

### Streaming:
```bash
curl -X POST https://your-railway-url.railway.app/stream \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a short story",
    "model": "gemini-1.5-flash"
  }'
```

## Security Features

- **CORS**: Locked to `ALLOWED_ORIGIN`
- **Rate Limiting**: 20 requests/minute per IP
- **Origin Validation**: Rejects requests from unauthorized domains
- **Optional Auth**: Bearer token authentication
- **Turnstile**: Optional Cloudflare bot protection
- **Input Validation**: Sanitizes and validates all inputs
- **Error Handling**: No sensitive data in error responses

## Error Codes

- `400` - Invalid request (bad prompt, model, temperature)
- `401` - Unauthorized (missing/invalid auth token)
- `403` - Forbidden (invalid origin)
- `429` - Rate limit exceeded
- `502` - Gemini API error

## Dependencies

- `express` - Web framework
- `cors` - CORS middleware
- `express-rate-limit` - Rate limiting
- `@google/generative-ai` - Official Gemini SDK

## Logging

The server logs:
- Request summaries (model, prompt length, response length)
- Errors (without sensitive data)
- Startup configuration

API keys and full prompts are never logged.