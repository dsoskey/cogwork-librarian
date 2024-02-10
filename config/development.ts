import { ClientConfig, Stage } from '.'

const config: ClientConfig = {
  stage: Stage.Dev,
  flags: {
    showDebugInfo: true,
    adminMode: true,
    displayTypes: false,
    docsUpdate: true,
  }
}

export default config
