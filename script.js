const GITHUB={owner:'GANTI_USERNAME',repo:'cmzmusify-db',token:'GANTI_TOKEN_ghp_',branch:'main'};
const API_SPOTIFY='https://api.nexadev.my.id/api/spotifyplay';
const PAKET={minggu:{label:'1 Minggu',days:7,price:'Rp 5.000',priceNum:5000},bulan:{label:'1 Bulan',days:30,price:'Rp 15.000',priceNum:15000},tahun:{label:'1 Tahun',days:365,price:'Rp 100.000',priceNum:100000}};
let selectedPaket='bulan';
let currentUser=JSON.parse(localStorage.getItem('cmz_user')||'null');
let currentSong=null;
let cache={users:{sha:null,data:{}},ads:{sha:null,data:[]},config:{sha:null,data:{adsEnabled:true,qrisUrl:'',pending:[],telegram:{}}}};
const audio=document.getElementById('audio');

async function ghGet(file){
  try{
    const r=await fetch(`https://api.github.com/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${file}?ref=${GITHUB.branch}`,{headers:{Authorization:`token ${GITHUB.token}`,Accept:'application/vnd.github.v3+json'}});
    const j=await r.json(); return {data:JSON.parse(atob(j.content)),sha:j.sha};
  }catch{
    const local=localStorage.getItem('gh_'+file);
    if(local) return {data:JSON.parse(local),sha:null};
    if(file==='ads.json') return {data:[],sha:null};
    if(file==='users.json') return {data:{},sha:null};
    return {data:{adsEnabled:true,qrisUrl:'',pending:[],telegram:{}},sha:null};
  }
}
async function ghSave(file,content,sha,msg){
  localStorage.setItem('gh_'+file,JSON.stringify(content));
  if(GITHUB.token.startsWith('GANTI')){toast('Isi token GitHub dulu');return {ok:false};}
  const body={message:msg,content:btoa(unescape(encodeURIComponent(JSON.stringify(content,null,2)))),branch:GITHUB.branch,...(sha?{sha}:{})};
  const r=await fetch(`https://api.github.com/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${file}`,{method:'PUT',headers:{Authorization:`token ${GITHUB.token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json(); return j.content?{ok:true,sha:j.content.sha}:{ok:false};
}
async function loadAll(){
  const u=await ghGet('users.json');const a=await ghGet('ads.json');const c=await ghGet('config.json');
  cache.users={sha:u.sha,data:u.data};cache.ads={sha:a.sha,data:a.data};cache.config={sha:c.sha,data:c.data};
  updateQrisUI();return cache;
}
function updateQrisUI(){
  const cfg=cache.config.data;
  const q=document.getElementById('qrisImg'), qp=document.getElementById('qrisPlaceholder');
  const d=document.getElementById('danaImg'), dp=document.getElementById('danaPlaceholder');
  if(cfg.qrisUrl && q){q.src=cfg.qrisUrl;q.style.display='block';if(qp)qp.style.display='none';}
  const url2=cfg.qrisUrl2||cfg.danaUrl;
  if(url2 && d){d.src=url2;d.style.display='block';if(dp)dp.style.display='none';}
  const dn=document.getElementById('danaNumber'); if(dn && cfg.danaNumber) dn.textContent='DANA: '+cfg.danaNumber;
  const a=document.getElementById('cfgQrisUrl'); if(a) a.value=cfg.qrisUrl||'';
  const b=document.getElementById('cfgDanaUrl'); if(b) b.value=url2||'';
  const c=document.getElementById('cfgDanaNum'); if(c) c.value=cfg.danaNumber||'';
  const w=document.getElementById('cfgWaNum'); if(w) w.value=cfg.waNumber||'';
  const t1=document.getElementById('cfgTgToken'); if(t1) t1.value=cfg.telegram?.token||'';
  const t2=document.getElementById('cfgTgChat'); if(t2) t2.value=cfg.telegram?.devChatId||'';
  const t3=document.getElementById('cfgTgUser'); if(t3) t3.value=cfg.telegram?.botUsername||'';
}
async function sendTelegram(text){
  const tg=cache.config.data.telegram; if(!tg?.token||!tg?.devChatId) return;
  try{await fetch(`https://api.telegram.org/bot${tg.token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:tg.devChatId,text,parse_mode:'HTML'})});}catch{}
}
window.selectPaket=(id)=>{selectedPaket=id;document.querySelectorAll('.paket-card').forEach(c=>c.classList.remove('active'));document.getElementById('paket'+id.charAt(0).toUpperCase()+id.slice(1)).classList.add('active');document.querySelectorAll('.paket-check').forEach(c=>c.textContent='○');document.getElementById('paket'+id.charAt(0).toUpperCase()+id.slice(1)).querySelector('.paket-check').textContent='●';document.getElementById('paketSelect').value=id;};
window.doLogin=async()=>{const u=document.getElementById('loginUser').value.trim().toLowerCase();const p=document.getElementById('loginPass').value;await loadAll();const user=cache.users.data[u];if(!user) return toast('User tidak ada');if(btoa(p)!==user.password) return toast('Password salah');currentUser=user;localStorage.setItem('cmz_user',JSON.stringify(user));closeM('authModal');render();toast('Login '+u);};
window.doRegister=async()=>{const u=document.getElementById('regUser').value.trim().toLowerCase();const p=document.getElementById('regPass').value;const p2=document.getElementById('regPass2').value;if(p!==p2) return toast('Password beda');await loadAll();if(cache.users.data[u]) return toast('Username dipakai');const payload={username:u,password:btoa(p),role:u==='tzo'?'developer':'user',premium:false,created:Date.now()};const newUsers={...cache.users.data,[u]:payload};await ghSave('users.json',newUsers,cache.users.sha,`register ${u}`);toast('Daftar sukses');switchTab('login');};
window.doGuest=()=>{currentUser={username:'guest',role:'user',premium:false};localStorage.setItem('cmz_user',JSON.stringify(currentUser));closeM('authModal');render();};
window.logout=()=>{localStorage.removeItem('cmz_user');location.reload();};
window.spotifySearch=async(q)=>{if(!q) q=document.getElementById('searchInput').value.trim();if(!q) return toast('Ketik lagu');document.getElementById('content').innerHTML=`<div style="text-align:center;padding:30px">⏳ Mencari ${q}...</div>`;try{const res=await fetch(`${API_SPOTIFY}?q=${encodeURIComponent(q)}`).then(r=>r.json());const r=res.result;currentSong=r;document.getElementById('content').innerHTML=`<div class="spotify-card" style="background:var(--bg2);border:1px solid var(--border);border-radius:20px;overflow:hidden"><img src="${r.thumbnail}" style="width:100%"><div style="padding:16px"><h2 style="font-size:18px;font-weight:900">${r.title}</h2><p>${r.artist}</p><button class="btn" onclick="playSpotify()">▶ PLAY BG PLAY</button><audio controls style="width:100%;margin-top:10px" src="${r.download_url}"></audio></div></div>`;playSpotify();}catch{document.getElementById('content').innerHTML='❌ Tidak ditemukan';}};
window.playSpotify=()=>{if(!currentSong) return;audio.src=currentSong.download_url;audio.play();document.getElementById('pTitle').textContent=currentSong.title;document.getElementById('pArtist').textContent=currentSong.artist;document.getElementById('pCover').innerHTML=`<img src="${currentSong.thumbnail}">`;if('mediaSession' in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:currentSong.title,artist:currentSong.artist,artwork:[{src:currentSong.thumbnail,sizes:'512x512',type:'image/jpeg'}]});}};
window.buyPremium=async()=>{
  if(!currentUser||currentUser.username==='guest') return toast('Login dulu');
  const username=currentUser.username;
  const name=document.getElementById('proofName').value.trim()||username;
  const paketId=document.getElementById('paketSelect').value||selectedPaket;
  const paket=PAKET[paketId];
  const file=document.getElementById('proofFile')?.files[0];
  if(!file) return toast('Upload bukti TF dulu');
  const btn=document.getElementById('btnKirimBukti'); btn.textContent='⏳ Mengirim...'; btn.disabled=true;
  await loadAll(); const cfg=cache.config.data; const tg=cfg.telegram;
  if(!tg?.token){toast('Telegram belum di set'); btn.disabled=false; return;}
  try{
    const pending=cfg.pending||[]; const newPending=[...pending,{username,name,paket:paketId,days:paket.days,price:paket.price,time:Date.now()}];
    await ghSave('config.json',{...cfg,pending:newPending},cache.config.sha,`order ${paketId} ${username}`);
    const form=new FormData();
    form.append('chat_id',tg.devChatId);
    form.append('photo',file);
    form.append('caption',`🔔 ORDER PREMIUM — ${paket.label.toUpperCase()}\n\n👤 User: ${username}\n📝 Nama: ${name}\n📦 Paket: ${paket.label} (${paket.days} hari)\n💰 ${paket.price}\n⏰ ${new Date().toLocaleString('id-ID')}\n\n✅ /approve ${username} ${paketId}\n❌ /reject ${username}`);
    form.append('parse_mode','HTML');
    const res=await fetch(`https://api.telegram.org/bot${tg.token}/sendPhoto`,{method:'POST',body:form}).then(r=>r.json());
    if(res.ok){document.getElementById('premiumStatus').innerHTML=`✅ Bukti ${paket.label} terkirim!`; toast(`✅ ${paket.label} terkirim`); closeM('premiumModal');}
    else throw new Error(res.description);
  }catch(e){toast('Gagal: '+e.message);}
  btn.textContent='📤 KIRIM BUKTI KE TELEGRAM DEV'; btn.disabled=false;
};
window.openWA=()=>{const cfg=cache.config.data; const wa=cfg.waNumber||'6281234567890'; const paket=PAKET[document.getElementById('paketSelect')?.value||selectedPaket]; const user=currentUser?.username||'guest'; window.open(`https://wa.me/${wa}?text=${encodeURIComponent(`Halo dev, saya ${user} sudah TF ${paket.label} ${paket.price} dan upload bukti. Username: ${user}. Mohon approve`)}`,'_blank');};
window.saveQris=async()=>{await loadAll();const newCfg={...cache.config.data,qrisUrl:document.getElementById('cfgQrisUrl').value,qrisUrl2:document.getElementById('cfgDanaUrl').value,danaNumber:document.getElementById('cfgDanaNum').value,waNumber:document.getElementById('cfgWaNum').value};await ghSave('config.json',newCfg,cache.config.sha,'update qris');toast('QRIS disimpan');updateQrisUI();};
window.saveTg=async()=>{await loadAll();const newCfg={...cache.config.data,telegram:{token:document.getElementById('cfgTgToken').value,devChatId:document.getElementById('cfgTgChat').value,botUsername:document.getElementById('cfgTgUser').value}};await ghSave('config.json',newCfg,cache.config.sha,'update telegram');toast('Telegram disimpan');};
window.testTg=async()=>{await sendTelegram('✅ Test bot CMzMusify v2 — Bot aktif!');toast('Test terkirim');};
window.addAd=async()=>{const ad={id:'ad_'+Date.now(),title:document.getElementById('adTitle').value,image:document.getElementById('adImg').value,link:document.getElementById('adLink').value,type:document.getElementById('adType').value,code:document.getElementById('adCode').value,active:true};await loadAll();const newAds=[...cache.ads.data,ad];await ghSave('ads.json',newAds,cache.ads.sha,`add ad ${ad.title}`);toast('Iklan ditambah');loadDev();};
window.deleteAd=async(id)=>{await loadAll();const newAds=cache.ads.data.filter(a=>a.id!==id);await ghSave('ads.json',newAds,cache.ads.sha,`delete ${id}`);loadDev();};
window.approvePremium=async(username,paketId='bulan')=>{await loadAll();const paket=PAKET[paketId]||PAKET.bulan;const users={...cache.users.data};if(!users[username]) return toast('User tidak ada');users[username].premium=true;users[username].premiumPaket=paketId;users[username].premiumUntil=Date.now()+paket.days*24*60*60*1000;await ghSave('users.json',users,cache.users.sha,`approve ${username} ${paketId}`);const newCfg={...cache.config.data,pending:(cache.config.data.pending||[]).filter(p=>p.username!==username)};await ghSave('config.json',newCfg,cache.config.sha,`clear ${username}`);await sendTelegram(`✅ ${username} APPROVED — ${paket.label} (${paket.days} hari) sampai ${new Date(users[username].premiumUntil).toLocaleDateString('id-ID')}`);toast(`${username} premium ${paket.label}`);loadDev();render();};
function loadDev(){loadAll().then(()=>{const adList=document.getElementById('adList');if(adList) adList.innerHTML=cache.ads.data.map(a=>`<div style="display:flex;justify-content:space-between;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:8px;margin:4px 0"><span>${a.title} [${a.type}]</span><button onclick="deleteAd('${a.id}')" style="background:#ff4d4d;border:none;border-radius:8px;padding:4px 8px;color:white">Hapus</button></div>`).join('')||'Kosong';const ul=document.getElementById('userList');if(ul) ul.innerHTML=Object.values(cache.users.data).map(u=>`<div style="display:flex;justify-content:space-between;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:8px;margin:4px 0"><span>${u.username} — ${u.premium?u.premiumPaket+' PREMIUM':'FREE'}</span><div><button onclick="approvePremium('${u.username}','minggu')">7H</button><button onclick="approvePremium('${u.username}','bulan')">30H</button><button onclick="approvePremium('${u.username}','tahun')">365H</button></div></div>`).join('');const pl=document.getElementById('pendingList');if(pl) pl.innerHTML='<h4>Pending:</h4>'+(cache.config.data.pending||[]).map(p=>`<div style="display:flex;justify-content:space-between;background:var(--bg3);border-radius:10px;padding:8px;margin:4px 0"><span>${p.username} — ${p.paket} — ${p.price}</span><button onclick="approvePremium('${p.username}','${p.paket}')">Approve</button></div>`).join('')||'Tidak ada';});}
window.devTab=(t)=>{document.getElementById('devQris').style.display=t==='qris'?'block':'none';document.getElementById('devAds').style.display=t==='ads'?'block':'none';document.getElementById('devUsers').style.display=t==='users'?'block':'none';document.getElementById('devTg').style.display=t==='tg'?'block':'none';};
function render(){const u=currentUser;if(u){document.getElementById('loginBtn').style.display='none';const box=document.getElementById('userBox');box.style.display='block';box.innerHTML=`${u.username} ${u.premium?'◆':''} <button onclick="logout()" style="background:var(--bg3);border:1px solid var(--border);border-radius:999px;padding:6px 10px">Logout</button>`;document.getElementById('userStatus').textContent=`● ${u.username.toUpperCase()} ${u.premium?u.premiumPaket+' PREMIUM':'FREE'}`;document.getElementById('devNav').style.display=u.role==='developer'?'flex':'none';}loadAll().then(()=>{document.getElementById('content').innerHTML=`<div style="font-size:22px;font-weight:900;margin:10px 0">CMzMusify <span style="color:var(--p)">v2</span></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px">${['sesi potret','gala bunga matahari','bermuara','garam madu'].map(q=>`<div onclick="spotifySearch('${q}')" style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:10px;cursor:pointer"><img src="./logo.jpg" style="width:100%;border-radius:10px"><div style="font-size:12px;font-weight:800;margin-top:6px">${q}</div></div>`).join('')}</div>`;});}
window.closeM=(id)=>document.getElementById(id).classList.remove('visible');
window.switchTab=(t)=>{document.getElementById('loginF').style.display=t==='login'?'block':'none';document.getElementById('regF').style.display=t==='reg'?'block':'none';};
window.toast=(m)=>{const t=document.getElementById('toast');t.textContent=m;t.classList.add('visible');setTimeout(()=>t.classList.remove('visible'),3000);};
document.addEventListener('DOMContentLoaded',()=>{render();document.getElementById('loginBtn').onclick=()=>document.getElementById('authModal').classList.add('visible');document.getElementById('premiumNav').onclick=()=>{document.getElementById('premiumModal').classList.add('visible');loadAll().then(updateQrisUI);};const d=document.getElementById('devNav');if(d) d.onclick=()=>{document.getElementById('devModal').classList.add('visible');loadDev();};document.getElementById('searchInput').addEventListener('keydown',e=>{if(e.key==='Enter') spotifySearch(e.target.value);});document.getElementById('playBtn').onclick=()=>{if(audio.paused) audio.play(); else audio.pause();};audio.addEventListener('play',()=>document.getElementById('playBtn').textContent='⏸');audio.addEventListener('pause',()=>document.getElementById('playBtn').textContent='▶');audio.addEventListener('timeupdate',()=>{const pct=(audio.currentTime/audio.duration*100)||0;document.getElementById('seekFill').style.width=pct+'%';});});