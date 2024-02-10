import { Flag } from './flags'

export type { Flag } from './flags';
export { FLAG_NAMES } from './flags';

export enum Stage {
  Dev = 'Dev',
  Prod = 'Prod',
}
export interface ClientConfig {
  stage: Stage
  flags: Record<Flag, boolean>
}
