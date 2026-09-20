// Alternative unit inputs feed the existing canonical boat calculator without changing its model.
(()=>{
 if(typeof currentCatchUnits!=='function')return;
 const definitions={boatAiLoa:[1/0.3048,'ft'],boatAiBeam:[1/0.3048,'ft'],boatAiWeight:[1/0.45359237,'lb'],boatAiPayload:[1/0.45359237,'lb'],boatAiFuel:[1/3.785411784,'US gal'],boatAiTankCapacity:[1/3.785411784,'US gal'],boatAiActualFuel:[1/3.785411784,'US gal'],boatAiFuelPrice:[3.785411784,'per US gal'],boatAiMaxSwellM:[1/0.3048,'ft'],boatAiDistance:[1/1.609344,'mi'],boatAiExtra:[1/1.609344,'mi']};
 const pairs=[];
 for(const [id,[scale,unit]] of Object.entries(definitions)){
  const source=document.getElementById(id);if(!source)continue;
  const label=document.createElement('label');label.textContent='Equivalent in '+unit;
  const alternate=document.createElement('input');alternate.type='number';alternate.step='any';alternate.setAttribute('aria-label',(source.closest('.fld')?.querySelector('label')?.textContent || id)+' in '+unit);label.append(alternate);source.after(label);
  const sync=()=>{if(document.activeElement!==alternate)alternate.value=source.value===''?'':String(Number((Number(source.value)*scale).toFixed(8)));};
  alternate.addEventListener('input',()=>{const n=Number(alternate.value);if(alternate.value!==''&&!Number.isFinite(n))return;source.value=alternate.value===''?'':String(Number((n/scale).toFixed(12)));source.dispatchEvent(new Event('change',{bubbles:true}));});
  source.addEventListener('input',sync);source.addEventListener('change',sync);pairs.push({label,sync});
 }
 const summary=document.createElement('div');summary.className='muted-box';document.getElementById('boatAiMetrics')?.after(summary);
 function refresh(){const visible=currentCatchUnits()==='imperial';pairs.forEach(({label,sync})=>{label.hidden=!visible;sync();});summary.hidden=!visible;const r=window.oceancoreBoatResult;if(!visible||!r)return;summary.textContent=`US units: estimated trip fuel ${(r.tripFuel/3.785411784).toFixed(1)} US gal; spare above reserve ${(r.spare/3.785411784).toFixed(1)} US gal; estimated range ${(r.range/1.609344).toFixed(1)} mi; burn ${(r.avg/3.785411784).toFixed(1)} US gal/h. Estimates retain the same reserve and safety assumptions.`;}
 window.addEventListener('oceancore:boat-result',refresh);window.addEventListener('oceancore:units',refresh);window.addEventListener('focus',refresh);document.querySelectorAll('[data-setting="catch.units"]').forEach(input=>input.addEventListener('change',refresh));refresh();
})();
