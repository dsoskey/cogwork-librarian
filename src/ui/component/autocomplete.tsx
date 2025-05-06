import React, { useRef, useState } from 'react'
import { Input, InputProps } from './input'
import "./autocomplete.css"
export interface AutocompleteProps extends InputProps {
  getCompletions: (change: string) => Promise<string[]>
  setValue: (change: string) => void
}

export const Autocomplete = React.forwardRef<HTMLDivElement>(
  (props: AutocompleteProps, parentRef) => {
    const { getCompletions, onChange, setValue, ...rest } = props;
    const timeout = useRef<number>();
    const [completions, setCompletions] = useState<string[]>([]);

    return <div
      className="autocomplete-root"
      onBlur={() => setCompletions([])}
    >
      <Input
        ref={parentRef}
        onChange={handleChange}
        {...rest}
      />
      {completions.length > 0 && <div className="autocomplete-option-container">
        {completions.map((item, i) => <div className="autocomplete-option" key={i} onClick={() => {
          setValue(item)
          setCompletions([]);
        }}>{item}</div>)}
      </div>}
    </div>;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      onChange(e);
      setCompletions([]);
      clearTimeout(timeout.current);
      if (e.target.value !== "") {
        timeout.current = setTimeout(async () => {
          const res = await getCompletions(e.target.value);
          setCompletions(res);
        }, 100);
      }
    }
  }
)

