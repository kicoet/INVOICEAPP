// ===== Kemala Brand PDF Template — orange/brown corporate =====
// Matches the user-provided design exactly.

function PdfKemala({ inv, comp, brand }) {
  const { fmtIDR } = KPO;
  const orange = brand.brandColor || '#A14A14';
  const orangeDark = brand.brandColorDark || '#7E3A0E';
  const orangeSoft = brand.brandColorSoft || '#FDF6EE';

  // Indonesian rupiah formatting: Rp 4.225.000
  const rp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

  const dibayar = (inv.pembayaran || []).reduce((s, p) => s + p.jumlah, 0);

  return (
    <div className="pdf-page" style={{ padding: 0, width: 760, minHeight: 1075, fontFamily: "'Geist', sans-serif", color: '#222' }}>
      {/* Top accent bar */}
      <div style={{ height: 8, background: orangeDark }} />

      {/* HEADER */}
      <div style={{ padding: '28px 40px 22px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'flex-start' }}>
          {/* Left: brand */}
          <div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* Hexagon logo or custom uploaded logo */}
              {brand.logoImg ? (
                <img src={brand.logoImg} style={{width:58,height:58,objectFit:'contain',flexShrink:0}} />
              ) : (
              <svg width="58" height="58" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
                <defs>
                  <linearGradient id="hex-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={orange} />
                    <stop offset="100%" stopColor={orangeDark} />
                  </linearGradient>
                </defs>
                <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="url(#hex-grad)" />
                <polygon points="32,12 50,22 50,42 32,52 14,42 14,22" fill="none" stroke="#fff" strokeWidth="1.4" opacity=".55" />
                <text x="32" y="40" textAnchor="middle" fill="#fff" fontFamily="Instrument Serif, serif" fontSize="24" fontStyle="italic">{(brand.name || 'K')[0]}</text>
              </svg>
              )}
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1c1c1c', letterSpacing: '0.01em' }}>{brand.name.toUpperCase()}</div>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3, fontSize: 10.5, color: '#3a3a3a' }}>
                  <BrandLine icon="pin" color={orange}>{brand.address}</BrandLine>
                  <BrandLine icon="phone" color={orange}>{brand.phone}{brand.email ? <><span style={{ color: '#ccc', margin: '0 4px' }}>|</span><span style={{ color: '#3a3a3a' }}>Email: {brand.email}</span></> : null}</BrandLine>
                </div>
                {brand.npwp && <div style={{ marginTop: 6, fontSize: 10.5, color: '#3a3a3a' }}>NPWP: <span style={{ fontFamily: "'Geist Mono', monospace" }}>{brand.npwp}</span></div>}
              </div>
            </div>
          </div>

          {/* Right: invoice meta */}
          <div style={{ textAlign: 'right', minWidth: 240 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1c1c1c', letterSpacing: '0.01em' }}>TAGIHAN / INVOICE</div>
            <div style={{ marginTop: 10, display: 'inline-block', background: orange, color: '#fff', padding: '5px 14px', borderRadius: 5, fontWeight: 600, fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '0.04em' }}>{inv.invNo}</div>
            <div style={{ marginTop: 12, display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: 11, color: '#3a3a3a', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalIcon color={orange} />
                <span style={{ minWidth: 78 }}>Tanggal</span>
                <span style={{ color: '#aaa' }}>:</span>
                <span className="num">{inv.tanggal || '2026-05-23'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Curved cream backdrop behind header */}
        <svg width="100%" height="40" viewBox="0 0 760 40" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, top: 140, zIndex: -1 }}>
          <path d="M 0 0 Q 380 60 760 0 L 760 40 L 0 40 Z" fill={orangeSoft} />
        </svg>
      </div>

      {/* CONTENT padding */}
      <div style={{ padding: '4px 30px 0' }}>
        {/* Ditagihkan + Alamat */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 6 }}>
          <InfoCard icon="user" color={orange} label="DITAGIHKAN KEPADA:">
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1c1c1c' }}>{inv.customer.nama || 'Customer'}</div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{inv.customer.perusahaan}</div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>No. WA: <span className="num">{inv.customer.wa || '—'}</span></div>
          </InfoCard>
          <InfoCard icon="pin" color={orange} label="ALAMAT PENGIRIMAN:">
            <div style={{ fontSize: 11, color: '#444', marginTop: 6, lineHeight: 1.5 }}>{inv.customer.alamat || '—'}</div>
          </InfoCard>
        </div>

        {/* Items table */}
        <div style={{ marginTop: 14, border: `1px solid ${orangeSoft}`, borderRadius: 6, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ background: orangeDark, color: '#fff', display: 'grid', gridTemplateColumns: '46px 1fr 130px 110px 130px 130px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em' }}>
            <Th>NO.</Th>
            <Th>PRODUK &amp; VARIAN</Th>
            <Th>KATEGORI</Th>
            <Th right>JUMLAH (QTY)</Th>
            <Th right>HARGA SATUAN</Th>
            <Th right>SUBTOTAL</Th>
          </div>
          {inv.items.map((it, i) =>
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '46px 1fr 130px 110px 130px 130px', padding: '14px 0', borderBottom: i < inv.items.length - 1 ? `1px dashed ${orangeSoft}` : 'none', alignItems: 'center', fontSize: 12 }}>
              <Td>{i + 1}</Td>
              <Td><strong style={{ color: '#1c1c1c', fontSize: 12.5 }}>{it.nama}</strong></Td>
              <Td>{kategoriOf(it)}</Td>
              <Td right><span className="num">{it.qty}</span> <span style={{ color: '#888' }}>batang</span></Td>
              <Td right><span className="num">{rp(it.harga)}</span></Td>
              <Td right><strong className="num" style={{ color: '#1c1c1c' }}>{rp(it.qty * it.harga)}</strong></Td>
            </div>
          )}
        </div>

        {/* Catatan + Totals */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
          <div>
            <div style={{ border: `1px solid ${orangeSoft}`, borderRadius: 6, padding: '14px 14px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <NoteIcon color={orange} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: '#1c1c1c', letterSpacing: '0.04em' }}>CATATAN PENTING &amp; METODE TRANSFER</span>
              </div>
              <div style={{ fontSize: 10.5, color: '#666', marginTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>
                {inv.catatan ? `* ${inv.catatan}` : `* Pembayaran via transfer ke rekening resmi di bawah. Mohon konfirmasi setelah pembayaran.`}
              </div>
              <div style={{ borderTop: `1px dashed ${orangeSoft}`, marginTop: 12, paddingTop: 12 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#1c1c1c', letterSpacing: '0.04em' }}>REKENING RESMI PEMBAYARAN:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <BankBadge bank={brand.bankName} color={orange} />
                  <div>
                    <div className="num" style={{ fontSize: 15, fontWeight: 700, color: orange }}>{brand.bankAccount}</div>
                    <div style={{ fontSize: 10, color: '#666' }}>a.n {brand.bankHolder}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div style={{ padding: '2px 8px' }}>
              <TotalRow label="Subtotal Produk" value={rp(comp.subtotal)} />
              <TotalRow label="Biaya Pengiriman" value={rp(inv.ongkir || 0)} />
              {inv.biayaTambahan > 0 && <TotalRow label="Biaya Tambahan" value={rp(inv.biayaTambahan)} />}
              <div style={{ borderTop: `1.5px dashed ${orangeSoft}`, margin: '10px 0 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0 14px' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1c1c1c' }}>TOTAL TAGIHAN</span>
                <span className="num" style={{ fontSize: 20, fontWeight: 700, color: orange }}>{rp(inv.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thanks + Signature */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingTop: 18, borderTop: `1px solid ${orangeSoft}` }}>
            <HeartIcon color={orange} />
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', color: '#1c1c1c' }}>TERIMA KASIH</div>
              <div style={{ fontSize: 10.5, fontStyle: 'italic', color: '#666', marginTop: 4, lineHeight: 1.5 }}>
                Atas kepercayaan Anda kepada kami.<br />Semoga kerja sama ini terus berlanjut.
              </div>
            </div>
          </div>
          <div style={{ border: `1px solid ${orangeSoft}`, borderRadius: 6, padding: '10px 14px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#1c1c1c', letterSpacing: '0.04em' }}>{brand.name.toUpperCase()}</div>
            <div style={{ height: 46, display: 'grid', placeItems: 'center', marginTop: 2 }}>
              {brand.signatureImg ?
              <img src={brand.signatureImg} style={{ maxHeight: 46, maxWidth: 180 }} /> :
              <span style={{ fontSize: 10, color: '#bbb', fontStyle: 'italic' }}>(tanda tangan)</span>}
            </div>
            <div style={{ borderTop: `1px solid ${orange}`, paddingTop: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1c1c1c' }}>{brand.directorName}</div>
              <div style={{ fontSize: 10.5, color: '#666' }}>{brand.directorTitle || 'Direktur'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div style={{ marginTop: 18, background: orangeDark, color: '#fff', padding: '10px 24px', display: 'flex', justifyContent: 'center', gap: 18, fontSize: 10.5, alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GlobeIcon /> {brand.website}</span>
        <span style={{ opacity: .5 }}>|</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FbIcon /> {brand.social}</span>
      </div>
    </div>);

}

function kategoriOf(it) {
  if (it.kategori === 'plint') return 'Plint';
  if (it.kategori === 'parquet') return 'Parquet';
  if (it.kategori === 'spc') return 'SPC';
  if (it.kategori === 'vinyl') return 'Vinyl';
  const n = (it.nama || '').toLowerCase();
  if (n.includes('spc')) return 'SPC';
  if (n.includes('parquet')) return 'Parquet';
  if (n.includes('vinyl')) return 'Vinyl';
  if (n.includes('plint') || n.includes('nosing') || n.includes('siku')) return 'Plint';
  return '—';
}

function Th({ children, right }) {
  return <div style={{ padding: '12px 14px', textAlign: right ? 'right' : 'left' }}>{children}</div>;
}
function Td({ children, right }) {
  return <div style={{ padding: '0 14px', textAlign: right ? 'right' : 'left' }}>{children}</div>;
}

function TotalRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, color: '#3a3a3a' }}>
      <span>{label}</span>
      <span className="num">{value}</span>
    </div>);

}

function InfoCard({ icon, color, label, children }) {
  return (
    <div style={{ border: '1px solid ' + (color + '33'), borderRadius: 6, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        {icon === 'user' ? <PersonIcon /> : <PinIcon />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#1c1c1c', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ marginTop: 4 }}>{children}</div>
      </div>
    </div>);

}

function BrandLine({ icon, color, children }) {
  const map = { pin: <PinIconMini c={color} />, phone: <PhoneIcon c={color} /> };
  return <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{map[icon]}<span>{children}</span></div>;
}

// Small SVG icons
const _stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
function PersonIcon() {return <svg width="14" height="14" viewBox="0 0 24 24" style={{ color: '#fff' }}><circle cx="12" cy="9" r="3.2" {..._stroke} /><path d="M5 19c1-3 4-4.5 7-4.5s6 1.5 7 4.5" {..._stroke} /></svg>;}
function PinIcon() {return <svg width="14" height="14" viewBox="0 0 24 24" style={{ color: '#fff' }}><path d="M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z" {..._stroke} /><circle cx="12" cy="9" r="2.5" {..._stroke} /></svg>;}
function PinIconMini({ c }) {return <svg width="11" height="11" viewBox="0 0 24 24" style={{ color: c }}><path d="M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z" {..._stroke} /><circle cx="12" cy="9" r="2.5" {..._stroke} /></svg>;}
function PhoneIcon({ c }) {return <svg width="11" height="11" viewBox="0 0 24 24" style={{ color: c }}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2 16 16 0 01-15-15 2 2 0 012-2z" {..._stroke} /></svg>;}
function CalIcon({ color }) {return <svg width="12" height="12" viewBox="0 0 24 24" style={{ color }}><rect x="3" y="5" width="18" height="16" rx="2" {..._stroke} /><path d="M3 9h18M8 3v4M16 3v4" {..._stroke} /></svg>;}
function RefreshIcon({ color }) {return <svg width="12" height="12" viewBox="0 0 24 24" style={{ color }}><path d="M4 4v6h6M20 20v-6h-6M5 14a8 8 0 0014 0M19 10A8 8 0 005 10" {..._stroke} /></svg>;}
function NoteIcon({ color }) {return <svg width="20" height="20" viewBox="0 0 24 24" style={{ color }}><rect x="5" y="3" width="14" height="18" rx="2" {..._stroke} /><path d="M8 8h8M8 12h8M8 16h5" {..._stroke} /><path d="M16 2l3 3-1 2-3-3 1-2z" {..._stroke} /></svg>;}
function CalHistIcon({ color }) {return <svg width="14" height="14" viewBox="0 0 24 24" style={{ color }}><rect x="3" y="5" width="18" height="16" rx="2" {..._stroke} /><path d="M3 9h18M8 3v4M16 3v4" {..._stroke} /><circle cx="12" cy="14" r="3" {..._stroke} /><path d="M12 12.5v1.5l1 .8" {..._stroke} /></svg>;}
function HeartIcon({ color }) {return <svg width="32" height="32" viewBox="0 0 24 24" style={{ color }}><path d="M12 21s-7-4.5-7-10a4.5 4.5 0 017.5-3.5A4.5 4.5 0 0119 11c0 5.5-7 10-7 10z" {..._stroke} /><path d="M9 13c1 1 2 1.5 3 1.5s2-.5 3-1.5" {..._stroke} /></svg>;}
function GlobeIcon() {return <svg width="14" height="14" viewBox="0 0 24 24" style={{ color: '#fff' }}><circle cx="12" cy="12" r="9" {..._stroke} /><path d="M3 12h18M12 3a13 13 0 010 18M12 3a13 13 0 000 18" {..._stroke} /></svg>;}
function FbIcon() {return <svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#fff" /><path d="M13 21v-7h2.5l.4-3H13V9.2c0-.9.3-1.5 1.5-1.5H16V5.1A20 20 0 0014 5c-2 0-3.4 1.2-3.4 3.5V11H8.2v3H10.6v7" fill={'#A14A14'} /></svg>;}

function BankBadge({ bank, color }) {
  // Render a simple BCA-style badge or generic
  if ((bank || '').toUpperCase() === 'BCA') return (
    <div style={{ background: '#fff', border: '1px solid ' + color + '33', padding: '3px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <span style={{ color: '#0f4ba8', fontWeight: 900, fontStyle: 'italic', fontSize: 18, letterSpacing: '-0.02em' }}>BCA</span>
    </div>);

  if ((bank || '').toUpperCase() === 'MANDIRI') return <div style={{ background: '#fff', border: '1px solid ' + color + '33', padding: '4px 8px', borderRadius: 4, color: '#003d79', fontWeight: 800, fontSize: 13 }}>mandiri</div>;
  if ((bank || '').toUpperCase() === 'BNI') return <div style={{ background: '#fff', border: '1px solid ' + color + '33', padding: '4px 8px', borderRadius: 4, color: '#f47b15', fontWeight: 800, fontSize: 13 }}>BNI</div>;
  if ((bank || '').toUpperCase() === 'BRI') return <div style={{ background: '#fff', border: '1px solid ' + color + '33', padding: '4px 8px', borderRadius: 4, color: '#003d79', fontWeight: 800, fontSize: 13 }}>BRI</div>;
  return <div style={{ background: '#fff', border: '1px solid ' + color + '33', padding: '4px 8px', borderRadius: 4, color: color, fontWeight: 800, fontSize: 13 }}>{bank}</div>;
}

window.PdfKemala = PdfKemala;