# Dokumen Design: Aplikasi Streaming Musik Breakbeat

## Overview

Aplikasi streaming musik breakbeat adalah aplikasi web frontend-only yang dibangun menggunakan vanilla JavaScript, HTML5, dan CSS3. Aplikasi ini berjalan sepenuhnya di browser tanpa memerlukan backend server, menggunakan localStorage untuk persistensi data dan HTML5 Audio API untuk pemutaran musik.

Aplikasi ini dirancang khusus untuk DJ dan penggemar musik breakbeat dengan fitur-fitur seperti BPM detection, crossfade, queue management, dan organisasi playlist yang intuitif. Semua file musik dimuat dari perangkat lokal pengguna dan diproses menggunakan Web APIs modern.

## Architecture

### Arsitektur Modular

Aplikasi menggunakan arsitektur modular dengan separation of concerns yang jelas:

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│  UI Components  │  Event Handlers  │  Responsive Layout    │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Application Logic Layer                   │
├─────────────────────────────────────────────────────────────┤
│  Audio Player   │  Playlist Mgmt   │  Search & Filter      │
│  Queue Manager  │  BPM Detection   │  Crossfade Engine     │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                     Data Access Layer                       │
├─────────────────────────────────────────────────────────────┤
│  File Handler   │  Metadata Parser │  LocalStorage Manager │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                      Browser APIs                           │
├─────────────────────────────────────────────────────────────┤
│  File API       │  Web Audio API   │  HTML5 Audio API      │
│  LocalStorage   │  Canvas API      │  MediaMetadata API    │
└─────────────────────────────────────────────────────────────┘
```

### Pola Arsitektur

1. **Module Pattern**: Setiap komponen diimplementasikan sebagai ES6 module dengan encapsulation yang jelas
2. **Observer Pattern**: Event-driven communication antar komponen menggunakan custom event system
3. **Strategy Pattern**: Berbagai strategi untuk BPM detection dan audio processing
4. **Factory Pattern**: Pembuatan objek track dan playlist dengan validasi

## Components and Interfaces

### Core Components

#### 1. AudioPlayer
Komponen utama untuk pemutaran audio dengan dukungan crossfade dan queue management.

```javascript
class AudioPlayer {
  constructor(options = {}) {
    this.currentTrack = null;
    this.nextTrack = null;
    this.queue = [];
    this.crossfadeDuration = options.crossfadeDuration || 5000;
    this.volume = options.volume || 0.8;
    this.isPlaying = false;
    this.isPaused = false;
  }

  // Interface methods
  play(track);
  pause();
  stop();
  next();
  previous();
  seek(position);
  setVolume(volume);
  addToQueue(track);
  removeFromQueue(index);
  enableCrossfade(duration);
  disableCrossfade();
}
```

#### 2. FileHandler
Menangani loading dan parsing file audio dari perangkat lokal.

```javascript
class FileHandler {
  constructor() {
    this.supportedFormats = ['mp3', 'wav', 'm4a', 'ogg'];
    this.maxFileSize = 100 * 1024 * 1024; // 100MB
  }

  // Interface methods
  loadFiles(fileList);
  validateFile(file);
  extractMetadata(file);
  createAudioURL(file);
}
```

#### 3. LibraryManager
Mengelola koleksi musik dan metadata dengan localStorage persistence.

```javascript
class LibraryManager {
  constructor() {
    this.tracks = new Map();
    this.playlists = new Map();
    this.storageKey = 'breakbeat_library';
  }

  // Interface methods
  addTrack(track);
  removeTrack(trackId);
  getTrack(trackId);
  getAllTracks();
  createPlaylist(name);
  addToPlaylist(playlistId, trackId);
  removeFromPlaylist(playlistId, trackId);
  searchTracks(query);
  filterTracks(criteria);
  saveToStorage();
  loadFromStorage();
}
```

#### 4. BPMDetector
Menganalisis audio untuk mendeteksi BPM menggunakan Web Audio API.

```javascript
class BPMDetector {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.sampleRate = 44100;
    this.bufferSize = 4096;
  }

  // Interface methods
  detectBPM(audioBuffer);
  analyzeBeats(audioData);
  calculateTempo(peaks);
}
```

#### 5. PlaylistManager
Mengelola playlist dan operasi terkait.

```javascript
class PlaylistManager {
  constructor(libraryManager) {
    this.library = libraryManager;
    this.playlists = new Map();
  }

