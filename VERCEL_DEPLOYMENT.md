# Vercel Deployment Guide

## Quick Start

1. **Sign up for Vercel**: Go to [vercel.com](https://vercel.com) and create an account
2. **Connect GitHub**: Link your GitHub repository to Vercel
3. **Deploy**: Vercel will automatically detect and deploy your project

## Environment Variables

Set these in your Vercel project settings:

```
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=production
```

## Build Configuration

The project uses a custom build configuration in `vercel.json`:

- **Frontend**: React app built with Vite
- **Backend**: Express.js API routes
- **Static Assets**: Served by Vercel's global CDN
- **API Routes**: Serverless functions with 30-second timeout

## Deployment Process

1. **Build Stage**:
   - Install dependencies for both client and server
   - Build TypeScript server code
   - Build React client with Vite
   - Optimize static assets

2. **Deploy Stage**:
   - Deploy static assets to global CDN
   - Deploy API routes as serverless functions
   - Configure routing for SPA fallback

## API Routes

Your Express.js server is converted to Vercel serverless functions:

- `/api/chat` - Chat functionality
- `/api/quick/*` - Quick actions (summarize, study plan, etc.)
- `/healthz` - Health check endpoint

## Performance Optimizations

- **Edge Caching**: Static assets cached globally
- **Auto-scaling**: API routes scale automatically
- **CDN**: Global content delivery network
- **Build Optimization**: Vite optimizes bundle size

## Monitoring

- **Function Logs**: View API route execution logs
- **Performance**: Monitor function execution times
- **Errors**: Track and debug deployment issues
- **Analytics**: Built-in performance analytics

## Custom Domain

1. Go to your Vercel project settings
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatically provisioned

## Local Development

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Troubleshooting

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors

### API Timeouts
- API routes have 30-second timeout limit
- Optimize long-running operations
- Consider streaming for large responses

### CORS Issues
- Ensure CORS is configured for your domain
- Check environment variables
- Verify API route configuration

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Deployment Examples](https://vercel.com/examples)
