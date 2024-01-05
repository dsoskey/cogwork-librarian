


export async function importCubeArtisan(cubeId: string): Promise<string[]> {
  // const response = await fetch(`https://cubeartisan.net/cube/${cubeId}/cards/names`)
  const response = await fetch(`https://cubeartisan.net/cube/${cubeId}/export/plaintext`)
  const tree = await response.text()
  return tree.split("\n").filter(it => it.length)
}