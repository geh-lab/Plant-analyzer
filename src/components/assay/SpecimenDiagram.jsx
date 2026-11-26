import { useId } from 'react';

const tissues = {
  chlorophyll_a_b: ['plastid', '엽록체 내부', 'Inside the chloroplast', '엽록소와 카로티노이드는 틸라코이드 막의 광합성 복합체에 들어 있습니다. 분석에는 조직에서 추출한 색소를 사용합니다.', 'Chlorophylls and carotenoids are part of photosynthetic complexes in thylakoid membranes. The assay uses pigments extracted from tissue.'],
  total_phenol: ['leaf', '잎을 이루는 조직', 'Tissues of the leaf', '잎을 분쇄하면 여러 조직의 성분이 한 추출액에 모입니다. 그 추출액의 Folin 환원 반응을 측정합니다.', 'Grinding a leaf pools compounds from its different tissues. The Folin assay measures the reducing response of that extract.'],
  total_flavonoid: ['vacuole', '식물 세포의 액포', 'The plant cell vacuole', '액포는 여러 플라보노이드 배당체의 저장 장소입니다. AlCl₃ 반응은 조직에서 얻은 추출액에서 진행합니다.', 'Many flavonoid glycosides accumulate in vacuoles. The aluminium chloride reaction is performed on the tissue extract.'],
  glucosinolate: ['brassicaLeaf', '엽채류의 잎', 'Leafy Brassica tissue', '청경채에서는 잎몸과 잎자루의 글루코시놀레이트 함량이 다를 수 있습니다. 처리구를 비교할 때는 같은 부위에서 시료를 채취하세요.', 'Glucosinolate concentrations can differ between the leaf blade and petiole in pak choi. Sample the same part of the leaf when comparing treatments.'],
  anthocyanin: ['pigment', '액포에 축적된 색소', 'Pigments in the vacuole', '안토시아닌은 식물 세포의 액포에 축적될 수 있습니다. 흡광도는 조직에서 얻은 산성 추출액으로 측정합니다.', 'Anthocyanins can accumulate in the vacuole. The absorbance reading comes from an acidified tissue extract.'],
  dpph_scavenging: ['leaf', '조직에서 얻은 추출물', 'A whole-tissue extract', '잎 시료에는 표피와 엽육 등 여러 조직이 섞입니다. DPPH는 추출이 끝난 뒤 추출액에 첨가합니다.', 'A leaf sample includes epidermal and mesophyll tissues. DPPH is added to the extract after extraction.'],
  sod: ['cell', '잎 세포의 SOD', 'SOD in leaf cells', '잎의 세포질과 여러 소기관에 초과산화물 불균등화효소(SOD)가 있습니다. 추출액의 억제율은 시료 전체의 반응을 반영합니다.', 'Leaf cells contain superoxide dismutase (SOD) in the cytosol and in organelles. The inhibition assay measures the combined response of the extract.'],
  pod: ['wall', '세포벽과 세포 사이 공간', 'The cell wall and apoplast', '식물 퍼옥시다아제 중 일부는 세포벽에 존재합니다. 측정값은 구아이아콜과 반응한 조직 추출액의 활성입니다.', 'Some plant peroxidases occur in cell walls. This assay measures guaiacol-reactive activity in the tissue extract.'],
  cat: ['peroxisome', '과산화소체 속 카탈라아제', 'Catalase in a peroxisome', '과산화소체의 카탈라아제는 과산화수소를 분해합니다. 측정에는 조직 전체에서 얻은 효소 추출액을 사용합니다.', 'Peroxisomal catalase breaks down hydrogen peroxide. The assay uses an enzyme extract prepared from the tissue.'],
  h2o2: ['peroxideExtract', '잎 조직에서 얻은 상층액', 'Clarified leaf extract', '조직을 차가운 0.1% TCA로 균질화하고 원심분리합니다. 맑은 상층액에 담긴 과산화수소를 발색 반응에 사용합니다.', 'Homogenize tissue in cold 0.1% TCA and centrifuge. The clear supernatant supplies the hydrogen peroxide for the colour reaction.'],
  mda: ['membrane', '막 지질의 이중층', 'The membrane lipid bilayer', '막 지질의 불포화 지방산이 과산화되면 말론디알데하이드(MDA)가 생길 수 있습니다. TBA 발색은 가열한 조직 추출액에서 측정합니다.', 'Peroxidation of unsaturated fatty acids in membrane lipids can generate malondialdehyde (MDA). The TBA colour reaction is measured in the heated tissue extract.']
};

