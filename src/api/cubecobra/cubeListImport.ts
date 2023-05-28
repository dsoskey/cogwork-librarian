

const URL_BASE = "https://cubecobra.com/cube/api/cubelist/"

export const importCube = async (cubeId: string): Promise<string[]> => {
  const response = await fetch(`${URL_BASE}${cubeId}`)
  const text = await response.text()
  return text.split("\n")
}