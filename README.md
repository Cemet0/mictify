# 🎵 Mictify - Music Streaming App

Modern music streaming application dengan desain Spotify-inspired dan liquid glass effects. Pure frontend application yang simple dan fast.

## ✨ Features

- 🎵 **3 Playlist Categories**: Breakbeat, For Revenge, Cigarettes After Sex
- 📱 **Mobile-First Design**: Responsive dengan floating player dan fullscreen mode
- 🎨 **Liquid Glass Effects**: Modern glassmorphism UI design
- 🔄 **Advanced Controls**: Shuffle, repeat, volume control, progress bar
- 📴 **Background Playback**: Music continues when browser minimized/phone locked
- 💾 **Persistent Settings**: Volume, shuffle, repeat state tersimpan
- 🔍 **Smart Search**: Context-aware search (playlist names atau tracks)
- 📲 **PWA Support**: Installable seperti native app
- ⚡ **Performance Optimized**: Fast loading, smooth animations

## 🚀 Live Demo

**Production**: [https://mictify.vercel.app](https://mictify.vercel.app)

## 📁 Project Structure

```
mictify/
├── index.html              # Main HTML file
├── src/
│   └── main_simple.js      # Main JavaScript logic
├── css/
│   ├── main.css           # Main styles with liquid glass effects
│   ├── variables.css      # CSS custom properties
│   └── reset.css          # CSS reset
├── assets/
│   ├── music/             # Music files organized by category
│   │   ├── breakbeat/     # Breakbeat tracks (13 files)
│   │   ├── for revenge/   # For Revenge tracks (12 files)
│   │   └── Cigarettes After Sex/  # CAS tracks (14 files)
│   ├── img/               # Cover images
│   └── music-list.js      # Music metadata
├── manifest.json          # PWA manifest
├── sw.js                  # Service Worker
├── vercel.json           # Vercel deployment config
└── config.js             # App configuration
```

## 🎵 Music Library

**Total: 39 Tracks**
- **Breakbeat**: 13 tracks (DJ remixes, viral TikTok songs)
- **For Revenge**: 12 tracks (Alternative rock, Indonesian indie)
- **Cigarettes After Sex**: 14 tracks (Dream pop, ambient)

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: Custom CSS with glassmorphism effects
- **Audio**: HTML5 Audio API with Media Session API
- **PWA**: Service Worker, Web App Manifest
- **Deployment**: Vercel (Static hosting)
- **Performance**: Optimized for mobile, lazy loading

## 📱 Mobile Features

- **Floating Player**: Compact player at bottom of screen
- **Fullscreen Mode**: Tap floating player for fullscreen experience
- **Touch Optimized**: Smooth scrolling, touch-friendly controls
- **Hardware Integration**: Media keys, notification controls
- **Background Playback**: Continues playing when app minimized

## 🎨 Design Features

- **Spotify-Inspired**: Familiar music app interface
- **Liquid Glass Effects**: Modern glassmorphism throughout
- **Dark Theme**: Easy on the eyes, battery friendly
- **Smooth Animations**: 60fps animations with hardware acceleration
- **Responsive Layout**: Works on all screen sizes

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Auto Deploy**: Vercel automatically deploys from GitHub

### Local Development

1. **Clone Repository**:
   ```bash
   git clone https://github.com/yourusername/mictify.git
   cd mictify
   ```

2. **Serve Locally**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using Live Server (VS Code extension)
   ```

3. **Open Browser**:
   ```
   http://localhost:8000
   ```

## 🎵 Adding New Music

To add new tracks:

1. **Add MP3 files** to appropriate folder:
   - `assets/music/breakbeat/` - For breakbeat tracks
   - `assets/music/for revenge/` - For For Revenge tracks  
   - `assets/music/Cigarettes After Sex/` - For CAS tracks

2. **Update music-list.js**:
   ```javascript
   // Add new track to MUSIC_LIST array
   {
       title: "New Song Title",
       artist: "Artist Name",
       album: "Album Name",
       genre: "Genre",
       category: "breakbeat", // or "for-revenge" or "cigarettes-after-sex"
       filename: "filename.mp3",
       file_path: "breakbeat/filename.mp3",
       duration: 180 // duration in seconds
   }
   ```

3. **Deploy**: Push to GitHub for auto-deploy

## 🔧 Configuration

Edit `config.js` to customize:

```javascript
const CONFIG = {
    APP_NAME: 'Mictify',
    VERSION: '1.0.0',
    VERCEL_URL: 'https://your-domain.vercel.app',
    FEATURES: {
        BACKGROUND_PLAYBACK: true,
        PWA_INSTALL: true,
        SEARCH: true,
        // ... more features
    }
};
```

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

**Made with ❤️ for music lovers**