/**
 * Mictify - Simple Music Player
 * Fokus pada fungsi yang bekerja
 */

// Global variables
let currentAudio = null;
let currentTrack = null;
let isPlaying = false;
let currentPlaylist = [];
let currentTrackIndex = -1;

// Initialize when page loads
window.addEventListener('load', function() {
    console.log('🎵 Mictify starting...');
    
    if (window.MUSIC_LIST) {
        console.log('✅ Music loaded:', window.MUSIC_LIST.length, 'tracks');
        initApp();
    } else {
        console.error('❌ No music data found');
    }
});

function initApp() {
    showHomePage();
    setupControls();
    console.log('🎉 Mictify ready!');
}

function setupControls() {
    // Player controls
    const playBtn = document.getElementById('playBtn');
    if (playBtn) playBtn.onclick = togglePlay;
    
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) prevBtn.onclick = playPrevious;
    
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) nextBtn.onclick = playNext;
    
    // Mobile controls
    const mobilePlay = document.getElementById('mobilePlay');
    if (mobilePlay) mobilePlay.onclick = togglePlay;
    
    // Back button
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) backBtn.onclick = showHomePage;
    
    // Admin button - add both click and touch events for mobile
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.onclick = showAdminLogin;
        adminBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            showAdminLogin();
        });
    }
    
    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.onsubmit = handleAdminLogin;
    }
    
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.oninput = function(e) {
            handleSearch(e.target.value);
        };
    }
    
    // Progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.onclick = function(e) {
            if (currentAudio) {
                const rect = e.target.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                currentAudio.currentTime = percent * currentAudio.duration;
            }
        };
    }
}

function showHomePage() {
    const categories = document.getElementById('playlist-categories');
    const detail = document.getElementById('playlist-detail');
    
    if (categories) categories.classList.remove('hidden');
    if (detail) detail.classList.add('hidden');
    
    updateSongCounts();
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = 'Search playlists...';
}

function updateSongCounts() {
    const breakbeatCount = window.MUSIC_LIST.filter(t => t.category === 'breakbeat').length;
    const revengeCount = window.MUSIC_LIST.filter(t => t.category === 'for-revenge').length;
    const casCount = window.MUSIC_LIST.filter(t => t.category === 'cigarettes-after-sex').length;
    
    const breakbeatEl = document.getElementById('breakbeatCount');
    const revengeEl = document.getElementById('for-revengeCount');
    const casEl = document.getElementById('cigarettes-after-sexCount');
    
    if (breakbeatEl) breakbeatEl.textContent = breakbeatCount;
    if (revengeEl) revengeEl.textContent = revengeCount;
    if (casEl) casEl.textContent = casCount;
}

function openPlaylist(category) {
    console.log('📂 Opening playlist:', category);
    
    // Get tracks for this category
    const tracks = window.MUSIC_LIST.filter(track => track.category === category);
    currentPlaylist = tracks;
    
    // Show playlist detail
    const categories = document.getElementById('playlist-categories');
    const detail = document.getElementById('playlist-detail');
    
    if (categories) categories.classList.add('hidden');
    if (detail) detail.classList.remove('hidden');
    
    // Update playlist info
    const playlistNames = {
        'breakbeat': 'Breakbeat',
        'for-revenge': 'For Revenge',
        'cigarettes-after-sex': 'Cigarettes After Sex'
    };
    
    const coverImages = {
        'breakbeat': 'assets/img/breakbeatProfil.jpg',
        'for-revenge': 'assets/img/profilRevenge.jpg',
        'cigarettes-after-sex': 'assets/img/casProfile.jpg'
    };
    
    const titleEl = document.getElementById('currentPlaylistTitle');
    const subtitleEl = document.getElementById('currentPlaylistSubtitle');
    const imageEl = document.getElementById('currentPlaylistImage');
    const searchEl = document.getElementById('searchInput');
    
    if (titleEl) titleEl.textContent = playlistNames[category];
    if (subtitleEl) subtitleEl.textContent = tracks.length + ' songs';
    if (imageEl) imageEl.src = coverImages[category];
    if (searchEl) searchEl.placeholder = 'Search in ' + playlistNames[category] + '...';
    
    // Render tracks
    renderTracks(tracks);
}

