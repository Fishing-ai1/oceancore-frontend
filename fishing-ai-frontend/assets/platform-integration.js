// Account units synchronize through the API; explicit manual choices are preserved.
(()=>{
 if(typeof api!=='function' || typeof state==='undefined')return;
 let saving=false,revision=0;
 const sync=async()=>{if(!state.token||saving)return;const version=++revision;try{const r=await api('/api/platform/preferences');if(version!==revision||saving)return;state.regionalPreferences=r.preferences;setSetting('catch.units',r.preferences.units==='us_customary'?'imperial':'metric');updateCatchSettingsUi();window.dispatchEvent(new Event('oceancore:units'));}catch{/* The original UI stays available before regional activation. */}};
 document.querySelectorAll('[data-setting="catch.units"]').forEach(input=>input.addEventListener('change',async()=>{if(!state.regionalPreferences)return;saving=true;revision++;const units=input.value==='imperial'?'us_customary':'metric';try{const r=await api('/api/platform/preferences',{method:'PATCH',body:JSON.stringify({units})});state.regionalPreferences=r.preferences;}catch(error){const notice=document.createElement('p');notice.setAttribute('role','alert');notice.textContent='Units changed on this device, but account synchronization failed: '+error.message;input.parentElement.append(notice);}finally{saving=false;updateCatchSettingsUi();window.dispatchEvent(new Event('oceancore:units'));}}));
 sync();window.addEventListener('focus',sync);
 api('/api/platform/public-config').then(r=>{if(r.notice){const notice=document.createElement('div');notice.className='muted-box';notice.setAttribute('role','status');notice.textContent=r.notice;document.body.prepend(notice);}}).catch(()=>{});
})();
