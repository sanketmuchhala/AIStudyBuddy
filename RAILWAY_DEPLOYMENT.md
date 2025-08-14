# Complete Railway Deployment Guide for AI Chat Backend

## Prerequisites

- Node.js installed on your computer
- Git installed
- Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/app/apikey))

## Step 1: Prepare Your Local Environment

1. **Navigate to backend directory:**
   ```bash
   cd /Users/sanketmuchhala/Documents/GitHub/AIStudyBuddy/ai-chat-backend
   ```

2. **Test locally first (optional but recommended):**
   ```bash
   export GOOGLE_API_KEY="your-gemini-api-key-here"
   npm install
   npm start
   ```
   Should see: `🚀 AI Chat Backend running on port 3001`

## Step 2: Install Railway CLI

1. **Install Railway CLI globally:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Verify installation:**
   ```bash
   railway --version
   ```

## Step 3: Create Railway Account & Login

1. **Sign up at Railway:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub (recommended) or email
   - Verify your account if needed

2. **Login via CLI:**
   ```bash
   railway login
   ```
   - This opens your browser
   - Authorize the CLI to access your Railway account
   - Return to terminal when done

## Step 4: Initialize Railway Project

1. **From your backend directory, initialize project:**
   ```bash
   railway init
   ```

2. **Choose options:**
   - Select "Create new project"
   - Enter project name: `ai-chat-backend`
   - Choose "Empty project" (not from template)

3. **Link to existing directory:**
   ```bash
   railway link
   ```
   - Select your newly created project from the list

## Step 5: Configure Environment Variables

1. **Set required environment variables:**
   ```bash
   railway variables set GOOGLE_API_KEY="your-actual-gemini-api-key"
   ```

2. **Set allowed origin (update with your actual GitHub Pages URL):**
   ```bash
   railway variables set ALLOWED_ORIGIN="https://sanketmuchhala.github.io"
   ```

3. **Optional security variables:**
   ```bash
   # For Bearer token auth (optional):
   railway variables set API_AUTH_TOKEN="your-secret-token-123"
   
   # For Cloudflare Turnstile (optional):
   railway variables set TURNSTILE_SECRET="your-turnstile-secret"
   ```

4. **Verify variables are set:**
   ```bash
   railway variables
   ```

## Step 6: Deploy Your Application

1. **Deploy the backend:**
   ```bash
   railway up
   ```
   - This uploads your code and starts deployment
   - Wait for "Deployment successful" message

2. **Check deployment status:**
   ```bash
   railway status
   ```

## Step 7: Get Your Live URL

1. **Get your deployment URL:**
   ```bash
   railway domain
   ```
   - This shows your Railway app URL
   - Example: `https://ai-chat-backend-production-xyz123.railway.app`

2. **Alternative method - check in browser:**
   - Go to [railway.app/dashboard](https://railway.app/dashboard)
   - Click your project
   - Click "Deployments" tab
   - Your URL is shown at the top

## Step 8: Test Your Deployed Backend

1. **Test health endpoint:**
   ```bash
   curl https://your-app-url.railway.app/health
   ```
   Should return:
   ```json
   {"status":"healthy","timestamp":"2024-01-01T00:00:00.000Z"}
   ```

2. **Test chat endpoint:**
   ```bash
   curl -X POST https://your-app-url.railway.app/chat \
     -H "Content-Type: application/json" \
     -d '{
       "prompt": "Hello, how are you?",
       "model": "gemini-1.5-flash"
     }'
   ```

## Step 9: Update Frontend Configuration

1. **Edit your frontend file:**
   ```bash
   cd ../ai-chat
   nano app.js  # or use any text editor
   ```

2. **Update line 5 with your Railway URL:**
   ```javascript
   this.API_BASE = 'https://your-actual-railway-url.railway.app';
   ```

## Troubleshooting Common Issues

### Issue: "railway: command not found"
**Solution:**
```bash
npm install -g @railway/cli
# Or if permission issues:
sudo npm install -g @railway/cli
```

### Issue: "Project not found"
**Solution:**
```bash
railway login
railway link
# Select your project from the list
```

### Issue: "Deployment failed"
**Solutions:**
1. Check logs:
   ```bash
   railway logs
   ```
2. Verify package.json has start script
3. Check environment variables are set correctly

### Issue: "API key invalid"
**Solution:**
1. Verify your Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Re-set the variable:
   ```bash
   railway variables set GOOGLE_API_KEY="new-key-here"
   railway up
   ```

### Issue: CORS errors from frontend
**Solution:**
```bash
railway variables set ALLOWED_ORIGIN="https://your-exact-github-pages-url"
railway up
```

## Useful Railway Commands

```bash
# View all projects
railway projects

# View current project info
railway status

# View environment variables
railway variables

# View live logs
railway logs --follow

# Redeploy
railway up

# Delete variable
railway variables delete VARIABLE_NAME

# Open project dashboard in browser
railway open
```

## Project Structure Verification

Your backend directory should contain:
- `package.json` ✓
- `server.js` ✓
- `node_modules/` (after npm install)

## Security Best Practices

1. **Never commit API keys to git**
2. **Use environment variables for all secrets**
3. **Enable Bearer token auth for production:**
   ```bash
   railway variables set API_AUTH_TOKEN="$(openssl rand -hex 32)"
   ```
4. **Monitor usage in Railway dashboard**

## Next Steps

After successful deployment:
1. Save your Railway URL
2. Update frontend configuration
3. Deploy frontend to GitHub Pages
4. Test end-to-end functionality

Your backend is now live on Railway! 🚀