function Pointer({ at: [x, y], end, children }) {
  return <g className="specimen-pointer">
    <path d={`M${x} ${y} L223 ${end}h13`} fill="none" stroke="#536e60" strokeWidth="1"/>
    <circle cx={x} cy={y} r="2.6" fill="#284c39" stroke="#fffdf5" strokeWidth=".9"/>
    <text x="242" y={end+4} fill="#264636" fontSize="13" fontWeight="570">{children}</text>
  </g>;
}

function Granum({ x, y, count = 5 }) {
  return <g transform={`translate(${x} ${y})`}>
    {Array.from({length:count}, (_, i) => <g key={i} transform={`translate(0 ${i*3.7})`}>
      <path d="M-15 0c1-4 29-4 30 0v1.8c-1 3.4-28.5 4.1-30 0Z" fill={i%2?'#5c8460':'#4d7855'} stroke="#345c43" strokeWidth=".9"/>
      <ellipse rx="14.7" ry="2.3" fill="#8eab78" stroke="#406846" strokeWidth=".7"/>
    </g>)}
  </g>;
}
function Plastid({en}) {
  return <>
    <path d="M13 91C21 54 70 25 128 24c40-1 79 9 81 39 3 37-44 68-113 70-48 2-84-10-83-42Z" fill="#bfd3a2" stroke="#416748" strokeWidth="2.5"/>
    <path d="M19 90C28 54 82 30 131 29c38-1 70 11 72 35 0 31-47 61-107 63-43 1-78-8-77-37Z" fill="#e1e8bf" stroke="#7e9d70" strokeWidth="1.4"/>
    <path d="M38 100c23-15 35-17 57-17 42-1 66-23 93-31M47 105c32-15 53-15 77-17 22-3 43-12 61-23M68 63c11-3 27-4 43-3" stroke="#84a56e" strokeWidth="2.2" fill="none"/>
    <Granum x={52} y={81} count={4}/><Granum x={89} y={57} count={5}/><Granum x={127} y={78} count={5}/><Granum x={170} y={49} count={4}/>
    <Pointer at={[159,30]} end={25}>{en?'Envelope':'엽록체 외피'}</Pointer><Pointer at={[171,58]} end={72}>{en?'Granum':'그라눔'}</Pointer><Pointer at={[153,100]} end={117}>{en?'Stroma':'스트로마'}</Pointer>
  </>;
}
function Leaf({en}) {
  const cells='M0 3q8-5 17 0l1 9q-11 6-18 0z';
  return <>
    <path d="M13 41Q91 22 203 33v68c-61-4-119 4-190 18Z" fill="#e7eacb" stroke="#557756" strokeWidth="1.6"/>
    <svg aria-hidden="true" x="14" y="25" width="190" height="94" viewBox="0 0 190 94" overflow="hidden">
      <g transform="matrix(1 -.06 0 1 0 11)">
        {Array.from({length:11},(_,i)=><g key={i} transform={`translate(${i*18} 0)`}><path d={cells} fill="#bbcea5" stroke="#6e8967" strokeWidth="1"/><path d="M2 16q7-5 13 0l-1 20q-5 8-11 3z" fill={i%2?'#96b681':'#aac291'} stroke="#68865e"/><path d="M5 19v12" stroke="#dce8bd" strokeWidth="2"/></g>)}
        {Array.from({length:8},(_,i)=><g key={i} transform={`translate(${i*25-5} ${48+i%2*7})`}><path d="M0 5q6-11 19-5l3 7q-8 7-15 4z" fill="#b7cba1" stroke="#77916b"/><path d="M5 5l7-3" stroke="#dce6c9" strokeWidth="1.4"/></g>)}
        {Array.from({length:11},(_,i)=><path key={i} d={cells} transform={`translate(${i*18} 65)`} fill="#c3d3b1" stroke="#798f70"/>)}
      </g>
    </svg>
    <path d="M13 40q85-18 191-9" stroke="#496f4c" strokeWidth="2.5" fill="none"/>
    <Pointer at={[178,37]} end={27}>{en?'Epidermis':'표피'}</Pointer><Pointer at={[170,57]} end={71}>{en?'Palisade mesophyll':'울타리 조직'}</Pointer><Pointer at={[161,82]} end={114}>{en?'Spongy mesophyll':'해면 조직'}</Pointer>
  </>;
}
function Cell({en, variant}) {
  const pigmented=variant==='pigment', vacuole=variant==='vacuole'||pigmented;
  return <>
    <path d="M15 66 34 31 119 17 177 30 204 64 189 104 132 132 53 124 19 101Z" fill="#bfceaa" stroke="#557252" strokeWidth="2.4" strokeLinejoin="round"/>
    <path d="m21 66 18-30 80-13 55 12 24 30-14 35-53 26-76-7-30-21Z" fill="#e7e5ba" stroke="#718867" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M42 65q8-21 38-25l39-6q33 2 46 17 14 24-7 43-12 14-39 16l-38-2q-37 0-42-24-2-10 3-19Z" fill={pigmented?'#d7abc0':vacuole?'#d2d3c1':'#d4dfcb'} stroke={pigmented?'#97637c':'#91a88e'} strokeWidth="1.6"/>
    <g fill="#789564" stroke="#4d734e" strokeWidth="1">{[[48,48,-27],[71,117,12],[172,45,40]].map(([x,y,r])=><g key={x} transform={`translate(${x} ${y}) rotate(${r})`}><ellipse rx="14" ry="5.7"/><path d="M-9-1h6m-5 2h7m3-2h6m-6 2h6" stroke="#bdce9a" strokeWidth="1.1"/></g>)}</g>
    <g transform="translate(153 113) rotate(-18)"><path d="M-12 0q1-6 9-6l10 2q7 1 5 7c-4 6-20 4-24-3Z" fill="#b78b67" stroke="#856145"/><path d="m-7 0 3-2 1 4 4-4 2 4 4-3" fill="none" stroke="#efe1b8" strokeWidth="1.3"/></g>
    <ellipse cx="184" cy="77" rx="5" ry="5" fill="#adbf8e" stroke="#5d7755" strokeWidth="1.3"/>
    {pigmented && <g fill="#a36682" opacity=".65">{[[70,64],[104,53],[134,75],[84,90],[117,87],[144,58],[60,79],[99,72],[128,49]].map(([x,y])=><circle key={x} cx={x} cy={y} r="2.1"/>)}</g>}
    {vacuole ? <>
      <Pointer at={[170,36]} end={26}>{en?'Cell wall':'세포벽'}</Pointer>
      <Pointer at={[122,74]} end={70}>{en?'Vacuole':'액포'}</Pointer>
      <Pointer at={[145,99]} end={114}>{en?'Tonoplast':'액포막'}</Pointer>
    </> : <>
      <Pointer at={[172,45]} end={26}>{en?'Chloroplast':'엽록체'}</Pointer>
      <Pointer at={[180,92]} end={72}>{en?'Cytosol':'세포질액'}</Pointer>
      <Pointer at={[153,113]} end={116}>{en?'Mitochondrion':'미토콘드리아'}</Pointer>
    </>}
  </>;
}
function Peroxisome({ en }) {
  return <>
    <path d="M19 83c-3-32 29-56 79-63 45-7 86 4 98 35 15 36-19 68-70 75-54 8-104-8-107-47Z" fill="#c1d6bf" stroke="#4f8066" strokeWidth="2.6"/>
    <path d="M24 81c-2-28 29-50 75-56 43-6 80 5 92 32 13 30-19 60-66 68-50 7-98-8-101-44Z" fill="#dce7d2" stroke="#94af95" strokeWidth="1.2"/>
    <g fill="#bacbb5">{[[43,65],[56,90],[73,106],[81,73],[105,33],[119,82],[160,97],[180,66],[106,112],[149,56],[150,116]].map(([x,y])=><circle key={x} cx={x} cy={y} r="1.8"/>)}</g>
    {[[63,64,-10],[113,56,20],[96,93,-14],[156,78,8]].map(([x,y,r])=><g key={x} transform={`translate(${x} ${y}) rotate(${r})`} stroke="#4b7862" strokeWidth="1">
      <path d="M-10-5q1-7 7-5l4 6-6 6q-7 1-5-7Z" fill="#78a486"/>
      <path d="M0-6q2-5 9-3 6 3 2 8l-7 3Z" fill="#5d8c72"/>
      <path d="M-8 3q3-6 9-3l2 8q-6 6-11 1Z" fill="#9abd9b"/>
      <path d="M3 2q7-4 11 1 1 6-5 8l-6-2Z" fill="#83ad90"/>
    </g>)}
    <Pointer at={[157,25]} end={25}>{en?'Membrane':'과산화소체 막'}</Pointer>
    <Pointer at={[155,79]} end={73}>{en?'Catalase':'카탈라아제'}</Pointer>
    <Pointer at={[143,104]} end={118}>{en?'Matrix':'기질'}</Pointer>
  </>;
}

