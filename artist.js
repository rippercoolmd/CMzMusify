var Artist={
    init(){
        gid('artist-container').innerHTML=`
        <div id="artist-modal" class="fixed inset-0 bg-[#1a1b22] flex flex-col z-30" style="display:none; animation: slideUp 0.3s ease-out forwards;">
            <div class="flex items-center justify-between gap-3 p-4 pt-safe bg-transparent absolute top-0 left-0 w-full z-[100] transition-all" id="artist-header">
                <div class="flex items-center gap-3 min-w-0">
                    <button onclick="Artist.close()" class="glass glass-hover rounded-full text-white p-3 active:scale-90 shadow-md bg-black/40 cursor-pointer"><i data-lucide="arrow-left" class="w-6 h-6"></i></button>
                    <h1 id="artist-name" class="text-xl font-black text-white truncate opacity-0 transition-opacity">Artist</h1>
                </div>
                <button onclick="Artist.share()" class="glass glass-hover rounded-full text-white p-3 active:scale-90 shadow-md bg-black/40 cursor-pointer" title="Bagikan Artist"><i data-lucide="share-2" class="w-5 h-5"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto hide-scrollbar pb-36 relative" id="artist-content" onscroll="Artist.handleScroll()">
                <p class="text-center text-[#a0a5b0] mt-32">Memuat...</p>
            </div>
        </div>`;
        lucide.createIcons();
    },
    handleScroll() {
        const c = gid('artist-content');
        const h = gid('artist-header');
        const n = gid('artist-name');
        if (!h) return;
        if (c.scrollTop > 50) {
            h.style.background = 'rgba(26, 27, 34, 0.9)';
            if(n) n.style.opacity = '1';
        } else {
            h.style.background = 'transparent';
            if(n) n.style.opacity = '0';
        }
    },
    currentArtistId: null,
    currentArtistInfo: null,
    open(id, name, thumbnail) {
        Artist.currentArtistId = id;
        var url = location.origin + '/artist/' + id;
        history.pushState({}, '', url);
        gid('artist-modal').style.display = 'flex';
        gid('artist-name').innerText = name || 'Artist';
        
        var tImg = thumbnail || FI;
        Artist.currentArtistInfo = { artistId: id, name: name || 'Artist', thumbnail: tImg };
        if (typeof updateOGForArtist === 'function') {
            updateOGForArtist(name || 'Artist', tImg);
        }
        
        gid('artist-content').innerHTML = `
        <div class="relative w-full aspect-square max-h-[40vh] overflow-hidden -mt-16 mb-6">
            <img src="${tImg}" class="w-full h-full object-cover opacity-50" onerror="this.src='${FI}'" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#14151a] to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6 flex flex-col justify-end items-center text-center">
                <img src="${tImg}" class="w-24 h-24 rounded-full mb-3 object-cover" onerror="this.src='${FI}'" />
                <h2 class="text-2xl font-black text-white drop-shadow-md">${es(name || 'Artist')}</h2>
            </div>
        </div>
        <div id="artist-inner-content">
            <div class="flex justify-center mt-12">
                <div class="w-8 h-8 border-3 border-[#cfd3d8] border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>`;

        fetch(API.artist + '?id=' + id).then(function(r){return r.json();}).then(function(d){
            if(d.status && d.result){
                var a = d.result;
                if(a.name) gid('artist-name').innerText = a.name;
                var headerImg = a.thumbnails && a.thumbnails.length > 0 ? a.thumbnails[a.thumbnails.length-1].url : tImg;
                Artist.currentArtistInfo = { artistId: id, name: a.name || name || 'Artist', thumbnail: headerImg };
                if (typeof updateOGForArtist === 'function') {
                    updateOGForArtist(a.name || name || 'Artist', headerImg);
                }
                var html = '';
                
                var isLiked = typeof isArtistLiked === 'function' ? isArtistLiked(id) : false;
                var likeBtnClass = isLiked ? 'text-white border-white/60 bg-white/20' : 'text-white border-white/20 hover:bg-white/10';
                var likeIconClass = isLiked ? 'fill-current' : '';
                var likeText = isLiked ? 'Disukai' : 'Sukai';

                // HEADER
                var fullHtml = `
                <div class="relative w-full aspect-square max-h-[50vh] overflow-hidden -mt-20 mb-6">
                    <img src="${headerImg}" class="w-full h-full object-cover" onerror="this.src='${FI}'" />
                    <div class="absolute inset-0 bg-gradient-to-t from-[#14151a] via-[#14151a]/60 to-transparent"></div>
                    <div class="absolute bottom-6 left-6 right-6 flex flex-col justify-end items-center text-center">
                        <img src="${headerImg}" class="artist-photo mb-4" onerror="this.src='${FI}'" />
                        <h2 class="text-3xl md:text-5xl font-black text-white drop-shadow-md">${es(a.name)}</h2>
                        <div class="flex items-center justify-center gap-3 mt-4">
                            <button id="artist-like-btn" onclick="Artist.toggleLike()" class="px-6 py-2.5 rounded-full border text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${likeBtnClass}">
                                <i data-lucide="user-check" class="w-4 h-4 ${likeIconClass}"></i> <span id="artist-like-text">${likeText}</span>
                            </button>
                            <button id="artist-share-btn" onclick="Artist.share()" class="px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 bg-white/5 shadow-md cursor-pointer">
                                <i data-lucide="share-2" class="w-4 h-4"></i> <span>Bagikan</span>
                            </button>
                        </div>
                    </div>
                </div>`;
                
                // TOP SONGS
                if(a.topSongs&&a.topSongs.length>0){
                    Artist.currentArtistData = a;
                    html+='<div class="mb-6"><h3 class="font-bold text-sm text-[#b3b3b3] uppercase tracking-wider mb-3 px-4">Lagu Teratas</h3><div id="artist-songs-list" class="space-y-1 px-2">';
                    a.topSongs.slice(0,10).forEach(function(s,i){
                        var im=FI;
                        if(s.thumbnails && s.thumbnails.length > 0) {
                            var lastT = s.thumbnails[s.thumbnails.length - 1];
                            im = typeof lastT === 'string' ? lastT : (lastT.url || lastT.src || FI);
                        }

                        var isCur = S.ct && (
                            S.ct.id === s.videoId ||
                            S.ct.videoId === s.videoId ||
                            (S.ct.title === s.title && S.ct.artist === (s.artist||a.name))
                        );
                        var isPlay = isCur && S.ip;
                        var isLoad = isCur && S.il;

                        var numHtml = '';
                        var btnIcon = '';
                        if (isLoad) {
                            numHtml = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>';
                            btnIcon = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';
                        } else if (isPlay) {
                            numHtml = '<div class="flex items-end justify-center gap-[2px] w-4 h-4 pb-0.5 mx-auto"><span class="w-[2px] bg-white rounded-full animate-eq-1"></span><span class="w-[2px] bg-white rounded-full animate-eq-2"></span><span class="w-[2px] bg-white rounded-full animate-eq-3"></span></div>';
                            btnIcon = '<div class="flex items-end justify-center gap-[2px] w-4 h-4 pb-0.5"><span class="w-[2px] bg-white rounded-full animate-eq-1"></span><span class="w-[2px] bg-white rounded-full animate-eq-2"></span><span class="w-[2px] bg-white rounded-full animate-eq-3"></span></div>';
                        } else if (isCur) {
                            numHtml = '<i data-lucide="pause" class="w-4 h-4 text-white fill-current mx-auto"></i>';
                            btnIcon = '<i data-lucide="pause" class="w-5 h-5 text-white fill-current"></i>';
                        } else {
                            numHtml = (i + 1);
                            btnIcon = '<i data-lucide="play" class="w-5 h-5 text-white/70 group-hover:text-white fill-current"></i>';
                        }

                        var rowBg = isPlay ? 'bg-[#343a4e] border border-white/40 shadow-xl' : (isCur ? 'bg-[#2e3344] border border-white/30' : 'bg-[#20222c] border border-white/10 hover:bg-[#282b38]');
                        var titleClass = isCur ? 'text-white font-bold' : 'text-white/90 font-semibold';

                        html+=`
                        <div onclick="Artist.play('${s.videoId}','${esJs(s.title)}','${esJs(s.artist||a.name)}','${esJs(im)}')" class="flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-lg group ${rowBg}">
                            <span class="text-white/70 w-6 text-center text-xs font-bold group-hover:text-white shrink-0">${numHtml}</span>
                            <img src="${im}" class="w-12 h-12 rounded-xl object-cover shadow-md shrink-0 border border-white/10" onerror="this.src='${FI}'" />
                            <div class="flex-1 min-w-0 truncate">
                                <p class="text-sm truncate transition-colors ${titleClass}">${es(s.title)}</p>
                                <p class="text-white/60 text-xs truncate mt-0.5">${es(s.artist||a.name)}</p>
                            </div>
                            <div class="shrink-0 p-1">${btnIcon}</div>
                        </div>`;
                    });
                    html+='</div></div>';
                }
                
                // TOP ALBUMS
                if(a.topAlbums&&a.topAlbums.length>0){
                    html+='<div class="mb-6"><h3 class="font-bold text-sm text-[#b3b3b3] uppercase tracking-wider mb-3 px-4">Album</h3><div class="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-4">';
                    a.topAlbums.forEach(function(al){
                        var im=FI;
                        if(al.thumbnails && al.thumbnails.length > 0) {
                            var lastT = al.thumbnails[al.thumbnails.length - 1];
                            im = typeof lastT === 'string' ? lastT : (lastT.url || lastT.src || FI);
                        }
                        html+=`
                        <div onclick="Album.open('${al.browseId}', '${esJs(im)}')" class="flex-shrink-0 w-36 cursor-pointer group p-2 rounded-2xl bg-[#20222c] border border-white/10 shadow-xl hover:bg-[#282b38] transition-all">
                            <div class="w-full aspect-square rounded-xl overflow-hidden mb-2 shadow-md">
                                <img src="${im}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='${FI}'" />
                            </div>
                            <p class="font-semibold text-xs truncate text-white px-0.5">${es(al.name)}</p>
                            <p class="text-white/60 text-[10px] truncate px-0.5 mt-0.5">Album • ${es(al.artist||a.name)}</p>
                        </div>`;
                    });
                    html+='</div></div>';
                }
                
                // TOP SINGLES
                if(a.topSingles&&a.topSingles.length>0){
                    html+='<div class="mb-6"><h3 class="font-bold text-sm text-[#b3b3b3] uppercase tracking-wider mb-3 px-4">Singles & EP</h3><div class="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-4">';
                    a.topSingles.forEach(function(sg){
                        var im=FI;
                        if(sg.thumbnails && sg.thumbnails.length > 0) {
                            var lastT = sg.thumbnails[sg.thumbnails.length - 1];
                            im = typeof lastT === 'string' ? lastT : (lastT.url || lastT.src || FI);
                        }
                        html+=`
                        <div onclick="Album.open('${sg.browseId}', '${esJs(im)}')" class="flex-shrink-0 w-36 cursor-pointer group p-2.5 rounded-2xl bg-[#20222c] border border-white/10 shadow-xl hover:bg-[#282b38] transition-all flex flex-col">
                            <div class="w-full aspect-square rounded-xl overflow-hidden mb-2 shadow-md">
                                <img src="${im}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='${FI}'" />
                            </div>
                            <p class="font-semibold text-xs truncate text-white px-0.5">${es(sg.name)}</p>
                            <p class="text-white/60 text-[10px] truncate px-0.5 mt-0.5">Single</p>
                        </div>`;
                    });
                    html+='</div></div>';
                }
                
                // TOP VIDEOS
                if(a.topVideos&&a.topVideos.length>0){
                    html+='<div class="mb-6"><h3 class="font-bold text-sm text-[#b3b3b3] uppercase tracking-wider mb-3 px-4">Video</h3><div class="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-4">';
                    a.topVideos.forEach(function(vd){
                        var im=FI;
                        if(vd.thumbnails && vd.thumbnails.length > 0) {
                            var lastT = vd.thumbnails[vd.thumbnails.length - 1];
                            im = typeof lastT === 'string' ? lastT : (lastT.url || lastT.src || FI);
                        }
                        html+=`
                        <div onclick="Artist.play('${vd.videoId||''}','${esJs(vd.name)}','${esJs(vd.artist||a.name)}','${esJs(im)}')" class="flex-shrink-0 w-48 cursor-pointer group p-2.5 rounded-2xl bg-[#20222c] border border-white/10 shadow-xl hover:bg-[#282b38] transition-all flex flex-col">
                            <div class="w-full h-28 rounded-xl overflow-hidden mb-2 relative shadow-md">
                                <img src="${im}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='${FI}'" />
                                <div class="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md rounded-full p-1.5"><i data-lucide="play" class="w-4 h-4 fill-current text-white"></i></div>
                            </div>
                            <p class="font-semibold text-xs truncate text-white px-0.5">${es(vd.name)}</p>
                            <p class="text-white/60 text-[10px] truncate px-0.5 mt-0.5">${es(vd.artist||a.name)}</p>
                        </div>`;
                    });
                    html+='</div></div>';
                }
                
                // PLAYLISTS
                if(a.playlists&&a.playlists.length>0){
                    html+='<div class="mb-6"><h3 class="font-bold text-sm text-[#b3b3b3] uppercase tracking-wider mb-3 px-4">Playlist</h3><div class="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-4">';
                    a.playlists.forEach(function(pl){
                        var im=FI;
                        if(pl.thumbnails && pl.thumbnails.length > 0) {
                            var lastT = pl.thumbnails[pl.thumbnails.length - 1];
                            im = typeof lastT === 'string' ? lastT : (lastT.url || lastT.src || FI);
                        }
                        html+=`
                        <div onclick="Album.open('${pl.browseId}', '${esJs(im)}')" class="flex-shrink-0 w-36 cursor-pointer group p-2.5 rounded-2xl bg-[#20222c] border border-white/10 shadow-xl hover:bg-[#282b38] transition-all flex flex-col">
                            <div class="w-full aspect-square rounded-xl overflow-hidden mb-2 shadow-md">
                                <img src="${im}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='${FI}'" />
                            </div>
                            <p class="font-semibold text-xs truncate text-white px-0.5">${es(pl.name)}</p>
                        </div>`;
                    });
                    html+='</div></div>';
                }
                
                // FEATURED ON
                if(a.featuredOn&&a.featuredOn.length>0){
                    html+='<div class="mb-6"><h3 class="font-bold text-sm text-[#b3b3b3] uppercase tracking-wider mb-3 px-4">Tampil Di</h3><div class="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-4">';
                    a.featuredOn.forEach(function(fo){
                        var im=FI;
                        if(fo.thumbnails && fo.thumbnails.length > 0) {
                            var lastT = fo.thumbnails[fo.thumbnails.length - 1];
                            im = typeof lastT === 'string' ? lastT : (lastT.url || lastT.src || FI);
                        }
                        html+=`
                        <div onclick="Album.open('${fo.browseId}', '${esJs(im)}')" class="flex-shrink-0 w-36 cursor-pointer group p-2.5 rounded-2xl bg-[#20222c] border border-white/10 shadow-xl hover:bg-[#282b38] transition-all flex flex-col">
                            <div class="w-full aspect-square rounded-xl overflow-hidden mb-2 shadow-md">
                                <img src="${im}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='${FI}'" />
                            </div>
                            <p class="font-semibold text-xs truncate text-white px-0.5">${es(fo.name)}</p>
                            <p class="text-white/60 text-[10px] truncate px-0.5 mt-0.5">${es(fo.artist||'')}</p>
                        </div>`;
                    });
                    html+='</div></div>';
                }
                
                // SIMILAR ARTISTS
                if(a.similarArtists&&a.similarArtists.length>0){
                    html+='<div class="mb-6"><h3 class="font-bold text-sm text-[#b3b3b3] uppercase tracking-wider mb-3 px-4">Artis Serupa</h3><div class="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-4">';
                    a.similarArtists.forEach(function(s){
                        var im=FI;
                        if(s.thumbnails && s.thumbnails.length > 0) {
                            var lastT = s.thumbnails[s.thumbnails.length - 1];
                            im = typeof lastT === 'string' ? lastT : (lastT.url || lastT.src || FI);
                        }
                        html+=`
                        <div onclick="Artist.open('${s.browseId}','${esJs(s.name)}')" class="flex-shrink-0 w-32 cursor-pointer group p-2.5 rounded-2xl bg-[#20222c] border border-white/10 shadow-xl hover:bg-[#282b38] transition-all flex flex-col items-center">
                            <div class="w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-white/10 shadow-md group-hover:scale-105 transition-transform duration-300">
                                <img src="${im}" class="w-full h-full object-cover" onerror="this.src='${FI}'" />
                            </div>
                            <p class="font-semibold text-xs truncate text-white text-center w-full px-0.5">${es(s.name)}</p>
                            <p class="text-white/60 text-[10px] uppercase tracking-wider font-semibold mt-0.5">Artist</p>
                        </div>`;
                    });
                    html+='</div></div>';
                }
                
                gid('artist-content').innerHTML = fullHtml + html;
                lucide.createIcons();
            }
        });
    },
    currentArtistData: null,
    renderActive() {
        var modal = gid('artist-modal');
        if (!modal || modal.style.display === 'none' || !Artist.currentArtistData) return;
        var a = Artist.currentArtistData;
        var container = gid('artist-songs-list');
        if (!container || !a.topSongs) return;

        var songs = a.topSongs.slice(0, 10);
        var children = container.children;
        for (var i = 0; i < songs.length; i++) {
            var s = songs[i];
            var el = children[i];
            if (!el) continue;

            var isCur = S.ct && (
                S.ct.id === s.videoId ||
                S.ct.videoId === s.videoId ||
                (S.ct.title === s.title && S.ct.artist === (s.artist||a.name))
            );
            var isPlay = isCur && S.ip;
            var isLoad = isCur && S.il;

            var numHtml = '';
            var btnIcon = '';
            if (isLoad) {
                numHtml = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>';
                btnIcon = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';
            } else if (isPlay) {
                numHtml = '<div class="flex items-end justify-center gap-[2px] w-4 h-4 pb-0.5 mx-auto"><span class="w-[2px] bg-white rounded-full animate-eq-1"></span><span class="w-[2px] bg-white rounded-full animate-eq-2"></span><span class="w-[2px] bg-white rounded-full animate-eq-3"></span></div>';
                btnIcon = '<div class="flex items-end justify-center gap-[2px] w-4 h-4 pb-0.5"><span class="w-[2px] bg-white rounded-full animate-eq-1"></span><span class="w-[2px] bg-white rounded-full animate-eq-2"></span><span class="w-[2px] bg-white rounded-full animate-eq-3"></span></div>';
            } else if (isCur) {
                numHtml = '<svg class="w-4 h-4 text-white fill-current mx-auto" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
                btnIcon = '<svg class="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
            } else {
                numHtml = (i + 1);
                btnIcon = '<svg class="w-5 h-5 text-white/70 group-hover:text-white fill-current ml-0.5" viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
            }

            var numSpan = el.children[0];
            if (numSpan) numSpan.innerHTML = numHtml;

            var btnDiv = el.children[3];
            if (btnDiv) btnDiv.innerHTML = btnIcon;

            var rowBg = isPlay ? 'bg-white/15 border border-white/30 shadow-md' : (isCur ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent');
            el.className = 'flex items-center gap-3 p-3 rounded-xl cursor-pointer active:scale-[0.98] transition-all group ' + rowBg;

            var titleEl = el.querySelector('p');
            if (titleEl) {
                titleEl.className = 'text-sm truncate transition-colors ' + (isCur ? 'text-white font-bold' : 'text-white/90 font-medium');
            }
        }
        lucide.createIcons();
    },
    toggleLike() {
        if(Artist.currentArtistInfo && typeof toggleLikeArtist === 'function') {
            toggleLikeArtist(Artist.currentArtistInfo);
        }
    },
    updateLikeBtn() {
        var btn = gid('artist-like-btn');
        var text = gid('artist-like-text');
        if(!btn || !text || !Artist.currentArtistId) return;
        var isLiked = typeof isArtistLiked === 'function' ? isArtistLiked(Artist.currentArtistId) : false;
        
        if (isLiked) {
            btn.className = 'mt-3 px-6 py-2 rounded-full border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-white border-white/60 bg-white/20';
            btn.innerHTML = '<i data-lucide="user-check" class="w-4 h-4 fill-current"></i> <span id="artist-like-text">Disukai</span>';
        } else {
            btn.className = 'mt-3 px-6 py-2 rounded-full border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-white border-white/20 hover:bg-white/10';
            btn.innerHTML = '<i data-lucide="user-check" class="w-4 h-4"></i> <span id="artist-like-text">Sukai</span>';
        }
        if(typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    },
    share() {
        if(!Artist.currentArtistId) return;
        var info = Artist.currentArtistInfo || {};
        var name = info.name || (gid('artist-name') ? gid('artist-name').innerText : 'Artist');
        var cover = info.thumbnail || FI;
        var url = location.origin + '/artist/' + Artist.currentArtistId;

        if (typeof updateOGForArtist === 'function') {
            updateOGForArtist(name, cover);
        }

        if (navigator.share) {
            navigator.share({
                title: name + ' - CMzMusify',
                text: 'Dengarkan lagu & album terbaik dari ' + name + ' di CMzMusify!',
                url: url
            }).catch(function() {});
        } else {
            navigator.clipboard.writeText(url).then(function() {
                if (typeof showToast === 'function') showToast('Link artist berhasil disalin!');
            }).catch(function() {
                if (typeof showToast === 'function') showToast('Gagal menyalin link artist');
            });
        }
    },
    close(){
        if(window.location.pathname.startsWith('/artist/')) history.pushState({},'', '/');
        gid('artist-modal').style.display='none';
        Artist.currentArtistData = null;
        Artist.currentArtistInfo = null;
        if (typeof S !== 'undefined' && S.ct && S.ct.title && S.ct.cover) {
            if (typeof updateOG === 'function') updateOG(S.ct.title, S.ct.cover, S.ct.artist);
        } else {
            if (typeof updateOG === 'function') updateOG(null);
        }
    },
    play(vid,title,artist,cover){
        if (S.ct && (S.ct.id === vid || S.ct.videoId === vid || (S.ct.title === title && S.ct.artist === artist)) && AU.src) {
            TP();
            return;
        }
        var cov = toHDCover(cover, vid);
        
        var isTopSong = false;
        var topSongs = [];
        var idx = 0;
        
        if (Artist.currentArtistData && Artist.currentArtistData.topSongs) {
            var a = Artist.currentArtistData;
            topSongs = a.topSongs.slice(0, 10).map(function(s) {
                var sim = FI;
                if(s.thumbnails && s.thumbnails.length>0){
                    var last = s.thumbnails[s.thumbnails.length-1];
                    sim = typeof last==='string'?last:(last.url||last.src||FI);
                }
                return {
                    id: s.videoId, videoId: s.videoId, title: s.title, artist: s.artist || a.name, cover: toHDCover(sim, s.videoId), artistId: Artist.currentArtistId || '', ytUrl: 'https://youtube.com/watch?v='+s.videoId
                };
            });
            idx = topSongs.findIndex(function(x) { return x.videoId === vid; });
            if (idx !== -1) isTopSong = true;
        }

        if (isTopSong && topSongs.length > 0) {
            S.ct = topSongs[idx];
            S.ps = 'artist';
            S.pl = topSongs;
            S.pi = idx;
        } else {
            S.ct={id:vid,videoId:vid,title:title,artist:artist,cover:cov,artistId:Artist.currentArtistId || '',ytUrl:'https://youtube.com/watch?v='+vid};
            S.ps='artist';S.pl=[S.ct];S.pi=0;
        }
        
        var url=location.origin+'/play/'+S.ct.videoId;history.pushState({},'',url);
        UU();MP.show();S.il=true;UB();
        resetLyricsUI(vid);
        loadTrack(S.ct);
    }
};
