import { ObjectValues } from '../src/types'

export const FLAG_NAMES = {
  adminMode: 'adminMode',
  showDebugInfo: 'showDebugInfo',
  displayTypes: 'displayTypes',
  edhrecOverlay: 'edhrecOverlay',
  proxyTest: 'proxyTest',
  searchSource: "searchSource",
  cubeCombos: 'cubeCombos',
} as const
export type Flag = ObjectValues<typeof FLAG_NAMES>