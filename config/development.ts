import { ClientConfig, Stage } from '.'

const config: ClientConfig = {
  stage: Stage.Dev,
  flags: {
    showDebugInfo: true,
    adminMode: true,
    displayTypes: true,
    edhrecOverlay: false,
    proxyTest: true,
    searchSource: false,
    cubeCombos: true,
  }
}

export default config
