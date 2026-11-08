/* =========================================================
   LAYOUT.JS — Header & footer bersama (PT TSI Paperless)

   Pemakaian di setiap halaman:
   1. Di posisi header:  <div id="siteHeader"></div>
   2. Di posisi footer:  <div id="siteFooter"></div>
   3. Sebelum </body>:   <script src="layout.js"></script>

   Ubah header/footer cukup di file ini.
========================================================= */

(function(){

const HEADER_HTML=`<header class="w-full mb-8 pb-6 border-b-2 border-slate-100 flex flex-col items-center">

    <div class="mb-4 logo-wrapper">
        <div class="w-24 h-24 flex items-center justify-center bg-white rounded-2xl logo-shadow overflow-hidden p-2">
            <img
                src="default_logo.png"
                alt="Logo PT TSI"
                class="w-full h-full object-contain"
                id="companyLogo"
                onerror="handleLogoError()"
            >
            <div
                id="logoFallback"
                class="hidden flex-col items-center justify-center bg-blue-900 w-full h-full text-white"
            >
                <span class="font-black text-2xl">TSI</span>
            </div>
        </div>
    </div>

    <div class="color-primary text-white px-8 py-4 rounded-2xl shadow-lg flex flex-col items-center gap-1">
        <h1 class="text-xl sm:text-2xl font-black uppercase tracking-[0.1em] text-center">
            PAPERLESS PROJECT
        </h1>
        <div class="h-0.5 w-16 bg-amber-500 rounded-full my-1"></div>
        <h2 class="text-sm sm:text-lg font-bold uppercase tracking-widest text-blue-100 text-center">
            PT TATSUMI SERUNI INDONESIA
        </h2>
    </div>

    <div class="mt-3 text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase text-center">
        Digitalization Initiative v2.0
    </div>

</header>`;

const FOOTER_HTML=`<footer class="mt-8 text-center text-slate-400 px-4 pb-8">
    <p class="font-bold text-slate-500 tracking-tight uppercase">
        &copy; 2026 Paperless Project - PT TSI. All rights reserved.
    </p>
    <p class="text-[10px] mt-1">
        System Architecture by:
        <span class="text-slate-600 font-semibold uppercase">Imam Wahyu Ramadhan, S.T.</span>
        |
        <span class="text-amber-600 font-bold uppercase tracking-tighter">Project 2.0</span>
    </p>
</footer>`;

const headerSlot=document.getElementById('siteHeader');
if(headerSlot) headerSlot.outerHTML=HEADER_HTML;

const footerSlot=document.getElementById('siteFooter');
if(footerSlot) footerSlot.outerHTML=FOOTER_HTML;

})();

/* =========================================================
   KARTU STATISTIK: selalu satu baris sejajar
   - Lebar tiap kartu menyesuaikan jumlah kartu (--n)
   - Jumlah dihitung ulang otomatis saat kartu dibuat ulang
     (misalnya saat dropdown berubah)
   - Di layar kecil tetap satu baris, bisa digeser ke samping
========================================================= */

(function(){

const STAT_ROW_SELECTOR='.stats-grid,.stat-grid,.kpi-grid,.kpi-row,.stats-row';

const style=document.createElement('style');
style.id='statRowStyle';
style.textContent=`
${STAT_ROW_SELECTOR.split(',').join(',\n')}{
    display:flex!important;
    flex-wrap:nowrap!important;
    gap:14px!important;
    margin-bottom:20px!important;
    overflow-x:auto;
    overflow-y:hidden;
    padding-bottom:4px
}
${STAT_ROW_SELECTOR.split(',').join('>*,')}>*{
    flex:1 1 0!important;
    min-width:0
}
@media(max-width:767px){
    ${STAT_ROW_SELECTOR.split(',').join(',\n    ')}{
        gap:10px!important;
        margin-bottom:14px!important
    }
    ${STAT_ROW_SELECTOR.split(',').join('>*,')}>*{
        flex:0 0 140px!important
    }
}
`;
document.head.appendChild(style);

function syncStatRows(){
    document.querySelectorAll(STAT_ROW_SELECTOR).forEach(el=>{
        const n=Array.from(el.children).filter(c=>c.nodeType===1).length;
        el.style.setProperty('--n',String(Math.max(1,n)));
    });
}

syncStatRows();

new MutationObserver(syncStatRows).observe(document.body,{childList:true,subtree:true});

window.addEventListener('load',syncStatRows);

})();

