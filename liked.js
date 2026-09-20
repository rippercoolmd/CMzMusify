var Liked = {
    render() {
        var el = gid('view-liked');
        if(!el) return;
        var liked = typeof getLikedSongs === 'function' ? getLikedSongs() : [];
        var likedHtml = '';
        if(liked.length > 0) {
            likedHtml = liked.map(function(s, i) {
                var isCur = S.ct && (
                    S.ct.id === s.id ||
                    S.ct.videoId === s.videoId ||
                    (S.ct.title === s.title && S.ct.artist === s.artist)
                );
                var isPlay = isCur && S.ip;
                var isLoad = isCur && S.il;

                var playIconHtml = '';
                if (isLoad) {
                    playIconHtml = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';
                } else if (isPlay) {
                    playIconHtml = '<div class="flex items-end justify-center gap-[2px] w-4 h-4 pb-0.5"><span class="w-[2px] bg-white rounded-full animate-eq-1"></span><span class="w-[2px] bg-white rounded-full animate-eq-2"></span><span class="w-[2px] bg-white rounded-full animate-eq-3"></span></div>';
                } else if (isCur) {
                    playIconHtml = '<i data-lucide="pause" class="w-4 h-4 text-white fill-current"></i>';
                } else {
                    playIconHtml = '<i data-lucide="play" class="w-4 h-4 text-white fill-current ml-0.5"></i>';
                }

                var cardBg = isPlay ? 'bg-[#343a4e] border border-white/40 shadow-xl' : (isCur ? 'bg-[#2e3344] border border-white/30' : 'bg-[#20222c] border border-white/10 hover:bg-[#282b38]');

                return '<div class="rounded-2xl '+cardBg+' p-2.5 flex items-center gap-3 active:scale-[0.98] transition-all duration-300 group shadow-lg shadow-black/25">'+
                    '<div onclick="PK(\'liked\','+i+')" class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">'+
                        '<img src="'+s.cover+'" class="w-14 h-14 rounded-xl object-cover shrink-0 shadow-md border border-white/10" onerror="this.src=\''+FI+'\'" />'+
                        '<div class="min-w-0 flex-1">'+
                            '<h3 class="font-semibold text-sm text-white truncate">'+es(s.title)+'</h3>'+
                            '<p class="text-xs text-white/60 truncate mt-0.5">'+es(s.artist)+'</p>'+
                        '</div>'+
                    '</div>'+
                    '<button onclick="toggleLikeSong('+es(JSON.stringify(s)).replace(/"/g, '&quot;')+');Liked.render();" class="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 hover:bg-rose-500/30 active:scale-90 transition-all" title="Hapus dari Disukai">'+
                        '<i data-lucide="heart" class="w-4 h-4 fill-current"></i>'+
                    '</button>'+
                    '<button onclick="PK(\'liked\','+i+')" class="w-9 h-9 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 hover:bg-white/20 active:scale-90 transition-all">'+
                        playIconHtml+
                    '</button>'+
                '</div>';
            }).join('');
        } else {
            likedHtml = '<div class="text-center py-16 rounded-3xl bg-white/[0.04] border border-white/10 px-4"><div class="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-3"><i data-lucide="heart" class="w-8 h-8 text-rose-400"></i></div><h3 class="text-white font-bold text-base mb-1">Belum ada lagu disukai</h3><p class="text-white/60 text-xs max-w-xs mx-auto">Klik ikon hati pada lagu favoritmu untuk menyimpannya di sini.</p></div>';
        }

        el.innerHTML = `
        <div class="pt-8 pb-3.5 px-4 sticky top-0 z-30 border-b border-white/10 shadow-2xl transition-all flex justify-between items-center" style="background: linear-gradient(180deg, rgba(8, 9, 13, 0.4) 0%, rgba(8, 9, 13, 0.75) 100%), url('/banner.png') center/cover no-repeat; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
            <h1 class="text-3xl font-black text-white tracking-tight drop-shadow-md">Liked Songs</h1>
            <div class="w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-rose-400 shadow-lg">
                <i data-lucide="heart" class="w-5 h-5 fill-current"></i>
            </div>
        </div>
        <div class="px-4 mt-4 space-y-3">
            ${liked.length > 0 ? `<div class="flex items-center justify-between mb-2"><span class="text-xs font-semibold text-white/60 uppercase tracking-wider">${liked.length} Lagu Tersimpan</span><button onclick="PK('liked',0)" class="text-xs text-rose-400 font-bold hover:underline flex items-center gap-1"><i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i> Putar Semua</button></div>` : ''}
            <div class="space-y-2.5">${likedHtml}</div>
        </div>`;
        lucide.createIcons();
    }
};