  // Interface methods
  createPlaylist(name, tracks = []);
  deletePlaylist(playlistId);
  addTrackToPlaylist(playlistId, trackId);
  removeTrackFromPlaylist(playlistId, trackId);
  reorderPlaylist(playlistId, fromIndex, toIndex);
  getPlaylistTracks(playlistId);
}
```

#### 6. SearchEngine
Menyediakan fungsi pencarian dan filtering yang efisien.

```javascript
class SearchEngine {
  constructor(libraryManager) {
    this.library = libraryManager;
    this.searchIndex = new Map();
  }

  // Interface methods
  search(query);
  filterByGenre(genre);
  filterByBPMRange(minBPM, maxBPM);
  filterByArtist(artist);
  buildSearchIndex();
  updateSearchIndex(track);
}
```

#### 7. UIController
Mengontrol semua interaksi UI dan responsive behavior.

```javascript
class UIController {
  constructor() {
    this.components = new Map();
    this.eventListeners = new Map();
    this.isMobile = window.innerWidth <= 768;
  }

  // Interface methods
  initializeUI();
  renderLibrary(tracks);
  renderPlaylist(playlist);
  renderPlayer(track);
  renderQueue(queue);
  handleResize();
  showNotification(message, type);
  showLoadingIndicator();
  hideLoadingIndicator();
}
```

### Interface Contracts

#### Track Interface
```javascript
interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  duration: number;
  fileUrl: string;
  metadata: {
    size: number;
    format: string;
    bitrate?: number;
    sampleRate?: number;
  };
  addedDate: Date;
}
```

#### Playlist Interface
```javascript
interface Playlist {
  id: string;
  name: string;
  tracks: string[]; // Array of track IDs
  createdDate: Date;
  modifiedDate: Date;
  description?: string;
}
```

#### AudioState Interface
```javascript
interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  crossfadeEnabled: boolean;
  crossfadeDuration: number;
}
```

## Data Models

### Track Data Model

Track adalah entitas utama yang merepresentasikan file audio individual:

```javascript
class Track {
  constructor(file, metadata = {}) {
    this.id = this.generateId();
    this.title = metadata.title || file.name.replace(/\.[^/.]+$/, "");
    this.artist = metadata.artist || 'Unknown Artist';
    this.album = metadata.album || 'Unknown Album';
    this.genre = metadata.genre || 'Breakbeat';
    this.bpm = metadata.bpm || null;
    this.key = metadata.key || null;
    this.duration = metadata.duration || 0;
    this.fileUrl = URL.createObjectURL(file);
    this.metadata = {
      size: file.size,
      format: this.getFileExtension(file.name),
      bitrate: metadata.bitrate || null,
      sampleRate: metadata.sampleRate || null
    };
    this.addedDate = new Date();
  }

  generateId() {
    return 'track_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      artist: this.artist,
      album: this.album,
      genre: this.genre,
      bpm: this.bpm,
      key: this.key,
      duration: this.duration,
      metadata: this.metadata,
      addedDate: this.addedDate
    };
  }
}
```

### Playlist Data Model

Playlist mengorganisir track dalam koleksi yang dapat diatur pengguna:

```javascript
class Playlist {
  constructor(name, description = '') {
    this.id = this.generateId();
    this.name = name;
    this.description = description;
    this.tracks = []; // Array of track IDs
    this.createdDate = new Date();
    this.modifiedDate = new Date();
  }

  generateId() {
    return 'playlist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  addTrack(trackId) {
    if (!this.tracks.includes(trackId)) {
      this.tracks.push(trackId);
      this.modifiedDate = new Date();
      return true;
    }
    return false;
  }

  removeTrack(trackId) {
    const index = this.tracks.indexOf(trackId);
    if (index > -1) {
      this.tracks.splice(index, 1);
      this.modifiedDate = new Date();
      return true;
    }
    return false;
  }

