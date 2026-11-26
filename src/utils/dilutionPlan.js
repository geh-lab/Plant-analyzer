const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export function dilutionPlan(volumeMl, targets, stockConcentration) {
  const volumeText = String(volumeMl).trim();
  const totalUl = Number(volumeText) * 1000;
  if (!decimal.test(volumeText) || !Number.isFinite(totalUl) || totalUl <= 0) return {error:'volume',rows:[]};
  if (!(Number.isFinite(stockConcentration) && stockConcentration > 0)) return {error:'stock',rows:[]};
  const tokens = String(targets).split(',').map(v=>v.trim());
  if (tokens.some(v=>!decimal.test(v))) return {error:'targets',rows:[]};
  const concentrations = tokens.map(Number);
  if (concentrations.some(v=>!Number.isFinite(v) || v < 0 || v > stockConcentration)) return {error:'range',rows:[]};
  const rows = [...new Set(concentrations)].sort((a,b)=>a-b).map(target => {
    const fraction = target / stockConcentration;
    const stockUl = fraction * totalUl;
    return {target,stockUl,diluentUl:totalUl-stockUl,fraction};
  });
  return {rows,totalUl,error:null};
}
