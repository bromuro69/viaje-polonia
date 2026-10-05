(()=>{
  let activeButton=null;let watchdog=null;
  function resetButton(){clearTimeout(watchdog);if(activeButton){activeButton.textContent='Escuchar';activeButton.disabled=false;activeButton=null}}
  function polishVoice(synth){const voices=synth.getVoices?.()||[];return voices.find(v=>/^pl(?:-|_)/i.test(v.lang))||voices.find(v=>/polski|polish|zosia/i.test(v.name))||null}
  function speakNow(text,button){resetButton();if(!('speechSynthesis'in window)||!window.SpeechSynthesisUtterance){alert('Este iPhone no tiene disponible la reproducción de voz.');return}const synth=window.speechSynthesis;try{synth.cancel();synth.resume()}catch(e){}const u=new SpeechSynthesisUtterance(text);u.lang='pl-PL';u.rate=.78;u.pitch=1;u.volume=1;const v=polishVoice(synth);if(v)u.voice=v;window.__polishUtterance=u;activeButton=button;button.textContent='Reproduciendo…';button.disabled=true;u.onstart=()=>{clearTimeout(watchdog);watchdog=setTimeout(()=>{try{synth.cancel()}catch(e){}resetButton()},15000)};u.onend=resetButton;u.onerror=resetButton;synth.speak(u);watchdog=setTimeout(()=>{if(!synth.speaking){try{synth.cancel()}catch(e){}resetButton()}},1800)}
  document.addEventListener('click',e=>{const button=e.target.closest('#phr .listen, #trout .listen');if(!button)return;e.preventDefault();e.stopImmediatePropagation();const row=button.closest('.ph, .result');const text=row?.querySelector('.pl')?.textContent?.trim();if(text)speakNow(text,button)},true);
  if('speechSynthesis'in window){try{speechSynthesis.getVoices()}catch(e){}speechSynthesis.addEventListener?.('voiceschanged',()=>{try{speechSynthesis.getVoices()}catch(e){}})}
})();

(()=>{const sdk=document.createElement('script');sdk.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';sdk.onload=()=>{const sync=document.createElement('script');sync.src='sync.js?v=20261005-family1';document.head.appendChild(sync)};sdk.onerror=()=>console.warn('Sin conexión: se mantiene la copia local del itinerario.');document.head.appendChild(sdk)})();

/* Normaliza TODAS las fichas Info, incluidas las que se crean/reabren después. */
(()=>{
  function normalize(meta){
    const spans=[...meta.querySelectorAll('span')];if(!spans.length)return;
    const texts=spans.map(s=>s.textContent.trim());
    let duration=texts.find(t=>t.includes('⏱')||/^Duración de la visita:/i.test(t));
    let zone=texts.find(t=>t.includes('📍')||/^Zona:/i.test(t));
    if(!duration&&!zone)return;
    duration=(duration||'').replace('⏱','').replace(/^Duración de la visita:\s*/i,'').trim();
    zone=(zone||'').replace('📍','').replace(/^Zona:\s*/i,'').trim();
    meta.replaceChildren();
    if(duration){const d=document.createElement('span');d.textContent='Duración de la visita: '+duration;d.style.cssText='display:block;width:100%';meta.appendChild(d)}
    if(zone){const z=document.createElement('span');z.textContent='📍 Zona: '+zone;z.style.cssText='display:block;width:100%;margin-top:6px';meta.appendChild(z)}
  }
  function run(){document.querySelectorAll('.infoMeta').forEach(normalize)}
  new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',()=>requestAnimationFrame(run),true);
  run();
})();

(()=>{const s=document.createElement('script');s.src='improvisado.js?v=20261005-1';document.head.appendChild(s)})();