  reorderTracks(fromIndex, toIndex) {
    if (fromIndex >= 0 && fromIndex < this.tracks.length && 
        toIndex >= 0 && toIndex < this.tracks.length) {
      const track = this.tracks.splice(fromIndex, 1)[0];
      this.tracks.splice(toIndex, 0, track);
      this.modifiedDate = new Date();
      return true;
    }
    return false;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      tracks: this.tracks,
      createdDate: this.createdDate,
      modifiedDate: this.modifiedDate
    };
  }
}
```

### AudioQueue Data Model

Queue mengelola antrian pemutaran dengan dukungan untuk crossfade:

```javascript
class AudioQueue {
  constructor() {
    this.items = [];
    this.currentIndex = -1;
    this.shuffle = false;
    this.repeat = 'none'; // 'none', 'one', 'all'
    this.history = [];
  }

  add(track, position = -1) {
    if (position === -1) {
      this.items.push(track);
    } else {
      this.items.splice(position, 0, track);
    }
  }

  remove(index) {
    if (index >= 0 && index < this.items.length) {
      const removed = this.items.splice(index, 1)[0];
      if (index <= this.currentIndex) {
        this.currentIndex--;
      }
      return removed;
    }
    return null;
  }

  getCurrentTrack() {
    return this.currentIndex >= 0 ? this.items[this.currentIndex] : null;
  }

  getNextTrack() {
    if (this.shuffle) {
      return this.getRandomTrack();
    }
    
    const nextIndex = this.currentIndex + 1;
    if (nextIndex < this.items.length) {
      return this.items[nextIndex];
    }
    
    if (this.repeat === 'all') {
      return this.items[0];
    }
    
    return null;
  }

  getPreviousTrack() {
    const prevIndex = this.currentIndex - 1;
    if (prevIndex >= 0) {
      return this.items[prevIndex];
    }
    
    if (this.repeat === 'all') {
      return this.items[this.items.length - 1];
    }
    
    return null;
  }

  moveToNext() {
    if (this.shuffle) {
      this.currentIndex = this.getRandomIndex();
    } else {
      this.currentIndex++;
      if (this.currentIndex >= this.items.length) {
        if (this.repeat === 'all') {
          this.currentIndex = 0;
        } else {
          this.currentIndex = -1;
        }
      }
    }
    
    const current = this.getCurrentTrack();
    if (current) {
      this.history.push(current);
    }
    
    return current;
  }

  getRandomTrack() {
    if (this.items.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.items.length);
    return this.items[randomIndex];
  }

  getRandomIndex() {
    return this.items.length > 0 ? Math.floor(Math.random() * this.items.length) : -1;
  }

  clear() {
    this.items = [];
    this.currentIndex = -1;
    this.history = [];
  }

  toJSON() {
    return {
      items: this.items.map(track => track.id),
      currentIndex: this.currentIndex,
      shuffle: this.shuffle,
      repeat: this.repeat
    };
  }
}
```

### LocalStorage Schema

Data disimpan dalam localStorage dengan struktur berikut:

```javascript
const StorageSchema = {
  // Key: 'breakbeat_library'
  library: {
    tracks: {
      [trackId]: Track,
      // ...
    },
    playlists: {
      [playlistId]: Playlist,
      // ...
    },
    settings: {
      volume: number,
      crossfadeDuration: number,
      crossfadeEnabled: boolean,
      theme: string,
      lastPlayedTrack: string,
      queue: AudioQueue
    },
    metadata: {
      version: string,
      lastModified: Date,
      totalTracks: number,
      totalPlaylists: number
    }
  }
};
```

## Error Handling

### Error Types dan Handling Strategy

#### 1. File Loading Errors
```javascript
class FileLoadError extends Error {
  constructor(message, file, code) {
    super(message);
    this.name = 'FileLoadError';
    this.file = file;
    this.code = code;
  }
}

// Error codes:
// - UNSUPPORTED_FORMAT: Format file tidak didukung
// - FILE_TOO_LARGE: File terlalu besar
// - CORRUPTED_FILE: File rusak atau tidak dapat dibaca
// - PERMISSION_DENIED: Tidak ada izin akses file
```

#### 2. Audio Playback Errors
```javascript
class AudioPlaybackError extends Error {
  constructor(message, track, code) {
    super(message);
    this.name = 'AudioPlaybackError';
    this.track = track;
    this.code = code;
  }
}

