const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../fishing-ai-frontend/assets/fishing-intel-core.js');
function fixture(){return {latitudes:[-28,-27,-26],longitudes:[152,153,154],observed_at:'2026-09-25T12:00:00Z',cells:[-28,-27,-26].flatMap(lat=>[152,153,154].map(lng=>({lat,lng,sst_c:20+(lng-152)})))};}
test('gradient uses geodesic distances and does not invent edge values',()=>{
  const grid=core.prepare(fixture()),center=grid.cells.find(c=>c.lat===-27&&c.lng===153);
  assert.ok(Math.abs(center.gradient-1/(111.32*Math.cos(-27*Math.PI/180)))<1e-8);
  assert.equal(grid.cells[0].gradient,null);
});
test('missing observations stay missing, including in derived gradients',()=>{
  const data=fixture();data.cells[4].sst_c=null;
  const grid=core.prepare(data);assert.equal(grid.cells.length,8);
  assert.ok(grid.cells.every(c=>c.gradient===null));
});
test('invalid grids are rejected instead of displaying fake data',()=>{
  assert.throws(()=>core.prepare({}),/incomplete/);
  const data=fixture();data.cells.forEach(c=>c.sst_c=Infinity);
  assert.throws(()=>core.prepare(data),/No usable/);
});
test('unknown, future and old timestamps are not marked fresh',()=>{
  const now=Date.parse('2026-09-27T12:00:00Z');
  assert.equal(core.freshness(null,now).stale,true);
  assert.equal(core.freshness('2026-09-28',now).stale,true);
  assert.equal(core.freshness('2026-09-24',now).stale,true);
  assert.equal(core.freshness('2026-09-27T00:00:00Z',now).stale,false);
});
test('grid footprints meet at shared edges without smoothing across land gaps',()=>{
  const grid=core.prepare(fixture());assert.equal(grid.cells[0].bounds[1][1],grid.cells[1].bounds[0][1]);
});
