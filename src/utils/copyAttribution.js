export const labHomepage = "https://geh-lab.vercel.app/";

const credits = [
  { label: "출처 · 충남대학교 시설환경원예학연구실 (GEH Lab) · Plant Analyzer", url: labHomepage },
  { label: "Source · GEH Lab, Chungnam National University · Plant Analyzer", url: labHomepage + "en/" },
];
const richTextElements = "a,b,blockquote,caption,code,dd,del,dl,dt,em,figcaption,h1,h2,h3,h4,h5,h6,i,li,mark,ol,p,pre,s,small,strong,sub,sup,table,tbody,td,th,thead,tr,u,ul";

function elementOf(node) {
  return node?.nodeType === 1 ? node : node?.parentElement;
}

function isEditable(node) {
  const element = elementOf(node);
  return element?.isContentEditable || Boolean(element?.closest("input, textarea, select"));
}

function selectionHtml(selection, root, credit) {
  const doc = root.ownerDocument;
  const wrapper = doc.createElement("div");
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    let fragment = range.cloneContents();
    // cloneContents omits shared ancestors, such as a selected row's table or
    // the <strong> surrounding a selection that starts and ends in one word.
    for (let ancestor = elementOf(range.commonAncestorContainer);
      ancestor && root.contains(ancestor) && ancestor !== root; ancestor = ancestor.parentElement) {
      if (!ancestor.matches(richTextElements)) continue;
      const copy = ancestor.cloneNode(false);
      copy.append(fragment);
      fragment = copy;
    }
    wrapper.append(fragment);
  }
  for (const node of wrapper.querySelectorAll("script, style, iframe, input, textarea, select, [hidden]")) node.remove();
  for (const node of wrapper.querySelectorAll("[id]")) node.removeAttribute("id");
  for (const link of wrapper.querySelectorAll("a[href]")) link.setAttribute("href", link.href);

  const source = doc.createElement("p");
  source.dataset.gehAttribution = "";
  const link = doc.createElement("a");
  link.href = credit.url;
  link.textContent = credit.url;
  source.append(credit.label, doc.createElement("br"), link);
  wrapper.append(source);
  return wrapper.innerHTML;
}

export function copyWithAttribution(event, english = false) {
  if (event.defaultPrevented || !event.clipboardData || isEditable(event.target)) return;
  const root = event.currentTarget;
  const selection = root.ownerDocument.getSelection();
  if (!selection?.rangeCount || selection.isCollapsed ||
      !root.contains(selection.anchorNode) || !root.contains(selection.focusNode) ||
      isEditable(selection.anchorNode) || isEditable(selection.focusNode)) return;

  const original = selection.toString();
  if (!original.trim()) return;
  const normalized = original.replace(/\s+/g, " ");
  if (credits.some(({ label, url }) => normalized.includes(label) && normalized.includes(url))) return;

  const credit = credits[Number(Boolean(english))];
  const html = selectionHtml(selection, root, credit);
  event.clipboardData.setData("text/plain", original + "\n\n" + credit.label + "\n" + credit.url);
  event.clipboardData.setData("text/html", html);
  event.preventDefault();
}
