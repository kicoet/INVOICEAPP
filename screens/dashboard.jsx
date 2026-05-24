// ===== Dashboard Owner =====
const { useState: useStateDash } = React;

function Dashboard() {
  const { fmtIDR, omzet30, perKategori, topProducts, topCustomers, invoices, computeInvoice } = KPO;
  const [range, setRange] = useStateDash('30d');

  // Indonesian short-format: 1.250.000 → "1,25 Jt", 1.250.000.000 → "1,25 Mrd"
  const fmtShort = (n) => {
    if (n >= 1_000_000_000) return (n/1_000_000_000).toFixed(2).replace('.',',') + ' Mrd';
    if (n >= 1_000_000) return (n/1_000_000).toFixed(1).replace('.',',') + ' Jt';
    if (n >= 1_000) return (n/1_000).toFixed(0) + ' Rb';
    return String(n);
  };

  const data = omzet30.slice(range==='7d'?-7:range==='14d'?-14:0);
  const total30 = omzet30.reduce((s,d)=>s+d.v,0);
  const totalRange = data.reduce((s,d)=>s+d.v,0);
  const totalInv = invoices.length;
  const totalLaba = Math.round(totalRange * 0.34);
  const omzetHari = data[data.length-1].v;

  const kpis = [
    { label: 'Omzet hari ini',  raw: omzetHari, delta: '+12.4%', spark: data.slice(-7).map(d=>d.v) },
    { label: 'Omzet mingguan',  raw: data.slice(-7).reduce((s,d)=>s+d.v,0), delta: '+8.1%', spark: data.slice(-14,-7).map(d=>d.v) },
    { label: 'Omzet bulanan',   raw: total30, delta: '+22.6%', spark: data.map(d=>d.v) },
    { label: 'Omzet tahunan',   raw: total30*9.4, delta: '+18.2%', spark: data.map(d=>d.v*1.1) },
  ];
  const kpis2 = [
    { label: 'Total invoice',   value: '128',                sub: '6 bulan ini', tone: 'ink' },
    { label: 'Estimasi laba',   value: fmtShort(totalLaba),  sub: '34% margin · IDR', tone: 'positive' },
    { label: 'Piutang terbuka', value: fmtShort(8_240_000),  sub: '4 invoice belum lunas · IDR', tone: 'warn' },
    { label: 'Stock kritis',    value: '3 item',             sub: 'di bawah ambang batas', tone: 'negative' },
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
              <span className="kpi-delta"><Icon name="arrowUp" size={11}/>{k.delta}</span>
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
