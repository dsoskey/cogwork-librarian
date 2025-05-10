import React, { useRef, useState } from 'react'
import { InputProps } from './input'
import { LoaderText, TRIANGLES } from './loaders'
import { _focusEntry } from '../hooks/useMultiInputEditor'
import "./autocomplete.css"

export interface AutocompleteProps extends InputProps {
  getCompletions: (change: string) => Promise<string[]>
  setValue: (change: string) => void
}

export const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(
  (props: AutocompleteProps, parentRef) => {
    const { getCompletions, onChange, setValue, onKeyDown, ...rest } = props;
    const optionContainer = useRef<HTMLDivElement>(null);
    const timeout = useRef<number>();
    const [completions, setCompletions] = useState<string[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const optionClass = "autocomplete-option";
    const focusEntry = _focusEntry(optionContainer, optionClass)
    return <div
      className="autocomplete-root"
      onFocus={() => {
        if (completions.length > 0) {
          setOpen(true);
        }
      }}
      onBlur={e => {
        if (!(e.relatedTarget && optionContainer.current?.contains(e.relatedTarget))) {
          setOpen(false);
        }
      }}
    >
      <input
        aria-autocomplete="list"
        role="combobox"
        aria-expanded={open}
        ref={parentRef}
        onChange={handleChange}
        onKeyDown={e => {
          if (e.key === "Escape") {
            setOpen(false);
          }
          onKeyDown?.(e);
        }}
        {...rest}
      />
      {open && <div
        ref={optionContainer}
        tabIndex={-1}
        className="autocomplete-option-container"
        role="listbox"
      >
        {completions.map((item, index) => <div
          className={optionClass}
          role="option"
          key={item}
          tabIndex={0}
          onKeyDown={e => {
            switch (e.key) {
              case "Enter":
                setValue(item);
                setCompletions([]);
                setOpen(false);
                break;
              case 'ArrowDown':
                if (index < completions.length) {
                  e.preventDefault()
                  focusEntry(index, false);
                }
                break;
              case 'ArrowUp':
                if (index > 0) {
                  e.preventDefault()
                  focusEntry(index, true);
                }
                break;
            }
          }}
          onClick={() => {
            setValue(item)
            setCompletions([]);
            setOpen(false);
          }}>{item}</div>)}
        {completions.length === 0 && !loading && <div>No options found.</div>}
        {loading && <LoaderText text='' frames={TRIANGLES} timeout={75} />}
      </div>}
    </div>;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      onChange(e);
      clearTimeout(timeout.current);
      if (e.target.value !== "") {
        setOpen(true);
        setLoading(true);
        // @ts-ignore TODO: get this referencing browser setTimeout
        timeout.current = setTimeout(async () => {
          const res = await getCompletions(e.target.value);
          setCompletions(res);
          setLoading(false);
        }, 100);
      } else {
        setCompletions([]);
        setOpen(false);
      }
    }
  }
)

