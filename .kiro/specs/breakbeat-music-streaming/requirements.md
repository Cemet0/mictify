# Dokumen Requirements

## Pendahuluan

Aplikasi streaming musik berbasis web yang dikhususkan untuk musik breakbeat, DJ, dan remix. Aplikasi ini adalah aplikasi frontend-only yang berjalan sepenuhnya di browser menggunakan vanilla JavaScript, HTML, dan CSS. Pengguna dapat mengelola koleksi musik breakbeat mereka dengan data tersimpan di browser localStorage. Aplikasi ini tidak memerlukan backend server atau database eksternal.

## Glossary

- **Sistem**: Aplikasi streaming musik breakbeat berbasis web (frontend-only)
- **Pengguna**: Individu yang menggunakan aplikasi untuk mengelola dan memutar musik di browser mereka
- **Track**: File audio musik individual (breakbeat, DJ mix, atau remix) yang dimuat dari perangkat lokal
- **Playlist**: Kumpulan track yang diorganisir oleh pengguna
- **Audio_Player**: Komponen yang memutar file audio menggunakan HTML5 Audio API
- **Library**: Koleksi lengkap track yang tersimpan di browser localStorage
- **File_Handler**: Komponen yang menangani file audio dari perangkat lokal menggunakan File API
- **Metadata**: Informasi tentang track (judul, artis, BPM, genre, dll)
- **LocalStorage**: Penyimpanan browser untuk menyimpan metadata dan referensi file

## Requirements

### Requirement 1: Muat dan Kelola File Musik Lokal

**User Story:** Sebagai pengguna, saya ingin memuat file musik dari perangkat lokal ke aplikasi, sehingga saya dapat membangun library musik breakbeat saya di browser.

#### Acceptance Criteria

1. WHEN pengguna memilih file audio dari perangkat lokal menggunakan file input, THE File_Handler SHALL menerima file dengan format MP3, WAV, atau M4A
2. WHEN file dimuat, THE Sistem SHALL mengekstrak metadata dasar (judul, artis, album, durasi) menggunakan browser API
3. WHEN file sedang diproses, THE Sistem SHALL menampilkan indikator loading
4. IF file yang dipilih bukan format audio yang didukung, THEN THE Sistem SHALL menampilkan pesan error dan menolak file tersebut
5. WHEN file berhasil dimuat, THE Sistem SHALL menyimpan metadata dan referensi file ke localStorage dan menambahkannya ke Library

### Requirement 2: Putar Musik dengan Audio Player

**User Story:** Sebagai pengguna, saya ingin memutar musik dari library saya, sehingga saya dapat mendengarkan koleksi breakbeat saya.

#### Acceptance Criteria

1. WHEN pengguna memilih track dari Library, THE Audio_Player SHALL memutar track tersebut
2. WHILE track sedang diputar, THE Audio_Player SHALL menampilkan kontrol play, pause, stop, next, dan previous
3. WHILE track sedang diputar, THE Audio_Player SHALL menampilkan progress bar yang menunjukkan posisi pemutaran saat ini
4. WHEN pengguna mengklik posisi pada progress bar, THE Audio_Player SHALL melompat ke posisi waktu tersebut
5. WHEN pengguna mengatur volume, THE Audio_Player SHALL menyesuaikan volume pemutaran sesuai nilai yang dipilih
6. WHEN track selesai diputar, THE Audio_Player SHALL otomatis memutar track berikutnya dalam antrian

### Requirement 3: Organisasi dengan Playlist

**User Story:** Sebagai pengguna, saya ingin membuat dan mengelola playlist, sehingga saya dapat mengorganisir musik berdasarkan mood, acara, atau kategori tertentu.

#### Acceptance Criteria