// Error codes:
// - DECODE_ERROR: Gagal decode audio
// - NETWORK_ERROR: Error loading audio data
// - NOT_SUPPORTED: Format tidak didukung browser
// - ABORTED: Pemutaran dibatalkan
```

#### 3. Storage Errors
```javascript
class StorageError extends Error {
  constructor(message, operation, code) {
    super(message);
    this.name = 'StorageError';
    this.operation = operation;
    this.code = code;
  }
}

// Error codes:
// - QUOTA_EXCEEDED: localStorage penuh
// - ACCESS_DENIED: Tidak dapat akses localStorage
// - CORRUPTION: Data tersimpan rusak
// - SERIALIZATION_ERROR: Gagal serialize/deserialize data
```

#### 4. BPM Detection Errors
```javascript
class BPMDetectionError extends Error {
  constructor(message, track, code) {
    super(message);
    this.name = 'BPMDetectionError';
    this.track = track;
    this.code = code;
  }
}

// Error codes:
// - ANALYSIS_FAILED: Gagal analisis audio
// - INSUFFICIENT_DATA: Data audio tidak cukup
// - TIMEOUT: Timeout saat analisis
// - AUDIO_CONTEXT_ERROR: Error Web Audio API
```

### Error Recovery Strategies

#### 1. Graceful Degradation
- Jika BPM detection gagal, izinkan input manual
- Jika crossfade tidak didukung, fallback ke pemutaran normal
- Jika localStorage penuh, tampilkan warning dan saran cleanup

#### 2. Retry Mechanisms
- Retry file loading dengan exponential backoff
- Retry BPM detection dengan parameter berbeda
- Retry localStorage operations setelah cleanup

#### 3. User Feedback
- Tampilkan error messages yang user-friendly
- Berikan saran actionable untuk mengatasi error
- Log technical details untuk debugging

#### 4. Fallback Behaviors
```javascript
class ErrorHandler {
  static handleFileLoadError(error) {
    switch(error.code) {
      case 'UNSUPPORTED_FORMAT':
        UIController.showNotification(
          `Format file ${error.file.name} tidak didukung. Gunakan MP3, WAV, atau M4A.`,
          'error'
        );
        break;
      case 'FILE_TOO_LARGE':
        UIController.showNotification(
          `File ${error.file.name} terlalu besar. Maksimal 100MB.`,
          'error'
        );
        break;
      default:
        UIController.showNotification(
          `Gagal memuat file ${error.file.name}. Coba lagi.`,
          'error'
        );
    }
  }

  static handleAudioPlaybackError(error) {
    // Fallback ke track berikutnya jika ada
    if (AudioPlayer.queue.length > 0) {
      AudioPlayer.next();
      UIController.showNotification(
        `Gagal memutar ${error.track.title}. Melanjutkan ke track berikutnya.`,
        'warning'
      );
    } else {
      AudioPlayer.stop();
      UIController.showNotification(
        `Gagal memutar ${error.track.title}.`,
        'error'
      );
    }
  }

  static handleStorageError(error) {
    switch(error.code) {
      case 'QUOTA_EXCEEDED':
        UIController.showNotification(
          'Penyimpanan browser penuh. Hapus beberapa track atau playlist.',
          'warning'
        );
        // Tampilkan dialog untuk cleanup
        UIController.showStorageCleanupDialog();
        break;
      case 'CORRUPTION':
        // Reset storage dan minta user reload data
        LibraryManager.resetStorage();
        UIController.showNotification(
          'Data rusak telah direset. Silakan muat ulang file musik Anda.',
          'info'
        );
        break;
    }
  }
}
```

## Testing Strategy

### Dual Testing Approach

Aplikasi akan menggunakan kombinasi unit testing dan property-based testing untuk memastikan kualitas dan keandalan:

#### Unit Testing
- **Framework**: Jest untuk testing environment
- **Fokus**: Specific examples, edge cases, dan error conditions
- **Coverage**: Component methods, UI interactions, error handling
- **Mock**: Browser APIs (File API, Web Audio API, localStorage)

#### Property-Based Testing  
- **Framework**: fast-check untuk JavaScript property-based testing
- **Fokus**: Universal properties yang berlaku untuk semua input
- **Configuration**: Minimum 100 iterations per property test
- **Coverage**: Data transformations, audio processing, search algorithms

#### Testing Categories

**1. Component Unit Tests**
- AudioPlayer: play/pause/stop functionality, volume control, queue management
- FileHandler: file validation, metadata extraction, error handling
- LibraryManager: CRUD operations, search, filtering
- PlaylistManager: playlist operations, track ordering
- BPMDetector: audio analysis, tempo calculation

**2. Integration Tests**
- File loading → metadata extraction → library storage
- Track selection → audio playback → UI updates
- Playlist creation → track addition → queue management
- Search query → filtering → results display

**3. UI Tests**
- Responsive layout behavior
- User interaction feedback
- Error message display
- Loading states

**4. Browser Compatibility Tests**
- localStorage functionality across browsers
- Audio API support and fallbacks
- File API behavior differences
- Mobile browser specific issues

#### Test Configuration

```javascript
// Property test configuration
const propertyTestConfig = {
  numRuns: 100,
  timeout: 5000,
  seed: Math.random(),
  path: "test-results",
  verbose: true
};

