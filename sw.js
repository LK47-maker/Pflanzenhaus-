// Pflanzenhaus – Offline-Cache. Bei jedem Update VERSION erhöhen.
const VERSION="ph-4";
const FILES=["./", "index.html", "manifest.webmanifest", "pixelify-400.woff2", "pixelify-600.woff2", "pixelify-700.woff2", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
  if(r.mode==="navigate"){ // Spiel: online holen (Updates). Bei langsamem Netz nach 4 s die gespeicherte Version starten, Update läuft im Hintergrund weiter.
    const net=fetch(r,{cache:"no-store"}).then(res=>{if(res.ok){const c=res.clone();e.waitUntil(caches.open(VERSION).then(x=>x.put("index.html",c)))}return res});
    e.respondWith(caches.match("index.html").then(old=>{
      if(!old)return net;
      const slow=new Promise(ok=>setTimeout(()=>ok(old),4000));
      return Promise.race([net.catch(()=>old),slow]);
    }));
    e.waitUntil(net.catch(()=>{}));return;}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c));return res})));
});
