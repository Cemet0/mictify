# Breakbeat Music Streaming

Aplikasi streaming musik breakbeat, DJ, dan remix berbasis web yang dibangun dengan vanilla JavaScript, HTML5, dan CSS3.

## 🎵 Fitur Utama

- **Load File Lokal**: Musik dimuat dari folder assets/music
- **Audio Player**: Kontrol lengkap dengan queue management
- **Playlist Management**: Buat dan kelola playlist musik
- **Search & Filter**: Cari berdasarkan judul, artis, genre, BPM
- **Responsive Design**: Optimal untuk desktop dan mobile
- **Offline Storage**: Data tersimpan di browser localStorage

## 🚀 Quick Start

### Cara Pakai (Tanpa Install Apapun)

1. **Download** semua file project
2. **Tambahkan file musik** ke folder `assets/music/`
3. **Update daftar musik** di file `assets/music/music-list.js`
4. **Buka `index.html`** langsung di browser
5. **Mulai streaming!** 🎵

## 📁 Cara Menambah Musik

### 1. Copy File Musik
Tambahkan file musik (.mp3, .wav, .m4a) ke folder:
```
assets/music/
├── your-song-1.mp3
├── your-song-2.wav
├── your-song-3.m4a
└── music-list.js
```

### 2. Update music-list.js
Edit file `assets/music/music-list.js` dan tambahkan entry baru:

```javascript
window.MUSIC_LIST = [
    {
        filename: 'your-song-1.mp3',     // Nama file di folder assets/music/
        title: 'Judul Lagu',            // Judul yang ditampilkan
        artist: 'Nama Artis',           // Nama artis/DJ
        album: 'Nama Album',            // Album (opsional)
        genre: 'Breakbeat',             // Genre musik
        bpm: 140,                       // BPM (beats per minute)
        key: 'Am'                       // Key musik (opsional)
    },
    // Tambahkan lagu lain di sini...
];
```

### 3. Refresh Browser
Setelah menambah file dan update music-list.js, refresh halaman untuk melihat musik baru.

## 📁 Struktur Project

```
breakbeat-music-streaming/
├── index.html              # Main HTML file - BUKA INI!
├── css/                    # Stylesheets
│   ├── reset.css          # CSS reset
│   ├── variables.css      # CSS custom properties
│   ├── main.css           # Main styles
│   └── responsive.css     # Responsive styles
├── src/                   # JavaScript
│   └── main.js           # All application code
├── assets/               # Static assets
│   └── music/           # FOLDER MUSIK - TARUH FILE MUSIK DI SINI
│       ├── music-list.js # Daftar musik - EDIT FILE INI
│       └── *.mp3        # File musik kamu
└── README.md            # Documentation
```

## 🎯 Cara Penggunaan

### 1. Library
- Semua musik dari folder `assets/music/` akan muncul di Library
- Klik track untuk memutar
- Gunakan search dan filter untuk mencari musik

### 2. Audio Player
- Kontrol play/pause/stop/next/previous
- Atur volume dengan slider
- Klik progress bar untuk seek
- Auto-play next track dalam queue

### 3. Queue
- Track yang diputar otomatis masuk queue
- Lihat urutan pemutaran di tab Queue
- Hapus track dari queue atau clear semua

### 4. Playlist
- Buat playlist baru dengan tombol "Buat Playlist"
- Tambahkan track ke playlist dengan tombol ➕
- Kelola playlist di tab Playlists

### 5. Search & Filter
- **Search**: Cari berdasarkan judul, artis, atau album
- **Genre Filter**: Filter berdasarkan genre musik
- **BPM Filter**: Filter berdasarkan rentang BPM untuk DJ mixing

## 📱 Mobile Support

Aplikasi fully responsive dengan fitur:
- Touch-friendly controls
- Hamburger menu navigation
- Optimized player layout
- Mobile-friendly interface

## 🎨 Theming

Aplikasi menggunakan dark theme yang cocok untuk DJ. Edit `css/variables.css` untuk customization:

```css
:root {
    --accent-primary: #ff6b35;    /* Warna utama */
    --bg-primary: #0a0a0a;        /* Background */
    --text-primary: #ffffff;      /* Text color */
}
```

## 🔒 Privacy & Security

- **No Backend**: Semua data tersimpan lokal di browser
- **No Upload**: File musik dimuat langsung dari folder lokal
- **No Tracking**: Tidak ada analytics atau tracking
- **Offline First**: Bekerja tanpa koneksi internet

## 🐛 Troubleshooting

### Musik Tidak Muncul
- Pastikan file musik ada di folder `assets/music/`
- Check file `music-list.js` sudah diupdate dengan benar
- Pastikan nama file di `music-list.js` sama dengan file asli
- Refresh browser setelah menambah musik

### Audio Tidak Bisa Diputar
- Check format file didukung (MP3, WAV, M4A)
- Pastikan path file benar di `music-list.js`
- Coba buka Developer Tools (F12) untuk lihat error

### Data Playlist Hilang
- Data tersimpan di localStorage browser
- Clearing browser data akan menghapus playlist
- Gunakan browser yang sama untuk akses data

## 🚧 Coming Soon

- [ ] BPM Detection otomatis
- [ ] Crossfade functionality
- [ ] Waveform visualization
- [ ] Keyboard shortcuts
- [ ] Export/Import playlist
- [ ] Advanced search filters

## 📄 License

MIT License - bebas digunakan dan dimodifikasi.

---

**Breakbeat Music Streaming** - Built with ❤️ for DJs and music lovers

## 🎵 Cara Mulai:
1. **Tambahkan file musik** ke `assets/music/`
2. **Edit `music-list.js`** dengan info lagu
3. **Buka `index.html`** di browser!