// Unit test configuration  
const unitTestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

Setiap property test akan diberi tag yang mereferensikan design property:
```javascript
// Format: Feature: {feature_name}, Property {number}: {property_text}
test('Feature: breakbeat-music-streaming, Property 1: File validation consistency', () => {
  // Property test implementation
});
```

## Correctness Properties

*Property adalah karakteristik atau perilaku yang harus berlaku untuk semua eksekusi sistem yang valid - pada dasarnya, pernyataan formal tentang apa yang harus dilakukan sistem. Properties berfungsi sebagai jembatan antara spesifikasi yang dapat dibaca manusia dan jaminan kebenaran yang dapat diverifikasi mesin.*

Berdasarkan analisis acceptance criteria, berikut adalah correctness properties yang akan diimplementasikan menggunakan property-based testing:

### Property 1: File Format Validation Consistency
*For any* file input, the File_Handler should accept the file if and only if it has a supported format (MP3, WAV, M4A), and reject all other formats with appropriate error messages.
**Validates: Requirements 1.1, 1.4**

### Property 2: Metadata Extraction Completeness  
*For any* valid audio file, metadata extraction should always produce a Track object with all required fields (title, artist, duration) populated, even if some fields use default values.
**Validates: Requirements 1.2**

### Property 3: Storage Round-Trip Consistency
*For any* track or playlist data, storing to localStorage and then retrieving should produce equivalent data structures with identical metadata values.
**Validates: Requirements 1.5, 5.1, 5.4, 5.5, 7.1, 7.2**

### Property 4: Audio Playback State Consistency
*For any* valid track in the library, selecting it for playback should result in the Audio_Player entering the "playing" state with the correct track metadata displayed.
**Validates: Requirements 2.1, 5.3**

### Property 5: Seek Position Accuracy
*For any* valid seek position within a track's duration, the Audio_Player should update its currentTime to match the requested position within acceptable tolerance.
**Validates: Requirements 2.4**

### Property 6: Volume Control Linearity
*For any* volume value between 0 and 1, setting the Audio_Player volume should result in the actual audio output volume matching the requested value.
**Validates: Requirements 2.5**

### Property 7: Queue Auto-Advance Behavior
*For any* queue with multiple tracks, when the current track ends and there is a next track available, the Audio_Player should automatically advance to the next track.
**Validates: Requirements 2.6**

### Property 8: Library Invariant Preservation
*For any* playlist operation (create, add track, remove track, delete playlist), the Library's track collection should remain unchanged - playlist operations should never modify the main library.
**Validates: Requirements 3.2, 3.3, 3.5**

### Property 9: Playlist Track Ordering Consistency
*For any* playlist reordering operation, the set of tracks should remain identical while only their order changes, and the new order should be persisted correctly.
**Validates: Requirements 3.4**

### Property 10: Search Result Relevance
*For any* search query string, all returned results should contain the query string in at least one of their searchable fields (title, artist, album).
**Validates: Requirements 4.1**

### Property 11: Filter Result Accuracy
*For any* filter criteria (genre, BPM range), all returned results should match the specified criteria exactly.
**Validates: Requirements 4.2, 4.3, 9.5**

### Property 12: Filter Reset Completeness
*For any* library state, clearing all filters and search queries should return the complete set of tracks that exist in the library.
**Validates: Requirements 4.5**

