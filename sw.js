// PJ Inventario — service worker: permite abrir la app sin internet (después de haberla abierto 2 veces con internet).
// Súbelo a GitHub en la MISMA carpeta que PJ_INVENTARIO97.html (junto a él), con el nombre sw.js
const C='pj-cache-v1';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const cdn=(u.host==='www.gstatic.com'||u.host==='cdnjs.cloudflare.com'||u.host==='fonts.googleapis.com'||u.host==='fonts.gstatic.com');
  const propio=(u.origin===self.location.origin);
  if(!cdn&&!propio)return;                       // Firestore / Auth: siempre en vivo
  if(cdn){                                       // librerías: primero la copia guardada
    e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res;})));
    return;
  }
  // Página propia: primero internet (así siempre ves la última versión), y si falla o tarda más de 4 s, la copia guardada
  e.respondWith(
    Promise.race([fetch(r),new Promise((_,rej)=>setTimeout(()=>rej(new Error('lento')),4000))])
      .then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res;})
      .catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||fetch(r)))
  );
});
