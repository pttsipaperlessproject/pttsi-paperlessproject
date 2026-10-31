/* =========================================================
   NAV.JS — Tombol navigasi terpusat (Design Bible)

   Mengatur tombol di baris atas halaman dashboard dan tabel:
   - Di dashboard : Home | Pindah Halaman | [satu tombol per tabel]
   - Di tabel     : Home | Pindah Halaman | Lihat Dashboard | [tabel lain dalam modul]

   Tombol lama (Kembali, Lihat Data, Data Keseluruhan, Home,
   Lihat data per hari) dihapus otomatis. Dropdown periode dan
   tahun tetap dibiarkan.

   Pemakaian: <script src="nav.js"></script> sebelum </body>
   Halaman index.html TIDAK perlu memakai file ini.
========================================================= */

(function(){

/* ---------------------------------------------------------
   DAFTAR MODUL (sumber kebenaran tunggal)
   tables : daftar tabel milik modul ini
            btn  = teks tombol di baris atas
            chip = teks pilihan di popup Pindah Halaman
========================================================= */

const NAV_ITEMS=[
    {title:"Periodic Service",       icon:"calendar-check-2", dash:"periodic.html",
        tables:[{url:"table.html",          btn:"Lihat Data", chip:"Data"}]},

    {title:"Laporan Kerusakan LPH",  icon:"clipboard-x",      dash:"lph.html",
        tables:[{url:"tlph.html",           btn:"Lihat Data", chip:"Data"}]},

    {title:"Corrective Maintenance", icon:"wrench",           dash:"maintenance.html",
        tables:[{url:"tmaintenance.html",   btn:"Lihat Data", chip:"Data"}]},

    {title:"Greasing Activity",      icon:"droplets",         dash:"greasing.html",
        tables:[{url:"tgreasing.html",      btn:"Lihat Data", chip:"Data"}]},

    {title:"Oil Usage",              icon:"fuel",             dash:"oil.html",
        tables:[{url:"toil.html",           btn:"Lihat Data", chip:"Data"}]},

    {title:"Man Power",              icon:"users",            dash:"manpower.html",
        tables:[{url:"tmanpower.html",      btn:"Lihat Data", chip:"Data"}]},

    {title:"Breakdown Unit",         icon:"triangle-alert",   dash:"breakdown.html",
        tables:[{url:"tbreakdown.html",     btn:"Lihat Data", chip:"Data"}]},

    {title:"Availability",           icon:"activity",         dash:"availability.html",
        tables:[
            {url:"tavailability.html",    btn:"Data Bulanan", chip:"Bulanan"},
            {url:"davailability.html",    btn:"Data Harian",  chip:"Harian"}
        ]},

    {title:"Populasi Unit",          icon:"truck",            dash:"populasi.html",
        tables:[{url:"tpopulasi.html",     btn:"Lihat Data", chip:"Data"}]}
];

const HOME_PAGE="index.html";


/* ---------------------------------------------------------
   CSS (disisipkan otomatis, mengikuti Design Bible)
--------------------------------------------------------- */

const NAV_CSS=`
.nav-group{
    display:flex;
    align-items:center;
    gap:9px;
    flex-wrap:wrap;
    justify-content:flex-end
}

.nav-btn{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    padding:11px 17px;
    border-radius:12px;
    font-family:inherit;
    font-size:12px;
    font-weight:800;
    white-space:nowrap;
    cursor:pointer;
    transition:.2s ease;
    border:1px solid #e2e8f0;
    background:#f8fafc;
    color:#475569
}
.nav-btn:hover{
    background:#f1f5f9;
    color:#1e3a8a;
    border-color:#bfdbfe;
    transform:translateY(-2px)
}

.nav-btn-primary{
    background:#1e3a8a;
    color:#fff;
    border-color:#1e3a8a;
    box-shadow:0 5px 12px rgba(30,58,138,.18)
}
.nav-btn-primary:hover{
    background:#1d4ed8;
    color:#fff;
    border-color:#1d4ed8;
    box-shadow:0 8px 18px rgba(30,58,138,.25)
}

/* ---------- POPUP ---------- */

#navOverlay{
    position:fixed;inset:0;z-index:950;
    display:none;align-items:center;justify-content:center;padding:20px;
    background:rgba(15,23,42,.45);backdrop-filter:blur(6px)
}
#navOverlay.show{display:flex}

#navBox{
    width:100%;max-width:640px;max-height:88vh;overflow-y:auto;
    background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:22px;
    box-shadow:0 25px 60px rgba(15,23,42,.2);
    animation:navIn .25s ease
}

@keyframes navIn{
    from{opacity:0;transform:translateY(10px) scale(.98)}
    to{opacity:1;transform:translateY(0) scale(1)}
}

.nav-head{
    display:flex;align-items:flex-start;justify-content:space-between;gap:12px;
    margin-bottom:16px
}
.nav-head-title{font-size:16px;font-weight:900;color:#1e293b}
.nav-head-sub{font-size:10px;color:#94a3b8;font-weight:600;margin-top:4px;line-height:1.5}

.nav-close{
    width:34px;height:34px;border:none;border-radius:10px;background:#f8fafc;color:#64748b;
    display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0
}
.nav-close:hover{background:#f1f5f9;color:#334155}

.nav-home{
    width:100%;display:flex;align-items:center;gap:12px;
    border:1px solid #bfdbfe;background:#eff6ff;border-radius:14px;padding:12px 14px;
    margin-bottom:16px;cursor:pointer;font-family:inherit;text-align:left;transition:.2s ease
}
.nav-home:hover{background:#dbeafe;border-color:#93c5fd}

.nav-grid{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:10px
}

.nav-card{
    border:1px solid #e2e8f0;background:#fff;border-radius:15px;padding:13px;
    display:flex;flex-direction:column;gap:11px;min-width:0
}
.nav-card.current{border-color:#1e3a8a;box-shadow:0 0 0 1px #1e3a8a inset}

.nav-card-head{display:flex;align-items:center;gap:10px;min-width:0}

.nav-card-icon{
    width:34px;height:34px;border-radius:10px;background:#eff6ff;color:#1e3a8a;
    display:flex;align-items:center;justify-content:center;flex-shrink:0
}

.nav-card-title{
    font-size:11px;font-weight:900;color:#1e293b;line-height:1.3;min-width:0
}

.nav-badge{
    display:inline-block;margin-top:3px;padding:2px 7px;border-radius:999px;
    background:#dbeafe;color:#1e40af;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.05em
}

.nav-chips{display:grid;gap:7px}

.nav-chip{
    border:1px solid #e2e8f0;background:#f8fafc;border-radius:10px;padding:9px 8px;
    font-family:inherit;font-size:10px;font-weight:800;color:#475569;cursor:pointer;
    display:flex;align-items:center;justify-content:center;gap:6px;transition:.2s ease;min-width:0
}
.nav-chip:hover{background:#eff6ff;border-color:#bfdbfe;color:#1e3a8a}
.nav-chip.active{background:#1e3a8a;border-color:#1e3a8a;color:#fff;cursor:default}
.nav-chip.active:hover{background:#1e3a8a;color:#fff}

.nav-legend{
    font-size:9px;font-weight:700;color:#94a3b8;margin-top:14px;text-align:center
}

/* ---------- MOBILE (bible ≤767px) ---------- */

@media(max-width:767px){
    .nav-group{
        width:100%;
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:8px;
        grid-column:1/-1
    }
    .nav-btn{
        width:100%;
        padding:10px 6px;
        font-size:10px;
        white-space:normal;
        text-align:center;
        border-radius:10px
    }
    .nav-btn i{width:14px;height:14px}

    #navBox{padding:16px;border-radius:18px}
    .nav-grid{grid-template-columns:minmax(0,1fr)}
}

@media(max-width:380px){
    .nav-btn{font-size:9px;padding:9px 4px}
    .nav-btn span{display:none}
}
`;


/* ---------------------------------------------------------
   UTILITAS
--------------------------------------------------------- */

function currentFile(){
    return location.pathname.split('/').pop()||HOME_PAGE;
}

/* Cari modul & posisi halaman aktif */
function findCurrent(){

    const here=currentFile();

    for(const item of NAV_ITEMS){
        if(item.dash===here) return {item,kind:'dashboard',table:null};
        const t=item.tables.find(t=>t.url===here);
        if(t) return {item,kind:'table',table:t};
    }

    return {item:null,kind:null,table:null};

}

function go(url){
    if(url) window.location.href=url;
}

function closeNav(){
    const overlay=document.getElementById('navOverlay');
    if(overlay) overlay.classList.remove('show');
    document.body.style.overflow='';
}

function openNav(){
    document.getElementById('navOverlay').classList.add('show');
    document.body.style.overflow='hidden';
    if(window.lucide) lucide.createIcons();
}


/* ---------------------------------------------------------
   WADAH TOMBOL
   1. .page-actions (jika ada)
   2. induk dari tombol .back-button / .secondary-button
   3. awal section
--------------------------------------------------------- */

function findHost(){

    const pageActions=document.querySelector('.page-actions');
    if(pageActions) return pageActions;

    const anyBack=document.querySelector('.back-button, .secondary-button');
    if(anyBack) return anyBack.parentElement;

    const section=document.querySelector('section');
    return section?section.firstElementChild:null;

}

/* Hapus tombol lama, biarkan dropdown periode/tahun */
function clearOldButtons(host){
    host.querySelectorAll('button').forEach(btn=>{
        if(!btn.closest('.nav-group')) btn.remove();
    });
}


/* ---------------------------------------------------------
   TOMBOL DI BARIS ATAS
--------------------------------------------------------- */

function makeButton(cls,icon,label,onClick){
    const b=document.createElement('button');
    b.type='button';
    b.className=cls;
    b.innerHTML=`<i data-lucide="${icon}" class="w-4 h-4"></i><span>${label}</span>`;
    b.onclick=onClick;
    return b;
}

function buildGroup(current){

    const group=document.createElement('div');
    group.className='nav-group';

    group.appendChild(makeButton('nav-btn nav-btn-primary','house','Home',()=>go(HOME_PAGE)));
    group.appendChild(makeButton('nav-btn','layout-grid','Pindah Halaman',openNav));

    if(!current.item) return group;

    if(current.kind==='dashboard'){

        /* Di dashboard: satu tombol untuk setiap tabel modul */
        current.item.tables.forEach(t=>{
            group.appendChild(makeButton('nav-btn','table-2',t.btn||'Lihat Data',()=>go(t.url)));
        });

    }else{

        /* Di tabel: kembali ke dashboard + tabel lain dalam modul yang sama */
        group.appendChild(makeButton('nav-btn','layout-dashboard','Lihat Dashboard',()=>go(current.item.dash)));

        current.item.tables
            .filter(t=>t.url!==current.table.url)
            .forEach(t=>{
                group.appendChild(makeButton('nav-btn','table-2',t.btn||'Lihat Data',()=>go(t.url)));
            });

    }

    return group;

}


/* ---------------------------------------------------------
   POPUP PINDAH HALAMAN
   Satu kartu per modul: Dashboard + setiap tabel.
--------------------------------------------------------- */

function chipHtml(icon,label,url,isCurrent){

    if(isCurrent){
        return `<button type="button" class="nav-chip active" disabled>
                    <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>${label}
                </button>`;
    }

    return `<button type="button" class="nav-chip" data-go="${url}">
                <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>${label}
            </button>`;

}

function cardHtml(item,here){

    const onDashboard=item.dash===here;
    const onTable=item.tables.some(t=>t.url===here);
    const isCurrentModule=onDashboard||onTable;

    const chips=[chipHtml('layout-dashboard','Dashboard',item.dash,onDashboard)]
        .concat(item.tables.map(t=>chipHtml('table-2',t.chip||'Data',t.url,t.url===here)));

    return `
        <div class="nav-card ${isCurrentModule?'current':''}">

            <div class="nav-card-head">
                <span class="nav-card-icon">
                    <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                </span>
                <div class="min-w-0">
                    <div class="nav-card-title">${item.title}</div>
                    ${isCurrentModule?'<span class="nav-badge">Sedang dibuka</span>':''}
                </div>
            </div>

            <div class="nav-chips" style="grid-template-columns:repeat(${chips.length},minmax(0,1fr))">
                ${chips.join('')}
            </div>

        </div>
    `;

}

function buildOverlay(){

    const here=currentFile();

    const cards=NAV_ITEMS.map(item=>cardHtml(item,here)).join('');

    const overlay=document.createElement('div');
    overlay.id='navOverlay';

    overlay.innerHTML=`
        <div id="navBox">

            <div class="nav-head">
                <div>
                    <div class="nav-head-title">Pindah Halaman</div>
                    <div class="nav-head-sub">
                        Pilih modul, lalu pilih <b>Dashboard</b> untuk ringkasan
                        atau salah satu tabel untuk data lengkap.
                    </div>
                </div>
                <button type="button" class="nav-close" data-close="1">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>

            <button type="button" class="nav-home" data-go="${HOME_PAGE}">
                <span class="nav-card-icon"><i data-lucide="house" class="w-4 h-4"></i></span>
                <span>
                    <span class="nav-card-title block">Home</span>
                    <span class="nav-badge" style="background:#fff;color:#1e40af">Halaman utama</span>
                </span>
            </button>

            <div class="nav-grid">
                ${cards}
            </div>

            <div class="nav-legend">Tekan Esc atau klik di luar kotak untuk menutup</div>

        </div>
    `;

    overlay.addEventListener('click',e=>{

        if(e.target===overlay||e.target.closest('[data-close]')){
            closeNav();
            return;
        }

        const target=e.target.closest('[data-go]');
        if(target) go(target.getAttribute('data-go'));

    });

    document.body.appendChild(overlay);

}


/* ---------------------------------------------------------
   INISIALISASI
--------------------------------------------------------- */

function init(){

    const style=document.createElement('style');
    style.textContent=NAV_CSS;
    document.head.appendChild(style);

    const current=findCurrent();
    const host=findHost();

    if(host){
        clearOldButtons(host);
        host.appendChild(buildGroup(current));
    }

    buildOverlay();

    if(window.lucide) lucide.createIcons();

    document.addEventListener('keydown',e=>{
        if(e.key==='Escape') closeNav();
    });

}

if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
}else{
    init();
}

})();
