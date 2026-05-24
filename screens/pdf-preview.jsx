// ===== PDF Preview Modal with Template Picker + Signature Pad =====
const { useState: useStatePdf, useRef: useRefPdf, useEffect: useEffectPdf } = React;

function SignaturePad({ value, onChange }) {
  const canvasRef = useRefPdf(null);
  const drawing = useRefPdf(false);
  const last = useRefPdf({x:0,y:0});

  useEffectPdf(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111';
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = value;
    }
  }, []);

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  const start = (e) => { e.preventDefault(); drawing.current = true; last.current = pos(e); };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange && onChange(canvasRef.current.toDataURL('image/png'));
  };
  const clear = () => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    onChange && onChange(null);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="sig-canvas"
        style={{background:'#fff', borderColor:'#ddd'}}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
      />
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <button className="btn btn-sm" onClick={clear}><Icon name="trash" size={12}/> Bersihkan</button>
        <span style={{fontSize:11,color:'var(--ink-mute)',alignSelf:'center'}}>Gambar tanda tangan dengan mouse atau touchscreen</span>
      </div>
    </div>
  );
}

// PDF Template renderers — three distinct directions
function PdfClassic({ inv, comp, brand }) {
  const { fmtIDR } = KPO;
  const sig = brand.signatureImg;
  return (
    <div className="pdf-page" style={{padding:'48px 48px'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',borderBottom:'2px solid #111',paddingBottom:18}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,border:'1.5px solid #111',display:'grid',placeItems:'center',fontFamily:"'Instrument Serif', serif",fontStyle:'italic',fontSize:22}}>K</div>
            <div>
              <div style={{fontFamily:"'Instrument Serif', serif",fontSize:22,lineHeight:1}}>{brand.name}</div>
              <div style={{fontSize:8,letterSpacing:'0.22em',color:'#666',marginTop:3}}>{brand.tag}</div>
            </div>
          </div>
          <div style={{fontSize:9,color:'#555',marginTop:14,lineHeight:1.6}}>
            {brand.address}<br/>
            {brand.phone} · {brand.email}
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:9,letterSpacing:'0.24em',color:'#777'}}>INVOICE</div>
          <div style={{fontFamily:"'Geist Mono', monospace",fontSize:14,marginTop:6}}>{inv.invNo}</div>
          <div style={{fontSize:9,color:'#666',marginTop:14}}>Tanggal terbit</div>
          <div style={{fontSize:11}}>{fmtDate('2026-05-23')}</div>
        </div>
      </div>

      {/* Customer */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,padding:'22px 0',borderBottom:'1px solid #eee'}}>
        <div>
          <div style={{fontSize:9,letterSpacing:'0.22em',color:'#777'}}>DITAGIHKAN KEPADA</div>
          <div style={{fontSize:13,marginTop:6,fontWeight:500}}>{inv.customer.nama || 'Customer'}</div>
          <div style={{fontSize:10.5,color:'#555',marginTop:2,lineHeight:1.6}}>
            {inv.customer.perusahaan}<br/>
            {inv.customer.alamat}<br/>
            {inv.customer.wa}
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:9,letterSpacing:'0.22em',color:'#777'}}>TOTAL TAGIHAN</div>
          <div style={{fontFamily:"'Instrument Serif', serif",fontSize:30,marginTop:4}}>{fmtIDR(inv.total)}</div>
          <div style={{fontSize:10,color:'#888'}}>Jatuh tempo: {fmtDate('2026-06-06')}</div>
        </div>
      </div>

      {/* Items */}
      <table style={{width:'100%',borderCollapse:'collapse',marginTop:18,fontSize:11}}>
        <thead>
          <tr style={{borderBottom:'1px solid #111'}}>
            <th style={{textAlign:'left',padding:'8px 0',fontSize:9,letterSpacing:'0.18em',color:'#666',fontWeight:500}}>PRODUK</th>
            <th style={{textAlign:'left',padding:'8px 0',fontSize:9,letterSpacing:'0.18em',color:'#666',fontWeight:500}}>UKURAN</th>
            <th style={{textAlign:'right',padding:'8px 0',fontSize:9,letterSpacing:'0.18em',color:'#666',fontWeight:500}}>QTY</th>
            <th style={{textAlign:'right',padding:'8px 0',fontSize:9,letterSpacing:'0.18em',color:'#666',fontWeight:500}}>HARGA</th>
            <th style={{textAlign:'right',padding:'8px 0',fontSize:9,letterSpacing:'0.18em',color:'#666',fontWeight:500}}>SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((it,i)=>(
            <tr key={i} style={{borderBottom:'1px solid #f0f0f0'}}>
              <td style={{padding:'10px 0'}}>{it.nama}</td>
              <td style={{padding:'10px 0',color:'#666'}}>{it.ukuran}</td>
              <td style={{padding:'10px 0',textAlign:'right',fontFamily:"'Geist Mono', monospace"}}>{it.qty}</td>
              <td style={{padding:'10px 0',textAlign:'right',fontFamily:"'Geist Mono', monospace"}}>{fmtIDR(it.harga)}</td>
              <td style={{padding:'10px 0',textAlign:'right',fontFamily:"'Geist Mono', monospace"}}>{fmtIDR(it.qty*it.harga)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 240px',marginTop:18,gap:24}}>
        <div style={{fontSize:10,color:'#666',lineHeight:1.6}}>
          {inv.catatan && (<>
            <div style={{fontSize:9,letterSpacing:'0.22em',color:'#777'}}>CATATAN</div>
            <div style={{marginTop:4}}>{inv.catatan}</div>
          </>)}
        </div>
        <div style={{fontSize:11,fontFamily:"'Geist Mono', monospace"}}>
          <PdfRow label="Subtotal" value={fmtIDR(comp.subtotal)}/>
          <PdfRow label="Ongkir" value={fmtIDR(inv.ongkir)}/>
          {inv.biayaTambahan>0 && <PdfRow label="Biaya tambahan" value={fmtIDR(inv.biayaTambahan)}/>}
          <div style={{borderTop:'1px solid #111',marginTop:6,paddingTop:6,display:'flex',justifyContent:'space-between'}}>
            <span>Total</span><span style={{fontFamily:"'Instrument Serif', serif",fontSize:16}}>{fmtIDR(inv.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{display:'flex',justifyContent:'space-between',marginTop:60,paddingTop:18,borderTop:'1px solid #eee'}}>
        <div style={{fontSize:9,color:'#888',maxWidth:280,lineHeight:1.6}}>
          Pembayaran dapat ditransfer ke <b style={{color:'#111'}}>BCA 1234567890 a.n. Kemala Profile Office</b>. Mohon konfirmasi setelah pembayaran.
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{height:60,width:160,display:'grid',placeItems:'center'}}>
            {sig ? <img src={sig} style={{maxHeight:60,maxWidth:160}}/> : <span style={{fontSize:10,color:'#bbb',fontStyle:'italic'}}>(tanda tangan)</span>}
          </div>
          <div style={{borderTop:'1px solid #111',paddingTop:4,fontSize:10}}>Jakarta, {fmtDate('2026-05-23')}</div>
          <div style={{fontSize:9,color:'#666'}}>Hormat kami</div>
        </div>
      </div>
    </div>
  );
}

function PdfRow({ label, value }) {
  return <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}><span style={{color:'#666'}}>{label}</span><span>{value}</span></div>;
}

