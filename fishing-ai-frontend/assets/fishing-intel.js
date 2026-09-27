(function(){
  'use strict';
  const $=id=>document.getElementById(id),core=window.OceanIntelCore;
  window.lucide?.createIcons();
  if(!window.L){$('status').textContent='Map library could not load. Check your connection and reload.';$('status').classList.add('error');$('load').disabled=true;return;}
  const query=new URLSearchParams(location.search);
  if(query.has('lat')&&query.has('lng')){
    const lat=Number(query.get('lat')),lng=Number(query.get('lng'));
    if(Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=80&&Math.abs(lng)<=180){$('latitude').value=lat;$('longitude').value=lng;$('region').value='custom';}
  }
  const map=L.map('intelMap',{preferCanvas:true,minZoom:3,maxZoom:13}).setView([Number($('latitude').value),Number($('longitude').value)],7);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map).on('tileerror',()=>{$('status').textContent='Some base map tiles could not load. Ocean data status is shown below.';});
  let grid=null,layer=L.layerGroup().addTo(map),mode='sst',marker=null,controller=null,requestId=0;
  const opacity=()=>Number($('opacity').value)/100;
  function render(){
    layer.clearLayers();
    $('legend').className='legend '+(mode==='sst'?'temperature':'fronts');
    $('legendTitle').textContent=mode==='sst'?'Sea temperature':'Temperature gradient';
    $('legendMin').textContent=mode==='sst'?'12 C':'0 C/km';$('legendMax').textContent=mode==='sst'?'32 C':'0.2+ C/km';
    if(!grid)return;
    const values=grid.cells.map(c=>mode==='sst'?c.sst_c:c.gradient).filter(v=>v!==null);
    const min=values.length?Math.floor(Math.min(...values)*100)/100:0;
    const max=values.length?Math.max(min+0.01,Math.ceil(Math.max(...values)*100)/100):0.2;
    const unit=mode==='sst'?' C':' C/km';
    $('legendMin').textContent=min.toFixed(2)+unit;$('legendMax').textContent=max.toFixed(2)+unit;
    for(const c of grid.cells){const v=mode==='sst'?c.sst_c:c.gradient;if(v===null)continue;
      const scaled=(v-min)/(max-min);
      L.rectangle(c.bounds,{stroke:false,fillColor:core.color(mode==='sst'?12+scaled*20:scaled*0.2,mode),fillOpacity:opacity(),interactive:false}).addTo(layer);
    }
  }
  map.on('click',event=>{
    if(marker)marker.remove();marker=L.circleMarker(event.latlng,{radius:5,color:'#142a30',fillColor:'#fff',fillOpacity:1}).addTo(map);
    const c=grid?.cells.find(c=>event.latlng.lat>=c.bounds[0][0]&&event.latlng.lat<=c.bounds[1][0]&&event.latlng.lng>=c.bounds[0][1]&&event.latlng.lng<=c.bounds[1][1]);
    $('sample').textContent=event.latlng.lat.toFixed(4)+', '+event.latlng.lng.toFixed(4)+' | '+(c?c.sst_c.toFixed(2)+' C | Gradient '+(c.gradient===null?'unavailable':c.gradient.toFixed(3)+' C/km'):'No observation at this point');
  });
  async function load(){
    if(!$('areaForm').reportValidity())return;
    const id=++requestId;controller?.abort();controller=new AbortController();const activeController=controller;const timeout=setTimeout(()=>activeController.abort(),55000);
    grid=null;layer.clearLayers();marker?.remove();$('sample').textContent='No point selected';$('observation').textContent='No observation loaded';$('age').textContent='';$('coverage').textContent='';$('load').disabled=true;$('status').classList.remove('error');$('status').textContent='Loading NOAA ocean analysis...';
    const lat=Number($('latitude').value),lng=Number($('longitude').value);map.setView([lat,lng],7);
    try{
      const response=await fetch('/api/pelagic/grid?'+new URLSearchParams({lat,lng,radius_km:100,species:'pelagics'}),{signal:controller.signal});
      if(!response.ok)throw Error('Ocean data request failed ('+response.status+'). Try Load area again.');
      const payload=await response.json();if(id!==requestId)return;grid=core.prepare(payload);render();
      const age=core.freshness(grid.observedAt);$('age').textContent=age.label;$('age').className=age.stale?'stale':'';
      $('observation').textContent=Number.isFinite(Date.parse(grid.observedAt))?'Observed '+new Date(grid.observedAt).toLocaleString(): 'Observation date not supplied';
      $('coverage').textContent=grid.cells.length+' valid temperature cells. Gaps remain unfilled. Gradients are derived estimates.';
      $('status').textContent='NOAA temperature analysis | '+age.label+(age.stale?' | Older or undated data':'');
      map.fitBounds(grid.bounds,{padding:[12,12]});
    }catch(error){if(id!==requestId)return;$('status').classList.add('error');$('status').textContent=error.name==='AbortError'?'Ocean data timed out. Try Load area again.':error.message;}
    finally{clearTimeout(timeout);if(id===requestId)$('load').disabled=false;}
  }
  $('areaForm').addEventListener('submit',event=>{event.preventDefault();load();});
  $('region').addEventListener('change',()=>{if($('region').value==='custom')return;const [lat,lng]=$('region').value.split(',');$('latitude').value=lat;$('longitude').value=lng;load();});
  for(const id of ['latitude','longitude'])$(id).addEventListener('input',()=>{$('region').value='custom';});
  document.querySelectorAll('[name=layer]').forEach(radio=>radio.addEventListener('change',()=>{mode=radio.value;render();}));
  $('opacity').addEventListener('input',()=>{$('opacityValue').value=$('opacity').value+'%';layer.eachLayer(item=>item.setStyle({fillOpacity:opacity()}));});
  new ResizeObserver(()=>map.invalidateSize()).observe($('intelMap'));
  load();
})();
