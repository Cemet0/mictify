# 🎵 Mictify - Modern Music Streaming App

Aplikasi streaming musik modern dengan admin panel terintegrasi, dibangun dengan vanilla JavaScript dan MySQL.

## ✨ Features

- 🎶 **Music Streaming** - 3 kategori playlist (Breakbeat, For Revenge, Cigarettes After Sex)
- 📱 **Mobile Responsive** - Floating player dan fullscreen mode
- 🔧 **Admin Panel** - Upload, manage, dan delete musik
- 🗄️ **Database Integration** - MySQL dengan auto-sync
- 🌐 **PWA Support** - Background playback dan installable
- 🎨 **Liquid Glass UI** - Modern glassmorphism design

## 🚀 Deployment

### Frontend (Vercel)
1. Update `config.js` dengan URL backend production
2. Deploy ke Vercel:
```bash
vercel --prod
```

### Backend (Railway/Render)
1. Deploy folder `backend/` ke Railway atau Render
2. Setup environment variables:
   - `DB_HOST`
   - `DB_USER` 
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
3. Update CORS origins dengan URL frontend

## 📁 Project Structure

```
mictify/
├── index.html              # Main app
├── config.js              # Environment config
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── vercel.json           # Vercel config
├── assets/
│   ├── music/            # Music files & metadata
│   └── img/              # Images
├── css/                  # Stylesheets
├── src/
│   └── main_simple.js    # Main JavaScript
└── backend/              # Node.js backend (deploy separately)
    ├── server.js
    ├── routes/
    ├── config/
    └── uploads/
```

## 🎯 Admin Panel

- **Login**: username: `admin`, password: `12345678`
- **Features**: Upload musik, delete tracks, generate music-list.js
- **Access**: Klik tombol "Admin" di header

## 🔧 Development

```bash
# Start backend
cd backend
node server.js

# Open frontend
# Buka index.html di browser atau live server
```

## 📝 License

MIT License - Feel free to use and modify!