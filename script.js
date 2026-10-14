const filters=document.querySelectorAll(".filter"),cards=document.querySelectorAll(".menu-card"),search=document.getElementById("search"),empty=document.getElementById("empty");let active="all";function render(){const q=(search?.value||"").toLowerCase();let shown=0;cards.forEach(c=>{const ok=(active==="all"||c.dataset.cat===active)&&c.dataset.name.includes(q);c.style.display=ok?"block":"none";if(ok)shown++});if(empty)empty.style.display=shown?"none":"block"}filters.forEach(b=>b.addEventListener("click",()=>{filters.forEach(x=>x.classList.remove("active"));b.classList.add("active");active=b.dataset.filter;render()}));search?.addEventListener("input",render);document.querySelector(".menu-toggle")?.addEventListener("click",()=>document.querySelector(".nav-links")?.classList.toggle("open"));document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".nav-links")?.classList.remove("open")));
const voiceToggle=document.getElementById("voiceToggle"),voiceLabel=document.getElementById("voiceLabel");let auto=false,timer=null,frame=null,voiceOn=false,idx=0,voices=[];const SPEED=32,IDLE=2000;function loadVoices(){voices=window.speechSynthesis?.getVoices?.()||[]}if("speechSynthesis"in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices}const clean=t=>t.replace(/\s+/g," ").trim();function nodes(){return [...document.querySelectorAll('.hero-content h1,.hero-content p:not(.eyebrow),.heading h2,.heading > p:last-child,.menu-card h3,.menu-card p,.order h2,.order p,.order-box h3,.order-box p,footer p')].filter(e=>clean(e.textContent).length>1)}function clear(){document.querySelectorAll('.karaoke-active').forEach(e=>e.classList.remove('karaoke-active'));document.querySelectorAll('.karaoke-word').forEach(e=>{const p=e.parentNode;if(p){p.replaceChild(document.createTextNode(e.textContent),e);p.normalize()}})}function word(el,start,len){const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),ns=[];let n;while(n=w.nextNode())ns.push(n);let p=0;for(const x of ns){let end=p+x.nodeValue.length;if(start<end&&start+len>p){let a=Math.max(0,start-p),b=Math.min(x.nodeValue.length,start+len-p),t=x.nodeValue,f=document.createDocumentFragment();if(a)f.appendChild(document.createTextNode(t.slice(0,a)));let s=document.createElement('span');s.className='karaoke-word';s.textContent=t.slice(a,b);f.appendChild(s);if(b<t.length)f.appendChild(document.createTextNode(t.slice(b)));x.parentNode.replaceChild(f,x);break}p=end}}function speak(el){if(!voiceOn||!("speechSynthesis"in window))return;let text=clean(el.textContent);speechSynthesis.cancel();clear();el.classList.add('karaoke-active');el.scrollIntoView({behavior:'smooth',block:'center'});let u=new SpeechSynthesisUtterance(text),v=voices.find(v=>/^id(-|_)/i.test(v.lang))||voices.find(v=>/indonesian|bahasa/i.test(v.name))||voices[0];if(v)u.voice=v;u.lang=v?.lang||'id-ID';u.rate=1;u.onboundary=e=>{if(e.name==='word'){document.querySelectorAll('.karaoke-word').forEach(x=>{const p=x.parentNode;if(p){p.replaceChild(document.createTextNode(x.textContent),x);p.normalize()}});word(el,e.charIndex||0,Math.max(e.charLength||1,1))}};u.onend=()=>{clear();if(auto&&voiceOn){idx=(idx+1)%nodes().length;setTimeout(()=>{if(auto)speak(nodes()[idx])},180)}};speechSynthesis.speak(u)}function loop(){if(!auto)return;let max=document.documentElement.scrollHeight-innerHeight;if(scrollY>=max-2){auto=false;cancelAnimationFrame(frame);speechSynthesis?.cancel();clear();scrollTo({top:0,behavior:'instant'});setTimeout(()=>{auto=true;if(voiceOn){idx=0;speak(nodes()[0])}frame=requestAnimationFrame(loop)},300);return}scrollBy(0,SPEED/60);frame=requestAnimationFrame(loop)}function start(){if(auto)return;let ns=nodes();if(!ns.length)return;auto=true;if(voiceOn){idx=0;speak(ns[idx])}frame=requestAnimationFrame(loop)}function reset(){auto=false;cancelAnimationFrame(frame);speechSynthesis?.cancel();clear();clearTimeout(timer);timer=setTimeout(start,IDLE)}voiceToggle?.addEventListener('click',e=>{e.stopPropagation();voiceOn=!voiceOn;voiceToggle.classList.toggle('active',voiceOn);voiceLabel.textContent=voiceOn?'Suara Aktif':'Aktifkan Suara';reset()});['pointerdown','wheel','touchstart','keydown'].forEach(t=>document.addEventListener(t,reset,{passive:true}));timer=setTimeout(start,IDLE);