/* =========================================================
   TAMPILAN MOBILE (≤767px)
   - Setiap panel dashboard satu per baris
   - Tabel tetap tabel (tidak diubah menjadi kartu),
     lebar kolom mengikuti isi & ukuran font, bisa di-scroll ke samping
========================================================= */

(function(){

const style=document.createElement('style');
style.id='mobileLayoutStyle';
style.textContent=`
@media(max-width:767px){

    /* 1 panel per baris */
    .dash-grid,
    .dash-grid.two,
    .dash-grid.three,
    .dash-grid.wide,
    .dash-grid.single{
        grid-template-columns:minmax(0,1fr)!important
    }

    .dash-grid>*{min-width:0!important}

    /* Kartu tabel (mobile) disembunyikan, tabel asli ditampilkan */
    .mobile-data-list,
    .mobile-filter-bar,
    .mobile-card-list,
    .ol-mobile,
    .dl-mobile,
    .tbl-mobile,
    .lt-mobile,
    .yr-mobile,
    .lo-mobile,
    .mobile-list,
    #loMobile,
    #mobileDataList,
    #mobileFilterBar,
    #olMobile,
    #dlMobile,
    #dlOldMobile,
    #recentMobile,
    #yearMobile,
    #damageMobile,
    #ltMobile,
    #curOpenMobile,
    #dayMobile{
        display:none!important
    }

    .table-scroll,
    .ol-scroll,
    .dl-scroll,
    .tbl-scroll,
    .lt-scroll,
    .lo-scroll{
        display:block!important;
        overflow-x:auto!important;
        -webkit-overflow-scrolling:touch
    }

    /* Lebar kolom mengikuti isi dan ukuran font */
    table{
        display:table!important;
        width:max-content!important;
        min-width:100%!important;
        table-layout:auto!important;
        border-collapse:separate
    }

    col{width:auto!important}

    th{
        white-space:nowrap!important;
        font-size:9px!important;
        padding:10px!important
    }

    td{
        font-size:10px!important;
        padding:10px!important;
        white-space:normal!important;
        max-width:220px;
        vertical-align:top
    }

    td.whitespace-nowrap,
    td.cell-truncate,
    td.date-cell{white-space:nowrap!important}
}
`;
document.head.appendChild(style);

})();


/* =========================================================
   CETAK (Ctrl+P)
   - Default: A4 landscape, margin narrow (6mm)
   - Header diperkecil, satu panel per baris
   - Tabel: mencetak SELURUH baris (bukan hanya halaman yang tampil)
========================================================= */

