// name, count
export interface CardEntry {
  name: string
  quantity?: number
  // Set code
  set?: string
  // Collector number
  cn?: string
}

export function serializeEntry(card: CardEntry) {
  const quant = card.quantity !== undefined ? `${card.quantity}${card.name.length > 0?" ":""}` : '';
  const set = card.set !== undefined ? ` (${card.set})` : "";
  const cn = card.cn !== undefined ?` ${card.cn}`:"";
  return `${quant}${card.name}${set}${cn}`;
}


export function parseEntry(input: string): CardEntry {
  const separator = " "
  const parts = input.split(separator)
  if (parts.length === 1) return { name: input }
  let quantity;
  if (!Number.isNaN(Number.parseInt(parts[0]))) {
    quantity = parts.shift();
  }

  const result: CardEntry = {
    name: parts.join(separator),
  }
  if (quantity !== undefined) result.quantity = quantity;
  return result
}