/* 🍜 Bakmi cursor trail: every movement leaves a bowl-shaped trail that fades away. */
let lastCursorTrail = 0;
document.addEventListener('mousemove', (e) => {
  const now = performance.now();
  if (now - lastCursorTrail < 45) return;
  lastCursorTrail = now;

  const trail = document.createElement('div');
  trail.className = 'cursor-trail';
  trail.style.left = e.clientX + 'px';
  trail.style.top = e.clientY + 'px';
  document.body.appendChild(trail);
  setTimeout(() => trail.remove(), 800);
}, { passive: true });

/* ===== Dokumentasi Pembeli lightbox: added feature only ===== */
(() => {
  const items = [...document.querySelectorAll(".docs-photo")];
  const box = document.getElementById("docsLightbox");
  const image = document.getElementById("docsLightboxImage");
  const close = document.querySelector(".docs-close");
  const prev = document.querySelector(".docs-prev");
  const next = document.querySelector(".docs-next");
  if (!items.length || !box || !image) return;
  let current = 0;
  const show = i => {
    current = (i + items.length) % items.length;
    image.src = items[current].dataset.full;
    image.alt = items[current].querySelector("img")?.alt || "Dokumentasi Bakmi Mulia";
    box.classList.add("open");
    box.setAttribute("aria-hidden","false");
  };
  const hide = () => {
    box.classList.remove("open");
    box.setAttribute("aria-hidden","true");
    image.src = "";
  };
  items.forEach((item,i)=>item.addEventListener("click",()=>show(i)));
  close?.addEventListener("click",hide);
  prev?.addEventListener("click",()=>show(current-1));
  next?.addEventListener("click",()=>show(current+1));
  box.addEventListener("click",e=>{if(e.target===box)hide()});
  document.addEventListener("keydown",e=>{
    if(!box.classList.contains("open")) return;
    if(e.key==="Escape") hide();
    if(e.key==="ArrowLeft") show(current-1);
    if(e.key==="ArrowRight") show(current+1);
  });
})();


