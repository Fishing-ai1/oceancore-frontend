const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const core=require('../fishing-ai-frontend/assets/fishing-intel-core.js');
const source=fs.readFileSync('fishing-ai-frontend/assets/fishing-intel.js','utf8');
function setup(){
  const elements=new Map(),events={},sources={},radios=['sst','fronts'].map(value=>({value,addEventListener(type,fn){this.change=fn;}}));
  let map;
  const el=id=>{if(!elements.has(id))elements.set(id,{value:({latitude:'-27.36',longitude:'153.25',opacity:'75'})[id]||'',textContent:'',classList:{add(){},remove(){}},addEventListener(type,fn){this[type]=fn;},reportValidity:()=>true});return elements.get(id);};
  const data={latitudes:[-28,-27,-26],longitudes:[152,153,154],cells:[-28,-27,-26].flatMap(lat=>[152,153,154].map(lng=>({lat,lng,sst_c:20+lng-152})))};
  const c={window:{OceanIntelCore:core},document:{getElementById:el,querySelectorAll:()=>radios,createElement:()=>({})},location:{search:''},URLSearchParams,AbortController,setTimeout,clearTimeout,ResizeObserver:class{observe(){}},fetch:async()=>({ok:true,json:async()=>data}),maplibregl:{
    Map:class{constructor(options){map=this;this.options=options;}addControl(){}on(type,fn){events[type]=fn;}addSource(id,s){sources[id]={data:s.data,setData(data){this.data=data;}};}getSource(id){return sources[id];}getStyle(){return {layers:[{id:'labels',type:'symbol'}]};}addLayer(layer,before){this.layer=layer;this.before=before;}setPaintProperty(id,key,value){this.layer.paint[key]=value;}jumpTo(){}fitBounds(bounds){this.bounds=bounds;}resize(){}},NavigationControl:class{},ScaleControl:class{},Marker:class{setLngLat(){return this;}addTo(){return this;}remove(){}}
  }};
  c.window.maplibregl=c.maplibregl;vm.runInNewContext(source,c);
  return {el,map,events,sources,radios};
}
test('vector map renders data that arrives before style readiness, preserving coordinates and missing gradients',async()=>{
  const c=setup();await new Promise(setImmediate);
  c.events.load();
  assert.equal(c.map.options.style,'https://tiles.openfreemap.org/styles/liberty');
  assert.equal(c.sources['ocean-data'].data.features.length,9);
  assert.deepEqual(Array.from(c.sources['ocean-data'].data.features[0].geometry.coordinates[0][0]),[151.5,-28.5]);
  assert.equal(c.map.before,'labels');
  c.radios[1].change();assert.equal(c.sources['ocean-data'].data.features.length,1);
  c.el('opacity').value='20';c.el('opacity').input();assert.equal(c.map.layer.paint['fill-opacity'],.2);
  c.events.click({lngLat:{lat:-27,lng:153}});assert.match(c.el('sample').textContent,/21.00 C/);
});
test('style ready before data renders the eventual grid',async()=>{
  const c=setup();c.events.load();await new Promise(setImmediate);
  assert.equal(c.sources['ocean-data'].data.features.length,9);
});
test('Fishing Intel no longer loads Leaflet or raster street tiles',()=>{
  const html=fs.readFileSync('fishing-ai-frontend/fishing-intel.html','utf8');
  assert.doesNotMatch(html+source,/leaflet|tile\.openstreetmap\.org|L\.map/);
  assert.match(html,/maplibre-gl@5\.8\.0/);
});