function renderTracks(tracks) {
    const trackList = document.getElementById('trackList');
    if (!trackList) return;
    
    trackList.innerHTML = tracks.map((track, index) => {
        const isPlaying = currentTrack && currentTrack.filename === track.filename;
        return `
            <div class="track-item ${isPlaying ? 'playing' : ''}" onclick="playTrack(${index})">
                <div class="track-number">${index + 1}</div>
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div class="track-duration">${formatTime(track.duration)}</div>
                <div class="track-actions">
                    <button class="track-action-btn" onclick="event.stopPropagation(); playTrack(${index})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M8 5v14l11-7z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function playTrack(index) {
    if (!currentPlaylist || index < 0 || index >= currentPlaylist.length) {
        console.error('❌ Invalid track index:', index, 'Playlist length:', currentPlaylist ? currentPlaylist.length : 'null');
        return;
    }
    
    const track = currentPlaylist[index];
    currentTrackIndex = index;
    
    console.log('🎵 Playing track:', {
        index: index,
        title: track.title,
        filename: track.filename,
        playlistLength: currentPlaylist.length
    });
    
    // Stop current audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    // Create new audio
    const audioUrl = 'assets/music/' + track.filename;
    console.log('🔊 Audio URL:', audioUrl);
    
    currentAudio = new Audio(audioUrl);
    currentTrack = track;
    
    // Set volume
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        currentAudio.volume = volumeSlider.value / 100;
    }
    
    // Audio events
    currentAudio.onloadedmetadata = function() {
        updatePlayerDisplay();
    };
    
    currentAudio.ontimeupdate = function() {
        updateProgress();
    };
    
    currentAudio.onended = function() {
        playNext();
    };
    
    currentAudio.onerror = function(e) {
        console.error('❌ Audio error for:', audioUrl, e);
        alert('❌ Tidak dapat memutar: ' + track.title + '\nFile mungkin tidak ditemukan atau rusak.');
        setTimeout(playNext, 1000);
    };
    
    // Play
    currentAudio.play().then(function() {
        isPlaying = true;
        updatePlayButtons();
        updateTrackList();
        updateMobilePlayer();
        console.log('✅ Playing:', track.title);
    }).catch(function(error) {
        console.error('❌ Play failed for:', track.title, error);
        alert('❌ Gagal memutar: ' + track.title);
        setTimeout(playNext, 1000);
    });
}

function togglePlay() {
    if (!currentAudio) {
        if (currentPlaylist.length > 0) {
            playTrack(0);
        }
        return;
    }
    
    if (isPlaying) {
        currentAudio.pause();
        isPlaying = false;
    } else {
        currentAudio.play().then(function() {
            isPlaying = true;
        });
    }
    
    updatePlayButtons();
}

function playNext() {
    if (currentTrackIndex < currentPlaylist.length - 1) {
        playTrack(currentTrackIndex + 1);
    } else {
        playTrack(0); // Loop to first track
    }
}

function playPrevious() {
    if (currentTrackIndex > 0) {
        playTrack(currentTrackIndex - 1);
    } else {
        playTrack(currentPlaylist.length - 1); // Loop to last track
    }
}

function updatePlayerDisplay() {
    if (!currentTrack) return;
    
    const titleEl = document.getElementById('currentTitle');
    const artistEl = document.getElementById('currentArtist');
    const totalTimeEl = document.getElementById('totalTime');
    
    if (titleEl) titleEl.textContent = currentTrack.title;
    if (artistEl) artistEl.textContent = currentTrack.artist;
    if (totalTimeEl) totalTimeEl.textContent = formatTime(currentTrack.duration);
}

function updatePlayButtons() {
    const playIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
    const pauseIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>';
    
    const playBtn = document.getElementById('playBtn');
    const mobilePlay = document.getElementById('mobilePlay');
    
    if (playBtn) playBtn.innerHTML = isPlaying ? pauseIcon : playIcon;
    if (mobilePlay) mobilePlay.innerHTML = isPlaying ? pauseIcon : playIcon;
}

function updateProgress() {
    if (!currentAudio) return;
    
    const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    
    if (progressFill) progressFill.style.width = progress + '%';
    if (currentTimeEl) currentTimeEl.textContent = formatTime(currentAudio.currentTime);
}

function updateTrackList() {
    const trackItems = document.querySelectorAll('.track-item');
    trackItems.forEach(function(item, index) {
        if (index === currentTrackIndex) {
            item.classList.add('playing');
        } else {
            item.classList.remove('playing');
        }
    });
}

function updateMobilePlayer() {
    const mobilePlayer = document.getElementById('mobilePlayer');
    const mobileTitle = document.getElementById('mobileTitle');
    const mobileArtist = document.getElementById('mobileArtist');
    
    if (currentTrack) {
        if (mobilePlayer) mobilePlayer.style.display = 'flex';
        if (mobileTitle) mobileTitle.textContent = currentTrack.title;
        if (mobileArtist) mobileArtist.textContent = currentTrack.artist;
    } else {
        if (mobilePlayer) mobilePlayer.style.display = 'none';
    }
}

function handleSearch(query) {
    if (!query) {
        renderTracks(currentPlaylist);
        return;
    }
    
    const filtered = currentPlaylist.filter(function(track) {
        return track.title.toLowerCase().includes(query.toLowerCase()) ||
               track.artist.toLowerCase().includes(query.toLowerCase());
    });
    
    renderTracks(filtered);
}

function playPlaylist() {
    if (currentPlaylist.length === 0) return;
    
    if (isPlaying && currentTrackIndex >= 0) {
        togglePlay();
    } else {
        playTrack(0);
    }
}

function shuffleAndPlay() {
    if (currentPlaylist.length === 0) return;
    playTrack(0);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// Volume control
function handleVolumeChange(value) {
    if (currentAudio) {
        currentAudio.volume = value / 100;
    }
    localStorage.setItem('mictify_volume', value);
}

// Export global functions
window.openPlaylist = openPlaylist;
window.playTrack = playTrack;
window.playPlaylist = playPlaylist;
window.shuffleAndPlay = shuffleAndPlay;
window.handleVolumeChange = handleVolumeChange;

// Admin functions
function showAdminLogin() {
    document.getElementById('adminLoginModal').style.display = 'flex';
    // Jangan auto-fill, biarkan kosong
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
}

function hideAdminLogin() {
    document.getElementById('adminLoginModal').style.display = 'none';
    document.getElementById('adminLoginForm').reset();
    document.getElementById('adminLoginError').style.display = 'none';
}

async function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const loginBtn = document.getElementById('adminLoginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');
    const errorDiv = document.getElementById('adminLoginError');
    
    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'block';
    loginBtn.disabled = true;
    errorDiv.style.display = 'none';
    
    try {
        const response = await fetch(`${window.CONFIG.API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('mictify_admin_token', data.token);
            hideAdminLogin();
            showAdminPanel();
        } else {
            showAdminError(data.message || 'Login gagal');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAdminError('Koneksi gagal. Pastikan backend server berjalan.');
    } finally {
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        loginBtn.disabled = false;
    }
}

function showAdminError(message) {
    const errorDiv = document.getElementById('adminLoginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function showAdminPanel() {
    // Hide main content
    document.getElementById('main-content').style.display = 'none';
    
    // Show admin panel
    document.getElementById('admin-panel').style.display = 'block';
    
    // Change admin button to logout
    const adminBtn = document.getElementById('adminBtn');
    adminBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Logout
    `;
    adminBtn.onclick = logoutAdmin;
    
    // Setup upload button event listener
    const uploadBtn = document.querySelector('button[onclick="toggleUploadSection()"]');
    if (uploadBtn) {
        console.log('✅ Upload button found and ready');
    } else {
        console.error('❌ Upload button not found');
    }
    
    // Load admin data
    loadAdminMusic();
}

function logoutAdmin() {
    localStorage.removeItem('mictify_admin_token');
    
    // Show main content
    document.getElementById('main-content').style.display = 'block';
    
    // Hide admin panel
    document.getElementById('admin-panel').style.display = 'none';
    
    // Reset admin button
    const adminBtn = document.getElementById('adminBtn');
    adminBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Admin
    `;
    adminBtn.onclick = showAdminLogin;
}

async function loadAdminMusic() {
    const table = document.getElementById('adminMusicTable');
    if (!table) return;
    
    table.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: white;">Loading...</td></tr>';

    try {
        const token = localStorage.getItem('mictify_admin_token');
        const response = await fetch(`${window.CONFIG.API_BASE_URL}/music`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            updateAdminStats(data.data);
            renderAdminTable(data.data);
        } else {
            table.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #e74c3c; padding: 20px;">Failed to load music</td></tr>';
        }
    } catch (error) {
        table.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #e74c3c; padding: 20px;">Connection error</td></tr>';
    }
}

function updateAdminStats(musicData) {
    const totalEl = document.getElementById('adminTotalTracks');
    const breakbeatEl = document.getElementById('adminBreakbeatCount');
    const revengeEl = document.getElementById('adminRevengeCount');
    const casEl = document.getElementById('adminCasCount');
    
    if (totalEl) totalEl.textContent = musicData.length;
    if (breakbeatEl) breakbeatEl.textContent = musicData.filter(m => m.category === 'breakbeat').length;
    if (revengeEl) revengeEl.textContent = musicData.filter(m => m.category === 'for-revenge').length;
    if (casEl) casEl.textContent = musicData.filter(m => m.category === 'cigarettes-after-sex').length;
}

function renderAdminTable(musicData) {
    const table = document.getElementById('adminMusicTable');
    if (!table) return;
    
    if (musicData.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: white;">No music found</td></tr>';
        return;
    }

    table.innerHTML = musicData.map(track => `
        <tr>
            <td style="color: white;">${track.title}</td>
            <td style="color: white;">${track.artist}</td>
            <td style="color: white;">
                <span class="category-badge category-${track.category}">
                    ${getCategoryDisplayName(track.category)}
                </span>
            </td>
            <td style="color: white;">${formatTime(track.duration)}</td>
            <td>
                <button class="btn-delete" onclick="deleteAdminTrack(${track.id}, '${track.title.replace(/'/g, "\\'")}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function getCategoryDisplayName(category) {
    const names = {
        'breakbeat': 'Breakbeat',
        'for-revenge': 'For Revenge',
        'cigarettes-after-sex': 'Cigarettes After Sex'
    };
    return names[category] || category;
}

async function deleteAdminTrack(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;

    try {
        const token = localStorage.getItem('mictify_admin_token');
        const response = await fetch(`${window.CONFIG.API_BASE_URL}/music/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            alert('Track deleted successfully!');
            loadAdminMusic();
        } else {
            alert('Delete failed: ' + data.message);
        }
    } catch (error) {
        alert('Delete error: ' + error.message);
    }
}

async function generateAdminMusicList() {
    try {
        const token = localStorage.getItem('mictify_admin_token');
        const response = await fetch(`${window.CONFIG.API_BASE_URL}/music/generate-list`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        
        if (data.success) {
            alert('✅ music-list.js berhasil di-generate!');
            
            // Reload music-list.js untuk update frontend
            await reloadMusicList();
            
            // Update song counts di home page
            updateSongCounts();
            
        } else {
            alert('❌ Generate gagal: ' + data.message);
        }
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}

function toggleUploadSection() {
    const uploadSection = document.getElementById('adminUploadSection');
    console.log('🔧 Toggle upload section, current display:', uploadSection ? uploadSection.style.display : 'element not found');
    
    if (uploadSection) {
        if (uploadSection.style.display === 'none' || uploadSection.style.display === '') {
            uploadSection.style.display = 'block';
            console.log('✅ Upload section shown');
        } else {
            uploadSection.style.display = 'none';
            console.log('✅ Upload section hidden');
        }
    } else {
        console.error('❌ Upload section element not found');
    }
}

async function uploadAdminMusic() {
    const file = document.getElementById('adminMusicFile').files[0];
    const title = document.getElementById('adminTitle').value.trim();
    const artist = document.getElementById('adminArtist').value.trim();
    const album = document.getElementById('adminAlbum').value.trim();
    const category = document.getElementById('adminCategory').value;

    // Validation
    if (!file) {
        alert('❌ Pilih file MP3 terlebih dahulu');
        return;
    }
    
    if (!title) {
        alert('❌ Masukkan judul lagu');
        return;
    }
    
    if (!artist) {
        alert('❌ Masukkan nama artis');
        return;
    }
    
    if (!category) {
        alert('❌ Pilih kategori');
        return;
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith('.mp3')) {
        alert('❌ Hanya file MP3 yang diizinkan');
        return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
        alert('❌ File terlalu besar. Maksimal 50MB');
        return;
    }

    console.log('🎵 Starting upload:', { title, artist, album, category, fileName: file.name, fileSize: file.size });

    const formData = new FormData();
    formData.append('musicFile', file);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('album', album || '');
    formData.append('genre', category === 'breakbeat' ? 'Breakbeat' : category === 'for-revenge' ? 'Alternative Rock' : 'Dream Pop');
    formData.append('category', category);

    // Show loading state
    const uploadBtn = document.querySelector('button[onclick="uploadAdminMusic()"]');
    const originalText = uploadBtn.innerHTML;
    uploadBtn.innerHTML = '⏳ Uploading...';
    uploadBtn.disabled = true;

    try {
        const token = localStorage.getItem('mictify_admin_token');
        
        if (!token) {
            alert('❌ Silakan login ulang');
            return;
        }

        console.log('📡 Sending upload request to:', 'http://127.0.0.1:3001/api/music/upload');
        
        // Test server connection first
        const healthResponse = await fetch(`${window.CONFIG.API_BASE_URL.replace('/api', '')}/api/health`);
        if (!healthResponse.ok) {
            throw new Error('Server tidak dapat diakses');
        }
        
        const response = await fetch(`${window.CONFIG.API_BASE_URL}/music/upload`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`
                // Don't set Content-Type for FormData, let browser set it
            },
            body: formData
        });

        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Response error:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📡 Response data:', data);

        if (data.success) {
            alert('✅ Upload berhasil!');
            
            // Clear form
            document.getElementById('adminMusicFile').value = '';
            document.getElementById('adminTitle').value = '';
            document.getElementById('adminArtist').value = '';
            document.getElementById('adminAlbum').value = '';
            document.getElementById('adminCategory').value = '';
            
            // Hide upload section
            toggleUploadSection();
            
            // Reload music data
            loadAdminMusic();
            
            // Auto-generate music-list.js untuk update frontend
            console.log('🔄 Auto-generating music-list.js...');
            try {
                const token = localStorage.getItem('mictify_admin_token');
                const genResponse = await fetch(`${window.CONFIG.API_BASE_URL}/music/generate-list`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const genData = await genResponse.json();
                
                if (genData.success) {
                    console.log('✅ music-list.js generated');
                    await reloadMusicList();
                    console.log('✅ Frontend updated with new track');
                } else {
                    console.error('❌ Generate failed:', genData.message);
                }
            } catch (genError) {
                console.error('❌ Generate error:', genError);
            }
            
        } else {
            alert('❌ Upload gagal: ' + (data.message || 'Error tidak diketahui'));
        }
    } catch (error) {
        console.error('❌ Upload error:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            alert('❌ Tidak dapat terhubung ke server. Pastikan backend berjalan di port 3001');
        } else {
            alert('❌ Upload error: ' + error.message);
        }
    } finally {
        // Reset button
        uploadBtn.innerHTML = originalText;
        uploadBtn.disabled = false;
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('adminLoginModal');
    if (e.target === modal) {
        hideAdminLogin();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('adminLoginModal');
        if (modal && modal.style.display === 'flex') {
            hideAdminLogin();
        }
    }
});

// Reload music-list.js dynamically
function reloadMusicList() {
    return new Promise((resolve, reject) => {
        // Remove old script
        const oldScript = document.querySelector('script[src*="music-list.js"]');
        if (oldScript) {
            oldScript.remove();
        }
        
        // Add new script with cache busting
        const script = document.createElement('script');
        script.src = 'assets/music/music-list.js?v=' + Date.now();
        script.onload = function() {
            console.log('✅ music-list.js reloaded, total tracks:', window.MUSIC_LIST ? window.MUSIC_LIST.length : 0);
            resolve();
        };
        script.onerror = function() {
            console.error('❌ Failed to reload music-list.js');
            reject(new Error('Failed to reload music-list.js'));
        };
        document.head.appendChild(script);
    });
}

// Export global functions
window.openPlaylist = openPlaylist;
window.playTrack = playTrack;
window.playPlaylist = playPlaylist;
window.shuffleAndPlay = shuffleAndPlay;
window.handleVolumeChange = handleVolumeChange;
window.showAdminLogin = showAdminLogin;
window.loadAdminMusic = loadAdminMusic;
window.generateAdminMusicList = generateAdminMusicList;
window.toggleUploadSection = toggleUploadSection;
window.uploadAdminMusic = uploadAdminMusic;