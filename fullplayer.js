var FullPlayer={
    bgGlowEnabled: true,
    init(){
        try {
            var saved = localStorage.getItem('nanz_bg_glow_enabled');
            if (saved !== null) FullPlayer.bgGlowEnabled = (saved === '1');
        } catch (e) {}
        gid('full-container').innerHTML=`
        <div id="full-player" class="fixed flex flex-col justify-between z-[170] text-white p-4 pt-safe sm:p-6 sm:pt-safe" style="display:none;transition:transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);will-change:transform;transform:translate3d(0,100%,0);top:0;left:0;right:0;bottom:0;overflow:hidden;touch-action:none;">
            
            <!-- Blurred Artwork Background Container -->
            <div class="player-bg-container">
                <img id="full-bg-artwork" src="" class="player-bg-blur-img" alt="" />
                <img id="full-bg-artwork-next" src="" class="player-bg-blur-img transition-opacity duration-300" style="opacity:0; z-index:2;" alt="" />
                <div id="full-bg-glow" class="player-bg-glow"></div>
                <div class="player-bg-vignette"></div>
            </div>

            <!-- Top Header (Padding top 16-20px) -->
            <div class="relative z-10 flex justify-between items-center flex-shrink-0 pt-1 pb-1">
                <button onclick="FullPlayer.close()" class="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full active:scale-90 transition-all cursor-pointer" title="Tutup Player"><i data-lucide="chevron-down" class="w-7 h-7"></i></button>
                <div class="text-center">
                    <p id="full-header-tag" class="text-[9px] uppercase tracking-[0.22em] text-[#a0a5b0] font-bold transition-all duration-300">Sedang Diputar</p>
                    <p id="full-header-artist" class="text-xs font-bold text-white/90 truncate max-w-[180px] mt-0.5 transition-all duration-300"></p>
                </div>
                <!-- Tombol Opsi dirapatkan ke kanan (hamburger menu) -->
                <div class="flex items-center gap-1">
                    <button id="full-bg-glow-toggle" onclick="FullPlayer.toggleBgGlow()" class="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full active:scale-90 transition-all cursor-pointer" title="Matikan/Nyalakan Latar Bergerak">
                        <i data-lucide="audio-waveform" class="w-5 h-5"></i>
                    </button>
                    <button onclick="FullPlayer.openMoreSheet()" class="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full active:scale-90 transition-all cursor-pointer" title="Opsi"><i data-lucide="more-vertical" class="w-5 h-5"></i></button>
                </div>
            </div>

            <!-- Toggle Segment: Cover / Lyrics (Posisi Lingkaran Orange) -->
            <div class="relative z-10 flex justify-center items-center my-1 flex-shrink-0">
                <div class="inline-flex items-center bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/15 shadow-inner">
                    <button id="full-tab-cover" onclick="FullPlayer.switchView('cover')" class="px-4 py-1 rounded-full text-xs font-bold transition-all text-white bg-white/20 shadow-md cursor-pointer">
                        Cover
                    </button>
                    <button id="full-tab-lyrics" onclick="FullPlayer.switchView('lyrics')" class="px-4 py-1 rounded-full text-xs font-bold transition-all text-white/60 hover:text-white bg-transparent cursor-pointer">
                        Lirik
                    </button>
                </div>
            </div>

            <!-- Cover Artwork / Compact Lyrics Container (Slightly larger ~85-88% Width) -->
            <div class="relative z-10 flex-1 flex items-center justify-center my-auto px-4 py-1" style="min-height:0;overflow:hidden;">
                <div id="full-cover-lyrics-wrap" class="relative w-[86%] sm:w-[88%] max-w-[340px] aspect-square flex items-center justify-center transition-all duration-300">
                    <!-- 1. Cover View Container -->
                    <div id="full-cover-view" class="w-full h-full relative flex items-center justify-center">
                        <img id="full-cover" src="" class="w-full h-full object-cover rounded-2xl transition-transform duration-300 border border-white/10 shadow-2xl" />
                        
                        <!-- Next Cover Overlay for Smooth Transition -->
                        <div id="full-cover-next-overlay" class="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-0 z-10">
                            <img id="full-cover-next-img" src="" class="w-full h-full object-cover rounded-2xl border border-white/10 shadow-2xl" />
                        </div>

                        <!-- Loading & Overlay -->
                        <div id="full-cover-overlay" class="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-black/65 backdrop-blur-md p-4 transition-opacity duration-200 opacity-0 pointer-events-none z-20">
                            <div id="full-cover-icon" class="mb-3 text-white flex items-center justify-center"></div>
                            <span id="full-cover-text" class="text-xs font-bold text-white leading-relaxed text-center drop-shadow-md px-2"></span>
                        </div>
                    </div>

                    <!-- 2. Compact Inline Lyrics View Container -->
                    <div id="full-lyrics-view" class="hidden w-full h-full relative rounded-2xl bg-black/50 backdrop-blur-2xl border border-white/15 p-3.5 overflow-hidden flex flex-col shadow-2xl">
                        <!-- Mini Header: small cover thumbnail + title/artist, stays above lyrics (does NOT replace the cover) -->
                        <div class="flex items-center gap-3 pb-3 mb-1 border-b border-white/10 shrink-0 relative z-10">
                            <img id="full-lyrics-mini-cover" src="" class="w-11 h-11 rounded-lg object-cover shadow-md border border-white/10 shrink-0" />
                            <div class="min-w-0 flex-1">
                                <p id="full-lyrics-mini-title" class="text-sm font-bold text-white truncate"></p>
                                <p id="full-lyrics-mini-artist" class="text-xs text-white/60 truncate"></p>
                            </div>
                        </div>

                        <!-- Lyrics Scrollable Container -->
                        <div id="full-inline-lyrics-scroll" class="flex-1 w-full overflow-y-auto no-scrollbar scroll-smooth relative z-10">
                            <div id="full-inline-lyrics-loading" class="hidden h-full flex flex-col items-center justify-center text-white/50 text-xs gap-2 py-8">
                                <div class="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                <span>Memuat lirik...</span>
                            </div>
                            <div id="full-inline-lyrics-empty" class="hidden h-full flex flex-col items-center justify-center text-white/50 text-xs text-center py-8">
                                <svg class="w-8 h-8 opacity-40 mb-2 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                                <span>Lirik tidak tersedia</span>
                            </div>
                            <div id="full-inline-lyrics-content" class="min-h-full flex flex-col justify-center text-left"></div>
                        </div>

                        <!-- Floating Fullscreen Lyrics & Sync Bar (at bottom of compact box) -->
                        <div class="relative z-20 shrink-0 pt-2 flex items-center justify-between border-t border-white/10 mt-1 gap-2">
                            <!-- Sync +/- buttons -->
                            <div class="flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1 border border-white/10">
                                <span class="text-[10px] text-white/60 font-semibold mr-0.5">Sync</span>
                                <button onclick="lyricSyncPrev()" class="w-5 h-5 rounded-full bg-white/15 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition cursor-pointer" title="Lirik Mundur 1 Baris">-</button>
                                <span id="full-inline-sync-badge" class="hidden text-[10px] font-bold text-rose-400"></span>
                                <button onclick="lyricSyncNext()" class="w-5 h-5 rounded-full bg-white/15 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition cursor-pointer" title="Lirik Maju 1 Baris">+</button>
                            </div>

                            <button onclick="toggleLyrics()" class="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[11px] font-bold border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-md cursor-pointer" title="Buka Lirik Penuh">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                                <span>Lirik Penuh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Song Info + Progress + Controls + Grid -->
            <div class="relative z-10 flex-shrink-0 w-full max-w-md mx-auto space-y-3 pb-2">
                <!-- Song Info (Title + Heart + Offline on same line) -->
                <div class="flex items-center justify-between gap-3 px-1">
                    <div class="flex-1 min-w-0 truncate relative" id="full-meta-container">
                        <div id="full-meta-current" class="transition-opacity duration-300">
                            <div class="flex items-center gap-2">
                                <h2 id="full-title" class="text-xl sm:text-2xl font-black text-white truncate leading-tight">Pilih lagu</h2>
                                <span id="full-status-tag" class="hidden px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border border-white/20 text-white bg-white/10 shrink-0"></span>
                            </div>
                            <p id="full-artist" class="text-white/70 text-xs sm:text-sm font-medium truncate cursor-pointer hover:text-white mt-1" onclick="FullPlayer.openArtist()"></p>
                        </div>

                        <!-- Overlay for Next Title & Artist (Clean Text Crossfade) -->
                        <div id="full-meta-next" class="absolute inset-0 flex flex-col justify-center pointer-events-none transition-opacity duration-300 opacity-0 z-10">
                            <div class="flex items-center gap-2">
                                <h2 id="full-title-next" class="text-xl sm:text-2xl font-black text-white truncate leading-tight"></h2>
                                <span id="full-next-countdown-badge" class="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border border-white/30 text-white bg-white/20 shrink-0">NEXT</span>
                            </div>
                            <p id="full-artist-next" class="text-white/80 text-xs sm:text-sm font-medium truncate mt-1"></p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button id="full-offline-btn" onclick="toggleCurrentOffline(); if(typeof event !== 'undefined') event.stopPropagation();" class="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center active:scale-90 transition-all shrink-0 cursor-pointer shadow-md" title="Simpan ke Mode Offline PWA">
                            <i data-lucide="wifi-off" class="w-5 h-5"></i>
                        </button>
                        <button id="full-like-btn" onclick="toggleCurrentLike(); if(typeof event !== 'undefined') event.stopPropagation();" class="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center active:scale-90 transition-all shrink-0 cursor-pointer shadow-md" title="Sukai Lagu">
                            <i data-lucide="heart" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>

                <!-- Progress Bar (0:45 ───────────── 1:54) -->
                <div class="flex items-center gap-3 px-1 my-2">
                    <span id="time-curr" class="text-[11px] text-white/70 font-mono shrink-0 w-8 text-right font-semibold">0:00</span>
                    <div class="relative flex-1 h-1.5 bg-white/20 rounded-full flex items-center group cursor-pointer">
                        <input type="range" id="seek-bar" min="0" max="100" value="0" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" oninput="SK(this.value)" />
                        <div id="full-progress" class="relative h-full bg-white rounded-full transition-all duration-75" style="width:0%;">
                            <div class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                    <span id="time-dur" class="text-[11px] text-white/70 font-mono shrink-0 w-8 font-semibold">0:00</span>
                </div>

                <!-- Spotify Volume Control -->
                <div class="flex items-center gap-3 px-2 pt-1 pb-1.5">
                    <button id="full-vol-icon-btn" onclick="toggleMute()" class="text-white/70 hover:text-white transition cursor-pointer p-1 rounded-full active:scale-90 shrink-0" title="Mute / Unmute">
                        <i id="full-vol-icon" data-lucide="volume-2" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                    </button>
                    <div class="relative flex-1 h-1.5 bg-white/20 rounded-full flex items-center group cursor-pointer">
                        <input type="range" id="vol-bar" min="0" max="100" value="100" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" oninput="setVolume(this.value)" />
                        <div id="full-vol-progress" class="relative h-full bg-white rounded-full transition-all duration-75" style="width:100%;">
                            <div class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                    <span id="full-vol-text" class="text-[11px] text-white/70 font-mono font-semibold w-8 text-right shrink-0">100%</span>
                </div>

                <!-- Music Controls (Shuffle Prev Play Next Repeat) -->
                <div class="flex items-center justify-between px-2 py-1">
                    <button id="full-shuffle-btn" onclick="SF()" class="relative text-white/70 hover:text-white active:scale-90 w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer" title="Acak (Shuffle)">
                        <i data-lucide="shuffle" class="w-5 h-5"></i>
                        <span id="full-shuffle-dot" class="hidden absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full"></span>
                    </button>
                    <button id="full-prev-btn" onclick="PV()" class="text-white/80 hover:text-white active:scale-90 w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer" title="Lagu Sebelumnya">
                        <i data-lucide="skip-back" class="w-6 h-6 fill-current"></i>
                    </button>
                    <button onclick="TP()" id="full-play-btn-wrap" class="relative bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-white/20 cursor-pointer flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 shrink-0">
                        <div id="full-play-btn" class="flex items-center justify-center">
                            <i data-lucide="play" class="w-8 h-8 fill-current ml-0.5"></i>
                        </div>
                    </button>
                    <button id="full-next-btn" onclick="NX()" class="text-white/80 hover:text-white active:scale-90 w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer" title="Lagu Berikutnya">
                        <i data-lucide="skip-forward" class="w-6 h-6 fill-current"></i>
                    </button>
                    <button onclick="TR()" id="btn-repeat" class="relative text-white/70 hover:text-white active:scale-90 w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer" title="Ulang (Repeat)">
                        <i data-lucide="repeat" class="w-5 h-5"></i>
                        <span id="repeat-one" class="hidden absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] font-black text-white">1</span>
                    </button>
                </div>

            </div>
        </div>`;

        gid('lyrics-container').innerHTML=`
        <div id="lyrics-overlay" class="fixed flex flex-col z-[200] text-white" style="display:none;transition:transform 0.35s ease-out;transform:translateY(100%);top:0;left:0;width:100%;height:100%;overflow:hidden;touch-action:none;">
            
            <!-- Blurred Artwork Background Container -->
            <div class="player-bg-container">
                <img id="lyrics-bg-blur" src="" class="player-bg-blur-img" alt="" />
                <div id="lyrics-bg-glow" class="player-bg-glow"></div>
                <div class="player-bg-vignette"></div>
            </div>

            <!-- Mobile Header -->
            <div class="md:hidden flex justify-between items-center p-4 pt-safe flex-shrink-0 bg-black/30 backdrop-blur-md border-b border-white/10 relative z-20">
                <div class="flex items-center gap-3 overflow-hidden">
                    <img id="lyrics-header-cover" src="" class="w-12 h-12 rounded-md object-cover shadow-md flex-shrink-0 bg-white/5" />
                    <div class="flex flex-col min-w-0">
                        <span id="lyrics-header-title" class="font-bold text-white text-base truncate">Lirik</span>
                        <span id="lyrics-header-artist" class="text-white/70 text-sm truncate"></span>
                    </div>
                </div>
                <button onclick="toggleLyrics()" class="text-white/70 hover:text-white p-2 rounded-full active:scale-90 flex-shrink-0 transition-all bg-white/10 ml-3"><i data-lucide="chevron-down" class="w-6 h-6"></i></button>
            </div>

            <!-- Small floating toggle for the moving Apple-Music-style background -->
            <button id="lyrics-bg-glow-toggle" onclick="FullPlayer.toggleBgGlow()" class="md:hidden absolute top-[100px] left-6 z-30 bg-black/40 backdrop-blur-md w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all" title="Matikan/Nyalakan Latar Bergerak">
                <i data-lucide="audio-waveform" class="w-4 h-4"></i>
            </button>

            <!-- Floating Sync Controls -->
            <div class="md:hidden absolute top-[100px] right-6 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <button onclick="lyricSyncPrev()" class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full active:scale-90 flex items-center justify-center transition-all"><i data-lucide="minus" class="w-4 h-4"></i></button>
                <p id="lyric-sync-badge-mobile" class="hidden text-xs font-bold text-white tracking-wide">+0</p>
                <button onclick="lyricSyncNext()" class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full active:scale-90 flex items-center justify-center transition-all"><i data-lucide="plus" class="w-4 h-4"></i></button>
            </div>

            <!-- Desktop Close Button -->
            <button onclick="toggleLyrics()" class="hidden md:flex absolute top-8 right-8 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full active:scale-90 transition-all cursor-pointer">
                <i data-lucide="chevron-down" class="w-8 h-8"></i>
            </button>
            
            <div class="flex-1 flex flex-col md:flex-row w-full h-full overflow-hidden relative z-10">
                <!-- Left Side: Lyrics Scroll -->
                <div id="lyrics-scroll-container" class="w-full md:w-3/5 h-full overflow-y-auto px-6 md:px-16 hide-scrollbar z-10 relative">
                    <div class="pt-[30vh] pb-[60vh] w-full max-w-3xl mx-auto md:mx-0">
                        <div id="lyrics-loading" class="flex justify-center items-center h-[30vh] w-full">
                            <div class="w-10 h-10 border-4 border-[#cfd3d8] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div id="lyrics-content" class="hidden w-full"></div>
                        <div id="lyrics-empty" class="hidden flex justify-center items-center h-[30vh] w-full text-white/50">
                            <div class="text-center">
                                <i data-lucide="music" class="w-20 h-20 mx-auto mb-4 opacity-30"></i>
                                <p class="text-lg">Lirik tidak tersedia</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Side: Cover & Info -->
                <div class="hidden md:flex w-2/5 flex-col justify-center items-start p-12 z-10 pl-16">
                    <img id="lyrics-desktop-cover" src="" class="w-[350px] max-w-full aspect-square rounded-2xl mb-8 object-cover bg-white/5 shadow-2xl border border-white/10" />
                    <h2 id="lyrics-desktop-title" class="font-bold text-white text-3xl mb-2 line-clamp-2 leading-tight">Lirik</h2>
                    <p id="lyrics-desktop-artist" class="text-white/70 text-lg line-clamp-1"></p>
                    <div class="flex items-center justify-start gap-3 mt-8">
                        <button onclick="lyricSyncPrev()" title="Sinkron mundur 1 lirik" class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full active:scale-90 flex items-center justify-center transition-all"><i data-lucide="minus" class="w-5 h-5"></i></button>
                        <p id="lyric-sync-badge-desktop" class="text-xs font-bold text-white tracking-wide">+0</p>
                        <button onclick="lyricSyncNext()" title="Sinkron lanjut 1 lirik" class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full active:scale-90 flex items-center justify-center transition-all"><i data-lucide="plus" class="w-5 h-5"></i></button>
                    </div>
                </div>
            </div>
        </div>`;
        lucide.createIcons();
        FullPlayer.updateBgGlowToggleUI();
    },
    currentViewMode: 'cover',
    switchView(mode) {
        FullPlayer.currentViewMode = mode;
        var coverView = gid('full-cover-view');
        var lyricsView = gid('full-lyrics-view');
        var tabCover = gid('full-tab-cover');
        var tabLyrics = gid('full-tab-lyrics');
        var wrap = gid('full-cover-lyrics-wrap');

        if (mode === 'lyrics') {
            if (coverView) coverView.classList.add('hidden');
            if (lyricsView) lyricsView.classList.remove('hidden');
            // Grow the box to fill available height instead of staying square,
            // so the lyrics list has room below the small cover header.
            if (wrap) {
                wrap.classList.remove('aspect-square');
                wrap.classList.add('h-full');
            }

            // Fill the mini header (small cover thumbnail stays visible, lyrics go below it — not replacing it)
            var miniCover = gid('full-lyrics-mini-cover');
            var miniTitle = gid('full-lyrics-mini-title');
            var miniArtist = gid('full-lyrics-mini-artist');
            var mainCoverImg = gid('full-cover');
            if (miniCover && mainCoverImg) miniCover.src = mainCoverImg.src || '';
            if (miniTitle) miniTitle.textContent = (gid('full-title') ? gid('full-title').textContent : '') || '';
            if (miniArtist) miniArtist.textContent = (gid('full-artist') ? gid('full-artist').textContent : '') || '';

            if (tabCover) {
                tabCover.className = 'px-4 py-1 rounded-full text-xs font-bold transition-all text-white/60 hover:text-white bg-transparent cursor-pointer';
            }
            if (tabLyrics) {
                tabLyrics.className = 'px-4 py-1 rounded-full text-xs font-bold transition-all text-white bg-white/20 shadow-md cursor-pointer';
            }

            if (typeof setupLyricScrollListener === 'function') {
                setupLyricScrollListener();
            }
            if (typeof ULH === 'function') {
                ULH(typeof S !== 'undefined' ? (S.pt || 0) : 0, true);
            }
        } else {
            if (lyricsView) lyricsView.classList.add('hidden');
            if (coverView) coverView.classList.remove('hidden');
            if (wrap) {
                wrap.classList.add('aspect-square');
                wrap.classList.remove('h-full');
            }

            if (tabCover) {
                tabCover.className = 'px-4 py-1 rounded-full text-xs font-bold transition-all text-white bg-white/20 shadow-md cursor-pointer';
            }
            if (tabLyrics) {
                tabLyrics.className = 'px-4 py-1 rounded-full text-xs font-bold transition-all text-white/60 hover:text-white bg-transparent cursor-pointer';
            }
        }
    },
    isOpen: false,
    open(){
        var fp=gid('full-player');
        if(!fp) return;
        FullPlayer.isOpen = true;
        fp.style.display='flex';
        document.body.style.overflow='hidden';
        void fp.offsetHeight;
        fp.style.transform='translate3d(0,0,0)';
        if(typeof MP !== 'undefined' && MP.hide) MP.hide();
        requestAnimationFrame(function(){
            try{
                updateSleepBadge();
                updateSpeedBadge();
                if(typeof UB==='function')UB();
                if(typeof updateLikeButtons==='function')updateLikeButtons();
                if(typeof updateOfflineButtons==='function')updateOfflineButtons();
                if(typeof updateVolumeUI==='function')updateVolumeUI();
                if(S.ct && typeof FullPlayer.updateBeats === 'function') FullPlayer.updateBeats(S.ct);
            }catch(e){}
        });
    },
    close(){
        var fp=gid('full-player');
        if(!fp) return;
        FullPlayer.isOpen = false;
        fp.style.transform='translate3d(0,100%,0)';
        document.body.style.overflow='';
        setTimeout(function(){
            fp.style.display='none';
            if(typeof S!=='undefined'&&!S.lo&&typeof MP!=='undefined')MP.show();
        },350);
    },
    openArtist(){if(S.ct&&S.ct.artistId){FullPlayer.close();setTimeout(function(){Artist.open(S.ct.artistId,S.ct.artist);},400);}},
    openMoreSheet() {
        var existing = gid('full-more-sheet');
        if (existing) existing.remove();

        var sheet = document.createElement('div');
        sheet.id = 'full-more-sheet';
        sheet.className = 'fixed inset-0 z-[250] flex items-end justify-center bg-black/60 ';
        sheet.onclick = function(e) { if (e.target === sheet) sheet.remove(); };

        sheet.innerHTML = `
        <div class="bg-[#181922] w-full max-w-md rounded-t-3xl p-6 border-t border-white/10" style="animation:slideUp 0.25s ease-out forwards;">
            <div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5"></div>
            
            <div class="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-white/5">
                <img src="${(S.ct && S.ct.cover) ? S.ct.cover : FI}" class="w-12 h-12 rounded-xl object-cover" onerror="this.src='${FI}'" />
                <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-white text-sm truncate">${(S.ct && S.ct.title) ? es(S.ct.title) : 'Pilih Lagu'}</h4>
                    <p class="text-xs text-[#a0a5b0] truncate">${(S.ct && S.ct.artist) ? es(S.ct.artist) : ''}</p>
                </div>
            </div>

            <div class="grid grid-cols-4 gap-3 mb-4">
                <button onclick="toggleAutoNext(); gid('full-more-sheet').remove();" class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition cursor-pointer" style="opacity: ${S.autoNext ? '1' : '0.5'};">
                    <i data-lucide="skip-forward" class="w-5 h-5 ${S.autoNext ? 'text-rose-400' : 'text-white'}"></i>
                    <span class="text-xs font-semibold ${S.autoNext ? 'text-rose-400' : 'text-white/90'}">Auto Next</span>
                </button>
                <button onclick="gid('full-more-sheet').remove();openEqualizer();" class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition cursor-pointer">
                    <i data-lucide="sliders" class="w-5 h-5 text-white"></i>
                    <span class="text-xs font-semibold text-white/90">EQ</span>
                </button>
                <button onclick="gid('full-more-sheet').remove();openSleepTimer();" class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition cursor-pointer">
                    <i data-lucide="clock" class="w-5 h-5 text-white"></i>
                    <span class="text-xs font-semibold text-white/90">Timer</span>
                </button>
                <button onclick="gid('full-more-sheet').remove();addCurrentToPlaylist();" class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition cursor-pointer">
                    <i data-lucide="list-plus" class="w-5 h-5 text-white"></i>
                    <span class="text-xs font-semibold text-white/90">Playlist</span>
                </button>
                <button onclick="gid('full-more-sheet').remove();openPlaybackSpeed();" class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition cursor-pointer">
                    <i data-lucide="gauge" class="w-5 h-5 text-white"></i>
                    <span class="text-xs font-semibold text-white/90">Speed</span>
                </button>
                <button onclick="gid('full-more-sheet').remove();openQueue();" class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition cursor-pointer">
                    <i data-lucide="list-music" class="w-5 h-5 text-white"></i>
                    <span class="text-xs font-semibold text-white/90">Queue</span>
                </button>
                <button onclick="gid('full-more-sheet').remove();downloadCurrentSong();" class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition cursor-pointer">
                    <i data-lucide="download" class="w-5 h-5 text-white"></i>
                    <span class="text-xs font-semibold text-white/90">Download</span>
                </button>
                <button onclick="gid('full-more-sheet').remove();openShareCard();" class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition cursor-pointer">
                    <i data-lucide="share-2" class="w-5 h-5 text-white"></i>
                    <span class="text-xs font-semibold text-white/90">Share</span>
                </button>
            </div>

            <button onclick="gid('full-more-sheet').remove()" class="w-full mt-2 py-3 bg-white/10 text-white font-bold rounded-full border border-white/10 active:scale-95 transition cursor-pointer">Tutup</button>
        </div>`;

        document.body.appendChild(sheet);
        lucide.createIcons();
    },
    updateBgGlowToggleUI() {
        var on = FullPlayer.bgGlowEnabled !== false;
        ['full-bg-glow-toggle', 'lyrics-bg-glow-toggle'].forEach(function(id) {
            var btn = gid(id);
            if (!btn) return;
            btn.classList.toggle('text-white', on);
            btn.classList.toggle('text-white/70', !on);
            btn.classList.toggle('bg-white/15', on);
            btn.title = on ? 'Matikan Latar Bergerak' : 'Nyalakan Latar Bergerak';
        });
    },
    toggleBgGlow() {
        FullPlayer.bgGlowEnabled = !(FullPlayer.bgGlowEnabled !== false);
        try { localStorage.setItem('nanz_bg_glow_enabled', FullPlayer.bgGlowEnabled ? '1' : '0'); } catch (e) {}
        FullPlayer.updateBgGlowToggleUI();
        FullPlayer.applyColors(null);
    },
    applyColors(colors) {
        if (typeof S !== 'undefined') {
            S.currentAccentColor = '#ffffff';
        }

        // Full Player Progressbar Accent
        var fullProgress = gid('full-progress');
        if (fullProgress) {
            fullProgress.style.backgroundColor = '#ffffff';
        }

        // Play Button Background Accent
        var playBtn = gid('full-play-btn-wrap');
        if (playBtn) {
            playBtn.style.backgroundColor = '#ffffff';
        }

        // Animated moving color blobs derived from the artwork (Apple Music style)
        var hasColors = colors && colors.length;
        if (hasColors) {
            // Remember the last computed colors so the on/off toggle can
            // reapply them instantly without waiting for the next track color extraction.
            FullPlayer._lastGlowColors = colors;
        }
        var useColors = hasColors ? colors : FullPlayer._lastGlowColors;
        var glowOn = FullPlayer.bgGlowEnabled !== false; // default ON
        var c1 = useColors ? useColors[0] : null;
        var c2 = useColors ? (useColors[1] || useColors[0]) : null;
        var c3 = useColors ? (useColors[2] || useColors[0]) : null;

        var fullGlow = gid('full-bg-glow');
        if (fullGlow) {
            if (useColors && glowOn) {
                fullGlow.style.setProperty('--glow-c1', c1);
                fullGlow.style.setProperty('--glow-c2', c2);
                fullGlow.style.setProperty('--glow-c3', c3);
                fullGlow.style.opacity = '0.85';
            } else {
                fullGlow.style.opacity = '0';
            }
        }

        var lyricsGlow = gid('lyrics-bg-glow');
        if (lyricsGlow) {
            if (useColors && glowOn) {
                lyricsGlow.style.setProperty('--glow-c1', c1);
                lyricsGlow.style.setProperty('--glow-c2', c2);
                lyricsGlow.style.setProperty('--glow-c3', c3);
                lyricsGlow.style.opacity = '0.55';
            } else {
                lyricsGlow.style.opacity = '0';
            }
        }
    },
    updateBeats(track) {
        if (!track) return;

        if (track.cover) {
            ['full-bg-artwork', 'lyrics-bg-blur'].forEach(function(id) {
                var el = gid(id);
                if (el) el.src = track.cover;
            });
            var miniCover = gid('full-lyrics-mini-cover');
            if (miniCover) miniCover.src = track.cover;
        }
        var miniTitle = gid('full-lyrics-mini-title');
        var miniArtist = gid('full-lyrics-mini-artist');
        if (miniTitle) miniTitle.textContent = track.title || '';
        if (miniArtist) miniArtist.textContent = track.artist || '';

        FullPlayer.applyColors(null);
    }
};