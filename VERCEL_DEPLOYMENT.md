# 🚀 Vercel Deployment Guide

Panduan step-by-step untuk deploy Mictify ke Vercel.

## Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free)
- ✅ Project sudah di GitHub repository

## Step 1: Push ke GitHub

```bash
# Add semua files
git add .

# Commit changes
git commit -m "Ready for Vercel deployment"

# Push ke GitHub
git push origin main
```

## Step 2: Deploy ke Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Login ke Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Login dengan GitHub account

2. **Import Project**:
   - Klik "New Project"
   - Pilih GitHub repository "mictify"
   - Klik "Import"

3. **Configure Project**:
   - **Project Name**: `mictify`
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty (static site)
   - **Output Directory**: Leave empty
   - **Install Command**: Leave empty

4. **Deploy**:
   - Klik "Deploy"
   - Tunggu 1-2 menit
   - Done! 🎉

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: mictify
# - Directory: ./
# - Want to override settings? N
```

## Step 3: Verify Deployment

1. **Check URL**: Vercel akan kasih URL seperti `https://mictify-xxx.vercel.app`
2. **Test Features**:
   - ✅ Music player works
   - ✅ All 3 playlists load
   - ✅ Search functionality
   - ✅ Mobile player
   - ✅ PWA install prompt

## Step 4: Custom Domain (Optional)

1. **Buy Domain**: Dari provider seperti Namecheap, GoDaddy, dll
2. **Add Domain di Vercel**:
   - Go to Project Settings
   - Klik "Domains"
   - Add your domain
   - Follow DNS setup instructions
3. **Update Config**: Edit `config.js` dan ganti `VERCEL_URL`

## Step 5: Auto Deploy Setup

Vercel otomatis deploy setiap kali ada push ke GitHub:

```bash
# Make changes
git add .
git commit -m "Update music library"
git push origin main

# Vercel automatically deploys! 🚀
```

## Troubleshooting

### Music Files Not Loading
- **Problem**: 404 errors untuk MP3 files
- **Solution**: Check file paths di `assets/music-list.js`

### PWA Not Working
- **Problem**: Install prompt tidak muncul
- **Solution**: Check `manifest.json` dan `sw.js` paths

### Slow Loading
- **Problem**: App loading lambat
- **Solution**: Vercel otomatis optimize, tapi bisa compress MP3 files

### HTTPS Issues
- **Problem**: Mixed content errors
- **Solution**: Vercel otomatis provide HTTPS, pastikan semua assets use relative paths

## Performance Tips

1. **Optimize Images**: Compress cover images
2. **Compress Audio**: Use MP3 dengan bitrate 128kbps untuk web
3. **Enable Caching**: Sudah di-setup di `vercel.json`
4. **Use CDN**: Vercel otomatis provide global CDN

## Monitoring

- **Analytics**: Enable di Vercel dashboard
- **Performance**: Check Core Web Vitals
- **Errors**: Monitor function logs (kalau ada)

## Cost

- **Free Tier**: 100GB bandwidth/month (cukup untuk personal use)
- **Pro Tier**: $20/month (unlimited bandwidth)

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**Happy Deploying! 🚀**