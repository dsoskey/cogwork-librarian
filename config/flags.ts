import { ObjectValues } from '../src/types'

export const FLAG_NAMES = {
  adminMode: 'adminMode',
  showDebugInfo: 'showDebugInfo',
  displayTypes: 'displayTypes',
  docsUpdate: 'docsUpdate'
} as const
export type Flag = ObjectValues<typeof FLAG_NAMES>