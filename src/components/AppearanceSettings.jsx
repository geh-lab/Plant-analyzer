import { useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Minus, Monitor, Moon, Plus, Settings2, Sun, X } from "lucide-react";
import { applyDisplay, displayKey, readDisplay, scales } from "@/utils/appearance";
import "./appearance.css";
import "./dark-surfaces.css";

const modes = [
  { id: "system", Icon: Monitor, ko: "시스템", en: "System" },
  { id: "light", Icon: Sun, ko: "라이트", en: "Light" },
  { id: "dark", Icon: Moon, ko: "다크", en: "Dark" }
];

export default function AppearanceSettings({ english }) {
  const [prefs, setPrefs] = useState(readDisplay);
  const settings = useRef(prefs);
  const label = english ? "Display settings" : "화면 설정";
  const index = scales.indexOf(prefs.scale);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function syncSystem() { applyDisplay(settings.current); }
    function syncStorage(event) {
      if (event.key && event.key !== displayKey) return;
      settings.current = readDisplay();
      applyDisplay(settings.current);
      setPrefs(settings.current);
    }
    media.addEventListener("change", syncSystem);
    window.addEventListener("storage", syncStorage);
    return () => {
      media.removeEventListener("change", syncSystem);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  function update(partial) {
    const next = { ...settings.current, ...partial };
    settings.current = next;
    applyDisplay(next);
    setPrefs(next);
    try { localStorage.setItem(displayKey, JSON.stringify(next)); } catch { /* Session settings still apply. */ }
  }
  return <Popover.Root>
    <Popover.Trigger className="display-trigger" aria-label={label} title={label}><Settings2 size={18}/><span>{label}</span></Popover.Trigger>
    <Popover.Portal>
      <Popover.Content className="display-settings" align="end" sideOffset={8} collisionPadding={10} aria-label={label}>
        <div className="display-heading"><h2>{label}</h2><Popover.Close aria-label={english ? "Close settings" : "화면 설정 닫기"}><X size={16}/></Popover.Close></div>
        <fieldset><legend>{english ? "Appearance" : "화면 모드"}</legend>
          <div className="display-modes">{modes.map(({ id, Icon, ko, en }) =>
            <label key={id}><input type="radio" name="display-theme" value={id} checked={prefs.theme === id} onChange={() => update({ theme: id })}/>
              <span><Icon size={18}/>{english ? en : ko}</span></label>)}</div>
        </fieldset>
        <fieldset><legend>{english ? "Text size" : "글자 크기"}</legend>
          <div className="display-stepper">
            <button aria-label={english ? "Decrease text size" : "글자 축소"} disabled={index === 0} onClick={() => update({ scale: scales[index - 1] })}><Minus size={18}/></button>
            <output aria-live="polite">{prefs.scale}%</output>
            <button aria-label={english ? "Increase text size" : "글자 확대"} disabled={index === scales.length - 1} onClick={() => update({ scale: scales[index + 1] })}><Plus size={18}/></button>
          </div>
        </fieldset>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>;
}
