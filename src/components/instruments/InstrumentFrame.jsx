import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import "./instruments.css";

export function InstrumentFrame({
  parent,
  parentPath,
  title,
  summary,
  image,
  children,
}) {
  return (
    <div className="inst-page">
      <header className={image ? "inst-intro inst-intro-photo" : "inst-intro"}>
        {image && <div className="inst-intro-media" aria-hidden="true"><img src={image} alt="" /></div>}
        <div className="inst-wrap inst-intro-body">
          <div className="inst-breadcrumb">
            <Link to={parentPath}>{parent}</Link>
            <ChevronRight size={13} aria-hidden="true"/>
            <span aria-current="page">{title}</span>
          </div>
          <h1>{title}</h1>
          <p>{summary}</p>
        </div>
      </header>
      <div className="inst-wrap inst-content">
        {children}
      </div>
    </div>
  );
}

export function ExternalLink({ href, children }) {
  return (
    <a className="inst-link" href={href} target="_blank" rel="noreferrer">
      {children}
      <ArrowUpRight size={14} />
    </a>
  );
}

export function GuideDetails({ title, items, ordered = false, open }) {
  if (!items?.length) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <details className="inst-details" open={open}>
      <summary>{title}</summary>
      <List>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </List>
    </details>
  );
}
