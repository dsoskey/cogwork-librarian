import { KeyboardEvent, MutableRefObject } from 'react'

function _focusEntry (container: MutableRefObject<HTMLElement>, className: string) {
  return (index: number, backwards?: boolean, selection?: number) => {
    const vector = backwards ? -1 : 1;
    const inputs = container.current.getElementsByClassName(className);
    const next = inputs.item(Math.min( Math.max(index + vector, 0), inputs.length - 1)) as HTMLInputElement;
    next.focus();
    if (selection !== undefined) {
      next.selectionStart = selection;
      next.selectionEnd = selection;
    }
  }
}

type FocusFunction = (index: number, backwards?: boolean, selection?: number) => void;
interface MultiInputEditorInput {
  container: MutableRefObject<HTMLElement>;
  className: string;
  numInputs: number;
  onEnter?: (focusEntry: FocusFunction, index: number, splitIndex: number) => void;
  onBackspace?: (focusEntry: FocusFunction, index: number) => void;
  onDelete?: (focusEntry: FocusFunction, index: number) => void;
}
export function useMultiInputEditor({
  container, className, numInputs,
  onEnter, onBackspace, onDelete,
}: MultiInputEditorInput) {
  const focusEntry = _focusEntry(container, className);
  return (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowLeft':
        if (event.currentTarget.selectionStart === 0) {
          event.preventDefault();
          focusEntry(index, true, -1);
        }
        break;
      case 'ArrowRight':
        if (event.currentTarget.selectionEnd >= event.currentTarget.value.length) {
          event.preventDefault();
          focusEntry(index, false, 0);
        }
        break;
      case 'ArrowDown':
        if (index < numInputs - 1) {
          event.preventDefault()
          focusEntry(index, false, event.currentTarget.selectionStart >= event.currentTarget.value.length ? -1 : event.currentTarget.selectionStart);
        }
        break;
      case 'ArrowUp':
        if (index > 0) {
          event.preventDefault()
          focusEntry(index, true, event.currentTarget.selectionStart >= event.currentTarget.value.length ? -1 : event.currentTarget.selectionStart);
        }

        break;
      case "Enter":
        if (onEnter && event.currentTarget.selectionStart === event.currentTarget.selectionEnd) {
          event.preventDefault()
          const splitIndex = event.currentTarget.selectionStart;
          onEnter(focusEntry, index, splitIndex);
        }
        break;
      case "Backspace":
        if (onBackspace && event.currentTarget.selectionStart === 0 && event.currentTarget.selectionEnd === 0 && index > 0) {
          event.preventDefault()
          onBackspace(focusEntry, index);
        }
        break;
      case "Delete": {
        const { selectionStart, selectionEnd, value } = event.currentTarget;
        if (onDelete && selectionStart === value.length && selectionEnd === value.length && index < numInputs - 1) {
          event.preventDefault();
          onDelete(focusEntry, index);
        }
        break;
      }
      default:
        console.log(event);
        break
    }
  };
}