import { useNavigate } from "react-router-dom";
import { ArrowUpRight, FlaskConical, Leaf, Waves } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { pageUrl, workspaces } from "@/data/workspaces";

import { getProtocols } from "@/data/absorbanceProtocols";
import { getHplcProtocol, getHplcProtocolEntries } from "@/data/hplcProtocols";

const koMethods = getProtocols("ko");
const enMethods = getProtocols("en");
const methodKeys = Object.keys(koMethods);
const hplcMethods = getHplcProtocolEntries("ko");
const aliases = { mda: "말론디알데하이드 malondialdehyde TBARS", total_phenol: "TPC", total_flavonoid: "TFC" };

export default function WorkspaceSearch({ english, open, onOpenChange, triggerRef }) {
  const navigate = useNavigate();
  const lang = Number(english);
  const title = english ? "Find an analysis" : "분석 도구 검색";
  function select(path) {
    onOpenChange(false);
    navigate(path);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="studio-palette" onCloseAutoFocus={event => { event.preventDefault(); triggerRef.current?.focus(); }}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="sr-only">{english ? "Search by method, instrument or wavelength." : "분석법, 장비 또는 파장으로 검색하세요."}</DialogDescription>
        <Command label={title} loop>
          <CommandInput aria-label={title} placeholder={english ? "Try chlorophyll, 470 nm, LI-6800…" : "엽록소, 470 nm, LI-6800 등으로 검색…"} />
          <CommandList>
            <CommandEmpty>{english ? "No matching methods." : "일치하는 분석법이 없습니다."}</CommandEmpty>
            <CommandGroup heading={english ? "Analysis tools" : "분석 도구"}>
              {workspaces.map(tool => (
                <CommandItem key={tool.id} value={[...tool.name, tool.english, tool.keywords].join(" ")} onSelect={() => select(pageUrl(tool.id, english))}>
                  {tool.family === "physiology" ? <Leaf/> : <FlaskConical/>}{tool.name[lang]}<ArrowUpRight className="ml-auto"/>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading={english ? "Absorbance methods" : "흡광도 분석법"}>
              {methodKeys.map(id => (
                <CommandItem key={id} value={[id, koMethods[id].title, enMethods[id].title, enMethods[id].subtitle, koMethods[id].wavelengths.join(" "), aliases[id]].join(" ")} onSelect={() => select(pageUrl("analysis", english) + "?selected=" + id)}>
                  <Waves/>{english ? enMethods[id].title : koMethods[id].title}<ArrowUpRight className="ml-auto"/>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading={english ? "HPLC methods" : "HPLC 분석법"}>
              {hplcMethods.map(method => {
                const translated = getHplcProtocol(method.key, "en");
                return <CommandItem key={method.key} value={[method.title, translated.title, method.compounds.join(" "), translated.compounds.join(" ")].join(" ")} onSelect={() => select(pageUrl("hplc", english) + "?selected=" + method.key)}>
                  <FlaskConical/>{english ? translated.title : method.title}<ArrowUpRight className="ml-auto"/>
                </CommandItem>;
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
