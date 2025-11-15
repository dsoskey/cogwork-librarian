export function bytesToString(base64: string) {
  const binString = atob(base64)
  return new TextDecoder().decode(Uint8Array.from(binString, (m) => m.codePointAt(0)))
}

export function stringToBytes(bytes: string): string {
  const binString = Array.from(new TextEncoder().encode(bytes), (byte) =>
    String.fromCodePoint(byte)
  ).join('')
  return btoa(binString)
}