(function(){

const style=document.createElement('style');
style.id='printLayoutStyle';
style.textContent=`
@media print{

    @page{size:A4 landscape;margin:6mm}

    *{
        -webkit-print-color-adjust:exact!important;
        print-color-adjust:exact!important
    }

    html,body{
        background:#fff!important;
        margin:0!important;
        padding:0!important;
        width:100%!important;
        min-width:0!important;
        display:block!important
    }

    main{
        width:100%!important;
        max-width:none!important;
        margin:0!important;
        padding:0!important;
        border:none!important;
        border-radius:0!important;
        box-shadow:none!important;
        background:#fff!important;
        backdrop-filter:none!important
    }

    /* Header diperkecil */
    header{
        margin:0 0 6px 0!important;
        padding:0 0 4px 0!important;
        border-bottom:1px solid #cbd5e1!important;
        width:100%!important
    }
    header .logo-wrapper{display:none!important}
    header .color-primary{padding:4px 12px!important;border-radius:8px!important;gap:0!important}
    header .color-primary h1{font-size:12px!important;line-height:1.1!important;letter-spacing:.06em!important}
    header .color-primary h2{font-size:9px!important;line-height:1.1!important;letter-spacing:.08em!important}
    header .color-primary .h-0\\.5{display:none!important}
    header>div:last-child{display:none!important}

    /* Elemen interaktif & navigasi tidak ikut tercetak */
    .page-actions,
    .nav-group,
    #navOverlay,
    .col-dropdown,
    .mobile-filter-bar,
    .mobile-data-list,
    .mobile-card-list,
    .ol-mobile,
    .dl-mobile,
    .tbl-mobile,
    .lt-mobile,
    .yr-mobile,
    .lo-mobile,
    .mobile-list,
    #mobileDataList,
    #mobileFilterBar,
    #olMobile,
    #dlMobile,
    #dlOldMobile,
    #recentMobile,
    #yearMobile,
    #damageMobile,
    #ltMobile,
    #curOpenMobile,
    #dayMobile,
    #pagination,
    .pagination-footer,
    .chart-tip,
    #chartTip,
    #loading,
    .col-icons,
    .col-sort-icon,
    .col-filter-icon,
    footer,
    .stat-card:hover{display:none!important}

    /* Satu panel per baris */
    .dash-grid,
    .dash-grid.two,
    .dash-grid.three,
    .dash-grid.wide,
    .dash-grid.single{
        display:block!important;
        margin-bottom:6px!important
    }

    .dash-grid>*,
    .panel,
    .table-panel{
        width:100%!important;
        min-width:0!important;
        margin-bottom:6px!important;
        box-shadow:none!important
    }

    .panel{border:1px solid #cbd5e1!important;border-radius:6px!important;padding:6px 8px!important}

    /* Kartu statistik tetap satu baris */
    .stats-grid,.stat-grid,.kpi-grid,.kpi-row,.stats-row{
        display:flex!important;
        flex-wrap:nowrap!important;
        overflow:visible!important;
        gap:6px!important;
        margin-bottom:6px!important
    }
    .stats-grid>*,.stat-grid>*,.kpi-grid>*,.kpi-row>*,.stats-row>*{
        flex:1 1 0!important;
        min-width:0!important;
        padding:6px!important
    }

    /* Tabel & daftar penuh tanpa scroll */
    .table-scroll,.ol-scroll,.dl-scroll,.tbl-scroll,.lt-scroll,.lo-scroll,
    .yr-codes,.hbar-scroll,.dmg-list{
        display:block!important;
        overflow:visible!important;
        max-height:none!important;
        height:auto!important
    }

    table{
        display:table!important;
        width:100%!important;
        min-width:0!important;
        table-layout:auto!important;
        font-size:9px!important
    }
    thead{display:table-header-group!important}
    thead th{position:static!important;background:#f1f5f9!important;padding:4px!important;font-size:8px!important}
    tbody td{
        padding:3px 4px!important;
        font-size:9px!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        word-break:normal!important
    }
    /* Kolom nomor (pertama) dibuat sesempit mungkin */
    thead th:first-child,
    tbody td:first-child{
        width:1%!important;
        white-space:nowrap!important;
        text-align:center!important
    }
    tr,td,th{break-inside:avoid}

    .panel[style*="overflow"]{overflow:visible!important}
    .panel-title{font-size:11px!important}
    .panel-subtitle{font-size:8px!important}

    .chart-wrap svg{max-width:100%!important;height:auto!important}
}
`;
document.head.appendChild(style);

/* Tabel: tampilkan seluruh baris saat dicetak */
let printSaved=null;

function printAllRowsOn(){
    try{
        if(typeof renderTable!=='function'||typeof ROWS_PER_PAGE==='undefined') return;
        printSaved={size:ROWS_PER_PAGE,page:currentPage};
        ROWS_PER_PAGE=1000000;
        currentPage=1;
        renderTable();
    }catch(e){
        printSaved=null;
    }
}

function printAllRowsOff(){
    if(!printSaved) return;
    try{
        ROWS_PER_PAGE=printSaved.size;
        currentPage=printSaved.page;
        renderTable();
    }catch(e){}
    printSaved=null;
}

window.addEventListener('beforeprint',printAllRowsOn);
window.addEventListener('afterprint',printAllRowsOff);

})();

