import { ClientConfig, Stage } from '.'

const config: ClientConfig = {
  stage: Stage.Prod,
  flags: {
    showDebugInfo: false,
    adminMode: false,
    displayTypes: true,
    edhrecOverlay: false,
    proxyTest: false,
    searchSource: false,
    cubeCombos: true,
  }
}

export default config
