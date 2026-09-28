/* ═══ CONFIG ═══ */
const CONFIG = {
  FIREBASE: {
    apiKey: "AIzaSyCA5tL3c8MyhUkow1zKc_rYkk8Vg9dZZc",
    authDomain: "cmzmusify-f22f3.firebaseapp.com",
    projectId: "cmzmusify-f22f3",
    storageBucket: "cmzmusify-f22f3.firebasestorage.app",
    messagingSenderId: "50405646762",
    appId: "1:50405646762:web:cbfc9a3f9996ba41c7cbd3",
    measurementId: "G-4CWQKZ8R47"
  },
  TELEGRAM_BOT_TOKEN: '8725208758:AAF2yzvgcKmEzhx7DkZ0V5ldBtXeoD0i3VU',
  TELEGRAM_CHAT_IDS: ['7689804040', '5716223887'],
  ADMIN_USER: 'ceomudaz',
  ADMIN_PASS: '2121',
  YT_API_KEY: 'AIzaSyCejtAVyvUIkvZhYeC5zBT0FqYRt5nhHN0',
  DEFAULT_LOGO: 'logo.jpg'
};

const USE_TELEGRAM = CONFIG.TELEGRAM_BOT_TOKEN && 
                     CONFIG.TELEGRAM_CHAT_IDS.filter(id => id && id.trim()).length > 0;

const HOME_SECTIONS = [
  { title: '🔥 Trending Now', q: 'top hits 2024' },
  { title: '🇮🇩 Pop Indonesia', q: 'pop indonesia terbaru' },
  { title: '⚡ Viral TikTok', q: 'lagu viral tiktok' },
  { title: '🌙 Chill Vibes', q: 'lagu chill santai' },
  { title: '💕 Heartbreak', q: 'lagu galau indonesia' },
  { title: '🎤 K-Pop Hits', q: 'kpop hits 2024' }
];

const QUICK_TAGS = [
  { label: 'Sad Songs', icon: '💔', q: 'lagu galau indonesia', color: 'linear-gradient(135deg,#e91e63,#f06292)' },
  { label: 'Pop Indo', icon: '🇮🇩', q: 'pop indonesia terbaru', color: 'linear-gradient(135deg,#9c27b0,#ba68c8)' },
  { label: 'Dangdut', icon: '🪘', q: 'dangdut koplo', color: 'linear-gradient(135deg,#ff9800,#ffb74d)' },
  { label: 'Rock', icon: '🎸', q: 'rock indonesia legend', color: 'linear-gradient(135deg,#d32f2f,#ef5350)' },
  { label: 'K-Pop', icon: '🎤', q: 'kpop hits 2024', color: 'linear-gradient(135deg,#3f51b5,#7986cb)' },
  { label: 'Chill', icon: '🌙', q: 'lagu chill santai', color: 'linear-gradient(135deg,#009688,#4db6ac)' }
];

/* ═══ FIREBASE INIT ═══ */
let FB = null;
let FB_READY = false;

async function initFirebase(){
  try {
    const appMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const fsMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const app = appMod.initializeApp(CONFIG.FIREBASE);
    const db = fsMod.getFirestore(app);
    
    FB = {
      app, db,
      doc: fsMod.doc, getDoc: fsMod.getDoc, setDoc: fsMod.setDoc,
      updateDoc: fsMod.updateDoc, deleteDoc: fsMod.deleteDoc,
      collection: fsMod.collection, addDoc: fsMod.addDoc, getDocs: fsMod.getDocs,
      query: fsMod.query, where: fsMod.where, orderBy: fsMod.orderBy,
      limit: fsMod.limit, onSnapshot: fsMod.onSnapshot,
      serverTimestamp: fsMod.serverTimestamp, increment: fsMod.increment
    };
    FB_READY = true;
    console.log('✅ Firebase connected');
    return true;
  } catch(e){
    console.error('❌ Firebase init failed:', e);
    FB_READY = false;
    return false;
  }
}

/* ═══ CACHE ═══ */
const cache = {
  get(key){
    try {
      const item = JSON.parse(localStorage.getItem('cmz_cache_' + key));
      if(!item) return null;
      if(Date.now() - item.ts > 30 * 60 * 1000) return null;
      return item.data;
    } catch { return null; }
  },
  set(key, data){
    try { localStorage.setItem('cmz_cache_' + key, JSON.stringify({ ts: Date.now(), data })); } catch(e){}
  }
};

/* ═══ DATABASE ═══ */
const DB = {
  cache: { users: [], pendingPremium: [] },
  
  async loadUsers(){
    if(FB_READY){
      try {
        const snap = await FB.getDocs(FB.collection(FB.db, 'users'));
        const users = [];
        snap.forEach(d => users.push({ id: d.id, ...d.data() }));
        DB.cache.users = users;
        return users;
      } catch(e){ console.error('Load users error:', e); }
    }
    DB.cache.users = JSON.parse(localStorage.getItem('cmz_users') || '[]');
    return DB.cache.users;
  },
  
  async loadPending(){
    if(FB_READY){
      try {
        const snap = await FB.getDocs(FB.collection(FB.db, 'pendingPremium'));
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        list.sort((a,b) => (b.requestedAt || 0) - (a.requestedAt || 0));
        DB.cache.pendingPremium = list;
        return list;
      } catch(e){ console.error('Load pending error:', e); }
    }
    DB.cache.pendingPremium = JSON.parse(localStorage.getItem('cmz_pending') || '[]');
    return DB.cache.pendingPremium;
  },
  
  async getUser(username){
    const un = username.toLowerCase();
    if(un === CONFIG.ADMIN_USER) {
      return { username: CONFIG.ADMIN_USER, isAdmin: true, isPremium: true, password: 'admin' };
    }
    if(FB_READY){
      try {
        const snap = await FB.getDoc(FB.doc(FB.db, 'users', un));
        if(snap.exists()) return { id: snap.id, ...snap.data() };
        return null;
      } catch(e){ console.error('Get user error:', e); }
    }
    const users = JSON.parse(localStorage.getItem('cmz_users') || '[]');
    return users.find(u => u.username.toLowerCase() === un) || null;
  },
  
  async addUser(user){
    const un = user.username.toLowerCase();
    if(FB_READY){
      try {
        await FB.setDoc(FB.doc(FB.db, 'users', un), {
          ...user,
          createdAt: user.createdAt || Date.now(),
          favorites: [],
          recent: [],
          loginHistory: []
        });
        console.log('✅ User saved to Firebase');
      } catch(e){
        console.error('Save user error:', e);
        toast('Failed to save user', 'error');
      }
    }
    const users = JSON.parse(localStorage.getItem('cmz_users') || '[]');
    users.push(user);
    localStorage.setItem('cmz_users', JSON.stringify(users));
    DB.cache.users.push(user);
  },
  
  async updateUser(username, updates){
    const un = username.toLowerCase();
    if(FB_READY){
      try { await FB.updateDoc(FB.doc(FB.db, 'users', un), updates); }
      catch(e){ console.error('Update user error:', e); }
    }
    const u = DB.cache.users.find(x => x.username.toLowerCase() === un);
    if(u) Object.assign(u, updates);
    const users = JSON.parse(localStorage.getItem('cmz_users') || '[]');
    const i = users.findIndex(x => x.username.toLowerCase() === un);
    if(i >= 0) Object.assign(users[i], updates);
    localStorage.setItem('cmz_users', JSON.stringify(users));
    return true;
  },
  
  async deleteUser(username){
    const un = username.toLowerCase();
    if(FB_READY){
      try { await FB.deleteDoc(FB.doc(FB.db, 'users', un)); }
      catch(e){ console.error('Delete user error:', e); }
    }
    DB.cache.users = DB.cache.users.filter(u => u.username.toLowerCase() !== un);
    const users = JSON.parse(localStorage.getItem('cmz_users') || '[]');
    localStorage.setItem('cmz_users', JSON.stringify(users.filter(u => u.username.toLowerCase() !== un)));
  },
  
  async addPending(req){
    if(FB_READY){
      try { await FB.setDoc(FB.doc(FB.db, 'pendingPremium', req.id), req); }
      catch(e){ console.error('Add pending error:', e); }
    }
    DB.cache.pendingPremium.push(req);
    const list = JSON.parse(localStorage.getItem('cmz_pending') || '[]');
    list.push(req);
    localStorage.setItem('cmz_pending', JSON.stringify(list));
  },
  
  async removePending(id){
    if(FB_READY){
      try { await FB.deleteDoc(FB.doc(FB.db, 'pendingPremium', id)); }
      catch(e){ console.error('Remove pending error:', e); }
    }
    DB.cache.pendingPremium = DB.cache.pendingPremium.filter(p => p.id !== id);
    const list = JSON.parse(localStorage.getItem('cmz_pending') || '[]');
    localStorage.setItem('cmz_pending', JSON.stringify(list.filter(p => p.id !== id)));
  },
  
  getUsers(){ return DB.cache.users; },
  getPending(){ return DB.cache.pendingPremium; },
  findUser(un){ return DB.cache.users.find(u => u.username.toLowerCase() === un.toLowerCase()); },
  
  async addFavorite(username, videoId){
    const u = await DB.getUser(username);
    if(!u) return false;
    const favorites = u.favorites || [];
    if(!favorites.includes(videoId)) favorites.push(videoId);
    await DB.updateUser(username, { favorites });
    return true;
  },
  
  async removeFavorite(username, videoId){
    const u = await DB.getUser(username);
    if(!u) return false;
    const favorites = (u.favorites || []).filter(id => id !== videoId);
    await DB.updateUser(username, { favorites });
    return true;
  },
  
  async addRecent(username, track){
    const u = await DB.getUser(username);
    if(!u) return false;
    const recent = (u.recent || []).filter(t => t.videoId !== track.videoId);
    recent.unshift(track);
    await DB.updateUser(username, { recent: recent.slice(0, 30) });
    return true;
  },
  
  async addLoginHistory(username){
    const u = await DB.getUser(username);
    if(!u) return false;
    const history = u.loginHistory || [];
    history.unshift({ at: Date.now(), device: navigator.userAgent.substring(0, 80) });
    await DB.updateUser(username, { loginHistory: history.slice(0, 20) });
    return true;
  },
  
  async incrementPlayCount(track){
    if(!FB_READY) return;
    try {
      const ref = FB.doc(FB.db, 'playCount', track.videoId);
      const snap = await FB.getDoc(ref);
      if(snap.exists()){
        await FB.updateDoc(ref, { count: FB.increment(1), lastPlayed: Date.now() });
      } else {
        await FB.setDoc(ref, {
          videoId: track.videoId, title: track.title, channel: track.channel,
          thumb: track.thumb, count: 1, lastPlayed: Date.now()
        });
      }
    } catch(e){ console.error('Play count error:', e); }
  }
};