1. WHEN pengguna membuat playlist baru, THE Sistem SHALL menyimpan playlist dengan nama yang diberikan pengguna
2. WHEN pengguna menambahkan track ke playlist, THE Sistem SHALL menambahkan track tersebut ke daftar playlist tanpa menghapusnya dari Library
3. WHEN pengguna menghapus track dari playlist, THE Sistem SHALL menghapus track dari playlist tetapi tetap mempertahankannya di Library
4. WHEN pengguna mengubah urutan track dalam playlist, THE Sistem SHALL menyimpan urutan baru tersebut
5. WHEN pengguna menghapus playlist, THE Sistem SHALL menghapus playlist tetapi mempertahankan semua track di Library

### Requirement 4: Pencarian dan Filter

**User Story:** Sebagai pengguna, saya ingin mencari dan memfilter musik di library saya, sehingga saya dapat dengan cepat menemukan track yang saya inginkan.

#### Acceptance Criteria

1. WHEN pengguna memasukkan query pencarian, THE Sistem SHALL menampilkan track yang cocok dengan judul, artis, atau album
2. WHEN pengguna memfilter berdasarkan genre, THE Sistem SHALL menampilkan hanya track dengan genre yang dipilih
3. WHEN pengguna memfilter berdasarkan BPM range, THE Sistem SHALL menampilkan hanya track dalam rentang BPM tersebut
4. WHEN hasil pencarian atau filter kosong, THE Sistem SHALL menampilkan pesan bahwa tidak ada track yang ditemukan
5. WHEN pengguna menghapus filter atau query pencarian, THE Sistem SHALL menampilkan kembali semua track di Library

### Requirement 5: Penyimpanan Metadata Track

**User Story:** Sebagai pengguna, saya ingin metadata track (judul, artis, BPM, dll) tersimpan dan ditampilkan dengan benar, sehingga saya dapat melihat informasi lengkap tentang setiap track.

#### Acceptance Criteria

1. THE Sistem SHALL menyimpan metadata track (judul, artis, album, genre, BPM, key) dalam localStorage browser
2. WHEN track ditampilkan di Library, THE Sistem SHALL menampilkan metadata yang tersedia untuk setiap track
3. WHEN track diputar, THE Audio_Player SHALL menampilkan metadata track yang sedang diputar
4. WHEN pengguna mengedit metadata track, THE Sistem SHALL memperbarui data di localStorage
5. WHEN metadata track diakses, THE Sistem SHALL mengembalikan informasi yang lengkap dan akurat dari localStorage

### Requirement 6: Antarmuka Responsif

**User Story:** Sebagai pengguna, saya ingin mengakses aplikasi dari desktop dan mobile browser, sehingga saya dapat memutar musik dari perangkat apapun.

#### Acceptance Criteria

1. WHEN aplikasi diakses dari desktop browser, THE Sistem SHALL menampilkan layout dengan sidebar navigasi dan area konten utama
2. WHEN aplikasi diakses dari mobile browser, THE Sistem SHALL menampilkan layout yang dioptimalkan untuk layar kecil dengan navigasi hamburger menu
3. WHEN pengguna memutar musik di mobile browser, THE Sistem SHALL menampilkan kontrol player yang mudah diakses dengan jari
4. WHILE aplikasi berjalan, THE Sistem SHALL menyesuaikan layout secara otomatis saat ukuran viewport berubah
5. WHEN pengguna berinteraksi dengan elemen UI, THE Sistem SHALL memberikan feedback visual yang jelas di semua ukuran layar

### Requirement 7: Penyimpanan dan Persistensi Data

**User Story:** Sebagai pengguna, saya ingin data musik dan playlist saya tersimpan di browser, sehingga saya tidak kehilangan koleksi musik saya saat membuka aplikasi kembali.

#### Acceptance Criteria

1. WHEN pengguna memuat track, THE Sistem SHALL menyimpan metadata track di localStorage browser
2. WHEN pengguna membuat atau memodifikasi playlist, THE Sistem SHALL menyimpan perubahan ke localStorage
3. WHEN pengguna menutup aplikasi dan membukanya kembali, THE Sistem SHALL memuat kembali metadata Library dan playlist dari localStorage
4. WHEN pengguna membersihkan browser cache atau localStorage, THE Sistem SHALL menampilkan Library kosong dan meminta pengguna memuat ulang file musik
5. IF terjadi error saat menyimpan data ke localStorage, THEN THE Sistem SHALL menampilkan pesan error kepada pengguna

