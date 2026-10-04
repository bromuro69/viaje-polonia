(()=>{
  function polishVoice(){
    const voices=window.speechSynthesis?.getVoices?.()||[];
    return voices.find(v=>/^pl[-_]/i.test(v.lang))||voices.find(v=>/pol/i.test(v.name))||null;
  }
  function playPolish(text,button){
    if(!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance){
      alert('Este dispositivo no tiene disponible la reproducción de voz.');return;
    }
    const synth=window.speechSynthesis;
    synth.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='pl-PL';u.rate=.82;u.pitch=1;u.volume=1;
    const v=polishVoice();if(v)u.voice=v;
    if(button){button.textContent='Reproduciendo…';button.disabled=true}
    const restore=()=>{if(button){button.textContent='Escuchar';button.disabled=false}};
    u.onend=restore;u.onerror=restore;
    // Safari/iOS puede dejar speechSynthesis pausado al volver a una PWA.
    try{synth.resume()}catch(e){}
    // Mantener una referencia evita que WebKit libere la utterance prematuramente.
    window.__polishUtterance=u;
    synth.speak(u);
    setTimeout(()=>{if(synth.paused)try{synth.resume()}catch(e){}},120);
  }
  // Captura el toque antes del manejador antiguo de app.js.
  document.addEventListener('click',e=>{
    const b=e.target.closest('#phr .listen');
    if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();
    const row=b.closest('.ph');
    const text=row?.querySelector('.pl')?.textContent?.trim();
    if(text)playPolish(text,b);
  },true);
  // Precarga las voces cuando WebKit las publique.
  if('speechSynthesis' in window){speechSynthesis.getVoices();speechSynthesis.addEventListener?.('voiceschanged',()=>speechSynthesis.getVoices())}
})();