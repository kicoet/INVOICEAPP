// ===== Root App — sidebar, routing, toasts, tweaks =====
const { useState, useEffect, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "obsidian",
  "density": "comfortable",
  "showSpark": true
}/*EDITMODE-END*/;

// Persistent collection hook — syncs a state slice to localStorage and
// keeps KPO.<key> in sync so existing screens that read KPO.* see fresh data.
function usePersistedCollection(key, initial) {
  const [val, setVal] = useState(() => KPO.loadCollection(key, initial));
  useEffect(() => {
    KPO.saveCollection(key, val);
    if (KPO[key] && Array.isArray(KPO[key])) {
      KPO[key].length = 0;
      val.forEach(v => KPO[key].push(v));
    } else {
      KPO[key] = val;
    }
  }, [key, val]);
  return [val, setVal];
}

function App() {
  // Restore session from localStorage (so refresh doesn't kick to login)
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kpo:v1:session') || 'null'); } catch { return null; }
  });
  const authed = !!user;
  const role = user?.role || 'owner';
  const setAuthed = (v) => { if (!v) { localStorage.removeItem('kpo:v1:session'); setUser(null); } };

  const [route, setRoute] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [pdfFor, setPdfFor] = useState(null);
  const [creating, setCreating] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [brand, setBrand] = usePersistedCollection('brand', KPO.defaultBrand);
  const [invoices, setInvoices] = usePersistedCollection('invoices', []);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', t.theme);
  }, [t.theme]);

  const pushToast = useCallback((t) => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, ...t }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 5500);
  }, []);

  const onLogin = (r, u) => {
    const session = u || { username: 'owner', role: r, name: 'Owner' };
    localStorage.setItem('kpo:v1:session', JSON.stringify(session));
    setUser(session);
  };

  if (!authed) return <><LoginScreen onLogin={onLogin}/><TweaksPanel title="Tweaks"><Tweaks t={t} setTweak={setTweak}/></TweaksPanel></>;

  const unpaidCount = invoices.filter(i => i.status !== 'Lunas').length;
  const pendingTaskCount = (KPO.tasks || []).filter(t => t.status === 'pending').length;
  const unreadNotifs = (KPO.notifs || []).filter(n => n.unread).length;
  const nav = [
    { id:'dashboard', icon:'dashboard', label:'Dashboard' },
    { id:'invoices',  icon:'invoice',   label:'Invoice', badge: unpaidCount || undefined },
    { id:'edit-template', icon:'edit', label:'Edit Template' },
    { id:'products',  icon:'box',       label:'Produk' },
    { id:'stock',     icon:'stock',     label:'Stock' },
    { id:'tasks',     icon:'tasks',     label:'Tugas', badge: pendingTaskCount || undefined },
    { id:'customers', icon:'user',      label:'Customer' },
    { id:'notifs',    icon:'bell',      label:'Notifikasi', badge: unreadNotifs || undefined },
    { id:'settings',  icon:'settings',  label:'Pengaturan' },
  ];

  const titles = {
    dashboard: { crumb:'Owner · Beranda', title:'Dashboard' },
    invoices:  { crumb:'Operasional', title: creating ? 'Buat Invoice Baru' : 'Invoice' },
    'edit-template': { crumb:'Operasional', title:'Edit Template Invoice' },
    products:  { crumb:'Katalog', title:'Produk' },
    stock:     { crumb:'Operasional', title:'Stock & Inventory' },
    tasks:     { crumb:'Tim', title:'Task Management' },
    customers: { crumb:'Relasi', title:'Customer' },
    notifs:    { crumb:'Akun', title:'Notifikasi' },
    settings:  { crumb:'Akun', title:'Pengaturan' },
  };

  return (
    <div className="app" data-screen-label="Kemala Profile Office">
      <div className={'sidebar-scrim'+(menuOpen?' show':'')} onClick={()=>setMenuOpen(false)}/>
      <aside className={'sidebar'+(menuOpen?' open':'')}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-mark">K</div>
            <div>
              <div className="brand-name">Kemala</div>
              <div className="brand-sub">PROFILE OFFICE</div>
            </div>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-label">Workspace</div>
          {nav.slice(0,6).map(n => (
            <div key={n.id} className={'nav-item'+(route===n.id?' active':'')} onClick={()=>{ setRoute(n.id); setCreating(false); setMenuOpen(false); }}>
              <Icon name={n.icon} size={15} className="nav-icon"/>
              <span>{n.label}</span>
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </div>
          ))}

          <div className="nav-label" style={{marginTop:18}}>Lainnya</div>
          {nav.slice(6).map(n => (
            <div key={n.id} className={'nav-item'+(route===n.id?' active':'')} onClick={()=>{ setRoute(n.id); setCreating(false); setMenuOpen(false); }}>
              <Icon name={n.icon} size={15} className="nav-icon"/>
              <span>{n.label}</span>
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="avatar">{(user?.name || user?.username || 'U').slice(0,2).toUpperCase()}</div>
          <div style={{flex:1,minWidth:0}}>
            <div className="user-name">{user?.name || user?.username}</div>
            <div className="user-role">{role}</div>
          </div>
          <button className="btn btn-ghost btn-icon" title="Keluar" onClick={()=>setAuthed(false)}><Icon name="close" size={14}/></button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu-btn" aria-label="Menu" onClick={()=>setMenuOpen(o=>!o)}>
            <Icon name="menu" size={18}/>
          </button>
          <div>
            <span className="crumb">{titles[route].crumb}</span>
            <h1>{titles[route].title}</h1>
          </div>
          <div className="topbar-actions">
            <div style={{position:'relative',width:280}}>
              <input className="input" placeholder="Cari invoice, produk, customer…" style={{paddingLeft:32}}/>
              <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--ink-dim)'}}><Icon name="search" size={14}/></span>
              <span style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',fontSize:10,color:'var(--ink-dim)',border:'1px solid var(--line)',borderRadius:3,padding:'1px 5px'}} className="num">⌘K</span>
            </div>
            <button className="btn btn-icon btn-ghost" onClick={()=>setRoute('notifs')}><Icon name="bell" size={15}/></button>
            <button className="btn btn-primary" onClick={()=>{ setRoute('invoices'); setCreating(true); }}><Icon name="plus" size={14}/> Buat Invoice</button>
          </div>
        </header>

        <div className="content">
          {route==='dashboard' && <Dashboard/>}
          {route==='invoices' && !creating && <InvoicesScreen invoices={invoices} goCreate={()=>setCreating(true)} goView={(id)=>{
            const inv = invoices.find(x=>x.id===id);
            if (!inv) return;
            const total = inv.items.reduce((s,it)=>s+it.qty*it.harga,0) + (inv.ongkir||0) + (inv.biayaTambahan||0);
            const due = new Date(inv.tgl); due.setDate(due.getDate()+14);
            setPdfFor({ invNo: inv.id, customer: inv.customer, items: inv.items, ongkir: inv.ongkir, biayaTambahan: inv.biayaTambahan, catatan: inv.catatan, total, tanggal: inv.tgl, jatuhTempo: due.toISOString().slice(0,10), pembayaran: inv.pembayaran });
          }}/>}
          {route==='invoices' && creating && <CreateInvoice
            invoices={invoices}
            onCancel={()=>setCreating(false)}
            onSave={(payload)=>{
              const today = new Date();
              const tglStr = today.toISOString().slice(0,10);
              // Guarantee uniqueness even if user races saves
              let invNo = payload.invNo;
              if (invoices.some(x => x.id === invNo)) {
                invNo = KPO.nextInvNo(payload.prefix || 'INV', invoices);
              }
              const newInv = {
                id: invNo,
                tgl: tglStr,
                customer: payload.customer,
                items: payload.items.map(it => ({ nama: it.nama, ukuran: it.ukuran || '', qty: +it.qty || 0, harga: +it.harga || 0, kategori: it.kategori })),
                ongkir: +payload.ongkir || 0,
                biayaTambahan: +payload.biayaTambahan || 0,
                catatan: payload.catatan || '',
                pembayaran: [],
                status: 'Belum Bayar',
              };
              setInvoices([newInv, ...invoices]);
              setCreating(false);
              pushToast({ title:'Invoice tersimpan', body: invNo + ' · ' + KPO.fmtIDR(payload.total) });
              const due = new Date(today); due.setDate(due.getDate()+14);
              setPdfFor({ ...payload, invNo, tanggal: tglStr, jatuhTempo: due.toISOString().slice(0,10), pembayaran: [] });
            }}/>}
          {route==='edit-template' && <EditTemplateScreen brand={brand} setBrand={setBrand} pushToast={pushToast}/>}
          {route==='products' && <ProductsScreen/>}
          {route==='stock' && <StockScreen/>}
          {route==='tasks' && <TasksScreen pushToast={pushToast}/>}
          {route==='customers' && <CustomersScreen/>}
          {route==='notifs' && <NotificationsScreen/>}
          {route==='settings' && <SettingsScreen brand={brand} setBrand={setBrand} pushToast={pushToast}/>}
        </div>
      </main>

      {/* Toasts */}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <div style={{width:28,height:28,borderRadius:6,background:'var(--accent-soft)',color:'var(--accent)',display:'grid',placeItems:'center'}}><Icon name="bell" size={14}/></div>
            <div style={{flex:1,minWidth:0}}>
              <div className="toast-title">{t.title}</div>
              <div className="toast-body">{t.body}</div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={()=>setToasts(ts=>ts.filter(x=>x.id!==t.id))}><Icon name="close" size={12}/></button>
          </div>
        ))}
      </div>

      {/* PDF Modal */}
      {pdfFor && <PdfPreviewModal inv={pdfFor} brand={brand} onClose={()=>setPdfFor(null)}/>}

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <Tweaks t={t} setTweak={setTweak}/>
      </TweaksPanel>
    </div>
  );
}

