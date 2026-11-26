import { useId } from 'react';
import { assayFigures } from './assayFigures';

const outline = 'var(--diagram-line, #a7bdc2)';
const light = 'var(--diagram-glass, #24313a)';
const at = (en, ko, eng) => en ? eng : ko;

function Label({x, y, children, small = false, align = 'middle', weight = 600, colour = 'var(--diagram-label, #edf1ee)'}) {
  return <text x={x} y={y} textAnchor={align} fontSize={small ? 12 : 15} fontWeight={weight} fill={colour}>{children}</text>;
}
function Arrow({x1, y, x2}) {
  return <path d={`M${x1} ${y}H${x2}m-5 -4 5 4-5 4`} fill="none" stroke={outline} strokeWidth="1.6" strokeLinejoin="round"/>;
}
function Vial({x,y,colour,width = 40,height = 63}) {
  const uid = useId();
  const liquid = uid+'-liquid', glass = uid+'-glass';
  const body = `M3 4h${width-6}v${height-17}q0 11 -11 11H14q-11 0 -11 -11z`;
  return <g transform={`translate(${x} ${y})`}>
    <defs>
      <linearGradient id={glass}><stop stopColor="#e0f4f5" stopOpacity=".27"/><stop offset=".2" stopColor="#334047"/><stop offset=".78" stopColor="#27353a"/><stop offset="1" stopColor="#c1d3d5" stopOpacity=".5"/></linearGradient>
      <linearGradient id={liquid}><stop stopColor={colour} stopOpacity=".6"/><stop offset=".23" stopColor={colour}/><stop offset=".7" stopColor={colour} stopOpacity=".86"/><stop offset="1" stopColor={colour} stopOpacity=".48"/></linearGradient>
    </defs>
    <path d={body} fill={`url(#${glass})`} stroke="#b6c6c7" strokeWidth="1.4"/>
    <path className="diagram-liquid" d={`M5 ${height*.44}q${width*.20} -2 ${(width-10)/2} 0t${(width-10)/2} 0v${height*.56-13}q0 8 -9 8H14q-9 0 -9 -8z`} fill={`url(#${liquid})`}/>
    <ellipse cx={width/2} cy={height*.44} rx={width/2-5} ry="2" fill={colour}/>
    <ellipse cx={width/2} cy="3.5" rx={width/2} ry="2.6" fill="#263b41" stroke="#c4d4d3" strokeWidth="1.1"/>
    <path d={`M8 10v${height-25}M${width-9} 11v16`} stroke="#f1f9f5" opacity=".42" strokeWidth="1.4" strokeLinecap="round"/>
  </g>;
}
function Well({x,y,colour}) {
  return <g transform={`translate(${x} ${y})`}>
    <ellipse rx="27" ry="18" fill={light} stroke={outline} strokeWidth="1.8"/>
    <ellipse className="diagram-well-core" rx="21" ry="12" fill={colour}/>
    <path d="M-17 -2q7 -8 17 -7" fill="none" stroke="white" opacity=".7" strokeWidth="2"/>
  </g>;
}
function Mda({en}) {
  const uid=useId();
  const glass=uid+'-face', fluid=uid+'-fluid';
  return <>
    <defs>
      <linearGradient id={glass}><stop stopColor="#e8f5fa" stopOpacity=".22"/><stop offset=".18" stopColor="#cde1e7" stopOpacity=".03"/><stop offset=".85" stopColor="#b2d6e3" stopOpacity=".15"/><stop offset="1" stopColor="#fff" stopOpacity=".33"/></linearGradient>
      <linearGradient id={fluid}><stop stopColor="#db91a4" stopOpacity=".55"/><stop offset=".17" stopColor="#efa6b7"/><stop offset=".52" stopColor="#cc7992"/><stop offset="1" stopColor="#9e5e7c"/></linearGradient>
    </defs>
    <Label x={190} y={15} small>MDA + 2 TBA → MDA–(TBA)₂</Label>
    <g strokeLinejoin="round" strokeWidth="1.4">
      <path d="M153 34l14-10h64l-13 10z" fill="#4a565d" stroke="#b7c6c8"/>
      <path d="M153 34h65v72h-65z" fill={`url(#${glass})`} stroke="#b4c0c5"/>
      <path d="M218 34l13-10v71l-13 11z" fill="#68848b" fillOpacity=".33" stroke="#a1b9be"/>
      <path d="M157 52h57v50h-57z" fill={`url(#${fluid})`} stroke="none"/>
      <path d="M214 52l13-9v50l-13 9z" fill="#925775" stroke="none"/>
      <path d="M157 52l12-9h58l-13 9z" fill="#efb2bf" stroke="none"/>
      <path d="M158 39v57m3-58v24m53-23v60m12-66v9" stroke="#eff9fc" opacity=".48" strokeWidth="1"/>
    </g>
    <Label x={24} y={65} align="start">532 nm</Label><Label x={24} y={88} align="start">600 nm</Label>
    <g className="diagram-beams" fill="none" strokeLinecap="round">
      <path d="M95 61h57" stroke="#87e6ae" strokeWidth="3"/><path d="M153 61h78" stroke="#a8efb7" strokeWidth="5" opacity=".72"/><path d="M231 61h34" stroke="#8fd7a7" strokeWidth="2"/>
      <path d="M95 84h170" stroke="#f0ae77" strokeWidth="2" strokeDasharray="5 3"/>
    </g>
    <g fill="#3e4d50" stroke="#b7c3bf" strokeWidth="1"><rect x="267" y="54" width="9" height="14" rx="1.5"/><rect x="267" y="77" width="9" height="14" rx="1.5"/></g>
    <path d="M278 61h9v23h-9" fill="none" stroke={outline} strokeWidth="1.5"/>
    <Arrow x1={288} y={72} x2={306}/><Label x={337} y={78} colour="#f5a2b8">ΔA</Label>
    <Label x={190} y={134} small>{at(en,'95 °C · 30분 가열     |     A532 − A600','95 °C · 30 min heating     |     A532 − A600')}</Label>
  </>;
}
function Peroxide({en}) {
  const iodide = '#d8c4a3', iodine = '#b99c76', triiodide = '#e0a964';
  return <>
    <g stroke="#d6ba8e" strokeWidth="2">
      <circle cx="31" cy="59" r="10" fill={iodide}/><circle cx="59" cy="59" r="10" fill={iodide}/>
      <path d="M168 59h19m112 0h44" strokeWidth="3"/>
      {[167,189].map(x=><circle key={x} cx={x} cy="59" r="10" fill={iodine}/>)}
      <g className="diagram-marker">{[298,319,340].map(x=><circle key={x} cx={x} cy="59" r="10" fill={triiodide}/>)}</g>
    </g>
    <Label x={45} y={91}>2 I⁻</Label><Label x={178} y={91}>I₂</Label><Label x={318} y={91} colour="#f2c781">I₃⁻</Label>
    <Label x={113} y={31} small>H₂O₂</Label><Arrow x1={84} x2={144} y={59}/>
    <Label x={244} y={31} small>+ I⁻</Label><Label x={244} y={65}>⇌</Label>
    <Label x={45} y={112} small>{at(en,'요오드화물','Iodide')}</Label><Label x={179} y={112} small>{at(en,'요오드','Iodine')}</Label><Label x={318} y={112} small>{at(en,'삼요오드화물','Triiodide')}</Label>
    <Label x={190} y={138} small colour="#f0d19e">{at(en,'암조건 1시간 · A390 판독','1 h in darkness · read A390')}</Label>
  </>;
}

