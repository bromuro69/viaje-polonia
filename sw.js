const STATIC_CACHE='polonia-static-v5';
const IMAGE_CACHE='polonia-images-v1';
const MAX_IMAGES=40;
const CORE=['/','/index.html','/styles.css','/readability.css','/nav-strip.css','/app.js','/sync.js','/speech-fix.js','/info.js','/reservas.js','/documentos.js','/info-format.js','/curiosidades.js','/improvisado.js','/manifest.webmanifest','/poland-mark.svg','/polonia-icon.png'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==STATIC_CACHE&&k!==IMAGE_CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

async function trimImageCache(){
  const cache=await caches.open(IMAGE_CACHE);
  const keys=await cache.keys();
  if(keys.length<=MAX_IMAGES)return;
  await Promise.all(keys.slice(0,keys.length-MAX_IMAGES).map(req=>cache.delete(req)));
}

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);

  if(url.origin===location.origin){
    event.respondWith(
      fetch(req).then(res=>{
        if(res&&res.ok){
          const copy=res.clone();
          caches.open(STATIC_CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});
        }
        return res;
      }).catch(()=>caches.match(req).then(r=>r||caches.match('/index.html')))
    );
    return;
  }

  if(req.destination==='image'){
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async cache=>{
        const cached=await cache.match(req);
        if(cached)return cached;
        try{
          const res=await fetch(req);
          if(res&&res.ok){
            await cache.put(req,res.clone());
            trimImageCache().catch(()=>{});
          }
          return res;
        }catch(err){
          return Response.error();
        }
      })
    );
  }
});