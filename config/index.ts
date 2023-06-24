export enum Stage {
  Dev = 'Dev',
  Prod = 'Prod',
}
export interface ClientConfig {
  stage: Stage
}
