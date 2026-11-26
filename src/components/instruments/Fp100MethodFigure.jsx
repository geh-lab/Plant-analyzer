import { useId } from "react";

function OjipFigure({ en }) {
  return <>
    <path className="fp-axis" d="M42 21v111h365" />
    <text x="21" y="22">Ft</text>
    <path className="fp-signal" d="M48 119C82 115 92 88 135 85S188 62 220 58S249 59 272 46S312 27 342 27Q364 27 390 33" />
    {[[48,119,"O"],[135,85,"J"],[220,58,"I"],[342,27,"P"]].map(([x,y,label]) =>
      <g key={label}><circle className="fp-mark" cx={x} cy={y} r="4" /><text x={x+4} y={y-9}>{label}</text></g>)}
    <text x="225" y="154" textAnchor="middle">{en ? "Time after illumination · log scale" : "광조사 후 시간 · 로그 눈금"}</text>
  </>;
}

function LightCurveFigure({ settings, en }) {
  const { levels, secondsPerLevel } = settings;
  const left=30, right=406, base=115, dx=(right-left)/levels.length;
  const high=Math.max(...levels);
  const y = level => base - 80*level/high;
  let path='M '+left+' '+base;
  for (const [i,level] of levels.entries()) path += ' V '+y(level)+' H '+(left+(i+1)*dx);
  return <>
    <text x="30" y="19">PPFD (µmol m⁻² s⁻¹)</text>
    <path className="fp-axis" d={`M${left} 28V${base}H${right}`} />
    <path className="fp-step-fill" d={path+' V '+base+' Z'} /><path className="fp-signal" d={path} />
    {levels.map((level,i)=><g key={level}>
      <text className="fp-level" x={left+(i+.5)*dx} y={y(level)-8} textAnchor="middle">{level}</text>
      <path className="fp-tick" d={`M${left+(i+1)*dx} ${base}v5`} />
    </g>)}
    <text x={left} y="141">0 s</text><text x="218" y="145" textAnchor="middle">{en ? secondsPerLevel+" s per level" : "단계당 "+secondsPerLevel+"초"}</text>
    <text x={right} y="141" textAnchor="end">{levels.length*secondsPerLevel} s</text>
  </>;
}

function NpqFigure({ settings, en }) {
  const { light, dark }=settings;
  const x = seconds => 26 + 380*seconds/(light.seconds+dark.seconds);
  return <>
    <rect x="26" y="33" width={x(light.seconds)-26} height="80" rx="4" className="fp-light-field"/>
    <rect x={x(light.seconds)} y="33" width={406-x(light.seconds)} height="80" rx="4" className="fp-dark-field"/>
    {[{phase:light,start:0,name:en?'Light':'작용광'},{phase:dark,start:light.seconds,name:en?'Dark':'암회복'}].map(({phase,start,name}) =>
      <g key={name}>
        <text x={x(start+phase.seconds/2)} y="22" textAnchor="middle">{name} · {phase.seconds} s</text>
        {Array.from({length:phase.pulses},(_,i)=>{
          const xp=x(start+phase.first+i*phase.interval);
          return <path key={i} className="fp-pulse" d={`M${xp} 101V54`}/>;
        })}
        <text x={x(start+phase.seconds/2)} y="130" textAnchor="middle">{en ? phase.pulses+" pulses" : "포화 펄스 "+phase.pulses+"회"}</text>
      </g>)}
    <path className="fp-axis" d="M26 102H406" />
    <text x="216" y="166" textAnchor="middle">{en ? "Time from actinic light onset" : "작용광을 켠 시점부터의 시간"}</text>
  </>;
}

function LeafReadout({ en, yieldMode }) {
  return <>
    <path d="M37 99Q46 33 128 33Q122 103 43 108Z" className="fp-leaf"/>
    <path d="M31 116Q86 66 119 43M56 93l6-28m10 15 24-2m-8-14 5-14" className="fp-leaf-veins"/>
    <path d="M61 19v28m20-28v20m-23 5 3 5 4-5m13-8 3 4 3-5" className="fp-pulse"/>
    <text x="81" y="143" textAnchor="middle">{en?'Leaf in clip':'잎 클립'}</text>
    <path d="M154 112h248m-245 0V30" className="fp-axis"/>
    {yieldMode ? <>
      <path d="M160 100h68q12-1 15-24l6-34q5-10 11 0l6 27q3 29 17 31h102" className="fp-signal"/>
      <text x="183" y="89">Fo / Ft</text><text x="270" y="39">Fm / Fm′</text>
      <text x="281" y="143" textAnchor="middle">{en?'Saturating pulse':'포화 펄스'}</text>
    </> : <>
      <path d="M165 79h222" className="fp-signal"/><circle className="fp-mark" cx="273" cy="79" r="5"/>
      <text x="273" y="65" textAnchor="middle">Ft</text>
      <text x="278" y="143" textAnchor="middle">{en?'Instantaneous reading':'순간 형광 판독'}</text>
    </>}
  </>;
}

function ParFigure({ en }) {
  return <>
    {[72,132,192,252,312].map(x=><path key={x} d={`M${x} 31l29 42m-9-3 9 3-1-10`} className="fp-pulse"/>)}
    <path d="M134 101q49-36 99 0Z" className="fp-leaf"/><path d="M123 102h121v12H123Z" className="fp-dark-field"/>
    <text x="270" y="106">PPFD</text>
    <text x="216" y="145" textAnchor="middle">{en?'Incident photons · PAR sensor':'입사 광자 · PAR 센서'}</text>
  </>;
}

function MultiFigure({ en }) {
  return <>
    <path d="M36 89h350" className="fp-axis"/>
    {[76,202,328].map((x,i)=><g key={x}>
      <path className="fp-signal" d={`M${x-18} 84h9l4-27 4 27h6l4-27 4 27h8`}/>
      <text x={x+3} y="112" textAnchor="middle">{en?'Record':'기록'} {i+1}</text>
    </g>)}
    <text x="216" y="26" textAnchor="middle">{en?'Repeat within each Multi interval':'Multi 간격마다 측정'}</text>
    <text x="216" y="151" textAnchor="middle">{en?'Elapsed time':'경과 시간'}</text>
  </>;
}

export default function Fp100MethodFigure({ method, en }) {
  const uid=useId();
  let body;
  if (method.id.startsWith('lc')) body=<LightCurveFigure en={en} settings={method.settings}/>;
  else if (method.id.startsWith('npq')) body=<NpqFigure en={en} settings={method.settings}/>;
  else if (method.id==='ojip') body=<OjipFigure en={en}/>;
  else if (method.id==='par') body=<ParFigure en={en}/>;
  else if (method.id==='multi') body=<MultiFigure en={en}/>;
  else body=<LeafReadout en={en} yieldMode={method.id==='qy'}/>;
  return <figure className="fp-method-figure">
    <figcaption>{en?'Measurement schematic':'측정 모식도'}</figcaption>
    <svg viewBox="0 -11 436 190" role="img" aria-labelledby={uid+'-title '+uid+'-desc'}>
      <title id={uid+'-title'}>{method.title}</title><desc id={uid+'-desc'}>{method.principle}</desc>{body}
    </svg>
  </figure>;
}
