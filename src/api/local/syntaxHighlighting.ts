import React from "react";
import Prism, { Environment, Grammar } from "prismjs";
import "prismjs/components/prism-regex.js";
import { FILTER_KEYWORDS, OPERATORS } from "mtgql";
import { extensionDocs, syntaxDocs } from "./syntaxDocs";
import { Router as RemixRouter } from '@remix-run/router'
import { closeContextMenu, openContextMenu } from '../../ui/component/contextMenu/contextMenu'

export type Language =
  | "regex"
  | "mtgql"
  | 'mtgql-cube'
  | "mtgql-extended"
  | "mtgql-extended-multi"
  | "scryfall"
  | "scryfall-extended"
  | "scryfall-extended-multi";
const keywordRegex = Object.values(FILTER_KEYWORDS).join("|");

const operators = Object.values(OPERATORS).join("|");

const mtgqlRegex = {
  mtgqlCharSet: {
    pattern: /\\(spt|spp|smh|smp|smm|smr|sm|sc|ss)/,
    alias: "class-name",
  },
  ...Prism.languages.regex,
};

// Anything defined by mtgql itself goes here
export const mtgql: Grammar = {
  negation: {
    pattern: new RegExp(`-(${keywordRegex})(?=(${operators}))`, "i"),
    alias: "deleted",
    greedy: true,
  },
  quotedCube: {
    pattern: /(\b(?:cube|cubeo):|=)("[^"]*"|'[^']*')/,
    greedy: true,
    lookbehind: true,
    alias: "function",
  },
  quotedSet: {
    pattern: /(\b(?:set|s|edition|e):|=)("[^"]*"|'[^']*')/,
    greedy: true,
    lookbehind: true,
    alias: "function",
  },
  cubeString: {
    pattern: /(\b(?:cube|cubeo)[:=])[^\s#)(.]+(?=(\b|$))/i,
    lookbehind: true,
    alias: "string",
  },
  setString: {
    pattern: /(\b(?:set|s|edition|e)[:=])[^\s#]+(?=(\b|$))/i,
    lookbehind: true,
    alias: "string",
  },
  identity: {
    pattern: /(\s|^)\*(?=(\s|$))/,
    lookbehind: true,
  },
  keyword: {
    pattern: new RegExp(`(^|\\b)(${keywordRegex})(?=(${operators}))`, "i"),
  },
  use: {
    pattern: /(^|\s|)@(use|u):\w+(?=( |\)|\n|$))/,
    alias: "extension",
    lookbehind: true,
  },
  "unrecognized-keyword": {
    pattern: new RegExp(`(^|\\b)(\\w+)(?=(${operators}))`, "i"),
    alias: ["keyword", "important"],
  },
  operator: {
    pattern: new RegExp(`\\(|\\)|${operators}|(\\b(and|or)\\b)|\\+\\+|@@|\\.`, "i"),
  },
  manaCost: {
    pattern: /\{..?(\/.)?}/,
    alias: "string",
    inside: {
      white: {
        pattern: /w/i,
      },
      blue: {
        pattern: /u/i,
      },
      black: {
        pattern: /b/i,
      },
      red: {
        pattern: /r/i,
      },
      green: {
        pattern: /g/i,
      },
      generic: {
        pattern: /\d+|x|y|z|\{|}|\//,
      },
    },
  },
  regex: {
    pattern: /\/(\\\/|[^/])+\//,
    inside: mtgqlRegex,
    greedy: true,
  },
  "quoted-string": {
    pattern: /("[^"]*"|'[^']*')/,
    greedy: true,
    alias: "function",
  },
  "unbalanced-string": {
    pattern: /('.*"|".*')/,
    greedy: true,
    alias: ["function", "important"],
  },
  string: {
    pattern: new RegExp(`[^\\s#]+(?=(\\b|$))`),
  },
};

export const mtgqlCubePage = {
  ...mtgql,
  keyword: {
    pattern: new RegExp(`(^|\\b)(${keywordRegex}|tag)(?=(${operators}))`, "i"),
  },
}

// Anything built on top of mtgql goes here
export const mtgqlExtended: Grammar = {
  "invalid-comment": {
    pattern: /^#.+/,
    alias: ["keyword", "important"],
  },
  comment: {
    pattern: /\n\s*#.*/,
  },
  "sub-query": {
    pattern: /\n.*/,
    inside: mtgql,
    alias: ["sub-query"],
  },
  "base-query": {
    pattern: /.*/,
    inside: mtgql,
    alias: ["main-query"],
  },
};

const comment: Grammar = {
  url: {
    pattern:
      /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=+$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=+$,\w]+@)[A-Za-z0-9.\-]+)((?:\/[+~%\/.\w\-_]*)?\??(?:[\-+=&;%@.\w_]*)#?(?:[.!\/\\\w]*))?)/,
    alias: ["comment"],
  },
};

