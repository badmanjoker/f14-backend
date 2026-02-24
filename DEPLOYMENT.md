# Deployment & Setup Guide

## 1. Environment Variables (Critical)
You must set these variables for the app to function.

### Backend (.env) & Render
```bash
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/floatingfourteen
STRIPE_SECRET_KEY= <REDACCED_SK_KEY>
```

### Frontend (.env.local) & Netlify
```bash
NEXT_PUBLIC_API_URL=https://<your-render-backend-url>.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= <REDACCED_PK_KEY>
```

## 2. Push to GitHub
1. Initialize Git if not done:
   ```bash
   git init
   git add .
   git commit -m "Initial Full Stack Setup"
   ```
2. Link and push:
   ```bash
   git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
   git push -u origin main
   ```

## 3. Deploy Backend (Render.com)
1. **New Web Service** -> Connect GitHub Repo.
2. **Build Command**: `npm install`
3. **Start Command**: `node server.js`
4. **Environment Variables**: Add contents of your local `.env`.

## 4. Deploy Frontend (Netlify)
1. **New Site from Git** -> Connect GitHub Repo.
2. **Build Command**: `npm run build`
3. **Publish Directory**: `.next`
4. **Environment Variables**: Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_API_URL`.

## Debugging
- **Stripe Error**: Check if keys are correct.
- **Connection Error**: Ensure Backend is running and `NEXT_PUBLIC_API_URL` points to the correctly.
