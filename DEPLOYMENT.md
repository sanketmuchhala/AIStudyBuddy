# AI Chat Deployment Guide

## Quick Setup

### 1. Backend Deployment (Railway)

1. **Get Google Gemini API Key:**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create new API key

2. **Deploy to Railway:**
   ```bash
   cd ai-chat-backend
   npm install -g @railway/cli
   railway login
   railway init
   railway variables set GOOGLE_API_KEY="your-gemini-api-key"
   railway variables set ALLOWED_ORIGIN="https://sanketmuchhala.github.io"
   railway up
   ```

3. **Get your backend URL:**
   ```bash
   railway status
   ```
   Save this URL (e.g., `https://your-app-xyz.railway.app`)

### 2. Frontend Configuration

1. **Update API URL in frontend:**
   - Edit `ai-chat/app.js` line 5:
   ```javascript
   this.API_BASE = 'https://your-app-xyz.railway.app';
   ```

2. **Deploy to GitHub Pages:**
   - Create new repository: `sanketmuchhala/ai-chat` 
   - Push `ai-chat/` folder contents to main branch
   - Enable GitHub Pages in repository settings

### 3. Test Your Deployment

Visit your GitHub Pages URL and test:
- Model selection works
- Messages send and receive responses
- Settings panel functions correctly

## Optional Security Enhancements

### Add Bearer Token Authentication:
```bash
railway variables set API_AUTH_TOKEN="your-secret-token"
```
Then configure in frontend settings panel.

### Add Cloudflare Turnstile:
1. Get site key from Cloudflare
2. Set in Railway: `railway variables set TURNSTILE_SECRET="your-secret"`
3. Update frontend `TURNSTILE_SITE_KEY` in `app.js`

## Troubleshooting

- **CORS errors**: Verify `ALLOWED_ORIGIN` matches your GitHub Pages URL exactly
- **API errors**: Check Railway logs: `railway logs`
- **Connection issues**: Test backend health: `curl https://your-app.railway.app/health`

Your AI chat is now ready! 🚀