var Library={
    activeTab: 'playlists',
    setTab(t){
        Library.activeTab = t;
        Library.render();
    },
    render(){
        var pls = typeof getUserPlaylists === 'function' ? getUserPlaylists() : [];
        var likedArtists = typeof getLikedArtists === 'function' ? getLikedArtists() : [];
        var isPlaylistsTab = Library.activeTab === 'playlists';
        var isArtistsTab = Library.activeTab === 'artists';

        var html = '<div class="pt-8 pb-3.5 px-4 sticky top-0 z-30 border-b border-white/10 shadow-2xl transition-all" style="background: linear-gradient(180deg, rgba(8, 9, 13, 0.4) 0%, rgba(8, 9, 13, 0.75) 100%), url(\'/banner.png\') center/cover no-repeat; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">' +
            '<div class="flex items-center justify-between mb-3">' +
                '<h1 class="text-3xl font-black text-white tracking-tight drop-shadow-md">Library</h1>' +
            '</div>' +
            
            '<!-- Tabs Navigation -->' +
            '<div class="flex gap-2 p-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/15">' +
                '<button onclick="Library.setTab(\'playlists\')" class="flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ' + (isPlaylistsTab ? 'bg-white text-black shadow-md' : 'text-white/70 hover:text-white') + '">' +
                    '<i data-lucide="list-music" class="w-4 h-4 ' + (isPlaylistsTab ? 'text-blue-600' : '') + '"></i>' +
                    '<span>Playlists</span>' +
                '</button>' +
                '<button onclick="Library.setTab(\'artists\')" class="flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ' + (isArtistsTab ? 'bg-white text-black shadow-md' : 'text-white/70 hover:text-white') + '">' +
                    '<i data-lucide="user" class="w-4 h-4 ' + (isArtistsTab ? 'text-amber-600' : '') + '"></i>' +
                    '<span>Artists</span>' +
                '</button>' +
            '</div>' +
        '</div>' +
        '<div class="px-4 mt-4 pb-12">';

        if (isArtistsTab) {
            // ARTISTS TAB CONTENT
            if(likedArtists.length === 0){
                html += '<div class="text-center text-white/70 py-16 px-4 bg-white/[0.04] backdrop-blur-xl rounded-3xl border border-white/10 mt-2">' +
                    '<div class="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">' +
                        '<i data-lucide="user" class="w-10 h-10 text-amber-400 opacity-60"></i>' +
                    '</div>' +
                    '<h3 class="text-white font-bold text-lg mb-1">Belum Ada Artist Disukai</h3>' +
                    '<p class="text-xs text-white/70 max-w-xs mx-auto mb-6">Sukai artist favoritmu untuk melihatnya di sini.</p>' +
                    '<button onclick="App.switch(\'search\')" class="bg-white/10 hover:bg-white/20 px-6 py-3 font-bold rounded-full text-xs active:scale-95 inline-flex items-center gap-1.5 text-white border border-white/20 transition-all"><i data-lucide="search" class="w-4 h-4"></i> Cari Artist</button>' +
                '</div>';
            } else {
                html += '<div class="grid grid-cols-2 gap-3">';
                likedArtists.forEach(function(a){
                    html += '<div onclick="Artist.open(\'' + es(a.artistId) + '\', \'' + esJs(a.name) + '\')" class="p-3.5 rounded-2xl bg-[#20222c] border border-white/10 shadow-xl hover:bg-[#282b38] cursor-pointer active:scale-95 transition-all text-center flex flex-col items-center justify-center group">' +
                        '<div class="relative w-20 h-20 mb-3 rounded-full overflow-hidden border-2 border-white/10 shadow-md group-hover:scale-105 transition-transform duration-300">' +
                            '<img src="' + a.thumbnail + '" class="w-full h-full object-cover" onerror="this.src=\'' + FI + '\'" />' +
                        '</div>' +
                        '<h3 class="font-bold text-sm truncate text-white w-full px-1">' + es(a.name) + '</h3>' +
                        '<p class="text-white/60 text-[10px] mt-0.5 uppercase tracking-wider font-semibold">Artist</p>' +
                    '</div>';
                });
                html += '</div>';
            }
        } else if (isPlaylistsTab) {
            // PLAYLISTS TAB CONTENT
            html += '<button onclick="Library.createNew()" class="w-full bg-white/15 hover:bg-white/20 border border-white/20 font-bold py-3.5 rounded-2xl active:scale-95 mb-5 flex items-center justify-center gap-2 text-white shadow-lg transition-all">+ Buat Playlist Baru</button>';
            
            if(pls.length === 0){
                html += '<div class="text-center text-white/70 py-16 px-4 bg-white/[0.04] backdrop-blur-xl rounded-3xl border border-white/10 mt-2">' +
                    '<i data-lucide="list-music" class="w-16 h-16 mx-auto mb-4 opacity-30 text-white"></i>' +
                    '<h3 class="text-white font-bold text-lg mb-1">Belum Ada Playlist</h3>' +
                    '<p class="text-xs text-white/70 max-w-xs mx-auto mb-5">Buat playlist pertamamu dan kumpulkan lagu-lagu favoritmu di satu tempat.</p>' +
                '</div>';
            } else {
                html += '<div class="grid grid-cols-2 gap-3">';
                pls.forEach(function(p){
                    html += '<div onclick="Library.open(\'' + p.id + '\')" class="p-2.5 rounded-2xl bg-[#20222c] border border-white/10 shadow-xl hover:bg-[#282b38] cursor-pointer active:scale-95 transition-all group flex flex-col">' +
                        '<div class="relative w-full aspect-square mb-2.5 rounded-xl overflow-hidden shadow-md">' +
                            '<img src="' + (p.image || (p.songs.length > 0 ? p.songs[0].cover : FI)) + '" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.src=\'' + FI + '\'" />' +
                            '<button onclick="event.stopPropagation();Library.showActions(\'' + p.id + '\')" class="absolute top-2 right-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full p-2 active:scale-90 transition-all" title="Opsi Playlist"><i data-lucide="more-vertical" class="w-4 h-4 text-white"></i></button>' +
                            (p.songs.length > 0 ? '<button onclick="event.stopPropagation();Library.playSong(\'' + p.id + '\',0)" class="absolute bottom-2 right-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-2.5 shadow-black/40 active:scale-90" title="Putar"><i data-lucide="play" class="w-4 h-4 text-white fill-current ml-0.5"></i></button>' : '') +
                        '</div>' +
                        '<h3 class="font-semibold text-sm truncate text-white px-0.5">' + es(p.name) + '</h3>' +
                        '<p class="text-white/60 text-xs mt-0.5 px-0.5">' + p.songs.length + ' lagu</p>' +
                    '</div>';
                });
                html += '</div>';
            }
        }

        html += '</div>';
        gid('view-library').innerHTML = html;
        lucide.createIcons();
    },
    playAllLiked(){
        var songs = typeof getLikedSongs === 'function' ? getLikedSongs() : [];
        if(!songs.length) return;
        S.pl = songs;
        S.pi = 0;
        S.ps = 'playlist';
        S.ct = S.pl[S.pi];
        UU(); MP.show(); S.il = true; UB();
        resetLyricsUI(S.ct.videoId);
        loadTrack(S.ct);
    },
    playLikedIndex(index){
        var songs = typeof getLikedSongs === 'function' ? getLikedSongs() : [];
        if(!songs[index]) return;
        var s = songs[index];
        if (S.ct && (S.ct.id === s.id || S.ct.videoId === s.videoId || (S.ct.title === s.title && S.ct.artist === s.artist)) && AU.src) {
            TP();
            return;
        }
        S.pl = songs;
        S.pi = index;
        S.ps = 'playlist';
        S.ct = S.pl[S.pi];
        UU(); MP.show(); S.il = true; UB();
        resetLyricsUI(S.ct.videoId);
        loadTrack(S.ct);
    },
    createNew(){
        var popup=document.createElement('div');popup.className='fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
        popup.innerHTML='<div class="glass-strong w-full max-w-md rounded-t-3xl p-6 border-t border-white/10" style="animation:slideUp 0.3s ease-out forwards;"><div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div><h3 class="font-bold text-white mb-4">Buat Playlist Baru</h3><input id="pl-name" class="w-full glass-input text-white rounded-xl px-4 py-3 mb-3 focus:outline-none" placeholder="Nama Playlist" /><input id="pl-image" type="file" accept="image/*" class="w-full text-sm text-white/70 mb-4" /><div class="flex gap-3"><button id="pl-create" class="flex-1 btn-chrome font-bold py-3 rounded-full">Buat</button><button onclick="this.closest(\'.fixed\').remove()" class="px-6 py-3 glass glass-hover text-white rounded-full">Batal</button></div></div>';
        document.body.appendChild(popup);
        popup.querySelector('#pl-create').onclick=function(){
            var name=gid('pl-name').value.trim()||'Playlist Baru';
            var file=gid('pl-image').files[0];
            if(file){var reader=new FileReader();reader.onload=function(e){createPlaylist(name,e.target.result);popup.remove();Library.render();};reader.readAsDataURL(file);}
            else{createPlaylist(name,'');popup.remove();Library.render();}
        };
    },
    showActions(id){
        var pls=getUserPlaylists();var pl=pls.find(function(p){return p.id===id;});if(!pl)return;
        var popup=document.createElement('div');popup.className='fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
        popup.onclick=function(e){if(e.target===popup)popup.remove();};
        popup.innerHTML='<div class="w-full max-w-md rounded-t-3xl p-6 border-t border-white/10 glass-strong" style="animation:slideUp 0.3s ease-out forwards; background: var(--bg-color);">'+
            '<div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>'+
            '<div class="flex items-center gap-3 mb-5"><img src="'+(pl.image||(pl.songs.length>0?pl.songs[0].cover:FI))+'" class="w-12 h-12 rounded-lg object-cover" onerror="this.src=\''+FI+'\'" /><div class="truncate"><h3 class="font-bold text-white truncate">'+es(pl.name)+'</h3><p class="text-white/70 text-xs">'+pl.songs.length+' lagu</p></div></div>'+
            '<button onclick="this.closest(\'.fixed\').remove();Library.editPlaylist(\''+id+'\')" class="w-full text-left p-4 rounded-xl hover:bg-white/5 flex items-center gap-3 mb-1"><i data-lucide="pencil" class="w-5 h-5 text-white"></i><span class="font-medium text-white">Edit Playlist</span></button>'+
            '<button onclick="this.closest(\'.fixed\').remove();Library.confirmDelete(\''+id+'\')" class="w-full text-left p-4 rounded-xl hover:bg-red-500/10 flex items-center gap-3"><i data-lucide="trash-2" class="w-5 h-5 text-red-400"></i><span class="font-medium text-red-400">Hapus Playlist</span></button>'+
        '</div>';
        document.body.appendChild(popup);lucide.createIcons();
    },
    editPlaylist(id){
        var pls=getUserPlaylists();var pl=pls.find(function(p){return p.id===id;});if(!pl)return;
        var popup=document.createElement('div');popup.className='fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
        popup.innerHTML='<div class="glass-strong w-full max-w-md rounded-t-3xl p-6 border-t border-white/10" style="animation:slideUp 0.3s ease-out forwards;"><div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div><h3 class="font-bold text-white mb-4">Edit Playlist</h3><input id="pl-edit-name" class="w-full glass-input text-white rounded-xl px-4 py-3 mb-3 focus:outline-none" placeholder="Nama Playlist" value="'+es(pl.name).replace(/"/g,'&quot;')+'" /><input id="pl-edit-image" type="file" accept="image/*" class="w-full text-sm text-white/70 mb-4" /><div class="flex gap-3"><button id="pl-edit-save" class="flex-1 btn-chrome font-bold py-3 rounded-full">Simpan</button><button onclick="this.closest(\'.fixed\').remove()" class="px-6 py-3 glass glass-hover text-white rounded-full">Batal</button></div></div>';
        document.body.appendChild(popup);
        popup.querySelector('#pl-edit-save').onclick=function(){
            var name=gid('pl-edit-name').value.trim()||pl.name;
            var file=gid('pl-edit-image').files[0];
            if(file){var reader=new FileReader();reader.onload=function(e){updateUserPlaylist(id,name,e.target.result);popup.remove();Library.render();showToast('Playlist diperbarui');};reader.readAsDataURL(file);}
            else{updateUserPlaylist(id,name,null);popup.remove();Library.render();showToast('Playlist diperbarui');}
        };
    },
    confirmDelete(id){
        var pls=getUserPlaylists();var pl=pls.find(function(p){return p.id===id;});if(!pl)return;
        var popup=document.createElement('div');popup.className='fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
        popup.innerHTML='<div class="glass-strong w-full max-w-md rounded-t-3xl p-6 border-t border-white/10" style="animation:slideUp 0.3s ease-out forwards;"><div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div><h3 class="font-bold text-white mb-2">Hapus "'+es(pl.name)+'"?</h3><p class="text-white/70 text-sm mb-5">Playlist ini akan dihapus permanen dan tidak bisa dikembalikan.</p><div class="flex gap-3"><button onclick="deleteUserPlaylist(\''+id+'\');this.closest(\'.fixed\').remove();Library.render();Library.close();showToast(\'Playlist dihapus\')" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-full active:scale-95">Hapus</button><button onclick="this.closest(\'.fixed\').remove()" class="px-6 py-3 glass glass-hover text-white rounded-full">Batal</button></div></div>';
        document.body.appendChild(popup);
    },
    share(id){
        var pls = getUserPlaylists();
        var pl = pls.find(function(p){return p.id===id;});
        if(!pl) return;
        var url = location.origin + '/playlist/' + id;
        var text = 'Dengarkan playlist "' + pl.name + '" (' + pl.songs.length + ' lagu) di CMzMusify!';
        if (navigator.share) {
            navigator.share({ title: pl.name + ' - CMzMusify', text: text, url: url }).catch(function(){});
        } else {
            navigator.clipboard.writeText(url).then(function(){
                showToast('Link playlist berhasil disalin!');
            }).catch(function(){
                showToast('Gagal menyalin link playlist');
            });
        }
    },
    handleScroll(){
        const c = gid('library-content');
        const h = gid('library-header');
        if (!h) return;
        if (c && c.scrollTop > 50) {
            h.style.background = 'rgba(5, 5, 7, 0.9)';
        } else {
            h.style.background = 'transparent';
        }
    },
    currentPlaylistId: null,
    open(id){
        var pls=getUserPlaylists();var pl=pls.find(function(p){return p.id===id;});if(!pl)return;
        Library.currentPlaylistId = id;
        var url = location.origin + '/playlist/' + id;
        history.pushState({}, '', url);
        
        var modal = gid('library-modal');
        if(!modal) {
            modal = document.createElement('div');
            modal.id = 'library-modal';
            modal.className = 'fixed inset-0 bg-[#050507] flex flex-col z-[100]';
            modal.style.animation = 'slideUp 0.3s ease-out forwards';
            document.body.appendChild(modal);
        }
        modal.style.display = 'flex';
        
        var html=`
            <div class="flex items-center gap-3 p-4 pt-safe bg-transparent absolute top-0 left-0 w-full z-[100] transition-all" id="library-header">
                <button onclick="Library.close()" class="glass glass-hover rounded-full text-white p-3 active:scale-90 shadow-md bg-black/80"><i data-lucide="arrow-left" class="w-6 h-6"></i></button>
                <div class="flex-1"></div>
                <div class="flex items-center gap-1 bg-black/80 rounded-full shadow-md">
                    <button onclick="Library.share('${id}')" class="text-white hover:text-white p-2.5 active:scale-90" title="Bagikan Playlist"><i data-lucide="share-2" class="w-5 h-5"></i></button>
                    <button onclick="Library.editPlaylist('${id}')" class="text-white hover:text-white p-2.5 active:scale-90" title="Edit Playlist"><i data-lucide="pencil" class="w-5 h-5"></i></button>
                    <button onclick="Library.confirmDelete('${id}')" class="text-red-400 hover:text-red-300 p-2.5 active:scale-90" title="Hapus Playlist"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto hide-scrollbar pb-36 relative" id="library-content" onscroll="Library.handleScroll()">
                <div class="relative w-full aspect-square md:aspect-video max-h-[50vh] overflow-hidden -mt-20 mb-6">
                    <img src="${pl.image||(pl.songs.length>0?pl.songs[0].cover:FI)}" class="w-full h-full object-cover" onerror="this.src='${FI}'" />
                    <div class="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-transparent"></div>
                    <div class="absolute bottom-6 left-6 right-6 flex flex-col justify-end items-center text-center z-10">
                        <img src="${pl.image||(pl.songs.length>0?pl.songs[0].cover:FI)}" class="w-32 h-32 md:w-48 md:h-48 rounded-xl object-cover border border-white/10 mb-4" onerror="this.src='${FI}'" />
                        <div>
                            <p class="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-1">PLAYLIST LOKAL</p>
                            <h1 class="text-3xl md:text-5xl font-black text-white mb-2 leading-tight line-clamp-2">${es(pl.name)}</h1>
                            <p class="text-white text-xs md:text-sm line-clamp-2">${pl.songs.length} lagu</p>
                        </div>
                    </div>
                </div>
                <div class="px-6 mb-6 flex items-center gap-4">
                    ${pl.songs.length>0?`<button onclick="Library.playSong('${id}',0)" class="bg-white hover:bg-gray-200 text-black w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-all shadow-white/20"><i data-lucide="play" class="w-7 h-7 fill-current ml-1"></i></button><button onclick="Library.shufflePlaylist('${id}')" class="text-white/70 hover:text-white p-3 rounded-full active:scale-95 bg-white/5 transition-all" title="Acak Urutan (Shuffle)"><i data-lucide="shuffle" class="w-6 h-6"></i></button>`:''}
                </div>
        `;
        if(pl.songs.length===0){
            html+='<div class="text-center text-white/70 mt-10"><p>Belum ada lagu</p></div>';
        } else {
            html+='<div id="playlist-songs-list" class="space-y-1 px-4">';
            pl.songs.forEach(function(s,i){
                var isCur = S.ct && (
                    S.ct.id === s.id ||
                    S.ct.videoId === s.videoId ||
                    (S.ct.title === s.title && S.ct.artist === s.artist)
                );
                var isPlay = isCur && S.ip;
                var isLoad = isCur && S.il;

                var iconOverlay = '';
                if (isLoad) {
                    iconOverlay = '<div class="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>';
                } else if (isPlay) {
                    iconOverlay = '<div class="flex items-end justify-center gap-[2px] w-4 h-4 pb-0.5"><span class="w-[2px] bg-rose-400 rounded-full animate-eq-1"></span><span class="w-[2px] bg-rose-400 rounded-full animate-eq-2"></span><span class="w-[2px] bg-rose-400 rounded-full animate-eq-3"></span></div>';
                } else if (isCur) {
                    iconOverlay = '<i data-lucide="pause" class="w-4 h-4 text-rose-400 fill-current"></i>';
                } else {
                    iconOverlay = '<i data-lucide="play" class="w-4 h-4 text-white fill-white"></i>';
                }

                var rowBg = isPlay ? 'bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-transparent border border-rose-500/30 shadow-md' : (isCur ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent');
                var titleClass = isCur ? 'text-rose-400 font-bold' : 'text-white font-medium';

                html+='<div class="flex items-center gap-2 p-2 rounded-lg active:scale-[0.98] ' + rowBg + '"><div onclick="Library.playSong(\''+id+'\','+i+')" class="flex items-center gap-3 flex-1 cursor-pointer overflow-hidden"><div class="relative w-10 h-10 rounded overflow-hidden shrink-0"><img src="'+s.cover+'" class="w-full h-full object-cover" onerror="this.src=\'' + FI + '\'" /><div class="absolute inset-0 bg-black/80 ' + (isCur ? 'opacity-100' : 'opacity-0 group-hover:opacity-100') + ' transition-all flex items-center justify-center">' + iconOverlay + '</div></div><div class="truncate flex-1 min-w-0"><p class="text-sm truncate ' + titleClass + '">'+es(s.title)+'</p><p class="text-white/70 text-xs truncate">'+es(s.artist)+'</p></div></div><button onclick="Library.removeSong(\''+id+'\','+i+')" class="text-white/70 hover:text-red-400 p-2 active:scale-90 shrink-0" title="Hapus"><i data-lucide="x" class="w-5 h-5"></i></button></div>';
            });
            html+='</div>';
        }
        html+='</div>';
        modal.innerHTML=html;
        lucide.createIcons();
    },
    closeModalOnly() {
        var modal = gid('library-modal');
        if(modal) modal.style.display = 'none';
        Library.currentPlaylistId = null;
    },
    close() {
        if(window.location.pathname.startsWith('/playlist/')) history.pushState({},'', '/');
        this.closeModalOnly();
        if (S.at === 'library') Library.render();
    },
    renderActive() {
        if (S.at === 'library' && S.libTab === 'liked') {
            Library.render();
            return;
        }
        var modal = gid('library-modal');
        if (!modal || modal.style.display === 'none' || !Library.currentPlaylistId) return;
        var pls = getUserPlaylists();
        var pl = pls.find(function(p){ return p.id === Library.currentPlaylistId; });
        var container = gid('playlist-songs-list');
        if (!container || !pl || !pl.songs) return;

        var children = container.children;
        for (var i = 0; i < pl.songs.length; i++) {
            var s = pl.songs[i];
            var el = children[i];
            if (!el) continue;

            var isCur = S.ct && (
                S.ct.id === s.id ||
                S.ct.videoId === s.videoId ||
                (S.ct.title === s.title && S.ct.artist === s.artist)
            );
            var isPlay = isCur && S.ip;
            var isLoad = isCur && S.il;

            var iconOverlay = '';
            if (isLoad) {
                iconOverlay = '<div class="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>';
            } else if (isPlay) {
                iconOverlay = '<div class="flex items-end justify-center gap-[2px] w-4 h-4 pb-0.5"><span class="w-[2px] bg-rose-400 rounded-full animate-eq-1"></span><span class="w-[2px] bg-rose-400 rounded-full animate-eq-2"></span><span class="w-[2px] bg-rose-400 rounded-full animate-eq-3"></span></div>';
            } else if (isCur) {
                iconOverlay = '<i data-lucide="pause" class="w-4 h-4 text-rose-400 fill-current"></i>';
            } else {
                iconOverlay = '<i data-lucide="play" class="w-4 h-4 text-white fill-white"></i>';
            }

            var coverOverlay = el.querySelector('.relative.w-10 .absolute');
            if (coverOverlay) {
                coverOverlay.innerHTML = iconOverlay;
                coverOverlay.className = 'absolute inset-0 bg-black/80 ' + (isCur ? 'opacity-100' : 'opacity-0 group-hover:opacity-100') + ' transition-all flex items-center justify-center';
            }

            var rowBg = isPlay ? 'bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-transparent border border-rose-500/30 shadow-md' : (isCur ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent');
            el.className = 'flex items-center gap-2 p-2 rounded-lg active:scale-[0.98] ' + rowBg;

            var titleEl = el.querySelector('p');
            if (titleEl) {
                titleEl.className = 'text-sm truncate ' + (isCur ? 'text-rose-400 font-bold' : 'text-white font-medium');
            }
        }
        lucide.createIcons();
    },
    removeSong(plId,index){var pls=getUserPlaylists();var pl=pls.find(function(p){return p.id===plId;});if(!pl)return;pl.songs.splice(index,1);saveUserPlaylists(pls);Library.open(plId);showToast('Lagu dihapus');},
    shufflePlaylist(plId){
        var pls = getUserPlaylists();
        var pl = pls.find(p => p.id === plId);
        if(!pl || pl.songs.length === 0) return;
        var arr = pl.songs;
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        saveUserPlaylists(pls);
        Library.open(plId);
        showToast('Urutan playlist diacak');
    },
    playSong(plId,index){
        var pls=getUserPlaylists();var pl=pls.find(function(p){return p.id===plId;});if(!pl||!pl.songs[index])return;
        var s = pl.songs[index];
        if (S.ct && (S.ct.id === s.id || S.ct.videoId === s.videoId || (S.ct.title === s.title && S.ct.artist === s.artist)) && AU.src) {
            TP();
            return;
        }
        S.pl=pl.songs;S.pi=index;S.ps='playlist';S.ct=S.pl[S.pi];UU();MP.show();S.il=true;UB();resetLyricsUI(S.ct.videoId);loadTrack(S.ct);
    }
};
