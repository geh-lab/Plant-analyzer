import { useState } from 'react';
import { Download, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getMeasurementFields } from '@/utils/analysisFields';
import { displayNumber as fmt, downloadCsv, numeric } from '@/utils/resultData';
import { absorbanceMetrics, effectiveSampleParams, resultIssue } from '@/utils/resultCalculations';

function reading(sample, field) {
  return [field.key, ...(field.aliases || [])].map(k => sample.absorbance_values?.[k]).find(v => numeric(v) !== null) ?? '';
}

function SampleEditor({ sample, fields, en, onSave, onClose }) {
  const [usePlate, setUsePlate] = useState(Boolean(sample.plate_import?.overrides));
  const [useCurrentCurve, setUseCurrentCurve] = useState(false);
  const [draft, setDraft] = useState(() => ({ ...sample, absorbance_values: Object.fromEntries(fields.map(f => [f.key, reading(sample, f)])) }));
  const text = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));
  function submit(event) {
    event.preventDefault();
    if (!draft.sample_name.trim() || !draft.treatment_name.trim()) return;
    const values = { ...sample.absorbance_values };
    for (const f of fields) {
      for (const k of [f.key, ...(f.aliases || [])]) delete values[k];
      const value = numeric(draft.absorbance_values[f.key]);
      if (value !== null) values[f.key] = value;
    }
    const source = sample.plate_import ? { ...sample.plate_import } : null;
    if (source && !usePlate) {
      delete source.overrides;
      delete source.curve;
      delete source.controlWells;
    }
    onSave({ ...(source && {plate_import:source}), ...(useCurrentCurve && {calibration_snapshot:null}), id: sample.id, sample_name: draft.sample_name.trim(), treatment_name: draft.treatment_name.trim(),
      replicate: draft.replicate, description: draft.description, weight: draft.weight, absorbance_values: values }, true);
    onClose();
  }
  return <Dialog open onOpenChange={open => !open && onClose()}><DialogContent className="ra-dialog">
    <DialogTitle>{en ? 'Edit sample' : '시료 수정'}</DialogTitle>
    <DialogDescription>{en ? 'Changes update the calculated result and chart.' : '저장하면 계산값과 비교 차트에 반영됩니다.'}</DialogDescription>
    <form onSubmit={submit} className="ra-form">
      {sample.plate_import && <div className="sample-origin">
        <strong>{en ? 'Workbook source' : '원본 엑셀'}</strong>
        <p>{sample.plate_import.file} · {sample.plate_import.sheet} · {sample.plate_import.well}</p>
        {sample.plate_import.channels?.map(ch=><span key={ch.field+ch.channel}>{ch.channel} · {ch.cell} · {ch.reading} AU</span>)}
        {sample.plate_import.fit && <p>{sample.plate_import.fit.startSeconds}–{sample.plate_import.fit.endSeconds} s · n={sample.plate_import.fit.n} · R² {fmt(sample.plate_import.fit.rSquared)}</p>}
        {sample.plate_import.overrides && <label><input type="checkbox" checked={usePlate} onChange={e=>setUsePlate(e.target.checked)}/>{en ? 'Use the imported plate’s calibration or controls' : '가져온 플레이트의 검량선 또는 대조값 사용'}</label>}
      </div>}
      {sample.calibration_snapshot && <div className="sample-origin">
        <strong>{en ? 'Saved calibration' : '저장된 검량선'}</strong>
        <p>{en ? 'This sample retains the settings it had before the latest Excel import.' : '이 시료에는 새 엑셀을 가져오기 전의 검량선 설정이 유지됩니다.'}</p>
        <label><input type="checkbox" checked={useCurrentCurve} onChange={e=>setUseCurrentCurve(e.target.checked)}/>
          {en ? 'Use the current workspace calibration for this sample' : '이 시료에 현재 계산 조건의 검량선 사용'}</label>
      </div>}
      {[[en ? 'Sample name' : '시료명', 'sample_name'], [en ? 'Treatment' : '처리구', 'treatment_name'], [en ? 'Replicate' : '반복', 'replicate'], [en ? 'Description' : '설명', 'description']].map(([label, key], i) =>
        <label key={key}>{label}<input required={i < 2} value={draft[key] ?? ''} onChange={e => text(key, e.target.value)}/></label>)}
      {fields.map(f => <label key={f.key}>{f.label}<input type="number" step="any" required={!f.optional} value={draft.absorbance_values[f.key]} onChange={e => text('absorbance_values', { ...draft.absorbance_values, [f.key]: e.target.value })}/></label>)}
      {sample.analysis_type === 'h2o2' && <label>{en ? 'Fresh weight (g)' : '생체중 (g)'}<input type="number" min="0.000000001" step="any" value={draft.weight ?? ''} onChange={e => text('weight', e.target.value)}/></label>}
      <div className="ra-actions"><button type="button" className="ra-action" onClick={onClose}>{en ? 'Cancel' : '취소'}</button><button type="submit" className="ra-action ra-primary">{en ? 'Save changes' : '수정 저장'}</button></div>
    </form>
  </DialogContent></Dialog>;
}

