(()=>{
  let currentAudio=null;

  function restore(button){
    if(button){button.textContent='Escuchar';button.disabled=false}
  }

  function nativeFallback(text,button){
    if(!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance){
      restore(button);
      alert('No se ha podido reproducir el audio. Comprueba la conexión a Internet.');
      return;
    }
    try{
      const synth=window.speechSynthesis;
      synth.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.lang='pl-PL';u.rate=.82;u.pitch=1;u.volume=1;
      const voices=synth.getVoices?.()||[];
      const voice=voices.find(v=>/^pl[-_]/i.test(v.lang))||voices.find(v=>/pol/i.test(v.name));
      if(voice)u.voice=voice;
      window.__polishUtterance=u;
      u.onend=()=>restore(button);
      u.onerror=()=>{restore(button);alert('No se ha podido reproducir el audio. Comprueba la conexión a Internet.')};
      try{synth.resume()}catch(e){}
      synth.speak(u);
    }catch(e){restore(button)}
  }

  function playPolish(text,button){
    if(!text)return;
    if(currentAudio){try{currentAudio.pause()}catch(e){} currentAudio=null}
    if('speechSynthesis' in window){try{speechSynthesis.cancel()}catch(e){}}
    if(button){button.textContent='Reproduciendo…';button.disabled=true}

    // Audio remoto en vez de depender de las voces instaladas de iOS.
    const url='https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=pl-PL&q='+encodeURIComponent(text);
    const audio=new Audio();
    currentAudio=audio;
    audio.preload='auto';
    audio.src=url;
    audio.onended=()=>{currentAudio=null;restore(button)};
    audio.onerror=()=>{currentAudio=null;nativeFallback(text,button)};

    const p=audio.play();
    if(p&&typeof p.catch==='function')p.catch(()=>{currentAudio=null;nativeFallback(text,button)});
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('#phr .listen, #trout .listen');
    if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();
    const row=b.closest('.ph, .result');
    const text=row?.querySelector('.pl')?.textContent?.trim();
    if(text)playPolish(text,b);
  },true);
})();