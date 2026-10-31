/* =========================================================
   DATACACHE.JS — Cache data otomatis

   Cara pasang (di setiap halaman, sebelum </body>):
       <script src="datacache.js"></script>

   Cara kerja:
   - Kunjungan pertama: data diambil dari server.
   - Kunjungan berikutnya: data tersimpan langsung tampil.
   - Di belakang layar data terbaru diperiksa, dengan aturan:
       · setiap sumber data diperiksa paling sering 10 menit sekali
       · pemeriksaan yang sedang berjalan tidak diulang
       · notifikasi untuk perubahan yang sama hanya muncul sekali
         per sesi browser (walau sudah ditutup)

   Opsi halaman (opsional):
       window.DATACACHE_NOTIFY=false;   // matikan notifikasi
========================================================= */

(function(){

const PREFIX='tsi:v1:';                 // ganti ke 'v2' jika struktur data berubah
const NOTE_PREFIX='tsi:note:v1:';       // penanda notifikasi yang sudah pernah tampil (per sesi)
const MAX_AGE=24*60*60*1000;            // cache dianggap kedaluwarsa setelah 24 jam
const MIN_CHECK_GAP=10*60*1000;         // pemeriksaan data terbaru per sumber: maks. 10 menit sekali
const API_MARK='script.google.com/macros/';

const nativeFetch=window.fetch.bind(window);

const lastCheck={};                     // url → waktu pemeriksaan terakhir (memori halaman)
const checking={};                      // url → pemeriksaan sedang berjalan


/* ---------------------------------------------------------
   SIDIK JARI DATA (perbandingan ringan)
--------------------------------------------------------- */

function fingerprint(data){
    const text=JSON.stringify(data);
    let h=5381;
    for(let i=0;i<text.length;i++){
        h=((h<<5)+h+text.charCodeAt(i))|0;
    }
    return `${h}:${text.length}`;
}


/* ---------------------------------------------------------
   PENYIMPANAN
--------------------------------------------------------- */

function read(url){
    try{
        const raw=localStorage.getItem(PREFIX+url);
        return raw?JSON.parse(raw):null;
    }catch(e){
        return null;
    }
}

function write(url,data,fp){

    const payload=JSON.stringify({t:Date.now(),data:data,fp:fp});

    try{
        localStorage.setItem(PREFIX+url,payload);
    }catch(e){
        prune();
        try{ localStorage.setItem(PREFIX+url,payload); }catch(_){}
    }

}

function cacheKeys(){
    const keys=[];
    for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i);
        if(key&&key.startsWith(PREFIX)) keys.push(key);
    }
    return keys;
}

/* Penyimpanan penuh: buang separuh cache terlama */
function prune(){
    const items=cacheKeys()
        .map(key=>{
            try{ return {key:key,t:JSON.parse(localStorage.getItem(key)).t||0}; }
            catch(e){ return {key:key,t:0}; }
        })
        .sort((a,b)=>a.t-b.t);

    items.slice(0,Math.ceil(items.length/2))
         .forEach(item=>localStorage.removeItem(item.key));
}


/* ---------------------------------------------------------
   NOTIFIKASI DATA TERBARU
--------------------------------------------------------- */

function injectStyle(){

    if(document.getElementById('tsiCacheStyle')) return;

    const style=document.createElement('style');
    style.id='tsiCacheStyle';
    style.textContent=`
        #tsiUpdateBox{
            position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(20px);
            z-index:3000;display:flex;align-items:center;gap:12px;
            background:#1e293b;color:#fff;border:1px solid #334155;border-radius:14px;
            padding:12px 14px;box-shadow:0 12px 28px rgba(15,23,42,.25);
            font-family:Inter,sans-serif;font-size:12px;font-weight:700;
            opacity:0;transition:opacity .25s ease,transform .25s ease;max-width:calc(100vw - 24px)
        }
        #tsiUpdateBox.show{opacity:1;transform:translateX(-50%) translateY(0)}
        #tsiUpdateBox button{
            background:#f59e0b;color:#1e293b;border:none;border-radius:10px;
            padding:7px 12px;font-family:inherit;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap
        }
        #tsiUpdateBox button:hover{background:#fbbf24}
        #tsiUpdateBox .tsi-close{background:transparent;color:#94a3b8;padding:4px 6px;font-size:14px;line-height:1}
        #tsiUpdateBox .tsi-close:hover{background:transparent;color:#fff}
        @media(max-width:767px){
            #tsiUpdateBox{bottom:14px;font-size:11px;padding:10px 11px}
        }
    `;
    document.head.appendChild(style);

}

