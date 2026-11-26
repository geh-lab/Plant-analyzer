import { forwardRef } from "react";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import "./studio-select.css";

// Radix reserves "" for its placeholder. Prefix every option to also accept a
// real empty-string filter and arbitrary labels from imported sample tables.
const radixValue = (value) => `v:${value}`;

function Option({ option }) {
  return (
    <Select.Item
      className="studio-select-option"
      value={radixValue(option.value)}
      textValue={typeof option.label === "string" ? option.label : undefined}
      disabled={option.disabled}
    >
      <Select.ItemText>{option.label}</Select.ItemText>
      <Select.ItemIndicator className="studio-select-check"><Check aria-hidden="true" size={16}/></Select.ItemIndicator>
    </Select.Item>
  );
}

export const StudioSelect = forwardRef(function StudioSelect(
  { value, onValueChange, options, placeholder, disabled, name, className = "", ...triggerProps },
  ref,
) {
  const groups = new Map();
  for (const option of options) {
    const group = option.group ?? "";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(option);
  }
  const hasSelection = options.some(option => option.value === value);
  return (
    <>
      {name && <input name={name} type="hidden" value={value ?? ""} disabled={disabled}/>}
      <Select.Root
        value={hasSelection ? radixValue(value) : ""}
        onValueChange={encoded => onValueChange(encoded.slice(2))}
        disabled={disabled}
      >
        <Select.Trigger
          ref={ref} className={`studio-select-trigger ${className}`.trim()}
          {...triggerProps}
        >
          <span className="studio-select-value"><Select.Value placeholder={placeholder}/></span>
          <Select.Icon asChild><ChevronDown aria-hidden="true" className="studio-select-chevron" size={16}/></Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="studio-select-popup" position="popper" align="start" sideOffset={5} collisionPadding={10}>
            <Select.ScrollUpButton className="studio-select-scroll"><ChevronUp aria-hidden="true" size={15}/></Select.ScrollUpButton>
            <Select.Viewport className="studio-select-viewport">
              {Array.from(groups, ([group, items]) => {
                const choices = items.map(option => <Option key={option.value} option={option}/>);
                return group ? (
                  <Select.Group key={group}>
                    <Select.Label className="studio-select-group">{group}</Select.Label>
                    {choices}
                  </Select.Group>
                ) : choices;
              })}
            </Select.Viewport>
            <Select.ScrollDownButton className="studio-select-scroll"><ChevronDown aria-hidden="true" size={15}/></Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </>
  );
});

export default StudioSelect;
