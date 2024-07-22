import { ClientConfig, Stage } from '.'

const config: ClientConfig = {
  stage: Stage.Prod,
  flags: {
    showDebugInfo: false,
    adminMode: false,
    displayTypes: true,
    docsUpdate: false,
    edhrecOverlay: false,
    proxyTest: false,
    searchSource: false,
  }
}

export default config