/* ===== Bakmi Mulia order cart upgrade ===== */
(() => {
  // Paste the deployed Apps Script Web App URL here after deployment. Leave blank for WhatsApp fallback.
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzUoxeV7m6f-5h4viYH5YyumfNgLmvcRk_D3XG0dK4cSa_AI9KbNyOy3aImC6j5M5t/exec';
  window.__BAKMI_API_URL = APPS_SCRIPT_URL;
  const WA_NUMBER = '6289604345314';
  const cart = new Map();
  const rupiah = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n).replace(/\u00a0/g,' ');
  const cards = [...document.querySelectorAll('.menu-card')];
  const countEl = document.getElementById('cartCount');
  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutOpen');
  const modal = document.getElementById('checkoutModal');
  const form = document.getElementById('checkoutForm');
  const msg = document.getElementById('checkoutMessage');
  if(!cards.length || !itemsEl || !form) return;
  function priceFrom(card){const s=card.querySelector('strong')?.textContent||'';const digits=s.replace(/[^0-9]/g,'');return Number(digits)||0;}
  function info(card){return {name:card.querySelector('h3')?.textContent.trim()||'Menu',price:priceFrom(card)};}
  cards.forEach((card,i)=>{const b=document.createElement('button');b.type='button';b.className='add-cart';b.textContent='+ Tambah ke keranjang';b.addEventListener('click',()=>{const d=info(card);const key=d.name+'|'+d.price;const old=cart.get(key)||{...d,key,qty:0};old.qty++;cart.set(key,old);render();});card.appendChild(b);});
  function render(){let count=0,total=0;cart.forEach(x=>{count+=x.qty;total+=x.qty*x.price});if(countEl)countEl.textContent=count;if(totalEl)totalEl.textContent=rupiah(total);if(checkoutBtn)checkoutBtn.disabled=count===0;if(!cart.size){itemsEl.innerHTML='<p class="cart-empty">Keranjang kamu masih kosong. Tambahkan menu dari kartu menu, ya!</p>';return;}itemsEl.innerHTML='';cart.forEach(x=>{const row=document.createElement('div');row.className='cart-row';const left=document.createElement('div');const title=document.createElement('strong');title.textContent=x.name;const price=document.createElement('small');price.textContent=rupiah(x.price)+' / porsi';left.append(title,price);const right=document.createElement('div');right.style.textAlign='right';const sub=document.createElement('strong');sub.textContent=rupiah(x.price*x.qty);const controls=document.createElement('div');controls.className='cart-controls';[['−',-1],[''+x.qty,0],['+',1]].forEach(([label,delta])=>{const b=document.createElement('button');b.type='button';b.textContent=label;if(delta!==0)b.addEventListener('click',()=>{x.qty+=delta;if(x.qty<=0)cart.delete(x.key);render();});controls.appendChild(b);});const rm=document.createElement('button');rm.type='button';rm.className='cart-remove';rm.textContent='Hapus';rm.addEventListener('click',()=>{cart.delete(x.key);render();});controls.appendChild(rm);right.append(sub,controls);row.append(left,right);itemsEl.appendChild(row);});}
  function openModal(){if(!cart.size)return;modal.classList.add('open');modal.setAttribute('aria-hidden','false');msg.textContent='';}
  function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}
  checkoutBtn?.addEventListener('click',openModal);document.getElementById('checkoutClose')?.addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
  form.addEventListener('submit',async e=>{e.preventDefault();if(!cart.size)return;const fd=new FormData(form);const order={orderId:'BM-'+Date.now().toString(36).toUpperCase(),createdAt:new Date().toISOString(),customerName:String(fd.get('customerName')||'').trim(),phone:String(fd.get('phone')||'').trim(),orderType:String(fd.get('orderType')||'Takeaway'),notes:String(fd.get('notes')||'').trim(),items:[...cart.values()].map(x=>({name:x.name,price:x.price,qty:x.qty,subtotal:x.price*x.qty})),total:[...cart.values()].reduce((s,x)=>s+x.price*x.qty,0)};if(!order.customerName||!order.phone){msg.textContent='Mohon isi nama dan nomor WhatsApp.';return;}const text='Halo Bakmi Mulia, saya ingin memesan:%5Cn'+encodeURIComponent(order.items.map(x=>`${x.name} x${x.qty} — ${rupiah(x.subtotal)}`).join('\n'))+'%5CnTotal: '+encodeURIComponent(rupiah(order.total))+'%5CnNama: '+encodeURIComponent(order.customerName)+'%5CnWhatsApp: '+encodeURIComponent(order.phone)+'%5CnJenis: '+encodeURIComponent(order.orderType)+'%5CnCatatan: '+encodeURIComponent(order.notes)+'%5CnID: '+encodeURIComponent(order.orderId);
    if(APPS_SCRIPT_URL){try{msg.textContent='Mengirim pesanan…';const res=await fetch(APPS_SCRIPT_URL,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({action:'createOrder'},order))});const data=await res.json();if(!data.ok)throw new Error(data.message||'Gagal menyimpan');msg.textContent='Pesanan tersimpan dengan nomor '+order.orderId+'. WhatsApp akan dibuka untuk konfirmasi.';}catch(err){console.error('Order save error',err);msg.textContent='Belum berhasil menyimpan ke database ('+(err&&err.message?err.message:'error')+'). WhatsApp akan dibuka agar pesanan tidak hilang.';}}else{msg.textContent='URL Apps Script belum dipasang. Detail pesanan akan dibuka di WhatsApp.';}
    window.open('https://wa.me/'+WA_NUMBER+'?text='+text,'_blank','noopener');
  });
  render();
})();


