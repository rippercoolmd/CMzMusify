// PWA - INSTALL & OFFLINE MODE HANDLING
var deferredInstallPrompt=null;
var isStandaloneApp=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true;
var isIOSDevice=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream;

// Auto-fix PWA detection for users who have it installed but browser doesn't report standalone
if (isStandaloneApp) {
    try { localStorage.setItem('pwa_installed', 'true'); } catch(e){}
} else if (localStorage.getItem('pwa_installed') === 'true') {
    isStandaloneApp = true;
}

function showToast(msg) {
    var existing = document.getElementById('global-app-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'global-app-toast';
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[600] bg-zinc-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-full border border-white/15 shadow-2xl backdrop-blur-md flex items-center space-x-2 transition-all duration-300 transform -translate-y-4 opacity-0 pointer-events-none';
    toast.innerHTML = '<span>' + (typeof es === 'function' ? es(msg) : String(msg)) + '</span>';
    document.body.appendChild(toast);
    setTimeout(function(){
        toast.classList.remove('-translate-y-4', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);
    setTimeout(function(){
        if(toast && toast.parentElement) {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('-translate-y-4', 'opacity-0', 'pointer-events-none');
            setTimeout(function(){ if(toast.parentElement) toast.remove(); }, 300);
        }
    }, 3200);
}

function updateOnlineOfflineStatus() {
    var banner = document.getElementById('pwa-offline-banner');
    if (!navigator.onLine) {
        if (banner) banner.classList.remove('hidden');
        showToast('Mode Offline PWA Aktif — Memutar lagu & lirik tersimpan');
    } else {
        if (banner) banner.classList.add('hidden');
    }
}

function clearPwaCache() {
    if ('caches' in window) {
        caches.keys().then(function(names) {
            names.forEach(function(name) { caches.delete(name); });
        });
    }
    localStorage.removeItem('pwa_lyrics_cache');
    localStorage.removeItem('pwa_audio_cache');
    if (typeof lyricsCache !== 'undefined') lyricsCache = {};
    if (typeof audioUrlCache !== 'undefined') audioUrlCache = {};
    showToast('Cache offline PWA berhasil dibersihkan');
    if (typeof Profile !== 'undefined' && Profile.render) Profile.render();
}

window.addEventListener('online', function() {
    updateOnlineOfflineStatus();
    showToast('Koneksi internet terhubung kembali (Online)');
});
window.addEventListener('offline', function() {
    updateOnlineOfflineStatus();
});
document.addEventListener('DOMContentLoaded', updateOnlineOfflineStatus);

window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault();
    deferredInstallPrompt=e;
    var btn=document.getElementById('pwa-install-btn');
    if(btn&&!isStandaloneApp)btn.classList.remove('hidden');
});
window.addEventListener('appinstalled',function(){
    deferredInstallPrompt=null;
    try { localStorage.setItem('pwa_installed', 'true'); } catch(e){}
    isStandaloneApp = true;
    var btn=document.getElementById('pwa-install-btn');
    if(btn)btn.classList.add('hidden');
    showToast('CMzMusify berhasil diinstall!');
});

function isPwaInstalled() {
    return isStandaloneApp || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true || localStorage.getItem('pwa_installed') === 'true';
}

function showPwaRequiredModal() {
    var existing = document.getElementById('pwa-required-modal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'pwa-required-modal';
    modal.className = 'fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in';
    modal.onclick = function(e){ if(e.target === modal) modal.remove(); };
    modal.innerHTML = '<div class="bg-[#121318] border border-white/15 rounded-2xl p-5 max-w-xs w-full text-center space-y-3 shadow-2xl relative" onclick="event.stopPropagation()">'+
        '<div class="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto shadow-md">'+
            '<i data-lucide="smartphone" class="w-6 h-6 text-white"></i>'+
        '</div>'+
        '<div class="space-y-1">'+
            '<h3 class="text-white font-bold text-sm">Install Aplikasi Terlebih Dahulu</h3>'+
            '<p class="text-white/60 text-xs leading-relaxed">'+
                'Fitur Mode Offline khusus untuk aplikasi PWA. Silakan install CMzMusify ke layar utama terlebih dahulu.'+
            '</p>'+
        '</div>'+
        '<div class="space-y-2 pt-1">'+
            '<button onclick="document.getElementById(\'pwa-required-modal\').remove(); installPWA();" class="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-200 text-black font-bold text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer">'+
                '<i data-lucide="download" class="w-4 h-4"></i>'+
                '<span>Install Aplikasi</span>'+
            '</button>'+
            '<button onclick="document.getElementById(\'pwa-required-modal\').remove();" class="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-xs active:scale-95 transition cursor-pointer">'+
                'Tutup'+
            '</button>'+
        '</div>'+
    '</div>';
    document.body.appendChild(modal);
    if (window.lucide) lucide.createIcons();
}

function installPWA(){
    if(deferredInstallPrompt){
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(function(choice){
            if(choice.outcome==='accepted') {
                try { localStorage.setItem('pwa_installed', 'true'); } catch(e){}
                isStandaloneApp = true;
                showToast('Menginstall CMzMusify...');
            }
            deferredInstallPrompt=null;
            var btn=document.getElementById('pwa-install-btn');
            if(btn)btn.classList.add('hidden');
        });
    }else if(isIOSDevice){
        showToast('Tap ikon Bagikan lalu pilih "Add to Home Screen"');
    }else{
        showToast('Petunjuk: Buka menu browser lalu pilih "Tambah ke Layar Utama" / "Install Aplikasi"');
    }
}

// Offline PWA Storage Helper
function getOfflineSongs() {
    try {
        var data = localStorage.getItem('pwa_offline_tracks');
        return data ? JSON.parse(data) : [];
    } catch(e) {
        return [];
    }
}

function isOfflineSong(track) {
    if (!track) return false;
    var vid = track.videoId || track.id;
    var list = getOfflineSongs();
    return list.some(function(s) {
        return (s.videoId === vid || s.id === vid);
    });
}

async function saveTrackForOffline(track) {
    if (!isPwaInstalled()) {
        showPwaRequiredModal();
        return false;
    }
    if (!track) return;
    var vid = track.videoId || track.id;
    if (!vid) return;

    var list = getOfflineSongs();
    var existingIndex = list.findIndex(function(s) { return (s.videoId === vid || s.id === vid); });

    if (existingIndex !== -1) {
        // Remove from offline
        list.splice(existingIndex, 1);
        try { localStorage.setItem('pwa_offline_tracks', JSON.stringify(list)); } catch(e){}
        showToast('Lagu dihapus dari Mode Offline PWA');
        updateOfflineButtons();
        if (typeof OfflineView !== 'undefined' && typeof S !== 'undefined' && S.at === 'offline') OfflineView.render();
        return false;
    }

    showToast('Menyimpan lagu ke Mode Offline PWA...');

    // 1. Add track metadata to list
    var songObj = {
        id: vid,
        videoId: vid,
        title: track.title || 'Lagu',
        artist: track.artist || 'Unknown Artist',
        cover: track.cover || (typeof toHDCover==='function'?toHDCover('', vid):''),
        artistId: track.artistId || '',
        ytUrl: track.ytUrl || ('https://youtube.com/watch?v=' + vid),
        savedAt: Date.now()
    };
    list.unshift(songObj);
    try { localStorage.setItem('pwa_offline_tracks', JSON.stringify(list)); } catch(e){}

    // 2. Pre-fetch & cache Audio URL
    try {
        if (typeof audioUrlCache !== 'undefined' && !audioUrlCache[vid]) {
            var ytUrl = track.ytUrl || ('https://youtube.com/watch?v=' + vid);
            var r = await fetch(API.ytplay, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: ytUrl })
            });
            var d = await r.json();
            if (d && d.result && d.result.download && d.result.download.audio) {
                audioUrlCache[vid] = d.result.download.audio;
                if (typeof savePwaCaches === 'function') savePwaCaches();
            }
        }
    } catch(e) {}

    // 3. Pre-fetch & cache Lyrics
    try {
        var cachedLyric = (typeof lyricsCache !== 'undefined' && lyricsCache[vid]) ? lyricsCache[vid] : null;
        if (!cachedLyric && typeof S !== 'undefined' && S.ld && S.ld.vid === vid && S.ld.lines && S.ld.lines.length > 0) {
            cachedLyric = S.ld;
        }

        if (!cachedLyric) {
            var tParam = (songObj && songObj.title) ? '&title=' + encodeURIComponent(songObj.title) : '';
            var aParam = (songObj && songObj.artist) ? '&artist=' + encodeURIComponent(songObj.artist) : '';
            var lr = await fetch(API.lyrics + '?id=' + vid + tParam + aParam);
            var ld = await lr.json();
            if (ld && ld.status && ld.result && ld.result.lyrics) {
                cachedLyric = {
                    vid: vid,
                    type: ld.result.lyrics.type || 'none',
                    lines: ld.result.lyrics.lines || []
                };
            }
        }

        if (cachedLyric) {
            if (typeof lyricsCache !== 'undefined') {
                lyricsCache[vid] = cachedLyric;
            }
            songObj.lyrics = cachedLyric;
            if (typeof savePwaCaches === 'function') savePwaCaches();
            try { localStorage.setItem('pwa_offline_tracks', JSON.stringify(list)); } catch(e){}
        }
    } catch(e) {}

    showToast('Lagu "' + track.title + '" tersimpan untuk Mode Offline!');
    updateOfflineButtons();
    if (typeof OfflineView !== 'undefined' && typeof S !== 'undefined' && S.at === 'offline') OfflineView.render();
    return true;
}

