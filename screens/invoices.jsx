// ===== Invoices list + Create modal + PDF preview =====
const { useState: useStateInv, useMemo: useMemoInv, useRef: useRefInv, useEffect: useEffectInv } = React;

function InvoicesScreen({ goCreate, goView, invoices }) {
  const { fmtIDR, computeInvoice } = KPO;
  const data = invoices || KPO.invoices || [];
  const [q, setQ] = useStateInv('');
  const [status, setStatus] = useStateInv('Semua');

  const list = data.filter(inv => {
    const c = computeInvoice(inv);
    const matchQ = !q || inv.id.toLowerCase().includes(q.toLowerCase()) || inv.customer.nama.toLowerCase().includes(q.toLowerCase()) || inv.customer.perusahaan.toLowerCase().includes(q.toLowerCase());
    const matchS = status==='Semua' || inv.status===status;
    return matchQ && matchS;
  });

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Filter bar */}
      <div className="card" style={{padding:'12px 14px',display:'flex',gap:10,alignItems:'center'}}>
        <div style={{position:'relative',flex:1,maxWidth:380}}>
          <input className="input" placeholder="Cari no. invoice, customer, perusahaan…" value={q} onChange={e=>setQ(e.target.value)} style={{paddingLeft:34}}/>
          <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ink-dim)',pointerEvents:'none'}}><Icon name="search" size={14}/></span>
        </div>
        <div className="seg">
          {['Semua','Lunas','DP','Belum Bayar'].map(s=>(
            <button key={s} className={status===s?'active':''} onClick={()=>setStatus(s)}>{s}</button>
          ))}
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button className="btn btn-sm"><Icon name="calendar" size={13}/> Mei 2026</button>
          <button className="btn btn-sm"><Icon name="filter" size={13}/> Filter</button>
          <button className="btn btn-primary" onClick={goCreate}><Icon name="plus" size={14}/> Buat Invoice</button>
        </div>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width:160}}>No. Invoice</th>
              <th>Customer</th>
              <th>Tanggal</th>
              <th>Items</th>
              <th style={{textAlign:'right'}}>Total</th>
              <th style={{textAlign:'right'}}>Dibayar</th>
              <th>Status</th>
              <th style={{width:60}}></th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={8} style={{padding:'48px 16px',textAlign:'center',color:'var(--ink-mute)'}}>
                Belum ada invoice. Klik <b style={{color:'var(--ink)'}}>Buat Invoice</b> untuk mulai.
              </td></tr>
            )}
            {list.map(inv => {
              const c = computeInvoice(inv);
              return (
                <tr key={inv.id} style={{cursor:'pointer'}} onClick={()=>goView(inv.id)}>
                  <td className="num" style={{fontSize:12.5}}>{inv.id}</td>
                  <td>
                    <div style={{lineHeight:1.2}}>
                      <div>{inv.customer.nama}</div>
                      <div style={{fontSize:11,color:'var(--ink-mute)'}}>{inv.customer.perusahaan}</div>
                    </div>
                  </td>
                  <td style={{color:'var(--ink-mute)'}} className="num">{fmtDate(inv.tgl)}</td>
                  <td style={{color:'var(--ink-mute)'}}>{inv.items.length} item</td>
                  <td className="num" style={{textAlign:'right'}}>{fmtIDR(c.total)}</td>
                  <td className="num" style={{textAlign:'right',color:'var(--ink-mute)'}}>{fmtIDR(c.dibayar)}</td>
                  <td><StatusChip status={inv.status}/></td>
                  <td><Icon name="chevron" size={14}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusChip({ status }) {
  const map = { 'Lunas':'lunas','DP':'dp','Belum Bayar':'belum' };
  return <span className={'chip '+map[status]}><span className="chip-dot"/>{status}</span>;
}

function fmtDate(s){
  const m = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2,'0')} ${m[d.getMonth()]} ${d.getFullYear()}`;
}

// ===== Create Invoice (interactive) =====
function CreateInvoice({ onCancel, onSave, invoices }) {
  const { fmtIDR, products, categories, nextInvNo } = KPO;
  const list = invoices || KPO.invoices || [];
  const [customer, setCustomer] = useStateInv({ nama:'', perusahaan:'', wa:'', alamat:'' });
  const [items, setItems] = useStateInv([]);
  const [ongkir, setOngkir] = useStateInv(0);
  const [biayaTambahan, setBiayaTambahan] = useStateInv(0);
  const [catatan, setCatatan] = useStateInv('');
  const [prefix, setPrefix] = useStateInv('SPC');

  const subtotal = items.reduce((s,it)=>s+it.qty*it.harga,0);
  const total = subtotal + (+ongkir||0) + (+biayaTambahan||0);

  const addItem = (custom=false) => {
    const p = products[0];
    setItems([...items, custom
      ? { id: Date.now(), kategori:'spc', nama:'Custom Item', ukuran:'', qty:1, harga:0, isCustom:true }
      : { id: Date.now(), kategori:p.kategori, sku:p.sku, nama:p.nama, ukuran:'', qty:1, harga:p.harga, isCustom:false }
    ]);
  };
  const updateItem = (id, patch) => setItems(items.map(it => it.id===id?{...it,...patch}:it));
  const removeItem = (id) => setItems(items.filter(it=>it.id!==id));

  const invNo = nextInvNo(prefix, list);

  const submit = () => {
    if (!customer.nama.trim()) { alert('Nama customer wajib diisi.'); return; }
    if (items.length === 0) { alert('Tambahkan minimal 1 produk.'); return; }
    onSave({ customer, items, ongkir, biayaTambahan, catatan, invNo, total, prefix });
  };

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:14}}>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {/* Customer */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Customer</div>
            <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:11,color:'var(--ink-mute)',letterSpacing:'0.1em',textTransform:'uppercase'}}>No.</span>
              <span className="num" style={{fontSize:13}}>{invNo}</span>
            </div>
          </div>
          <div className="card-body" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div className="field">
              <label className="field-label">Nama customer</label>
              <input className="input" placeholder="Rendy Halim" value={customer.nama} onChange={e=>setCustomer({...customer,nama:e.target.value})}/>
            </div>
            <div className="field">
              <label className="field-label">Perusahaan / Perorangan</label>
              <input className="input" placeholder="CV. Citra Interior" value={customer.perusahaan} onChange={e=>setCustomer({...customer,perusahaan:e.target.value})}/>
            </div>
            <div className="field">
              <label className="field-label">Nomor WA <span style={{textTransform:'none',color:'var(--ink-dim)'}}>(opsional)</span></label>
              <input className="input" placeholder="+62 812-3456-7890" value={customer.wa} onChange={e=>setCustomer({...customer,wa:e.target.value})}/>
            </div>
            <div className="field">
              <label className="field-label">Alamat <span style={{textTransform:'none',color:'var(--ink-dim)'}}>(opsional)</span></label>
              <input className="input" placeholder="Jl. Sudirman 21, Jakarta" value={customer.alamat} onChange={e=>setCustomer({...customer,alamat:e.target.value})}/>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Items</div>
            <div className="card-sub" style={{marginLeft:'auto'}}>{items.length} produk · multi-kategori</div>
          </div>
          <div style={{overflow:'auto'}}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{width:'46%'}}>Produk</th>
                <th style={{width:100,textAlign:'right'}}>Qty</th>
                <th style={{width:160,textAlign:'right'}}>Harga</th>
                <th style={{width:160,textAlign:'right'}}>Subtotal</th>
                <th style={{width:40}}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id}>
                  <td>
                    {it.isCustom ? (
                      <input className="input" value={it.nama} onChange={e=>updateItem(it.id,{nama:e.target.value})} style={{padding:'6px 10px'}}/>
                    ) : (
                      <select className="select" value={it.sku} onChange={e=>{
                        const p = products.find(x=>x.sku===e.target.value);
                        updateItem(it.id, { sku:p.sku, nama:p.nama, harga:p.harga, kategori:p.kategori });
                      }} style={{padding:'6px 10px'}}>
                        {categories.map(c => (
                          <optgroup key={c.id} label={c.name}>
                            {products.filter(p=>p.kategori===c.id).map(p=>(
                              <option key={p.sku} value={p.sku}>{p.nama}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    )}
                    {it.isCustom && <div style={{fontSize:10,color:'var(--accent)',marginTop:4,letterSpacing:'0.12em',textTransform:'uppercase'}}>Custom item</div>}
                  </td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'flex-end'}}>
                      <input className="input num" type="number" value={it.qty} onChange={e=>updateItem(it.id,{qty:+e.target.value||0})} style={{padding:'6px 10px',textAlign:'right',width:64}}/>
                      <span style={{fontSize:11,color:'var(--ink-mute)'}}>batang</span>
                    </div>
                  </td>
                  <td><input className="input num" type="number" value={it.harga} onChange={e=>updateItem(it.id,{harga:+e.target.value||0})} style={{padding:'6px 10px',textAlign:'right',width:'100%',minWidth:120}}/></td>
                  <td className="num" style={{textAlign:'right'}}>{fmtIDR(it.qty*it.harga)}</td>
                  <td><button className="btn btn-ghost btn-icon" onClick={()=>removeItem(it.id)}><Icon name="trash" size={14}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div style={{padding:'10px 16px',borderTop:'1px solid var(--line)',display:'flex',gap:8}}>
            <button className="btn btn-sm" onClick={()=>addItem(false)}><Icon name="plus" size={12}/> Tambah Produk</button>
            <button className="btn btn-sm" onClick={()=>addItem(true)}><Icon name="sparkle" size={12}/> Tambah Custom</button>
          </div>
        </div>

        {/* Catatan */}
        <div className="card">
          <div className="card-header"><div className="card-title">Catatan</div></div>
          <div className="card-body">
            <textarea className="textarea" placeholder="Catatan untuk customer atau internal…" value={catatan} onChange={e=>setCatatan(e.target.value)}/>
          </div>
        </div>
      </div>

      {/* Right rail — summary */}
      <div style={{display:'flex',flexDirection:'column',gap:14,position:'sticky',top:18,alignSelf:'start'}}>
        <div className="card">
          <div className="card-header"><div className="card-title">Penomoran</div></div>
          <div className="card-body" style={{display:'flex',flexDirection:'column',gap:10}}>
            <div className="field">
              <label className="field-label">Kategori dominan</label>
              <select className="select" value={prefix} onChange={e=>setPrefix(e.target.value)}>
                <option>PLINT</option><option>PARQUET</option><option>SPC</option><option>VINYL</option>
              </select>
            </div>
            <div style={{fontSize:11,color:'var(--ink-mute)'}}>No. invoice akan menjadi <span className="num" style={{color:'var(--ink)'}}>{invNo}</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Biaya & Total</div></div>
          <div className="card-body" style={{display:'flex',flexDirection:'column',gap:10}}>
            <div className="field">
              <label className="field-label">Ongkir</label>
              <input className="input num" type="number" value={ongkir} onChange={e=>setOngkir(+e.target.value||0)} style={{textAlign:'right'}}/>
            </div>
            <div className="field">
              <label className="field-label">Biaya Tambahan</label>
              <input className="input num" type="number" value={biayaTambahan} onChange={e=>setBiayaTambahan(+e.target.value||0)} style={{textAlign:'right'}}/>
            </div>
            <hr className="hr" style={{margin:'6px 0'}}/>
            <Row label="Subtotal" value={fmtIDR(subtotal)}/>
            <Row label="Ongkir" value={fmtIDR(+ongkir||0)} mute/>
            <Row label="Biaya tambahan" value={fmtIDR(+biayaTambahan||0)} mute/>
            <hr className="hr" style={{margin:'6px 0'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
              <span style={{fontSize:11,color:'var(--ink-mute)',letterSpacing:'0.14em',textTransform:'uppercase'}}>Total</span>
              <span className="font-serif num" style={{fontSize:26}}>{fmtIDR(total)}</span>
            </div>
          </div>
        </div>

        <div style={{display:'flex',gap:8}}>
          <button className="btn" style={{flex:1}} onClick={onCancel}>Batal</button>
          <button className="btn btn-primary" style={{flex:2}} onClick={submit}>
            <Icon name="check" size={14}/> Simpan invoice
          </button>
        </div>

        <div style={{fontSize:11,color:'var(--ink-mute)',padding:'0 4px',lineHeight:1.5}}>
          Stock akan otomatis berkurang setelah invoice tersimpan. Anda akan melihat preview PDF di langkah berikutnya.
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mute }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
      <span style={{color: mute?'var(--ink-mute)':'var(--ink)'}}>{label}</span>
      <span className="num" style={{color: mute?'var(--ink-mute)':'var(--ink)'}}>{value}</span>
    </div>
  );
}

window.InvoicesScreen = InvoicesScreen;
window.CreateInvoice = CreateInvoice;
window.StatusChip = StatusChip;
window.fmtDate = fmtDate;