### Property 13: BPM Detection and Storage
*For any* audio file without existing BPM metadata, the BPM detection process should either produce a reasonable BPM value (60-200 range for breakbeat) or allow manual override, and the final BPM value should be persisted to localStorage.
**Validates: Requirements 9.1, 9.2, 9.3**

### Property 14: BPM-Based Sorting Correctness
*For any* library sorted by BPM, the resulting track order should be monotonically increasing or decreasing based on BPM values, with tracks having null BPM appearing at the end.
**Validates: Requirements 9.4**

### Property 15: Queue FIFO Ordering
*For any* sequence of tracks added to the queue, they should be played in the exact order they were added (First In, First Out), unless shuffle mode is enabled.
**Validates: Requirements 10.1, 10.2**

### Property 16: Queue Removal Safety
*For any* track removal from the queue, if the removed track is not currently playing, the current playback should continue uninterrupted.
**Validates: Requirements 10.3**

### Property 17: Queue Exhaustion Behavior
*For any* queue state, when the queue becomes empty and the current track finishes, the Audio_Player should stop playback and enter idle state.
**Validates: Requirements 10.4**

### Property 18: Crossfade Timing Precision
*For any* crossfade duration setting, when crossfade is enabled, the next track should begin playing exactly (crossfade_duration) seconds before the current track ends.
**Validates: Requirements 11.1**

### Property 19: Crossfade Volume Transition Smoothness
*For any* crossfade operation, the volume transition should be smooth and gradual, with the sum of both track volumes remaining approximately constant throughout the transition.
**Validates: Requirements 11.2**

### Property 20: Crossfade Settings Persistence
*For any* crossfade duration setting, the preference should be saved to localStorage and applied to all subsequent crossfade operations until changed.
**Validates: Requirements 11.3**

### Property 21: Non-Crossfade Sequential Playback
*For any* track transition when crossfade is disabled, the next track should begin playing only after the current track has completely finished.
**Validates: Requirements 11.4**

### Property 22: Responsive Layout Adaptation
*For any* viewport size change, the UI layout should adapt appropriately to maintain usability and proper element proportions.
**Validates: Requirements 6.4**

### Property 23: Application State Recovery
*For any* application restart, all previously saved library data, playlists, and settings should be restored from localStorage to their exact previous state.
**Validates: Requirements 7.3, 8.5**

### Examples and Edge Cases

**Example 1: Empty Storage Initialization**
When localStorage is empty (new user or cleared cache), the application should display an empty library and prompt the user to load music files.
**Validates: Requirements 7.4**

**Example 2: No-Auth Application Access**
When a user opens the application, it should immediately display the main interface without any login or authentication screens.
**Validates: Requirements 8.1**

**Example 3: Empty Search Results**
When a search query returns no matches, the system should display a "no tracks found" message.
**Validates: Requirements 4.4**

## Testing Strategy

### Dual Testing Approach

Aplikasi akan menggunakan kombinasi unit testing dan property-based testing untuk memastikan kualitas dan keandalan yang komprehensif:

#### Unit Testing dengan Jest
- **Fokus**: Specific examples, edge cases, dan error conditions
- **Coverage**: Component methods, UI interactions, error handling scenarios
- **Mock Strategy**: Browser APIs (File API, Web Audio API, localStorage) untuk testing yang konsisten
- **Integration Points**: File loading → metadata extraction → library storage workflows

**Unit Test Categories:**
- **Component Tests**: AudioPlayer controls, FileHandler validation, LibraryManager CRUD
- **Error Handling Tests**: Invalid file formats, storage quota exceeded, audio decode failures  
- **UI Interaction Tests**: Button clicks, drag-and-drop, responsive behavior
- **Browser API Tests**: localStorage operations, File API usage, Web Audio API integration

#### Property-Based Testing dengan fast-check
- **Framework**: fast-check library untuk JavaScript property-based testing
- **Configuration**: Minimum 100 iterations per property test untuk coverage yang memadai
- **Fokus**: Universal properties yang berlaku untuk semua input valid
- **Tag Format**: Setiap test diberi tag `Feature: breakbeat-music-streaming, Property {number}: {property_text}`

