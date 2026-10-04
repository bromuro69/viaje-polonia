/* Sincronización compartida del itinerario con Supabase.
   La clave publishable es pública por diseño; RLS limita el acceso a la fila de este viaje. */
(() => {
  const URL = 'https://shhbabrvyzsqahcdhrwz.supabase.co';
  const KEY = 'sb_publishable_3LKeNwBPPtwR8IkUrtWn8w__NPu_gzB';
  const ROW = 'polonia';
  if (!window.supabase || typeof D === 'undefined') return;

  const db = window.supabase.createClient(URL, KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const localSave = save;
  let applyingRemote = false;
  let timer = null;
  let lastRemoteStamp = '';

  function cacheLocal() {
    try { localSave(); } catch (_) {}
  }

  async function pushNow() {
    if (applyingRemote) return;
    const payload = {
      id: ROW,
      itinerary: D,
      done: done || {},
      updated_at: new Date().toISOString()
    };
    const { data, error } = await db.from('trip_state').upsert(payload, { onConflict: 'id' }).select('updated_at').single();
    if (error) {
      console.warn('Sincronización pendiente:', error.message);
      return;
    }
    if (data?.updated_at) lastRemoteStamp = data.updated_at;
  }

  function queuePush() {
    clearTimeout(timer);
    timer = setTimeout(pushNow, 180);
  }

  // app.js llama a save() después de cada cambio. Conservamos la copia local
  // para uso sin conexión y, además, enviamos el estado compartido.
  save = function () {
    cacheLocal();
    queuePush();
  };

  function applyState(row) {
    if (!row || !Array.isArray(row.itinerary) || !row.itinerary.length) return;
    applyingRemote = true;
    D = row.itinerary;
    done = row.done && typeof row.done === 'object' ? row.done : {};
    if (day >= D.length) day = Math.max(0, D.length - 1);
    lastRemoteStamp = row.updated_at || '';
    cacheLocal();
    if (typeof render === 'function') render();
    applyingRemote = false;
  }

  async function start() {
    const { data, error } = await db.from('trip_state').select('id,itinerary,done,updated_at').eq('id', ROW).maybeSingle();
    if (error) {
      console.warn('No se pudo leer el estado compartido:', error.message);
    } else if (data) {
      applyState(data);
    } else {
      // Primera apertura tras activar la sincronización: conserva el itinerario
      // del primer dispositivo y lo convierte en el estado compartido.
      await pushNow();
    }

    db.channel('polonia-family-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_state', filter: `id=eq.${ROW}` }, payload => {
        const row = payload.new;
        if (!row || row.updated_at === lastRemoteStamp) return;
        applyState(row);
      })
      .subscribe();

    // Al volver a la app después de estar en segundo plano, refrescamos por si
    // iOS suspendió el WebSocket mientras tanto.
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState !== 'visible') return;
      const { data } = await db.from('trip_state').select('id,itinerary,done,updated_at').eq('id', ROW).maybeSingle();
      if (data && data.updated_at !== lastRemoteStamp) applyState(data);
    });
  }

  start();
})();