function PdfMinimal({ inv, comp, brand }) {
  const { fmtIDR } = KPO;
  const sig = brand.signatureImg;
  return (
    <div className="pdf-page" style={{padding:'56px 56px',fontFamily:"'Geist', sans-serif"}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <div style={{fontSize:9,letterSpacing:'0.3em',color:'#999'}}>INVOICE NO.</div>
          <div style={{fontFamily:"'Geist Mono', monospace",fontSize:24,marginTop:4,letterSpacing:'-0.01em'}}>{inv.invNo}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontFamily:"'Instrument Serif', serif",fontSize:20,lineHeight:1}}>{brand.name}</div>
          <div style={{fontSize:8,letterSpacing:'0.22em',color:'#999',marginTop:4}}>{brand.tag}</div>
        </div>
      </div>

      <div style={{height:1,background:'#111',marginTop:24}}/>

      {/* Meta */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:18,marginTop:22}}>
        <Meta label="Diterbitkan" v={fmtDate('2026-05-23')}/>
        <Meta label="Jatuh tempo" v={fmtDate('2026-06-06')}/>
        <Meta label="Untuk" v={(inv.customer.perusahaan||inv.customer.nama)||'—'}/>
      </div>

      <div style={{marginTop:24}}>
        <div style={{fontSize:9,letterSpacing:'0.22em',color:'#999'}}>DITAGIHKAN KEPADA</div>
        <div style={{fontSize:14,marginTop:6}}>{inv.customer.nama || 'Customer'}</div>
        <div style={{fontSize:10.5,color:'#666',marginTop:2,lineHeight:1.6}}>
          {inv.customer.perusahaan}<br/>
          {inv.customer.alamat}<br/>
          {inv.customer.wa}
        </div>
      </div>

      {/* Items — pure list */}
      <div style={{marginTop:30}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 100px 100px',fontSize:9,letterSpacing:'0.22em',color:'#999',paddingBottom:8,borderBottom:'1px solid #111'}}>
          <span>ITEM</span><span style={{textAlign:'right'}}>QTY × HARGA</span><span style={{textAlign:'right'}}>SUBTOTAL</span>
        </div>
        {inv.items.map((it,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 100px 100px',padding:'14px 0',borderBottom:'1px dashed #e8e8e8',alignItems:'baseline'}}>
            <div>
              <div style={{fontSize:12.5}}>{it.nama}</div>
              <div style={{fontSize:10,color:'#888',marginTop:2}}>{it.ukuran}</div>
            </div>
            <div style={{textAlign:'right',fontFamily:"'Geist Mono', monospace",fontSize:11,color:'#666'}}>{it.qty} × {(it.harga/1000).toFixed(0)}k</div>
            <div style={{textAlign:'right',fontFamily:"'Geist Mono', monospace",fontSize:12}}>{fmtIDR(it.qty*it.harga)}</div>
          </div>
        ))}
      </div>

      {/* Totals — light */}
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:18}}>
        <div style={{width:280,fontFamily:"'Geist Mono', monospace",fontSize:11}}>
          <PdfRow label="Subtotal" value={fmtIDR(comp.subtotal)}/>
          <PdfRow label="Ongkir" value={fmtIDR(inv.ongkir)}/>
          {inv.biayaTambahan>0 && <PdfRow label="Biaya tambahan" value={fmtIDR(inv.biayaTambahan)}/>}
          <div style={{marginTop:10,padding:'12px 0',borderTop:'1px solid #111',borderBottom:'1px solid #111',display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
            <span style={{fontSize:9,letterSpacing:'0.22em',color:'#999'}}>TOTAL</span>
            <span style={{fontFamily:"'Instrument Serif', serif",fontSize:22}}>{fmtIDR(inv.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{marginTop:70,display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
        <div style={{fontSize:9,color:'#999',lineHeight:1.7,maxWidth:280}}>
          {brand.address} · {brand.phone}<br/>
          Pembayaran: BCA 1234567890 a.n. Kemala Profile Office
        </div>
        <div style={{textAlign:'left'}}>
          <div style={{height:50,width:140,marginBottom:6}}>
            {sig ? <img src={sig} style={{maxHeight:50,maxWidth:140}}/> : <span style={{fontSize:10,color:'#ccc'}}>(tanda tangan)</span>}
          </div>
          <div style={{fontSize:9,letterSpacing:'0.22em',color:'#999'}}>HORMAT KAMI</div>
          <div style={{fontSize:11,marginTop:2}}>Kemala Profile Office</div>
        </div>
      </div>
    </div>
  );
}
function Meta({label,v}){return (<div><div style={{fontSize:9,letterSpacing:'0.22em',color:'#999'}}>{label.toUpperCase()}</div><div style={{fontSize:12,marginTop:4}}>{v}</div></div>);}

function PdfEditorial({ inv, comp, brand }) {
  const { fmtIDR } = KPO;
  const sig = brand.signatureImg;
  return (
    <div className="pdf-page" style={{padding:0,fontFamily:"'Geist', sans-serif"}}>
      {/* Dark band */}
      <div style={{background:'#0d0d0c',color:'#ece6d8',padding:'36px 48px 32px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
          <div>
            <div style={{fontFamily:"'Instrument Serif', serif",fontStyle:'italic',fontSize:14,color:'#c9a96e'}}>est. 2018</div>
            <div style={{fontFamily:"'Instrument Serif', serif",fontSize:36,lineHeight:1,marginTop:6}}>{brand.name}</div>
            <div style={{fontSize:9,letterSpacing:'0.26em',marginTop:8,color:'#a8a39a'}}>{brand.tag}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:9,letterSpacing:'0.26em',color:'#a8a39a'}}>INVOICE</div>
            <div style={{fontFamily:"'Instrument Serif', serif",fontSize:28,marginTop:4}}>{inv.invNo}</div>
          </div>
        </div>
      </div>

      <div style={{padding:'28px 48px 48px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:24,borderBottom:'1px solid #ddd',paddingBottom:18}}>
          <div>
            <div style={{fontSize:9,letterSpacing:'0.22em',color:'#999'}}>UNTUK</div>
            <div style={{fontSize:13,marginTop:6}}>{inv.customer.nama||'Customer'}</div>
            <div style={{fontSize:10.5,color:'#666',marginTop:2,lineHeight:1.6}}>{inv.customer.perusahaan}<br/>{inv.customer.alamat}<br/>{inv.customer.wa}</div>
          </div>
          <div>
            <div style={{fontSize:9,letterSpacing:'0.22em',color:'#999'}}>DARI</div>
            <div style={{fontSize:13,marginTop:6}}>{brand.name}</div>
            <div style={{fontSize:10.5,color:'#666',marginTop:2,lineHeight:1.6}}>{brand.address}<br/>{brand.phone}<br/>{brand.email}</div>
          </div>
          <div>
            <div style={{fontSize:9,letterSpacing:'0.22em',color:'#999'}}>TANGGAL</div>
            <div style={{fontSize:13,marginTop:6}}>{fmtDate('2026-05-23')}</div>
            <div style={{fontSize:9,letterSpacing:'0.22em',color:'#999',marginTop:10}}>JATUH TEMPO</div>
            <div style={{fontSize:13,marginTop:4}}>{fmtDate('2026-06-06')}</div>
          </div>
        </div>

        {/* Items as cards */}
        <div style={{marginTop:22}}>
          {inv.items.map((it,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'24px 1fr 100px',gap:14,padding:'12px 0',borderBottom:'1px solid #f0f0f0',alignItems:'baseline'}}>
              <div style={{fontFamily:"'Instrument Serif', serif",fontStyle:'italic',color:'#c9a96e',fontSize:18}}>{String(i+1).padStart(2,'0')}</div>
              <div>
                <div style={{fontSize:13}}>{it.nama}</div>
                <div style={{fontSize:10.5,color:'#888',marginTop:2}}>{it.ukuran} · {it.qty} batang × {fmtIDR(it.harga)}</div>
              </div>
              <div style={{textAlign:'right',fontFamily:"'Geist Mono', monospace",fontSize:12.5}}>{fmtIDR(it.qty*it.harga)}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 280px',marginTop:24,gap:24}}>
          <div>
            {inv.catatan && (<>
              <div style={{fontSize:9,letterSpacing:'0.22em',color:'#999'}}>CATATAN</div>
              <div style={{fontSize:10.5,color:'#666',marginTop:6,lineHeight:1.6,fontStyle:'italic'}}>"{inv.catatan}"</div>
            </>)}
          </div>
          <div style={{background:'#faf8f3',border:'1px solid #e6dfca',padding:'16px 18px'}}>
            <div style={{fontFamily:"'Geist Mono', monospace",fontSize:11}}>
              <PdfRow label="Subtotal" value={fmtIDR(comp.subtotal)}/>
              <PdfRow label="Ongkir" value={fmtIDR(inv.ongkir)}/>
              {inv.biayaTambahan>0 && <PdfRow label="Biaya tambahan" value={fmtIDR(inv.biayaTambahan)}/>}
              <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid #c9a96e',display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                <span style={{fontSize:9,letterSpacing:'0.22em',color:'#8b6f47'}}>TOTAL</span>
                <span style={{fontFamily:"'Instrument Serif', serif",fontSize:22,color:'#1a1a1a'}}>{fmtIDR(inv.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'space-between',marginTop:60}}>
          <div style={{fontSize:9,color:'#999',lineHeight:1.8,maxWidth:300}}>
            <i>Terima kasih telah mempercayakan project Anda kepada Kemala Profile Office. Pembayaran dapat dilakukan via BCA <b style={{color:'#1a1a1a'}}>1234567890</b> a.n. Kemala Profile Office.</i>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{height:50,width:160,marginBottom:4,display:'grid',placeItems:'center'}}>
              {sig ? <img src={sig} style={{maxHeight:50,maxWidth:160}}/> : <span style={{fontSize:10,color:'#ccc',fontStyle:'italic'}}>(tanda tangan)</span>}
            </div>
            <div style={{borderTop:'1px solid #c9a96e',paddingTop:4,fontSize:10,fontStyle:'italic',color:'#8b6f47'}}>Hormat kami</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- PDF generation helpers (html2pdf bundled CDN) ----
function pdfFilename(inv) {
  return (inv.invNo || 'invoice').replace(/[\/\\:*?"<>|]/g, '-') + '.pdf';
}
async function buildPdfBlob() {
  const el = document.querySelector('.pdf-page');
  if (!el || !window.html2pdf) return null;
  const shell = el.closest('.pdf-shell');

  // Snapshot inline styles so we can restore exactly after capture.
  const snap = (node, props) => props.map(p => [p, node.style[p]]);
  const restore = (node, snapped) => snapped.forEach(([p, v]) => { node.style[p] = v; });

  const elSnap = snap(el, ['transform','position','top','left','zoom','width','minHeight','maxWidth']);
  const shellSnap = shell ? snap(shell, ['height','overflow','width','maxWidth','position']) : [];

  // Force native A4-ish render dimensions before html2canvas takes the snapshot.
  el.style.transform = 'none';
  el.style.position = 'static';
  el.style.top = 'auto';
  el.style.left = 'auto';
  el.style.zoom = '1';
  el.style.width = '760px';
  el.style.minHeight = '1075px';
  el.style.maxWidth = 'none';
  if (shell) {
    shell.style.height = 'auto';
    shell.style.overflow = 'visible';
    shell.style.width = '760px';
    shell.style.maxWidth = 'none';
    shell.style.position = 'static';
  }

  try {
    return await window.html2pdf().set({
      margin: 0,
      image: { type: 'jpeg', quality: 0.97 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 760,
        windowWidth: 760,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(el).outputPdf('blob');
  } finally {
    restore(el, elSnap);
    if (shell) restore(shell, shellSnap);
  }
}
async function downloadPdf(inv) {
  const blob = await buildPdfBlob();
  if (!blob) { alert('PDF generator belum siap. Tunggu sebentar.'); return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = pdfFilename(inv);
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
async function sharePdf(inv) {
  const blob = await buildPdfBlob();
  if (!blob) { alert('PDF generator belum siap.'); return; }
  const filename = pdfFilename(inv);
  const file = new File([blob], filename, { type: 'application/pdf' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: inv.invNo, text: 'Invoice ' + inv.invNo });
      return;
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return; // user cancelled
  }
  // Fallback: download instead
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  alert('Browser kamu tidak support share file. PDF di-download sebagai gantinya.');
}

function PdfPreviewModal({ inv, brand, onClose }) {
  const { fmtIDR, computeInvoice } = KPO;
  const comp = useMemoInv(()=>{
    const subtotal = inv.items.reduce((s,it)=>s+it.qty*it.harga,0);
    return { subtotal, total: subtotal + (+inv.ongkir||0) + (+inv.biayaTambahan||0), dibayar:0, sisa: subtotal };
  }, [inv]);
  inv.total = inv.total || comp.total;

  const Template = window.PdfKemala;

  return (
    <div className="scrim" onClick={(e)=>{ if(e.target.classList.contains('scrim')) onClose(); }}>
      <div className="modal" style={{width:720,height:'92vh',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:0}}>
            <div className="card-sub">Pratinjau PDF · A4</div>
            <div className="font-serif" style={{fontSize:18}}>{inv.invNo}</div>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            <button className="btn btn-sm" onClick={()=>downloadPdf(inv)}><Icon name="download" size={13}/> Download PDF</button>
            <button className="btn btn-sm" onClick={()=>sharePdf(inv)}><Icon name="share" size={13}/> Bagikan</button>
            <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="close" size={14}/></button>
          </div>
        </div>
        <div style={{flex:1,padding:'18px 12px',overflow:'auto',background:'var(--bg-inset)',display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div className="pdf-shell">
            <Template inv={inv} comp={comp} brand={brand}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateThumb({ id }) {
  if (id==='kemala') return (
    <svg viewBox="0 0 160 84" width="100%" height="100%">
      <rect width="160" height="84" fill="#fff"/>
      <rect width="160" height="3" fill="#7E3A0E"/>
      {/* hex logo */}
      <polygon points="14,12 22,9 30,12 30,20 22,23 14,20" fill="#A14A14"/>
      <rect x="34" y="11" width="40" height="3.5" fill="#1c1c1c"/>
      <rect x="34" y="17" width="50" height="1.5" fill="#999"/>
      <rect x="34" y="20" width="40" height="1.5" fill="#999"/>
      <rect x="108" y="11" width="42" height="3" fill="#1c1c1c"/>
      <rect x="116" y="16" width="34" height="4" fill="#A14A14" rx="1"/>
      {/* curved cream */}
      <path d="M 0 30 Q 80 38 160 30 L 160 36 L 0 36 Z" fill="#FDF6EE"/>
      {/* info cards */}
      <rect x="8" y="40" width="68" height="14" fill="none" stroke="#FDE7CE" strokeWidth=".7" rx="2"/>
      <circle cx="14" cy="47" r="3" fill="#A14A14"/>
      <rect x="20" y="44" width="40" height="1.5" fill="#1c1c1c"/>
      <rect x="20" y="48" width="32" height="1.2" fill="#aaa"/>
      <rect x="84" y="40" width="68" height="14" fill="none" stroke="#FDE7CE" strokeWidth=".7" rx="2"/>
      <circle cx="90" cy="47" r="3" fill="#A14A14"/>
      <rect x="96" y="44" width="44" height="1.5" fill="#1c1c1c"/>
      <rect x="96" y="48" width="34" height="1.2" fill="#aaa"/>
      {/* table */}
      <rect x="8" y="58" width="144" height="6" fill="#7E3A0E"/>
      <rect x="8" y="66" width="144" height="14" fill="none" stroke="#FDE7CE" strokeWidth=".7"/>
      <rect x="12" y="70" width="40" height="1.5" fill="#1c1c1c"/>
      <rect x="120" y="70" width="28" height="2" fill="#1c1c1c"/>
      <rect x="12" y="74" width="40" height="1.5" fill="#1c1c1c"/>
      <rect x="120" y="74" width="28" height="2" fill="#1c1c1c"/>
    </svg>
  );
  if (id==='classic') return (
    <svg viewBox="0 0 160 88" width="100%" height="100%">
      <rect width="160" height="88" fill="#fff"/>
      <rect x="12" y="10" width="40" height="2" fill="#111"/>
      <rect x="12" y="15" width="22" height="1.5" fill="#aaa"/>
      <rect x="110" y="10" width="38" height="1.5" fill="#aaa"/>
      <rect x="120" y="14" width="28" height="2" fill="#111"/>
      <line x1="12" x2="148" y1="22" y2="22" stroke="#111" strokeWidth="1"/>
      <rect x="12" y="30" width="50" height="1.5" fill="#888"/>
      <rect x="12" y="34" width="38" height="1.5" fill="#bbb"/>
      <rect x="110" y="30" width="38" height="4" fill="#111"/>
      <line x1="12" x2="148" y1="46" y2="46" stroke="#888" strokeWidth=".5"/>
      {[0,1,2,3].map(i=>(<g key={i}><rect x="12" y={52+i*6} width="80" height="1.2" fill="#ddd"/><rect x="130" y={52+i*6} width="18" height="1.2" fill="#ccc"/></g>))}
    </svg>
  );
  if (id==='minimal') return (
    <svg viewBox="0 0 160 88" width="100%" height="100%">
      <rect width="160" height="88" fill="#fff"/>
      <rect x="12" y="12" width="40" height="3" fill="#111"/>
      <rect x="118" y="12" width="30" height="2" fill="#999"/>
      <line x1="12" x2="148" y1="22" y2="22" stroke="#111" strokeWidth=".5"/>
      <rect x="12" y="30" width="20" height="1.5" fill="#ccc"/>
      <rect x="54" y="30" width="20" height="1.5" fill="#ccc"/>
      <rect x="96" y="30" width="20" height="1.5" fill="#ccc"/>
      <line x1="12" x2="148" y1="42" y2="42" stroke="#111" strokeWidth=".4"/>
      {[0,1,2].map(i=>(<g key={i}><rect x="12" y={50+i*8} width="60" height="1.5" fill="#ddd"/><rect x="125" y={50+i*8} width="22" height="1.5" fill="#bbb"/></g>))}
    </svg>
  );
  return (
    <svg viewBox="0 0 160 88" width="100%" height="100%">
      <rect width="160" height="88" fill="#fff"/>
      <rect width="160" height="26" fill="#0d0d0c"/>
      <rect x="12" y="10" width="38" height="3" fill="#ece6d8"/>
      <rect x="12" y="16" width="22" height="1.5" fill="#c9a96e"/>
      <rect x="120" y="14" width="28" height="3" fill="#ece6d8"/>
      <rect x="12" y="36" width="20" height="1.5" fill="#999"/>
      <rect x="54" y="36" width="20" height="1.5" fill="#999"/>
      <rect x="96" y="36" width="20" height="1.5" fill="#999"/>
      {[0,1,2].map(i=>(<g key={i}><rect x="12" y={50+i*8} width="60" height="1.5" fill="#ddd"/><rect x="125" y={50+i*8} width="22" height="1.5" fill="#c9a96e"/></g>))}
      <rect x="106" y="64" width="46" height="18" fill="#faf8f3" stroke="#e6dfca" strokeWidth=".5"/>
    </svg>
  );
}

window.PdfPreviewModal = PdfPreviewModal;
window.SignaturePad = SignaturePad;
window.TemplateThumb = TemplateThumb;
