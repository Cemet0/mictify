/**
 * Breakbeat Music Streaming App - Clean Version
 * Simple playlist-based music player with background playback support
 */

// Global app state
let currentAudio = null;
let currentTrack = null;
let isPlaying = false;
let currentPlaylist = [];
let currentTrackIndex = -1;
let isShuffleOn = false;
let repeatMode = 'off'; // 'off', 'all', 'one'
let originalPlaylist = []; // Store original order for shuffle
let deferredPrompt = null; // For PWA install prompt

// Settings keys for localStorage
const SETTINGS_KEYS = {
    VOLUME: 'mictify_volume',
    LAST_TRACK: 'mictify_last_track',
    LAST_PLAYLIST: 'mictify_last_playlist',
    SHUFFLE_STATE: 'mictify_shuffle',
    REPEAT_MODE: 'mictify_repeat'
};

/**
 * Initialize the app
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 Initializing Mictify App...');
    
    // Load music library
    loadMusicLibrary();
    
    // Load saved settings
    loadSavedSettings();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup audio player
    setupAudioPlayer();
    
    // Setup mobile player
    setupMobilePlayer();
    
    // Render playlist categories
    renderPlaylistCategories();
    
    // Try to restore last session
    restoreLastSession();
    
    // Setup PWA install prompt
    setupPWAInstall();
    
    console.log('✅ App initialized successfully');
});

/**
 * Load music library from music-list.js and get durations
 */
function loadMusicLibrary() {
    if (!window.MUSIC_LIST || !Array.isArray(window.MUSIC_LIST)) {
        console.error('❌ MUSIC_LIST not found. Check assets/music/music-list.js');
        return;
    }
    
    // Convert to track objects with IDs
    const tracks = window.MUSIC_LIST.map((item, index) => ({
        id: `track_${index}`,
        title: item.title,
        artist: item.artist,
        album: item.album || 'Unknown Album',
        genre: item.genre || 'Unknown',
        category: item.category || 'breakbeat',
        filename: item.filename,
        fileUrl: `assets/music/${item.filename}`,
        duration: 0 // Will be loaded when track is played
    }));
    
    // Save to localStorage
    localStorage.setItem('music_library', JSON.stringify(tracks));
    
    console.log(`📚 Loaded ${tracks.length} tracks`);
}

/**
 * Get music library from localStorage
 */
function getLibrary() {
    return JSON.parse(localStorage.getItem('music_library') || '[]');
}

/**
 * Setup mobile player
 */
function setupMobilePlayer() {
    const mobilePlay = document.getElementById('mobilePlay');
    const mobilePrev = document.getElementById('mobilePrev');
    const mobileNext = document.getElementById('mobileNext');
    
    if (mobilePlay) {
        mobilePlay.addEventListener('click', () => {
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
                currentAudio.play();
                isPlaying = true;
            }
            updatePlayButton();
            updateMobilePlayButton();
        });
    }
    
    if (mobilePrev) {
        mobilePrev.addEventListener('click', () => {
            playPrevious();
        });
    }
    
    if (mobileNext) {
        mobileNext.addEventListener('click', () => {
            playNext();
        });
    }
}

/**
 * Update mobile play button icon
 */
