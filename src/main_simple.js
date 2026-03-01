/**
 * Mictify - Simple Music Player
 * Clean implementation
 */

// Global state
let currentAudio = null;
let currentTrack = null;
let isPlaying = false;
let currentPlaylist = [];
let currentTrackIndex = -1;
let originalPlaylist = []; // Store original order before shuffle
let isShuffled = false;
let repeatMode = 'off'; // 'off', 'all', 'one'

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
    setupEventListeners();
    console.log('🎉 Mictify ready!');
}

function setupEventListeners() {
    // Desktop player controls
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (prevBtn) prevBtn.addEventListener('click', playPrevious);
    if (nextBtn) nextBtn.addEventListener('click', playNext);
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleAndPlay);
    if (repeatBtn) repeatBtn.addEventListener('click', toggleRepeat);
    
    // Mobile player controls
    const mobilePlay = document.getElementById('mobilePlay');
    const mobilePrev = document.getElementById('mobilePrev');
    const mobileNext = document.getElementById('mobileNext');
    
    if (mobilePlay) mobilePlay.addEventListener('click', togglePlay);
    if (mobilePrev) mobilePrev.addEventListener('click', playPrevious);
    if (mobileNext) mobileNext.addEventListener('click', playNext);
    
    // Fullscreen player controls
    const fullscreenPlayBtn = document.getElementById('fullscreenPlayBtn');
    const fullscreenPrev = document.getElementById('fullscreenPrev');
    const fullscreenNext = document.getElementById('fullscreenNext');
    const fullscreenShuffle = document.getElementById('fullscreenShuffle');
    const fullscreenRepeat = document.getElementById('fullscreenRepeat');
    
    if (fullscreenPlayBtn) fullscreenPlayBtn.addEventListener('click', togglePlay);
    if (fullscreenPrev) fullscreenPrev.addEventListener('click', playPrevious);
    if (fullscreenNext) fullscreenNext.addEventListener('click', playNext);
    if (fullscreenShuffle) fullscreenShuffle.addEventListener('click', shuffleAndPlay);
    if (fullscreenRepeat) fullscreenRepeat.addEventListener('click', toggleRepeat);
    
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
    
    // Progress bars
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.addEventListener('click', function(e) {
            if (!currentAudio) return;
            const rect = e.target.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            currentAudio.currentTime = percent * currentAudio.duration;
        });
    }
    
    const fullscreenProgressBar = document.getElementById('fullscreenProgressBar');
    if (fullscreenProgressBar) {
        fullscreenProgressBar.addEventListener('click', function(e) {
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

function showHomePage() {
    const categories = document.getElementById('playlist-categories');
    const detail = document.getElementById('playlist-detail');
    
    if (categories) categories.classList.remove('hidden');
    if (detail) detail.classList.add('hidden');
    
    updateSongCounts();
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
    
    if (titleEl) titleEl.textContent = playlistNames[category];
    if (subtitleEl) subtitleEl.textContent = tracks.length + ' songs';
    if (imageEl) imageEl.src = coverImages[category];
    
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
            </div>
        `;
    }).join('');
}

function playTrack(index) {
    if (!currentPlaylist || index < 0 || index >= currentPlaylist.length) {
        console.error('❌ Invalid track index');
        return;
    }
    
    const track = currentPlaylist[index];
    currentTrackIndex = index;
    
    console.log('🎵 Playing:', track.title);
    
    // Stop current audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    // Create audio URL - encode properly for special characters
    const audioPath = 'assets/music/' + track.filename;
    console.log('🔊 Loading:', audioPath);
    
    currentAudio = new Audio(audioPath);
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
        console.error('❌ Audio error:', e);
        console.error('❌ Failed to load:', audioPath);
        alert('Cannot play: ' + track.title + '\n\nFile path: ' + track.filename);
    };
    
    // Play
    currentAudio.play().then(function() {
        isPlaying = true;
        updatePlayButtons();
        updateTrackList();
        updateMobilePlayer();
        console.log('✅ Playing:', track.title);
    }).catch(function(error) {
        console.error('❌ Play failed:', error);
        alert('Failed to play: ' + track.title);
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
    if (!currentPlaylist || currentPlaylist.length === 0) return;
    
    if (repeatMode === 'one') {
        if (currentAudio) {
            currentAudio.currentTime = 0;
            currentAudio.play();
        }
        return;
    }
    
    if (currentTrackIndex < currentPlaylist.length - 1) {
        playTrack(currentTrackIndex + 1);
    } else {
        playTrack(0); // Loop to first
    }
}

function playPrevious() {
    if (!currentPlaylist || currentPlaylist.length === 0) return;
    
    if (currentTrackIndex > 0) {
        playTrack(currentTrackIndex - 1);
    } else {
        playTrack(currentPlaylist.length - 1); // Loop to last
    }
}

function shuffleAndPlay() {
    if (currentPlaylist.length === 0) return;
    
    if (!isShuffled) {
        // Save original order
        originalPlaylist = [...currentPlaylist];
        
        // Shuffle playlist
        const shuffled = [...currentPlaylist];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        currentPlaylist = shuffled;
        isShuffled = true;
        renderTracks(currentPlaylist);
        playTrack(0);
    } else {
        // Unshuffle - restore original order
        currentPlaylist = [...originalPlaylist];
        isShuffled = false;
        renderTracks(currentPlaylist);
    }
    
    updateShuffleButtons();
    console.log('🔀 Shuffle:', isShuffled ? 'ON' : 'OFF');
}

function updateShuffleButtons() {
    const shuffleBtn = document.getElementById('shuffleBtn');
    const fullscreenShuffle = document.getElementById('fullscreenShuffle');
    
    const buttons = [shuffleBtn, fullscreenShuffle].filter(btn => btn);
    
    buttons.forEach(btn => {
        if (isShuffled) {
            btn.classList.add('active');
            btn.style.color = '#1db954';
        } else {
            btn.classList.remove('active');
            btn.style.color = '';
        }
    });
}

function toggleRepeat() {
    if (repeatMode === 'off') {
        repeatMode = 'all';
    } else if (repeatMode === 'all') {
        repeatMode = 'one';
    } else {
        repeatMode = 'off';
    }
    
    updateRepeatButtons();
    console.log('🔁 Repeat:', repeatMode);
}

function updateRepeatButtons() {
    const repeatBtn = document.getElementById('repeatBtn');
    const fullscreenRepeat = document.getElementById('fullscreenRepeat');
    
    const buttons = [repeatBtn, fullscreenRepeat].filter(btn => btn);
    
    buttons.forEach(btn => {
        btn.classList.remove('active', 'repeat-one');
        btn.style.color = '';
        
        if (repeatMode === 'all') {
            btn.classList.add('active');
            btn.style.color = '#1db954';
        } else if (repeatMode === 'one') {
            btn.classList.add('active', 'repeat-one');
            btn.style.color = '#1db954';
            // Add "1" indicator for repeat one
            btn.style.position = 'relative';
        }
    });
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

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function handleVolumeChange(value) {
    if (currentAudio) {
        currentAudio.volume = value / 100;
    }
}

function openFullscreenPlayer() {
    const fullscreenPlayer = document.getElementById('fullscreenPlayer');
    if (fullscreenPlayer) {
        fullscreenPlayer.classList.add('active');
    }
}

function closeFullscreenPlayer() {
    const fullscreenPlayer = document.getElementById('fullscreenPlayer');
    if (fullscreenPlayer) {
        fullscreenPlayer.classList.remove('active');
    }
}

// Export global functions
window.openPlaylist = openPlaylist;
window.playTrack = playTrack;
window.playPlaylist = playPlaylist;
window.shuffleAndPlay = shuffleAndPlay;
window.handleVolumeChange = handleVolumeChange;
window.openFullscreenPlayer = openFullscreenPlayer;
window.closeFullscreenPlayer = closeFullscreenPlayer;
window.backToPlaylists = showHomePage;