export const mtgqlExtendedMulti: Grammar = {
  comment: {
    pattern: /(\n|^)\s*#.*(?=\n|$)/,
    inside: comment,
    // greedy: true,
  },
  extension: {
    // pattern: /(\n|^)\s*#.*(?=\n|$)/,
    pattern: /@(include|i|defaultMode|dm|defaultWeight|dw|alias|a):\w+/,
  },
  dd: {
    pattern: /@(defaultDomain|dd)/,
    alias: "extension",
  },
  venn: {
    pattern: /@(venn|v)/,
    alias: ["extension"],
  },
  // 'base-query': {
  //   // pattern: /(?:^|\n\n+|(\n|^)\s*#.*(\n|$))(?!\s*#).*(\n|$)/,
  //   pattern: /(^|\n\n+)(?!\s*#).*(?=\n|$)/,
  //   inside: mtgql,
  //   alias: ['main-query'],
  //   // lookbehind: true,
  //   greedy: true,
  // },
  "sub-query": {
    pattern: /.*(\n|$)/,
    inside: mtgql,
    alias: ["sub-query"],
  },
};

export const linkWrap = (env: Environment) => {
  if (!env.language.endsWith("-links")) return;

  switch (env.type) {
    case "negation":
      env.tag = "a";
      if (!env.attributes) env.attributes = {};
      env.attributes.href = "https://scryfall.com/docs/syntax#negating";
      env.attributes.target = "_blank";
      env.attributes.rel = "noreferrer noopener";
      break;
    case "extension":
    case "use":
    case "dd":
    case "venn": {
      const filter = env.content.match(/^\s*@(\w+):?.*$/)[1];
      const href = extensionDocs[filter];
      if (href) {
        env.tag = "a";
        env.attributes.href = href;
        if (!href.startsWith("/")) {
          env.attributes.target = "_blank";
          env.attributes.rel = "noreferrer noopener";
        }
      }
      break;
    }
    case "keyword": {
      const href = syntaxDocs[env.content];
      if (href) {
        env.tag = "a";
        env.attributes.href = href;
        if (!href.startsWith("/")) {
          env.attributes.target = "_blank";
          env.attributes.rel = "noreferrer noopener";
        }
      }
      break;
    }
    case "cubeString":
      env.tag = "a";
      env.attributes.href = `/cube/${env.content}`;
      break;
    case "setString":
      env.tag = "a";
      // todo: fix link for comma-separated list
      env.attributes.href = `https://scryfall.com/search?q=set:"${env.content}"&unique=cards&as=grid&order=set`;
      env.attributes.target = "_blank";
      env.attributes.rel = "noreferrer noopener";
      break;
    case "quotedSet":
      env.tag = "a";
      env.attributes.href = `https://scryfall.com/search?q=set:${env.content}&unique=cards&as=grid&order=set`;
      env.attributes.target = "_blank";
      env.attributes.rel = "noreferrer noopener";
      break;
    case "operator":
      if (Object.keys(OPERATORS).includes(env.content)) return;
      if (env.content.includes("&lt;")) return;
      if (env.content.includes(")")) return;
      if (env.content.includes("(")) return;
      if (env.content === '.') return;
      env.tag = "a";
      env.attributes.href = syntaxDocs[env.content];
      env.attributes.target = "_blank";
      env.attributes.rel = "noreferrer noopener";
      break;
    case "url":
      env.tag = "a";
      env.attributes.href = env.content;
      env.attributes.target = "_blank";
      env.attributes.rel = "noreferrer noopener";
  }
};

export const hookReactDOM = (router: RemixRouter) => (env: Environment) => {
  if (!env.element) return;
  const element: Element = env.element
  const atags = element.getElementsByTagName("a");
  for (let i = 0; i < atags.length; i++) {
    const tag = atags.item(i);
    if (tag.href.startsWith(window.location.toString())) {
      tag.addEventListener("click", e => {
        e.preventDefault()
        router.navigate(tag.href.replace(window.location.toString(), "/"))
      }, {capture:true})
    }
  }
}

export const hookContextMenu = (setCubeContext: (id: string) => void) => (env: Environment) => {
  if (!env.element) return;
  const element: Element = env.element
  const atags = element.getElementsByTagName("a");
  for (let i = 0; i < atags.length; i++) {
    const tag = atags.item(i);
    if (tag.href.includes("/cube/")) {
      tag.addEventListener("click", () => closeContextMenu())
      tag.addEventListener("contextmenu", e => {
        const bounds = tag.getBoundingClientRect()
        e.preventDefault();
        openContextMenu(bounds.right + 2, bounds.top - 4.5);
        setCubeContext(tag.text)
      })
    }
  }
}

export const useHighlightPrism = (deps: any[]) => {
  React.useLayoutEffect(() => {
    Prism.highlightAll();
  }, deps);
};