**Property Test Implementation:**
```javascript
// Contoh konfigurasi property test
import fc from 'fast-check';

describe('Feature: breakbeat-music-streaming, Property 1: File Format Validation Consistency', () => {
  test('should accept only supported formats', () => {
    fc.assert(fc.property(
      fc.record({
        name: fc.string(),
        type: fc.oneof(
          fc.constant('audio/mp3'),
          fc.constant('audio/wav'), 
          fc.constant('audio/m4a'),
          fc.constant('image/jpeg'), // unsupported
          fc.constant('text/plain')  // unsupported
        )
      }),
      (file) => {
        const isSupported = ['audio/mp3', 'audio/wav', 'audio/m4a'].includes(file.type);
        const result = FileHandler.validateFile(file);
        
        if (isSupported) {
          expect(result.valid).toBe(true);
        } else {
          expect(result.valid).toBe(false);
          expect(result.error).toContain('format tidak didukung');
        }
      }
    ), { numRuns: 100 });
  });
});
```

#### Testing Configuration

**Jest Configuration:**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/test-utils/**'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testTimeout: 10000
};
```

**Property Test Configuration:**
```javascript
const propertyTestConfig = {
  numRuns: 100,
  timeout: 5000,
  seed: Math.random(),
  verbose: true,
  examples: true // Include example-based tests
};
```

#### Mock Strategy untuk Browser APIs

**localStorage Mock:**
```javascript
const localStorageMock = {
  store: {},
  getItem: jest.fn(key => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => { localStorageMock.store[key] = value; }),
  removeItem: jest.fn(key => { delete localStorageMock.store[key]; }),
  clear: jest.fn(() => { localStorageMock.store = {}; })
};
```

**Web Audio API Mock:**
```javascript
const AudioContextMock = jest.fn(() => ({
  createAnalyser: jest.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: jest.fn()
  })),
  createBufferSource: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  })),
  decodeAudioData: jest.fn(() => Promise.resolve({
    duration: 180,
    sampleRate: 44100,
    numberOfChannels: 2
  }))
}));
```

#### Test Data Generators

**Track Generator untuk Property Tests:**
```javascript
const trackGenerator = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  artist: fc.string({ minLength: 1, maxLength: 50 }),
  album: fc.option(fc.string({ maxLength: 50 })),
  genre: fc.oneof(
    fc.constant('Breakbeat'),
    fc.constant('Drum & Bass'),
    fc.constant('Big Beat'),
    fc.constant('Nu Skool Breaks')
  ),
  bpm: fc.option(fc.integer({ min: 60, max: 200 })),
  duration: fc.integer({ min: 30, max: 600 }) // 30 seconds to 10 minutes
});
```

**Playlist Generator:**
```javascript
const playlistGenerator = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.option(fc.string({ maxLength: 200 })),
  trackIds: fc.array(fc.string(), { minLength: 0, maxLength: 100 })
});
```

#### Performance Testing

**Audio Processing Performance:**
- BPM detection should complete within 5 seconds for typical track lengths
- File loading should handle files up to 100MB without blocking UI
- localStorage operations should complete within 100ms for typical data sizes

**Memory Usage Testing:**
- Monitor memory usage during large file operations
- Ensure proper cleanup of audio buffers and object URLs
- Test for memory leaks during extended playback sessions

#### Browser Compatibility Testing

**Target Browsers:**
- Chrome 90+ (primary target)
- Firefox 88+ 
- Safari 14+
- Edge 90+

**API Compatibility Tests:**
- File API support and behavior differences
- Web Audio API feature availability
- localStorage quota and behavior variations
- HTML5 Audio API compatibility

#### Continuous Integration

**Test Pipeline:**
1. **Lint**: ESLint untuk code quality
2. **Unit Tests**: Jest dengan coverage reporting
3. **Property Tests**: fast-check dengan extended runs
4. **Integration Tests**: End-to-end workflows
5. **Performance Tests**: Benchmark critical operations
6. **Browser Tests**: Cross-browser compatibility via Playwright

**Coverage Requirements:**
- Unit test coverage: minimum 85% untuk semua metrics
- Property test coverage: semua correctness properties harus diimplementasikan
- Integration test coverage: semua user workflows utama
- Error path coverage: semua error conditions harus ditest

Strategi testing ini memastikan bahwa aplikasi tidak hanya berfungsi untuk kasus-kasus spesifik, tetapi juga mempertahankan correctness properties di seluruh spektrum input dan kondisi yang mungkin dihadapi pengguna.