/* =========================================================
   TOMBOL CETAK DI BARIS NAVIGASI
   - Tersembunyi secara default
   - Muncul saat user menekan tombol "⋯" (Lainnya)
   - Muncul otomatis saat halaman digulir ke bawah
   - Ctrl+P tetap berfungsi seperti biasa
   - Tidak ikut tercetak
========================================================= */

(function(){

const cetakStyle=document.createElement('style');
cetakStyle.id='cetakStyle';
cetakStyle.textContent=`
#cetakMore,#cetakBtn{display:none}
#cetakMore.show,#cetakBtn.show{display:flex}
#cetakMore{
    width:44px;
    padding:11px 0!important;
    justify-content:center
}
@media print{
    #cetakMore,#cetakBtn{display:none!important}
}
@media(max-width:767px){
    #cetakMore{width:100%}
}
`;
document.head.appendChild(cetakStyle);

const SCROLL_TRIGGER=200;   /* px: setelah ini tombol Cetak muncul otomatis */
const IDLE_HIDE=60000;      /* ms: tanpa scroll selama ini, tombol hasil scroll disembunyikan lagi */
let manualOpen=false;
let scrolledDown=false;
let idleTimer=null;
let ticking=false;

function applyVisibility(){
    const btn=document.getElementById('cetakBtn');
    const more=document.getElementById('cetakMore');
    if(!btn||!more) return;

    const show=manualOpen||scrolledDown;
    btn.classList.toggle('show',show);
    more.setAttribute('aria-expanded',manualOpen?'true':'false');
}

function onScroll(){
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(function(){
        ticking=false;

        /* Sekali muncul karena scroll, tetap muncul selama layar masih digulir */
        if(window.scrollY>SCROLL_TRIGGER&&!scrolledDown){
            scrolledDown=true;
            applyVisibility();
        }

        /* Setiap scroll mengatur ulang hitung mundur 1 menit */
        clearTimeout(idleTimer);
        idleTimer=setTimeout(function(){
            if(scrolledDown){
                scrolledDown=false;
                applyVisibility();
            }
        },IDLE_HIDE);
    });
}

window.addEventListener('load',function(){

    const group=document.querySelector('.nav-group');
    if(!group||document.getElementById('cetakBtn')) return;

    const more=document.createElement('button');
    more.type='button';
    more.id='cetakMore';
    more.className='nav-btn';
    more.title='Lainnya';
    more.setAttribute('aria-label','Lainnya');
    more.innerHTML='<i data-lucide="ellipsis" class="w-4 h-4"></i>';
    more.onclick=function(){
        manualOpen=!manualOpen;
        applyVisibility();
    };

    const btn=document.createElement('button');
    btn.type='button';
    btn.id='cetakBtn';
    btn.className='nav-btn';
    btn.title='Cetak / Simpan PDF';
    btn.innerHTML='<i data-lucide="printer" class="w-4 h-4"></i><span>Cetak</span>';
    btn.onclick=function(){ window.print(); };

    group.appendChild(more);
    group.appendChild(btn);

    window.addEventListener('scroll',onScroll,{passive:true});
    onScroll();
    applyVisibility();

    if(window.lucide) lucide.createIcons();

});

})();
