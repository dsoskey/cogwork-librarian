// name, count
export interface CardEntry {
  name: string
  quantity?: number
  // Set code
  set?: string
  // Collector number
  cn?: string
  finish?: string
}

export function serializeEntry(card: CardEntry) {
  const quant = card.quantity !== undefined ? `${card.quantity}${card.name.length > 0?" ":""}` : '';
  const set = card.set !== undefined ? ` (${card.set})` : "";
  const cn = card.cn !== undefined ?` ${card.cn}`:"";
  return `${quant}${card.name}${set}${cn}`;
}


export function parseEntry(input: string): CardEntry {
  const separator = " "
  const setCodeRegex = /^\([^)(]+\)$/;
  const parts = input.trim().split(separator)
  if (parts.length === 1) return { name: input }
  let quantity: number;
  let set: string | undefined;
  let cn: string | undefined;
  let finish: string | undefined;
  if (!Number.isNaN(Number.parseInt(parts[0]))) {
    quantity = Number.parseInt(parts.shift());
  }

  if (parts.at(-1).toLowerCase() === '*f*') {
    finish = parts.pop();
  }

  if (parts.length >=3
    && setCodeRegex.test(parts.at(-2))
    && !setCodeRegex.test(parts.at(-1))) {
    cn = parts.pop();
    set = parts.pop().slice(1, -1);
  } else if (setCodeRegex.test(parts.at(-1))) {
    set = parts.pop().slice(1, -1);
  }
  const result: CardEntry = {
    name: parts.join(separator),
    cn, set, finish
  }
  if (quantity !== undefined) result.quantity = quantity;
  return result
}