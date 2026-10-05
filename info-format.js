(()=>{
  function ajustarFicha(){
    const meta=document.querySelector('#infoModal .infoMeta');
    if(!meta)return;
    const datos=[...meta.querySelectorAll('span')].map(el=>el.textContent.trim());
    const duracion=datos.find(t=>t.includes('⏱'));
    const zona=datos.find(t=>t.includes('📍'));
    meta.replaceChildren();
    if(duracion){
      const d=document.createElement('span');
      d.textContent='Duración de la visita: '+duracion.replace('⏱','').trim();
      d.style.cssText='display:block;width:100%';
      meta.appendChild(d);
    }
    if(zona){
      const z=document.createElement('span');
      z.textContent='📍 Zona: '+zona.replace('📍','').trim();
      z.style.cssText='display:block;width:100%;margin-top:6px';
      meta.appendChild(z);
    }
  }
  document.addEventListener('click',e=>{
    if(!e.target.closest('.infoBtn'))return;
    setTimeout(ajustarFicha,0);
  });
})();