function toggleCurrentOffline() {
    if (typeof S === 'undefined' || !S.ct) {
        showToast('Pilih lagu terlebih dahulu');
        return;
    }
    saveTrackForOffline(S.ct);
}

function updateOfflineButtons() {
    if (typeof S === 'undefined') return;
    var isSaved = S.ct ? isOfflineSong(S.ct) : false;
    
    // Update FullPlayer Offline Button
    var fullBtn = gid('full-offline-btn');
    if (fullBtn) {
        if (isSaved) {
            fullBtn.className = 'w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center active:scale-90 transition-all shrink-0 cursor-pointer shadow-md';
            fullBtn.title = 'Tersimpan di Mode Offline PWA (Klik untuk menghapus)';
            fullBtn.innerHTML = '<i data-lucide="check-circle-2" class="w-5 h-5"></i>';
        } else {
            fullBtn.className = 'w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center active:scale-90 transition-all shrink-0 cursor-pointer shadow-md';
            fullBtn.title = 'Simpan ke Mode Offline PWA';
            fullBtn.innerHTML = '<i data-lucide="wifi-off" class="w-5 h-5"></i>';
        }
    }

    if (window.lucide) lucide.createIcons();
}

var OfflineView = {
    render() {
        var el = gid('view-offline');
        if (!el) return;

        var offlineSongs = typeof getOfflineSongs === 'function' ? getOfflineSongs() : [];
        var isOnline = navigator.onLine;

        var songsHtml = '';
        if (offlineSongs.length > 0) {
            songsHtml = offlineSongs.map(function(s, i) {
                var isCur = S.ct && (
                    S.ct.id === s.id ||
                    S.ct.videoId === s.videoId ||
                    (S.ct.title === s.title && S.ct.artist === s.artist)
                );
                var isPlay = isCur && S.ip;
                var isLoad = isCur && S.il;

                var playIconHtml = '';
                if (isLoad) {
                    playIconHtml = '<div class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>';
                } else if (isPlay) {
                    playIconHtml = '<div class="flex items-end justify-center gap-[2px] w-4 h-4 pb-0.5"><span class="w-[2px] bg-black rounded-full animate-eq-1"></span><span class="w-[2px] bg-black rounded-full animate-eq-2"></span><span class="w-[2px] bg-black rounded-full animate-eq-3"></span></div>';
                } else if (isCur) {
                    playIconHtml = '<i data-lucide="pause" class="w-4 h-4 text-black fill-current"></i>';
                } else {
                    playIconHtml = '<i data-lucide="play" class="w-4 h-4 text-black fill-current ml-0.5"></i>';
                }

                var cardBg = isPlay ? 'bg-white/15 border-white/30 shadow-lg' : (isCur ? 'bg-white/10 border-white/20' : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]');
                var titleClass = isCur ? 'text-white font-bold' : 'text-white/90 font-semibold';

                var dateStr = s.savedAt ? new Date(s.savedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '';
                var safeSongJson = JSON.stringify(s).replace(/"/g, '&quot;');

                return '<div class="flex items-center gap-3 p-2.5 rounded-2xl border '+cardBg+' active:scale-[0.98] transition-all duration-200 group shadow-md">'+
                    '<div onclick="PK(\'offline\','+i+')" class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">'+
                        '<div class="w-5 text-center text-white/50 text-xs font-bold group-hover:text-white shrink-0">'+(i + 1)+'</div>'+
                        '<img src="'+(s.cover || FI)+'" class="w-12 h-12 rounded-xl object-cover shrink-0 shadow-md border border-white/10" onerror="this.src=\''+FI+'\'" />'+
                        '<div class="min-w-0 flex-1">'+
                            '<h3 class="'+titleClass+' text-sm truncate">'+es(s.title)+'</h3>'+
                            '<p class="text-xs text-white/50 truncate mt-0.5">'+es(s.artist)+(dateStr ? ' • <span class="text-white/40">Offline ('+dateStr+')</span>' : '')+'</p>'+
                        '</div>'+
                    '</div>'+
                    '<button onclick="event.stopPropagation();saveTrackForOffline('+safeSongJson+');" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/50 hover:text-red-400 border border-white/10 flex items-center justify-center shrink-0 active:scale-90 transition-all" title="Hapus dari Mode Offline PWA">'+
                        '<i data-lucide="trash-2" class="w-4 h-4"></i>'+
                    '</button>'+
                    '<button onclick="PK(\'offline\','+i+')" class="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 active:scale-90 transition-all shadow-md">'+
                        playIconHtml+
                    '</button>'+
                '</div>';
            }).join('');
        } else {
            songsHtml = `
            <div class="text-center py-14 rounded-2xl bg-white/[0.03] border border-white/10 px-4">
                <div class="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-3 text-white">
                    <i data-lucide="wifi-off" class="w-6 h-6"></i>
                </div>
                <h3 class="text-white font-bold text-sm mb-1">Belum Ada Lagu Offline</h3>
                <p class="text-white/60 text-xs max-w-xs mx-auto mb-3">Simpan lagu favoritmu untuk diputar tanpa koneksi internet.</p>
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold">
                    <i data-lucide="download" class="w-3.5 h-3.5"></i>
                    <span>Klik ikon Download di pemutar lagu</span>
                </div>
            </div>`;
        }

        el.innerHTML = `
        <div class="pt-8 pb-3.5 px-4 sticky top-0 z-30 border-b border-white/10 shadow-2xl transition-all flex justify-between items-center bg-black/80 backdrop-blur-md">
            <div>
                <div class="flex items-center gap-2">
                    <h1 class="text-2xl font-black text-white tracking-tight drop-shadow-md">Offline Mode</h1>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${isOnline ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-white/20 text-white/60 bg-white/5'}">${isOnline ? 'Online' : 'Offline'}</span>
                </div>
                <p class="text-xs text-white/50 mt-0.5">PWA Storage & Saved Songs</p>
            </div>
            <div class="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-md">
                <i data-lucide="wifi-off" class="w-4 h-4"></i>
            </div>
        </div>

        <div class="px-4 mt-4 space-y-3">
            ${offlineSongs.length > 0 ? `
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-semibold text-white/60 uppercase tracking-wider">${offlineSongs.length} Lagu Tersimpan</span>
                    <button onclick="PK('offline',0)" class="text-xs text-white hover:text-white/80 font-bold hover:underline flex items-center gap-1">
                        <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i> Putar Semua
                    </button>
                </div>
            ` : ''}

            <div class="space-y-2">${songsHtml}</div>
        </div>`;

        if (window.lucide) lucide.createIcons();
    }
};

var App={
    init(){
        document.documentElement.classList.remove('theme-light');
        localStorage.removeItem('theme');

        gid('nav-container').innerHTML=`
        <div class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-40">
            <div class="glass-dock rounded-3xl py-1 px-1.5 flex items-center justify-between shadow-2xl">
                <button onclick="App.switch('home')" id="nav-home" class="nav-item group relative flex flex-col items-center justify-center cursor-pointer select-none touch-manipulation py-1.5 px-2 rounded-2xl transition-all duration-300 active:scale-95">
                    <i data-lucide="home" class="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300"></i>
                    <span class="nav-label text-[9px] font-medium transition-all duration-300 mt-0.5">Home</span>
                </button>
                <button onclick="App.switch('search')" id="nav-search" class="nav-item group relative flex flex-col items-center justify-center cursor-pointer select-none touch-manipulation py-1.5 px-2 rounded-2xl transition-all duration-300 active:scale-95">
                    <i data-lucide="search" class="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300"></i>
                    <span class="nav-label text-[9px] font-medium transition-all duration-300 mt-0.5">Search</span>
                </button>
                <button onclick="App.switch('library')" id="nav-library" class="nav-item group relative flex flex-col items-center justify-center cursor-pointer select-none touch-manipulation py-1.5 px-2 rounded-2xl transition-all duration-300 active:scale-95">
                    <i data-lucide="library" class="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300"></i>
                    <span class="nav-label text-[9px] font-medium transition-all duration-300 mt-0.5">Library</span>
                </button>
                <button onclick="App.switch('offline')" id="nav-offline" class="nav-item group relative flex flex-col items-center justify-center cursor-pointer select-none touch-manipulation py-1.5 px-2 rounded-2xl transition-all duration-300 active:scale-95">
                    <i data-lucide="wifi-off" class="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300"></i>
                    <span class="nav-label text-[9px] font-medium transition-all duration-300 mt-0.5">Offline</span>
                </button>
                <button onclick="App.switch('liked')" id="nav-liked" class="nav-item group relative flex flex-col items-center justify-center cursor-pointer select-none touch-manipulation py-1.5 px-2 rounded-2xl transition-all duration-300 active:scale-95">
                    <i data-lucide="heart" class="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300"></i>
                    <span class="nav-label text-[9px] font-medium transition-all duration-300 mt-0.5">Liked</span>
                </button>
                <button onclick="App.switch('dev')" id="nav-dev" class="nav-item group relative flex flex-col items-center justify-center cursor-pointer select-none touch-manipulation py-1.5 px-2 rounded-2xl transition-all duration-300 active:scale-95">
                    <i data-lucide="user" class="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300"></i>
                    <span class="nav-label text-[9px] font-medium transition-all duration-300 mt-0.5">Profile</span>
                </button>
            </div>
        </div>`;
        
        Profile.render();
        
        MP.init();FullPlayer.init();Artist.init();Album.init();Home.render();Search.render();
        if(typeof updateOG==='function') updateOG(null);
        App.switch(!navigator.onLine ? 'offline' : 'home');
        lucide.createIcons();
        setTimeout(function(){ App.checkUrl(); }, 1000);
        window.addEventListener('popstate', function(e) {
            if (typeof Album !== 'undefined' && gid('album-modal') && gid('album-modal').style.display !== 'none') {
                gid('album-modal').style.display = 'none';
                gid('album-content').innerHTML = '';
                Album.currentAlbumId = null;
            }
            if (typeof Artist !== 'undefined' && gid('artist-modal') && gid('artist-modal').style.display !== 'none') {
                gid('artist-modal').style.display = 'none';
                gid('artist-content').innerHTML = '';
                Artist.currentArtistId = null;
            }
        });
    },
    checkUrl(){
        var path = window.location.pathname;
        if(path.startsWith('/search/')){
            var q = path.split('/search/')[1];
            if(q){
                setTimeout(function(){
                    var si=gid('search-input');
                    if(si){
                        si.value=decodeURIComponent(q);
                        gid('search-form').dispatchEvent(new Event('submit'));
                    }
                    App.switch('search');
                },300);
            }
        }
        else if(path.startsWith('/play/')){
            var videoId = path.split('/play/')[1];
            if(videoId) {
                var p = new URLSearchParams(location.search);
                var isShared = p.get('share') === 'true' || p.get('share') === '1';
                var qTitle = p.get('title');
                var qArtist = p.get('artist');
                var qCover = p.get('cover') || p.get('thumb');
                if (qCover && typeof updateOG === 'function') {
                    updateOG(qTitle || 'Lagu', qCover, qArtist || '');
                }
                if(isShared) {
                    App.showSharePopup(videoId);
                } else {
                    App.autoPlayTrack(videoId);
                }
            }
        }
        else if(path.startsWith('/album/')){
            var albumId = path.split('/album/')[1];
            if(albumId) {
                var p = new URLSearchParams(location.search);
                var qTitle = p.get('title');
                var qArtist = p.get('artist');
                var qCover = p.get('cover') || p.get('thumb');
                if (qCover && typeof updateOGForAlbum === 'function') {
                    updateOGForAlbum(qTitle || 'Album', qCover, qArtist || '');
                }
                App.switch('home');
                setTimeout(function(){ Album.open(albumId, qCover); }, 300);
            }
        }
        else if(path.startsWith('/playlist/')){
            var playlistId = path.split('/playlist/')[1];
            if(playlistId){
                App.switch('library');
                setTimeout(function(){
                    if(typeof Library !== 'undefined' && typeof Library.open === 'function'){
                        var pls = typeof getUserPlaylists === 'function' ? getUserPlaylists() : [];
                        var exists = pls.some(function(p){ return p.id === playlistId; });
                        if(exists){
                            Library.open(playlistId);
                        } else if(typeof showToast === 'function'){
                            // Playlists are stored locally on-device, so a shared link only
                            // opens correctly on the device that created it.
                            showToast('Playlist ini tidak ditemukan di perangkat ini');
                        }
                    }
                }, 300);
            }
        }
        else if(path.startsWith('/artist/')){
            var artistId = path.split('/artist/')[1];
            if(artistId) {
                var p = new URLSearchParams(location.search);
                var qName = p.get('name') || p.get('title');
                var qCover = p.get('cover') || p.get('thumb');
                if (qCover && typeof updateOGForArtist === 'function') {
                    updateOGForArtist(qName || 'Artist', qCover);
                }
                App.switch('home');
                setTimeout(function(){ Artist.open(artistId, qName, qCover); }, 300);
            }
        }
        else {
            var p=new URLSearchParams(location.search);
            var play=p.get('play'),search=p.get('search'),isShared=p.get('share')==='1';
            if(play){if(isShared){App.showSharePopup(play);}else{App.autoPlayTrack(play);}}
            else if(search){setTimeout(function(){var si=gid('search-input');if(si){si.value=decodeURIComponent(search);gid('search-form').dispatchEvent(new Event('submit'));}App.switch('search');},300);}
        }
    },
    autoPlayTrack(videoId){
        fetch(API.search+'?query=https://youtube.com/watch?v='+videoId).then(function(r){return r.json();}).then(function(d){
            var title='Lagu',artist='CMzMusify',cover=toHDCover('', videoId),artistId='';
            if(d.status&&d.result.songs&&d.result.songs.length>0){var song=d.result.songs[0];title=cn(song.title);artist=cn(song.artist);cover=toHDCover(song.thumbnail, videoId);artistId=song.artistId||'';}
            S.ct={id:videoId,videoId:videoId,title:title,artist:artist,cover:cover,artistId:artistId,ytUrl:'https://youtube.com/watch?v='+videoId};
            S.ps='direct';S.pl=[S.ct];S.pi=0;UU();MP.show();resetLyricsUI(videoId);
            FullPlayer.open();loadTrack(S.ct);
        }).catch(function(){
            S.ct={id:videoId,videoId:videoId,title:'Lagu',artist:'CMzMusify',cover:toHDCover('', videoId),artistId:'',ytUrl:'https://youtube.com/watch?v='+videoId};
            S.ps='direct';S.pl=[S.ct];S.pi=0;UU();MP.show();resetLyricsUI(videoId);
            FullPlayer.open();loadTrack(S.ct);
        });
    },
    showSharePopup(videoId){
        fetch(API.search+'?query=https://youtube.com/watch?v='+videoId).then(function(r){return r.json();}).then(function(d){
            var title='Lagu',artist='CMzMusify',cover=toHDCover('', videoId);
            if(d.status&&d.result.songs&&d.result.songs.length>0){var song=d.result.songs[0];title=cn(song.title);artist=cn(song.artist);cover=toHDCover(song.thumbnail, videoId);}
            App.renderPopup(videoId,title,artist,cover);
        }).catch(function(){App.renderPopup(videoId,'Lagu','CMzMusify',toHDCover('', videoId));});
    },
    renderPopup(videoId,title,artist,cover){
        if(typeof updateOG==='function') updateOG(title, cover, artist);
        var popup=document.createElement('div');popup.className='fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
        popup.onclick=function(e){if(e.target===popup)popup.remove();};
        popup.innerHTML='<div class="glass-strong w-full max-w-md rounded-t-3xl p-6 border-t border-white/10" style="animation:slideUp 0.4s ease-out forwards;"><div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div><div class="flex items-center gap-4 mb-4"><img src="'+cover+'" class="w-16 h-16 rounded-xl object-cover " onerror="this.src=\''+FI+'\'" /><div class="flex-1 truncate"><h3 class="font-bold text-white truncate">'+title+'</h3><p class="text-[#b3b3b3] text-sm truncate">'+artist+'</p></div></div><p class="text-white/70 text-xs mb-4 text-center">Seseorang membagikan lagu ini kepadamu</p><div class="flex gap-3"><button id="popup-play" class="flex-1 btn-chrome font-bold py-3 rounded-full active:scale-95 flex items-center justify-center gap-2"><i data-lucide="play" class="w-4 h-4 fill-current"></i> Putar Sekarang</button><button id="popup-later" class="px-6 py-3 glass glass-hover text-white rounded-full active:scale-95">Nanti</button></div></div>';
        document.body.appendChild(popup);
        popup.querySelector('#popup-play').onclick=function(){popup.remove();S.ct={id:videoId,videoId:videoId,title:title,artist:artist,cover:cover,artistId:'',ytUrl:'https://youtube.com/watch?v='+videoId};S.ps='direct';S.pl=[S.ct];S.pi=0;UU();MP.show();resetLyricsUI(videoId);FullPlayer.open();loadTrack(S.ct);};
        popup.querySelector('#popup-later').onclick=function(){popup.remove();};
    },
    switch(t){
        // Auto-close opened detail modals/tabs when switching bottom navbar
        if(typeof FullPlayer !== 'undefined' && FullPlayer.close) FullPlayer.close();
        if(typeof Album !== 'undefined' && Album.close) Album.close();
        if(typeof Artist !== 'undefined' && Artist.close) Artist.close();
        if(typeof Library !== 'undefined' && Library.closeModalOnly) Library.closeModalOnly();

        // Remove any open popups or dialogs
        document.querySelectorAll('.fixed.z-\\[300\\], .fixed.z-\\[400\\]').forEach(function(el){
            if(el.id !== 'v2-popup' && el.id !== 'mini-player') el.remove();
        });

        var tabs = ['home', 'search', 'library', 'offline', 'liked', 'dev'];
        var prevTab = S.at || 'home';
        var prevIndex = tabs.indexOf(prevTab);
        var nextIndex = tabs.indexOf(t);

        S.at = t;

        tabs.forEach(function(id){
            var el = gid('view-' + id);
            if(el) {
                el.style.display = 'none';
                el.classList.remove('animate-slide-right', 'animate-slide-left');
            }
        });

        if(t==='library'){Library.render();}
        if(t==='dev'){Profile.render();}
        if(t==='offline'){
            OfflineView.render();
        }
        if(t==='home'){
            if (prevTab === 'home' && Home.activeCategory) {
                Home.selectCategory('Semua');
            } else {
                Home.render();
            }
        }
        if(t==='search'){Search.onShow();}
        if(t==='liked'){Liked.render();}

        var targetEl = gid('view-' + t);
        if(targetEl) {
            targetEl.style.display = 'block';
            if(prevIndex !== -1 && nextIndex !== -1 && prevIndex !== nextIndex) {
                if(nextIndex > prevIndex) {
                    targetEl.classList.add('animate-slide-right');
                } else {
                    targetEl.classList.add('animate-slide-left');
                }
            }
        }

        ['home','search','library','offline','liked','dev'].forEach(function(n){
            var b=gid('nav-'+n);
            if(!b)return;
            var isCurrent = (n === t);

            if(isCurrent){
                b.className = 'nav-item group relative flex flex-col items-center justify-center cursor-pointer select-none touch-manipulation py-1.5 px-2.5 sm:px-3 rounded-2xl bg-white/20 text-white font-bold transition-all duration-300 shadow-md scale-105';
            } else {
                b.className = 'nav-item group relative flex flex-col items-center justify-center cursor-pointer select-none touch-manipulation py-1.5 px-2 rounded-2xl text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300';
            }
        });

        gid('main-area').scrollTop=0;lucide.createIcons();
    },
    renderLiked() {
        if (typeof Liked !== 'undefined') Liked.render();
    },
    showV2Popup() {
        if(localStorage.getItem('seen_v2_popup_update')) return;
        var popup = document.createElement('div');
        popup.id = 'v2-popup';
        popup.className = 'fixed inset-0 z-[400] flex items-center justify-center bg-black/80 px-4';
        ;
        popup.innerHTML = `
            <div class="glass-strong w-full max-w-sm rounded-3xl p-6 border border-white/10 text-center relative overflow-hidden" style="animation: slideUp 0.3s ease-out forwards;">
                <!-- Header -->
                <div class="relative w-16 h-16 rounded-full mx-auto mb-4 bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center  ">
                    <i data-lucide="sparkles" class="w-8 h-8 text-white"></i>
                </div>
                
                <h2 class="text-2xl font-black chrome-text mb-1">New Version v2</h2>
                <p class="text-white/70 text-xs mb-5">Berikut adalah fitur dan pembaruan terbaru:</p>
                
                <!-- Features list -->
                <div class="space-y-4 text-left mb-6 max-h-[250px] overflow-y-auto pr-1">
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="sliders" class="w-4 h-4 text-rose-400"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">Equalizer Suara (Web Audio)</h4>
                            <p class="text-[#b3b3b3] text-xs leading-relaxed">Sesuaikan Bass, Mid, Treble, dan gunakan berbagai Preset Keren untuk kualitas audio musik terbaik.</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="share-2" class="w-4 h-4 text-rose-400"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">Share Lagu via Link Audio Langsung</h4>
                            <p class="text-[#b3b3b3] text-xs leading-relaxed">Bagikan lagu favorit Anda menggunakan link audio langsung untuk kemudahan berbagi musik.</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="timer" class="w-4 h-4 text-rose-400"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">Timer Sleep (Pengantar Tidur)</h4>
                            <p class="text-[#b3b3b3] text-xs leading-relaxed">Atur waktu putar musik otomatis sebelum tidur dengan durasi yang dapat ditentukan sendiri.</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="shield-check" class="w-4 h-4 text-rose-400"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">Fitur Pintar: "Hentikan di Akhir Lagu"</h4>
                            <p class="text-[#b3b3b3] text-xs leading-relaxed">Dilengkapi opsi agar lagu aktif Anda tetap berputar sampai selesai sebelum pemutaran otomatis berhenti tanpa memotong lagu di tengah-tengah.</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="gauge" class="w-4 h-4 text-rose-400"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">Kontrol Kecepatan Putar</h4>
                            <p class="text-[#b3b3b3] text-xs leading-relaxed">Memungkinkan Anda mempercepat atau memperlambat musik sesuai kebutuhan (mendukung kecepatan 0.5x, 0.75x, 1.0x (Normal), 1.25x, 1.5x, 1.75x, hingga 2.0x).</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="zap" class="w-4 h-4 text-rose-400"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">Mode "Slowed + Reverb" & "Nightcore"</h4>
                            <p class="text-[#b3b3b3] text-xs leading-relaxed">Kustomisasi getaran audio dengan mengubah kecepatan musik secara instan ke gaya favorit Anda.</p>
                        </div>
                    </div>
                </div>
                
                <!-- Button -->
                <button id="close-v2-popup" class="w-full btn-chrome font-bold py-3.5 rounded-full active:scale-95 transition-all">
                    Keren, Mulai Dengar!
                </button>
            </div>
        `;
        document.body.appendChild(popup);
        lucide.createIcons();
        popup.querySelector('#close-v2-popup').onclick = function() {
            localStorage.setItem('seen_v2_popup_update', 'true');
            popup.remove();
        };
    }
};
App.init();Home.fetch();

// SPLASH SCREEN - LOGO BULAT BESAR & RENDER HOME SYNC
var splashStartTime = Date.now();
var splashDismissed = false;

function hideSplashScreen() {
    if (splashDismissed) return;
    var minDuration = 1000;
    var elapsed = Date.now() - splashStartTime;
    if (elapsed < minDuration) {
        setTimeout(hideSplashScreen, minDuration - elapsed);
        return;
    }
    splashDismissed = true;
    var sp = gid('splash-screen');
    if (!sp) return;
    sp.classList.add('hide');
    setTimeout(function() { 
        if (sp && sp.parentNode) sp.parentNode.removeChild(sp); 
        // Trigger V2 Update popup here
        App.showV2Popup();
    }, 400);
}

(function(){
    var sp = gid('splash-screen');
    if (!sp) return;
    var logoWrap = sp.querySelector('.splash-logo-wrap') || sp.querySelector('.logo-wrap');
    if (logoWrap) {
        logoWrap.style.width = '170px';
        logoWrap.style.height = '170px';
        logoWrap.style.borderRadius = '50%';
    }
    var logo = sp.querySelector('.splash-logo-wrap img') || sp.querySelector('.logo');
    if (logo) {
        logo.style.borderRadius = '50%';
        logo.style.objectFit = 'cover';
    }
    // Safety max fallback timer in case network or API is extremely slow
    setTimeout(function(){
        hideSplashScreen();
    }, 4500);
})();

// Library object moved to /library.js