/* ===== Admin Panel: logo 4x click + CRUD ===== */
(() => {
  const APPS_SCRIPT_URL = (typeof window.__BM_APPS_URL === 'string' ? window.__BM_APPS_URL : null)
    || document.querySelector('script[data-apps-url]')?.dataset.appsUrl
    || '';
  // Re-use the same URL constant from cart block if present in scope — fallback to reading from a data attribute or empty.
  // We look up the URL the same way the cart does: hardcode companion is set below via shared getter.
  function getApiUrl() {
    // Prefer the cart module's URL if it was assigned on window
    if (window.__BAKMI_API_URL) return window.__BAKMI_API_URL;
    // Fallback: try to parse from existing cart IIFE constant by checking a meta tag
    const meta = document.querySelector('meta[name="apps-script-url"]');
    if (meta && meta.content) return meta.content.trim();
    return window.__BAKMI_API_URL || '';
  }

  // Will be set by cart block after we patch it
  const TOKEN_KEY = 'bm_admin_token';
  let apiUrl = '';

  const loginModal = document.getElementById('adminLoginModal');
  const panel = document.getElementById('adminPanel');
  const detailModal = document.getElementById('adminDetailModal');
  const loginForm = document.getElementById('adminLoginForm');
  const loginMsg = document.getElementById('adminLoginMsg');
  const brand = document.querySelector('.brand');

  if (!loginModal || !panel || !brand) return;

  // ---- Logo 4-click (jendela 2.5 detik, prevent navigasi selama rangkaian) ----
  let clickCount = 0;
  let clickTimer = null;
  function onBrandActivate(e) {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 2500);
    if (clickCount >= 4) {
      e.preventDefault();
      e.stopPropagation();
      clickCount = 0;
      openLogin();
    } else if (clickCount > 1) {
      // cegah loncat ke #home di tengah rangkaian klik
      e.preventDefault();
    }
  }
  brand.addEventListener('click', onBrandActivate);
  // Tangkap juga klik pada child (span MULIA)
  brand.querySelectorAll('*').forEach(el => {
    el.addEventListener('click', (e) => { /* bubble ke brand */ });
  });

  function openLogin() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      openPanel();
      return;
    }
    loginModal.classList.add('open');
    loginModal.setAttribute('aria-hidden', 'false');
    loginMsg.textContent = '';
    loginMsg.classList.remove('error');
    setTimeout(() => document.getElementById('adminPassword')?.focus(), 100);
  }
  function closeLogin() {
    loginModal.classList.remove('open');
    loginModal.setAttribute('aria-hidden', 'true');
  }
  document.getElementById('adminLoginClose')?.addEventListener('click', closeLogin);
  loginModal.addEventListener('click', (e) => { if (e.target === loginModal) closeLogin(); });

  async function api(body) {
    const url = window.__BAKMI_API_URL || '';
    if (!url) throw new Error('URL Apps Script belum dipasang di script.js (APPS_SCRIPT_URL).');
    const res = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch (e) { throw new Error('Respons server tidak valid. Pastikan Web App di-deploy ulang dengan Code.gs terbaru.'); }
    if (!data.ok) throw new Error(data.message || 'Gagal');
    return data;
  }

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword')?.value || '';
    loginMsg.textContent = 'Memverifikasi…';
    loginMsg.classList.remove('error');
    try {
      const data = await api({ action: 'adminLogin', password });
      sessionStorage.setItem(TOKEN_KEY, data.token);
      closeLogin();
      openPanel();
    } catch (err) {
      loginMsg.textContent = err.message || 'Login gagal';
      loginMsg.classList.add('error');
    }
  });

  function token() { return sessionStorage.getItem(TOKEN_KEY) || ''; }

  function openPanel() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    refreshAll();
  }
  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.getElementById('adminLogout')?.addEventListener('click', async () => {
    try { await api({ action: 'adminLogout', token: token() }); } catch (_) {}
    sessionStorage.removeItem(TOKEN_KEY);
    closePanel();
  });
  document.getElementById('adminRefresh')?.addEventListener('click', refreshAll);

  const rupiah = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    .format(Number(n) || 0).replace(/\u00a0/g, ' ');

  function fmtDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
    } catch { return String(iso); }
  }

  async function refreshAll() {
    await Promise.all([loadStats(), loadOrders()]);
  }

  async function loadStats() {
    try {
      const data = await api({ action: 'stats', token: token() });
      const s = data.stats || {};
      document.getElementById('statTotal').textContent = s.total ?? 0;
      document.getElementById('statMenunggu').textContent = s.Menunggu ?? 0;
      document.getElementById('statDiproses').textContent = (s.Diproses ?? 0) + (s.Dikonfirmasi ?? 0);
      document.getElementById('statSelesai').textContent = s.Selesai ?? 0;
      document.getElementById('statRevenue').textContent = rupiah(data.revenue);
    } catch (err) {
      if (/sesi|login|password/i.test(err.message)) {
        sessionStorage.removeItem(TOKEN_KEY);
        closePanel();
        openLogin();
      }
    }
  }

  async function loadOrders() {
    const body = document.getElementById('adminOrdersBody');
    if (!body) return;
    body.innerHTML = '<tr><td colspan="8" class="admin-empty">Memuat…</td></tr>';
    try {
      const q = document.getElementById('adminSearch')?.value || '';
      const status = document.getElementById('adminStatusFilter')?.value || '';
      const data = await api({ action: 'listOrders', token: token(), q, status, limit: 200 });
      const orders = data.orders || [];
      if (!orders.length) {
        body.innerHTML = '<tr><td colspan="8" class="admin-empty">Belum ada pesanan.</td></tr>';
        return;
      }
      body.innerHTML = '';
      orders.forEach(o => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${esc(o.OrderID)}</code></td>
          <td>${esc(fmtDate(o.CreatedAt))}</td>
          <td>${esc(o.CustomerName)}</td>
          <td>${esc(o.Phone)}</td>
          <td>${esc(o.OrderType)}</td>
          <td>${esc(rupiah(o.Total))}</td>
          <td><span class="admin-status-pill ${esc(o.Status)}">${esc(o.Status)}</span></td>
          <td class="admin-row-actions">
            <button type="button" data-id="${esc(o.OrderID)}" class="btn-detail">Detail / Edit</button>
          </td>`;
        body.appendChild(tr);
      });
      body.querySelectorAll('.btn-detail').forEach(btn => {
        btn.addEventListener('click', () => openDetail(btn.dataset.id));
      });
    } catch (err) {
      body.innerHTML = `<tr><td colspan="8" class="admin-empty">${esc(err.message)}</td></tr>`;
      if (/sesi|login/i.test(err.message)) {
        sessionStorage.removeItem(TOKEN_KEY);
        closePanel();
        openLogin();
      }
    }
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  let searchTimer;
  document.getElementById('adminSearch')?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadOrders, 350);
  });
  document.getElementById('adminStatusFilter')?.addEventListener('change', loadOrders);

  // ---- Detail / Edit ----
  async function openDetail(orderId) {
    const msg = document.getElementById('adminDetailMsg');
    msg.textContent = 'Memuat…';
    msg.classList.remove('error');
    detailModal.classList.add('open');
    detailModal.setAttribute('aria-hidden', 'false');
    try {
      const data = await api({ action: 'getOrder', token: token(), orderId });
      const o = data.order;
      document.getElementById('adminDetailTitle').textContent = o.OrderID;
      document.getElementById('detailOrderId').value = o.OrderID;
      document.getElementById('detailName').value = o.CustomerName || '';
      document.getElementById('detailPhone').value = o.Phone || '';
      document.getElementById('detailType').value = o.OrderType || 'Takeaway';
      document.getElementById('detailStatus').value = o.Status || 'Menunggu';
      document.getElementById('detailNotes').value = o.Notes || '';
      document.getElementById('detailTotal').textContent = rupiah(o.Total);
      const itemsEl = document.getElementById('detailItems');
      itemsEl.innerHTML = (o.items || []).map(it =>
        `<div class="item-row"><span>${esc(it.MenuName)} × ${esc(it.Quantity)}</span><span>${esc(rupiah(it.Subtotal))}</span></div>`
      ).join('') || '<div class="item-row">Tidak ada item</div>';
      msg.textContent = '';
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add('error');
    }
  }

  function closeDetail() {
    detailModal.classList.remove('open');
    detailModal.setAttribute('aria-hidden', 'true');
  }
  document.getElementById('adminDetailClose')?.addEventListener('click', closeDetail);
  detailModal?.addEventListener('click', (e) => { if (e.target === detailModal) closeDetail(); });

  document.getElementById('adminDetailForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('adminDetailMsg');
    msg.textContent = 'Menyimpan…';
    msg.classList.remove('error');
    try {
      await api({
        action: 'updateOrder',
        token: token(),
        orderId: document.getElementById('detailOrderId').value,
        customerName: document.getElementById('detailName').value,
        phone: document.getElementById('detailPhone').value,
        orderType: document.getElementById('detailType').value,
        status: document.getElementById('detailStatus').value,
        notes: document.getElementById('detailNotes').value
      });
      msg.textContent = 'Perubahan disimpan.';
      loadOrders();
      loadStats();
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add('error');
    }
  });

  document.getElementById('adminDeleteOrder')?.addEventListener('click', async () => {
    const orderId = document.getElementById('detailOrderId').value;
    if (!orderId) return;
    if (!confirm('Hapus pesanan ' + orderId + ' secara permanen?')) return;
    const msg = document.getElementById('adminDetailMsg');
    try {
      await api({ action: 'deleteOrder', token: token(), orderId });
      closeDetail();
      loadOrders();
      loadStats();
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add('error');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (detailModal?.classList.contains('open')) closeDetail();
      else if (loginModal?.classList.contains('open')) closeLogin();
    }
  });
})();
