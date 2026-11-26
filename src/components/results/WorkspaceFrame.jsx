import { ArrowLeft, Database, ChartNoAxesCombined } from 'lucide-react';
import { Link } from 'react-router-dom';
import './results.css';

export function WorkspaceFrame({ lang, back, backLabel, title, description, image, activeTab, inputKey, onTabChange, children }) {
  const en = lang === 'en';
  return <div className="ra-workspace">
    <Link className="ra-back" to={back}><ArrowLeft size={15}/>{backLabel}</Link>
    <header className="ra-head">
      {image && <img src={image} aria-hidden="true" alt="" className="ra-head-photo" />}
      <div><h1>{title}</h1><p>{description}</p></div>
    </header>
    <nav className="ra-tabbar" aria-label={en ? 'Analysis workspace' : '분석 작업 공간'}>
      {[[inputKey, Database, en ? 'Data & results' : '데이터 및 결과'], ['visualization', ChartNoAxesCombined, en ? 'Visualization' : '시각화']].map(([key, Icon, label]) =>
        <button type="button" key={key} aria-current={activeTab === key ? 'page' : undefined} onClick={() => onTabChange(key)}><Icon size={17}/>{label}</button>)}
    </nav>
    <div className="ra-stack">{children}</div>
  </div>;
}

export function AssayMissing({ back, lang }) {
  return <div className="ra-workspace ra-missing"><h1>{lang === 'en' ? 'Choose an assay to begin' : '분석할 항목을 선택하세요'}</h1>
    <Link className="ra-action" to={back}><ArrowLeft size={15}/>{lang === 'en' ? 'View analysis protocols' : '분석 방법 보기'}</Link></div>;
}
