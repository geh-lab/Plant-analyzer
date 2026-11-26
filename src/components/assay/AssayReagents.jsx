import { ExternalLink } from "lucide-react";
import "./assayReagents.css";

export function ReagentInventory({ reagents, en }) {
  if (!reagents?.length) return null;
  return <section className="method-block method-inventory" aria-labelledby="method-inventory-heading">
    <h3 id="method-inventory-heading">{en ? "Required reagents" : "필요 시약"}</h3>
    <ul>{reagents.map(reagent => <li key={reagent}>{reagent}</li>)}</ul>
  </section>;
}

export function ReagentPreparation({ guide, en }) {
  if (!guide?.recipes?.length) return null;
  return <section className="method-block method-preparation" aria-labelledby="method-preparation-heading">
    <h3 id="method-preparation-heading">{en ? "Reagent preparation" : "시약 조제 방법"}</h3>
    <dl className="method-recipes">
      {guide.recipes.map(({ name, prep }) => <div key={name}><dt>{name}</dt><dd>{prep}</dd></div>)}
    </dl>
    {guide.sources?.length > 0 && <div className="method-reagent-sources" aria-label={en ? "Preparation sources" : "시약 조제 출처"}>
      {guide.sources.map(({ name, url }) => <a key={url} href={url} target="_blank" rel="noreferrer">{name}<ExternalLink size={12} aria-hidden="true"/></a>)}
    </div>}
  </section>;
}

export function ReagentStorage({ handling, en }) {
  if (!handling?.length) return null;
  return <section className="method-block method-storage" aria-labelledby="method-storage-heading">
    <h3 id="method-storage-heading">{en ? "Storage and handling" : "보관 및 취급"}</h3>
    <ul>{handling.map(note => <li key={note}>{note}</li>)}</ul>
  </section>;
}
