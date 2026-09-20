var Album = {
    init() {
        if(!gid('album-container')) {
            const div = document.createElement('div');
            div.id = 'album-container';
            document.body.appendChild(div);
        }
        gid('album-container').innerHTML = `
        <div id="album-modal" class="fixed inset-0 bg-[#050507] flex flex-col z-[100]" style="display:none; animation: slideUp 0.3s ease-out forwards;">
            <div class="flex items-center justify-between p-4 pt-safe bg-transparent absolute top-0 left-0 w-full z-[100]" id="album-header">
                <button onclick="Album.close()" class="glass glass-hover rounded-full text-white p-3 active:scale-90 shadow-md bg-black/80 cursor-pointer"><i data-lucide="arrow-left" class="w-6 h-6"></i></button>
                <button id="album-top-share-btn" onclick="Album.share(Album.currentAlbumId)" class="glass glass-hover rounded-full text-white p-3 active:scale-90 shadow-md bg-black/80 cursor-pointer" title="Bagikan Album"><i data-lucide="share-2" class="w-5 h-5"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto hide-scrollbar pb-36 relative" id="album-content" onscroll="Album.handleScroll()">
                <div class="flex justify-center mt-32">
                    <div class="w-10 h-10 border-3 border-[#cfd3d8] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        </div>`;
        lucide.createIcons();
    },
    handleScroll() {
        const c = gid('album-content');
        const h = gid('album-header');
        if (!h) return;
        if (c.scrollTop > 50) {
            h.style.background = 'rgba(5, 5, 7, 0.9)';
        } else {
            h.style.background = 'transparent';
        }
    },
    currentAlbumId: null,
    currentAlbumInfo: null,
    open(id, passedCoverUrl) {
        Album.currentAlbumId = id;
        var url=location.origin+'/album/'+id;
        history.pushState({},'',url);
        gid('album-modal').style.display='flex';
        gid('album-content').innerHTML = `
        <div class="flex justify-center mt-32">
            <div class="w-10 h-10 border-3 border-[#cfd3d8] border-t-transparent rounded-full animate-spin"></div>
        </div>`;
        
        fetch('/api/album?id=' + id)
        .then(res => res.json())
        .then(data => {
            if(!data.status || !data.result) {
                gid('album-content').innerHTML = '<div class="p-6 text-center text-white/70 mt-20">Gagal memuat album</div>';
                return;
            }
            const a = data.result;
            let im = (passedCoverUrl && passedCoverUrl !== FI && passedCoverUrl !== 'undefined') ? passedCoverUrl : null;
            if (!im && a.thumbnails && a.thumbnails.length) {
                const lastThumb = a.thumbnails[a.thumbnails.length - 1];
                im = typeof lastThumb === 'string' ? lastThumb : (lastThumb.url || lastThumb.src || null);
            }
            if (!im && a.songs && a.songs.length > 0) {
                const firstSong = a.songs[0];
                if (firstSong.thumbnails && firstSong.thumbnails.length) {
                    const firstSongThumb = firstSong.thumbnails[0];
                    im = typeof firstSongThumb === 'string' ? firstSongThumb : (firstSongThumb.url || firstSongThumb.src || null);
                }
            }
            if (!im) im = FI;
            
            Album.currentAlbumInfo = { id: id, title: a.title, artist: a.artist || '', cover: im };
            if (typeof updateOGForAlbum === 'function') {
                updateOGForAlbum(a.title, im, a.artist);
            }

            let html = `
            <div class="relative w-full aspect-square md:aspect-video max-h-[50vh] overflow-hidden -mt-20 mb-6">
                <img src="${im}" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-transparent"></div>
                
                <div class="absolute bottom-6 left-6 right-6 flex flex-col justify-end items-center text-center z-10">
                    <img src="${im}" class="w-32 h-32 md:w-48 md:h-48 rounded-xl object-cover border border-white/10 mb-4" onerror="this.src='${FI}'" />
                    <div>
                        <p class="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-1">ALBUM / PLAYLIST</p>
                        <h1 class="text-3xl md:text-5xl font-black text-white mb-2 leading-tight drop-line-clamp-2">${es(a.title)}</h1>
                        ${a.description ? `<p class="text-white text-xs md:text-sm line-clamp-2">${es(a.description)}</p>` : ''}
                    </div>
                </div>
            </div>

            <div class="px-6">
                <div class="flex items-center gap-4 mb-6">
                    <button onclick="Album.playAll('${id}')" class="bg-white hover:bg-gray-200 text-black w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-all shadow-white/20 cursor-pointer">
                        <i data-lucide="play" class="w-7 h-7 fill-current ml-1"></i>
                    </button>
                    <button onclick="Album.importPlaylist('${id}', '${es(a.title).replace(/'/g, "\\'")}', '${im}')" class="text-white/70 hover:text-white p-3 rounded-full active:scale-95 bg-white/5 transition-all cursor-pointer" title="Simpan sebagai Playlist Baru"><i data-lucide="download" class="w-6 h-6"></i></button>
                    <button onclick="Album.shuffleAll('${id}')" class="text-white/70 hover:text-white p-3 rounded-full active:scale-95 bg-white/5 transition-all cursor-pointer" title="Acak (Shuffle)">
                        <i data-lucide="shuffle" class="w-6 h-6"></i>
                    </button>
                    <button onclick="Album.share('${id}')" class="text-white/70 hover:text-white p-3 rounded-full active:scale-95 bg-white/5 transition-all cursor-pointer" title="Bagikan Album">
                        <i data-lucide="share-2" class="w-6 h-6"></i>
                    </button>
                </div>`;

            if(a.songs && a.songs.length > 0) {
                const isAlbum = id.startsWith('MPREb_');
                Album.currentAlbumId = id;
                S['album_'+id] = a.songs.map(s => {
                    let sim = null;
                    if (!isAlbum && s.thumbnails && s.thumbnails.length) {
                        const sThumb = s.thumbnails[0];
                        sim = typeof sThumb === 'string' ? sThumb : (sThumb.url || sThumb.src || null);
                    }
                    if (!sim) sim = im;
                    return {
                        id: s.videoId, videoId: s.videoId, title: s.title, artist: s.artist, artistId: s.artistId, cover: sim, ytUrl: 'https://youtube.com/watch?v='+s.videoId
                    };
                });
                
                html += '<div id="album-songs-list" class="space-y-1 pb-10">';
                a.songs.forEach((s, i) => {
                    let sim = null;
                    if (!isAlbum && s.thumbnails && s.thumbnails.length) {
                        const sThumb = s.thumbnails[0];
                        sim = typeof sThumb === 'string' ? sThumb : (sThumb.url || sThumb.src || null);
                    }
                    if (!sim) sim = im;

                    var isCur = S.ct && (
                        S.ct.id === s.videoId ||
                        S.ct.videoId === s.videoId ||
                        (S.ct.title === s.title && S.ct.artist === s.artist)
                    );
                    var isPlay = isCur && S.ip;
                    var isLoad = isCur && S.il;

                    var numHtml = '';
                    if (isLoad) {
                        numHtml = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>';
                    } else if (isPlay) {
                        numHtml = '<div class="flex items-end justify-center gap-[2px] w-4 h-4 pb-0.5 mx-auto"><span class="w-[2px] bg-white rounded-full animate-eq-1"></span><span class="w-[2px] bg-white rounded-full animate-eq-2"></span><span class="w-[2px] bg-white rounded-full animate-eq-3"></span></div>';
                    } else if (isCur) {
                        numHtml = '<i data-lucide="pause" class="w-4 h-4 text-white fill-current mx-auto"></i>';
                    } else {
                        numHtml = (i + 1);
                    }

                    var rowBg = isPlay ? 'bg-[#343a4e] border border-white/40 shadow-xl' : (isCur ? 'bg-[#2e3344] border border-white/30' : 'bg-[#20222c] border border-white/10 hover:bg-[#282b38]');
                    var titleClass = isCur ? 'text-white font-bold' : 'text-white/90 font-semibold';

                    html += `
                    <div onclick="Album.playSong('${id}', ${i})" class="flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer group active:scale-[0.98] transition-all duration-300 shadow-lg ${rowBg}">
                        <div class="w-6 text-center text-white/70 text-xs font-bold group-hover:text-white shrink-0">${numHtml}</div>
                        <img src="${sim}" class="w-12 h-12 rounded-xl object-cover shadow-md shrink-0 border border-white/10" onerror="this.src='${FI}'" />
                        <div class="truncate flex-1 min-w-0">
                            <p class="${titleClass} text-sm truncate mb-0.5">${es(s.title)}</p>
                            <p class="text-white/60 text-xs truncate">${es(s.artist)}</p>
                        </div>
                        <div class="text-xs text-white/60 font-mono shrink-0">${es(s.duration)}</div>
                        <button onclick="event.stopPropagation();showPlaylistPicker(S['album_'+'${id}'][${i}])" class="text-white/60 hover:text-white p-2 active:scale-90 transition-all shrink-0"><i data-lucide="plus" class="w-4 h-4"></i></button>
                    </div>`;
                });
                html += '</div>';
            } else {
                html += '<div class="text-center text-white/70 py-12"><i data-lucide="disc-3" class="w-16 h-16 mx-auto mb-4 opacity-20"></i><p>Tidak ada lagu di album ini</p></div>';
            }

            html += '</div>';
            gid('album-content').innerHTML = html;
            lucide.createIcons();
        })
        .catch(e => {
            gid('album-content').innerHTML = '<div class="p-6 text-center text-white/70 mt-20">Gagal: '+e.message+'</div>';
        });
    },
    currentAlbumId: null,
    renderActive() {
        var modal = gid('album-modal');
        if (!modal || modal.style.display === 'none' || !Album.currentAlbumId) return;
        var id = Album.currentAlbumId;
        var songs = S['album_'+id];
        var container = gid('album-songs-list');
        if (!container || !songs) return;

        var children = container.children;
        for (var i = 0; i < songs.length; i++) {
            var s = songs[i];
            var el = children[i];
            if (!el) continue;

            var isCur = S.ct && (
                S.ct.id === s.videoId ||
                S.ct.videoId === s.videoId ||
                (S.ct.title === s.title && S.ct.artist === s.artist)
            );
            var isPlay = isCur && S.ip;
            var isLoad = isCur && S.il;

            var numHtml = '';
            if (isLoad) {
                numHtml = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>';
            } else if (isPlay) {
                numHtml = '<div class="flex items-end justify-center gap-[2px] w-4 h-4 pb-0.5 mx-auto"><span class="w-[2px] bg-white rounded-full animate-eq-1"></span><span class="w-[2px] bg-white rounded-full animate-eq-2"></span><span class="w-[2px] bg-white rounded-full animate-eq-3"></span></div>';
            } else if (isCur) {
                numHtml = '<svg class="w-4 h-4 text-white fill-current mx-auto" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
            } else {
                numHtml = (i + 1);
            }

            var numEl = el.children[0];
            if (numEl) numEl.innerHTML = numHtml;

            var rowBg = isPlay ? 'bg-white/15 border border-white/30 shadow-md' : (isCur ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent');
            el.className = 'flex items-center gap-3 p-3 rounded-xl cursor-pointer group active:scale-[0.98] transition-all ' + rowBg;

            var titleEl = el.querySelector('p');
            if (titleEl) {
                titleEl.className = (isCur ? 'text-white font-bold' : 'text-white/90 font-medium') + ' text-base truncate mb-0.5';
            }
        }
        lucide.createIcons();
    },
    share(id) {
        var targetId = id || Album.currentAlbumId;
        if (!targetId) return;
        var a = Album.currentAlbumInfo || {};
        var title = a.title || (gid('album-content') && gid('album-content').querySelector('h1') ? gid('album-content').querySelector('h1').innerText : 'Album');
        var cover = a.cover || FI;
        var artist = a.artist || '';
        var url = location.origin + '/album/' + targetId;

        if (typeof updateOGForAlbum === 'function') {
            updateOGForAlbum(title, cover, artist);
        }

        if (navigator.share) {
            navigator.share({
                title: title + ' - CMzMusify',
                text: 'Dengarkan album ' + title + ' di CMzMusify!',
                url: url
            }).catch(function() {});
        } else {
            navigator.clipboard.writeText(url).then(function() {
                if (typeof showToast === 'function') showToast('Link album berhasil disalin!');
            }).catch(function() {
                if (typeof showToast === 'function') showToast('Gagal menyalin link album');
            });
        }
    },
    close() {
        if(window.location.pathname.startsWith('/album/')) history.pushState({},'', '/');
        gid('album-modal').style.display = 'none';
        gid('album-content').innerHTML = '';
        Album.currentAlbumId = null;
        Album.currentAlbumInfo = null;
        if (typeof S !== 'undefined' && S.ct && S.ct.title && S.ct.cover) {
            if (typeof updateOG === 'function') updateOG(S.ct.title, S.ct.cover, S.ct.artist);
        } else {
            if (typeof updateOG === 'function') updateOG(null);
        }
    },
    playSong(id, index) {
        if(!S['album_'+id] || !S['album_'+id][index]) return;
        var s = S['album_'+id][index];
        if (S.ct && (S.ct.id === s.id || S.ct.videoId === s.videoId || (S.ct.title === s.title && S.ct.artist === s.artist)) && AU.src) {
            TP();
            return;
        }
        S.pl = S['album_'+id];
        S.pi = index;
        S.ps = 'album';
        S.ct = S.pl[S.pi];
        UU();
        MP.show();
        S.il = true;
        UB();
        resetLyricsUI(S.ct.videoId);
        loadTrack(S.ct);
    },
    playAll(id) {
        if(!S['album_'+id] || S['album_'+id].length === 0) return;
        this.playSong(id, 0);
    },
    importPlaylist(id, title, cover) {
        if(!S['album_'+id] || S['album_'+id].length === 0) return;
        const plId = createPlaylist(title, cover || '');
        var pls = getUserPlaylists();
        var pl = pls.find(p => p.id === plId);
        if(pl) {
            pl.songs = S['album_'+id].map(s => {
                const im = toHDCover(s.cover, s.videoId);
                return {
                    id: s.videoId,
                    videoId: s.videoId,
                    title: s.title,
                    artist: s.artist,
                    cover: im,
                    artistId: s.artistId || '',
                    ytUrl: 'https://youtube.com/watch?v=' + s.videoId
                };
            });
            saveUserPlaylists(pls);
            if(typeof showToast === 'function') showToast(`Playlist "${title}" tersimpan di Perpustakaan`);
        }
    },
    shuffleAll(id) {
        if(!S['album_'+id] || S['album_'+id].length === 0) return;
        let arr = [...S['album_'+id]];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        S.pl = arr;
        S.pi = 0;
        S.ps = 'album';
        S.ct = S.pl[S.pi];
        UU();
        MP.show();
        S.il = true;
        UB();
        resetLyricsUI(S.ct.videoId);
        loadTrack(S.ct);
    }
};
