/**
 * Mictify - Music Player
 * Clean and working implementation
 */

// Global state
let currentAudio = null;
let currentTrack = null;
let isPlaying = false;
let currentPlaylist = [];
let currentTrackIndex = -1;
let isShuffled = false;
let repeatMode = 'off'; // 'off', 'all', 'one'

// Initialize app
window.addEventListener('load', function() {
    console.log('🎵 Mictify starting...');
    
    if (!window.MUSIC_LIST || window.MUSIC_LIST.length === 0) {
        console.error('❌ No music data found');
        return;
    }
    
    console.log('✅ Music loaded:', window.MUSIC_LIST.length, 'tracks');
    initApp();
});

function initApp() {
    setupEventListeners();
    showHomePage();
    loadSavedSettings();
    console.log('🎉 Mictify ready!');
}

function setupEventListeners() {
    // Player controls
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const mobilePlay = document.getElementById('mobilePlay');
    
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (prevBtn) prevBtn.addEventListener('click', playPrevious);
    if (nextBtn) nextBtn.addEventListener('click', playNext);
    if (mobilePlay) mobilePlay.addEventListener('click', togglePlay);
    
    // Back button
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) backBtn.addEventListener('click', showHomePage);
    
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            handleSearch(e.target.value);
        });
    }
    
    // Progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.addEventListener('click', function(e) {
            if (!currentAudio) return;
            const rect = e.target.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            currentAudio.currentTime = percent * currentAudio.duration;
        });
    }
    
    // Volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function(e) {
            handleVolumeChange(e.target.value);
        });
    }
}

function loadSavedSettings() {
    // Load volume
    const savedVolume = localStorage.getItem('mictify_volume');
    if (savedVolume) {
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) volumeSlider.value = savedVolume;
    }
}

function showHomePage() {
    const categories = document.getElementById('playlist-categories');
    const detail = document.getElementById('playlist-detail');
    
    if (categories) categories.classList.remove('hidden');
    if (detail) detail.classList.add('hidden');
    
    updateSongCounts();
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        searchInput.placeholder = 'Search playlists...';
    }
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
    currentPlaylist = [...tracks]; // Copy array
    isShuffled = false;
    
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
    if (searchEl) {
        searchEl.value = '';
        searchEl.placeholder = 'Search in ' + playlistNames[category] + '...';
    }
    
    // Render tracks
    renderTracks(currentPlaylist);
}

function renderTracks(tracks) {
    const trackList = document.getElementById('trackList');
    if (!trackList) return;
    
    if (tracks.length === 0) {
        trackList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">No tracks found</div>';
        return;
    }
    
    trackList.innerHTML = tracks.map((track, index) => {
        const isCurrentTrack = currentTrack && currentTrack.filename === track.filename;
        return `
            <div class="track-item ${isCurrentTrack ? 'playing' : ''}" onclick="playTrack(${index})">
                <div class="track-number">${index + 1}</div>
                <div class="track-info">
                    <div class="track-title">${escapeHtml(track.title)}</div>
                    <div class="track-artist">${escapeHtml(track.artist)}</div>
                </div>
                <div class="track-duration">${formatTime(track.duration)}</div>
            </div>
        `;
    }).join('');
}

function playTrack(index) {
    if (!currentPlaylist || index < 0 || index >= currentPlaylist.length) {
        console.error('❌ Invalid track index:', index);
        return;
    }
    
    const track = currentPlaylist[index];
    currentTrackIndex = index;
    
    console.log('🎵 Playing:', track.title);
    
    // Stop current audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        currentAudio = null;
    }
    
    // Create new audio
    const audioUrl = 'assets/music/' + track.filename;
    currentAudio = new Audio(audioUrl);
    currentTrack = track;
    
    // Set volume
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        currentAudio.volume = volumeSlider.value / 100;
    } else {
        currentAudio.volume = 0.7;
    }
    
    // Audio events
    currentAudio.addEventListener('loadedmetadata', function() {
        updatePlayerDisplay();
    });
    
    currentAudio.addEventListener('timeupdate', function() {
        updateProgress();
    });
    
    currentAudio.addEventListener('ended', function() {
        handleTrackEnded();
    });
    
    currentAudio.addEventListener('error', function(e) {
        console.error('❌ Audio error:', audioUrl, e);
        alert('Cannot play: ' + track.title + '\nFile may be missing or corrupted.');
        playNext();
    });
    
    // Play
    currentAudio.play()
        .then(function() {
            isPlaying = true;
            updatePlayButtons();
            updateTrackList();
            updateMobilePlayer();
            setupMediaSession();
        })
        .catch(function(error) {
            console.error('❌ Play failed:', error);
            alert('Failed to play: ' + track.title);
        });
}

