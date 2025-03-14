import { FilterKeyword } from "mtgql";

export const syntaxDocs: Record<FilterKeyword, string> = {
  "!": "/user-guide/query-syntax#name",
  // @ts-ignore
  "++": "/user-guide/query-syntax#printing-preference",
  "@@": "/user-guide/query-syntax#printing-preference",
  and: "/user-guide/query-syntax#and-&-or-operators",
  or: "/user-guide/query-syntax#and-&-or-operators",
  a: "/user-guide/query-syntax#flavor",
  art: "/user-guide/query-syntax#tags",
  artist: "/user-guide/query-syntax#flavor",
  arttag: "/user-guide/query-syntax#tags",
  atag: "/user-guide/query-syntax#tags",
  b: "/user-guide/query-syntax#sets",
  banned: "/user-guide/query-syntax#format-legality",
  block: "/user-guide/query-syntax#sets",
  border: "/user-guide/query-syntax#card-frame",
  c: "/user-guide/query-syntax#colors-and-color-identity",
  ci: "/user-guide/query-syntax#colors-and-color-identity",
  cmc: "/user-guide/query-syntax#mana",
  cn: "/user-guide/query-syntax#sets",
  color: "/user-guide/query-syntax#colors-and-color-identity",
  commander: "/user-guide/query-syntax#colors-and-color-identity",
  cube: "/user-guide/query-syntax#cube",
  list: "/user-guide/query-syntax#cube",
  date: "/user-guide/query-syntax#release-date",
  devotion: "/user-guide/query-syntax#mana",
  direction: "/user-guide/query-syntax#order-&-direction",
  e: "/user-guide/query-syntax#sets",
  edition: "/user-guide/query-syntax#sets",
  eur: "/user-guide/query-syntax#prices",
  f: "/user-guide/query-syntax#format-legality",
  flavor: "/user-guide/query-syntax#flavor",
  fo: "/user-guide/query-syntax#text-box",
  format: "/user-guide/query-syntax#format-legality",
  frame: "/user-guide/query-syntax#card-frame",
  ft: "/user-guide/query-syntax#flavor",
  function: "/user-guide/query-syntax#tags",
  game: "/user-guide/query-syntax#games",
  has: "/user-guide/query-syntax#is",
  id: "/user-guide/query-syntax#colors-and-color-identity",
  identity: "/user-guide/query-syntax#colors-and-color-identity",
  in: "/user-guide/query-syntax#sets",
  is: "/user-guide/query-syntax#is",
  kw: "/user-guide/query-syntax#text-box",
  keyword: "/user-guide/query-syntax#text-box",
  lang: "/user-guide/query-syntax#language",
  language: "/user-guide/query-syntax#language",
  layout: "/user-guide/query-syntax#card-frame",
  loy: "/user-guide/query-syntax#combat-box",
  loyalty: "/user-guide/query-syntax#combat-box",
  m: "/user-guide/query-syntax#mana",
  mana: "/user-guide/query-syntax#mana",
  manavalue: "/user-guide/query-syntax#mana",
  mv: "/user-guide/query-syntax#mana",
  name: "/user-guide/query-syntax#name",
  new: "/user-guide/query-syntax#new",
  not: "/user-guide/query-syntax#is",
  number: "/user-guide/query-syntax#sets",
  o: "/user-guide/query-syntax#text-box",
  oracle: "/user-guide/query-syntax#text-box",
  oracletag: "/user-guide/query-syntax#tags",
  order: "/user-guide/query-syntax#order-&-direction",
  otag: "/user-guide/query-syntax#tags",
  pow: "/user-guide/query-syntax#combat-box",
  power: "/user-guide/query-syntax#combat-box",
  powtou: "/user-guide/query-syntax#combat-box",
  prefer: "/user-guide/query-syntax#printing-preference",
  produces: "/user-guide/query-syntax#mana",
  prints: "/user-guide/query-syntax#reprints",
  paperprints: "/user-guide/query-syntax#reprints",
  pt: "/user-guide/query-syntax#combat-box",
  r: "/user-guide/query-syntax#rarity",
  rarity: "/user-guide/query-syntax#rarity",
  restricted: "/user-guide/query-syntax#format-legality",
  s: "/user-guide/query-syntax#sets",
  set: "/user-guide/query-syntax#sets",
  st: "/user-guide/query-syntax#sets",
  stamp: "/user-guide/query-syntax#card-frame",
  t: "/user-guide/query-syntax#types",
  text: "/user-guide/query-syntax#text-box",
  tix: "/user-guide/query-syntax#prices",
  tou: "/user-guide/query-syntax#combat-box",
  toughness: "/user-guide/query-syntax#combat-box",
  type: "/user-guide/query-syntax#types",
  unique: "/user-guide/query-syntax#printing-preference",
  usd: "/user-guide/query-syntax#prices",
  watermark: "/user-guide/query-syntax#flavor",
  wm: "/user-guide/query-syntax#flavor",
  year: "/user-guide/query-syntax#release-date",
  scryfallid: "/user-guide/query-syntax#ids",
  oracleid: "/user-guide/query-syntax#ids",
};

export const extensionDocs = {
  alias: "/user-guide/syntax-extension#@alias-&-@use",
  a: "/user-guide/syntax-extension#@alias-&-@use",
  defaultMode: "/user-guide/syntax-extension#@defaultmode",
  dm: "/user-guide/syntax-extension#@defaultmode",
  defaultWeight: "/user-guide/syntax-extension#@defaultweight",
  dw: "/user-guide/syntax-extension#@defaultweight",
  defaultDomain: "/user-guide/syntax-extension#@defaultdomain",
  dd: "/user-guide/syntax-extension#@defaultdomain",
  include: "/user-guide/syntax-extension#@include",
  i: "/user-guide/syntax-extension#@include",
  use: "/user-guide/syntax-extension#@alias-&-@use",
  venn: "/user-guide/syntax-extension#@venn-diagram-search",
};