export default function SampleResults({ samples, selectedIds, onSelectionChange, onEdit, onRemoveMultiple, analysisType, lang = 'ko', params = {} }) {
  const en = lang === 'en';
  const [editing, setEditing] = useState(null);
  const fields = getMeasurementFields(analysisType, lang);
  const unit = samples[0]?.unit || '';
  const metrics = absorbanceMetrics(analysisType, unit, lang);
  const picked = samples.filter(s => selectedIds.has(s.id));
  const all = samples.length > 0 && picked.length === samples.length;
  const chosen = picked.length ? picked : samples;
  function toggle(id) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onSelectionChange(next);
  }
  function remove(ids) {
    const msg = en ? 'Delete ' + ids.length + ' sample(s) from this browser?' : '이 브라우저에서 시료 ' + ids.length + '개를 삭제할까요?';
    if (window.confirm(msg)) onRemoveMultiple(ids);
  }
  function exportRows() {
    const headers = ['Sample Name', 'Description', 'Treatment Name', 'Replicate', ...fields.map(f => f.key)];
    if (analysisType === 'h2o2') headers.push('Weight');
    if (analysisType === 'mda') headers.push('Path length (cm)');
    headers.push(...metrics.map(m => m[1] + ' (' + m[2] + ')'), 'QC', 'Calculation parameters');
    const hasSource = chosen.some(s=>s.plate_import);
    if (hasSource) headers.push('Source file','Worksheet','Well','Source measurements');
    const rows = chosen.map(s => {
      const row = [s.sample_name, s.description, s.treatment_name, s.replicate, ...fields.map(f => numeric(reading(s, f)))];
      if (analysisType === 'h2o2') row.push(numeric(s.weight));
      if (analysisType === 'mda') row.push(numeric(params.mda?.pathlength, 1));
      const output = row.concat(metrics.map(m => s[m[0]]), s.issue ? resultIssue(s.issue, lang) : 'OK', JSON.stringify(effectiveSampleParams(s,params)));
      if (hasSource) output.push(s.plate_import?.file,s.plate_import?.sheet,s.plate_import?.well,s.plate_import ? JSON.stringify(s.plate_import) : '');
      return output;
    });
    downloadCsv(analysisType + '-samples', [headers, ...rows]);
  }
  return <section className="ra-panel">
    <div className="ra-panel-head"><div><h2>{en ? 'Sample results' : '시료별 결과'}</h2><p>{picked.length ? (en ? 'Selected' : '선택') + ' ' + picked.length + ' / ' : ''}{samples.length}{en ? ' samples' : '개 시료'}</p></div>
      {samples.length > 0 && <div className="ra-actions">
        {picked.length > 0 && <button type="button" className="ra-action" onClick={() => remove(picked.map(s => s.id))}><Trash2 size={15}/>{en ? 'Delete selected' : '선택 삭제'}</button>}
        <button type="button" className="ra-action" onClick={exportRows}><Download size={15}/>{picked.length ? (en ? 'Selected CSV' : '선택 CSV') : (en ? 'Export CSV' : 'CSV 내보내기')}</button>
      </div>}
    </div>
    {!samples.length ? <div className="ra-empty"><p>{en ? 'Your sample results will appear here after entry or file import.' : '시료를 직접 입력하거나 엑셀 또는 CSV를 불러오면 결과가 표시됩니다.'}</p></div> : <div className="ra-scroll">
      <table><thead><tr>
        <th><input type="checkbox" aria-label={en ? 'Select all samples' : '전체 시료 선택'} ref={node => { if (node) node.indeterminate = picked.length > 0 && !all; }} checked={all} onChange={() => onSelectionChange(all ? new Set() : new Set(samples.map(s => s.id)))}/></th>
        <th>{en ? 'Sample' : '시료'}</th><th>{en ? 'Treatment' : '처리구'}</th>
        {fields.map(f => <th key={f.key}>{f.label}</th>)}
        {metrics.map(m => <th key={m[0]}>{m[1]} <small>({m[2]})</small></th>)}<th>{en ? 'Actions' : '관리'}</th>
      </tr></thead><tbody>{samples.map(s => <tr key={s.id}>
        <td><input type="checkbox" aria-label={(en ? 'Select ' : '선택 ') + s.sample_name} checked={selectedIds.has(s.id)} onChange={() => toggle(s.id)}/></td>
        <th scope="row">{s.sample_name}{s.plate_import && <small className="ra-block" title={s.plate_import.file}>{s.plate_import.plate} · {s.plate_import.well}</small>}{s.replicate && <small className="ra-block">{s.replicate}</small>}</th><td>{s.treatment_name || '—'}</td>
        {fields.map(f => <td key={f.key}>{fmt(reading(s, f))}</td>)}
        {metrics.map(([key], i) => <td key={key}>{fmt(s[key])}{i === 0 && s.issue && <small className="ra-block ra-warning-text">{resultIssue(s.issue, lang)}</small>}</td>)}
        <td><div className="ra-actions"><button className="ra-icon" type="button" aria-label={(en ? 'Edit ' : '수정 ') + s.sample_name} onClick={() => setEditing(s)}><Pencil size={15}/></button>
        <button className="ra-icon" type="button" aria-label={(en ? 'Delete ' : '삭제 ') + s.sample_name} onClick={() => remove([s.id])}><Trash2 size={15}/></button></div></td>
      </tr>)}</tbody></table>
    </div>}
    {editing && <SampleEditor sample={editing} fields={fields} en={en} onSave={onEdit} onClose={() => setEditing(null)}/>}
  </section>;
}