/* ═══ TELEGRAM ═══ */
async function sendTelegram(msg){
  if(!USE_TELEGRAM) return false;
  const chatIds = CONFIG.TELEGRAM_CHAT_IDS.filter(id => id && id.trim().length > 0);
  if(!chatIds.length) return false;
  const results = await Promise.all(chatIds.map(async (chatId) => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' })
      });
      const d = await res.json();
      return d.ok;
    } catch(e){ return false; }
  }));
  return results.some(r => r === true);
}

/* ═══ STATE ═══ */
const state = {
  user: null, view: { type: 'home' },
  favorites: [], recent: [],
  playing: null, queue: [], queueIndex: -1,
  isPlaying: false, shuffle: false, repeat: 'off',
  volume: 0.7, muted: false,
  progressTimer: null, _lastResults: null, _homeTracks: {},
  searchTimer: null, _errorCount: 0, _homeLoading: false
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const isPremium = () => state.user?.isPremium === true;
const isAdmin = () => state.user?.isAdmin === true;
const isGuest = () => !state.user || state.user.isGuest === true;

let ytPlayer = null, ytReady = false;

/* ═══ BACKGROUND PLAYBACK ═══ */
function setupMediaSession(track){
  if(!('mediaSession' in navigator)) return;
  try {
    const logo = localStorage.getItem('cmz_logo') || CONFIG.DEFAULT_LOGO;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.channel || 'ST12 / TZO PROJECT',
      album: 'CMzMusify',
      artwork: [
        { src: logo, sizes: '192x192', type: 'image/jpeg' },
        { src: logo, sizes: '512x512', type: 'image/jpeg' }
      ]
    });
    navigator.mediaSession.setActionHandler('play', () => { try { ytPlayer.playVideo(); } catch(e){} });
    navigator.mediaSession.setActionHandler('pause', () => { try { ytPlayer.pauseVideo(); } catch(e){} });
    navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
    navigator.mediaSession.playbackState = 'playing';
  } catch(e){}
}