### Requirement 8: Mode Single User

**User Story:** Sebagai pengguna, saya ingin menggunakan aplikasi tanpa perlu login, sehingga saya dapat langsung memutar musik di browser saya.

#### Acceptance Criteria

1. WHEN pengguna membuka aplikasi, THE Sistem SHALL langsung menampilkan antarmuka utama tanpa halaman login
2. THE Sistem SHALL menyimpan semua data di localStorage browser pengguna saat ini
3. WHEN pengguna menggunakan browser berbeda atau perangkat berbeda, THE Sistem SHALL menampilkan Library kosong karena localStorage bersifat lokal per browser
4. THE Sistem SHALL tidak memerlukan autentikasi atau manajemen akun pengguna
5. WHEN pengguna mengakses aplikasi, THE Sistem SHALL memuat data dari localStorage browser yang sama

### Requirement 9: Fitur Khusus DJ - BPM Detection

**User Story:** Sebagai DJ, saya ingin sistem mendeteksi BPM track secara otomatis menggunakan library JavaScript, sehingga saya dapat dengan mudah mencari track dengan tempo yang sesuai untuk mixing.

#### Acceptance Criteria

1. WHEN track dimuat tanpa metadata BPM, THE Sistem SHALL menganalisis audio menggunakan Web Audio API dan library BPM detection JavaScript untuk mendeteksi BPM secara otomatis
2. WHEN deteksi BPM selesai, THE Sistem SHALL menyimpan nilai BPM ke metadata track di localStorage
3. IF deteksi BPM gagal atau tidak akurat, THEN THE Sistem SHALL mengizinkan pengguna untuk mengedit BPM secara manual
4. WHEN pengguna mengurutkan Library berdasarkan BPM, THE Sistem SHALL menampilkan track dari BPM terendah ke tertinggi atau sebaliknya
5. WHEN pengguna mencari track dengan BPM range tertentu, THE Sistem SHALL menampilkan hanya track dalam rentang tersebut

### Requirement 10: Queue Management

**User Story:** Sebagai pengguna, saya ingin mengelola antrian pemutaran, sehingga saya dapat mengatur urutan track yang akan diputar selanjutnya.

#### Acceptance Criteria

1. WHEN pengguna menambahkan track ke queue, THE Sistem SHALL menambahkan track ke akhir antrian pemutaran
2. WHEN pengguna mengubah urutan track dalam queue, THE Sistem SHALL memperbarui urutan pemutaran
3. WHEN pengguna menghapus track dari queue, THE Sistem SHALL menghapus track tersebut dari antrian tanpa menghentikan pemutaran saat ini
4. WHEN queue kosong dan track saat ini selesai, THE Audio_Player SHALL berhenti memutar
5. WHILE queue ditampilkan, THE Sistem SHALL menunjukkan track mana yang sedang diputar saat ini

### Requirement 11: Crossfade Antar Track

**User Story:** Sebagai DJ, saya ingin track berikutnya mulai memutar sebelum track saat ini selesai dengan efek crossfade, sehingga transisi antar track terdengar smooth dan profesional.

#### Acceptance Criteria

1. WHEN crossfade diaktifkan, THE Audio_Player SHALL mulai memutar track berikutnya sebelum track saat ini selesai
2. WHEN crossfade berlangsung, THE Audio_Player SHALL secara bertahap menurunkan volume track saat ini sambil menaikkan volume track berikutnya
3. WHEN pengguna mengatur durasi crossfade, THE Sistem SHALL menyimpan preferensi durasi (misalnya 3, 5, atau 10 detik)
4. WHERE crossfade dinonaktifkan, THE Audio_Player SHALL memutar track berikutnya hanya setelah track saat ini selesai sepenuhnya
5. WHILE crossfade berlangsung, THE Sistem SHALL menampilkan indikator visual bahwa transisi sedang terjadi

