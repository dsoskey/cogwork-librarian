export function b64decode(toDecode: string) {
  const binString = atob(toDecode)
  return new TextDecoder().decode(Uint8Array.from(binString, (m) => m.codePointAt(0)))
}

export function b64encode(toEncode: string): string {
  const binString = Array.from(new TextEncoder().encode(toEncode), (byte) =>
    String.fromCodePoint(byte)
  ).join('')
  return btoa(binString)
}
