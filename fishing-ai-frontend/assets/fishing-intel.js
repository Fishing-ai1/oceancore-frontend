(function(){
  'use strict';
  const $=id=>document.getElementById(id),core=window.OceanIntelCore;
  window.lucide?.createIcons();
  function mapFailure(message){$('status').textContent=message;$('status').classList.add('error');}
  if(!window.maplibregl){mapFailure('Map library could not load. Check your connection and reload.');$('load').disabled=true;return;}
  const query=new URLSearchParams(location.search);
  if(query.has('lat')&&query.has('lng')){
    const lat=Number(query.get('lat')),lng=Number(query.get('lng'));
    if(Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=80&&Math.abs(lng)<=180){$('latitude').value=lat;$('longitude').value=lng;$('region').value='custom';}
  }
  let map;
  try{
    map=new maplibregl.Map({container:'intelMap',style:'https://tiles.openfreemap.org/styles/liberty',center:[Number($('longitude').value),Number($('latitude').value)],zoom:7,minZoom:3,maxZoom:18,renderWorldCopies:false});
  }catch(error){mapFailure('This device could not start the vector map. Enable hardware acceleration or try another browser.');$('load').disabled=true;return;}
  map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
  map.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');
  let grid=null,mode='sst',marker=null,controller=null,requestId=0,mapReady=false;
  const empty=()=>({type:'FeatureCollection',features:[]});
  map.on('error',()=>mapFailure('Some map resources could not load. Check your connection and reload.'));
  map.on('load',()=>{
    map.addSource('ocean-data',{type:'geojson',data:empty()});
    // Keep coastlines and place labels above the analysis overlay.
    const before=map.getStyle().layers.find(item=>item.type==='symbol')?.id;
    map.addLayer({id:'ocean-analysis',type:'fill',source:'ocean-data',paint:{'fill-color':['get','color'],'fill-opacity':opacity(),'fill-antialias':false}},before);
    mapReady=true;render();
  });
  const opacity=()=>Number($('opacity').value)/100;
  function render(){
    if(mapReady)map.getSource('ocean-data').setData(empty());
    $('legend').className='legend '+(mode==='sst'?'temperature':'fronts');
    $('legendTitle').textContent=mode==='sst'?'Sea temperature':'Temperature gradient';
    $('legendMin').textContent=mode==='sst'?'12 C':'0 C/km';$('legendMax').textContent=mode==='sst'?'32 C':'0.2+ C/km';
    if(!grid)return;
    const values=grid.cells.map(c=>mode==='sst'?c.sst_c:c.gradient).filter(v=>v!==null);
    const min=values.length?Math.floor(Math.min(...values)*100)/100:0;
    const max=values.length?Math.max(min+0.01,Math.ceil(Math.max(...values)*100)/100):0.2;
    const unit=mode==='sst'?' C':' C/km';
    $('legendMin').textContent=min.toFixed(2)+unit;$('legendMax').textContent=max.toFixed(2)+unit;
    const features=[];
    for(const c of grid.cells){const v=mode==='sst'?c.sst_c:c.gradient;if(v===null)continue;
      const scaled=(v-min)/(max-min);
      const [[south,west],[north,east]]=c.bounds;
      features.push({type:'Feature',properties:{color:core.color(mode==='sst'?12+scaled*20:scaled*0.2,mode)},geometry:{type:'Polygon',coordinates:[[[west,south],[east,south],[east,north],[west,north],[west,south]]]}});
    }
    if(mapReady)map.getSource('ocean-data').setData({type:'FeatureCollection',features});
  }
  map.on('click',event=>{
    if(marker)marker.remove();
    const dot=document.createElement('div');dot.className='sample-marker';
    marker=new maplibregl.Marker({element:dot}).setLngLat(event.lngLat).addTo(map);
    const c=grid?.cells.find(c=>event.lngLat.lat>=c.bounds[0][0]&&event.lngLat.lat<=c.bounds[1][0]&&event.lngLat.lng>=c.bounds[0][1]&&event.lngLat.lng<=c.bounds[1][1]);
    $('sample').textContent=event.lngLat.lat.toFixed(4)+', '+event.lngLat.lng.toFixed(4)+' | '+(c?c.sst_c.toFixed(2)+' C | Gradient '+(c.gradient===null?'unavailable':c.gradient.toFixed(3)+' C/km'):'No observation at this point');
  });
  async function load(){
    if(!$('areaForm').reportValidity())return;
    const id=++requestId;controller?.abort();controller=new AbortController();const activeController=controller;const timeout=setTimeout(()=>activeController.abort(),55000);
    grid=null;render();marker?.remove();$('sample').textContent='No point selected';$('observation').textContent='No observation loaded';$('age').textContent='';$('coverage').textContent='';$('load').disabled=true;$('status').classList.remove('error');$('status').textContent='Loading NOAA ocean analysis...';
    const lat=Number($('latitude').value),lng=Number($('longitude').value);map.jumpTo({center:[lng,lat],zoom:7});
    try{
      const response=await fetch('/api/pelagic/grid?'+new URLSearchParams({lat,lng,radius_km:100,species:'pelagics'}),{signal:controller.signal});
      if(!response.ok)throw Error('Ocean data request failed ('+response.status+'). Try Load area again.');
      const payload=await response.json();if(id!==requestId)return;grid=core.prepare(payload);render();
      const age=core.freshness(grid.observedAt);$('age').textContent=age.label;$('age').className=age.stale?'stale':'';
      $('observation').textContent=Number.isFinite(Date.parse(grid.observedAt))?'Observed '+new Date(grid.observedAt).toLocaleString(): 'Observation date not supplied';
      $('coverage').textContent=grid.cells.length+' valid temperature cells. Cell boundaries show source resolution, not individual fishing spots. Gaps remain unfilled. Gradients are derived estimates.';
      $('status').textContent='NOAA temperature analysis | '+age.label+(age.stale?' | Older or undated data':'');
      map.fitBounds(grid.bounds.map(([latitude,longitude])=>[longitude,latitude]),{padding:24,duration:0});
    }catch(error){if(id!==requestId)return;$('status').classList.add('error');$('status').textContent=error.name==='AbortError'?'Ocean data timed out. Try Load area again.':error.message;}
    finally{clearTimeout(timeout);if(id===requestId)$('load').disabled=false;}
  }
  $('areaForm').addEventListener('submit',event=>{event.preventDefault();load();});
  $('region').addEventListener('change',()=>{if($('region').value==='custom')return;const [lat,lng]=$('region').value.split(',');$('latitude').value=lat;$('longitude').value=lng;load();});
  for(const id of ['latitude','longitude'])$(id).addEventListener('input',()=>{$('region').value='custom';});
  document.querySelectorAll('[name=layer]').forEach(radio=>radio.addEventListener('change',()=>{mode=radio.value;render();}));
  $('opacity').addEventListener('input',()=>{$('opacityValue').value=$('opacity').value+'%';if(mapReady)map.setPaintProperty('ocean-analysis','fill-opacity',opacity());});
  new ResizeObserver(()=>map.resize()).observe($('intelMap'));
  load();
})();
