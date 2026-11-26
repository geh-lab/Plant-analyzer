import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { dilutionPlan } from '@/utils/dilutionPlan';
import { displayNumber as fmt } from '@/utils/resultData';
import './dilutionPlanner.css';

function DilutionLine({ rows, selected, setSelected, config, totalUl, en }) {
  const title = useId(), description = useId();
  const canvas=useRef(null);
  const [chartWidth,setChartWidth]=useState(430);
  useEffect(()=>{
    const node=canvas.current;
    const measure=()=>setChartWidth(Math.max(210,Math.floor(node.clientWidth)));
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(node);
    return ()=>observer.disconnect();
  },[]);
  const [x0,x1,y0,y1] = [48,chartWidth-14,40,197];
  const xmax = rows.at(-1).target || config.stock_conc;
  const ymax = rows.at(-1).stockUl || totalUl;
  const x = v => x0+(x1-x0)*(v/xmax);
  const y = v => y1-(y1-y0)*(v/ymax);
  const points = rows.map(r=>x(r.target)+','+y(r.stockUl)).join(' ');
  const current = rows[selected];
  const choose = i => setSelected(rows[i].target);
  function key(e, i) {
    if (['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
      e.preventDefault();
      const next = e.key==='Home'?0:e.key==='End'?rows.length-1:Math.max(0,Math.min(rows.length-1,i+(e.key==='ArrowLeft'?-1:1)));
      choose(next);
      e.currentTarget.parentNode.querySelector('[data-standard="'+next+'"]')?.focus();
    }
    if(e.key==='Enter'||e.key===' ') {e.preventDefault();choose(i);}
  }
  return <figure className="dilution-curve">
    <figcaption>{en?'Stock volume by target concentration':'목표 농도별 원액 분주량'}</figcaption>
    <svg ref={canvas} viewBox={`0 0 ${chartWidth} 245`} role="group" aria-labelledby={title+' '+description}>
      <title id={title}>{en?'Calculated dilution line':'희석식으로 계산한 분주량'}</title>
      <desc id={description}>{en?'Choose a point to inspect its stock and diluent volumes. Use the arrow keys to move between standards.':'점을 선택하면 해당 표준액의 원액과 희석액 부피를 확인할 수 있습니다. 방향키로 표준액을 바꿀 수 있습니다.'}</desc>
      <text x={x0} y="23" fontSize="12" fontWeight="600" fill="#294b3a">{en?'Stock volume (µL)':'원액 분주량 (µL)'}</text>
      {[0,.25,.5,.75,1].map(f=><g key={f}>
        <line x1={x0} x2={x1} y1={y(ymax*f)} y2={y(ymax*f)} stroke="#dae4d9" strokeDasharray={f===0?undefined:'3 4'}/>
        <text x={x0-7} y={y(ymax*f)+4} textAnchor="end" fontSize="11" fill="#526857">{fmt(ymax*f)}</text>
        <text x={x(xmax*f)} y={y1+20} textAnchor={f===1?'end':f===0?'start':'middle'} fontSize="11" fill="#526857">{fmt(xmax*f)}</text>
      </g>)}
      <text x={(x0+x1)/2} y="238" textAnchor="middle" fontSize="12" fontWeight="600" fill="#294b3a">{(en?'Target concentration':'목표 농도')+' ('+config.unit+')'}</text>
      {rows.length>1 && <><polygon points={x(rows[0].target)+','+y1+' '+points+' '+x(rows.at(-1).target)+','+y1} fill="#dcebdc" opacity=".6"/>
        <polyline points={points} fill="none" stroke="#286545" strokeWidth="2.5" strokeLinejoin="round"/></>}
      <line x1={x(current.target)} x2={x(current.target)} y1={y(current.stockUl)} y2={y1} stroke="#68896f" strokeDasharray="3 4"/>
      <g>{rows.map((r,i)=>{
        const label=fmt(r.target)+' '+config.unit+' · '+fmt(r.stockUl)+' µL '+(en?'stock':'원액');
        return <g key={r.target} data-standard={i} tabIndex={i===selected?0:-1} role="button" aria-label={label} aria-pressed={i===selected}
          onKeyDown={e=>key(e,i)} onClick={()=>choose(i)} onPointerEnter={e=>{if(e.pointerType==='mouse')choose(i);}}>
          <title>{label}</title>
          <circle cx={x(r.target)} cy={y(r.stockUl)} r="12" fill="transparent"/>
          {i===selected && <circle className="dilution-ring" cx={x(r.target)} cy={y(r.stockUl)} r="8" fill="#fff" stroke="#79a086" strokeWidth="1.4"/>}
          <circle cx={x(r.target)} cy={y(r.stockUl)} r="4.1" stroke="#276847" strokeWidth="1.8" fill={i===selected?'#276847':'#fff'}/>
        </g>;
      })}</g>
    </svg>
  </figure>;
}

export default function DilutionPlanner({config,en=false}) {
  const [volume,setVolume]=useState(String(config.default_total_vol));
  const [targets,setTargets]=useState(config.default_concs.join(', '));
  const [selected,setSelected]=useState(null);
  const plan=useMemo(()=>dilutionPlan(volume,targets,config.stock_conc),[volume,targets,config.stock_conc]);
  const {rows,totalUl,error}=plan;
  const index=rows.findIndex(r=>r.target===selected);
  const selectedIndex=index<0?Math.floor(rows.length/2):index;
  const current=rows[selectedIndex];
  const t=(ko,eng)=>en?eng:ko;
  function reset() {setVolume(String(config.default_total_vol));setTargets(config.default_concs.join(', '));setSelected(null);}
  return <section className="assay-detail-section dilution-planner">
    <h3>{t('표준용액 희석 계산기','Standard dilution planner')}</h3>
    <p>{config.stock_name} · {fmt(config.stock_conc)} {config.unit}</p>
    <div className="assay-controls dilution-inputs">
      <label>{t('최종 부피 (mL)','Final volume (mL)')}<input type="number" step="any" value={volume} onChange={e=>setVolume(e.target.value)} aria-invalid={error==='volume'}/></label>
      <label>{t('목표 농도','Target concentrations')} ({config.unit})<input value={targets} onChange={e=>setTargets(e.target.value)} aria-invalid={error==='targets'||error==='range'}/></label>
      <button type="button" className="assay-aux" onClick={reset}><RotateCcw size={15}/>{t('초기화','Reset')}</button>
    </div>
    {error ? <p role="status" className="dilution-error">{error==='volume'?t('최종 부피를 0보다 큰 수로 입력하세요.','Enter a positive final volume.') :
      error==='range'?t('각 목표 농도는 0 이상, 원액 농도 이하여야 합니다.','Each target must be between zero and the stock concentration.') :
      t('쉼표로 구분한 목표 농도를 숫자로 입력하세요.','Enter numeric target concentrations separated by commas.')}</p> : <>
      <div className="dilution-layout">
        <DilutionLine {...{rows,config,totalUl,en}} selected={selectedIndex} setSelected={setSelected}/>
        <section className="dilution-composition" aria-label={t('선택한 표준액 조성','Selected standard composition')}>
          <h4>{t('선택한 표준액','Selected standard')}</h4>
          <strong className="dilution-target">{fmt(current.target)} <small>{config.unit}</small></strong>
          <div className="dilution-composition-bar" aria-hidden="true"><i style={{width:(current.fraction*100)+'%'}}/></div>
          <dl>
            <div><dt><i className="dilution-dot stock"/>{t('원액','Stock')}</dt><dd>{fmt(current.stockUl)} µL</dd></div>
            <div><dt><i className="dilution-dot solvent"/>{config.solvent_name}</dt><dd>{fmt(current.diluentUl)} µL</dd></div>
            <div><dt>{t('총 부피','Total volume')}</dt><dd>{fmt(totalUl/1000)} mL</dd></div>
          </dl>
        </section>
      </div>
      <div className="assay-table-scroll dilution-table"><table className="assay-plan-table">
        <caption>{t('표준액별 분주 표','Pipetting volumes for each standard')}</caption>
        <thead><tr><th>{t('목표 농도','Target')} ({config.unit})</th><th>{t('원액','Stock')} (µL)</th><th>{config.solvent_name} (µL)</th></tr></thead>
        <tbody>{rows.map(r=><tr key={r.target} data-current={current.target===r.target||undefined}>
          <th scope="row"><button type="button" aria-pressed={current.target===r.target} onClick={()=>setSelected(r.target)} aria-label={t('표준액 선택 ','Select standard ')+fmt(r.target)+' '+config.unit}>{fmt(r.target)}</button></th>
          <td>{fmt(r.stockUl)}</td><td>{fmt(r.diluentUl)}</td>
        </tr>)}</tbody>
      </table></div>
    </>}
  </section>;
}