function Tweaks({ t, setTweak }) {
  return (
    <>
      <TweakSection label="Tema visual">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {[
            { id:'obsidian', name:'Obsidian', sub:'Dark luxury', sw:['#0a0a0a','#c9a96e','#ece6d8'] },
            { id:'bone', name:'Bone', sub:'Light luxury', sw:['#f5f2ec','#8b6f47','#1a1a1a'] },
            { id:'concrete', name:'Concrete', sub:'Cool industrial', sw:['#f4f5f7','#0f1e3a','#2e5d8a'] },
          ].map(opt => (
            <button key={opt.id} onClick={()=>setTweak('theme', opt.id)} className="card" style={{padding:8,cursor:'pointer',border:t.theme===opt.id?'1px solid var(--accent)':'1px solid var(--line)',textAlign:'left',background:'var(--bg-elev)'}}>
              <div style={{display:'flex',gap:3,marginBottom:6}}>
                {opt.sw.map((c,i)=><div key={i} style={{flex:1,height:18,background:c,borderRadius:2}}/>)}
              </div>
              <div style={{fontSize:11,fontWeight:500}}>{opt.name}</div>
              <div style={{fontSize:10,color:'var(--ink-mute)'}}>{opt.sub}</div>
            </button>
          ))}
        </div>
      </TweakSection>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