function PeroxideExtract({ en }) {
  return <>
    <g transform="translate(10 34)">
      <path d="M1 14Q15-2 36 4q21 9 28 45-28 4-48-11Q4 29 1 14Z" fill="#97b284" stroke="#557951" strokeWidth="1.7"/>
      <path d="M7 12q28 16 61 41m-42-29 4-13m9 21 6-13m-7 13-14 1" fill="none" stroke="#6a8f5c" strokeWidth="1.6"/>
    </g>
    <path d="M85 79h24m-5-4 5 4-5 4" fill="none" stroke="#638168" strokeWidth="1.6" strokeLinejoin="round"/>
    <g transform="translate(118 16)" strokeLinejoin="round">
      <path d="M3 14h59v62l-17 29-11 9q-3 2-6 0l-9-10L3 77Z" fill="#edf2e2" stroke="#668476" strokeWidth="2"/>
      <path d="M7 45q22-3 51 0v30l-16 27-10 8-10-10L7 75Z" fill="#d1ddaf" stroke="#96ae89"/>
      <path d="M24 98q10 3 21-2l-5 9-8 6Z" fill="#85945d" stroke="#708553"/>
      <path d="M1 11Q31 5 65 10v6Q31 21 1 16Z" fill="#cfddcb" stroke="#668476" strokeWidth="1.6"/>
      <path d="M10 25v43" fill="none" stroke="#fff" strokeWidth="2.6"/>
    </g>
    <Pointer at={[44,54]} end={25}>{en?'Leaf tissue':'잎 조직'}</Pointer>
    <Pointer at={[155,73]} end={73}>{en?'Supernatant':'맑은 상층액'}</Pointer>
    <Pointer at={[150,120]} end={119}>{en?'Tissue pellet':'조직 침전물'}</Pointer>
  </>;
}
function BrassicaLeaf({en}) {
  return <>
    <path d="M19 30C30 24 29 19 43 20c9-8 19-8 28-5 9-6 22-4 30 0 12-1 21 3 27 9 18 3 30 13 35 24 8 10 12 24 9 36-2 9-7 16-14 22-17-4-24 4-42 5-11 2-23-2-31-6-16 1-29-6-36-14-13-5-20-16-23-25-9-8-12-22-7-36Z" fill="#94b381" stroke="#50734e" strokeWidth="2.2" strokeLinejoin="round"/>
    <g fill="none" stroke="#c6d9ae" strokeWidth="1.5" strokeLinecap="round">
      <path d="M61 48Q57 33 46 25m29 32q-5-25-15-36m34 46q-5-27-22-47m44 63q-8-35-28-57m49 72q-6-37-24-62m45 71q0-30-13-53"/>
      <path d="M52 44q-16 7-26 3m42 7q-22 12-37 9m57 4q-25 15-47 13m70 1q-28 17-52 13m76 1q-27 15-50 11"/>
    </g>
    <path d="M26 32C66 49 99 70 129 87c20 12 38 18 60 19l13 11-3 10c-33-8-51-21-72-35C91 70 61 49 26 32Z" fill="#dae4ba" stroke="#839667" strokeWidth="1.1"/>
    <path d="M145 99q25 15 50 21" fill="none" stroke="#b3c390" strokeWidth="1.5"/>
    <Pointer at={[128,43]} end={28}>{en?'Leaf blade':'잎몸'}</Pointer>
    <Pointer at={[119,84]} end={73}>{en?'Midrib':'주맥'}</Pointer>
    <Pointer at={[181,115]} end={119}>{en?'Petiole':'잎자루'}</Pointer>
  </>;
}
function Wall({en}) {
  return <>
    <path d="M10 22h93l-17 108H10Z" fill="#d6dfbb"/><path d="M10 22h78L72 130H10Z" fill="#e8e7c7"/>
    <path d="M128 22h78v108h-96Z" fill="#d6dfbb"/><path d="M143 22h63v108h-78Z" fill="#e8e7c7"/>
    <path d="M91 22 75 130m65-108-16 108" fill="none" stroke="#4d7151" strokeWidth="2.5"/>
    <path d="M107 22 91 130m33-108-16 108" fill="none" stroke="#8fa779" strokeWidth="2.5"/>
    <path d="m96 29 4-2m-9 19 11-5m-14 26 11-8m-10 24 7-3m-14 31 10-9m32-71 9-4m-13 21 10-5m-13 27 9-6m-12 28 9-5m-14 31 11-8" fill="none" stroke="#98ad80" strokeWidth="1.3"/>
    <path d="M17 37h39m-31 4h23m112 62h33m-28 5h16" fill="none" stroke="#d1d6b1" strokeWidth="1.2"/>
    <Pointer at={[131,39]} end={27}>{en?'Cell wall':'세포벽'}</Pointer><Pointer at={[112,73]} end={74}>{en?'Intercellular space':'세포 사이 공간'}</Pointer><Pointer at={[126,116]} end={119}>{en?'Plasma membrane':'세포막'}</Pointer>
  </>;
}
function Membrane({en}) {
  return <>
    <rect x="14" y="38" width="185" height="67" rx="4" fill="#e9dccb"/>
    {Array.from({length:12},(_,i)=>{
      const x=20+i*15.4, unsaturated=i%4===1||i===9;
      return <g key={i} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${x-2} 45l-2 24m6-24 2 12 ${unsaturated?'6 4-1 8':'0 13'} M${x-2} 99l-2-23m6 23 2-12 2-10`} stroke={unsaturated?'#a97e67':'#bb9c79'} fill="none"/>
        <ellipse cx={x} cy="40" rx="6.4" ry="5.2" fill="#bfc6a7" stroke="#718368" strokeWidth="1.2"/>
        <ellipse cx={x} cy="104" rx="6.4" ry="5.2" fill="#bfc6a7" stroke="#718368" strokeWidth="1.2"/>
      </g>;
    })}
    <Pointer at={[189,40]} end={24}>{en?'Polar head':'극성 머리'}</Pointer><Pointer at={[167,61]} end={74}>{en?'Unsaturated tail':'불포화 지방산 꼬리'}</Pointer><Pointer at={[189,104]} end={119}>{en?'Inner leaflet':'안쪽 지질층'}</Pointer>
  </>;
}
const drawings={plastid:Plastid, leaf:Leaf, vacuole:Cell, pigment:Cell, cell:Cell, peroxisome:Peroxisome, peroxideExtract:PeroxideExtract, brassicaLeaf:BrassicaLeaf, membrane:Membrane, wall:Wall};

export default function SpecimenDiagram({id,en}) {
  const uid=useId();
  const [variant,ko,eng,koNote,enNote]=tissues[id];
  const Drawing=drawings[variant], title=en?eng:ko, note=en?enNote:koNote;
  return <figure className="assay-specimen">
    <figcaption><span>{en?'Plant material':'식물 시료'}</span><strong>{title}</strong></figcaption>
    <div className="assay-specimen-window">
      <svg viewBox="0 0 370 150" role="img" aria-labelledby={uid+'-t '+uid+'-d'}>
        <title id={uid+'-t'}>{title}</title><desc id={uid+'-d'}>{note}</desc><Drawing variant={variant} en={en}/>
      </svg>
    </div>
    <p>{note}</p>
  </figure>;
}