function SlopeInset({ en, rising }) {
  const ink = rising ? '#edac80' : '#8dd6dc';
  const upper = rising ? 39 : 47;
  return <g>
    <path d="M238 32v64h117" fill="none" stroke={outline} strokeWidth="1.4"/>
    <Label x={236} y={21} small>{rising ? 'A470' : 'A240'}</Label>
    <path className="diagram-trace" pathLength="1" d={rising ? 'M244 85 305 42':'M244 39 305 83'} stroke={ink} strokeWidth="2.7" fill="none"/>
    <path d={rising ? 'M244 85 305 78':'M244 39 305 46'} stroke="#c4cdc8" strokeWidth="1.6" strokeDasharray="4 3" fill="none"/>
    <Label x={311} y={upper+3} small align="start" colour={rising?ink:outline}>{rising?at(en,'시료','Sample'):at(en,'대조구','Control')}</Label>
    <Label x={311} y={rising?82:87} small align="start" colour={rising?outline:ink}>{rising?at(en,'블랭크','Blank'):at(en,'시료','Sample')}</Label>
    <Label x={334} y={115} small>{at(en,'시간','Time')}</Label>
  </g>;
}
function Catalase({en}) {
  return <>
    <g transform="translate(20 30)" strokeLinecap="round">
      <path d="m7 17 12-9 18 8 11-8m-39 35 12-8 17 8 11-8" stroke="#d8e5e4" strokeWidth="2.5" fill="none"/>
      {[[19,8],[37,16],[21,35],[38,43]].map(([x,y])=><circle key={x} cx={x} cy={y} r="5.8" fill="#dd9587"/>)}
      {[[7,17],[48,8],[9,43],[49,35]].map(([x,y])=><circle key={x+','+y} cx={x} cy={y} r="3.9" fill="#eef2eb"/>)}
    </g>
    <Label x={45} y={97}>2 H₂O₂</Label>
    <Arrow x1={82} x2={121} y={57}/><Label x={101} y={41} small colour="#9edcce">CAT</Label>
    <g strokeLinecap="round">
      {[[143,45],[163,61]].map(([x,y])=><g key={x} transform={`translate(${x} ${y})`}><path d="m-7 4 7-5 7 5" stroke="#e7ede5" strokeWidth="2.2" fill="none"/><circle r="5.4" fill="#dd9587"/><circle cx="-7" cy="4" r="3.4" fill="#eef2eb"/><circle cx="7" cy="4" r="3.4" fill="#eef2eb"/></g>)}
      <path d="M186 51h11m-11 3h11" stroke="#e8c1b4" strokeWidth="1.5"/><circle cx="184" cy="52" r="5.6" fill="#dd9587"/><circle cx="198" cy="52" r="5.6" fill="#dd9587"/>
    </g>
    <Label x={166} y={97}>2 H₂O + O₂</Label>
    <SlopeInset en={en} rising={false}/>
    <Label x={109} y={132} small>{at(en,'H₂O₂ 소모 → A240 감소','H₂O₂ consumed → A240 falls')}</Label>
  </>;
}
function Peroxidase({en}) {
  return <>
    <g transform="translate(45 54)" stroke="#eac29b" strokeWidth="1.7" fill="none" strokeLinejoin="round">
      <path d="m0-15 13 8v15l-13 8-13-8V-7Z M0-15v-8m13 16 9-6"/><circle r="8"/>
    </g>
    <Label x={44} y={26} small colour="#f2d3ac">OH</Label><Label x={82} y={43} small colour="#f2d3ac">OCH₃</Label>
    <Label x={49} y={99} small>{at(en,'구아이아콜','Guaiacol')}</Label>
    <Arrow x1={98} x2={134} y={61}/><Label x={115} y={43} small>POD</Label><Label x={115} y={82} small>H₂O₂</Label>
    <Vial x={153} y={30} width={35} height={60} colour="#c18c64"/>
    <Label x={171} y={107} small>{at(en,'테트라구아이아콜','Tetraguaiacol')}</Label>
    <SlopeInset en={en} rising/>
    <Label x={107} y={134} small>{at(en,'산화 생성물 축적 → A470 증가','Oxidized product → A470 rises')}</Label>
  </>;
}
function Sod({en}) {
  return <>
    <g transform="translate(39 44)" stroke="#e8d59a" strokeLinecap="round">
      <circle r="12" fill="#d4c189" strokeWidth="1.5"/>
      {Array.from({length:8},(_,i)=><path key={i} transform={`rotate(${i*45})`} d="M0-17v-5" strokeWidth="1.8"/>)}
    </g>
    <Label x={49} y={83} small>{at(en,'리보플라빈','Riboflavin')}</Label>
    <Label x={49} y={101} small>{at(en,'빛 · 15분','Light · 15 min')}</Label>
    <Arrow x1={77} x2={105} y={57}/><Label x={135} y={64} colour="#d7c9f1">O₂•⁻</Label>
    <path d="M159 58h11l15-27h49m-6-4 6 4-6 4m-58 23 15 40h49m-6-4 6 4-6 4" stroke={outline} strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
    <Label x={206} y={22} small>NBT</Label><Label x={206} y={89} small>SOD</Label>
    <g transform="translate(259 38) scale(.56)"><Well x={0} y={0} colour="#8b8fc4"/></g>
    <Label x={278} y={42} align="start" small>{at(en,'포마잔','Formazan')}</Label>
    <Label x={249} y={104} align="start" colour="#d7c9f1">H₂O₂ + O₂</Label>
    <Label x={190} y={137} small>{at(en,'SOD가 초과산화물을 제거하면 NBT 발색 감소 · A560','SOD diverts superoxide from NBT · less colour at A560')}</Label>
  </>;
}
function Dpph({en}) {
  return <>
    <Vial x={39} y={21} width={46} height={68} colour="#8563ad"/>
    <Label x={62} y={107} colour="#d6bce9">DPPH•</Label>
    <Arrow x1={101} y={55} x2={235}/>
    <Label x={168} y={37} small>{at(en,'추출액의 환원성 성분','Extract reductants')}</Label>
    <Label x={168} y={77} small>{at(en,'암조건 1시간','1 h in darkness')}</Label>
    <Vial x={265} y={21} width={46} height={68} colour="#dbcb8d"/>
    <Label x={289} y={107} colour="#eedaa1">DPPH–H</Label>
    <Label x={190} y={136} small>{at(en,'보라색 라디칼 감소 → 시료 블랭크 보정 A517 감소','Loss of purple radical → lower blank-corrected A517')}</Label>
  </>;
}
function Chlorophyll({en, gradient}) {
  const marks = [{x:93, label:'470',end:85,pos:100},{x:280,label:'652.4',end:245,pos:31},{x:294,label:'665.2',end:328,pos:105}];
  return <>
    <defs><linearGradient id={gradient}>{[['0%','#a590be'],['17%','#8cafd3'],['40%','#9bbd9a'],['64%','#e1cf92'],['84%','#d79876'],['100%','#ba7b83']].map(([offset,colour])=><stop key={offset} offset={offset} stopColor={colour}/>)}</linearGradient></defs>
    <rect x="33" y="55" width="314" height="18" rx="5" fill={'url(#'+gradient+')'}/>
    {marks.map(({x,label,end,pos})=><g key={label} className="diagram-marker"><path d={`M${x} 64V${pos<64 ? 43 : 83}L${end} ${pos<64 ? 38 : 91}`} stroke={outline} strokeWidth="1.5" fill="none"/><circle cx={x} cy="64" r="3.2" fill={outline}/><Label x={end} y={pos+3} small>{label} nm</Label></g>)}
    <Label x={190} y={133} small>{at(en,'90% 메탄올 추출액','90% methanol extract')}</Label>
  </>;
}
function Phenols({en}) {
  return <>
    <path d="M39 36h51m-43 1v49q0 13 16 13h3q16 0 16-13V37" fill={light} stroke={outline} strokeWidth="2"/>
    <path d="M50 68q14 -4 29 0v17q0 11 -12 11h-5q-12 0 -12 -11z" fill="#e0cc9e"/>
    <Label x={64} y={122} small>{at(en,'추출액','Extract')}</Label><Label x={114} y={71}>+</Label>
    <g transform="translate(142 27)"><rect x="8" y="0" width="31" height="11" rx="2" fill="#60737b"/><path d="M9 11h29v10l6 10v38H3V31l6-10z" fill={light} stroke={outline} strokeWidth="2"/><rect x="7" y="38" width="33" height="19" fill="#d8e1df"/><Label x={23} y={52} small colour="#2d4650">F–C</Label></g>
    <Arrow x1={212} y={66} x2={251}/><Vial x={274} y={29} width={46} height={69} colour="#7396c4"/>
    <Label x={297} y={122} small>{at(en,'청색 · 765 nm','Blue · 765 nm')}</Label>
  </>;
}
function Flavonoids({en}) {
  return <>
    <g stroke="#d9c471" strokeWidth="2" fill="none"><path d="M40 58l17-10 17 10v20l-17 10-17-10zM74 58l17-10 17 10v20l-17 10-17-10"/><path d="M108 58l13-7m-13 27 14 7"/></g>
    <Label x={75} y={118} small>{at(en,'반응성 성분','Reactive flavonoids')}</Label>
    <Label x={160} y={73}>+</Label><Label x={206} y={73} colour="#efda90">Al³⁺</Label>
    <Arrow x1={241} y={68} x2={269}/>
    <g className="diagram-complex" stroke="#b09a42" strokeWidth="2"><circle cx="309" cy="68" r="23" fill="#f0e2a0"/><path d="M296 60l12 10 12-11m-12 11v12" fill="none"/><circle cx="308" cy="70" r="4" fill="#886b17"/></g>
    <Label x={306} y={118} small>{at(en,'착물 · 415 nm','Complex · 415 nm')}</Label>
  </>;
}
function Glucosinolates({en}) {
  return <>
    <Vial x={39} y={31} width={40} height={63} colour="#aad0a8"/>
    <Label x={59} y={118} small>{at(en,'잎 추출액','Leaf extract')}</Label>
    <Label x={99} y={68}>+</Label>
    <Label x={155} y={68} colour="#e1cf9b">Na₂PdCl₄</Label>
    <Arrow x1={200} y={64} x2={225}/>
    <path d="M251 34v58h92" fill="none" stroke={outline} strokeWidth="1.5"/>
    <Label x={251} y={23} small>A425</Label>
    <path className="diagram-trace" pathLength="1" d="M258 85 335 40" fill="none" stroke="#b9d9a6" strokeWidth="2"/>
    {[[268,79],[290,67],[312,53],[332,42]].map(([x,y])=><circle key={x} cx={x} cy={y} r="3" fill="#c8e1b2" stroke="#3a5342"/>)}
    <Label x={298} y={116} small>{at(en,'시니그린 표준 농도','Sinigrin concentration')}</Label>
    <Label x={298} y={133} small weight={400}>{at(en,'검량선 모식도','Calibration schematic')}</Label>
  </>;
}
function Anthocyanins({en}) {
  return <>
    <Vial x={36} y={33} width={44} height={68} colour="#b5688d"/>
    <path d="M90 66h25m0 0 16-21h15m-31 21 16 22h15" fill="none" stroke={outline} strokeWidth="1.5"/>
    <Label x={173} y={50}>A530</Label><Label x={173} y={93}>A600</Label><Label x={173} y={71} small>−</Label>
    <Arrow x1={208} y={67} x2={241}/>
    <g transform="translate(259 44)">{['#e2bdcf','#c98da9','#ac607f'].map((c,i)=><g className="diagram-marker" key={c} style={{ "--delay": `${i*55}ms` }}><path d={`M${i*24} 0h16v40q-8 12 -16 0z`} fill={light} stroke="#846576" strokeWidth="1.6"/><path d={`M${i*24+2} 18h12v20q-6 10 -12 0z`} fill={c}/></g>)}</g>
    <Label x={59} y={123} small>{at(en,'산성 추출액','Acid extract')}</Label>
    <Label x={289} y={123} small>{at(en,'C3G 표준액','C3G standards')}</Label>
  </>;
}
const drawings = {
  mda: Mda, h2o2: Peroxide, cat: Catalase, pod: Peroxidase, sod: Sod, dpph_scavenging: Dpph,
  chlorophyll_a_b: Chlorophyll, total_phenol: Phenols, total_flavonoid: Flavonoids, glucosinolate: Glucosinolates, anthocyanin: Anthocyanins
};
export default function AssayDiagram({id, en}) {
  const svgId = useId();
  const figure = assayFigures[id], Drawing = drawings[id], lang = en ? 1 : 0;
  return <figure className="assay-diagram" data-method={id}>
    <figcaption><span>{en ? 'Measurement principle' : '측정 원리'}</span><strong>{figure.name[lang]}</strong></figcaption>
    <div className="assay-diagram-window"><svg viewBox="0 0 380 146" role="img" aria-labelledby={`${svgId}-title ${svgId}-desc`}>
      <title id={svgId+'-title'}>{figure.name[lang]}</title><desc id={svgId+'-desc'}>{figure.caption[lang]}</desc>
      <Drawing en={en} gradient={svgId+'-spectrum'}/>
    </svg></div>
    <p>{figure.caption[lang]}</p>
  </figure>;
}
