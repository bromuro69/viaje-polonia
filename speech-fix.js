(()=>{
  let activeButton=null;
  let watchdog=null;
  function resetButton(){clearTimeout(watchdog);if(activeButton){activeButton.textContent='Escuchar';activeButton.disabled=false;activeButton=null}}
  function polishVoice(synth){const voices=synth.getVoices?.()||[];return voices.find(v=>/^pl(?:-|_)/i.test(v.lang))||voices.find(v=>/polski|polish|zosia/i.test(v.name))||null}
  function speakNow(text,button){resetButton();if(!('speechSynthesis'in window)||!window.SpeechSynthesisUtterance){alert('Este iPhone no tiene disponible la reproducción de voz.');return}const synth=window.speechSynthesis;try{synth.cancel();synth.resume()}catch(e){}const u=new SpeechSynthesisUtterance(text);u.lang='pl-PL';u.rate=.78;u.pitch=1;u.volume=1;const v=polishVoice(synth);if(v)u.voice=v;window.__polishUtterance=u;activeButton=button;button.textContent='Reproduciendo…';button.disabled=true;u.onstart=()=>{clearTimeout(watchdog);watchdog=setTimeout(()=>{try{synth.cancel()}catch(e){}resetButton()},15000)};u.onend=resetButton;u.onerror=resetButton;synth.speak(u);watchdog=setTimeout(()=>{if(!synth.speaking){try{synth.cancel()}catch(e){}resetButton()}},1800)}
  document.addEventListener('click',e=>{const button=e.target.closest('#phr .listen, #trout .listen');if(!button)return;e.preventDefault();e.stopImmediatePropagation();const row=button.closest('.ph, .result');const text=row?.querySelector('.pl')?.textContent?.trim();if(text)speakNow(text,button)},true);
  if('speechSynthesis'in window){try{speechSynthesis.getVoices()}catch(e){}speechSynthesis.addEventListener?.('voiceschanged',()=>{try{speechSynthesis.getVoices()}catch(e){}})}
})();

/* Carga del módulo para añadir planes improvisados al día elegido. */
(()=>{const s=document.createElement('script');s.src='improvisado.js?v=20261005-1';document.head.appendChild(s)})();