import { ClientConfig, Stage } from '.'

const config: ClientConfig = {
  stage: Stage.Prod,
  flags: {
    showDebugInfo: false,
    adminMode: false,
    displayTypes: false,
    docsUpdate: false
  }
}

export default config