function togglePlay() {
    if (!currentAudio) {
        // No audio loaded, play first track
        if (currentPlaylist.length > 0) {
            playTrack(0);
        }
        return;
    }
    
    if (isPlaying) {
        currentAudio.pause();
        isPlaying = false;
    } else {
        currentAudio.play()
            .then(function() {
                isPlaying = true;
            })
            .catch(function(error) {
                console.error('❌ Play failed:', error);
            });
    }
    
    updatePlayButtons();
}

function playNext() {
    if (!currentPlaylist || currentPlaylist.length === 0) {
        console.error('❌ No playlist loaded');
        return;
    }
    
    if (repeatMode === 'one') {
        // Replay current track
        if (currentAudio) {
            currentAudio.currentTime = 0;
            currentAudio.play();
        }
        return;
    }
    
    if (currentTrackIndex < currentPlaylist.length - 1) {
        playTrack(currentTrackIndex + 1);
    } else {
        // End of playlist
        if (repeatMode === 'all') {
            playTrack(0); // Loop to first
        } else {
            playTrack(0); // Default: loop to first
        }
    }
}

function playPrevious() {
    if (!currentPlaylist || currentPlaylist.length === 0) {
        console.error('❌ No playlist loaded');
        return;
    }
    
    // If more than 3 seconds played, restart current track
    if (currentAudio && currentAudio.currentTime > 3) {
        currentAudio.currentTime = 0;
        return;
    }
    
    if (currentTrackIndex > 0) {
        playTrack(currentTrackIndex - 1);
    } else {
        playTrack(currentPlaylist.length - 1); // Loop to last
    }
}

function handleTrackEnded() {
    if (repeatMode === 'one') {
        // Replay current track
        currentAudio.currentTime = 0;
        currentAudio.play();
    } else {
        playNext();
    }
}

function updatePlayerDisplay() {
    if (!currentTrack) return;
    
    const titleEl = document.getElementById('currentTitle');
    const artistEl = document.getElementById('currentArtist');
    const totalTimeEl = document.getElementById('totalTime');
    
    if (titleEl) titleEl.textContent = currentTrack.title;
    if (artistEl) artistEl.textContent = currentTrack.artist;
    if (totalTimeEl && currentAudio) {
        totalTimeEl.textContent = formatTime(currentAudio.duration || currentTrack.duration);
    }
}

function updatePlayButtons() {
    const playIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
    const pauseIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>';
    
    const playBtn = document.getElementById('playBtn');
    const mobilePlay = document.getElementById('mobilePlay');
    
    const icon = isPlaying ? pauseIcon : playIcon;
    if (playBtn) playBtn.innerHTML = icon;
    if (mobilePlay) mobilePlay.innerHTML = icon;
}

function updateProgress() {
    if (!currentAudio || !currentAudio.duration) return;
    
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
    if (!currentPlaylist) return;
    
    if (!query || query.trim() === '') {
        renderTracks(currentPlaylist);
        return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    const filtered = currentPlaylist.filter(function(track) {
        return track.title.toLowerCase().includes(searchTerm) ||
               track.artist.toLowerCase().includes(searchTerm) ||
               track.album.toLowerCase().includes(searchTerm);
    });
    
    renderTracks(filtered);
}

function playPlaylist() {
    if (!currentPlaylist || currentPlaylist.length === 0) return;
    
    if (isPlaying && currentTrackIndex >= 0) {
        togglePlay();
    } else {
        playTrack(0);
    }
}

function shuffleAndPlay() {
    if (!currentPlaylist || currentPlaylist.length === 0) return;
    
    // Shuffle array using Fisher-Yates algorithm
    const shuffled = [...currentPlaylist];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    currentPlaylist = shuffled;
    isShuffled = true;
    renderTracks(currentPlaylist);
    playTrack(0);
    
    console.log('🔀 Playlist shuffled');
}

function handleVolumeChange(value) {
    if (currentAudio) {
        currentAudio.volume = value / 100;
    }
    localStorage.setItem('mictify_volume', value);
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupMediaSession() {
    if (!('mediaSession' in navigator) || !currentTrack) return;
    
    navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'Mictify'
    });
    
    navigator.mediaSession.setActionHandler('play', function() {
        if (currentAudio) currentAudio.play();
    });
    
    navigator.mediaSession.setActionHandler('pause', function() {
        if (currentAudio) currentAudio.pause();
    });
    
    navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
    navigator.mediaSession.setActionHandler('nexttrack', playNext);
}

// Export global functions
window.openPlaylist = openPlaylist;
window.playTrack = playTrack;
window.playPlaylist = playPlaylist;
window.shuffleAndPlay = shuffleAndPlay;
window.handleVolumeChange = handleVolumeChange;
