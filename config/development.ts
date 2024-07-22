import { ClientConfig, Stage } from '.'

const config: ClientConfig = {
  stage: Stage.Dev,
  flags: {
    showDebugInfo: true,
    adminMode: true,
    displayTypes: true,
    docsUpdate: true,
    edhrecOverlay: false,
    proxyTest: true,
    searchSource: false,
  }
}

export default config
