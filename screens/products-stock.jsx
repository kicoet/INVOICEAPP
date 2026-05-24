// ===== Products + Stock management =====
const { useState: useStateProd } = React;

function ProductsScreen({ products: productsProp, setProducts }) {
  const { fmtIDR, categories } = KPO;
  const products = productsProp || KPO.products;
  const [cat, setCat] = useStateProd('all');
  const [q, setQ] = useStateProd('');
  const [editing, setEditing] = useStateProd(null); // null = closed, {} = new, {sku} = edit

  const list = products.filter(p => (cat==='all'||p.kategori===cat) && (!q || p.nama.toLowerCase().includes(q.toLowerCase())));

  const save = (data, originalSku) => {
    if (!data.nama.trim()) { alert('Nama produk wajib diisi.'); return; }
    if (!data.sku.trim()) { alert('SKU wajib diisi.'); return; }
    const skuTaken = products.some(p => p.sku === data.sku && p.sku !== originalSku);
    if (skuTaken) { alert('SKU sudah dipakai produk lain.'); return; }
    const clean = {
      sku: data.sku.trim().toUpperCase(),
      kategori: data.kategori,
      nama: data.nama.trim(),
      satuan: data.satuan || 'batang',
      harga: +data.harga || 0,
      hpp: +data.hpp || 0,
      stock: +data.stock || 0,
      status: data.status || 'aktif',
    };
    if (originalSku) {
      setProducts(products.map(p => p.sku === originalSku ? clean : p));
    } else {
      setProducts([clean, ...products]);
    }
    setEditing(null);
  };
  const del = (sku) => {
    if (!confirm('Hapus produk ' + sku + '?')) return;
    setProducts(products.filter(p => p.sku !== sku));
  };
  const toggleStatus = (sku) => {
    setProducts(products.map(p => p.sku === sku ? { ...p, status: p.status === 'aktif' ? 'nonaktif' : 'aktif' } : p));
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Category chips */}
      <div className="card" style={{padding:'12px 14px',display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <button className={'btn btn-sm '+(cat==='all'?'btn-primary':'')} onClick={()=>setCat('all')}>Semua</button>
        {categories.map(c => (
          <button key={c.id} className={'btn btn-sm '+(cat===c.id?'btn-primary':'')} onClick={()=>setCat(c.id)}>{c.name}</button>
        ))}
        <div style={{flex:1,maxWidth:280,marginLeft:'auto',position:'relative'}}>
          <input className="input" placeholder="Cari produk…" value={q} onChange={e=>setQ(e.target.value)} style={{paddingLeft:30}}/>
          <span style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'var(--ink-dim)'}}><Icon name="search" size={13}/></span>
        </div>
        <button className="btn btn-primary" onClick={()=>setEditing({ sku:'', kategori: categories[0].id, nama:'', satuan:'batang', harga:0, hpp:0, stock:0, status:'aktif' })}><Icon name="plus" size={14}/> Tambah Produk</button>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width:80}}>SKU</th>
              <th>Nama Produk</th>
              <th>Kategori</th>
              <th style={{textAlign:'right'}}>Harga Jual</th>
              <th style={{textAlign:'right'}}>HPP</th>
              <th style={{textAlign:'right'}}>Margin</th>
              <th style={{textAlign:'right'}}>Stock</th>
              <th>Status</th>
              <th style={{width:90}}></th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={9} style={{padding:'40px 16px',textAlign:'center',color:'var(--ink-mute)'}}>
                Belum ada produk. Klik <b style={{color:'var(--ink)'}}>Tambah Produk</b> untuk mulai.
              </td></tr>
            )}
            {list.map(p => {
              const margin = p.harga ? Math.round((p.harga-p.hpp)/p.harga*100) : 0;
              const lowStock = p.stock < 30;
              const cat = categories.find(c=>c.id===p.kategori);
              return (
                <tr key={p.sku}>
                  <td className="num" style={{color:'var(--ink-mute)',fontSize:11.5}}>{p.sku}</td>
                  <td>{p.nama}</td>
                  <td><span className="chip">{cat ? cat.name : p.kategori}</span></td>
                  <td style={{textAlign:'right'}} className="num">{fmtIDR(p.harga)}</td>
                  <td style={{textAlign:'right',color:'var(--ink-mute)'}} className="num">{fmtIDR(p.hpp)}</td>
                  <td style={{textAlign:'right'}} className="num"><span style={{color:'var(--positive)'}}>{margin}%</span></td>
                  <td style={{textAlign:'right'}} className="num">
                    <span style={{color: p.stock===0?'var(--negative)':lowStock?'var(--warn)':'var(--ink)'}}>
                      {p.stock} {p.stock>0 && <span style={{fontSize:10,color:'var(--ink-dim)'}}>batang</span>}
                    </span>
                  </td>
                  <td>
                    <span className={'switch'+(p.status==='aktif'?' on':'')} onClick={()=>toggleStatus(p.sku)} style={{cursor:'pointer'}}/>
                  </td>
                  <td style={{textAlign:'right'}}>
                    <button className="btn btn-ghost btn-icon" title="Edit" onClick={()=>setEditing(p)}><Icon name="edit" size={13}/></button>
                    <button className="btn btn-ghost btn-icon" title="Hapus" onClick={()=>del(p.sku)}><Icon name="trash" size={13}/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && <ProductModal initial={editing} categories={categories} onCancel={()=>setEditing(null)} onSave={save}/>}
    </div>
  );
}

function ProductModal({ initial, categories, onCancel, onSave }) {
  const [p, setP] = useStateProd(initial);
  const originalSku = initial.sku || null;
  const upd = (patch) => setP({ ...p, ...patch });
  return (
    <div className="scrim" onClick={(e)=>{ if(e.target.classList.contains('scrim')) onCancel(); }}>
      <div className="modal" style={{width:500,padding:0,display:'flex',flexDirection:'column'}}>
        <div style={{padding:'16px 18px',borderBottom:'1px solid var(--line)'}}>
          <div className="card-sub">{originalSku ? 'Edit' : 'Tambah'} Produk</div>
          <div className="font-serif" style={{fontSize:20}}>{originalSku ? p.nama || originalSku : 'Produk baru'}</div>
        </div>
        <div style={{padding:18,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div className="field" style={{gridColumn:'1 / -1'}}>
            <label className="field-label">Nama produk</label>
            <input className="input" autoFocus value={p.nama} onChange={e=>upd({nama:e.target.value})} placeholder="Plint Laminate 10cm"/>
          </div>
          <div className="field">
            <label className="field-label">SKU</label>
            <input className="input num" value={p.sku} onChange={e=>upd({sku:e.target.value.toUpperCase()})} placeholder="PLT-10"/>
          </div>
          <div className="field">
            <label className="field-label">Kategori</label>
            <select className="select" value={p.kategori} onChange={e=>upd({kategori:e.target.value})}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Harga jual</label>
            <input className="input num" type="number" value={p.harga} onChange={e=>upd({harga:+e.target.value||0})} style={{textAlign:'right'}}/>
          </div>
          <div className="field">
            <label className="field-label">HPP / modal</label>
            <input className="input num" type="number" value={p.hpp} onChange={e=>upd({hpp:+e.target.value||0})} style={{textAlign:'right'}}/>
          </div>
          <div className="field">
            <label className="field-label">Stock awal</label>
            <input className="input num" type="number" value={p.stock} onChange={e=>upd({stock:+e.target.value||0})} style={{textAlign:'right'}}/>
          </div>
          <div className="field">
            <label className="field-label">Satuan</label>
            <input className="input" value={p.satuan} onChange={e=>upd({satuan:e.target.value})} placeholder="batang"/>
          </div>
        </div>
        <div style={{padding:'12px 18px',borderTop:'1px solid var(--line)',display:'flex',gap:8}}>
          <button className="btn" onClick={onCancel}>Batal</button>
          <button className="btn btn-primary" style={{marginLeft:'auto'}} onClick={()=>onSave(p, originalSku)}><Icon name="check" size={13}/> Simpan</button>
        </div>
      </div>
    </div>
  );
}

function StockScreen({ products: productsProp, setProducts, stockHistory, setStockHistory, pushToast }) {
  const { fmtIDR } = KPO;
  const products = productsProp || KPO.products;
  const histories = stockHistory || [];
  const [adding, setAdding] = useStateProd(null); // null or product obj

  const lowest = [...products].sort((a,b)=>a.stock-b.stock).slice(0,5);
  const valuasi = products.reduce((s,p)=>s+p.stock*p.hpp,0);
  const totalSku = products.length;
  const habis = products.filter(p=>p.stock===0).length;
  const kritis = products.filter(p=>p.stock>0 && p.stock<30).length;

  const addStock = ({ sku, qty, ref }) => {
    if (!sku || !qty) return;
    setProducts(products.map(p => p.sku === sku ? { ...p, stock: (p.stock||0) + (+qty||0) } : p));
    const p = products.find(x => x.sku === sku);
    const entry = {
      tgl: new Date().toISOString().slice(0,16).replace('T',' '),
      tipe: 'masuk',
      produk: p?.nama || sku,
      sku,
      qty: +qty,
      ref: ref || ('Pembelian #' + new Date().toISOString().slice(0,10)),
      staff: 'Owner',
    };
    setStockHistory([entry, ...histories]);
    setAdding(null);
    pushToast && pushToast({ title: 'Stock ditambahkan', body: `${p?.nama || sku}: +${qty} batang` });
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* KPI strip */}
      <div className="grid-4">
        <div className="kpi"><span className="kpi-label">Total SKU</span><div className="kpi-value num">{totalSku}</div><span style={{fontSize:11,color:'var(--ink-mute)'}}>Produk aktif</span></div>
        <div className="kpi"><span className="kpi-label">Valuasi stock</span><div className="kpi-value num">{(valuasi/1_000_000).toFixed(1).replace('.',',')} Jt</div><span style={{fontSize:11,color:'var(--ink-mute)'}}>IDR pada harga modal</span></div>
        <div className="kpi"><span className="kpi-label">Stock kritis</span><div className="kpi-value num" style={{color:'var(--warn)'}}>{kritis}</div><span style={{fontSize:11,color:'var(--ink-mute)'}}>SKU di bawah ambang</span></div>
        <div className="kpi"><span className="kpi-label">Stock habis</span><div className="kpi-value num" style={{color:'var(--negative)'}}>{habis}</div><span style={{fontSize:11,color:'var(--ink-mute)'}}>SKU perlu order</span></div>
      </div>

      <div className="grid-2-3">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Riwayat stock</div>
              <div className="card-sub">Masuk & keluar otomatis</div>
            </div>
            <button className="btn btn-primary btn-sm" style={{marginLeft:'auto'}} onClick={()=>setAdding({ sku: products[0]?.sku || '', qty: 0, ref: '' })}><Icon name="plus" size={13}/> Tambah Stock</button>
          </div>
          <table className="tbl">
            <thead><tr><th>Tanggal</th><th>Tipe</th><th>Produk</th><th style={{textAlign:'right'}}>Qty</th><th>Referensi</th><th>Aktor</th></tr></thead>
            <tbody>
              {histories.length === 0 && (
                <tr><td colSpan={6} style={{padding:'40px 16px',textAlign:'center',color:'var(--ink-mute)'}}>
                  Belum ada riwayat stock. Klik <b style={{color:'var(--ink)'}}>Tambah Stock</b> untuk mulai.
                </td></tr>
              )}
              {histories.map((h,i)=>(
                <tr key={i}>
                  <td style={{color:'var(--ink-mute)'}} className="num">{h.tgl}</td>
                  <td>
                    {h.tipe==='keluar'
                      ? <span className="chip" style={{color:'var(--negative)'}}><Icon name="arrowDown" size={10}/> Keluar</span>
                      : <span className="chip" style={{color:'var(--positive)'}}><Icon name="arrowUp" size={10}/> Masuk</span>}
                  </td>
                  <td>{h.produk}</td>
                  <td style={{textAlign:'right'}} className="num">{h.tipe==='keluar'?'−':'+'}{h.qty}</td>
                  <td style={{fontSize:11.5,color:'var(--ink-mute)'}} className="num">{h.ref}</td>
                  <td style={{fontSize:12,color:'var(--ink-mute)'}}>{h.staff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header"><div><div className="card-title">Stock terendah</div><div className="card-sub">Perlu diorder ulang</div></div></div>
          <div style={{padding:'8px 4px 16px'}}>
            {lowest.map(p => {
              const pct = Math.min(100, (p.stock/100)*100);
              const tone = p.stock===0?'var(--negative)':p.stock<30?'var(--warn)':'var(--positive)';
              return (
                <div key={p.sku} style={{padding:'10px 16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:13}}>{p.nama}</span>
                    <span className="num" style={{fontSize:12,color:tone}}>{p.stock} batang</span>
                  </div>
                  <div className="bar"><i style={{width:`${pct}%`,background:tone}}/></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {adding && <AddStockModal initial={adding} products={products} onCancel={()=>setAdding(null)} onSave={addStock}/>}
    </div>
  );
}

function AddStockModal({ initial, products, onCancel, onSave }) {
  const [sku, setSku] = useStateProd(initial.sku || (products[0]?.sku || ''));
  const [qty, setQty] = useStateProd(initial.qty || 0);
  const [ref, setRef] = useStateProd(initial.ref || '');
  const product = products.find(p => p.sku === sku);
  return (
    <div className="scrim" onClick={(e)=>{ if(e.target.classList.contains('scrim')) onCancel(); }}>
      <div className="modal" style={{width:460,padding:0,display:'flex',flexDirection:'column'}}>
        <div style={{padding:'16px 18px',borderBottom:'1px solid var(--line)'}}>
          <div className="card-sub">Tambah Stock Masuk</div>
          <div className="font-serif" style={{fontSize:20}}>Pembelian / Restock</div>
        </div>
        <div style={{padding:18,display:'flex',flexDirection:'column',gap:12}}>
          <div className="field"><label className="field-label">Produk</label>
            <select className="select" value={sku} onChange={e=>setSku(e.target.value)}>
              {products.map(p => <option key={p.sku} value={p.sku}>{p.nama} ({p.sku}) — stock {p.stock||0}</option>)}
            </select>
          </div>
          <div className="field"><label className="field-label">Jumlah masuk</label>
            <input className="input num" type="number" value={qty} autoFocus onChange={e=>setQty(+e.target.value||0)} placeholder="0"/>
            {product && qty>0 && (
              <div style={{fontSize:11,color:'var(--ink-mute)'}}>Stock baru: <span className="num" style={{color:'var(--ink)'}}>{(product.stock||0) + (+qty||0)} batang</span></div>
            )}
          </div>
          <div className="field"><label className="field-label">Referensi <span style={{textTransform:'none',color:'var(--ink-dim)'}}>(opsional)</span></label>
            <input className="input" value={ref} onChange={e=>setRef(e.target.value)} placeholder="No. nota pembelian, supplier, dll"/>
          </div>
        </div>
        <div style={{padding:'12px 18px',borderTop:'1px solid var(--line)',display:'flex',gap:8}}>
          <button className="btn" onClick={onCancel}>Batal</button>
          <button className="btn btn-primary" style={{marginLeft:'auto'}} onClick={()=>{
            if (!qty || qty <= 0) { alert('Jumlah harus lebih dari 0.'); return; }
            onSave({ sku, qty, ref });
          }}><Icon name="check" size={13}/> Tambah Stock</button>
        </div>
      </div>
    </div>
  );
}

window.ProductsScreen = ProductsScreen;
window.StockScreen = StockScreen;
