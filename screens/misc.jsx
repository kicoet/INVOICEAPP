// ===== Notifications, Settings (signatures), Customers, Login =====
const { useState: useStateMisc, useEffect: useEffectMisc } = React;

function NotificationsScreen() {
  const { notifs } = KPO;
  const [tab, setTab] = useStateMisc('semua');
  const list = tab==='semua' ? notifs : tab==='unread' ? notifs.filter(n=>n.unread) : notifs.filter(n=>n.tipe===tab);
  const iconFor = (t) => t==='task' ? 'tasks' : t==='invoice' ? 'invoice' : 'box';

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div className="card" style={{padding:'12px 14px',display:'flex',gap:10,alignItems:'center'}}>
        <div className="seg">
          {[['semua','Semua'],['unread','Belum dibaca'],['task','Tugas'],['invoice','Invoice'],['stock','Stock']].map(([k,l])=>(
            <button key={k} className={tab===k?'active':''} onClick={()=>setTab(k)}>{l}</button>
          ))}
        </div>
        <button className="btn btn-sm" style={{marginLeft:'auto'}}><Icon name="check" size={13}/> Tandai semua dibaca</button>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        {list.map(n => (
          <div key={n.id} style={{display:'grid',gridTemplateColumns:'auto 1fr auto',gap:14,padding:'14px 18px',borderBottom:'1px solid var(--line)',alignItems:'flex-start',background: n.unread?'color-mix(in srgb, var(--accent) 4%, transparent)':'transparent'}}>
            <div style={{width:32,height:32,borderRadius:6,background:'var(--bg-inset)',display:'grid',placeItems:'center',color:'var(--accent)'}}>
              <Icon name={iconFor(n.tipe)} size={15}/>
            </div>
            <div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <span style={{fontSize:13,fontWeight: n.unread?500:400}}>{n.judul}</span>
                {n.unread && <span className="dot" style={{background:'var(--accent)'}}/>}
              </div>
              <div style={{fontSize:12,color:'var(--ink-mute)',marginTop:2}}>{n.body}</div>
            </div>
            <div style={{fontSize:11,color:'var(--ink-dim)',whiteSpace:'nowrap'}}>{n.waktu}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomersScreen() {
  const { customers, fmtIDR } = KPO;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div className="card" style={{padding:'12px 14px',display:'flex',gap:10}}>
        <div style={{flex:1,maxWidth:380,position:'relative'}}>
          <input className="input" placeholder="Cari nama, perusahaan, WA…" style={{paddingLeft:30}}/>
          <span style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'var(--ink-dim)'}}><Icon name="search" size={13}/></span>
        </div>
        <button className="btn btn-primary" style={{marginLeft:'auto'}}><Icon name="plus" size={14}/> Tambah Customer</button>
      </div>
      <div className="grid-3">
        {customers.map(c => (
          <div key={c.id} className="card" style={{padding:'18px 18px'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div className="avatar">{c.nama.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
              <div>
                <div style={{fontSize:14}}>{c.nama}</div>
                <div style={{fontSize:11,color:'var(--ink-mute)'}}>{c.perusahaan}</div>
              </div>
            </div>
            <hr className="hr"/>
            <div style={{fontSize:12,color:'var(--ink-mute)',lineHeight:1.7}}>
              <div style={{display:'flex',gap:8}}><span style={{width:60,color:'var(--ink-dim)'}}>WA</span><span className="num">{c.wa}</span></div>
              <div style={{display:'flex',gap:8,alignItems:'flex-start'}}><span style={{width:60,color:'var(--ink-dim)'}}>Alamat</span><span style={{flex:1}}>{c.alamat}</span></div>
            </div>
            <div style={{display:'flex',gap:8,marginTop:14}}>
              <button className="btn btn-sm" style={{flex:1}}><Icon name="invoice" size={12}/> Riwayat</button>
              <button className="btn btn-sm" style={{flex:1}}><Icon name="plus" size={12}/> Invoice</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsScreen({ brand, setBrand, pushToast }) {
  const [section, setSection] = useStateMisc('profil');
  const update = (patch) => setBrand({...brand, ...patch});

  const SECTIONS = [
    { id:'profil',    label:'Profil Perusahaan', icon:'box' },
    { id:'bank',      label:'Rekening Bank',     icon:'money' },
    { id:'penomoran', label:'Penomoran Invoice', icon:'invoice' },
    { id:'signature', label:'Tanda Tangan',      icon:'pen' },
    { id:'template',  label:'Template Invoice',  icon:'edit' },
    { id:'users',     label:'Pengguna & Role',   icon:'user' },
    { id:'notif',     label:'Notifikasi',        icon:'bell' },
    { id:'backup',    label:'Backup & Export',   icon:'download' },
  ];

  return (
    <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:24}}>
      <div style={{display:'flex',flexDirection:'column',gap:2}}>
        {SECTIONS.map(s => (
          <div key={s.id} className={'nav-item'+(section===s.id?' active':'')} onClick={()=>setSection(s.id)}>
            <Icon name={s.icon} size={14} className="nav-icon"/>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {section==='profil' && <ProfilSection brand={brand} update={update} pushToast={pushToast}/>}
        {section==='bank' && <BankSection brand={brand} update={update} pushToast={pushToast}/>}
        {section==='penomoran' && <PenomoranSection brand={brand} update={update} pushToast={pushToast}/>}
        {section==='signature' && <SignatureSection brand={brand} update={update} pushToast={pushToast}/>}
        {section==='template' && <TemplateSection brand={brand} update={update} pushToast={pushToast}/>}
        {section==='users' && <PlaceholderSection title="Pengguna & Role" desc="Kelola Owner & Staff yang dapat mengakses sistem."/>}
        {section==='notif' && <PlaceholderSection title="Notifikasi" desc="Atur kanal & jenis notifikasi yang diterima."/>}
        {section==='backup' && <PlaceholderSection title="Backup & Export" desc="Export data invoice, produk, dan customer."/>}
      </div>
    </div>
  );
}

function SectionHead({ title, desc, onSave, saving }) {
  return (
    <div className="section-head" style={{margin:0,marginBottom:8}}>
      <h2>{title}</h2>
      <span className="meta">{desc}</span>
      {onSave && <div className="actions"><button className="btn btn-primary" onClick={onSave}><Icon name="check" size={13}/> {saving?'Tersimpan':'Simpan Perubahan'}</button></div>}
    </div>
  );
}

function FieldRow({ label, sub, children }) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:18,padding:'14px 0',borderBottom:'1px solid var(--line)',alignItems:'flex-start'}}>
      <div>
        <div style={{fontSize:13}}>{label}</div>
        {sub && <div style={{fontSize:11,color:'var(--ink-mute)',marginTop:2,lineHeight:1.5}}>{sub}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ProfilSection({ brand, update, pushToast }) {
  return (
    <>
      <SectionHead title="Profil Perusahaan" desc="Informasi yang muncul di header invoice PDF" onSave={()=>pushToast({title:'Profil tersimpan',body:'Perubahan langsung diterapkan ke template invoice.'})}/>
      <div className="card">
        <div className="card-body" style={{padding:0}}>
          <div style={{padding:'0 18px'}}>
            <FieldRow label="Nama perusahaan" sub="Tampil di header invoice (judul)">
              <input className="input" value={brand.name} onChange={e=>update({name:e.target.value})}/>
            </FieldRow>
            <FieldRow label="Alamat lengkap">
              <input className="input" value={brand.address} onChange={e=>update({address:e.target.value})}/>
            </FieldRow>
            <FieldRow label="Telepon">
              <input className="input" value={brand.phone} onChange={e=>update({phone:e.target.value})}/>
            </FieldRow>
            <FieldRow label="Email">
              <input className="input" value={brand.email} onChange={e=>update({email:e.target.value})}/>
            </FieldRow>
            <FieldRow label="NPWP" sub="Format: XX.XXX.XXX.X-XXX.XXX">
              <input className="input num" value={brand.npwp} onChange={e=>update({npwp:e.target.value})}/>
            </FieldRow>
            <FieldRow label="Nama direktur" sub="Tertulis di bawah tanda tangan">
              <input className="input" value={brand.directorName} onChange={e=>update({directorName:e.target.value})}/>
            </FieldRow>
            <FieldRow label="Website / Footer">
              <input className="input" value={brand.website} onChange={e=>update({website:e.target.value})}/>
            </FieldRow>
            <div style={{padding:'14px 0',display:'grid',gridTemplateColumns:'200px 1fr',gap:18,alignItems:'flex-start'}}>
              <div><div style={{fontSize:13}}>Social media footer</div></div>
              <div><input className="input" value={brand.social} onChange={e=>update({social:e.target.value})}/></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function BankSection({ brand, update, pushToast }) {
  const banks = ['BCA','Mandiri','BNI','BRI','CIMB','Permata'];
  return (
    <>
      <SectionHead title="Rekening Bank" desc="Tertera di footer invoice sebagai instruksi pembayaran" onSave={()=>pushToast({title:'Rekening tersimpan',body:brand.bankName+' '+brand.bankAccount})}/>
      <div className="card">
        <div className="card-body" style={{padding:0}}>
          <div style={{padding:'0 18px'}}>
            <FieldRow label="Bank" sub="Pilih bank tujuan transfer">
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {banks.map(b => (
                  <button key={b} className={'btn btn-sm '+(brand.bankName===b?'btn-primary':'')} onClick={()=>update({bankName:b})}>{b}</button>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Nomor rekening">
              <input className="input num" value={brand.bankAccount} onChange={e=>update({bankAccount:e.target.value})} placeholder="728-036-6199"/>
            </FieldRow>
            <FieldRow label="Atas nama">
              <input className="input" value={brand.bankHolder} onChange={e=>update({bankHolder:e.target.value})}/>
            </FieldRow>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="card">
        <div className="card-header"><div className="card-title">Pratinjau di invoice</div></div>
        <div className="card-body" style={{background:'#fff'}}>
          <div style={{color:'#1c1c1c'}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.04em'}}>REKENING RESMI PEMBAYARAN:</div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginTop:8}}>
              <div style={{background:'#fff',border:'1px solid #ddd',padding:'3px 8px',borderRadius:4,display:'inline-flex'}}>
                <span style={{color:'#0f4ba8',fontWeight:900,fontStyle:'italic',fontSize:18}}>{brand.bankName}</span>
              </div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:brand.brandColor}} className="num">{brand.bankAccount}</div>
                <div style={{fontSize:10,color:'#666'}}>a.n {brand.bankHolder}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PenomoranSection({ brand, update, pushToast }) {
  const [example, setExample] = useStateMisc({kat:'SPC',no:'001'});
  return (
    <>
      <SectionHead title="Penomoran Invoice" desc="Format otomatis untuk setiap invoice baru" onSave={()=>pushToast({title:'Format penomoran diperbarui'})}/>
      <div className="card">
        <div className="card-body" style={{padding:0}}>
          <div style={{padding:'0 18px'}}>
            <FieldRow label="Prefix" sub="ID, INV, KPO, dsb">
              <input className="input" value={brand.invoicePrefix} onChange={e=>update({invoicePrefix:e.target.value.toUpperCase()})} style={{maxWidth:160}}/>
            </FieldRow>
            <FieldRow label="Format" sub={'Hasil: '+brand.invoicePrefix+'/'+example.kat+'/V/'+example.no}>
              <div className="num" style={{fontSize:14,padding:'8px 12px',background:'var(--bg-inset)',border:'1px solid var(--line)',borderRadius:6,display:'inline-block'}}>
                {brand.invoicePrefix} <span style={{color:'var(--ink-mute)'}}>/</span> [Kategori] <span style={{color:'var(--ink-mute)'}}>/</span> [Bulan] <span style={{color:'var(--ink-mute)'}}>/</span> [Nomor]
              </div>
            </FieldRow>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Contoh hasil</div></div>
        <div className="card-body" style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {['PLINT','PARQUET','SPC','VINYL'].map(k => (
            <div key={k} className="chip num" style={{fontSize:12,padding:'6px 12px'}}>{brand.invoicePrefix}/{k}/V/001</div>
          ))}
        </div>
      </div>
    </>
  );
}

function SignatureSection({ brand, update, pushToast }) {
  const [drawing, setDrawing] = useStateMisc(false);
  const [draft, setDraft] = useStateMisc(null);
  const fileRef = React.useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { update({signatureImg: reader.result}); pushToast({title:'Tanda tangan diperbarui'}); };
    reader.readAsDataURL(f);
  };

  return (
    <>
      <SectionHead title="Tanda Tangan" desc="Tanda tangan paten — akan otomatis dicantumkan di semua invoice"/>
      <div className="card">
        <div className="card-body" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,alignItems:'flex-start'}}>
          <div>
            <div style={{fontSize:11,color:'var(--ink-mute)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:8}}>Tanda tangan aktif</div>
            <div style={{background:'#fff',border:'1px solid var(--line)',borderRadius:8,padding:18,minHeight:140,display:'grid',placeItems:'center'}}>
              {brand.signatureImg
                ? <img src={brand.signatureImg} style={{maxHeight:100,maxWidth:'100%'}}/>
                : <span style={{fontSize:11,color:'#aaa',fontStyle:'italic'}}>Belum ada tanda tangan</span>}
            </div>
            <div style={{marginTop:10,fontSize:13,color:'var(--ink)'}}>{brand.directorName}</div>
            <div style={{fontSize:11,color:'var(--ink-mute)'}}>Direktur</div>
          </div>

          <div>
            <div style={{fontSize:11,color:'var(--ink-mute)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:8}}>Ganti tanda tangan</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <button className="btn" onClick={()=>fileRef.current.click()}><Icon name="upload" size={13}/> Upload foto tanda tangan</button>
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
              <button className="btn" onClick={()=>{setDrawing(true);setDraft(null);}}><Icon name="pen" size={13}/> Gambar tanda tangan baru</button>
              <button className="btn btn-ghost" style={{color:'var(--negative)'}} onClick={()=>update({signatureImg:null})} disabled={!brand.signatureImg}><Icon name="trash" size={13}/> Hapus tanda tangan</button>
            </div>
            <div style={{fontSize:11,color:'var(--ink-mute)',marginTop:14,lineHeight:1.5,padding:'10px 12px',background:'var(--accent-soft)',borderRadius:6}}>
              <b style={{color:'var(--ink)'}}>Catatan:</b> tanda tangan ini akan otomatis tercetak di semua invoice baru yang dibuat. Untuk invoice satu-kali yang berbeda, edit langsung di pratinjau PDF.
            </div>
          </div>
        </div>

        {drawing && (
          <div style={{borderTop:'1px solid var(--line)',padding:18}}>
            <div style={{fontSize:11,color:'var(--ink-mute)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:8}}>Gambar tanda tangan baru</div>
            <SignaturePad value={draft} onChange={setDraft}/>
            <div style={{display:'flex',gap:8,marginTop:12}}>
              <button className="btn" onClick={()=>{setDrawing(false);setDraft(null);}}>Batal</button>
              <button className="btn btn-primary" style={{marginLeft:'auto'}} disabled={!draft} onClick={()=>{ update({signatureImg:draft}); setDrawing(false); setDraft(null); pushToast({title:'Tanda tangan diperbarui'}); }}><Icon name="check" size={13}/> Simpan & paten</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function TemplateSection({ brand, update, pushToast }) {
  const templates = [
    { id:'kemala', name:'Kemala Brand', sub:'Template resmi perusahaan' },
  ];
  const swatches = [
    { color:'#A14A14', dark:'#7E3A0E', soft:'#FDF6EE', name:'Terracotta (default)' },
    { color:'#1F4E3F', dark:'#143028', soft:'#EAF2EE', name:'Hutan' },
    { color:'#1E3A8A', dark:'#152958', soft:'#E8EDF7', name:'Navy' },
    { color:'#7C3AED', dark:'#5B22B8', soft:'#F0E8FB', name:'Ungu' },
    { color:'#0F172A', dark:'#020617', soft:'#E8EAEF', name:'Charcoal' },
  ];
  return (
    <>
      <SectionHead title="Template Invoice" desc="Pilih template default & warna brand untuk PDF"/>

      <div className="card">
        <div className="card-header"><div className="card-title">Template default</div><div className="card-sub" style={{marginLeft:'auto'}}>Setiap invoice baru pakai template ini</div></div>
        <div className="card-body" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {templates.map(t => (
            <button key={t.id} onClick={()=>{update({defaultTemplate:t.id});pushToast({title:'Template default diubah', body:t.name});}} className="card" style={{cursor:'pointer',padding:0,border:brand.defaultTemplate===t.id?'1px solid var(--accent)':'1px solid var(--line)',background:'var(--bg-elev)',textAlign:'left'}}>
              <div style={{height:120,background:'var(--bg-inset)',borderBottom:'1px solid var(--line)',overflow:'hidden'}}>
                <TemplateThumb id={t.id}/>
              </div>
              <div style={{padding:'10px 14px'}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:13.5}}>{t.name}</span>
                  {brand.defaultTemplate===t.id && <span style={{fontSize:9,color:'var(--accent)',border:'1px solid var(--accent)',padding:'1px 5px',borderRadius:3,letterSpacing:'0.1em',marginLeft:'auto'}}>AKTIF</span>}
                </div>
                <div style={{fontSize:11,color:'var(--ink-mute)',marginTop:2}}>{t.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Warna brand pada template</div><div className="card-sub" style={{marginLeft:'auto'}}>Header bar, aksen, dan total</div></div>
        <div className="card-body" style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {swatches.map(s => (
            <button key={s.color} onClick={()=>update({brandColor:s.color,brandColorDark:s.dark,brandColorSoft:s.soft})} className="card" style={{cursor:'pointer',padding:10,border:brand.brandColor===s.color?'2px solid var(--accent)':'1px solid var(--line)',background:'var(--bg-elev)',display:'flex',flexDirection:'column',gap:8,minWidth:140,alignItems:'flex-start'}}>
              <div style={{display:'flex',gap:3,width:'100%'}}>
                <div style={{flex:2,height:22,background:s.color,borderRadius:3}}/>
                <div style={{flex:1,height:22,background:s.dark,borderRadius:3}}/>
                <div style={{flex:1,height:22,background:s.soft,borderRadius:3,border:'1px solid var(--line)'}}/>
              </div>
              <div style={{fontSize:11.5}}>{s.name}</div>
              <div className="num" style={{fontSize:10,color:'var(--ink-mute)'}}>{s.color}</div>
            </button>
          ))}
        </div>
        <div style={{padding:'0 18px 18px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
            <div className="field"><label className="field-label">Primary</label><input className="input num" value={brand.brandColor} onChange={e=>update({brandColor:e.target.value})}/></div>
            <div className="field"><label className="field-label">Dark</label><input className="input num" value={brand.brandColorDark} onChange={e=>update({brandColorDark:e.target.value})}/></div>
            <div className="field"><label className="field-label">Soft</label><input className="input num" value={brand.brandColorSoft} onChange={e=>update({brandColorSoft:e.target.value})}/></div>
          </div>
        </div>
      </div>
    </>
  );
}

function PlaceholderSection({ title, desc }) {
  return (
    <>
      <SectionHead title={title} desc={desc}/>
      <div className="card">
        <div className="card-body" style={{padding:40,textAlign:'center',color:'var(--ink-mute)'}}>
          <Icon name="sparkle" size={28}/>
          <div style={{marginTop:10,fontSize:13}}>Coming soon.</div>
          <div style={{fontSize:11,marginTop:4}}>Bagian ini akan tersedia di iterasi berikutnya.</div>
        </div>
      </div>
    </>
  );
}

function LoginScreen({ onLogin }) {
  const [role, setRole] = useStateMisc('owner');
  const [username, setUsername] = useStateMisc('');
  const [password, setPassword] = useStateMisc('');
  const [err, setErr] = useStateMisc('');
  const submit = () => {
    const u = KPO.authenticate(username, password);
    if (!u) { setErr('Username atau password salah.'); return; }
    setErr('');
    onLogin(u.role, u);
  };
  return (
    <div className="login-stage" style={{background:'var(--bg)'}}>
      <div className="login-art">
        {/* Editorial composition */}
        <div style={{position:'absolute',inset:0,padding:'52px 52px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,border:'1px solid var(--accent)',display:'grid',placeItems:'center',color:'var(--accent)',fontFamily:"'Instrument Serif', serif",fontStyle:'italic',fontSize:22}}>K</div>
            <div>
              <div style={{fontFamily:"'Instrument Serif', serif",fontSize:20,lineHeight:1}}>Kemala Profile Office</div>
              <div style={{fontSize:9,letterSpacing:'0.26em',color:'var(--ink-mute)',marginTop:4}}>INTERIOR PROFILE · JAKARTA</div>
            </div>
          </div>

          <div>
            <div style={{fontFamily:"'Instrument Serif', serif",fontSize:54,lineHeight:1.05,maxWidth:480}}>
              Profil pekerjaan,<br/>tertata dengan <i style={{color:'var(--accent)'}}>presisi</i>.
            </div>
            <div style={{fontSize:13,color:'var(--ink-mute)',marginTop:18,maxWidth:420,lineHeight:1.6}}>
              Sistem invoice, stock, dan task management terintegrasi untuk operasional showroom Plint, Parquet, SPC, dan Vinyl.
            </div>
          </div>

          <div style={{display:'flex',gap:24,fontSize:11,color:'var(--ink-mute)',letterSpacing:'0.14em',textTransform:'uppercase'}}>
            <span>v1.0 · Owner Edition</span>
            <span>·</span>
            <span>Realtime Sync</span>
            <span>·</span>
            <span>PWA Ready</span>
          </div>
        </div>

        {/* decorative grid pattern */}
        <svg width="100%" height="100%" style={{position:'absolute',inset:0,opacity:.04,pointerEvents:'none'}}>
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      <div className="login-form-wrap">
        <div className="login-form">
          <div style={{fontSize:11,letterSpacing:'0.22em',color:'var(--ink-mute)',textTransform:'uppercase'}}>Masuk ke akun anda</div>
          <div className="font-serif" style={{fontSize:32,marginTop:4,marginBottom:18}}>Selamat datang kembali</div>

          <div className="field" style={{marginBottom:12}}>
            <label className="field-label">Username</label>
            <input className="input" autoComplete="username" placeholder="hani" value={username} onChange={e=>{setUsername(e.target.value); setErr('');}} onKeyDown={e=>{ if(e.key==='Enter') submit(); }}/>
          </div>
          <div className="field" style={{marginBottom:err?6:16}}>
            <label className="field-label">Password</label>
            <input className="input" autoComplete="current-password" type="password" placeholder="••••••••" value={password} onChange={e=>{setPassword(e.target.value); setErr('');}} onKeyDown={e=>{ if(e.key==='Enter') submit(); }}/>
          </div>
          {err && <div style={{fontSize:12,color:'var(--negative)',marginBottom:12}}>{err}</div>}

          <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'10px 14px'}} onClick={submit}>
            Masuk <Icon name="arrowRight" size={14}/>
          </button>

          <div style={{textAlign:'center',marginTop:16,fontSize:11,color:'var(--ink-mute)'}}>
            Akses hanya untuk pemilik & staff terdaftar.
          </div>
        </div>
      </div>
    </div>
  );
}

window.NotificationsScreen = NotificationsScreen;
window.CustomersScreen = CustomersScreen;
window.SettingsScreen = SettingsScreen;
window.LoginScreen = LoginScreen;
