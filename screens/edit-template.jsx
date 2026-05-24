// ===== Edit Invoice Template — unified editor with live PDF preview =====
const { useState: useStateEdit, useRef: useRefEdit } = React;

function EditTemplateScreen({ brand, setBrand, pushToast }) {
  const update = (patch) => setBrand({ ...brand, ...patch });
  const fileSigRef = useRefEdit(null);
  const fileLogoRef = useRefEdit(null);
  const [sigDrawing, setSigDrawing] = useStateEdit(false);
  const [sigDraft, setSigDraft] = useStateEdit(null);
  const [zoom, setZoom] = useStateEdit(0.7);

  const handleSigFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { update({ signatureImg: reader.result }); pushToast({ title: 'Tanda tangan diperbarui' }); };
    reader.readAsDataURL(f);
  };
  const handleLogoFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { update({ logoImg: reader.result }); pushToast({ title: 'Logo diperbarui' }); };
    reader.readAsDataURL(f);
  };

  // Sample invoice for preview
  const sampleInv = {
    invNo: `${brand.invoicePrefix}/SPC/V/001`,
    tanggal: '2026-05-23',
    jatuhTempo: '2026-06-06',
    customer: { nama: 'Budi Santoso', perusahaan: 'PT Graha Indah Desain', wa: '081234567890', alamat: 'Jl. Senopati No. 45, Jakarta Selatan' },
    items: [
      { nama: 'SPC Flooring Walnut 4mm', ukuran: '1220 × 180 × 4mm', qty: 20, harga: 185000, kategori: 'spc' },
      { nama: 'Adaptasi SPC 4mm Teak Wood', ukuran: '900 × 40mm', qty: 5, harga: 65000, kategori: 'spc' },
    ],
    ongkir: 150000, biayaTambahan: 50000, catatan: 'Pengiriman lantai 2, harap koordinasi dengan tim logistik.',
    pembayaran: [{ tipe: 'Pelunasan', jumlah: 4225000, tgl: '2026-05-20' }],
  };
  const subtotal = sampleInv.items.reduce((s,it)=>s+it.qty*it.harga,0);
  sampleInv.total = subtotal + sampleInv.ongkir + sampleInv.biayaTambahan;
  const comp = { subtotal, total: sampleInv.total, dibayar: 4225000, sisa: 0 };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 18, alignItems: 'flex-start' }}>
      {/* LEFT: editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        <EditSection title="Identitas Perusahaan" icon="box">
          <EditField label="Nama perusahaan">
            <input className="input" value={brand.name} onChange={e=>update({name:e.target.value})}/>
          </EditField>
          <EditField label="Alamat lengkap">
            <textarea className="textarea" value={brand.address} onChange={e=>update({address:e.target.value})}/>
          </EditField>
          <EditField label="Logo">
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <div style={{width:48,height:48,background:'var(--bg-inset)',border:'1px solid var(--line)',borderRadius:6,display:'grid',placeItems:'center',overflow:'hidden'}}>
                {brand.logoImg ? <img src={brand.logoImg} style={{maxWidth:42,maxHeight:42}}/> : (
                  <svg width="32" height="32" viewBox="0 0 64 64">
                    <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill={brand.brandColor}/>
                    <text x="32" y="40" textAnchor="middle" fill="#fff" fontFamily="Instrument Serif, serif" fontSize="22" fontStyle="italic">{brand.name[0]||'K'}</text>
                  </svg>
                )}
              </div>
              <div style={{flex:1,display:'flex',gap:6}}>
                <button className="btn btn-sm" style={{flex:1}} onClick={()=>fileLogoRef.current.click()}><Icon name="upload" size={12}/> Upload</button>
                {brand.logoImg && <button className="btn btn-sm btn-ghost" onClick={()=>update({logoImg:null})}><Icon name="trash" size={12}/></button>}
                <input ref={fileLogoRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleLogoFile}/>
              </div>
            </div>
            <div style={{fontSize:11,color:'var(--ink-mute)',marginTop:6}}>Kosongkan untuk pakai logo hexagon default.</div>
          </EditField>
        </EditSection>

        <EditSection title="Kontak" icon="bell">
          <EditField label="Nomor telepon">
            <input className="input num" value={brand.phone} onChange={e=>update({phone:e.target.value})}/>
          </EditField>
          <EditField label="Email" sub="Kosongkan jika tidak ingin ditampilkan">
            <input className="input" value={brand.email} onChange={e=>update({email:e.target.value})} placeholder="info@perusahaan.com"/>
          </EditField>
          <EditField label="NPWP" sub="Kosongkan jika tidak ditampilkan">
            <input className="input num" value={brand.npwp} onChange={e=>update({npwp:e.target.value})} placeholder="00.000.000.0-000.000"/>
          </EditField>
        </EditSection>

        <EditSection title="Rekening Pembayaran" icon="money">
          <EditField label="Bank">
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['BCA','Mandiri','BNI','BRI','CIMB','Permata'].map(b=>(
                <button key={b} className={'btn btn-sm '+(brand.bankName===b?'btn-primary':'')} onClick={()=>update({bankName:b})}>{b}</button>
              ))}
            </div>
          </EditField>
          <EditField label="Nomor rekening">
            <input className="input num" value={brand.bankAccount} onChange={e=>update({bankAccount:e.target.value})}/>
          </EditField>
          <EditField label="Atas nama">
            <input className="input" value={brand.bankHolder} onChange={e=>update({bankHolder:e.target.value})}/>
          </EditField>
        </EditSection>

        <EditSection title="Tanda Tangan" icon="pen">
          <div style={{background:'#fff',border:'1px solid var(--line)',borderRadius:6,padding:14,display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'center'}}>
            <div style={{minHeight:60,display:'grid',placeItems:'center'}}>
              {brand.signatureImg
                ? <img src={brand.signatureImg} style={{maxHeight:60,maxWidth:'100%'}}/>
                : <span style={{fontSize:11,color:'#aaa',fontStyle:'italic'}}>Belum ada tanda tangan</span>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <button className="btn btn-sm" onClick={()=>fileSigRef.current.click()}><Icon name="upload" size={12}/> Upload</button>
              <button className="btn btn-sm" onClick={()=>{setSigDrawing(true);setSigDraft(null);}}><Icon name="pen" size={12}/> Gambar</button>
              {brand.signatureImg && <button className="btn btn-sm btn-ghost" style={{color:'var(--negative)'}} onClick={()=>update({signatureImg:null})}><Icon name="trash" size={12}/> Hapus</button>}
              <input ref={fileSigRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleSigFile}/>
            </div>
          </div>
          <EditField label="Nama penandatangan">
            <input className="input" value={brand.directorName} onChange={e=>update({directorName:e.target.value})}/>
          </EditField>
          <EditField label="Jabatan">
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['Owner','Direktur','Direktur Utama','Manager','Admin'].map(j=>(
                <button key={j} className={'btn btn-sm '+(brand.directorTitle===j?'btn-primary':'')} onClick={()=>update({directorTitle:j})}>{j}</button>
              ))}
            </div>
          </EditField>

          {sigDrawing && (
            <div style={{marginTop:8}}>
              <SignaturePad value={sigDraft} onChange={setSigDraft}/>
              <div style={{display:'flex',gap:6,marginTop:8}}>
                <button className="btn btn-sm" onClick={()=>{setSigDrawing(false);setSigDraft(null);}}>Batal</button>
                <button className="btn btn-sm btn-primary" style={{marginLeft:'auto'}} disabled={!sigDraft} onClick={()=>{update({signatureImg:sigDraft});setSigDrawing(false);setSigDraft(null);pushToast({title:'Tanda tangan diperbarui'});}}><Icon name="check" size={12}/> Simpan</button>
              </div>
            </div>
          )}
        </EditSection>

        <EditSection title="Penomoran Invoice" icon="invoice">
          <EditField label="Prefix" sub={'Hasil: '+brand.invoicePrefix+'/SPC/V/001'}>
            <input className="input" value={brand.invoicePrefix} onChange={e=>update({invoicePrefix:e.target.value.toUpperCase()})} style={{maxWidth:160}}/>
          </EditField>
        </EditSection>

        <EditSection title="Footer" icon="share">
          <EditField label="Website">
            <input className="input" value={brand.website} onChange={e=>update({website:e.target.value})}/>
          </EditField>
          <EditField label="Social media / Brand name di footer">
            <input className="input" value={brand.social} onChange={e=>update({social:e.target.value})}/>
          </EditField>
        </EditSection>

        <EditSection title="Warna Brand" icon="sparkle">
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
            {[
              { color:'#A14A14', dark:'#7E3A0E', soft:'#FDF6EE', name:'Terracotta' },
              { color:'#1F4E3F', dark:'#143028', soft:'#EAF2EE', name:'Hutan' },
              { color:'#1E3A8A', dark:'#152958', soft:'#E8EDF7', name:'Navy' },
              { color:'#7C3AED', dark:'#5B22B8', soft:'#F0E8FB', name:'Ungu' },
              { color:'#0F172A', dark:'#020617', soft:'#E8EAEF', name:'Charcoal' },
              { color:'#C2410C', dark:'#9A2D08', soft:'#FFF1E8', name:'Amber' },
            ].map(s=>(
              <button key={s.color} className="card" onClick={()=>update({brandColor:s.color,brandColorDark:s.dark,brandColorSoft:s.soft})} style={{padding:8,cursor:'pointer',background:'var(--bg-elev)',border:brand.brandColor===s.color?'2px solid var(--accent)':'1px solid var(--line)',display:'flex',gap:8,alignItems:'center'}}>
                <div style={{display:'flex',gap:2}}>
                  <div style={{width:14,height:18,background:s.color,borderRadius:2}}/>
                  <div style={{width:8,height:18,background:s.dark,borderRadius:2}}/>
                  <div style={{width:8,height:18,background:s.soft,borderRadius:2,border:'1px solid var(--line)'}}/>
                </div>
                <span style={{fontSize:11.5}}>{s.name}</span>
              </button>
            ))}
          </div>
          <EditField label="Custom warna">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
              <ColorInput label="Primary" value={brand.brandColor} onChange={v=>update({brandColor:v})}/>
              <ColorInput label="Dark" value={brand.brandColorDark} onChange={v=>update({brandColorDark:v})}/>
              <ColorInput label="Soft" value={brand.brandColorSoft} onChange={v=>update({brandColorSoft:v})}/>
            </div>
          </EditField>
        </EditSection>

<div style={{padding:'14px 16px',background:'var(--accent-soft)',borderRadius:8,border:'1px solid var(--line)',fontSize:11.5,color:'var(--ink-mute)',lineHeight:1.6}}>
          <Icon name="sparkle" size={13}/> &nbsp;Perubahan <b style={{color:'var(--ink)'}}>langsung diterapkan</b> ke semua invoice baru. Untuk invoice yang sudah dicetak, snapshot data lama tetap tersimpan.
        </div>
      </div>

      {/* RIGHT: live preview */}
      <div style={{ position: 'sticky', top: 90, alignSelf: 'flex-start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="card-sub">Live preview</div>
            <span style={{ fontSize: 11, color: 'var(--ink-mute)' }}>—</span>
            <span className="font-serif" style={{ fontSize: 14 }}>{sampleInv.invNo}</span>
            <div className="seg" style={{ marginLeft: 'auto' }}>
              {[0.5, 0.7, 1].map(z => (
                <button key={z} className={zoom===z?'active':''} onClick={()=>setZoom(z)}>{Math.round(z*100)}%</button>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--bg-inset)', padding: 18, height: 'calc(100vh - 200px)', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: 760, flexShrink: 0 }}>
              <window.PdfKemala inv={sampleInv} comp={comp} brand={brand}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditSection({ title, icon, children }) {
  return (
    <div className="card">
      <div className="card-header" style={{ padding: '12px 16px' }}>
        <Icon name={icon} size={14} className=""/>
        <span className="card-title" style={{ marginLeft: 4 }}>{title}</span>
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function EditField({ label, sub, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}{sub && <span style={{ textTransform:'none', color:'var(--ink-dim)', marginLeft:6, letterSpacing:0 }}>· {sub}</span>}</label>
      {children}
    </div>
  );
}

function ColorInput({ label, value, onChange }) {
  return (
    <div>
      <div style={{fontSize:10,color:'var(--ink-dim)',letterSpacing:'0.1em',marginBottom:4,textTransform:'uppercase'}}>{label}</div>
      <div style={{display:'flex',gap:4,alignItems:'center'}}>
        <input type="color" value={value} onChange={e=>onChange(e.target.value)} style={{width:28,height:30,border:'1px solid var(--line)',background:'transparent',borderRadius:4,padding:0,cursor:'pointer'}}/>
        <input className="input num" value={value} onChange={e=>onChange(e.target.value)} style={{padding:'6px 8px',fontSize:11.5,flex:1}}/>
      </div>
    </div>
  );
}

window.EditTemplateScreen = EditTemplateScreen;
