import { ClientConfig, Stage } from '.'

const config: ClientConfig = {
  stage: Stage.Prod,
  flags: {
    showDebugInfo: false,
    adminMode: false,
    displayTypes: false,
    docsUpdate: false,
    edhrecOverlay: false,
    proxyTest: false,
  }
}

export default config
