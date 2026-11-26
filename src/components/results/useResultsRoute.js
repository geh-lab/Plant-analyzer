import { useSearchParams } from 'react-router-dom';

export function useResultsRoute(inputKey) {
  const [params, setParams] = useSearchParams();
  const type = params.get('analysis_type') || '';
  const tab = params.get('tab') === 'visualization' ? 'visualization' : inputKey;
  const setTab = key => setParams(prev => {
    const next = new URLSearchParams(prev);
    next.set('tab', key);
    return next;
  }, { replace: true, preventScrollReset: true });
  return { type, tab, setTab };
}

export function useChartExample(hasData) {
  const [params, setParams] = useSearchParams();
  const previewing = !hasData && params.get('example') === '1';
  function toggle() {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (previewing) next.delete('example');
      else next.set('example', '1');
      return next;
    }, { replace: true, preventScrollReset: true });
  }
  return { previewing, onPreview: hasData ? undefined : toggle };
}