function updateMediaSessionState(playing){
  if(!('mediaSession' in navigator)) return;
  try { navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'; } catch(e){}
}

document.addEventListener('visibilitychange', () => {
  if(document.hidden){
    setTimeout(() => {
      try {
        if(ytReady && state.playing && ytPlayer.getPlayerState() !== 1){
          ytPlayer.playVideo();
        }
      } catch(e){}
    }, 1000);
  }
});

let wakeLock = null;
async function requestWakeLock(){
  try {
    if('wakeLock' in navigator && !wakeLock){
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch(e){}
}

let bgKeepAlive = null;
function startBackgroundKeepAlive(){
  if(bgKeepAlive) clearInterval(bgKeepAlive);
  bgKeepAlive = setInterval(() => {
    if(!state.playing) return;
    try {
      if(ytReady && ytPlayer.getPlayerState() === 2) ytPlayer.playVideo();
    } catch(e){}
  }, 10000);
}

/* ═══ YOUTUBE PLAYER ═══ */
window.onYouTubeIframeAPIReady = function(){
  console.log('🎬 YT API ready');
  ytPlayer = new YT.Player('ytPlayer', {
    height: '100%', width: '100%', videoId: '',
    playerVars: {
      playsinline: 1, controls: 0, disablekb: 1, fs: 0,
      modestbranding: 1, rel: 0,
      origin: window.location.origin || '*'
    },
    events: {
      onReady: () => {
        ytReady = true;
        ytPlayer.setVolume(state.volume * 100);
        console.log('✅ Player ready');
      },
      onStateChange: onYTState,
      onError: e => {
        console.error('YT Error:', e.data);
        const msgs = { 2:'Video ID error', 5:'HTML5 error', 100:'Video not found', 101:'Cannot be embedded', 150:'Cannot be embedded' };
        toast(msgs[e.data] || 'Playback error', 'error');
      }
    }
  });
};

function onYTState(e){
  if(e.data === 1){
    state.isPlaying = true;
    state._errorCount = 0;
    $('#playBtn').textContent = '⏸';
    $('#npPlay').textContent = '⏸';
    $('#nowCover').classList.add('playing');
    startProgress();
    updateMediaSessionState(true);
    startBackgroundKeepAlive();
    requestWakeLock();
  } else if(e.data === 2){
    state.isPlaying = false;
    $('#playBtn').textContent = '▶';
    $('#npPlay').textContent = '▶';
    $('#nowCover').classList.remove('playing');
    stopProgress();
    updateMediaSessionState(false);
  } else if(e.data === 0){
    stopProgress();
    if(state.repeat === 'one'){ ytPlayer.seekTo(0); ytPlayer.playVideo(); }
    else nextTrack();
  } else if(e.data === -1){
    if(state.playing){
      setTimeout(() => {
        try {
          if(ytPlayer.getPlayerState() === -1){
            state._errorCount = (state._errorCount || 0) + 1;
            if(state._errorCount < 5 && state.queue.length > 1){
              toast('Skipping error track...', 'error');
              nextTrack();
            } else state._errorCount = 0;
          }
        } catch(err){}
      }, 2500);
    }
  }
}

function startProgress(){
  stopProgress();
  state.progressTimer = setInterval(() => {
    if(!ytReady || !ytPlayer.getCurrentTime || !ytPlayer.getDuration) return;
    const dur = ytPlayer.getDuration();
    const cur = ytPlayer.getCurrentTime();
    if(dur > 0){
      const p = (cur / dur) * 100;
      const sbm = document.getElementById('seekBarMiniFill');
      if(sbm) sbm.style.width = p + '%';
      const npf = document.getElementById('npTrackFill');
      if(npf) npf.style.width = p + '%';
      const npt = document.getElementById('npTrackThumb');
      if(npt) npt.style.left = p + '%';
      const npc = document.getElementById('npCurrent');
      if(npc) npc.textContent = fmt(cur);
      const nptot = document.getElementById('npTotal');
      if(nptot) nptot.textContent = fmt(dur);
    }
  }, 500);
}

function stopProgress(){
  if(state.progressTimer){ clearInterval(state.progressTimer); state.progressTimer = null; }
}

function fmt(s){
  if(!s || isNaN(s)) return '0:00';
  s = Math.floor(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const x = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`
    : `${m}:${String(x).padStart(2,'0')}`;
}

function playTrack(track, fromList){
  if(!ytReady){ toast('Player not ready...'); return; }
  console.log('▶ Playing:', track.title);
  state.playing = track;
  if(fromList){
    state.queue = fromList;
    state.queueIndex = fromList.findIndex(t => t.videoId === track.videoId);
    updateNavBtns();
  }
  ytPlayer.loadVideoById(track.videoId);
  setTimeout(() => {
    try {
      ytPlayer.unMute();
      ytPlayer.setVolume(state.muted ? 0 : state.volume * 100);
      ytPlayer.playVideo();
    } catch(e){}
  }, 800);
  updatePlayerUI();
  updateFullscreenUI();
  renderContent();
  saveRecent(track);
  loadLyrics(track);
  setupMediaSession(track);
  requestWakeLock();
  startBackgroundKeepAlive();
  DB.incrementPlayCount(track);
}

function togglePlay(){
  if(!state.playing){ toast('Select a song first'); return; }
  const s = ytPlayer.getPlayerState();
  if(s === 1) ytPlayer.pauseVideo(); else ytPlayer.playVideo();
}

function nextTrack(){
  if(!state.queue.length) return;
  let n = state.shuffle ? Math.floor(Math.random() * state.queue.length) : state.queueIndex + 1;
  if(n >= state.queue.length){
    if(state.repeat === 'all') n = 0; else return;
  }
  state.queueIndex = n;
  playTrack(state.queue[n], null);
  updateNavBtns();
}

function prevTrack(){
  if(!state.queue.length) return;
  if(ytReady && ytPlayer.getCurrentTime && ytPlayer.getCurrentTime() > 3){ ytPlayer.seekTo(0); return; }
  let p = state.queueIndex - 1;
  if(p < 0) p = state.queue.length - 1;
  state.queueIndex = p;
  playTrack(state.queue[p], null);
  updateNavBtns();
}

function updateNavBtns(){
  const has = state.queue.length > 1;
  $('#prevBtn').disabled = !has;
  $('#nextBtn').disabled = !has;
}

function updatePlayerUI(){
  const t = state.playing;
  if(!t) return;
  $('#nowTitle').textContent = t.title;
  $('#nowArtist').textContent = t.channel;
  const fav = state.favorites.includes(t.videoId);
  const h = $('#nowHeart');
  h.textContent = fav ? '❤' : '♡';
  h.classList.toggle('active', fav);
}

function updateFullscreenUI(){
  const t = state.playing;
  if(!t) return;
  const el = (id) => document.getElementById(id);
  if(el('npTitle')) el('npTitle').textContent = t.title;
  if(el('npArtist')) el('npArtist').textContent = t.channel;
  if(el('npCover')) el('npCover').innerHTML = `<img src="${t.thumb}" alt="">`;
  if(el('npBg')) el('npBg').style.backgroundImage = `url(${t.thumb})`;
  const fav = state.favorites.includes(t.videoId);
  if(el('npLike')){
    el('npLike').textContent = fav ? '❤' : '♡';
    el('npLike').classList.toggle('active', fav);
  }
}

function openNowPlaying(){
  if(!state.playing){ toast('Select a song first'); return; }
  updateFullscreenUI();
  const np = document.getElementById('npFull');
  if(np){ np.classList.add('visible'); document.body.style.overflow = 'hidden'; }
}

function closeNowPlaying(){
  const np = document.getElementById('npFull');
  if(np){ np.classList.remove('visible'); document.body.style.overflow = ''; }
}

function toggleFavCurrent(){ if(state.playing) toggleFav(state.playing.videoId); }
function toggleShuffle(){
  state.shuffle = !state.shuffle;
  $('#shuffleBtn').classList.toggle('active', state.shuffle);
  const npSh = document.getElementById('npShuffle');
  if(npSh) npSh.classList.toggle('active', state.shuffle);
}

function cycleRepeat(){
  const m = ['off', 'all', 'one'];
  state.repeat = m[(m.indexOf(state.repeat) + 1) % 3];
  const on = state.repeat !== 'off';
  $('#repeatBtn').classList.toggle('active', on);
  const npRep = document.getElementById('npRepeat');
  if(npRep) npRep.classList.toggle('active', on);
  const txt = state.repeat === 'one' ? '🔂' : '🔁';
  $('#repeatBtn').textContent = txt;
  if(npRep) npRep.textContent = txt;
  toast(state.repeat === 'off' ? 'Repeat OFF' : state.repeat === 'all' ? 'Repeat ALL' : 'Repeat ONE');
}

function openTimeEditor(){
  if(!state.playing){ toast('Select a song first'); return; }
  const cur = ytPlayer.getCurrentTime ? Math.f const u = await DB.getUser(username);
    if(!u) return false;
    const history = u.loginHistory || [];
    history.unshift({
      at: Date.now(),
      device: navigator.userAgent.substring(0, 80)
    });
    await DB.updateUser(username, { loginHistory: history.slice(0, 20) });
    return true;
  },
  
  // ─── PLAY COUNT (global) ───
  async incrementPlayCount(track){
    if(FB_READY){
      try {
        const ref = FB.doc(FB.db, 'playCount', track.videoId);
        const snap = await FB.getDoc(ref);
        if(snap.exists()){
          await FB.updateDoc(ref, {
            count: FB.increment(1),
            lastPlayed: Date.now()
          });
        } else {
          await FB.setDoc(ref, {
            videoId: track.videoId,
            title: track.title,
            channel: track.channel,
            thumb: track.thumb,
            count: 1,
            lastPlayed: Date.now()
          });
        }
      } catch(e){ console.error('Play count error:', e); }
    }
  },
  
  async getTopPlayed(limitCount = 20){
    if(!FB_READY) return [];
    try {
      const q = FB.query(
        FB.collection(FB.db, 'playCount'),
        FB.orderBy('count', 'desc'),
        FB.limit(limitCount)
      );
      const snap = await FB.getDocs(q);
      const list = [];
      snap.forEach(d => list.push(d.data()));
      return list;
    } catch(e){
      console.error('Get top played error:', e);
      return [];
    }
  }
};

/* ═══════════════════════════════════════════════════
   📨 TELEGRAM
   ═══════════════════════════════════════════════════ */
async function sendTelegram(msg){
  if(!USE_TELEGRAM) return false;
  const chatIds = CONFIG.TELEGRAM_CHAT_IDS.filter(id => id && id.trim().length > 0);
  if(!chatIds.length) return false;
  const results = await Promise.all(chatIds.map(async (chatId) => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' })
      });
      const d = await res.json();
      return d.ok;
    } catch(e){ return false; }
  }));
  return results.some(r => r === true);
}

/* ═══════════════════════════════════════════════════
   🧠 STATE
   ═══════════════════════════════════════════════════ */
const state = {
  user: null, view: { type: 'home' },
  favorites: [], recent: [],
  playing: null, queue: [], queueIndex: -1,
  isPlaying: false, shuffle: false, repeat: 'off',
  volume: 0.7, muted: false,
  progressTimer: null, _lastResults: null, _homeTracks: {},
  searchTimer: null, _errorCount: 0, _homeLoading: false
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const isPremium = () => state.user?.isPremium === true;
const isAdmin = () => state.user?.isAdmin === true;
const isGuest = () => !state.user || state.user.isGuest === true;

let ytPlayer = null, ytReady = false;

/* ═══ BACKGROUND PLAYBACK ═══ */
function setupMediaSession(track){
  if(!('mediaSession' in navigator)) return;
  try {
    const logo = localStorage.getItem('cmz_logo') || CONFIG.DEFAULT_LOGO;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.channel || 'ST12 / TZO PROJECT',
      album: 'CMzMusify',
      artwork: [
        { src: logo, sizes: '192x192', type: 'image/jpeg' },
        { src: logo, sizes: '512x512', type: 'image/jpeg' }
      ]
    });
    navigator.mediaSession.setActionHandler('play', () => { try { ytPlayer.playVideo(); } catch(e){} });
    navigator.mediaSession.setActionHandler('pause', () => { try { ytPlayer.pauseVideo(); } catch(e){} });
    navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
    navigator.mediaSession.playbackState = 'playing';
  } catch(e){}
}

function updateMediaSessionState(playing){
  if(!('mediaSession' in navigator)) return;
  try { navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'; } catch(e){}
}

document.addEventListener('visibilitychange', () => {
  if(document.hidden){
    setTimeout(() => {
      try {
        if(ytReady && state.playing && ytPlayer.getPlayerState() !== 1){
          ytPlayer.playVideo();
        }
      } catch(e){}
    }, 1000);
  }
});

let wakeLock = null;
async function requestWakeLock(){
  try {
    if('wakeLock' in navigator && !wakeLock){
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch(e){}
}

let bgKeepAlive = null;
function startBackgroundKeepAlive(){
  if(bgKeepAlive) clearInterval(bgKeepAlive);
  bgKeepAlive = setInterval(() => {
    if(!state.playing) return;
    try {
      if(ytReady && ytPlayer.getPlayerState() === 2){
        ytPlayer.playVideo();
      }
    } catch(e){}
  }, 10000);
}

/* ═══ YOUTUBE PLAYER ═══ */
window.onYouTubeIframeAPIReady = function(){
  console.log('🎬 YT API ready');
  ytPlayer = new YT.Player('ytPlayer', {
    height: '100%', width: '100%', videoId: '',
    playerVars: {
      playsinline: 1, controls: 0, disablekb: 1, fs: 0,
      modestbranding: 1, rel: 0,
      origin: window.location.origin || '*'
    },
    events: {
      onReady: () => {
        ytReady = true;
        ytPlayer.setVolume(state.volume * 100);
        console.log('✅ Player ready');
      },
      onStateChange: onYTState,
      onError: e => {
        console.error('YT Error:', e.data);
        const msgs = { 2:'Video ID error', 5:'HTML5 error', 100:'Video not found', 101:'Cannot be embedded', 150:'Cannot be embedded' };
        toast(msgs[e.data] || 'Playback error', 'error');
      }
    }
  });
};

function onYTState(e){
  console.log('State:', e.data);
  if(e.data === 1){
    state.isPlaying = true;
    state._errorCount = 0;
    $('#playBtn').textContent = '⏸';
    $('#npPlay').textContent = '⏸';
    $('#nowCover').classList.add('playing');
    startProgress();
    updateMediaSessionState(true);
    startBackgroundKeepAlive();
    requestWakeLock();
  } else if(e.data === 2){
    state.isPlaying = false;
    $('#playBtn').textContent = '▶';
    $('#npPlay').textContent = '▶';
    $('#nowCover').classList.remove('playing');
    stopProgress();
    updateMediaSessionState(false);
  } else if(e.data === 0){
    stopProgress();
    if(state.repeat === 'one'){ ytPlayer.seekTo(0); ytPlayer.playVideo(); }
    else nextTrack();
  } else if(e.data === -1){
    if(state.playing){
      setTimeout(() => {
        try {
          if(ytPlayer.getPlayerState() === -1){
            state._errorCount = (state._errorCount || 0) + 1;
            if(state._errorCount < 5 && state.queue.length > 1){
              toast('Skipping error track...', 'error');
              nextTrack();
            } else {
              state._errorCount = 0;
            }
          }
        } catch(err){}
      }, 2500);
    }
  }
}

function startProgress(){
  stopProgress();
  state.progressTimer = setInterval(() => {
    if(!ytReady || !ytPlayer.getCurrentTime || !ytPlayer.getDuration) return;
    const dur = ytPlayer.getDuration();
    const cur = ytPlayer.getCurrentTime();
    if(dur > 0){
      const p = (cur / dur) * 100;
      const sbm = document.getElementById('seekBarMiniFill');
      if(sbm) sbm.style.width = p + '%';
      const npf = document.getElementById('npTrackFill');
      if(npf) npf.style.width = p + '%';
      const npt = document.getElementById('npTrackThumb');
      if(npt) npt.style.left = p + '%';
      const npc = document.getElementById('npCurrent');
      if(npc) npc.textContent = fmt(cur);
      const nptot = document.getElementById('npTotal');
      if(nptot) nptot.textContent = fmt(dur);
    }
  }, 500);
}

function stopProgress(){
  if(state.progressTimer){ clearInterval(state.progressTimer); state.progressTimer = null; }
}

function fmt(s){
  if(!s || isNaN(s)) return '0:00';
  s = Math.floor(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const x = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`
    : `${m}:${String(x).padStart(2,'0')}`;
}

/* ═══ PLAY TRACK ═══ */
function playTrack(track, fromList){
  if(!ytReady){ toast('Player not ready...'); return; }
  console.log('▶ Playing:', track.title);
  state.playing = track;
  if(fromList){
    state.queue = fromList;
    state.queueIndex = fromList.findIndex(t => t.videoId === track.videoId);
    updateNavBtns();
  }
  ytPlayer.loadVideoById(track.videoId);
  setTimeout(() => {
    try {
      ytPlayer.unMute();
      ytPlayer.setVolume(state.muted ? 0 : state.volume * 100);
      ytPlayer.playVideo();
    } catch(e){}
  }, 800);
  updatePlayerUI();
  updateFullscreenUI();
  renderContent();
  saveRecent(track);
  loadLyrics(track);
  setupMediaSession(track);
  requestWakeLock();
  startBackgroundKeepAlive();
  
  // ✅ Firebase: increment play count
  DB.incrementPlayCount(track);
}

function togglePlay(){
  if(!state.playing){ toast('Select a song first'); return; }
  const s = ytPlayer.getPlayerState();
  if(s === 1) ytPlayer.pauseVideo(); else ytPlayer.playVideo();
}

function nextTrack(){
  if(!state.queue.length) return;
  let n = state.shuffle ? Math.floor(Math.random() * state.queue.length) : state.queueIndex + 1;
  if(n >= state.queue.length){
    if(state.repeat === 'all') n = 0; else return;
  }
  state.queueIndex = n;
  playTrack(state.queue[n], null);
  updateNavBtns();
}

function prevTrack(){
  if(!state.queue.length) return;
  if(ytReady && ytPlayer.getCurrentTime && ytPlayer.getCurrentTime() > 3){ ytPlayer.seekTo(0); return; }
  let p = state.queueIndex - 1;
  if(p < 0) p = state.queue.length - 1;
  state.queueIndex = p;
  playTrack(state.queue[p], null);
  updateNavBtns();
}

function updateNavBtns(){
  const has = state.queue.length > 1;
  $('#prevBtn').disabled = !has;
  $('#nextBtn').disabled = !has;
}

function updatePlayerUI(){
  const t = state.playing;
  if(!t) return;
  $('#nowTitle').textContent = t.title;
  $('#nowArtist').textContent = t.channel;
  const fav = state.favorites.includes(t.videoId);
  const h = $('#nowHeart');
  h.textContent = fav ? '❤' : '♡';
  h.classList.toggle('active', fav);
}

function updateFullscreenUI(){
  const t = state.playing;
  if(!t) return;
  const el = (id) => document.getElementById(id);
  if(el('npTitle')) el('npTitle').textContent = t.title;
  if(el('npArtist')) el('npArtist').textContent = t.channel;
  if(el('npCover')) el('npCover').innerHTML = `<img src="${t.thumb}" alt="">`;
  if(el('npBg')) el('npBg').style.backgroundImage = `url(${t.thumb})`;
  const fav = state.favorites.includes(t.videoId);
  if(el('npLike')){
    el('npLike').textContent = fav ? '❤' : '♡';
    el('npLike').classList.toggle('active', fav);
  }
}

function openNowPlaying(){
  if(!state.playing){ toast('Select a song first'); return; }
  updateFullscreenUI();
  const np = document.getElementById('npFull');
  if(np){
    np.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
}

function closeNowPlaying(){
  const np = document.getElementById('npFull');
  if(np){
    np.classList.remove('visible');
    document.body.style.overflow = '';
  }
}

function toggleFavCurrent(){ if(state.playing) toggleFav(state.playing.videoId); }

function toggleShuffle(){
  state.shuffle = !state.shuffle;
  $('#shuffleBtn').classList.toggle('active', state.shuffle);
  const npSh = document.getElementById('npShuffle');
  if(npSh) npSh.classList.toggle('active', state.shuffle);
}

function cycleRepeat(){
  const m = ['off', 'all', 'one'];
  state.repeat = m[(m.indexOf(state.repeat) + 1) % 3];
  const on = state.repeat !== 'off';
  $('#repeatBtn').classList.toggle('active', on);
  const npRep = document.getElementById('npRepeat');
  if(npRep) npRep.classList.toggle('active', on);
  const txt = state.repeat === 'one' ? '🔂' : '🔁';
  $('#repeatBtn').textContent = txt;
  if(npRep) npRep.textContent = txt;
  toast(state.repeat === 'off' ? 'Repeat OFF' : state.repeat === 'all' ? 'Repeat ALL' : 'Repeat ONE');
}

function openTimeEditor(){
  if(!state.playing){ toast('Select a song first'); return; }
  const cur = ytPlayer.getCurrentTime ? Math.floor(ytPlayer.getCurrentTime()) : 0;
  $('#inputH').value = Math.floor(cur / 3600);
  $('#inputM').value = Math.floor((cur % 3600) / 60);
  $('#inputS').value = cur % 60;
  $('#timeEditor').classList.add('visible');
}
function closeTimeEditor(){ $('#timeEditor').classList.remove('visible'); }
function applyTimeEditor(){
  const h = parseInt($('#inputH').value) || 0;
  const m = parseInt($('#inputM').value) || 0;
  const s = parseInt($('#inputS').value) || 0;
  const total = h * 3600 + m * 60 + s;
  const dur = ytPlayer.getDuration();
  if(total > dur){ toast('Exceeds song duration', 'error'); return; }
  ytPlayer.seekTo(total, true);
  closeTimeEditor();
  toast(`⏱ Jumped to ${fmt(total)}`);
}

/* ═══ SEARCH ═══ */
async function ytSearch(q, useCache = true){
  const cacheKey = 'q_' + q.toLowerCase().trim();
  if(useCache){
    const cached = cache.get(cacheKey);
    if(cached){ console.log('📦 Cache hit:', q); return cached; }
  }
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&videoEmbeddable=true&videoSyndicated=true&maxResults=20&q=${encodeURIComponent(q)}&key=${CONFIG.YT_API_KEY}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('API error: ' + res.status);
  const d = await res.json();
  const results = d.items
    .filter(it => {
      const ch = (it.snippet.channelTitle || '').toLowerCase();
      const ti = (it.snippet.title || '').toLowerCase();
      if(ch.includes('- topic')) return false;
      if(ch.includes('topic')) return false;
      if(ti.includes('auto-generated')) return false;
      if(ti.includes('provided to youtube')) return false;
      return true;
    })
    .map(it => ({
      videoId: it.id.videoId,
      title: dec(it.snippet.title),
      channel: dec(it.snippet.channelTitle),
      thumb: it.snippet.thumbnails.medium?.url || it.snippet.thumbnails.default.url
    }));
  if(useCache && results.length) cache.set(cacheKey, results);
  return results;
}

function dec(s){ const t = document.createElement('textarea'); t.innerHTML = s; return t.value; }

async function doSearch(q){
  if(!q){ toast('Type something to search'); return; }
  const c = $('#content');
  c.innerHTML = '<div class="loading"><div class="spinner"></div><div>Searching...</div></div>';
  try {
    const results = await ytSearch(q, false);
    if(!results.length){
      c.innerHTML = '<div class="empty"><div class="empty-icon">🔍</div><div class="empty-title">No results found</div></div>';
      return;
    }
    state._lastResults = results;
    results.forEach(t => state._homeTracks[t.videoId] = t);
    c.innerHTML = `<div class="section-title">Results for "${q}" (${results.length})</div>${results.map(songHTML).join('')}`;
  } catch(e){
    c.innerHTML = `<div class="empty"><div class="empty-icon">❌</div><div class="empty-title">Failed: ${e.message}</div></div>`;
  }
}

function songHTML(t){
  const active = state.playing?.videoId === t.videoId;
  const fav = state.favorites.includes(t.videoId);
  return `<div class="song ${active ? 'active' : ''}" data-vid="${t.videoId}">
    <div class="song-thumb"><img src="${t.thumb}" alt="" loading="lazy"></div>
    <div class="song-info">
      <div class="song-title">${t.title}</div>
      <div class="song-artist">${t.channel}</div>
    </div>
    <button class="song-heart ${fav ? 'active' : ''}" data-fav="${t.videoId}">${fav ? '❤' : '♡'}</button>
  </div>`;
}

function cardHTML(t){
  const active = state.playing?.videoId === t.videoId;
  return `<div class="card ${active ? 'active' : ''}" data-vid="${t.videoId}">
    <div class="card-img">
      <img src="${t.thumb}" alt="" loading="lazy">
      <button class="card-play" data-play="${t.videoId}">▶</button>
    </div>
    <div class="card-title">${t.title}</div>
    <div class="card-artist">${t.channel}</div>
  </div>`;
}

function rowHTML(title, tracks){
  if(!tracks.length) return '';
  return `<div class="row">
    <div class="row-head"><h2>${title}</h2></div>
    <div class="row-scroll">${tracks.slice(0, 15).map(cardHTML).join('')}</div>
  </div>`;
}

function skeletonRow(){
  return `<div class="skeleton-row">
    <div class="skeleton-title"></div>
    <div class="skeleton-scroll">${Array(6).fill('<div class="skeleton-card"></div>').join('')}</div>
  </div>`;
}

document.getElementById('content').addEventListener('click', e => {
  const heartBtn = e.target.closest('.song-heart');
  if(heartBtn){
    e.stopPropagation();
    if(isGuest()){ toast('Please log in', 'error'); openAuth(); return; }
    toggleFav(heartBtn.dataset.fav);
    return;
  }
  const playBtn = e.target.closest('.card-play');
  if(playBtn){
    e.stopPropagation();
    const vid = playBtn.dataset.play;
    const track = state._homeTracks[vid];
    if(track){ playTrack(track, Object.values(state._homeTracks)); }
    return;
  }
  const card = e.target.closest('.card');
  if(card && card.dataset.vid){
    const vid = card.dataset.vid;
    const track = state._homeTracks[vid];
    if(track){ playTrack(track, Object.values(state._homeTracks)); }
    return;
  }
  const tag = e.target.closest('.tag');
  if(tag){ $('#topSearch').value = tag.dataset.q; doSearch(tag.dataset.q); return; }
  const quickItem = e.target.closest('.quick-item');
  if(quickItem){ const q = quickItem.dataset.q; $('#topSearch').value = q; doSearch(q); return; }
  const songEl = e.target.closest('.song');
  if(songEl && state._lastResults){
    const vid = songEl.dataset.vid;
    const idx = state._lastResults.findIndex(t => t.videoId === vid);
    if(idx >= 0) playTrack(state._lastResults[idx], state._lastResults);
  }
});

function renderContent(){
  document.querySelectorAll('.card').forEach(el => {
    el.classList.toggle('active', state.playing?.videoId === el.dataset.vid);
  });
  document.querySelectorAll('.song').forEach(el => {
    el.classList.toggle('active', state.playing?.videoId === el.dataset.vid);
    const h = el.querySelector('.song-heart');
    if(h){
      const f = state.favorites.includes(el.dataset.vid);
      h.textContent = f ? '❤' : '♡';
      h.classList.toggle('active', f);
    }
  });
}

/* ═══ FAVORITES & RECENT (Firebase sync) ═══ */
async function toggleFav(vid){
  const i = state.favorites.indexOf(vid);
  if(i >= 0){
    state.favorites.splice(i, 1);
    toast('Removed from Liked');
    if(state.user?.username) await DB.removeFavorite(state.user.username, vid);
  } else {
    state.favorites.push(vid);
    toast('❤ Added to Liked');
    if(state.user?.username) await DB.addFavorite(state.user.username, vid);
  }
  saveUserData();
  if(state.playing){ updatePlayerUI(); updateFullscreenUI(); }
  renderContent();
}

async function saveRecent(t){
  if(isGuest()) return;
  state.recent = [t, ...state.recent.filter(x => x.videoId !== t.videoId)].slice(0, 30);
  saveUserData();
  if(state.user?.username) await DB.addRecent(state.user.username, t);
}

function ukey(k){ return `cmz_${state.user?.username || 'guest'}_${k}`; }

function loadUserData(){
  // Try Firebase user data first
  if(state.user && state.user.favorites !== undefined){
    state.favorites = state.user.favorites || [];
    state.recent = state.user.recent || [];
  } else {
    try { state.favorites = JSON.parse(localStorage.getItem(ukey('favorites')) || '[]'); } catch { state.favorites = []; }
    try { state.recent = JSON.parse(localStorage.getItem(ukey('recent')) || '[]'); } catch { state.recent = []; }
  }
}

function saveUserData(){
  localStorage.setItem(ukey('favorites'), JSON.stringify(state.favorites));
  localStorage.setItem(ukey('recent'), JSON.stringify(state.recent));
}

/* ═══ LYRICS ═══ */
function canAccessLyrics(){ return isPremium() || isAdmin(); }

async function loadLyrics(t){
  const body = $('#lyricsBody');
  if(!body) return;
  body.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  if(!canAccessLyrics()){
    body.innerHTML = `<div class="not-found">
      <div style="font-size:48px;margin-bottom:16px">🔒</div>
      <div style="font-size:15px;color:var(--gold);font-weight:700;margin-bottom:8px">Premium Lyrics</div>
      <div style="color:var(--text-sub);font-size:13px;line-height:1.6">
        Full lyrics are for Premium users only.<br><br>
        <button onclick="openPremium()" style="background:linear-gradient(135deg,#ffd700,#b8860b);color:#000;border:none;padding:10px 24px;border-radius:20px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:8px">
          👑 Upgrade Now
        </button>
      </div>
    </div>`;
    return;
  }

  let title = t.title.replace(/\(official.*?\)/gi, '').replace(/\[.*?\]/g, '').replace(/ft\.?\s.*/gi, '').replace(/feat\.?\s.*/gi, '').replace(/\|.*/g, '').replace(/-\s*topic/gi, '').trim();
  let artist = t.channel.replace(/VEVO/gi, '').replace(/official/gi, '').replace(/-\s*topic/gi, '').trim();

  try {
    const r = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    if(r.ok){
      const d = await r.json();
      if(d.lyrics){ body.innerHTML = d.lyrics.replace(/\n/g, '<br>'); return; }
    }
  } catch(e){}
  body.innerHTML = '<div class="not-found"><div>🎤</div><div>Lyrics not available for this song</div></div>';
}

function toggleLyrics(){
  const p = document.getElementById('lyricsPanel');
  if(p) p.classList.toggle('visible');
}

/* ═══ PREMIUM ═══ */
function openPremium(){
  if(isPremium()){ toast('Already Premium 👑', 'gold'); return; }
  if(!state.user || state.user.isGuest){ toast('Please log in', 'error'); return; }
  const m = document.getElementById('premiumModal');
  if(m) m.classList.add('visible');
}
function closePremium(){
  const m = document.getElementById('premiumModal');
  if(m) m.classList.remove('visible');
}

function showPaymentMethod(method){
  if(method === 'dana'){
    closePremium();
    const dana = localStorage.getItem('cmz_dana') || '08xxxxxxxxxx';
    const el = document.getElementById('danaNumber');
    if(el) el.textContent = dana;
    const m = document.getElementById('paymentModal');
    if(m) m.classList.add('visible');
  } else if(method === 'qris'){
    closePremium();
    const qris = localStorage.getItem('cmz_qris');
    if(qris){
      const img = document.getElementById('qrisImg');
      if(img) img.src = qris;
    }
    const m = document.getElementById('qrisModal');
    if(m) m.classList.add('visible');
  }
}
function closePayment(){
  const m = document.getElementById('paymentModal');
  if(m) m.classList.remove('visible');
}
function closeQRIS(){
  const m = document.getElementById('qrisModal');
  if(m) m.classList.remove('visible');
}

function copyDanaNumber(){
  const num = document.getElementById('danaNumber')?.textContent || '';
  navigator.clipboard.writeText(num).then(() => {
    toast('📋 DANA number copied!');
  }).catch(() => toast('Copy failed', 'error'));
}

function saveDanaNumber(){
  const v = document.getElementById('settingDana')?.value.trim();
  if(!v){ toast('Enter DANA number first', 'error'); return; }
  localStorage.setItem('cmz_dana', v);
  toast('✅ DANA number saved', 'gold');
}

async function requestPremium(){
  if(!state.user || state.user.isGuest){ toast('Please log in', 'error'); return; }
  if(isPremium()){ toast('Already Premium 👑', 'gold'); return; }

  const err = $('#premiumError'), suc = $('#premiumSuccess');
  if(err) err.classList.remove('visible');
  if(suc) suc.classList.remove('visible');

  const pending = await DB.loadPending();
  if(pending.some(p => p.username === state.user.username)){
    if(err){ err.textContent = 'You already have a pending request'; err.classList.add('visible'); }
    toast('Pending request already exists', 'error');
    return;
  }

  const req = {
    id: 'req_' + Date.now(),
    username: state.user.username,
    package: 'Premium 1 Month',
    price: 'Rp 20.000',
    requestedAt: Date.now(),
    status: 'pending'
  };
  await DB.addPending(req);

  const tgMsg = `👑 <b>NEW PREMIUM REQUEST</b>

👤 Username: <code>${state.user.username}</code>
📦 Package: Premium 1 Month
💰 Price: Rp 20.000
🆔 ID: <code>${req.id}</code>
📅 Time: ${new Date().toLocaleString('en-US')}

━━━━━━━━━━━━━━━━━━━━
✅ Login admin → Avatar → Admin Panel → Approve`;

  const sent = await sendTelegram(tgMsg);

  if(sent || !USE_TELEGRAM){
    if(suc){ suc.textContent = '✅ Confirmation sent! Admin will verify.'; suc.classList.add('visible'); }
    toast('Confirmation sent 📨', 'gold');
    setTimeout(() => { closePremium(); closePayment(); closeQRIS(); }, 2500);
  } else {
    if(err){ err.textContent = '❌ Failed to send. Try again.'; err.classList.add('visible'); }
    toast('Failed to send', 'error');
  }
}

function confirmQRISPayment(){ requestPremium(); }

/* ═══ QRIS MANAGEMENT ═══ */
function handleQRISUpload(e){
  const file = e.target.files[0];
  if(!file) return;
  if(file.size > 2 * 1024 * 1024){ toast('File too large (max 2MB)', 'error'); return; }
  const reader = new FileReader();
  reader.onload = function(ev){
    localStorage.setItem('cmz_qris', ev.target.result);
    toast('✅ QRIS uploaded', 'gold');
    renderQRISPreview();
  };
  reader.readAsDataURL(file);
}
function removeQRIS(){
  if(!confirm('Remove QRIS?')) return;
  localStorage.removeItem('cmz_qris');
  toast('QRIS removed');
  renderQRISPreview();
}
function renderQRISPreview(){
  const qris = localStorage.getItem('cmz_qris');
  const el = document.getElementById('qrisPreview');
  const btn = document.getElementById('qrisRemoveBtn');
  if(!el) return;
  if(qris){
    el.innerHTML = `<div style="background:#fff;padding:12px;border-radius:12px;display:inline-block">
      <img src="${qris}" style="max-width:240px;max-height:240px;display:block">
    </div><p style="color:var(--sub);font-size:12px;margin-top:12px">QRIS active ✅</p>`;
    if(btn) btn.style.display = 'inline-block';
  } else {
    el.innerHTML = '<p style="color:var(--sub);font-size:13px">No QRIS yet</p>';
    if(btn) btn.style.display = 'none';
  }
}

/* ═══ LOGO MANAGEMENT ═══ */
function handleLogoUpload(e){
  const file = e.target.files[0];
  if(!file) return;
  if(file.size > 1 * 1024 * 1024){ toast('File too large (max 1MB)', 'error'); return; }
  const reader = new FileReader();
  reader.onload = function(ev){
    localStorage.setItem('cmz_logo', ev.target.result);
    toast('✅ Custom logo uploaded', 'gold');
    applyLogo();
    renderLogoPreview();
  };
  reader.readAsDataURL(file);
}

function removeLogo(){
  if(!localStorage.getItem('cmz_logo')){ toast('No custom logo to remove', 'error'); return; }
  if(!confirm('Remove custom logo? Akan kembali ke logo.jpg default')) return;
  localStorage.removeItem('cmz_logo');
  toast('Reset to logo.jpg');
  applyLogo();
  renderLogoPreview();
}

function applyLogo(){
  const uploadedLogo = localStorage.getItem('cmz_logo');
  const logo = uploadedLogo || CONFIG.DEFAULT_LOGO;
  
  const img = document.getElementById('nowCoverLogo');
  const emoji = document.getElementById('nowCoverEmoji');
  const cover = document.getElementById('nowCover');
  const sbImg = document.getElementById('sbLogoImg');
  const sbLogo = document.getElementById('sbLogoBox');
  const sbText = document.getElementById('sbLogoText');

  if(logo){
    if(img){
      img.src = logo;
      img.style.display = 'block';
      img.onerror = () => {
        img.style.display = 'none';
        if(emoji) emoji.style.display = 'flex';
        if(cover) cover.classList.remove('has-logo');
        if(sbImg) sbImg.style.display = 'none';
        if(sbText) sbText.style.display = 'block';
        if(sbLogo) sbLogo.classList.remove('has-logo');
      };
    }
    if(emoji) emoji.style.display = 'none';
    if(cover) cover.classList.add('has-logo');
    if(sbImg){ sbImg.src = logo; sbImg.style.display = 'block'; sbImg.onerror = logoError; }
    if(sbText) sbText.style.display = 'none';
    if(sbLogo) sbLogo.classList.add('has-logo');
  }
}

function renderLogoPreview(){
  const uploadedLogo = localStorage.getItem('cmz_logo');
  const logo = uploadedLogo || CONFIG.DEFAULT_LOGO;
  const el = document.getElementById('logoPreview');
  const btn = document.getElementById('logoRemoveBtn');
  if(!el) return;
  
  el.innerHTML = `<div style="background:#1a1a1a;padding:12px;border-radius:12px;display:inline-block;border:1px solid var(--green)">
    <img src="${logo}" style="max-width:120px;max-height:120px;display:block;border-radius:8px">
  </div>
  <p style="color:var(--sub);font-size:12px;margin-top:12px">
    ${uploadedLogo ? '✅ Custom logo active' : '📁 Using default <code style="color:var(--green)">logo.jpg</code>'}
  </p>`;
  
  if(btn) btn.style.display = uploadedLogo ? 'inline-block' : 'none';
}

/* ═══ AUTH (Firebase) ═══ */
function hash(p){ return btoa(p + '_cmz'); }

function switchAuthTab(t){
  $$('.auth-tab').forEach(x => x.classList.toggle('active', x.dataset.tab === t));
  const lf = document.getElementById('loginForm');
  const rf = document.getElementById('registerForm');
  if(lf) lf.style.display = t === 'login' ? 'block' : 'none';
  if(rf) rf.style.display = t === 'register' ? 'block' : 'none';
}

async function handleRegister(){
  const un = $('#regUser').value.trim();
  const pw = $('#regPass').value;
  const pw2 = $('#regPass2').value;
  $('#authError2').classList.remove('visible');
  if(!un || un.length < 3) return showErr('Username min. 3', 'authError2');
  if(!/^[a-zA-Z0-9_]+$/.test(un)) return showErr('Username only letters/numbers/_', 'authError2');
  if(un.toLowerCase() === CONFIG.ADMIN_USER) return showErr('Username not available', 'authError2');
  if(pw.length < 4) return showErr('Password min. 4', 'authError2');
  if(pw !== pw2) return showErr('Confirm password does not match', 'authError2');
  
  const existing = await DB.getUser(un);
  if(existing) return showErr('Username already taken', 'authError2');

  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Signing up...';

  const u = {
    username: un,
    password: hash(pw),
    isPremium: false,
    isAdmin: false,
    createdAt: Date.now(),
    premiumSince: null,
    favorites: [],
    recent: [],
    loginHistory: [{
      at: Date.now(),
      device: navigator.userAgent.substring(0, 80)
    }]
  };
  
  await DB.addUser(u);
  await sendTelegram(`🎉 <b>NEW USER SIGNUP</b>\n\n👤 Username: <code>${un}</code>\n📅 ${new Date().toLocaleString('en-US')}\n👥 Total: ${DB.cache.users.length}`);
  
  setSession(u);
  toast(`Welcome, ${un}! 🎉`);
  closeAuth();
  refreshAll();
}

async function handleLogin(){
  const un = $('#loginUser').value.trim();
  const pw = $('#loginPass').value;
  $('#authError').classList.remove('visible');
  if(!un || !pw) return showErr('Enter username & password');

  if(un === CONFIG.ADMIN_USER && pw === CONFIG.ADMIN_PASS){
    setSession({ username: CONFIG.ADMIN_USER, isAdmin: true, isPremium: true });
    toast('Logged in as Admin 👑', 'gold');
    closeAuth(); refreshAll(); return;
  }

  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Logging in...';

  const u = await DB.getUser(un);
  if(!u){ btn.disabled = false; btn.textContent = 'Log In'; return showErr('Username not found'); }
  if(u.password !== hash(pw)){ btn.disabled = false; btn.textContent = 'Log In'; return showErr('Wrong password'); }

  setSession(u);
  DB.addLoginHistory(u.username);
  toast(`Welcome back, ${u.username}! 🎵`);
  closeAuth(); refreshAll();
}

function setSession(u){
  state.user = u;
  if(u && u.username !== 'guest') localStorage.setItem('cmz_session', JSON.stringify({ username: u.username }));
  else localStorage.removeItem('cmz_session');
  loadUserData();
}

async function loadSession(){
  const s = localStorage.getItem('cmz_session');
  if(!s) return null;
  const { username } = JSON.parse(s);
  if(username === CONFIG.ADMIN_USER) return { username: CONFIG.ADMIN_USER, isAdmin: true, isPremium: true };
  return await DB.getUser(username);
}

function logout(){
  state.user = null;
  localStorage.removeItem('cmz_session');
  toast('Logged out');
  refreshAll();
}

function continueAsGuest(){
  state.user = { username: 'guest', isGuest: true, isPremium: false, isAdmin: false };
  loadUserData();
  closeAuth();
  refreshAll();
  toast('Guest mode');
}

function showErr(m, target){
  target = target || 'authError';
  const e = $('#' + target);
  if(e){ e.textContent = m; e.classList.add('visible'); }
}

function openAuth(){
  const m = document.getElementById('authModal');
  if(m) m.classList.add('visible');
}
function closeAuth(){
  const m = document.getElementById('authModal');
  if(m) m.classList.remove('visible');
}

/* ═══ ADMIN ═══ */
async function openAdmin(){
  if(!isAdmin()){ toast('Access denied', 'error'); return; }
  const m = document.getElementById('adminModal');
  if(m) m.classList.add('visible');
  
  // Loading state
  $('#adminPending').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  $('#adminUsers').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  await DB.loadUsers();
  await DB.loadPending();
  
  renderAdminPending();
  renderAdminUsers();
  renderAdminStats();
  renderQRISPreview();
  renderLogoPreview();
  
  const dana = localStorage.getItem('cmz_dana') || '';
  const el = document.getElementById('settingDana');
  if(el) el.value = dana;
}
function closeAdmin(){
  const m = document.getElementById('adminModal');
  if(m) m.classList.remove('visible');
}
function switchAdminTab(t){
  $$('.admin-tab').forEach(x => x.classList.toggle('active', x.dataset.atab === t));
  ['pending','users','stats','settings'].forEach(name => {
    const el = document.getElementById('admin' + name.charAt(0).toUpperCase() + name.slice(1));
    if(el) el.style.display = (name === t) ? 'block' : 'none';
  });
  if(t === 'settings'){ renderQRISPreview(); renderLogoPreview(); }
}

function renderAdminPending(){
  const list = DB.getPending();
  const el = document.getElementById('adminPending');
  if(!el) return;
  if(!list.length){
    el.innerHTML = '<div class="empty"><div class="empty-icon">📭</div><div class="empty-title">No requests</div></div>';
    return;
  }
  el.innerHTML = list.map(p => `
    <div class="pending-card">
      <div class="p-header"><div class="p-user">👤 ${p.username}</div><span class="badge pending">PENDING</span></div>
      <div class="p-info">📦 ${p.package} — 💰 ${p.price}<br>📅 ${new Date(p.requestedAt).toLocaleString('en-US')}</div>
      <div class="p-actions">
        <button class="act-btn success" data-approve="${p.id}">✓ Approve</button>
        <button class="act-btn danger" data-reject="${p.id}">✕ Reject</button>
      </div>
    </div>
  `).join('');
}

document.getElementById('adminPending').addEventListener('click', e => {
  const ap = e.target.closest('[data-approve]');
  if(ap){ approvePremium(ap.dataset.approve); return; }
  const rj = e.target.closest('[data-reject]');
  if(rj){ rejectPremium(rj.dataset.reject); }
});

async function approvePremium(id){
  const req = DB.getPending().find(p => p.id === id);
  if(!req) return;
  if(!confirm(`Approve premium for "${req.username}"?`)) return;
  await DB.updateUser(req.username, { isPremium: true, premiumSince: Date.now() });
  await DB.removePending(id);
  toast(`${req.username} → Premium 👑`, 'gold');
  await sendTelegram(`✅ <b>Premium Approved</b>\n\n👤 <code>${req.username}</code>`);
  renderAdminPending(); renderAdminUsers(); renderAdminStats();
}

async function rejectPremium(id){
  const req = DB.getPending().find(p => p.id === id);
  if(!req) return;
  if(!confirm(`Reject request from "${req.username}"?`)) return;
  await DB.removePending(id);
  toast('Rejected');
  await sendTelegram(`❌ <b>Premium Rejected</b>\n\n👤 <code>${req.username}</code>`);
  renderAdminPending();
}

function renderAdminUsers(){
  const users = DB.getUsers().filter(u => !u.isAdmin);
  const el = document.getElementById('adminUsers');
  if(!el) return;
  if(!users.length){
    el.innerHTML = '<div class="empty"><div class="empty-title">No users yet</div></div>';
    return;
  }
  el.innerHTML = `<table class="user-table">
    <thead><tr><th>User</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
    <tbody>${users.map(u => `
      <tr>
        <td><div class="u-name"><div class="u-avatar ${u.isPremium ? 'premium' : ''}">${u.username[0]}</div>${u.username}</div></td>
        <td>${u.isPremium ? '<span class="badge premium">👑 Premium</span>' : '<span class="badge free">Free</span>'}</td>
        <td style="text-align:right">
          ${u.isPremium
            ? `<button class="act-btn danger" data-demote="${u.username}">Demote</button>`
            : `<button class="act-btn gold" data-promote="${u.username}">👑 Promote</button>`}
          <button class="act-btn danger" data-delete="${u.username}">🗑</button>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

document.getElementById('adminUsers').addEventListener('click', e => {
  const p = e.target.closest('[data-promote]');
  if(p){ adminTogglePrem(p.dataset.promote, true); return; }
  const d = e.target.closest('[data-demote]');
  if(d){ adminTogglePrem(d.dataset.demote, false); return; }
  const x = e.target.closest('[data-delete]');
  if(x){ adminDelete(x.dataset.delete); }
});

function renderAdminStats(){
  const users = DB.getUsers();
  const prem = users.filter(u => u.isPremium).length;
  const pend = DB.getPending().length;
  const el = document.getElementById('adminStats');
  if(!el) return;
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px">
      <div style="background:rgba(255,255,255,.03);border-radius:10px;padding:16px;text-align:center;border:1px solid rgba(0,255,65,.15)">
        <div style="font-size:1.8rem;font-weight:800;color:var(--green)">${users.length}</div>
        <div style="font-size:10px;color:var(--text-sub);text-transform:uppercase">Total Users</div>
      </div>
      <div style="background:rgba(255,255,255,.03);border-radius:10px;padding:16px;text-align:center;border:1px solid rgba(0,255,65,.15)">
        <div style="font-size:1.8rem;font-weight:800;color:var(--green)">${prem}</div>
        <div style="font-size:10px;color:var(--text-sub);text-transform:uppercase">Premium</div>
      </div>
      <div style="background:rgba(255,255,255,.03);border-radius:10px;padding:16px;text-align:center;border:1px solid rgba(255,255,255,.06)">
        <div style="font-size:1.8rem;font-weight:800;color:#fff">${users.length - prem}</div>
        <div style="font-size:10px;color:var(--text-sub);text-transform:uppercase">Free</div>
      </div>
      <div style="background:rgba(255,165,0,.08);border-radius:10px;padding:16px;text-align:center;border:1px solid rgba(255,165,0,.3)">
        <div style="font-size:1.8rem;font-weight:800;color:orange">${pend}</div>
        <div style="font-size:10px;color:var(--text-sub);text-transform:uppercase">Pending</div>
      </div>
    </div>`;
}

async function adminTogglePrem(un, make){
  if(!confirm(`${make ? 'Enable' : 'Disable'} Premium for "${un}"?`)) return;
  await DB.updateUser(un, { isPremium: make, premiumSince: make ? Date.now() : null });
  toast(`${un} → ${make ? 'Premium 👑' : 'Free'}`, make ? 'gold' : '');
  renderAdminUsers(); renderAdminStats();
  if(state.user?.username === un){ state.user = await DB.getUser(un); refreshAll(); }
}

async function adminDelete(un){
  if(!confirm(`Delete user "${un}"?`)) return;
  await DB.deleteUser(un);
  toast('User deleted');
  renderAdminUsers(); renderAdminStats(); renderAdminPending();
}

/* ═══ RENDER ═══ */
function refreshAll(){
  renderTopRight();
  renderSidebar();
  render();
}

function renderTopRight(){
  const el = $('#topRight');
  if(!el) return;
  if(!state.user || state.user.isGuest){
    el.innerHTML = `<button class="login-btn" onclick="openAuth()">Log In</button>`;
    return;
  }
  const u = state.user;
  const cls = u.isAdmin ? 'admin' : (u.isPremium ? 'premium' : '');
  el.innerHTML = `
    ${!u.isPremium && !u.isAdmin ? `<button class="upgrade-btn" onclick="openPremium()">👑 Premium</button>` : ''}
    <div class="user-badge ${cls}" id="userBtn">${u.username[0]}</div>
  `;
  $('#userBtn').addEventListener('click', e => { e.stopPropagation(); showProfileMenu(); });
}

function showProfileMenu(){
  const old = $('#pm');
  if(old){ old.remove(); return; }
  const u = state.user;
  const badge = u.isAdmin ? '<span class="ubadge admin">🛡 Admin</span>'
    : u.isPremium ? '<span class="ubadge premium">👑 Premium</span>'
    : '<span class="ubadge free">Free</span>';
  const m = document.createElement('div');
  m.className = 'profile-menu'; m.id = 'pm';
  m.innerHTML = `
    <div class="pm-head"><div class="uname">${u.username}</div>${badge}</div>
    ${u.isAdmin ? `<div class="pm-item gold" onclick="openAdmin()"><i>🛡</i> Admin Panel</div>` : ''}
    ${!u.isPremium && !u.isAdmin ? `<div class="pm-item gold" onclick="openPremium()"><i>👑</i> Upgrade Premium</div>` : ''}
    <div class="pm-item danger" onclick="logout()"><i>🚪</i> Log Out</div>
  `;
  const topRight = document.querySelector('.top-right');
  if(topRight) topRight.appendChild(m);
  setTimeout(() => {
    const h = e => {
      if(!e.target.closest('#pm') && !e.target.closest('#userBtn')){
        const el = $('#pm'); if(el) el.remove();
        document.removeEventListener('click', h);
      }
    };
    document.addEventListener('click', h);
  }, 50);
}

function renderSidebar(){
  const el = $('#sbPlaylists');
  if(!el) return;
  el.innerHTML = `
    <div class="pl-card" data-nav="liked">
      <div class="pl-cover" style="background:linear-gradient(135deg,#450af5,#8e8ee5)">❤</div>
      <div class="pl-info"><div class="pl-name">Liked Songs</div><div class="pl-sub">${state.favorites.length} songs</div></div>
    </div>
    <div class="pl-card" data-nav="recent">
      <div class="pl-cover" style="background:linear-gradient(135deg,#1e3a8a,#3b82f6)">🕐</div>
      <div class="pl-info"><div class="pl-name">Recently Played</div><div class="pl-sub">${state.recent.length} songs</div></div>
    </div>
  `;
}

document.getElementById('sbPlaylists').addEventListener('click', e => {
  const c = e.target.closest('.pl-card');
  if(c) navigate({ type: c.dataset.nav });
});

function navigate(v){
  state.view = v;
  if(v.type === 'home') renderHome();
  else if(v.type === 'search') renderSearch();
  else if(v.type === 'liked') renderLiked();
  else if(v.type === 'recent') renderRecent();
  renderSidebar();
}

function render(){
  const v = state.view;
  if(v.type === 'home') renderHome();
  else if(v.type === 'search') renderSearch();
  else if(v.type === 'liked') renderLiked();
  else if(v.type === 'recent') renderRecent();
}

async function renderHome(){
  const c = $('#content');
  if(!c) return;
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const name = state.user && !state.user.isGuest ? `, <span class="accent">${state.user.username}</span>` : '';

  const quickHTML = QUICK_TAGS.map(t => `
    <div class="quick-item" data-q="${t.q}">
      <div class="quick-icon" style="background:${t.color}">${t.icon}</div>
      <div class="quick-label">${t.label}</div>
    </div>
  `).join('');

  c.innerHTML = `
    <div class="greet">${greet}${name} 👋<div class="greet-sub">Search & play music — just like Spotify</div></div>
    <div class="quick-grid">${quickHTML}</div>
    <div id="homeContent">
      ${HOME_SECTIONS.slice(0, 4).map(skeletonRow).join('')}
    </div>
  `;

  if(state._homeLoading) return;
  state._homeLoading = true;
  try {
    const promises = HOME_SECTIONS.map(s => ytSearch(s.q).catch(() => []));
    const results = await Promise.all(promises);
    results.forEach(tracks => tracks.forEach(t => state._homeTracks[t.videoId] = t));
    const homeEl = document.getElementById('homeContent');
    if(homeEl){
      homeEl.innerHTML = HOME_SECTIONS.map((s, i) => {
        if(!results[i] || !results[i].length) return '';
        return rowHTML(s.title, results[i]);
      }).join('');
    }
  } catch(e){ console.error('Home fetch error:', e); }
  finally { state._homeLoading = false; }
}

function renderSearch(){
  const c = $('#content');
  if(!c) return;
  const quickHTML = QUICK_TAGS.map(t => `
    <div class="quick-item" data-q="${t.q}">
      <div class="quick-icon" style="background:${t.color}">${t.icon}</div>
      <div class="quick-label">${t.label}</div>
    </div>
  `).join('');
  c.innerHTML = `
    <div class="section-title" style="margin-top:20px">🔍 Search Music</div>
    <div class="quick-grid">${quickHTML}</div>
    <div class="section-title">Popular</div>
    <div class="tags">
      ${['sad songs','pop indonesia','dangdut koplo','rock indonesia','kpop hits','top hits english','reggae chill','90s songs'].map(t => `<div class="tag" data-q="${t}">${t}</div>`).join('')}
    </div>
  `;
}

function renderLiked(){
  const c = $('#content');
  if(!c) return;
  if(isGuest()){
    c.innerHTML = '<div class="section-title">❤ Liked Songs</div><div class="empty"><div class="empty-icon">🔒</div><div class="empty-title">Please log in</div><button class="btn-primary" style="max-width:200px;margin:20px auto 0" onclick="openAuth()">Log In</button></div>';
    return;
  }
  const list = state.favorites.map(vid => state._homeTracks[vid] || state.recent.find(r => r.videoId === vid) || state._lastResults?.find(r => r.videoId === vid)).filter(Boolean);
  if(!list.length){
    c.innerHTML = '<div class="section-title">❤ Liked Songs</div><div class="empty"><div class="empty-icon">❤</div><div class="empty-title">No favorites yet</div></div>';
    return;
  }
  state._lastResults = list;
  c.innerHTML = `<div class="section-title">❤ Liked Songs (${list.length})</div>${list.map(songHTML).join('')}`;
}

function renderRecent(){
  const c = $('#content');
  if(!c) return;
  if(isGuest()){
    c.innerHTML = '<div class="section-title">🕐 Recent</div><div class="empty"><div class="empty-icon">🔒</div><div class="empty-title">Please log in</div></div>';
    return;
  }
  if(!state.recent.length){
    c.innerHTML = '<div class="section-title">🕐 Recent</div><div class="empty"><div class="empty-icon">🕐</div><div class="empty-title">No history yet</div></div>';
    return;
  }
  state._lastResults = state.recent;
  c.innerHTML = `<div class="section-title">🕐 Recently Played (${state.recent.length})</div>${state.recent.map(songHTML).join('')}`;
}

/* ═══ EVENT LISTENERS ═══ */
document.getElementById('playBtn').addEventListener('click', togglePlay);
document.getElementById('nextBtn').addEventListener('click', nextTrack);
document.getElementById('prevBtn').addEventListener('click', prevTrack);
document.getElementById('shuffleBtn').addEventListener('click', toggleShuffle);
document.getElementById('repeatBtn').addEventListener('click', cycleRepeat);
document.getElementById('nowHeart').addEventListener('click', toggleFavCurrent);
document.getElementById('lyricsBtn').addEventListener('click', toggleLyrics);
document.getElementById('lyricsClose').addEventListener('click', toggleLyrics);
document.getElementById('volBtn').addEventListener('click', toggleMute);

const clickArea = document.getElementById('miniPlayerClickArea');
if(clickArea) clickArea.addEventListener('click', openNowPlaying);

document.getElementById('npPlay').addEventListener('click', togglePlay);
document.getElementById('npNext').addEventListener('click', nextTrack);
document.getElementById('npPrev').addEventListener('click', prevTrack);
document.getElementById('npShuffle').addEventListener('click', toggleShuffle);
document.getElementById('npRepeat').addEventListener('click', cycleRepeat);
document.getElementById('npLike').addEventListener('click', toggleFavCurrent);
document.getElementById('npLyricsBtn').addEventListener('click', () => {
  closeNowPlaying();
  setTimeout(toggleLyrics, 100);
});
document.getElementById('npShareBtn').addEventListener('click', () => {
  if(!state.playing) return;
  const txt = `🎵 Listening to "${state.playing.title}" by ${state.playing.channel} on CMzMusify`;
  if(navigator.share){
    navigator.share({ title: state.playing.title, text: txt }).catch(()=>{});
  } else {
    navigator.clipboard.writeText(txt).then(()=> toast('📋 Copied to clipboard')).catch(()=>{});
  }
});

const sbmEl = document.querySelector('.seek-bar-mini');
if(sbmEl){
  sbmEl.addEventListener('click', e => {
    if(!ytReady || !ytPlayer.getDuration) return;
    const r = e.currentTarget.getBoundingClientRect();
    const p = (e.clientX - r.left) / r.width;
    ytPlayer.seekTo(p * ytPlayer.getDuration(), true);
  });
}

const stNP = document.getElementById('npTrack');
if(stNP){
  stNP.addEventListener('click', e => {
    if(!ytReady || !ytPlayer.getDuration) return;
    const r = e.currentTarget.getBoundingClientRect();
    const p = (e.clientX - r.left) / r.width;
    ytPlayer.seekTo(p * ytPlayer.getDuration(), true);
  });
}

function setVolume(v){
  state.volume = Math.max(0, Math.min(1, v));
  if(ytReady && ytPlayer.setVolume) ytPlayer.setVolume(state.muted ? 0 : state.volume * 100);
  const vf = $('#volFill');
  if(vf) vf.style.width = (state.volume * 100) + '%';
  const vb = $('#volBtn');
  if(vb) vb.textContent = state.muted || state.volume === 0 ? '🔇' : state.volume < 0.5 ? '🔉' : '🔊';
}
function toggleMute(){ state.muted = !state.muted; setVolume(state.volume); }

const vt = document.getElementById('volTrack');
if(vt){
  vt.addEventListener('click', e => {
    const r = e.currentTarget.getBoundingClientRect();
    setVolume((e.clientX - r.left) / r.width);
  });
}

document.getElementById('topSearch').addEventListener('keydown', e => {
  if(e.key === 'Enter') doSearch(e.target.value);
});
document.getElementById('topSearch').addEventListener('input', e => {
  clearTimeout(state.searchTimer);
  const q = e.target.value.trim();
  if(q.length < 3) return;
  state.searchTimer = setTimeout(() => doSearch(q), 800);
});

$$('.sb-nav-item').forEach(el => el.addEventListener('click', () => {
  $$('.sb-nav-item').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  const nav = el.dataset.nav;
  if(nav === 'home'){ state.view = { type: 'home' }; renderHome(); }
  else if(nav === 'search'){ state.view = { type: 'search' }; renderSearch(); }
}));

$$('.mn-item').forEach(el => el.addEventListener('click', () => {
  $$('.mn-item').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  const nav = el.dataset.nav;
  if(nav === 'home'){ state.view = { type: 'home' }; renderHome(); }
  else if(nav === 'search'){ state.view = { type: 'search' }; renderSearch(); }
  else if(nav === 'liked'){ state.view = { type: 'liked' }; renderLiked(); }
  else if(nav === 'recent'){ state.view = { type: 'recent' }; renderRecent(); }
}));

$$('.modal').forEach(m => m.addEventListener('click', e => { if(e.target === m) m.classList.remove('visible'); }));

function toast(msg, type){
  const el = $('#toast');
  if(!el) return;
  el.textContent = msg;
  el.className = 'toast visible' + (type ? ' ' + type : '');
  clearTimeout(el._tid);
  el._tid = setTimeout(() => el.classList.remove('visible'), 2500);
}

/* ═══ INIT ═══ */
async function init(){
  // Init Firebase dulu
  await initFirebase();
  
  // Load users kalau admin
  const s = await loadSession();
  if(s){ state.user = s; loadUserData(); }
  
  refreshAll();
  setVolume(state.volume);
  renderHome();
  applyLogo();
  
  if(!state.user) setTimeout(() => openAuth(), 600);
  
  // Register Service Worker
  if('serviceWorker' in navigator){
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered');
    } catch(e){
      console.warn('⚠️ SW failed:', e.message);
    }
  }
  
  console.log('%c🎵 CMzMusify — TZO PROJECT', 'color:#00ff41;font-size:18px;font-weight:900');
  console.log('%c🔥 Firebase: ' + (FB_READY ? 'CONNECTED' : 'OFFLINE'), FB_READY ? 'color:#00d93a;font-size:12px' : 'color:#ff4b4b;font-size:12px');
  console.log('%cAdmin: ceomudaz / 2121', 'color:#ffd700;font-size:11px');
}

init();
