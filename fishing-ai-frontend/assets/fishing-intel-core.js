(function(root){
  'use strict';
  const finite=v=>typeof v==='number' && Number.isFinite(v);
  function prepare(payload){
    const latitudes=[...new Set((payload.latitudes||[]).filter(finite))].sort((a,b)=>a-b);
    const longitudes=[...new Set((payload.longitudes||[]).filter(finite))].sort((a,b)=>a-b);
    if(latitudes.length<2 || longitudes.length<2) throw Error('The provider returned an incomplete grid.');
    const rows=new Map(latitudes.map((v,i)=>[v,i])), cols=new Map(longitudes.map((v,i)=>[v,i]));
    const cells=(payload.cells||[]).filter(c=>finite(c.lat)&&finite(c.lng)&&finite(c.sst_c)&&c.sst_c>=-3&&c.sst_c<=45&&rows.has(c.lat)&&cols.has(c.lng)).map(c=>({...c,gradient:null}));
    if(!cells.length) throw Error('No usable temperature observations for this area.');
    const lookup=new Map(cells.map(c=>[rows.get(c.lat)+':'+cols.get(c.lng),c]));
    const edges=(values,i)=>[i? (values[i-1]+values[i])/2 : values[i]-(values[1]-values[0])/2, i<values.length-1 ? (values[i]+values[i+1])/2 : values[i]+(values[i]-values[i-1])/2];
    for(const c of cells){
      const r=rows.get(c.lat), k=cols.get(c.lng);
      const west=lookup.get(r+':'+(k-1)),east=lookup.get(r+':'+(k+1)),south=lookup.get((r-1)+':'+k),north=lookup.get((r+1)+':'+k);
      // Central differences only: never bridge missing observations or infer a zero front.
      if(west&&east&&south&&north){
        const dx=(east.lng-west.lng)*111.32*Math.cos(c.lat*Math.PI/180),dy=(north.lat-south.lat)*111.32;
        if(dx>0&&dy>0)c.gradient=Math.hypot((east.sst_c-west.sst_c)/dx,(north.sst_c-south.sst_c)/dy);
      }
      const [s,n]=edges(latitudes,r),[w,e]=edges(longitudes,k);c.bounds=[[s,w],[n,e]];
    }
    return {cells,observedAt:payload.observed_at||null,bounds:[[latitudes[0],longitudes[0]],[latitudes.at(-1),longitudes.at(-1)]]};
  }
  function freshness(date,now=Date.now()){
    const time=Date.parse(date), hours=(now-time)/3600000;
    if(!Number.isFinite(time)||hours<0)return {label:'Observation time unavailable',stale:true};
    return {label:Math.floor(hours)+' hours old',stale:hours>48};
  }
  function color(value,mode){
    const stops=mode==='sst'?[[12,[34,80,181]],[20,[20,169,183]],[26,[245,214,83]],[32,[207,63,66]]]:[[0,[237,244,246]],[0.04,[243,203,95]],[0.12,[215,70,94]],[0.2,[104,38,104]]];
    if(value<=stops[0][0])return 'rgb('+stops[0][1].join(',')+')';
    for(let i=1;i<stops.length;i++)if(value<=stops[i][0]){const [a,x]=stops[i-1],[b,y]=stops[i],t=(value-a)/(b-a);return 'rgb('+x.map((v,k)=>Math.round(v+(y[k]-v)*t)).join(',')+')';}
    return 'rgb('+stops.at(-1)[1].join(',')+')';
  }
  const api={prepare,freshness,color};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.OceanIntelCore=api;
})(typeof window==='object'?window:globalThis);