function showUpdateBox(){

    injectStyle();

    if(document.getElementById('tsiUpdateBox')) return;

    const box=document.createElement('div');
    box.id='tsiUpdateBox';
    box.innerHTML=`
        <span>Data terbaru tersedia.</span>
        <button type="button" data-reload="1">Muat Ulang</button>
        <button type="button" class="tsi-close" data-close="1" aria-label="Tutup">×</button>
    `;

    box.addEventListener('click',e=>{
        if(e.target.dataset.reload) window.location.reload();
        if(e.target.dataset.close) box.remove();
    });

    document.body.appendChild(box);

    requestAnimationFrame(()=>box.classList.add('show'));

}

/* Notifikasi hanya untuk perubahan yang belum pernah ditampilkan di sesi ini */
function notifyOnce(url,fp){

    if(window.DATACACHE_NOTIFY===false) return;

    const key=NOTE_PREFIX+url;

    try{
        if(sessionStorage.getItem(key)===fp) return;
        sessionStorage.setItem(key,fp);
    }catch(e){}

    showUpdateBox();

}


/* ---------------------------------------------------------
   PENGAMBILAN DATA
--------------------------------------------------------- */

function isApiGet(url,init){
    const method=((init&&init.method)||'GET').toUpperCase();
    return method==='GET'&&url.indexOf(API_MARK)!==-1;
}

/* Periksa data terbaru di belakang layar (dibatasi frekuensinya) */
function refreshInBackground(url,cached){

    const now=Date.now();

    if(checking[url]) return;
    if(lastCheck[url]&&(now-lastCheck[url])<MIN_CHECK_GAP) return;

    checking[url]=true;
    lastCheck[url]=now;

    nativeFetch(url,{method:'GET',cache:'no-store'})
        .then(res=>{
            if(!res.ok) throw new Error('HTTP '+res.status);
            return res.json();
        })
        .then(fresh=>{

            const fp=fingerprint(fresh);

            if(fp===cached.fp) return;     /* tidak ada perubahan */

            write(url,fresh,fp);
            notifyOnce(url,fp);

        })
        .catch(err=>console.warn('Pemeriksaan data gagal:',err.message))
        .finally(()=>{ delete checking[url]; });

}

/* Pengganti fetch bawaan, hanya untuk pengambilan data API */
window.fetch=function(input,init){

    const url=typeof input==='string'?input:(input&&input.url)||'';

    if(!isApiGet(url,init)){
        return nativeFetch(input,init);
    }

    const cached=read(url);

    if(cached&&cached.data!==undefined){

        refreshInBackground(url,cached);

        return Promise.resolve(new Response(
            JSON.stringify(cached.data),
            {status:200,headers:{'Content-Type':'application/json'}}
        ));

    }

    return nativeFetch(input,init).then(res=>{

        if(res.ok){
            res.clone().json()
                .then(data=>write(url,data,fingerprint(data)))
                .catch(()=>{});
        }

        return res;

    });

};


/* ---------------------------------------------------------
   UTILITAS
--------------------------------------------------------- */

window.DataCache={
    clear:function(){
        cacheKeys().forEach(key=>localStorage.removeItem(key));
        for(let i=sessionStorage.length-1;i>=0;i--){
            const key=sessionStorage.key(i);
            if(key&&key.startsWith(NOTE_PREFIX)) sessionStorage.removeItem(key);
        }
    }
};

})();