function updateMobilePlayButton() {
    const mobilePlay = document.getElementById('mobilePlay');
    if (mobilePlay) {
        const playIcon = mobilePlay.querySelector('.play-icon');
        const pauseIcon = mobilePlay.querySelector('.pause-icon');
        
        if (playIcon && pauseIcon) {
            if (isPlaying) {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } else {
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        }
    }
}

/**
 * Update mobile player UI
 */
function updateMobilePlayer(track) {
    const mobileTitle = document.getElementById('mobileTitle');
    const mobileArtist = document.getElementById('mobileArtist');
    
    if (mobileTitle && track) {
        mobileTitle.textContent = track.title;
    }
    
    if (mobileArtist && track) {
        mobileArtist.textContent = track.artist;
    }
    
    // Update play button icon
    updateMobilePlayButton();
}

/**
 * Get playlist categories
 */
function getPlaylistCategories() {
    const library = getLibrary();
    
    const categories = {
        breakbeat: {
            name: 'Breakbeat',
            icon: '🧘‍♀️💥',
            tracks: library.filter(track => track.category === 'breakbeat')
        },
        'for-revenge': {
            name: 'For Revenge',
            icon: '🔥⚡',
            tracks: library.filter(track => track.category === 'for-revenge')
        },
        'cigarettes-after-sex': {
            name: 'Cigarettes After Sex',
            icon: '🌙✨',
            tracks: library.filter(track => track.category === 'cigarettes-after-sex')
        }
    };
    
    return categories;
}

/**
 * Render playlist categories
 */
function renderPlaylistCategories() {
    const categories = getPlaylistCategories();
    
    // Update counts
    Object.keys(categories).forEach(key => {
        const countElement = document.getElementById(`${key}Count`);
        if (countElement) {
            countElement.textContent = categories[key].tracks.length;
        }
    });
    
    console.log('🎵 Playlist categories rendered');
}

/**
 * Open playlist detail view
 */
function openPlaylist(playlistType) {
    const categories = getPlaylistCategories();
    const category = categories[playlistType];
    
    if (!category) {
        console.error(`❌ Playlist ${playlistType} not found`);
        return;
    }
    
    // Update current playlist
    currentPlaylist = [...category.tracks]; // Create copy
    originalPlaylist = [...category.tracks]; // Store original order
    
    // Reset track index when switching playlists
    currentTrackIndex = -1;
    
    // Apply shuffle if it's on
    if (isShuffleOn) {
        shufflePlaylist();
    }
    
    // Hide categories, show detail
    document.getElementById('playlist-categories').classList.add('hidden');
    document.getElementById('playlist-detail').classList.remove('hidden');
    
    // Update header with image
    const playlistImage = document.getElementById('currentPlaylistImage');
    if (playlistType === 'breakbeat') {
        playlistImage.src = 'assets/img/breakbeatProfil.jpg';
        playlistImage.alt = 'Breakbeat';
    } else if (playlistType === 'for-revenge') {
        playlistImage.src = 'assets/img/profilRevenge.jpg';
        playlistImage.alt = 'For Revenge';
    } else if (playlistType === 'cigarettes-after-sex') {
        playlistImage.src = 'assets/img/casProfile.jpg';
        playlistImage.alt = 'Cigarettes After Sex';
    }
    
    document.getElementById('currentPlaylistTitle').textContent = category.name;
    document.getElementById('currentPlaylistSubtitle').textContent = `${category.tracks.length} songs`;
    
    // Update search bar placeholder and functionality
    updateSearchForPlaylist(playlistType, category.name);
    
    // Render tracks
    renderTracks(currentPlaylist);
    
    // Update playlist action buttons (this will show correct play/pause icon)
    updatePlaylistActionButtons();
    
    console.log(`🎵 Opened playlist: ${category.name} (${category.tracks.length} tracks)`);
}

/**
 * Go back to playlist categories
 */
function backToPlaylists() {
    document.getElementById('playlist-detail').classList.add('hidden');
    document.getElementById('playlist-categories').classList.remove('hidden');
    
    // Reset search bar to default
    resetSearchToDefault();
}

/**
 * Render tracks in playlist detail
 */
function renderTracks(tracks) {
    const trackList = document.getElementById('trackList');
    
    if (tracks.length === 0) {
        trackList.innerHTML = '<div class="empty-state"><p>No tracks in this playlist</p></div>';
        return;
    }
    
    trackList.innerHTML = tracks.map((track, index) => `
        <div class="track-item" data-track-id="${track.id}" onclick="playTrack(${index})">
            <div class="track-number">${index + 1}</div>
            <div class="track-info">
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist}</div>
            </div>
            <div class="track-duration" id="duration-${track.id}">Loading...</div>
            <div class="track-actions">
                <button class="track-action-btn" onclick="event.stopPropagation(); playTrack(${index})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5v14l11-7z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    // Load durations for all tracks
    loadTrackDurations(tracks);
}

/**
 * Load durations for tracks
 */
async function loadTrackDurations(tracks) {
    console.log('🎵 Loading track durations...');
    
    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        
        try {
            if (track.duration > 0) {
                // Already have duration
                const durationElement = document.getElementById(`duration-${track.id}`);
                if (durationElement) {
                    durationElement.textContent = formatDuration(track.duration);
                }
            } else {
                // Show loading
                const durationElement = document.getElementById(`duration-${track.id}`);
                if (durationElement) {
                    durationElement.textContent = '...';
                }
                
                // Load duration
                const duration = await getTrackDuration(track.fileUrl);
                track.duration = duration;
                
                // Update UI
                if (durationElement) {
                    if (duration > 0) {
                        durationElement.textContent = formatDuration(duration);
                    } else {
                        durationElement.textContent = '--:--';
                    }
                }
                
                // Update in localStorage
                updateTrackDurationInLibrary(track.id, duration);
                
                console.log(`✅ Loaded duration for "${track.title}": ${formatDuration(duration)}`);
            }
        } catch (error) {
            console.error(`❌ Error loading duration for ${track.title}:`, error);
            const durationElement = document.getElementById(`duration-${track.id}`);
            if (durationElement) {
                durationElement.textContent = '--:--';
            }
        }
        
        // Small delay to prevent overwhelming the browser
        if (i < tracks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    console.log('✅ All track durations loaded');
}

/**
 * Update track duration in localStorage
 */
function updateTrackDurationInLibrary(trackId, duration) {
    const library = getLibrary();
    const track = library.find(t => t.id === trackId);
    if (track) {
        track.duration = duration;
        localStorage.setItem('music_library', JSON.stringify(library));
    }
}

/**
 * Play track by index
 */
function playTrack(index, resumeTime = 0) {
    if (!currentPlaylist || index < 0 || index >= currentPlaylist.length) {
        console.error('❌ Invalid track index');
        return;
    }
    
    const track = currentPlaylist[index];
    currentTrackIndex = index;
    
    // Stop current audio
    if (currentAudio) {
        currentAudio.pause();
    }
    
    // Create new audio
    currentAudio = new Audio(track.fileUrl);
    currentTrack = track;
    
    // Set volume
    const volume = document.getElementById('volumeSlider').value / 100;
    currentAudio.volume = volume;
    
    // Update UI
    updatePlayerUI(track);
    
    // Setup Media Session for background playback
    setupMediaSession(track);
    
    // Audio event listeners
    currentAudio.addEventListener('timeupdate', updateProgress);
    currentAudio.addEventListener('ended', playNext);
    currentAudio.addEventListener('loadedmetadata', () => {
        document.getElementById('totalTime').textContent = formatTime(currentAudio.duration);
        
        // Resume from specific time if provided
        if (resumeTime > 0) {
            currentAudio.currentTime = resumeTime;
            console.log(`⏯️ Resuming from ${formatTime(resumeTime)}`);
        }
        
        // Update track duration in library if not set
        if (track.duration === 0) {
            track.duration = currentAudio.duration;
            // Update in localStorage
            const library = getLibrary();
            const libraryTrack = library.find(t => t.id === track.id);
            if (libraryTrack) {
                libraryTrack.duration = currentAudio.duration;
                localStorage.setItem('music_library', JSON.stringify(library));
            }
        }
    });
    
    // Play audio
    currentAudio.play().then(() => {
        isPlaying = true;
        updatePlayButton();
        updateTrackListUI();
        
        // Save last played track
        saveLastTrack(track, getCurrentPlaylistType(), index, resumeTime);
        
        console.log(`🎵 Playing: ${track.title}`);
    }).catch(error => {
        console.error('❌ Error playing audio:', error);
        showNotification('Failed to play audio', 'error');
    });
}

/**
 * Setup Media Session API for background playback
 */
function setupMediaSession(track) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: track.artist,
            album: track.album,
            artwork: [
                { src: 'assets/favicon.ico', sizes: '96x96', type: 'image/x-icon' }
            ]
        });
        
        // Action handlers
        navigator.mediaSession.setActionHandler('play', () => {
            if (currentAudio && !isPlaying) {
                currentAudio.play();
                isPlaying = true;
                updatePlayButton();
            }
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
            if (currentAudio && isPlaying) {
                currentAudio.pause();
                isPlaying = false;
                updatePlayButton();
            }
        });
        
        navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
}

/**
 * Update player UI
 */
function updatePlayerUI(track) {
    // Update desktop player
    document.getElementById('currentTitle').textContent = track.title;
    document.getElementById('currentArtist').textContent = track.artist;
    
    // Update mobile player
    updateMobilePlayer(track);
    
    // Update fullscreen player if it's open
    if (document.getElementById('fullscreenPlayer').classList.contains('active')) {
        updateFullscreenPlayer();
    }
}

/**
 * Add marquee animation for long titles
 */
function addMarqueeAnimation() {
    const titleElements = document.querySelectorAll('#currentTitle');
    
    titleElements.forEach(titleElement => {
        if (!titleElement) return;
        
        // Check if we're on mobile
        if (window.innerWidth <= 768) {
            // Remove existing marquee class
            titleElement.classList.remove('marquee');
            
            // Force reflow to reset animation
            titleElement.offsetHeight;
            
            // Check if text overflows
            const containerWidth = titleElement.parentElement.offsetWidth;
            const textWidth = titleElement.scrollWidth;
            
            console.log('Container width:', containerWidth, 'Text width:', textWidth);
            
            if (textWidth > containerWidth) {
                // Add marquee animation for overflowing text
                titleElement.classList.add('marquee');
                console.log('Added marquee animation');
            }
        }
    });
}

/**
 * Update play button state
 */
function updatePlayButton() {
    // Update desktop play button
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    if (playIcon && pauseIcon) {
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
    
    // Update mobile play button
    const mobilePlayIcon = document.querySelector('#mobilePlayBtn .play-icon');
    const mobilePauseIcon = document.querySelector('#mobilePlayBtn .pause-icon');
    
    if (mobilePlayIcon && mobilePauseIcon) {
        if (isPlaying) {
            mobilePlayIcon.style.display = 'none';
            mobilePauseIcon.style.display = 'block';
        } else {
            mobilePlayIcon.style.display = 'block';
            mobilePauseIcon.style.display = 'none';
        }
    }
    
    // Update fullscreen play button
    updateFullscreenPlayButton();
    
    // Update playlist action buttons
    updatePlaylistActionButtons();
}

/**
 * Update track list UI to show currently playing
 */
function updateTrackListUI() {
    document.querySelectorAll('.track-item').forEach((item, index) => {
        if (index === currentTrackIndex) {
            item.classList.add('playing');
        } else {
            item.classList.remove('playing');
        }
    });
}

/**
 * Update progress bar
 */
function updateProgress() {
    if (!currentAudio) return;
    
    const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('currentTime').textContent = formatTime(currentAudio.currentTime);
    
    // Update fullscreen progress
    updateFullscreenProgress();
    
    // Save position every 5 seconds
    if (currentTrack && Math.floor(currentAudio.currentTime) % 5 === 0) {
        saveLastTrack(currentTrack, getCurrentPlaylistType(), currentTrackIndex, currentAudio.currentTime);
    }
    
    // Update Media Session position
    if ('mediaSession' in navigator && currentAudio.duration) {
        navigator.mediaSession.setPositionState({
            duration: currentAudio.duration,
            playbackRate: currentAudio.playbackRate,
            position: currentAudio.currentTime
        });
    }
}

/**
 * Play next track
 */
function playNext() {
    if (repeatMode === 'one') {
        // Repeat current track
        playTrack(currentTrackIndex);
        return;
    }
    
    if (currentTrackIndex < currentPlaylist.length - 1) {
        playTrack(currentTrackIndex + 1);
    } else {
        // End of playlist
        if (repeatMode === 'all') {
            // Loop back to first track
            playTrack(0);
        } else {
            // Stop playing
            isPlaying = false;
            updatePlayButton();
        }
    }
}

/**
 * Play previous track
 */
function playPrevious() {
    if (currentTrackIndex > 0) {
        playTrack(currentTrackIndex - 1);
    } else {
        if (repeatMode === 'all') {
            // Loop to last track
            playTrack(currentPlaylist.length - 1);
        }
    }
}

/**
 * Toggle shuffle mode
 */
function toggleShuffle() {
    isShuffleOn = !isShuffleOn;
    const shuffleBtn = document.getElementById('shuffleBtn');
    
    if (isShuffleOn) {
        shuffleBtn.classList.add('active');
        shufflePlaylist();
        console.log('🔀 Shuffle ON');
    } else {
        shuffleBtn.classList.remove('active');
        // Restore original order
        currentPlaylist = [...originalPlaylist];
        // Find current track in original playlist
        const currentTrack = currentPlaylist[currentTrackIndex];
        if (currentTrack) {
            currentTrackIndex = originalPlaylist.findIndex(track => track.id === currentTrack.id);
        }
        renderTracks(currentPlaylist);
        updateTrackListUI();
        console.log('🔀 Shuffle OFF');
    }
    
    // Update playlist action buttons
    updatePlaylistActionButtons();
    
    // Save shuffle state
    saveShuffle(isShuffleOn);
}

/**
 * Shuffle current playlist
 */
function shufflePlaylist() {
    if (currentPlaylist.length <= 1) return;
    
    // Fisher-Yates shuffle algorithm
    const shuffled = [...currentPlaylist];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // If currently playing, make sure current track stays at current position
    if (currentTrackIndex >= 0 && currentTrack) {
        const currentTrackInShuffled = shuffled.findIndex(track => track.id === currentTrack.id);
        if (currentTrackInShuffled !== -1 && currentTrackInShuffled !== currentTrackIndex) {
            // Swap current track to current position
            [shuffled[currentTrackIndex], shuffled[currentTrackInShuffled]] = 
            [shuffled[currentTrackInShuffled], shuffled[currentTrackIndex]];
        }
    }
    
    currentPlaylist = shuffled;
    renderTracks(currentPlaylist);
    updateTrackListUI();
}

/**
 * Toggle repeat mode
 */
function toggleRepeat() {
    switch (repeatMode) {
        case 'off':
            repeatMode = 'all';
            console.log('🔁 Repeat ALL');
            break;
        case 'all':
            repeatMode = 'one';
            console.log('🔂 Repeat ONE');
            break;
        case 'one':
            repeatMode = 'off';
            console.log('🔁 Repeat OFF');
            break;
    }
    
    // Update button visual
    updateRepeatButton();
    
    // Save repeat mode
    saveRepeatMode(repeatMode);
}

/**
 * Load saved settings from localStorage
 */
function loadSavedSettings() {
    // Load volume
    const savedVolume = localStorage.getItem(SETTINGS_KEYS.VOLUME);
    if (savedVolume !== null) {
        const volume = parseInt(savedVolume);
        document.getElementById('volumeSlider').value = volume;
        console.log(`🔊 Restored volume: ${volume}%`);
    }
    
    // Load shuffle state
    const savedShuffle = localStorage.getItem(SETTINGS_KEYS.SHUFFLE_STATE);
    if (savedShuffle === 'true') {
        isShuffleOn = true;
        document.getElementById('shuffleBtn').classList.add('active');
        console.log('🔀 Restored shuffle: ON');
    }
    
    // Load repeat mode
    const savedRepeat = localStorage.getItem(SETTINGS_KEYS.REPEAT_MODE);
    if (savedRepeat) {
        repeatMode = savedRepeat;
        updateRepeatButton();
        console.log(`🔁 Restored repeat: ${repeatMode.toUpperCase()}`);
    }
}

/**
 * Save volume setting
 */
function saveVolume(volume) {
    localStorage.setItem(SETTINGS_KEYS.VOLUME, volume.toString());
}

/**
 * Save last played track with position
 */
function saveLastTrack(track, playlistType, trackIndex, currentTime = 0) {
    const lastTrackData = {
        track: track,
        playlistType: playlistType,
        trackIndex: trackIndex,
        currentTime: currentTime,
        timestamp: Date.now()
    };
    localStorage.setItem(SETTINGS_KEYS.LAST_TRACK, JSON.stringify(lastTrackData));
}

/**
 * Save shuffle state
 */
function saveShuffle(isOn) {
    localStorage.setItem(SETTINGS_KEYS.SHUFFLE_STATE, isOn.toString());
}

/**
 * Save repeat mode
 */
function saveRepeatMode(mode) {
    localStorage.setItem(SETTINGS_KEYS.REPEAT_MODE, mode);
}

/**
 * Restore last session
 */
function restoreLastSession() {
    const lastTrackData = localStorage.getItem(SETTINGS_KEYS.LAST_TRACK);
    if (lastTrackData) {
        try {
            const data = JSON.parse(lastTrackData);
            // Only restore if it's recent (within 24 hours)
            const hoursSinceLastPlay = (Date.now() - data.timestamp) / (1000 * 60 * 60);
            
            if (hoursSinceLastPlay < 24) {
                console.log(`🎵 Restoring last session: ${data.track.title}`);
                
                // Restore track info in player
                updatePlayerUI(data.track);
                currentTrack = data.track;
                
                // Setup audio object but don't play
                currentAudio = new Audio(data.track.fileUrl);
                const volume = document.getElementById('volumeSlider').value / 100;
                currentAudio.volume = volume;
                
                // Set up event listeners
                currentAudio.addEventListener('timeupdate', updateProgress);
                currentAudio.addEventListener('ended', playNext);
                currentAudio.addEventListener('loadedmetadata', () => {
                    document.getElementById('totalTime').textContent = formatTime(currentAudio.duration);
                    
                    // Restore position if available
                    if (data.currentTime && data.currentTime > 0) {
                        currentAudio.currentTime = data.currentTime;
                        document.getElementById('currentTime').textContent = formatTime(data.currentTime);
                        const progress = (data.currentTime / currentAudio.duration) * 100;
                        document.getElementById('progressFill').style.width = `${progress}%`;
                    }
                });
                
                // Try to restore playlist context
                if (data.playlistType) {
                    restorePlaylistContext(data.playlistType, data.trackIndex);
                }
                
                // Setup Media Session
                setupMediaSession(data.track);
                
                console.log(`✅ Session restored - Ready to play from ${formatTime(data.currentTime || 0)}`);
            }
        } catch (error) {
            console.error('Error restoring last session:', error);
        }
    }
}

/**
 * Restore playlist context
 */
function restorePlaylistContext(playlistType, trackIndex) {
    const categories = getPlaylistCategories();
    const category = categories[playlistType];
    
    if (category && category.tracks.length > 0) {
        currentPlaylist = [...category.tracks];
        originalPlaylist = [...category.tracks];
        currentTrackIndex = trackIndex || 0;
        
        // Apply shuffle if it was on
        if (isShuffleOn) {
            shufflePlaylist();
        }
        
        console.log(`🎵 Restored playlist context: ${category.name}`);
    }
}

/**
 * Setup PWA install functionality
 */
function setupPWAInstall() {
    const installBtn = document.getElementById('installBtn');
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('🔽 PWA install prompt available');
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
    });
    
    // Handle install button click
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) {
                console.log('❌ No install prompt available');
                return;
            }
            
            // Show install prompt
            deferredPrompt.prompt();
            
            // Wait for user response
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`🔽 Install prompt outcome: ${outcome}`);
            
            if (outcome === 'accepted') {
                showNotification('App will be installed!', 'success');
            }
            
            // Clear the prompt
            deferredPrompt = null;
            installBtn.style.display = 'none';
        });
    }
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA installed successfully');
        showNotification('Mictify installed successfully!', 'success');
        
        // Hide install button
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        
        deferredPrompt = null;
    });
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('📱 Running as installed PWA');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }
}

/**
 * Play playlist from beginning or pause if already playing
 */
function playPlaylist() {
    if (!currentPlaylist || currentPlaylist.length === 0) {
        console.error('❌ No playlist to play');
        return;
    }
    
    // Check if we're currently playing a track from this playlist
    const isPlayingFromCurrentPlaylist = currentTrack && currentPlaylist.some(track => track.id === currentTrack.id);
    
    // If currently playing from this playlist, pause
    if (isPlaying && currentAudio && isPlayingFromCurrentPlaylist) {
        currentAudio.pause();
        isPlaying = false;
        updatePlayButton();
        updateMobilePlayButton();
        updatePlaylistActionButtons();
        console.log('⏸️ Paused playlist');
        return;
    }
    
    // If paused and the current track is from this playlist, resume
    if (currentAudio && currentTrack && !isPlaying && isPlayingFromCurrentPlaylist) {
        currentAudio.play();
        isPlaying = true;
        updatePlayButton();
        updateMobilePlayButton();
        updatePlaylistActionButtons();
        console.log('▶️ Resumed playlist');
        return;
    }
    
    // Start from first track of current playlist
    playTrack(0);
    console.log('🎵 Playing playlist from beginning');
}

/**
 * Shuffle and play playlist
 */
function shuffleAndPlay() {
    if (!currentPlaylist || currentPlaylist.length === 0) {
        console.error('❌ No playlist to shuffle');
        return;
    }
    
    // Enable shuffle if not already on
    if (!isShuffleOn) {
        toggleShuffle();
    }
    
    // Play first track (which will be random after shuffle)
    playTrack(0);
    console.log('🔀 Shuffling and playing playlist');
}

/**
 * Update playlist action buttons
 */
function updatePlaylistActionButtons() {
    const shuffleBtn = document.getElementById('playlistShuffleBtn');
    const playBtn = document.getElementById('playlistPlayBtn');
    
    // Update shuffle button
    if (shuffleBtn) {
        if (isShuffleOn) {
            shuffleBtn.classList.add('active');
        } else {
            shuffleBtn.classList.remove('active');
        }
    }
    
    // Update play/pause button
    if (playBtn) {
        const playIcon = playBtn.querySelector('svg');
        if (playIcon) {
            // Check if we're currently playing a track from this playlist
            const isPlayingFromCurrentPlaylist = currentTrack && currentPlaylist.some(track => track.id === currentTrack.id);
            
            if (isPlaying && currentAudio && isPlayingFromCurrentPlaylist) {
                // Show pause icon - only if playing from current playlist
                playIcon.innerHTML = '<path d="M6 19h4V5H6v14zM14 5v14h4V5h-4z" fill="currentColor"/>';
            } else {
                // Show play icon - if not playing or playing from different playlist
                playIcon.innerHTML = '<path d="M8 5v14l11-7z" fill="currentColor"/>';
            }
        }
    }
}

/**
 * Get current playlist type
 */
function getCurrentPlaylistType() {
    // Simple detection based on current playlist content
    if (currentPlaylist.length > 0) {
        const firstTrack = currentPlaylist[0];
        return firstTrack.category || 'breakbeat';
    }
    return 'breakbeat';
}

/**
 * Update search bar for specific playlist
 */
function updateSearchForPlaylist(playlistType, playlistName) {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        // Update placeholder text
        searchInput.placeholder = `Search in ${playlistName}...`;
        
        // Clear current search
        searchInput.value = '';
        
        // Store current playlist type for search context
        searchInput.dataset.playlistType = playlistType;
        
        console.log(`🔍 Search updated for playlist: ${playlistName}`);
    }
}

/**
 * Reset search bar to default
 */
function resetSearchToDefault() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        // Reset placeholder text
        searchInput.placeholder = 'Search playlists...';
        
        // Clear current search
        searchInput.value = '';
        
        // Remove playlist context
        delete searchInput.dataset.playlistType;
        
        console.log('🔍 Search reset to default');
    }
}

/**
 * Search tracks in current playlist
 */
function searchInPlaylist(query) {
    if (!currentPlaylist || currentPlaylist.length === 0) {
        return;
    }
    
    const filteredTracks = originalPlaylist.filter(track => {
        const searchText = query.toLowerCase();
        return (
            track.title.toLowerCase().includes(searchText) ||
            track.artist.toLowerCase().includes(searchText) ||
            track.album.toLowerCase().includes(searchText)
        );
    });
    
    // Update current playlist with filtered results
    currentPlaylist = [...filteredTracks];
    
    // Apply shuffle if it's on
    if (isShuffleOn && filteredTracks.length > 0) {
        shufflePlaylist();
    }
    
    // Re-render tracks
    renderTracks(currentPlaylist);
    
    console.log(`🔍 Found ${filteredTracks.length} tracks matching "${query}"`);
}

/**
 * Search playlists in categories view
 */
function searchPlaylists(query) {
    document.querySelectorAll('.playlist-card').forEach(card => {
        const title = card.querySelector('.playlist-title').textContent.toLowerCase();
        const shouldShow = title.includes(query.toLowerCase());
        card.style.display = shouldShow ? 'block' : 'none';
    });
    
    console.log(`🔍 Searching playlists for "${query}"`);
}
function getCurrentPlaylistType() {
    // Simple detection based on current playlist content
    if (currentPlaylist.length > 0) {
        const firstTrack = currentPlaylist[0];
        return firstTrack.category || 'breakbeat';
    }
    return 'breakbeat';
}

/**
 * Open fullscreen mobile player
 */
function openFullscreenPlayer() {
    const fullscreenPlayer = document.getElementById('fullscreenPlayer');
    if (fullscreenPlayer) {
        fullscreenPlayer.classList.add('active');
        
        // Update fullscreen player with current track info
        updateFullscreenPlayer();
        
        // Setup fullscreen player controls
        setupFullscreenPlayerControls();
        
        console.log('📱 Opened fullscreen player');
    }
}

/**
 * Close fullscreen mobile player
 */
function closeFullscreenPlayer() {
    const fullscreenPlayer = document.getElementById('fullscreenPlayer');
    if (fullscreenPlayer) {
        fullscreenPlayer.classList.remove('active');
        console.log('📱 Closed fullscreen player');
    }
}

/**
 * Update fullscreen player UI
 */
function updateFullscreenPlayer() {
    if (!currentTrack) return;
    
    // Update track info
    const titleElement = document.getElementById('fullscreenTrackTitle');
    const artistElement = document.getElementById('fullscreenTrackArtist');
    const playlistNameElement = document.getElementById('fullscreenPlaylistName');
    
    if (titleElement) titleElement.textContent = currentTrack.title;
    if (artistElement) artistElement.textContent = currentTrack.artist;
    
    // Update playlist name
    if (playlistNameElement) {
        const playlistType = getCurrentPlaylistType();
        const playlistNames = {
            'breakbeat': 'Breakbeat',
            'for-revenge': 'For Revenge',
            'cigarettes-after-sex': 'Cigarettes After Sex'
        };
        playlistNameElement.textContent = playlistNames[playlistType] || 'Playlist';
    }
    
    // Update album art
    const albumImage = document.getElementById('fullscreenAlbumImage');
    const background = document.querySelector('.fullscreen-background');
    if (albumImage && background) {
        const playlistType = getCurrentPlaylistType();
        let imageSrc = 'assets/img/breakbeatProfil.jpg';
        
        if (playlistType === 'for-revenge') {
            imageSrc = 'assets/img/profilRevenge.jpg';
        } else if (playlistType === 'cigarettes-after-sex') {
            imageSrc = 'assets/img/casProfile.jpg';
        }
        
        albumImage.src = imageSrc;
        background.style.backgroundImage = `url('${imageSrc}')`;
    }
    
    // Update play button
    updateFullscreenPlayButton();
    
    // Update shuffle and repeat buttons
    updateFullscreenControlButtons();
    
    // Update progress if audio is loaded
    if (currentAudio) {
        updateFullscreenProgress();
    }
}

/**
 * Update fullscreen play button
 */
function updateFullscreenPlayButton() {
    const playBtn = document.getElementById('fullscreenPlayBtn');
    if (playBtn) {
        const playIcon = playBtn.querySelector('.play-icon');
        const pauseIcon = playBtn.querySelector('.pause-icon');
        
        if (playIcon && pauseIcon) {
            if (isPlaying) {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } else {
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        }
    }
}

/**
 * Update fullscreen control buttons (shuffle, repeat)
 */
function updateFullscreenControlButtons() {
    const shuffleBtn = document.getElementById('fullscreenShuffle');
    const repeatBtn = document.getElementById('fullscreenRepeat');
    
    // Update shuffle button
    if (shuffleBtn) {
        if (isShuffleOn) {
            shuffleBtn.classList.add('active');
        } else {
            shuffleBtn.classList.remove('active');
        }
    }
    
    // Update repeat button
    if (repeatBtn) {
        repeatBtn.classList.remove('active');
        if (repeatMode !== 'off') {
            repeatBtn.classList.add('active');
        }
        
        // Update repeat icon based on mode
        const svg = repeatBtn.querySelector('svg');
        if (svg) {
            if (repeatMode === 'one') {
                svg.innerHTML = `
                    <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <text x="12" y="16" text-anchor="middle" font-size="8" font-weight="bold" fill="currentColor">1</text>
                `;
            } else {
                svg.innerHTML = `
                    <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                `;
            }
        }
    }
}

/**
 * Update fullscreen progress bar
 */
function updateFullscreenProgress() {
    if (!currentAudio) return;
    
    const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
    const progressFill = document.getElementById('fullscreenProgressFill');
    const currentTimeElement = document.getElementById('fullscreenCurrentTime');
    const totalTimeElement = document.getElementById('fullscreenTotalTime');
    
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    if (currentTimeElement) {
        currentTimeElement.textContent = formatTime(currentAudio.currentTime);
    }
    
    if (totalTimeElement) {
        totalTimeElement.textContent = formatTime(currentAudio.duration);
    }
}

/**
 * Setup fullscreen player controls
 */
function setupFullscreenPlayerControls() {
    // Play/Pause button
    const playBtn = document.getElementById('fullscreenPlayBtn');
    if (playBtn) {
        playBtn.onclick = () => {
            if (!currentAudio) {
                if (currentTrack) {
                    if (!currentPlaylist || currentPlaylist.length === 0) {
                        currentPlaylist = [currentTrack];
                        currentTrackIndex = 0;
                    }
                    playTrack(currentTrackIndex);
                }
                return;
            }
            
            if (isPlaying) {
                currentAudio.pause();
                isPlaying = false;
            } else {
                currentAudio.play();
                isPlaying = true;
            }
            updatePlayButton();
            updateMobilePlayButton();
            updateFullscreenPlayButton();
        };
    }
    
    // Previous button
    const prevBtn = document.getElementById('fullscreenPrev');
    if (prevBtn) {
        prevBtn.onclick = () => {
            playPrevious();
            updateFullscreenPlayer();
        };
    }
    
    // Next button
    const nextBtn = document.getElementById('fullscreenNext');
    if (nextBtn) {
        nextBtn.onclick = () => {
            playNext();
            updateFullscreenPlayer();
        };
    }
    
    // Shuffle button
    const shuffleBtn = document.getElementById('fullscreenShuffle');
    if (shuffleBtn) {
        shuffleBtn.onclick = () => {
            toggleShuffle();
            updateFullscreenControlButtons();
        };
    }
    
    // Repeat button
    const repeatBtn = document.getElementById('fullscreenRepeat');
    if (repeatBtn) {
        repeatBtn.onclick = () => {
            toggleRepeat();
            updateFullscreenControlButtons();
        };
    }
    
    // Progress bar click
    const progressBar = document.getElementById('fullscreenProgressBar');
    if (progressBar) {
        progressBar.onclick = (e) => {
            if (!currentAudio) return;
            
            const rect = e.target.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            currentAudio.currentTime = percent * currentAudio.duration;
            updateFullscreenProgress();
        };
    }
}

/**
 * Update repeat button visual state
 */
function updateRepeatButton() {
    const repeatBtn = document.getElementById('repeatBtn');
    
    switch (repeatMode) {
        case 'off':
            repeatBtn.classList.remove('active');
            repeatBtn.title = 'Repeat';
            repeatBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            break;
        case 'all':
            repeatBtn.classList.add('active');
            repeatBtn.title = 'Repeat All';
            repeatBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            break;
        case 'one':
            repeatBtn.classList.add('active');
            repeatBtn.title = 'Repeat One';
            repeatBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span style="position: absolute; font-size: 8px; font-weight: bold; top: 2px; right: 2px;">1</span>
            `;
            break;
    }
}
function getTrackDuration(audioUrl) {
    return new Promise((resolve) => {
        const audio = new Audio();
        
        const cleanup = () => {
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('error', onError);
            audio.removeEventListener('canplaythrough', onCanPlayThrough);
        };
        
        const onLoadedMetadata = () => {
            cleanup();
            resolve(audio.duration || 0);
        };
        
        const onCanPlayThrough = () => {
            cleanup();
            resolve(audio.duration || 0);
        };
        
        const onError = () => {
            cleanup();
            console.warn(`Could not load duration for: ${audioUrl}`);
            resolve(0);
        };
        
        // Set up event listeners
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('canplaythrough', onCanPlayThrough);
        audio.addEventListener('error', onError);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            cleanup();
            resolve(0);
        }, 10000);
        
        // Start loading
        audio.preload = 'metadata';
        audio.src = audioUrl;
        audio.load();
    });
}

