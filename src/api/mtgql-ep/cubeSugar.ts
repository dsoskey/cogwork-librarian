
export function patchCubeQuery(cubeId: string, query: string) {
  return query
    .replaceAll(/\btag:/g, `cube:${cubeId}.`)
    .replaceAll(/\btag=/g, `cube=${cubeId}.`)
}