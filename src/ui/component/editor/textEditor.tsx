import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Language } from "../../../api/local/syntaxHighlighting";
import { MultiQueryActionBar } from "./multiQueryActionBar";
import "./textEditor.css";
import { RectangleIcon } from '../../icons/rectangle'
import { RectangleCloseIcon } from '../../icons/rectangleClose'
import { COPY_BUTTON_ICONS, CopyToClipboardButton } from '../copyToClipboardButton'
import { HoverCard } from '../hoverCard'
import { useHoverCard } from '../../hooks/useHoverCard';
import Prism from 'prismjs'

const MIN_TEXTAREA_HEIGHT = 16;

export const findQueryIndex = (
  value: string,
  cursorIndex: number,
): number => {

  // +1 includes character after the cursor
  const before = value.substring(0, cursorIndex + 1).split("\n");
  const valueByLine = value.split("\n");
  let index = before.length - 1;
  while (index > 0) {
    const currentLine = before[index].trim();
    const previousLine = before[index - 1].trim();

    if (currentLine.length > 0 && previousLine.length === 0) {
      if (!currentLine.startsWith("#")) {
        return index;
      } else {
        let forwardSearchIndex = index;
        while (forwardSearchIndex < valueByLine.length - 1) {
          const nextLine = valueByLine[forwardSearchIndex + 1].trim();
          if (nextLine.startsWith("#")) {
            forwardSearchIndex++;
          } else {
            return forwardSearchIndex + 1;
          }
        }
      }
    }
    index--;
  }
  // if we get to the front of the query and its a comment,
  // that means all lines before the cursor's line are comments.
  // return the cursor's line index
  if (valueByLine[index].startsWith("#")) {
    while(valueByLine[index].startsWith("#")) {
      index++
    }
    return index;
  }
  return 0;
};

export const getLineIndex = (
  value: string,
  index: number,
  lineBreak: string = "\n",
): number => {
  let result = 0;
  let searchIndex = 0;
  while (searchIndex !== -1 && searchIndex < index) {
    searchIndex = value.indexOf(lineBreak, searchIndex);
    if (searchIndex !== -1 && searchIndex < index) {
      result++;
      searchIndex++;
    }
  }

  return result;
};

export type GutterColumn = "line-numbers" | "multi-info" | "submit-button"

