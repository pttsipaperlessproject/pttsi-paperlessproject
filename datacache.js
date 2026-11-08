/* =========================================================
   DATACACHE.JS — Cache data otomatis dengan badge pembaruan

   Cara pasang (di setiap halaman, sebelum </body>):
       <script src="datacache.js"></script>

   Cara kerja:
   - Kunjungan pertama: data diambil dari server.
   - Kunjungan berikutnya: data tersimpan langsung tampil.
   - Di belakang layar data terbaru diperiksa (maks. 10 menit sekali
     per halaman). Jika ada perubahan, data baru langsung disimpan
     ke cache, tetapi halaman yang sedang dibuka tidak berubah.
   - Muncul badge kecil "Data baru". Klik badge untuk memuat ulang.
     Sebelum memuat ulang, user diminta konfirmasi, karena filter,
     pengurutan, dan paginasi akan kembali ke awal.
========================================================= */

(function(){

const PREFIX='tsi:v1:';                 /* ganti ke 'v2' jika struktur data berubah */
const MAX_AGE=24*60*60*1000;            /* kedaluwarsa (tidak dipakai untuk menampilkan) */
const MIN_CHECK_GAP=10*60*1000;         /* pemeriksaan data terbaru per sumber: maks. 10 menit sekali */
const API_MARK='script.google.com/macros/';
const SKIP_KEY='tsi:skipConfirmUntil';   /* waktu (ms) sampai konfirmasi dilewati */
const SKIP_DURATION=5*60*1000;

const nativeFetch=window.fetch.bind(window);

const lastCheck={};                     /* url → waktu pemeriksaan terakhir */
const checking={};                      /* url → pemeriksaan sedang berjalan */


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
   BADGE & KONFIRMASI MUAT ULANG
--------------------------------------------------------- */

function injectStyle(){

    if(document.getElementById('tsiUpdateStyle')) return;

    const style=document.createElement('style');
    style.id='tsiUpdateStyle';
    style.textContent=`
        #dataUpdateBadge{
            display:inline-flex;
            align-items:center;
            gap:7px;
            padding:9px 14px;
            border-radius:12px;
            border:1px solid #fde68a;
            background:#fffbeb;
            color:#92400e;
            font-family:Inter,sans-serif;
            font-size:11px;
            font-weight:800;
            white-space:nowrap;
            cursor:pointer;
            transition:.2s ease
        }
        #dataUpdateBadge:hover{background:#fef3c7;transform:translateY(-2px)}
        #dataUpdateBadge .dot{
            width:8px;height:8px;border-radius:999px;background:#f59e0b;flex-shrink:0
        }
        #dataUpdateBadge.floating{
            position:fixed;left:16px;bottom:16px;z-index:900;
            box-shadow:0 4px 12px rgba(15,23,42,.08)
        }

        #dataConfirmOverlay{
            position:fixed;inset:0;z-index:3000;
            background:rgba(15,23,42,.35);
            display:flex;align-items:center;justify-content:center;padding:20px
        }
        #dataConfirmBox{
            width:min(420px,100%);
            background:#fff;
            border:1px solid #e2e8f0;
            border-radius:20px;
            padding:22px;
            box-shadow:0 25px 60px rgba(15,23,42,.25);
            font-family:Inter,sans-serif
        }
        #dataConfirmBox h3{margin:0;font-size:15px;font-weight:900;color:#1e293b}
        #dataConfirmBox p{margin:10px 0 0;font-size:12px;line-height:1.6;color:#475569;font-weight:500}
        #dataConfirmBox .actions{display:flex;gap:9px;justify-content:flex-end;margin-top:18px}
        #dataConfirmBox button{
            padding:10px 16px;border-radius:12px;font-family:inherit;font-size:12px;font-weight:800;cursor:pointer;transition:.2s ease
        }
        #dataConfirmBox .btn-cancel{background:#f8fafc;color:#475569;border:1px solid #e2e8f0}
        #dataConfirmBox .btn-cancel:hover{background:#f1f5f9;color:#1e3a8a;border-color:#bfdbfe}
        #dataConfirmBox .btn-ok{background:#1e3a8a;color:#fff;border:none;box-shadow:0 5px 12px rgba(30,58,138,.18)}
        #dataConfirmBox .btn-ok:hover{background:#1d4ed8}
        #dataConfirmBox .skip-row{
            display:flex;align-items:center;gap:8px;margin-top:14px;
            font-size:11px;font-weight:700;color:#475569;cursor:pointer;user-select:none
        }
        #dataConfirmBox .skip-row input{accent-color:#1e3a8a;width:14px;height:14px;cursor:pointer}
    `;
    document.head.appendChild(style);
}

function showBadge(){

    if(document.getElementById('dataUpdateBadge')) return;

    injectStyle();

    const badge=document.createElement('button');
    badge.id='dataUpdateBadge';
    badge.type='button';
    badge.innerHTML='<span class="dot"></span>Data baru';
    badge.title='Klik untuk memuat ulang data';
    badge.onclick=openConfirm;

    const host=document.querySelector('.nav-group');

    if(host){
        host.appendChild(badge);
    }else{
        badge.classList.add('floating');
        document.body.appendChild(badge);
    }

}

function skipActive(){
    try{
        return Number(sessionStorage.getItem(SKIP_KEY)||0)>Date.now();
    }catch(e){
        return false;
    }
}

function openConfirm(){

    if(document.getElementById('dataConfirmOverlay')) return;

    /* Centang aktif (masih dalam 5 menit): langsung muat ulang tanpa konfirmasi */
    if(skipActive()){
        window.location.reload();
        return;
    }

    injectStyle();

    const overlay=document.createElement('div');
    overlay.id='dataConfirmOverlay';
    overlay.innerHTML=`
        <div id="dataConfirmBox" role="dialog" aria-modal="true">
            <h3>Muat ulang data?</h3>
            <p>
                Data terbaru sudah tersimpan. Jika dimuat ulang, <b>seluruh filter, pengurutan (sort),
                dan halaman paginasi</b> akan kembali ke kondisi awal.
            </p>
            <label class="skip-row">
                <input type="checkbox" class="skip-check">
                Jangan tampilkan peringatan ini selama 5 menit
            </label>
            <div class="actions">
                <button type="button" class="btn-cancel">Batal</button>
                <button type="button" class="btn-ok">Lanjut</button>
            </div>
        </div>
    `;

    overlay.querySelector('.btn-cancel').onclick=function(){ overlay.remove(); };
    overlay.querySelector('.btn-ok').onclick=function(){
        const check=overlay.querySelector('.skip-check');
        if(check&&check.checked){
            try{ sessionStorage.setItem(SKIP_KEY,String(Date.now()+SKIP_DURATION)); }catch(e){}
        }
        window.location.reload();
    };
    overlay.addEventListener('click',function(e){
        if(e.target===overlay) overlay.remove();
    });

    document.body.appendChild(overlay);

}

/* Tandai bahwa ada data baru (badge tetap tampil sampai diklik) */
function markUpdated(){
    showBadge();
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

            /* Simpan data baru ke cache; halaman yang sedang dibuka tidak berubah */
            write(url,fresh,fp);
            markUpdated();

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
    }
};

})();
