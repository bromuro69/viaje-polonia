/* Documentos privados del viaje. La clave no está incluida en el código. */
(()=>{
const ENDPOINT='https://shhbabrvyzsqahcdhrwz.supabase.co/functions/v1/polonia-family';
const KEY='polonia-family-session-v1';
let token=localStorage.getItem(KEY)||'',docs=[],checked=false;
const css=document.createElement('style');css.textContent=`.familyBtn{margin:5px 0 5px 8px;padding:8px 11px;border:1px solid #9a8179;border-radius:10px;background:#f7ede8;color:#68443a;font-weight:700;cursor:pointer}.familyShade{position:fixed;inset:0;z-index:3000;background:#0009;display:flex;align-items:flex-end;justify-content:center}.familyPanel{background:#fffaf6;color:#252323;border-radius:22px 22px 0 0;width:100%;max-width:550px;box-sizing:border-box;padding:25px 20px calc(30px + env(safe-area-inset-bottom));max-height:85dvh;overflow:auto}.familyPanel h2{font-size:24px;margin:0 0 12px}.familyPanel input{display:block;width:100%;box-sizing:border-box;padding:15px;border:1px solid #aaa;border-radius:12px;margin:12px 0;font-size:21px;letter-spacing:4px}.familyPanel button{padding:12px 16px;border:1px solid #bca49b;border-radius:12px;background:#eadbd4;color:#452b24;font-weight:700;margin:5px 8px 5px 0}.familyPanel .familyError{color:#9b3434;font-weight:700}.familyPanel .familyDoc{display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid #ddd;padding:8px 0}.familyPanel .familyDoc{display:block;padding:15px 0}.familyPanel .familyDoc span{display:block;font-weight:700;margin-bottom:10px;overflow-wrap:anywhere}.familyPanel .familyPreview{width:100%;overflow:hidden}.familyPanel .familyDoc button{margin-top:10px}`;document.head.append(css);
async function call(action,params={}){const res=await fetch(ENDPOINT,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,token,...params})});const j=await res.json().catch(()=>({}));if(!res.ok)throw Error(j.error||'Error de conexión');return j}
function show(activity){document.querySelector('.familyShade')?.remove();const shade=document.createElement('div'),panel=document.createElement('div');shade.className='familyShade';panel.className='familyPanel';shade.append(panel);shade.onclick=e=>{if(e.target===shade)shade.remove()};document.body.append(shade);
const h=document.createElement('h2');h.textContent='Documentos del viaje';panel.append(h);const intro=document.createElement('p');intro.textContent='Entradas y reservas originales, protegidas para la familia.';panel.append(intro);
const msg=document.createElement('p');msg.className='familyError';panel.append(msg);
const close=document.createElement('button');close.textContent='Cerrar';close.onclick=()=>shade.remove();
async function list(){panel.querySelectorAll('.familyDoc,.familyLogin,.familyEmpty,.familyUpload').forEach(e=>e.remove());msg.textContent='Cargando…';try{const r=await call('list');checked=true;docs=r.documents||[];msg.textContent='';const selected=docs.filter(x=>x.activity_id===activity);if(!selected.length){const p=document.createElement('p');p.className='familyEmpty';p.textContent='Todavía no hay documentos originales cargados para esta actividad.';panel.insertBefore(p,close)}else selected.forEach(d=>{const row=document.createElement('div');row.className='familyDoc';const name=document.createElement('span');name.textContent=d.title;const b=document.createElement('button');b.textContent='Abrir en grande';b.onclick=async()=>{b.disabled=true;try{const r=await call('open',{id:d.id});window.open(r.url,'_blank','noopener')}catch(e){msg.textContent=e.message}finally{b.disabled=false}};row.append(name);
const preview=document.createElement('div');preview.className='familyPreview';preview.textContent='Cargando vista previa…';row.append(preview,b);panel.insertBefore(row,close);
call('open',{id:d.id}).then(r=>{
 if(!row.isConnected)return;
 preview.textContent='';
 if(d.mime_type==='application/pdf'){
  const frame=document.createElement('iframe');frame.src=r.url;frame.title=d.title;frame.loading='lazy';frame.style.cssText='width:100%;height:55dvh;min-height:360px;border:0;border-radius:12px';preview.append(frame);
 }else if(d.mime_type&&d.mime_type.startsWith('image/')){
  const img=document.createElement('img');img.src=r.url;img.alt=d.title;img.loading='lazy';img.style.cssText='width:100%;height:auto;border-radius:12px';preview.append(img);
 }else preview.textContent='Vista previa no disponible';
 b.onclick=()=>window.open(r.url,'_blank','noopener');
}).catch(e=>preview.textContent='No se pudo cargar: '+e.message)});if(r.uploadsEnabled===true)uploadControls()}catch(e){checked=false;if(/Sesión caducada|Acceso familiar necesario/.test(e.message)){token='';localStorage.removeItem(KEY);login()}else msg.textContent=e.message}}
function uploadControls(){
 const wrap=document.createElement('div');wrap.className='familyUpload';wrap.style.cssText='border-top:1px solid #d5c4bd;margin-top:16px;padding-top:12px';
 const h=document.createElement('p');h.textContent='Añadir billetes o reservas (PDF o imagen, máximo 15 MB cada uno)';wrap.append(h);
 const input=document.createElement('input');input.type='file';input.accept='.pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*';input.multiple=true;input.style.cssText='display:block;max-width:100%;margin:10px 0';wrap.append(input);
 const upload=document.createElement('button');upload.textContent='Subir documentos';wrap.append(upload);
 const status=document.createElement('p');status.setAttribute('aria-live','polite');wrap.append(status);
 upload.onclick=async()=>{
  if(!input.files?.length){status.textContent='Selecciona al menos un archivo';return}
  upload.disabled=true;let count=0;
  try{
   for(const file of input.files){
    status.textContent='Subiendo '+(count+1)+' de '+input.files.length+'…';
    const form=new FormData();form.append('action','upload');form.append('token',token);form.append('activity_id',activity);form.append('title',file.name);form.append('file',file);
    const res=await fetch(ENDPOINT,{method:'POST',body:form});const data=await res.json().catch(()=>({}));
    if(!res.ok)throw Error(data.error||'No se pudo subir '+file.name);count++;
   }
   status.textContent=count+' documento(s) guardado(s) correctamente';input.value='';await list();
  }catch(e){status.textContent='Subidos '+count+'. Error: '+e.message}
  finally{upload.disabled=false}
 };
 panel.insertBefore(wrap,close);
}
function login(){panel.querySelectorAll('.familyLogin,.familyDoc,.familyEmpty').forEach(e=>e.remove());msg.textContent='';const area=document.createElement('div');area.className='familyLogin';const p=document.createElement('p');p.textContent='Introduce la clave familiar de seis cifras. El acceso se recordará durante 30 días en este dispositivo.';const input=document.createElement('input');input.type='password';input.inputMode='numeric';input.maxLength=6;input.autocomplete='off';input.placeholder='••••••';input.setAttribute('aria-label','Clave familiar');const b=document.createElement('button');b.textContent='Acceder';b.onclick=async()=>{b.disabled=true;msg.textContent='';try{const r=await call('login',{pin:input.value});token=r.token;localStorage.setItem(KEY,token);area.remove();list()}catch(e){msg.textContent=e.message}finally{b.disabled=false}};input.onkeydown=e=>{if(e.key==='Enter')b.click()};area.append(p,input,b);panel.insertBefore(area,close)}
panel.append(close);if(token)list();else login()}
const mapping=[[/free tour/i,'free-tour'],[/Auschwitz I|Birkenau/i,'auschwitz'],[/Tren Cracovia/i,'train-to-warsaw'],[/Tren Varsovia/i,'train-to-krakow'],[/Comer en Starka/i,'starka'],[/Fábrica de Schindler/i,'schindler'],[/Minas de sal/i,'wieliczka'],[/Cena en Morskie Oko/i,'morskie-oko']];
function decorate(){const card=document.getElementById('daycard');if(!card||typeof editing!=='undefined'&&editing)return;card.querySelectorAll('.item').forEach(row=>{const t=row.querySelector('label.check span')?.firstChild?.textContent||'';const pair=mapping.find(x=>x[0].test(t));if(!pair||row.querySelector('.familyBtn'))return;const btn=document.createElement('button');btn.className='familyBtn';btn.type='button';btn.textContent='Doc.';btn.onclick=()=>show(pair[1]);row.append(btn)})}
const card=document.getElementById('daycard');if(card){new MutationObserver(decorate).observe(card,{childList:true});decorate()}
})();