export interface TextEditorProps {
  setQueries: React.Dispatch<React.SetStateAction<string[]>>;
  // todo: queries should be value: string
  queries: string[];
  onSubmit?: (baseIndex: number, selectedIndex: number) => void;
  canSubmit?: boolean;
  placeholder?: string | undefined;
  language?: Language;
  lineHeight?: number;
  disabled?: boolean;
  settingsButton?: React.ReactNode;
  gutterColumns?: GutterColumn[];
  className?: string;
  enableLinkOverlay?: boolean;
  enableCopyButton?: boolean;
}
export const DEFAULT_GUTTER_COLUMNS: GutterColumn[] = ["line-numbers", "multi-info", "submit-button"];
export const TextEditor = ({
  queries,
  setQueries,
  onSubmit,
  canSubmit,
  placeholder,
  language,
  disabled,
  lineHeight = 1.25,
  className = "",
  gutterColumns = DEFAULT_GUTTER_COLUMNS,
  enableLinkOverlay = false,
  enableCopyButton = false,
  settingsButton,
}: TextEditorProps) => {
  const separator = "\n";
  const hasToolbar = enableLinkOverlay || enableCopyButton || settingsButton !== undefined;
  const toolbarHeight = hasToolbar ? 28:0;
  const value = queries.join(separator);
  const controller = useRef<HTMLTextAreaElement>(null);
  const faker = useRef<HTMLPreElement>(null);
  const linker = useRef<HTMLPreElement>(null);
  const [revealLinks, setRevealLinks] = useState<boolean>(false);
  const [separateLayers, setSeparateLayers] = useState<boolean>(false);

  const [hoverIndex, setHoverIndex] = useState<number>(-1);
  const { handleHover: handleHoverCard, hoverStyle } = useHoverCard();
  const hoveredLine = queries[hoverIndex];
  const hoverOverIndex = (e: React.MouseEvent, index: number) => {
    setHoverIndex(index);
    handleHoverCard(e);
  }

  const handleHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target.rows === undefined) return;

    const boundingBox = e.currentTarget.getBoundingClientRect();
    const lineheight =  parseInt(window.getComputedStyle(e.target).getPropertyValue("line-height"));
    const top = e.currentTarget.scrollTop;
    const editorHeight = e.target.rows * lineheight;
    const editorY = e.clientY - boundingBox.top;
    const relativeMouse = editorY + top - toolbarHeight
    const index = Math.floor(queries.length * relativeMouse / (editorHeight));
    hoverOverIndex(e, index);
  }

  const handleRootClick = () => {
    controller.current?.focus();
  }

  const handleMouseLeave = () => {
    setHoverIndex(-1)
  }

  const handleDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      const cursorIndex = controller.current?.selectionStart ?? 0;
      const cursorEnd = controller.current?.selectionEnd ?? 0;
      const lastIndex = value.lastIndexOf("\n");
      const onLastLine = lastIndex < cursorIndex || lastIndex < cursorEnd;
      if (onLastLine) {
        event.preventDefault();
      }
    }

    if (event.metaKey || event.ctrlKey) {
      if (event.shiftKey && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
        event.stopPropagation();
      }
      if (event.key === "Enter") {
        const cursorIndex = controller.current?.selectionStart ?? 0;
        const queryIndex = findQueryIndex(value, cursorIndex);
        if (canSubmit) {
          const selectedIndex = getLineIndex(value, cursorIndex);
          onSubmit?.(queryIndex, selectedIndex);
          controller.current?.blur()
        }
      }

      if (event.key === "\\") {
        setRevealLinks((prev) => !prev);
        if (revealLinks) {
          controller.current?.focus();
        } else {
          linker.current?.focus();
        }
      }

      if (event.shiftKey && ['"', "'"].includes(event.key)) {
        setSeparateLayers((prev) => !prev);
      }
    }
  };

  const onScroll = (event: any) => {
    faker.current!.scrollLeft = event.target.scrollLeft;
    faker.current!.scrollTop = event.target.scrollTop;
    if (linker.current) {
      linker.current.scrollLeft = event.target.scrollLeft;
      linker.current.scrollTop = event.target.scrollTop;
    }
  };

  const copyText = useCallback((mindex: number, maxdex: number) => {
    controller.current?.focus();
    controller.current?.setSelectionRange(mindex, maxdex);
  }, []);

  const syncLayerHeights = () => {
    // Shamelessly stolen from https://stackoverflow.com/a/65990608
    // Reset height - important to shrink on delete
    if (!controller.current) return
    controller.current!.style.height = "inherit";
    faker.current!.style.height = "inherit";
    if (linker.current) {
      linker.current!.style.height = "inherit";
    }
    // Set height

    const { height } = controller.current!.getBoundingClientRect();
    const scrollbarHeight = height ? height - controller.current!.clientHeight : 0;
    const newHeight0 = Math.max(
      MIN_TEXTAREA_HEIGHT,
      scrollbarHeight,
      controller.current!.scrollHeight
    ) + scrollbarHeight
    const newHeight = `${newHeight0}px`;
    const shouldScroll = Math.abs(newHeight0 - parseInt(controller.current!.style.height)) < 0.001;
    controller.current!.style.height = newHeight;
    faker.current!.style.height = newHeight;
    if (linker.current) {
      linker.current.style.height = newHeight;
    }

    if (shouldScroll) {
      onScroll({ target: controller.current });
    }

    if (revealLinks) {
      linker.current?.querySelectorAll('a').forEach(qs => {
        qs.tabIndex = 0;
      })
    } else {
      linker.current?.querySelectorAll('a').forEach(qs => {
        qs.tabIndex = -1;
      })
    }
  }
  React.useLayoutEffect(() => {
    syncLayerHeights();
    Prism.highlightAll()
  }, [value, lineHeight]);

  useEffect(() => {
    controller.current?.addEventListener("scroll", onScroll);
    linker.current?.addEventListener("scroll", onScroll);
    window.addEventListener("resize", syncLayerHeights);
    return () => {
      controller.current?.removeEventListener("scroll", onScroll);
      linker.current?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncLayerHeights);
    };
  }, [revealLinks]);
  return (
    <div
      className={`text-editor-root focusable ${separateLayers ? "separated" : ""}` + className}
      onKeyDown={handleDown}
      style={{
        "--editor-line-height": lineHeight.toString(),
        "--toolbar-height": toolbarHeight.toString() + "px",
      }}
      onClick={handleRootClick}
      onMouseMove={handleHover}
      onMouseLeave={handleMouseLeave}
    >
      {gutterColumns.length > 0 && <MultiQueryActionBar
        queries={queries}
        copyText={copyText}
        onSubmit={onSubmit}
        canSubmit={canSubmit}
        gutterColumns={gutterColumns}
        highlightedRow={hoverIndex}
        setHighlightedRow={hoverOverIndex}
      />}
      <div className="editor-controls">
        {enableLinkOverlay && <button
          className="overlay-toggle"
          title={
            revealLinks
              ? 'close overlay (ctrl/cmd + \\)'
              : 'open overlay (ctrl/cmd + \\)'
          }
          onClick={() => setRevealLinks((prev) => !prev)}
        >
          {revealLinks ? <RectangleCloseIcon /> : <RectangleIcon />}️
        </button>}
        {enableCopyButton && <CopyToClipboardButton
          copyText={queries.join("\n")}
          title="Copy to clipboard"
          buttonText={COPY_BUTTON_ICONS}
        />}
        {settingsButton}
      </div>


      <textarea
        disabled={disabled}
        ref={controller}
        className='controller coglib-prism-theme'
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        autoCorrect='none'
        autoCapitalize='off'
        translate='no'
        rows={queries.length || 1}
        onChange={(event) => {
          setQueries(event.target.value.split(separator));
        }}
      />
      {revealLinks && <pre
        ref={linker}
        tabIndex={-1}
        aria-hidden
        className={`language-${language ?? "none"}-links links show`}
      >
        <code className="match-braces">{value}</code>
      </pre>}
      <pre
        ref={faker}
        tabIndex={-1}
        aria-hidden
        className={`language-${language ?? "none"} display`}
      >
        <code className="match-braces">{value}</code>
      </pre>

      {hoveredLine && <HoverCard cardName={hoveredLine} hoverStyle={hoverStyle} />}
    </div>
  );
};
