// Optional event geography. Home preferences never silently assign a catch/trip country.
(()=>{
 if(typeof api!=='function'||typeof state==='undefined')return;
 const originalApi=api,editors=new Map();let initializing=false,attemptedToken=null;
 const specs=[['/catches','btnSaveCatch','catch'],['/saved-areas','savedAreaName','saved area'],['/api/boat/trip-log','boatAiSaveTrip','trip'],['/community/posts','btnPublishCommunityPost','post']];
 const option=(name,value)=>{const o=document.createElement('option');o.textContent=name;o.value=value;return o;};
 const makeField=(label,input)=>{const holder=document.createElement('label');holder.textContent=label;holder.append(input);return holder;};
 async function initialize(){
  if(!state.token||editors.size||initializing||attemptedToken===state.token)return;
  initializing=true;attemptedToken=state.token;
  let countries;try{countries=(await originalApi('/api/platform/countries')).countries;}catch{initializing=false;return;}
  for(const [path,id,kind] of specs){
   const anchor=document.getElementById(id);if(!anchor)continue;
   const box=document.createElement('details'),title=document.createElement('summary');title.textContent='Country and region for this '+kind+' (optional)';box.append(title);box.style.cssText='width:100%;margin:12px 0';
   const country=document.createElement('select'),subdivision=document.createElement('select');country.append(option('Not specified',''));countries.forEach(c=>country.append(option(c.name,c.code)));subdivision.append(option('Not specified',''));
   const region=document.createElement('input'),timezone=document.createElement('input'),marine=document.createElement('input');region.maxLength=marine.maxLength=160;timezone.placeholder='e.g. Australia/Brisbane';
   box.append(makeField('Country',country),makeField('State / territory',subdivision),makeField('Region',region),makeField('Timezone',timezone),makeField('Marine region',marine));
   const note=document.createElement('p');note.textContent='Choose where this happened. GPS is optional and stays under your location privacy settings.';box.append(note);
   let pending=false,version=0;
   country.onchange=async()=>{const current=++version;pending=true;subdivision.disabled=true;subdivision.replaceChildren(option('Not specified',''));region.value='';marine.value='';timezone.value='';try{if(country.value){const result=await originalApi('/api/platform/subdivisions/'+country.value);if(current!==version)return;result.subdivisions.forEach(s=>subdivision.append(option(s.name,s.code)));}note.textContent='Regional information does not change who can see your fishing spot.';}catch(error){note.textContent=error.message;}finally{if(current===version){pending=false;subdivision.disabled=false;}}};
   anchor.closest('.fld')?.before(box);if(!box.isConnected)anchor.before(box);
   editors.set(path,{read(){if(pending)throw Error('Wait for the state list to load.');if(!country.value)return null;return {country:country.value,subdivision:subdivision.value||null,region:region.value||null,timezone:timezone.value||null,marine_region:marine.value||null,units:currentCatchUnits()==='imperial'?'us_customary':'metric'};}});
  }
  initializing=false;
 }
 api=async function(path,opts={},...rest){if(state.token&&!editors.size)initialize();const editor=editors.get(path);if(editor&&opts.method==='POST'&&typeof opts.body==='string'){const body=JSON.parse(opts.body),location=editor.read();if(location){if(path==='/api/boat/trip-log'&&body.trip_log)body.trip_log.location=location;else body.location=location;opts={...opts,body:JSON.stringify(body)};}}return originalApi(path,opts,...rest);};
 initialize();window.addEventListener('focus',()=>{attemptedToken=null;initialize();});
})();
