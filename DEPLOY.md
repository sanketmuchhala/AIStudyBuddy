# Deploy to Vercel - Step by Step

## 1. Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up with your GitHub account

## 2. Import Your Repository
- Click "New Project"
- Select "Import Git Repository"
- Choose your `AIStudyBuddy` repository
- Click "Import"

## 3. Configure Project Settings
- **Framework Preset**: Select "Other"
- **Root Directory**: Leave as `/` (root)
- **Build Command**: Leave empty (Vercel will auto-detect)
- **Output Directory**: Leave empty (Vercel will auto-detect)
- **Install Command**: Leave empty (Vercel will auto-detect)

## 4. Set Environment Variables
Click "Environment Variables" and add:
```
GEMINI_API_KEY=your_google_gemini_api_key_here
NODE_ENV=production
```

## 5. Deploy
- Click "Deploy"
- Vercel will automatically:
  - Install dependencies
  - Build the client (React app)
  - Build the server (Express.js)
  - Deploy to production

## 6. Test Your Deployment
Once deployed, test these URLs:
- `https://your-app-name.vercel.app/` - Main app
- `https://your-app-name.vercel.app/healthz` - Health check
- `https://your-app-name.vercel.app/chat` - Chat page
- `https://your-app-name.vercel.app/quick-actions` - Quick Actions

## 7. Custom Domain (Optional)
- Go to your project settings
- Click "Domains"
- Add your custom domain
- Configure DNS as instructed

## Troubleshooting

### Build Fails
- Check that all dependencies are in package.json
- Verify TypeScript compilation
- Check Vercel build logs

### API Not Working
- Verify environment variables are set
- Check function logs in Vercel dashboard
- Ensure CORS is configured correctly

### Frontend Not Loading
- Check that client build completed
- Verify static assets are being served
- Check browser console for errors

## Support
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
