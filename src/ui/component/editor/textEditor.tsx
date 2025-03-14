import React, { useEffect, useRef, useState } from "react";
import { Language, useHighlightPrism } from "../../../api/local/syntaxHighlighting";
import { MultiQueryActionBar } from "./multiQueryActionBar";
import "./textEditor.css";

const MIN_TEXTAREA_HEIGHT = 32;

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
  if (before[index].startsWith("#")) {
    return before.length - 1;
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

export interface QueryInputProps {
  setQueries: React.Dispatch<React.SetStateAction<string[]>>;
  queries: string[];
  onSubmit?: (baseIndex: number, selectedIndex: number) => void;
  canSubmit?: boolean;
  placeholder?: string | undefined;
  language?: Language;
  disabled?: boolean;
  showLineNumbers?: boolean;
}

export const TextEditor = ({
  queries,
  setQueries,
  onSubmit,
  canSubmit,
  placeholder,
  language,
  disabled,
  showLineNumbers,
}: QueryInputProps) => {
  const separator = "\n";
  const value = queries.join(separator);
  const controller = useRef<HTMLTextAreaElement>(null);
  const faker = useRef<HTMLPreElement>(null);
  const linker = useRef<HTMLPreElement>(null);
  const [revealLinks, setRevealLinks] = useState<boolean>(false);
  const [separateLayers, setSeparateLayers] = useState<boolean>(false);

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

      if (event.shiftKey && event.key === "'") {
        setSeparateLayers((prev) => !prev);
      }
    }
  };

  const onScroll = (event: any) => {
    faker.current!.scrollLeft = event.target.scrollLeft;
    faker.current!.scrollTop = event.target.scrollTop;
    linker.current!.scrollLeft = event.target.scrollLeft;
    linker.current!.scrollTop = event.target.scrollTop;
  };

  const copyText = (mindex: number, maxdex: number) => {
    controller.current?.focus();
    controller.current?.setSelectionRange(mindex, maxdex);
  };

  useHighlightPrism([value, language]);
  React.useLayoutEffect(() => {
    // Shamelessly stolen from https://stackoverflow.com/a/65990608
    // Reset height - important to shrink on delete
    controller.current!.style.height = "inherit";
    faker.current!.style.height = "inherit";
    linker.current!.style.height = "inherit";
    // Set height
    const newHeight = `${Math.max(
      controller.current?.scrollHeight ?? 0,
      MIN_TEXTAREA_HEIGHT,
    )}px`;
    controller.current!.style.height = newHeight;
    faker.current!.style.height = newHeight;
    linker.current!.style.height = newHeight;
    onScroll({ target: controller.current });
  }, [value]);

  useEffect(() => {
    controller.current?.addEventListener("scroll", onScroll);
    linker.current?.addEventListener("scroll", onScroll);
    return () => {
      controller.current?.removeEventListener("scroll", onScroll);
      linker.current?.removeEventListener("scroll", onScroll);
    };
  }, []);
  return (
    <div
      className={`query-editor ${separateLayers ? "separated" : ""}`}
      onKeyDown={handleDown}
    >
      <MultiQueryActionBar
        queries={queries}
        copyText={copyText}
        onSubmit={onSubmit}
        canSubmit={canSubmit}
        showSubmit
        showLineNumbers={showLineNumbers}
      />
      <button
        className="overlay-toggle"
        title={
          revealLinks
            ? "close overlay (ctrl/cmd + \\)"
            : "open overlay (ctrl/cmd + \\)"
        }
        onClick={() => setRevealLinks((prev) => !prev)}
      >
        {revealLinks ? "⊠" : "⧈"}️
      </button>

      <textarea
        disabled={disabled}
        ref={controller}
        className="controller coglib-prism-theme"
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        autoCorrect="none"
        autoCapitalize="off"
        translate="no"
        onChange={(event) => {
          setQueries(event.target.value.split(separator));
        }}
      />
      <pre
        ref={linker}
        tabIndex={-1}
        aria-hidden // Is this an accessibility issue with the links? also consider
        className={`language-${language ?? "none"} links ${
          revealLinks ? "show" : "hide"
        }`}
      >
        <code className="match-braces">{value}</code>
      </pre>
      <pre
        ref={faker}
        tabIndex={-1}
        aria-hidden
        className={`language-${language ?? "none"} display`}
      >
        <code className="match-braces">{value}</code>
      </pre>
    </div>
  );
};
