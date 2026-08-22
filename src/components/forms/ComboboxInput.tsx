import { forwardRef, type InputHTMLAttributes } from "react";
import { inputClass } from "./FormField";

interface ComboboxInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  /** Previously-used values offered as suggestions; the field still accepts free text. */
  options: string[];
}

/** A plain text input with a native suggestion dropdown (previously-used
 *  values) — pick one or type a new value, no separate "add new" step needed. */
export const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>(function ComboboxInput(
  { id, options, className, ...rest },
  ref
) {
  const listId = `${id}-options`;
  return (
    <>
      <input ref={ref} id={id} list={listId} className={className ?? inputClass} {...rest} />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </>
  );
});
