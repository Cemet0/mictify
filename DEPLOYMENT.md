# 🚀 Deployment Guide - Mictify

## 📋 Prerequisites
- Git repository
- Vercel account (frontend)
- Railway account (backend)
- MySQL database

## 🎯 Deployment Steps

### 1. Deploy Backend (Railway)
1. Connect GitHub repo
2. Select `backend/` folder
3. Add environment variables:
   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
   - JWT_SECRET, PORT=3001

### 2. Update Frontend Config
Edit `config.js` dengan URL backend production

### 3. Deploy Frontend (Vercel)
```bash
vercel --prod
```

### 4. Update CORS
Tambahkan domain Vercel ke backend CORS settings

## ✅ Ready to Deploy!
Project sudah bersih dan siap untuk production deployment.