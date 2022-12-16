export enum Stage {
  Dev = 'Dev',
  Prod = 'Prod',
}
export interface ReefClientConfig {
  stage: Stage;
  apiUrl: string;
}
