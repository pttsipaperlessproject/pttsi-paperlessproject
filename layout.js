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
