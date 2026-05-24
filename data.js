// ============================================
// Kemala Profile Office — data + persistence layer
// All transactional data is empty by default
// and persisted to localStorage per browser/device.
// For multi-device sync swap loadCollection/saveCollection
// to call a real backend (Supabase, Vercel Postgres, etc).
// ============================================
const KPO = (() => {

  const fmtIDR = (n) => 'IDR ' + Number(n || 0).toLocaleString('en-US');

  // -------- localStorage helpers --------
  const NS = 'kpo:v1:';
  const loadCollection = (key, fallback) => {
    try {
      const raw = localStorage.getItem(NS + key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch { return fallback; }
  };
  const saveCollection = (key, value) => {
    try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch {}
  };

  // -------- Catalog (config, not transactions) --------
  const categories = [
    { id: 'plint',   name: 'Plint Laminate', items: ['Plint 10cm','Plint 8cm','Plint 6cm','Nosing 4cm','Siku 1.5cm × 2.5cm','Custom'] },
    { id: 'parquet', name: 'Parquet',        items: ['Adaptasi','Transisi','Ending','Custom'] },
    { id: 'spc',     name: 'SPC',            items: ['Adaptasi','Transisi','Ending','Custom'] },
    { id: 'vinyl',   name: 'Vinyl',          items: ['Adaptasi','Transisi','Ending','Custom'] },
  ];

  // Product catalog stays as defaults — needed for invoice dropdowns.
  // Owner can edit/add later via Produk screen (also persisted).
  const defaultProducts = [
    { sku: 'PLT-10', kategori: 'plint',   nama: 'Plint Laminate 10cm', satuan: 'batang', harga: 85000,  hpp: 52000,  stock: 0, status: 'aktif' },
    { sku: 'PLT-08', kategori: 'plint',   nama: 'Plint Laminate 8cm',  satuan: 'batang', harga: 72000,  hpp: 44000,  stock: 0, status: 'aktif' },
    { sku: 'PLT-06', kategori: 'plint',   nama: 'Plint Laminate 6cm',  satuan: 'batang', harga: 58000,  hpp: 36000,  stock: 0, status: 'aktif' },
    { sku: 'NOS-04', kategori: 'plint',   nama: 'Nosing 4cm',          satuan: 'batang', harga: 65000,  hpp: 40000,  stock: 0, status: 'aktif' },
    { sku: 'SKU-15', kategori: 'plint',   nama: 'Siku 1.5cm × 2.5cm',  satuan: 'batang', harga: 48000,  hpp: 28000,  stock: 0, status: 'aktif' },
    { sku: 'PRQ-AD', kategori: 'parquet', nama: 'Parquet Adaptasi',    satuan: 'batang', harga: 145000, hpp: 92000,  stock: 0, status: 'aktif' },
    { sku: 'PRQ-TR', kategori: 'parquet', nama: 'Parquet Transisi',    satuan: 'batang', harga: 132000, hpp: 84000,  stock: 0, status: 'aktif' },
    { sku: 'PRQ-EN', kategori: 'parquet', nama: 'Parquet Ending',      satuan: 'batang', harga: 118000, hpp: 76000,  stock: 0, status: 'aktif' },
    { sku: 'SPC-AD', kategori: 'spc',     nama: 'SPC Adaptasi',        satuan: 'batang', harga: 168000, hpp: 108000, stock: 0, status: 'aktif' },
    { sku: 'SPC-TR', kategori: 'spc',     nama: 'SPC Transisi',        satuan: 'batang', harga: 155000, hpp: 98000,  stock: 0, status: 'aktif' },
    { sku: 'SPC-EN', kategori: 'spc',     nama: 'SPC Ending',          satuan: 'batang', harga: 142000, hpp: 90000,  stock: 0, status: 'aktif' },
    { sku: 'VNL-AD', kategori: 'vinyl',   nama: 'Vinyl Adaptasi',      satuan: 'batang', harga: 98000,  hpp: 62000,  stock: 0, status: 'aktif' },
    { sku: 'VNL-TR', kategori: 'vinyl',   nama: 'Vinyl Transisi',      satuan: 'batang', harga: 92000,  hpp: 58000,  stock: 0, status: 'aktif' },
    { sku: 'VNL-EN', kategori: 'vinyl',   nama: 'Vinyl Ending',        satuan: 'batang', harga: 84000,  hpp: 54000,  stock: 0, status: 'aktif' },
  ];
  const products = loadCollection('products', defaultProducts);

  // -------- Transactional data (empty by default) --------
  const customers = loadCollection('customers', []);
  const invoices  = loadCollection('invoices',  []);
  const tasks     = loadCollection('tasks',     []);
  const notifs    = loadCollection('notifs',    []);

  // Empty analytics — populated as invoices accumulate
  const omzet30      = [];
  const perKategori  = [];
  const topProducts  = [];
  const topCustomers = [];

  // -------- Compute helpers --------
  const computeInvoice = (inv) => {
    const subtotal = inv.items.reduce((s, it) => s + it.qty * it.harga, 0);
    const total = subtotal + (inv.ongkir || 0) + (inv.biayaTambahan || 0);
    const dibayar = (inv.pembayaran || []).reduce((s, p) => s + p.jumlah, 0);
    const sisa = Math.max(0, total - dibayar);
    return { subtotal, total, dibayar, sisa };
  };

  // -------- Unique invoice number generator --------
  // Format: ID/<KATEGORI>/V/<NNN>
  // Auto-increments per prefix; scans current invoices list (or one passed in).
  const nextInvNo = (prefix, list) => {
    const arr = list || KPO.invoices || [];
    const pfx = String(prefix || 'INV').toUpperCase();
    const re = new RegExp('^ID/' + pfx + '/V/(\\d+)$');
    let max = 0;
    for (const inv of arr) {
      const m = re.exec(inv.id || '');
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > max) max = n;
      }
    }
    return `ID/${pfx}/V/${String(max + 1).padStart(3, '0')}`;
  };

  // -------- Default brand (still editable in Settings) --------
  const defaultBrand = {
    name: 'CV Kemala Profile',
    address: 'Jl. Raya Industri No. 88, Jatiasih, Jakarta Timur',
    phone: '+62 821-3990-2488',
    email: '',
    npwp: '',
    website: 'www.kayuprofilcantik.com',
    social: 'CV KEMALA PROFILE',
    bankName: 'BCA',
    bankAccount: '0331766614',
    bankHolder: 'Binti Umi Hanik',
    directorName: 'Hani',
    directorTitle: 'Owner',
    signatureImg: 'assets/signature.png',
    defaultTemplate: 'kemala',
    brandColor: '#A14A14',
    brandColorDark: '#7E3A0E',
    brandColorSoft: '#FDF6EE',
    invoicePrefix: 'INV',
  };

  // -------- Auth (single-owner local auth) --------
  // To change credentials: edit USERS below OR set in localStorage:
  //   localStorage.setItem('kpo:v1:users', JSON.stringify([{username:'x',password:'y',role:'owner'}]))
  const defaultUsers = [
    { username: 'hani', password: 'hani123', role: 'owner', name: 'Hani' },
  ];
  const users = loadCollection('users', defaultUsers);
  const authenticate = (username, password) => {
    const u = users.find(x =>
      x.username.toLowerCase() === String(username || '').trim().toLowerCase() &&
      x.password === password
    );
    return u || null;
  };

  return {
    fmtIDR, categories, products, customers, invoices,
    computeInvoice, tasks, notifs,
    omzet30, perKategori, topProducts, topCustomers,
    defaultBrand, defaultProducts, nextInvNo,
    loadCollection, saveCollection,
    authenticate, users,
  };
})();

window.KPO = KPO;
