// ===== Products + Stock management =====
const { useState: useStateProd } = React;

function ProductsScreen() {
  const { fmtIDR, products, categories } = KPO;
  const [cat, setCat] = useStateProd('all');
  const [q, setQ] = useStateProd('');

  const list = products.filter(p => (cat==='all'||p.kategori===cat) && (!q || p.nama.toLowerCase().includes(q.toLowerCase())));

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
        <button className="btn btn-primary"><Icon name="plus" size={14}/> Tambah Produk</button>
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
            {list.map(p => {
              const margin = Math.round((p.harga-p.hpp)/p.harga*100);
              const lowStock = p.stock < 30;
              return (
                <tr key={p.sku}>
                  <td className="num" style={{color:'var(--ink-mute)',fontSize:11.5}}>{p.sku}</td>
                  <td>{p.nama}</td>
                  <td><span className="chip">{categories.find(c=>c.id===p.kategori).name}</span></td>
                  <td style={{textAlign:'right'}} className="num">{fmtIDR(p.harga)}</td>
                  <td style={{textAlign:'right',color:'var(--ink-mute)'}} className="num">{fmtIDR(p.hpp)}</td>
                  <td style={{textAlign:'right'}} className="num"><span style={{color:'var(--positive)'}}>{margin}%</span></td>
                  <td style={{textAlign:'right'}} className="num">
                    <span style={{color: p.stock===0?'var(--negative)':lowStock?'var(--warn)':'var(--ink)'}}>
                      {p.stock} {p.stock>0 && <span style={{fontSize:10,color:'var(--ink-dim)'}}>batang</span>}
                    </span>
                  </td>
                  <td>
                    <span className="switch on"/>
                  </td>
                  <td style={{textAlign:'right'}}>
                    <button className="btn btn-ghost btn-icon"><Icon name="edit" size={13}/></button>
                    <button className="btn btn-ghost btn-icon"><Icon name="trash" size={13}/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockScreen() {
  const { fmtIDR, products } = KPO;

  const lowest = [...products].sort((a,b)=>a.stock-b.stock).slice(0,5);
  const valuasi = products.reduce((s,p)=>s+p.stock*p.hpp,0);
  const totalSku = products.length;
  const habis = products.filter(p=>p.stock===0).length;
  const kritis = products.filter(p=>p.stock>0 && p.stock<30).length;

  const histories = [
    { tgl:'2026-05-22 14:24', tipe:'keluar', produk:'SPC Adaptasi', qty:24, ref:'ID/SPC/V/014', staff:'Sistem (auto)' },
    { tgl:'2026-05-22 14:24', tipe:'keluar', produk:'SPC Transisi', qty:12, ref:'ID/SPC/V/014', staff:'Sistem (auto)' },
    { tgl:'2026-05-22 09:10', tipe:'masuk',  produk:'Plint Laminate 10cm', qty:50, ref:'Pembelian #2026-05-22A', staff:'Owner' },
    { tgl:'2026-05-21 16:48', tipe:'keluar', produk:'Parquet Adaptasi', qty:18, ref:'ID/PARQUET/V/011', staff:'Sistem (auto)' },
    { tgl:'2026-05-21 16:48', tipe:'keluar', produk:'Parquet Ending',    qty:8,  ref:'ID/PARQUET/V/011', staff:'Sistem (auto)' },
    { tgl:'2026-05-20 11:02', tipe:'masuk',  produk:'SPC Adaptasi', qty:80, ref:'Pembelian #2026-05-20A', staff:'Owner' },
    { tgl:'2026-05-20 10:38', tipe:'keluar', produk:'Plint Laminate 10cm', qty:40, ref:'ID/PLINT/V/032', staff:'Sistem (auto)' },
    { tgl:'2026-05-19 15:14', tipe:'keluar', produk:'Vinyl Adaptasi', qty:22, ref:'ID/VINYL/V/007', staff:'Sistem (auto)' },
  ];

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
            <button className="btn btn-sm" style={{marginLeft:'auto'}}><Icon name="upload" size={13}/> Stock Masuk</button>
          </div>
          <table className="tbl">
            <thead><tr><th>Tanggal</th><th>Tipe</th><th>Produk</th><th style={{textAlign:'right'}}>Qty</th><th>Referensi</th><th>Aktor</th></tr></thead>
            <tbody>
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
    </div>
  );
}

window.ProductsScreen = ProductsScreen;
window.StockScreen = StockScreen;