/**
 * Setup audio player controls
 */
function setupAudioPlayer() {
    // Play/Pause button
    document.getElementById('playBtn').addEventListener('click', () => {
        if (!currentAudio) {
            // If no audio but we have a restored track, try to play it
            if (currentTrack) {
                console.log('🎵 Resuming restored track...');
                const savedData = JSON.parse(localStorage.getItem(SETTINGS_KEYS.LAST_TRACK) || '{}');
                
                // Find track index in current playlist or create minimal playlist
                if (!currentPlaylist || currentPlaylist.length === 0) {
                    // Create minimal playlist with just this track
                    currentPlaylist = [currentTrack];
                    currentTrackIndex = 0;
                }
                
                playTrack(currentTrackIndex);
                return;
            }
            return;
        }
        
        if (isPlaying) {
            currentAudio.pause();
            isPlaying = false;
        } else {
            currentAudio.play();
            isPlaying = true;
        }
        updatePlayButton();
    });
    
    // Previous button
    document.getElementById('prevBtn').addEventListener('click', playPrevious);
    
    // Next button
    document.getElementById('nextBtn').addEventListener('click', playNext);
    
    // Shuffle button
    document.getElementById('shuffleBtn').addEventListener('click', toggleShuffle);
    
    // Repeat button
    document.getElementById('repeatBtn').addEventListener('click', toggleRepeat);
    
    // Volume control
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        if (currentAudio) {
            currentAudio.volume = volume;
        }
        // Save volume setting
        saveVolume(parseInt(e.target.value));
    });
    
    // Mute button
    document.getElementById('muteBtn').addEventListener('click', () => {
        if (currentAudio) {
            currentAudio.muted = !currentAudio.muted;
        }
    });
    
    // Progress bar click
    document.getElementById('progressBar').addEventListener('click', (e) => {
        if (!currentAudio) return;
        
        const rect = e.target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        currentAudio.currentTime = percent * currentAudio.duration;
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search functionality - Enhanced with playlist context
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const searchInput = e.target;
        
        // Check if we're in playlist detail view or categories view
        const isInPlaylistDetail = !document.getElementById('playlist-categories').classList.contains('hidden');
        const playlistType = searchInput.dataset.playlistType;
        
        if (!isInPlaylistDetail && playlistType) {
            // We're in playlist detail view - search within current playlist
            if (query.trim() === '') {
                // If search is empty, restore original playlist
                currentPlaylist = [...originalPlaylist];
                
                // Apply shuffle if it's on
                if (isShuffleOn) {
                    shufflePlaylist();
                }
                
                renderTracks(currentPlaylist);
            } else {
                // Search within playlist tracks
                searchInPlaylist(query);
            }
        } else {
            // We're in categories view - search playlists
            searchPlaylists(query);
        }
    });
    
    // Clear search when input loses focus and is empty
    document.getElementById('searchInput').addEventListener('blur', (e) => {
        const searchInput = e.target;
        const playlistType = searchInput.dataset.playlistType;
        
        if (searchInput.value.trim() === '' && playlistType) {
            // Restore original playlist if search is cleared
            currentPlaylist = [...originalPlaylist];
            
            // Apply shuffle if it's on
            if (isShuffleOn) {
                shufflePlaylist();
            }
            
            renderTracks(currentPlaylist);
        }
    });
    
    // Window resize listener for marquee animation
    window.addEventListener('resize', () => {
        addMarqueeAnimation();
    });
    
    // Setup mobile controls (use event delegation for dynamically added elements)
    document.addEventListener('click', (e) => {
        if (e.target.closest('#mobilePrevBtn')) {
            playPrevious();
        } else if (e.target.closest('#mobilePlayBtn')) {
            // Use same logic as desktop play button
            if (!currentAudio) {
                // If no audio but we have a restored track, try to play it
                if (currentTrack) {
                    console.log('🎵 Resuming restored track...');
                    const savedData = JSON.parse(localStorage.getItem(SETTINGS_KEYS.LAST_TRACK) || '{}');
                    
                    // Find track index in current playlist or create minimal playlist
                    if (!currentPlaylist || currentPlaylist.length === 0) {
                        // Create minimal playlist with just this track
                        currentPlaylist = [currentTrack];
                        currentTrackIndex = 0;
                    }
                    
                    playTrack(currentTrackIndex);
                    return;
                }
                return;
            }
            
            if (isPlaying) {
                currentAudio.pause();
                isPlaying = false;
            } else {
                currentAudio.play();
                isPlaying = true;
            }
            updatePlayButton();
        } else if (e.target.closest('#mobileNextBtn')) {
            playNext();
        }
    });
    
    // Make functions global for onclick handlers
    window.openPlaylist = openPlaylist;
    window.backToPlaylists = backToPlaylists;
    window.playTrack = playTrack;
    window.playPlaylist = playPlaylist;
    window.shuffleAndPlay = shuffleAndPlay;
    window.openFullscreenPlayer = openFullscreenPlayer;
    window.closeFullscreenPlayer = closeFullscreenPlayer;
}

/**
 * Utility functions
 */
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDuration(seconds) {
    return formatTime(seconds);
}

function showNotification(message, type = 'info') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notifications.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

console.log('🎵 Breakbeat Music App loaded');