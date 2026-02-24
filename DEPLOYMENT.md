# Deployment & Setup Guide

## 1. Environment Variables (Critical)
You must set these variables for the app to function.

### Backend (.env in `server/`) & Render
```bash
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/floatingfourteen
STRIPE_SECRET_KEY=sk_test_... (Get from Stripe Dashboard)
```

### Frontend (.env.local in `client/`) & Netlify
```bash
NEXT_PUBLIC_API_URL=https://<your-render-backend-url>.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (Get from Stripe Dashboard)
```

## 2. Push to GitHub
1. Initialize Git if not done:
   ```bash
   git init
   git add .
   git commit -m "Initial Full Stack Setup"
   ```
2. Create a new Repo on GitHub.
3. Link and push:
   ```bash
   git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
   git push -u origin main
   ```

## 3. Deploy Backend (Render.com)
1. **New Web Service** -> Connect GitHub Repo.
2. **Root Directory**: `server`
3. **Build Command**: `npm install`
4. **Start Command**: `node index.js`
5. **Environment Variables**: Add contents of `server/.env`.

## 4. Deploy Frontend (Netlify)
1. **New Site from Git** -> Connect GitHub Repo.
2. **Base Directory**: `client`
3. **Build Command**: `npm run build`
4. **Publish Directory**: `.next` (Netlify usually detects Next.js automatically).
5. **Environment Variables**: Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_API_URL`.

## 5. Usage
- **Local Dev**:
  - Terminal 1 (`server`): `npm run dev` (or `node index.js`)
  - Terminal 2 (`client`): `npm run dev`
  - Visit `http://localhost:3000`.

## Debugging
- **Stripe Error**: Check if keys are correct and `NEXT_PUBLIC_` prefix is used in frontend.
- **Connection Error**: Ensure Backend is running and `NEXT_PUBLIC_API_URL` points to the correct URL (localhost for dev, Render URL for prod).
