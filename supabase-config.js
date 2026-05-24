// ============================================
// Supabase configuration
// Public anon key — safe to commit (RLS controls access).
// To rotate: change here & redeploy.
// ============================================
window.SUPABASE_URL = 'https://atxftbpjezdcclwdtgkz.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0eGZ0YnBqZXpkY2Nsd2R0Z2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1OTM4NjQsImV4cCI6MjA5NTE2OTg2NH0.g_d1sNrMM45Ft5JchzMOmWGARdgLfxgb5Wgoha0JP1k';

// ---- Tiny Supabase REST client for the app_data key-value table ----
window.DB = (() => {
  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_ANON_KEY;
  const headers = {
    apikey: key,
    Authorization: 'Bearer ' + key,
    'Content-Type': 'application/json',
  };
  const endpoint = url + '/rest/v1/app_data';

  // Fetch one value by key — returns { value, updatedAt } or null.
  const get = async (k) => {
    try {
      const r = await fetch(`${endpoint}?key=eq.${encodeURIComponent(k)}&select=value,updated_at`, { headers });
      if (!r.ok) return null;
      const rows = await r.json();
      if (!rows.length) return null;
      return { value: rows[0].value, updatedAt: rows[0].updated_at };
    } catch (e) {
      console.warn('[DB.get] offline or failed:', k, e);
      return null;
    }
  };

  // Upsert one key.
  const set = async (k, value) => {
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ key: k, value }),
      });
      if (!r.ok) console.warn('[DB.set] HTTP', r.status, await r.text());
      return r.ok;
    } catch (e) {
      console.warn('[DB.set] offline or failed:', k, e);
      return false;
    }
  };

  // Fetch ALL keys at once (used at app boot).
  const getAll = async () => {
    try {
      const r = await fetch(`${endpoint}?select=key,value`, { headers });
      if (!r.ok) return {};
      const rows = await r.json();
      const out = {};
      rows.forEach(row => { out[row.key] = row.value; });
      return out;
    } catch (e) {
      console.warn('[DB.getAll] offline or failed:', e);
      return null; // null = couldn't reach (don't overwrite local)
    }
  };

  return { get, set, getAll, isConfigured: !!url && !!key };
})();
