// ===== Dashboard Owner =====
const { useState: useStateDash } = React;

function Dashboard({ invoices: invoicesProp, products: productsProp, customers: customersProp }) {
  const { fmtIDR, computeInvoice, categories } = KPO;
  const invoices = invoicesProp || KPO.invoices || [];
  const products = productsProp || KPO.products || [];
  const [range, setRange] = useStateDash('30d');

  const fmtShort = (n) => {
    n = +n || 0;
    if (n >= 1_000_000_000) return (n/1_000_000_000).toFixed(2).replace('.',',') + ' Mrd';
    if (n >= 1_000_000) return (n/1_000_000).toFixed(1).replace('.',',') + ' Jt';
    if (n >= 1_000) return (n/1_000).toFixed(0) + ' Rb';
    return String(n);
  };

  // ---- Real stats derived from invoices ----
  // Date keys are UTC ISO YYYY-MM-DD to match how invoices are saved
  // (onSave uses today.toISOString().slice(0,10)).
  const now = new Date();
  const todayKey = now.toISOString().slice(0,10);
  const todayUTC = new Date(todayKey + 'T00:00:00Z');
  const totalsByDay = {}; // UTC ISO date → omzet
  let totalOmzet = 0, totalLaba = 0, piutangTerbuka = 0;
  const omzetByKategori = {};   // id → total
  const omzetByProduct = {};    // nama → { qty, omzet }
  const omzetByCustomer = {};   // key → { customer, trx, omzet }

  for (const inv of invoices) {
    const c = computeInvoice(inv);
    totalOmzet += c.total;
    piutangTerbuka += c.sisa;
    totalsByDay[inv.tgl] = (totalsByDay[inv.tgl] || 0) + c.total;
    // laba estimasi: subtotal - HPP
    let invHpp = 0;
    for (const it of inv.items) {
      const p = products.find(x => x.sku === it.sku);
      invHpp += (p?.hpp || 0) * (it.qty || 0);
      omzetByKategori[it.kategori] = (omzetByKategori[it.kategori] || 0) + it.qty * it.harga;
      const pk = it.nama;
      omzetByProduct[pk] = omzetByProduct[pk] || { nama: pk, qty: 0, omzet: 0 };
      omzetByProduct[pk].qty += it.qty;
      omzetByProduct[pk].omzet += it.qty * it.harga;
    }
    totalLaba += (c.subtotal - invHpp);
    const ck = (inv.customer?.nama || '') + '|' + (inv.customer?.perusahaan || '');
    omzetByCustomer[ck] = omzetByCustomer[ck] || { ...inv.customer, trx: 0, omzet: 0 };
    omzetByCustomer[ck].trx += 1;
    omzetByCustomer[ck].omzet += c.total;
  }

  const days = range === '7d' ? 7 : range === '14d' ? 14 : 30;
  const data = Array.from({ length: days }).map((_, i) => {
    const d = new Date(todayUTC);
    d.setUTCDate(d.getUTCDate() - (days - 1 - i));
    const key = d.toISOString().slice(0,10);
    return { d: key, v: totalsByDay[key] || 0 };
  });
  const totalRange = data.reduce((s,d)=>s+d.v,0);
  const omzetHari = totalsByDay[todayKey] || 0;
  const omzetMinggu = data.slice(-7).reduce((s,d)=>s+d.v,0);
  const omzetBulan = data.reduce((s,d)=>s+d.v,0);

  const perKategori = categories.map(cat => ({ kategori: cat.name, omzet: omzetByKategori[cat.id] || 0 })).filter(k => k.omzet > 0);
  const topProducts = Object.values(omzetByProduct).sort((a,b)=>b.omzet-a.omzet).slice(0,5);
  const topCustomers = Object.values(omzetByCustomer).sort((a,b)=>b.omzet-a.omzet).slice(0,5);

  const unpaidCount = invoices.filter(i => i.status !== 'Lunas').length;
  const stockKritis = products.filter(p => (p.stock||0) > 0 && (p.stock||0) < 30).length;
  const stockHabis = products.filter(p => (p.stock||0) === 0).length;

  const kpis = [
    { label: 'Omzet hari ini', raw: omzetHari,   spark: data.slice(-7).map(d=>d.v) },
    { label: 'Omzet mingguan', raw: omzetMinggu, spark: data.slice(-7).map(d=>d.v) },
    { label: 'Omzet bulanan',  raw: omzetBulan,  spark: data.map(d=>d.v) },
    { label: 'Total omzet',    raw: totalOmzet,  spark: data.map(d=>d.v) },
  ];
  const kpis2 = [
    { label: 'Total invoice',   value: String(invoices.length), sub: 'sejak awal',           tone: 'ink' },
    { label: 'Estimasi laba',   value: fmtShort(totalLaba),     sub: 'subtotal − HPP · IDR', tone: 'positive' },
    { label: 'Piutang terbuka', value: fmtShort(piutangTerbuka),sub: `${unpaidCount} invoice belum lunas · IDR`, tone: 'warn' },
    { label: 'Stock kritis',    value: `${stockKritis + stockHabis} item`, sub: `${stockHabis} habis · ${stockKritis} menipis`, tone: 'negative' },
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* KPI row */}
      <div className="grid-4">
        {kpis.map(k => (
          <div key={k.label} className="kpi">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <span className="kpi-label">{k.label}</span>
              <Sparkline values={k.spark} w={56} h={20}/>
            </div>
            <div className="kpi-value num">{fmtShort(k.raw)}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:6}}>
              <span style={{fontSize:10,color:'var(--ink-dim)',letterSpacing:'0.14em'}}>IDR</span>
              {k.delta && <span className="kpi-delta"><Icon name="arrowUp" size={11}/>{k.delta}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Pergerakan omzet</div>
            <div className="card-sub">Trend penjualan harian</div>
          </div>
          <div className="seg" style={{marginLeft:'auto'}}>
            {['7d','14d','30d'].map(r=> (
              <button key={r} className={range===r?'active':''} onClick={()=>setRange(r)}>{r}</button>
            ))}
          </div>
        </div>
        <div className="card-body" style={{paddingTop:8}}>
          <AreaChart data={data} height={220}/>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid-4">
        {kpis2.map(k => (
          <div key={k.label} className="kpi">
            <span className="kpi-label">{k.label}</span>
            <div className="kpi-value num" style={{color: k.tone==='positive'?'var(--positive)' : k.tone==='warn'?'var(--warn)' : k.tone==='negative'?'var(--negative)':'var(--ink)'}}>
              {k.value}
            </div>
            <span style={{fontSize:11,color:'var(--ink-mute)'}}>{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Composition */}
      <div className="grid-2-3">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Omzet per kategori</div>
              <div className="card-sub">30 hari terakhir</div>
            </div>
          </div>
          <div className="card-body">
            <BarChart data={perKategori} height={220}/>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Komposisi</div>
              <div className="card-sub">Per kategori produk</div>
            </div>
          </div>
          <div className="card-body" style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:16,alignItems:'center'}}>
            <Donut data={perKategori}/>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {perKategori.map((k,i)=> {
                const colors = ['var(--accent)','var(--info)','var(--positive)','var(--warn)'];
                const total = perKategori.reduce((s,p)=>s+p.omzet,0);
                return (
                  <div key={k.kategori} style={{display:'flex',alignItems:'center',gap:8}}>
                    <span className="dot" style={{background:colors[i]}}/>
                    <span style={{fontSize:12,color:'var(--ink-mute)',flex:1}}>{k.kategori}</span>
                    <span style={{fontSize:12}} className="num">{Math.round(k.omzet/total*100)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top products & customers */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Produk terlaris</div>
              <div className="card-sub">30 hari terakhir</div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{marginLeft:'auto'}}>Lihat semua <Icon name="chevron" size={12}/></button>
          </div>
          <table className="tbl">
            <thead><tr><th>Produk</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Omzet</th></tr></thead>
            <tbody>
              {topProducts.map((p,i)=>(
                <tr key={p.nama}>
                  <td><span style={{color:'var(--ink-dim)',marginRight:8}} className="num">{String(i+1).padStart(2,'0')}</span>{p.nama}</td>
                  <td style={{textAlign:'right'}} className="num">{p.qty}</td>
                  <td style={{textAlign:'right'}} className="num">{fmtIDR(p.omzet)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Customer paling sering beli</div>
              <div className="card-sub">30 hari terakhir</div>
            </div>
          </div>
          <table className="tbl">
            <thead><tr><th>Customer</th><th style={{textAlign:'right'}}>Transaksi</th><th style={{textAlign:'right'}}>Total</th></tr></thead>
            <tbody>
              {topCustomers.map((c,i)=>(
                <tr key={c.id}>
                  <td>
                    <div style={{lineHeight:1.2}}>
                      <div style={{fontSize:13}}>{c.nama}</div>
                      <div style={{fontSize:11,color:'var(--ink-mute)'}}>{c.perusahaan}</div>
                    </div>
                  </td>
                  <td style={{textAlign:'right'}} className="num">{c.trx}</td>
                  <td style={{textAlign:'right'}} className="num">{fmtIDR(c.omzet)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
